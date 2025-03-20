import { Character } from '../characters';
import { InventoryItem } from './inventory-management';

export interface MagicItem extends InventoryItem {
  magical: true;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
  attunement: boolean;
  magical_properties: {
    type: string;
    description: string;
    activation?: 'passive' | 'active' | 'on-use';
    charges?: number;
  }[];
}

export class MagicItemSystem {
  /**
   * Generate a random magic item
   * @param rarity Rarity of the magic item
   * @returns Generated magic item
   */
  static generateMagicItem(rarity: MagicItem['rarity']): MagicItem {
    const magicItemTemplates = {
      'Common': [
        {
          name: 'Candle of the Deep',
          weight: 0.1,
          value: 50,
          magical: true,
          rarity: 'Common',
          attunement: false,
          magical_properties: [{
            type: 'Light',
            description: 'Provides light underwater without being extinguished',
            activation: 'passive'
          }]
        }
      ],
      'Uncommon': [
        {
          name: 'Boots of Elvenkind',
          weight: 1,
          value: 250,
          magical: true,
          rarity: 'Uncommon',
          attunement: true,
          magical_properties: [{
            type: 'Stealth',
            description: 'Advantage on Stealth checks when moving',
            activation: 'passive'
          }]
        }
      ],
      'Rare': [
        {
          name: 'Flame Tongue Sword',
          weight: 3,
          value: 1000,
          magical: true,
          rarity: 'Rare',
          attunement: true,
          magical_properties: [{
            type: 'Weapon Enhancement',
            description: 'Adds 2d6 fire damage on hit',
            activation: 'active',
            charges: null
          }]
        }
      ]
    };

    const itemTemplates = magicItemTemplates[rarity] || [];
    return itemTemplates[Math.floor(Math.random() * itemTemplates.length)] as MagicItem;
  }

  /**
   * Validate magic item for character
   * @param character Character to validate magic item for
   * @param magicItem Magic item to validate
   * @returns Validation errors
   */
  static validateMagicItem(character: Character, magicItem: MagicItem): string[] {
    const errors: string[] = [];

    // Attunement validation
    if (magicItem.attunement) {
      const maxAttunedItems = 3;
      const currentAttunedItems = (character.inventory || [])
        .filter(item => 'magical' in item && (item as MagicItem).attunement) as MagicItem[];

      if (currentAttunedItems.length >= maxAttunedItems) {
        errors.push('Maximum attunement slots reached');
      }
    }

    // Rarity restrictions based on character level
    const rarityLevelRestrictions = {
      'Common': 1,
      'Uncommon': 5,
      'Rare': 10,
      'Very Rare': 15,
      'Legendary': 20
    };

    const requiredLevel = rarityLevelRestrictions[magicItem.rarity];
    if (character.level < requiredLevel) {
      errors.push(`Insufficient level to use ${magicItem.rarity} magic item`);
    }

    return errors;
  }

  /**
   * Apply magic item effects
   * @param character Character using magic item
   * @param magicItem Magic item to apply
   * @returns Modified character
   */
  static applyMagicItemEffects(character: Character, magicItem: MagicItem): Character {
    const modifiedCharacter = { ...character };

    magicItem.magical_properties.forEach(property => {
      switch (property.type) {
        case 'Stealth':
          modifiedCharacter.skills = modifiedCharacter.skills || {};
          modifiedCharacter.skills.stealth = 
            (modifiedCharacter.skills.stealth || 0) + 2;
          break;
        case 'Weapon Enhancement':
          // Logic for weapon enhancement
          break;
        // Add more magic item effect types
      }
    });

    return modifiedCharacter;
  }

  /**
   * Calculate magic item value
   * @param magicItem Magic item to value
   * @returns Estimated value
   */
  static calculateMagicItemValue(magicItem: MagicItem): number {
    const rarityMultipliers = {
      'Common': 50,
      'Uncommon': 250,
      'Rare': 1000,
      'Very Rare': 5000,
      'Legendary': 25000
    };

    let baseValue = rarityMultipliers[magicItem.rarity] || 0;

    // Additional value modifiers
    if (magicItem.attunement) {
      baseValue *= 1.5;
    }

    return baseValue;
  }

  /**
   * Generate magic item for character
   * @param character Character to generate magic item for
   * @param rarity Rarity of magic item
   * @returns Generated and validated magic item
   */
  static generateMagicItemForCharacter(
    character: Character, 
    rarity: MagicItem['rarity']
  ): MagicItem | null {
    const magicItem = this.generateMagicItem(rarity);
    const validationErrors = this.validateMagicItem(character, magicItem);

    if (validationErrors.length === 0) {
      return magicItem;
    }

    return null;
  }
}
