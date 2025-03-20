import { Character, CharacterClass, CharacterRace } from '../characters';
import { AbilityScoreUtils } from './ability-score-utils';
import { MulticlassSystem } from './multiclass-system';
import { CharacterArchetypeSystem } from './character-archetype-system';
import { AlignmentSystem } from './alignment-system';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class CharacterValidationSystem {
  /**
   * Comprehensive character validation with enhanced error reporting
   * @param character Character to validate
   * @returns Detailed validation result
   */
  static validateCharacter(character: Character): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validation pipeline
    this.validateBasicInfo(character, result);
    this.validateAbilityScores(character, result);
    this.validateClassRequirements(character, result);
    this.validateMulticlassing(character, result);
    this.validateArchetype(character, result);
    this.validateAlignment(character, result);
    this.validateSkills(character, result);
    this.validateInventory(character, result);
    this.validateBackstory(character, result);

    // Determine overall validation status
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Enhanced basic information validation
   */
  private static validateBasicInfo(character: Character, result: ValidationResult): void {
    // Name validation with more nuanced checks
    if (!character.name || character.name.trim().length < 2) {
      result.errors.push('Character name must be at least 2 characters long');
    }
    if (character.name && character.name.length > 50) {
      result.warnings.push('Character name is unusually long');
    }

    // Comprehensive race and class validation
    const validRaces: CharacterRace[] = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome'];
    const validClasses: CharacterClass[] = [
      'Fighter', 'Wizard', 'Rogue', 'Cleric', 
      'Barbarian', 'Ranger', 'Paladin', 'Druid', 
      'Monk', 'Warlock'
    ];

    if (!validRaces.includes(character.race)) {
      result.errors.push(`Invalid race. Must be one of: ${validRaces.join(', ')}`);
    }
    if (!validClasses.includes(character.class)) {
      result.errors.push(`Invalid class. Must be one of: ${validClasses.join(', ')}`);
    }

    // Level validation with more granular checks
    if (character.level < 1) {
      result.errors.push('Character level must be at least 1');
    }
    if (character.level > 20) {
      result.errors.push('Character level cannot exceed 20');
    }
    if (character.level > 10) {
      result.warnings.push('High-level character detected');
    }
  }

  /**
   * Advanced ability score validation
   */
  private static validateAbilityScores(character: Character, result: ValidationResult): void {
    // Comprehensive ability score validation
    const minScore = 3;
    const maxScore = 20;

    Object.entries(character.abilityScores).forEach(([ability, score]) => {
      if (score < minScore || score > maxScore) {
        result.errors.push(`${ability.charAt(0).toUpperCase() + ability.slice(1)} score must be between ${minScore} and ${maxScore}`);
      }
    });

    // Advanced racial ability score restrictions
    const racialAbilityRestrictions = {
      'Human': { 
        minTotalScore: 60, 
        maxTotalScore: 80,
        balancedScores: true
      },
      'Elf': { 
        minDexterity: 12,
        maxIntelligence: 18
      },
      'Dwarf': {
        minConstitution: 12,
        maxStrength: 18
      }
    };

    const raceRestrictions = racialAbilityRestrictions[character.race];
    if (raceRestrictions) {
      const totalScore = Object.values(character.abilityScores).reduce((a, b) => a + b, 0);

      if (raceRestrictions.minTotalScore && totalScore < raceRestrictions.minTotalScore) {
        result.warnings.push(`Total ability scores are low for ${character.race}`);
      }

      if (raceRestrictions.maxTotalScore && totalScore > raceRestrictions.maxTotalScore) {
        result.warnings.push(`Total ability scores are high for ${character.race}`);
      }

      // Specific ability score checks
      if (raceRestrictions.minDexterity && character.abilityScores.dexterity < raceRestrictions.minDexterity) {
        result.errors.push(`Dexterity must be at least ${raceRestrictions.minDexterity} for ${character.race}`);
      }
    }
  }

  /**
   * Comprehensive class requirement validation
   */
  private static validateClassRequirements(character: Character, result: ValidationResult): void {
    const classRequirements = {
      'Fighter': {
        minStrength: 13,
        minConstitution: 12
      },
      'Wizard': {
        minIntelligence: 14,
        minDexterity: 10
      },
      'Rogue': {
        minDexterity: 13,
        minIntelligence: 10
      },
      'Cleric': {
        minWisdom: 13,
        minConstitution: 10
      }
    };

    const requirements = classRequirements[character.class];
    if (requirements) {
      Object.entries(requirements).forEach(([ability, minScore]) => {
        const abilityName = ability.replace('min', '').toLowerCase();
        if (character.abilityScores[abilityName] < minScore) {
          result.errors.push(`${abilityName.charAt(0).toUpperCase() + abilityName.slice(1)} must be at least ${minScore} for ${character.class}`);
        }
      });
    }
  }

  /**
   * Advanced multiclassing validation
   */
  private static validateMulticlassing(character: Character, result: ValidationResult): void {
    if (character.multiclass && character.multiclass.length > 0) {
      character.multiclass.forEach(multiclass => {
        const multiclassValidation = MulticlassSystem.validateMulticlassing(character, multiclass.class);
        
        if (!multiclassValidation.isValid) {
          result.errors.push(...multiclassValidation.errors);
        }
      });

      // Total level check with more nuanced reporting
      const totalLevel = (character.multiclass?.reduce((sum, mc) => sum + mc.level, 0) || 0) + character.level;
      if (totalLevel > 20) {
        result.errors.push('Total character levels cannot exceed 20');
      }
      if (totalLevel > 15) {
        result.warnings.push('High total character levels detected');
      }
    }
  }

  /**
   * Archetype validation with more detailed checks
   */
  private static validateArchetype(character: Character, result: ValidationResult): void {
    if (character.archetypeFeatures) {
      const archetypeValidation = CharacterArchetypeSystem.validateArchetypeSelection(
        character, 
        character.archetypeFeatures[0]
      );

      if (!archetypeValidation.isValid) {
        result.errors.push(...archetypeValidation.errors);
      }
    } else {
      result.warnings.push(`No archetype selected for ${character.class}`);
    }
  }

  /**
   * Enhanced alignment validation
   */
  private static validateAlignment(character: Character, result: ValidationResult): void {
    if (character.alignment) {
      const validAlignments = [
        'Lawful Good', 'Neutral Good', 'Chaotic Good',
        'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
        'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
      ];

      const alignmentName = Object.entries(AlignmentSystem['alignmentDefinitions'])
        .find(([, def]) => 
          def.moral === character.alignment.moral && 
          def.ethical === character.alignment.ethical
        )?.[0];

      if (!alignmentName || !validAlignments.includes(alignmentName)) {
        result.errors.push('Invalid character alignment');
      }
    } else {
      result.warnings.push('No alignment specified');
    }
  }

  /**
   * Advanced skills validation
   */
  private static validateSkills(character: Character, result: ValidationResult): void {
    if (character.skills) {
      Object.entries(character.skills).forEach(([skill, level]) => {
        if (level < 0 || level > 20) {
          result.errors.push(`Skill ${skill} level must be between 0 and 20`);
        }
      });

      // Skill point limitation with more detailed tracking
      const maxSkillPoints = character.level * 2;
      const totalSkillPoints = Object.values(character.skills)
        .reduce((sum, level) => sum + level, 0);

      if (totalSkillPoints > maxSkillPoints) {
        result.errors.push(`Total skill points (${totalSkillPoints}) cannot exceed ${maxSkillPoints}`);
      }
      if (totalSkillPoints > maxSkillPoints * 0.8) {
        result.warnings.push('Skill points are near maximum allocation');
      }
    }
  }

  /**
   * Enhanced inventory validation
   */
  private static validateInventory(character: Character, result: ValidationResult): void {
    if (character.inventory) {
      // Weight limit validation with more nuanced reporting
      const maxCarryWeight = 15 * character.abilityScores.strength;
      const totalWeight = character.inventory.reduce((sum, item) => sum + (item.weight || 0), 0);

      if (totalWeight > maxCarryWeight) {
        result.errors.push(`Inventory weight (${totalWeight}) exceeds carrying capacity of ${maxCarryWeight}`);
      }
      if (totalWeight > maxCarryWeight * 0.8) {
        result.warnings.push('Inventory is near maximum carrying capacity');
      }

      // Unique item validation
      const uniqueItemIds = new Set();
      character.inventory.forEach(item => {
        if (uniqueItemIds.has(item.id)) {
          result.errors.push(`Duplicate item found: ${item.name}`);
        }
        uniqueItemIds.add(item.id);
      });
    }
  }

  /**
   * Backstory and traits validation
   */
  private static validateBackstory(character: Character, result: ValidationResult): void {
    if (character.backstory) {
      if (character.backstory.length > 1000) {
        result.warnings.push('Backstory is unusually long');
      }
    } else {
      result.warnings.push('No backstory provided');
    }

    // Trait validation
    const traits = character.traits || {};
    Object.entries(traits).forEach(([traitType, traitList]) => {
      if (traitList.length === 0) {
        result.warnings.push(`No ${traitType} traits specified`);
      }
      if (traitList.length > 3) {
        result.warnings.push(`Excessive number of ${traitType} traits`);
      }
    });
  }
}
