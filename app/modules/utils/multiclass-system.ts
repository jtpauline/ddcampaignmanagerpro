import { Character, CharacterClass } from '../characters';

export interface MulticlassRequirements {
  [targetClass: string]: {
    minimumScores: {
      [ability: string]: number;
    };
  };
}

export class MulticlassSystem {
  /**
   * Multiclass prerequisites for different classes
   */
  private static multiclassPrerequisites: MulticlassRequirements = {
    'Paladin': {
      minimumScores: {
        strength: 13,
        charisma: 13
      }
    },
    'Wizard': {
      minimumScores: {
        intelligence: 13
      }
    },
    'Rogue': {
      minimumScores: {
        dexterity: 13
      }
    },
    'Fighter': {
      minimumScores: {
        strength: 13,
        dexterity: 13
      }
    }
  };

  /**
   * Check if a character can multiclass into a specific class
   * @param character Current character
   * @param targetClass Class to multiclass into
   * @returns Boolean indicating multiclass eligibility
   */
  static canMulticlass(character: Character, targetClass: CharacterClass): boolean {
    // Cannot multiclass into the same class
    if (character.class === targetClass) return false;

    // Check multiclass prerequisites
    const prerequisites = this.multiclassPrerequisites[targetClass];
    if (!prerequisites) return true; // No specific prerequisites

    // Check ability score requirements
    return Object.entries(prerequisites.minimumScores).every(([ability, minScore]) => 
      character.abilityScores[ability] >= minScore
    );
  }

  /**
   * Calculate multiclass hit points
   * @param character Character multiclassing
   * @param newClass Class being added
   * @returns Hit points to add
   */
  static calculateMulticlassHitPoints(character: Character, newClass: CharacterClass): number {
    const hitDiceByClass = {
      'Barbarian': 12,
      'Fighter': 10,
      'Paladin': 10,
      'Ranger': 10,
      'Wizard': 6,
      'Rogue': 8,
      'Cleric': 8,
      'Druid': 8
    };

    const constitutionModifier = Math.floor(
      (character.abilityScores.constitution - 10) / 2
    );

    const baseHitDice = hitDiceByClass[newClass] || 8;
    return Math.max(1, Math.floor(baseHitDice / 2) + constitutionModifier);
  }

  /**
   * Perform multiclassing
   * @param character Current character
   * @param newClass Class to add
   * @returns Updated character with new class
   */
  static performMulticlass(character: Character, newClass: CharacterClass): Character {
    if (!this.canMulticlass(character, newClass)) {
      throw new Error(`Cannot multiclass into ${newClass}`);
    }

    // If no existing multiclass, convert to multiclass
    const updatedClasses = character.multiclass 
      ? [...character.multiclass, newClass]
      : [character.class, newClass];

    return {
      ...character,
      multiclass: updatedClasses,
      hitPoints: character.hitPoints + this.calculateMulticlassHitPoints(character, newClass),
      spells: this.updateMulticlassSpells(character, newClass)
    };
  }

  /**
   * Update spell list when multiclassing
   * @param character Character multiclassing
   * @param newClass Class being added
   * @returns Updated spell list
   */
  private static updateMulticlassSpells(character: Character, newClass: CharacterClass): any[] {
    // Basic spell addition logic
    const spellcasterClasses = ['Wizard', 'Cleric', 'Druid', 'Paladin', 'Ranger'];
    
    if (spellcasterClasses.includes(newClass)) {
      // Add initial spells for the new spellcasting class
      const newSpells = this.getInitialClassSpells(newClass);
      return [...(character.spells || []), ...newSpells];
    }

    return character.spells || [];
  }

  /**
   * Get initial spells for a class when multiclassing
   * @param characterClass Class to get spells for
   * @returns Initial spell list
   */
  private static getInitialClassSpells(characterClass: CharacterClass): any[] {
    const initialSpellsByClass = {
      'Wizard': [
        { name: 'Mage Hand', level: 0 },
        { name: 'Prestidigitation', level: 0 }
      ],
      'Cleric': [
        { name: 'Guidance', level: 0 },
        { name: 'Light', level: 0 }
      ]
      // Add more classes as needed
    };

    return initialSpellsByClass[characterClass] || [];
  }
}
