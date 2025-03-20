import { Character } from '../characters';

export interface Archetype {
  name: string;
  description: string;
  bonusFeatures: string[];
  abilityScoreModifiers?: Partial<Character['abilityScores']>;
  skillBonuses?: Record<string, number>;
}

export class CharacterArchetypeSystem {
  /**
   * Comprehensive archetype definitions
   */
  private static archetypes: Record<string, Archetype> = {
    'Warrior': {
      name: 'Warrior',
      description: 'Specialized in combat and martial prowess',
      bonusFeatures: [
        'Extra Attack', 
        'Improved Critical Hit Range', 
        'Combat Maneuver Mastery'
      ],
      abilityScoreModifiers: {
        strength: 2,
        constitution: 1
      },
      skillBonuses: {
        'Athletics': 2,
        'Intimidation': 1
      }
    },
    'Arcane Scholar': {
      name: 'Arcane Scholar',
      description: 'Deeply versed in magical theory and practice',
      bonusFeatures: [
        'Spell Versatility', 
        'Arcane Recovery', 
        'Enhanced Spell Learning'
      ],
      abilityScoreModifiers: {
        intelligence: 2,
        wisdom: 1
      },
      skillBonuses: {
        'Arcana': 2,
        'History': 1
      }
    },
    'Shadow Operative': {
      name: 'Shadow Operative',
      description: 'Master of stealth and precision',
      bonusFeatures: [
        'Improved Sneak Attack', 
        'Enhanced Evasion', 
        'Skill Mastery'
      ],
      abilityScoreModifiers: {
        dexterity: 2,
        charisma: 1
      },
      skillBonuses: {
        'Stealth': 2,
        'Deception': 1
      }
    }
  };

  /**
   * Apply archetype to character
   * @param character Character to apply archetype to
   * @param archetypeName Name of the archetype
   * @returns Archetype application result
   */
  static applyArchetype(
    character: Character, 
    archetypeName: string
  ): {
    success: boolean;
    errors: string[];
    archetype?: Archetype;
  } {
    const archetype = this.archetypes[archetypeName];
    
    if (!archetype) {
      return {
        success: false,
        errors: ['Archetype not found']
      };
    }

    // Apply ability score modifiers
    if (archetype.abilityScoreModifiers) {
      Object.entries(archetype.abilityScoreModifiers).forEach(([ability, modifier]) => {
        character.abilityScores[ability] += modifier;
      });
    }

    // Apply skill bonuses
    if (archetype.skillBonuses) {
      character.skills = character.skills || {};
      Object.entries(archetype.skillBonuses).forEach(([skill, bonus]) => {
        character.skills[skill] = (character.skills[skill] || 0) + bonus;
      });
    }

    // Add bonus features
    character.archetypeFeatures = archetype.bonusFeatures;

    return {
      success: true,
      errors: [],
      archetype
    };
  }

  /**
   * Get available archetypes for a character
   * @param character Character to check archetypes for
   * @returns List of available archetypes
   */
  static getAvailableArchetypes(character: Character): string[] {
    // Example archetype availability rules
    const archetypeAvailability = {
      'Fighter': ['Warrior'],
      'Wizard': ['Arcane Scholar'],
      'Rogue': ['Shadow Operative']
    };

    return archetypeAvailability[character.class] || [];
  }

  /**
   * Validate archetype selection
   * @param character Character to validate archetype for
   * @param archetypeName Archetype to validate
   * @returns Validation result
   */
  static validateArchetypeSelection(
    character: Character, 
    archetypeName: string
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const availableArchetypes = this.getAvailableArchetypes(character);

    // Check if archetype is available for the character's class
    if (!availableArchetypes.includes(archetypeName)) {
      errors.push('Archetype not available for this character class');
    }

    // Additional validation rules can be added here
    // For example, level requirements, previous archetype restrictions, etc.

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
