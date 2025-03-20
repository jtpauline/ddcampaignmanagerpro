import { Character, Spell } from '../characters';

export interface SpellLearningRules {
  [characterClass: string]: {
    maxSpellsPerLevel: number;
    spellLearningLevels: number[];
    spellListByLevel: {
      [level: number]: Spell[];
    };
  };
}

export class SpellSystem {
  /**
   * Comprehensive spell learning rules
   */
  private static spellLearningRules: SpellLearningRules = {
    'Wizard': {
      maxSpellsPerLevel: 6,
      spellLearningLevels: [1, 2, 4, 8, 12, 16, 19],
      spellListByLevel: {
        1: [
          { name: 'Magic Missile', level: 1, school: 'Evocation' },
          { name: 'Shield', level: 1, school: 'Abjuration' },
          { name: 'Mage Armor', level: 1, school: 'Abjuration' }
        ],
        2: [
          { name: 'Misty Step', level: 2, school: 'Conjuration' },
          { name: 'Scorching Ray', level: 2, school: 'Evocation' }
        ]
      }
    },
    'Cleric': {
      maxSpellsPerLevel: 5,
      spellLearningLevels: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
      spellListByLevel: {
        1: [
          { name: 'Cure Wounds', level: 1, school: 'Healing' },
          { name: 'Bless', level: 1, school: 'Support' }
        ],
        2: [
          { name: 'Spiritual Weapon', level: 2, school: 'Evocation' }
        ]
      }
    }
  };

  /**
   * Get new spells for character's current level
   * @param character Character learning spells
   * @returns Array of new spells
   */
  static getNewSpellsForLevel(character: Character): Spell[] {
    const classRules = this.spellLearningRules[character.class];
    if (!classRules) return [];

    // Check if character can learn new spells at this level
    if (!classRules.spellLearningLevels.includes(character.level)) {
      return [];
    }

    // Determine available spell levels based on character level
    const availableSpellLevel = Math.floor(character.level / 2);
    const newSpells = classRules.spellListByLevel[availableSpellLevel] || [];

    // Limit number of new spells
    return newSpells.slice(0, classRules.maxSpellsPerLevel);
  }

  /**
   * Calculate spell slots for a character
   * @param character Character to calculate spell slots for
   * @returns Spell slot configuration
   */
  static calculateSpellSlots(character: Character): {
    cantrips: number;
    level1Slots: number;
    level2Slots: number;
    level3Slots?: number;
  } {
    const spellSlotProgression = {
      'Wizard': {
        1: { cantrips: 3, level1Slots: 2 },
        2: { cantrips: 3, level1Slots: 3 },
        3: { cantrips: 3, level1Slots: 4, level2Slots: 2 }
      },
      'Cleric': {
        1: { cantrips: 3, level1Slots: 2 },
        2: { cantrips: 3, level1Slots: 3 },
        3: { cantrips: 3, level1Slots: 4, level2Slots: 2 }
      }
    };

    return spellSlotProgression[character.class]?.[character.level] || {
      cantrips: 2,
      level1Slots: 2
    };
  }

  /**
   * Validate spell learning
   * @param character Character attempting to learn spell
   * @param spell Spell to learn
   * @returns Validation result
   */
  static validateSpellLearning(
    character: Character, 
    spell: Spell
  ): {
    canLearn: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const classRules = this.spellLearningRules[character.class];

    if (!classRules) {
      errors.push('Spell learning not supported for this class');
      return { canLearn: false, errors };
    }

    // Check current spell count
    if ((character.spells?.length || 0) >= classRules.maxSpellsPerLevel) {
      errors.push('Maximum spell limit reached');
    }

    // Check spell level compatibility
    const availableSpellLevel = Math.floor(character.level / 2);
    if (spell.level > availableSpellLevel) {
      errors.push('Spell level too high for current character level');
    }

    return {
      canLearn: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare spells for the day
   * @param character Character preparing spells
   * @returns Prepared spell list
   */
  static prepareDailySpells(character: Character): Spell[] {
    const wisdomModifier = Math.floor((character.abilityScores.wisdom - 10) / 2);
    const preparableSpells = Math.max(1, character.level / 2 + wisdomModifier);

    return (character.spells || [])
      .slice(0, preparableSpells)
      .map(spell => ({ ...spell, prepared: true }));
  }
}
