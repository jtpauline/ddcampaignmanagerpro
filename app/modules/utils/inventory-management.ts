import { Character, InventoryItem } from '../characters';

export interface InventoryRestrictions {
  [characterClass: string]: {
    maxItems: number;
    weightLimit: number;
    restrictedItems: string[];
  };
}

export class InventoryManagementSystem {
  /**
   * Inventory restrictions by character class
   */
  private static inventoryRestrictions: InventoryRestrictions = {
    'Wizard': {
      maxItems: 20,
      weightLimit: 40,
      restrictedItems: ['Heavy Armor', 'Martial Weapons']
    },
    'Fighter': {
      maxItems: 30,
      weightLimit: 100,
      restrictedItems: []
    },
    'Rogue': {
      maxItems: 25,
      weightLimit: 60,
      restrictedItems: ['Heavy Armor']
    }
  };

  /**
   * Add item to character's inventory
   * @param character Character adding item
   * @param item Item to add
   * @returns Inventory management result
   */
  static addItemToInventory(
    character: Character, 
    item: InventoryItem
  ): {
    success: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const restrictions = this.inventoryRestrictions[character.class];

    // Initialize inventory if not exists
    if (!character.inventory) {
      character.inventory = [];
    }

    // Check maximum item limit
    if (restrictions && character.inventory.length >= restrictions.maxItems) {
      errors.push('Inventory maximum item limit reached');
    }

    // Check weight limit
    const currentWeight = this.calculateCurrentInventoryWeight(character);
    if (restrictions && currentWeight + item.weight > restrictions.weightLimit) {
      errors.push('Inventory weight limit exceeded');
    }

    // Check restricted items
    if (restrictions && restrictions.restrictedItems.includes(item.type)) {
      errors.push(`${item.type} is restricted for this character class`);
    }

    // Add item if no errors
    if (errors.length === 0) {
      character.inventory.push(item);
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Remove item from inventory
   * @param character Character removing item
   * @param itemId Item ID to remove
   * @returns Removal result
   */
  static removeItemFromInventory(
    character: Character, 
    itemId: string
  ): {
    success: boolean;
    errors: string[];
  } {
    if (!character.inventory) {
      return { 
        success: false, 
        errors: ['No inventory found'] 
      };
    }

    const initialLength = character.inventory.length;
    character.inventory = character.inventory.filter(
      item => item.id !== itemId
    );

    return {
      success: character.inventory.length < initialLength,
      errors: character.inventory.length === initialLength 
        ? ['Item not found in inventory'] 
        : []
    };
  }

  /**
   * Calculate current inventory weight
   * @param character Character to calculate inventory weight for
   * @returns Total inventory weight
   */
  static calculateCurrentInventoryWeight(character: Character): number {
    return (character.inventory || []).reduce(
      (total, item) => total + (item.weight || 0), 
      0
    );
  }

  /**
   * Sort inventory by different criteria
   * @param character Character whose inventory to sort
   * @param sortBy Sorting criteria
   * @returns Sorted inventory
   */
  static sortInventory(
    character: Character, 
    sortBy: 'weight' | 'value' | 'type' = 'weight'
  ): InventoryItem[] {
    if (!character.inventory) return [];

    return [...character.inventory].sort((a, b) => {
      switch (sortBy) {
        case 'weight':
          return (a.weight || 0) - (b.weight || 0);
        case 'value':
          return (a.value || 0) - (b.value || 0);
        case 'type':
          return a.type.localeCompare(b.type);
      }
    });
  }

  /**
   * Perform inventory cleanup
   * @param character Character to clean inventory for
   * @returns Cleanup result
   */
  static cleanupInventory(character: Character): {
    removedItems: InventoryItem[];
    remainingItems: InventoryItem[];
  } {
    const initialInventory = character.inventory || [];
    
    // Remove items with zero or negative weight/value
    const cleanedInventory = initialInventory.filter(
      item => (item.weight || 0) > 0 && (item.value || 0) > 0
    );

    const removedItems = initialInventory.filter(
      item => !cleanedInventory.includes(item)
    );

    character.inventory = cleanedInventory;

    return {
      removedItems,
      remainingItems: cleanedInventory
    };
  }
}
