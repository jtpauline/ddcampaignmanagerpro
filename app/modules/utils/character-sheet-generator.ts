import { Character } from '../characters';
import { AbilityScoreUtils } from './ability-score-utils';
import { SpellSystem } from './spell-system';
import { InventoryManagement } from './inventory-management';
import { AlignmentSystem } from './alignment-system';
import { CharacterArchetypeSystem } from './character-archetype-system';

export interface CharacterSheet {
  basicInfo: {
    name: string;
    race: string;
    class: string;
    level: number;
    alignment: string;
    experience: number;
  };
  attributes: {
    abilityScores: Character['abilityScores'];
    abilityModifiers: Record<string, number>;
  };
  combat: {
    hitPoints: number;
    armorClass: number;
    initiative: number;
    attackBonus: number;
  };
  skills: Record<string, number>;
  spells?: {
    known: any[];
    slots: Record<string, number>;
  };
  inventory: {
    items: any[];
    totalWeight: number;
    carryCapacity: number;
  };
  features: {
    classFeatures: string[];
    archetypeFeatures: string[];
  };
}

export class CharacterSheetGenerator {
  /**
   * Generate a comprehensive character sheet
   * @param character Character to generate sheet for
   * @returns Detailed character sheet
   */
  static generateCharacterSheet(character: Character): CharacterSheet {
    return {
      basicInfo: this.generateBasicInfo(character),
      attributes: this.generateAttributes(character),
      combat: this.generateCombatStats(character),
      skills: character.skills || {},
      spells: this.generateSpellInfo(character),
      inventory: this.generateInventoryInfo(character),
      features: this.generateFeatures(character)
    };
  }

  /**
   * Generate basic character information
   * @param character Source character
   * @returns Basic info section
   */
  private static generateBasicInfo(character: Character) {
    return {
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level,
      alignment: this.getAlignmentName(character),
      experience: character.experience
    };
  }

  /**
   * Get alignment name
   * @param character Character with alignment
   * @returns Alignment name string
   */
  private static getAlignmentName(character: Character): string {
    if (!character.alignment) return 'Unaligned';
    
    const alignmentEntries = Object.entries(AlignmentSystem['alignmentDefinitions']);
    const alignmentName = alignmentEntries.find(([, def]) => 
      def.moral === character.alignment.moral && 
      def.ethical === character.alignment.ethical
    )?.[0];

    return alignmentName || 'Unaligned';
  }

  /**
   * Generate attributes section
   * @param character Source character
   * @returns Attributes section
   */
  private static generateAttributes(character: Character) {
    const abilityModifiers = Object.fromEntries(
      Object.entries(character.abilityScores).map(([ability, score]) => [
        ability, 
        AbilityScoreUtils.calculateAbilityModifier(score)
      ])
    );

    return {
      abilityScores: character.abilityScores,
      abilityModifiers
    };
  }

  /**
   * Generate combat statistics
   * @param character Source character
   * @returns Combat stats section
   */
  private static generateCombatStats(character: Character) {
    return {
      hitPoints: character.hitPoints,
      armorClass: InventoryManagement.calculateArmorClass(character),
      initiative: AbilityScoreUtils.calculateInitiative(character),
      attackBonus: this.calculateAttackBonus(character)
    };
  }

  /**
   * Calculate attack bonus
   * @param character Source character
   * @returns Attack bonus value
   */
  private static calculateAttackBonus(character: Character): number {
    const proficiencyBonus = Math.ceil(character.level / 4) + 1;
    const primaryAbilityModifier = this.getPrimaryAbilityModifier(character);
    
    return proficiencyBonus + primaryAbilityModifier;
  }

  /**
   * Get primary ability modifier for attack
   * @param character Source character
   * @returns Primary ability modifier
   */
  private static getPrimaryAbilityModifier(character: Character): number {
    const primaryAbilities = {
      'Fighter': 'strength',
      'Wizard': 'intelligence',
      'Rogue': 'dexterity',
      'Cleric': 'wisdom'
    };

    const primaryAbility = primaryAbilities[character.class] || 'strength';
    return AbilityScoreUtils.calculateAbilityModifier(
      character.abilityScores[primaryAbility]
    );
  }

  /**
   * Generate spell information
   * @param character Source character
   * @returns Spell information section
   */
  private static generateSpellInfo(character: Character) {
    if (!SpellSystem.isSpellcaster(character.class)) return undefined;

    return {
      known: character.spells || [],
      slots: SpellSystem.calculateSpellSlots(character)
    };
  }

  /**
   * Generate inventory information
   * @param character Source character
   * @returns Inventory section
   */
  private static generateInventoryInfo(character: Character) {
    const carryCapacity = 15 * character.abilityScores.strength;
    const totalWeight = character.inventory?.reduce(
      (sum, item) => sum + (item.weight || 0), 
      0
    ) || 0;

    return {
      items: character.inventory || [],
      totalWeight,
      carryCapacity
    };
  }

  /**
   * Generate character features
   * @param character Source character
   * @returns Features section
   */
  private static generateFeatures(character: Character) {
    // Get class features
    const classFeatures = this.getClassFeatures(character);

    // Get archetype features
    const archetypeFeatures = character.archetypeFeatures || 
      CharacterArchetypeSystem.getAvailableArchetypes(character);

    return {
      classFeatures,
      archetypeFeatures
    };
  }

  /**
   * Get class-specific features
   * @param character Source character
   * @returns List of class features
   */
  private static getClassFeatures(character: Character): string[] {
    const classFeaturesMap = {
      'Fighter': [
        'Second Wind', 
        'Action Surge', 
        'Fighting Style'
      ],
      'Wizard': [
        'Arcane Recovery', 
        'Spell Mastery', 
        'Spell Versatility'
      ],
      'Rogue': [
        'Sneak Attack', 
        'Cunning Action', 
        'Evasion'
      ]
    };

    return classFeaturesMap[character.class] || [];
  }
}
