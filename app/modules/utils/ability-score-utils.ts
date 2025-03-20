import { Character } from '../characters';
import { DiceRoller } from './dice-roller';

export class AbilityScoreUtils {
  /**
   * Generate ability scores using different methods
   * @param method Generation method
   * @returns Generated ability scores
   */
  static generateAbilityScores(
    method: 'standard' | 'heroic' | 'elite' = 'standard'
  ): Character['abilityScores'] {
    switch (method) {
      case 'standard':
        return this.standardAbilityScoreGeneration();
      case 'heroic':
        return this.heroicAbilityScoreGeneration();
      case 'elite':
        return this.eliteAbilityScoreGeneration();
    }
  }

  /**
   * Standard ability score generation method
   * @returns Ability scores
   */
  private static standardAbilityScoreGeneration(): Character['abilityScores'] {
    return {
      strength: this.rollAbilityScore(),
      dexterity: this.rollAbilityScore(),
      constitution: this.rollAbilityScore(),
      intelligence: this.rollAbilityScore(),
      wisdom: this.rollAbilityScore(),
      charisma: this.rollAbilityScore()
    };
  }

  /**
   * Heroic ability score generation method
   * @returns Ability scores
   */
  private static heroicAbilityScoreGeneration(): Character['abilityScores'] {
    return {
      strength: this.rollAbilityScore(true),
      dexterity: this.rollAbilityScore(true),
      constitution: this.rollAbilityScore(true),
      intelligence: this.rollAbilityScore(true),
      wisdom: this.rollAbilityScore(true),
      charisma: this.rollAbilityScore(true)
    };
  }

  /**
   * Elite ability score generation method
   * @returns Ability scores
   */
  private static eliteAbilityScoreGeneration(): Character['abilityScores'] {
    return {
      strength: 16,
      dexterity: 16,
      constitution: 16,
      intelligence: 16,
      wisdom: 16,
      charisma: 16
    };
  }

  /**
   * Roll ability score using 4d6 drop lowest method
   * @param reroll Whether to reroll low scores
   * @returns Rolled ability score
   */
  private static rollAbilityScore(reroll: boolean = false): number {
    let score: number;
    do {
      // Roll 4d6, drop lowest die
      const rolls = [
        DiceRoller.rollD6(),
        DiceRoller.rollD6(),
        DiceRoller.rollD6(),
        DiceRoller.rollD6()
      ];
      
      // Remove lowest roll
      rolls.splice(rolls.indexOf(Math.min(...rolls)), 1);
      
      // Sum remaining rolls
      score = rolls.reduce((a, b) => a + b, 0);
    } while (reroll && score < 12);

    return score;
  }

  /**
   * Calculate ability score modifier
   * @param abilityScore Ability score
   * @returns Ability score modifier
   */
  static calculateModifier(abilityScore: number): number {
    return Math.floor((abilityScore - 10) / 2);
  }

  /**
   * Improve an ability score
   * @param character Character
   * @param abilityKey Ability to improve
   * @param amount Amount to improve
   * @returns Updated character
   */
  static improveAbilityScore(
    character: Character, 
    abilityKey: keyof Character['abilityScores'], 
    amount: number = 1
  ): Character {
    // Ensure ability score doesn't exceed 20
    character.abilityScores[abilityKey] = Math.min(
      character.abilityScores[abilityKey] + amount, 
      20
    );

    return character;
  }

  /**
   * Check if ability score improvement is possible
   * @param character Character
   * @param abilityKey Ability to check
   * @returns Whether improvement is possible
   */
  static canImproveAbilityScore(
    character: Character, 
    abilityKey: keyof Character['abilityScores']
  ): boolean {
    return character.abilityScores[abilityKey] < 20;
  }
}
