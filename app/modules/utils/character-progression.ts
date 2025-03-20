import { Character } from '../characters';
import { AbilityScoreUtils } from './ability-score-utils';
import { SkillSystem } from './skill-system';
import { SpellSystem } from './spell-system';
import { InventoryManagementSystem } from './inventory-management';

export interface LevelUpResult {
  character: Character;
  newFeatures: string[];
  abilityScoreImprovements?: string[];
  skillImprovements?: Record<string, number>;
  spellProgression?: {
    newSpells: number;
    newSpellSlots: Record<string, number>;
  };
}

export class CharacterProgressionSystem {
  /**
   * Advanced level up system with comprehensive progression tracking
   * @param character Character to level up
   * @returns Detailed level up result
   */
  static levelUpCharacter(character: Character): LevelUpResult {
    const result: LevelUpResult = {
      character: { ...character },
      newFeatures: [],
      skillImprovements: {},
      spellProgression: {
        newSpells: 0,
        newSpellSlots: {}
      }
    };

    // Increment level
    result.character.level++;

    // Hit Point Calculation
    result.character.hitPoints += this.calculateHitPointIncrease(result.character);

    // Ability Score Improvement
    if (result.character.level % 4 === 0) {
      result.abilityScoreImprovements = this.handleAbilityScoreImprovement(result.character);
    }

    // Skill Progression
    this.handleSkillProgression(result);

    // Spell Progression
    this.handleSpellProgression(result);

    // Class-specific Features
    this.addClassFeatures(result);

    // Experience Tracking
    result.character.experience = this.calculateExperience(result.character);

    return result;
  }

  /**
   * Calculate hit point increase based on character class and level
   * @param character Character to calculate hit points for
   * @returns Hit point increase
   */
  private static calculateHitPointIncrease(character: Character): number {
    const hitPointProgression = {
      'Fighter': 10,
      'Wizard': 6,
      'Rogue': 8,
      'Cleric': 8
    };

    const baseIncrease = hitPointProgression[character.class] || 6;
    const constitutionModifier = Math.floor((character.abilityScores.constitution - 10) / 2);

    return Math.max(1, baseIncrease + constitutionModifier);
  }

  /**
   * Handle ability score improvements
   * @param character Character receiving improvement
   * @returns List of improved abilities
   */
  private static handleAbilityScoreImprovement(character: Character): string[] {
    const improvements: string[] = [];
    const improvableAbilities = Object.keys(character.abilityScores)
      .filter(ability => AbilityScoreUtils.canImproveAbilityScore(
        character, 
        ability as keyof typeof character.abilityScores
      ));

    // Simple improvement strategy - could be expanded to offer choices
    if (improvableAbilities.length > 0) {
      improvableAbilities.forEach(ability => {
        AbilityScoreUtils.improveAbilityScore(
          character, 
          ability as keyof typeof character.abilityScores
        );
        improvements.push(ability);
      });
    }

    return improvements;
  }

  /**
   * Handle skill progression during level up
   * @param levelUpResult Level up result object
   */
  private static handleSkillProgression(levelUpResult: LevelUpResult): void {
    SkillSystem.improveSkillsOnLevelUp(levelUpResult.character);
    
    // Track skill improvements
    Object.entries(levelUpResult.character.skills || {}).forEach(([skill, level]) => {
      levelUpResult.skillImprovements![skill] = level;
    });
  }

  /**
   * Handle spell progression during level up
   * @param levelUpResult Level up result object
   */
  private static handleSpellProgression(levelUpResult: LevelUpResult): void {
    // Get new spells
    const newSpells = SpellSystem.getNewSpellsForLevel(levelUpResult.character);
    
    if (newSpells.length > 0) {
      levelUpResult.character.spells = [
        ...(levelUpResult.character.spells || []),
        ...newSpells
      ];
      
      levelUpResult.spellProgression!.newSpells = newSpells.length;
    }

    // Calculate new spell slots
    const newSpellSlots = SpellSystem.calculateSpellSlots(levelUpResult.character);
    levelUpResult.spellProgression!.newSpellSlots = newSpellSlots;
  }

  /**
   * Add class-specific features during level up
   * @param levelUpResult Level up result object
   */
  private static addClassFeatures(levelUpResult: LevelUpResult): void {
    const classFeatures = {
      'Fighter': {
        4: 'Extra Attack',
        8: 'Advanced Combat Maneuver',
        12: 'Improved Critical Hit'
      },
      'Wizard': {
        2: 'Arcane Recovery',
        6: 'Spell Mastery',
        10: 'Spell Versatility'
      },
      'Rogue': {
        3: 'Sneak Attack Improvement',
        7: 'Evasion',
        11: 'Reliable Talent'
      }
    };

    const characterFeatures = classFeatures[levelUpResult.character.class];
    if (characterFeatures) {
      const newFeature = characterFeatures[levelUpResult.character.level];
      if (newFeature) {
        levelUpResult.newFeatures.push(newFeature);
      }
    }
  }

  /**
   * Calculate experience points
   * @param character Character to calculate XP for
   * @returns Calculated experience points
   */
  private static calculateExperience(character: Character): number {
    // Exponential experience progression
    const baseXP = 300;
    const xpMultiplier = 1.5;
    
    return Math.floor(baseXP * Math.pow(xpMultiplier, character.level - 1));
  }

  /**
   * Multiclass progression system
   * @param character Character potentially multiclassing
   * @param newClass New class to add
   * @returns Multiclass progression result
   */
  static handleMulticlassing(
    character: Character, 
    newClass: string
  ): {
    success: boolean;
    errors: string[];
    character: Character;
  } {
    const errors: string[] = [];

    // Multiclassing prerequisites (example rules)
    const multiclassPrerequisites = {
      'Fighter': { minimumStrength: 13 },
      'Wizard': { minimumIntelligence: 13 },
      'Rogue': { minimumDexterity: 13 }
    };

    const prerequisites = multiclassPrerequisites[newClass];
    if (prerequisites) {
      Object.entries(prerequisites).forEach(([ability, value]) => {
        if (character.abilityScores[ability.replace('minimum', '').toLowerCase()] < value) {
          errors.push(`Insufficient ${ability.replace('minimum', '')} score for multiclassing`);
        }
      });
    }

    if (errors.length > 0) {
      return { success: false, errors, character };
    }

    // Add new class
    character.multiclass = character.multiclass || [];
    character.multiclass.push({
      class: newClass,
      level: 1
    });

    return { 
      success: true, 
      errors: [], 
      character 
    };
  }

  /**
   * Calculate total character level across all classes
   * @param character Character to calculate total level for
   * @returns Total character level
   */
  static calculateTotalLevel(character: Character): number {
    if (!character.multiclass) return character.level;

    return character.level + 
      character.multiclass.reduce((total, mc) => total + mc.level, 0);
  }
}
