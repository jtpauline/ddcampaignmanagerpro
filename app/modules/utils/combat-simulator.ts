import { Character } from '../characters';
import { AbilityScoreUtils } from './ability-score-utils';
import { DiceRoller } from './dice-roller';

export enum DamageType {
  BLUDGEONING = 'Bludgeoning',
  PIERCING = 'Piercing',
  SLASHING = 'Slashing',
  FIRE = 'Fire',
  COLD = 'Cold',
  LIGHTNING = 'Lightning',
  ACID = 'Acid',
  POISON = 'Poison',
  PSYCHIC = 'Psychic'
}

export interface CombatAction {
  type: 'attack' | 'spell' | 'special';
  name: string;
  attackBonus: number;
  damage: {
    diceCount: number;
    diceType: number;
    modifier: number;
    type: DamageType;
  };
}

export interface CombatResult {
  attacker: Character;
  defender: Character;
  attackRoll: number;
  damageDealt: number;
  isCriticalHit: boolean;
  isHit: boolean;
}

export class CombatSimulator {
  /**
   * Simulate a combat attack
   * @param attacker Attacking character
   * @param defender Defending character
   * @param action Combat action being performed
   * @returns Combat result
   */
  static simulateAttack(
    attacker: Character, 
    defender: Character, 
    action: CombatAction
  ): CombatResult {
    // Calculate attack roll
    const d20Roll = DiceRoller.rollD20();
    const attackBonus = this.calculateAttackBonus(attacker, action);
    const totalAttackRoll = d20Roll + attackBonus;

    // Determine hit
    const isCriticalHit = d20Roll === 20;
    const isHit = isCriticalHit || totalAttackRoll >= defender.armorClass;

    // Calculate damage
    let damageDealt = 0;
    if (isHit) {
      damageDealt = this.calculateDamage(action, isCriticalHit);
      defender.hitPoints -= damageDealt;
    }

    return {
      attacker,
      defender,
      attackRoll: totalAttackRoll,
      damageDealt,
      isCriticalHit,
      isHit
    };
  }

  /**
   * Calculate attack bonus for a combat action
   * @param character Attacking character
   * @param action Combat action
   * @returns Attack bonus
   */
  private static calculateAttackBonus(
    character: Character, 
    action: CombatAction
  ): number {
    // Base attack bonus based on character level and class
    const baseAttackBonus = Math.floor(character.level * 0.75);

    // Ability modifier based on action type
    const abilityModifier = this.getAbilityModifierForAction(character, action);

    return baseAttackBonus + abilityModifier + action.attackBonus;
  }

  /**
   * Get ability modifier for a combat action
   * @param character Character
   * @param action Combat action
   * @returns Ability modifier
   */
  private static getAbilityModifierForAction(
    character: Character, 
    action: CombatAction
  ): number {
    switch (action.type) {
      case 'attack':
        return AbilityScoreUtils.calculateModifier(
          character.abilityScores.strength
        );
      case 'spell':
        return AbilityScoreUtils.calculateModifier(
          character.abilityScores.intelligence
        );
      default:
        return 0;
    }
  }

  /**
   * Calculate damage for a combat action
   * @param action Combat action
   * @param isCriticalHit Whether it's a critical hit
   * @returns Damage dealt
   */
  private static calculateDamage(
    action: CombatAction, 
    isCriticalHit: boolean
  ): number {
    const { diceCount, diceType, modifier, type } = action.damage;
    
    // Roll damage dice
    let damage = 0;
    const diceRolls = isCriticalHit 
      ? diceCount * 2 
      : diceCount;

    for (let i = 0; i < diceRolls; i++) {
      damage += DiceRoller.rollDice(diceType);
    }

    // Add modifier
    damage += modifier;

    return damage;
  }

  /**
   * Simulate a full combat encounter
   * @param characters Characters in the encounter
   * @returns Combat encounter results
   */
  static simulateEncounter(
    characters: Character[]
  ): CombatResult[] {
    const combatResults: CombatResult[] = [];

    // Simple turn-based combat simulation
    for (let i = 0; i < characters.length; i++) {
      const attacker = characters[i];
      const defender = characters[(i + 1) % characters.length];

      // Create a basic attack action
      const basicAttackAction: CombatAction = {
        type: 'attack',
        name: 'Basic Attack',
        attackBonus: 2,
        damage: {
          diceCount: 1,
          diceType: 8,
          modifier: 2,
          type: DamageType.SLASHING
        }
      };

      const result = this.simulateAttack(attacker, defender, basicAttackAction);
      combatResults.push(result);

      // Stop if defender is defeated
      if (defender.hitPoints <= 0) {
        break;
      }
    }

    return combatResults;
  }

  /**
   * Calculate experience points for defeating an enemy
   * @param enemyCharacter Defeated enemy
   * @returns Experience points
   */
  static calculateDefeatExperience(
    enemyCharacter: Character
  ): number {
    return enemyCharacter.level * 100;
  }
}
