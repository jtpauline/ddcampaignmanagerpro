export interface EquipmentItem {
  id: string;
  name: string;
  type: 'Weapon' | 'Armor' | 'Accessory' | 'Consumable';
  subtype?: string;
  cost: number;
  weight: number;
  description: string;
}

export interface Weapon extends EquipmentItem {
  type: 'Weapon';
  damage: string;
  criticalRange: number;
  criticalMultiplier: number;
  weaponType: 'Melee' | 'Ranged';
  weaponClass: 'Simple' | 'Martial' | 'Exotic';
}

export interface Armor extends EquipmentItem {
  type: 'Armor';
  armorBonus: number;
  maxDexBonus: number;
  armorCheckPenalty: number;
  arcaneSpellFailureChance: number;
}

export class EquipmentSystem {
  /**
   * Comprehensive equipment database
   */
  private static equipmentDatabase: (Weapon | Armor)[] = [
    // Weapons
    {
      id: 'longsword',
      name: 'Longsword',
      type: 'Weapon',
      subtype: 'Martial Melee',
      cost: 15,
      weight: 4,
      damage: '1d8',
      criticalRange: 19,
      criticalMultiplier: 2,
      weaponType: 'Melee',
      weaponClass: 'Martial',
      description: 'A versatile and balanced martial melee weapon'
    },
    {
      id: 'shortbow',
      name: 'Shortbow',
      type: 'Weapon',
      subtype: 'Simple Ranged',
      cost: 30,
      weight: 2,
      damage: '1d6',
      criticalRange: 20,
      criticalMultiplier: 3,
      weaponType: 'Ranged',
      weaponClass: 'Simple',
      description: 'A lightweight ranged weapon suitable for various combat situations'
    },
    // Armor
    {
      id: 'chainmail',
      name: 'Chainmail',
      type: 'Armor',
      subtype: 'Heavy Armor',
      cost: 150,
      weight: 40,
      armorBonus: 5,
      maxDexBonus: 0,
      armorCheckPenalty: -5,
      arcaneSpellFailureChance: 30,
      description: 'Provides substantial protection at the cost of mobility'
    }
  ];

  /**
   * Find equipment by various criteria
   * @param criteria Search criteria
   * @returns Matching equipment
   */
  static findEquipment(criteria: Partial<EquipmentItem>): (Weapon | Armor)[] {
    return this.equipmentDatabase.filter(item => 
      Object.entries(criteria).every(([key, value]) => 
        item[key] === value
      )
    );
  }

  /**
   * Calculate weapon damage
   * @param weapon Weapon to calculate damage for
   * @param strengthScore Wielder's strength score
   * @returns Damage calculation details
   */
  static calculateWeaponDamage(
    weapon: Weapon, 
    strengthScore: number
  ): {
    baseDamage: string;
    strengthModifier: number;
    totalDamage: string;
  } {
    const strengthModifier = Math.floor((strengthScore - 10) / 2);
    
    return {
      baseDamage: weapon.damage,
      strengthModifier,
      totalDamage: `${weapon.damage}+${strengthModifier}`
    };
  }

  /**
   * Determine weapon proficiency
   * @param weapon Weapon to check
   * @param characterClass Character's class
   * @returns Proficiency details
   */
  static determineWeaponProficiency(
    weapon: Weapon, 
    characterClass: string
  ): {
    isProficient: boolean;
    penaltyIfUnproficient: number;
  } {
    const classProficiencies: { [className: string]: string[] } = {
      'Fighter': ['Martial Melee', 'Martial Ranged'],
      'Rogue': ['Simple Melee', 'Simple Ranged'],
      'Wizard': ['Simple Weapons']
    };

    const proficientWeapons = classProficiencies[characterClass] || [];
    const isProficient = proficientWeapons.includes(weapon.subtype);

    return {
      isProficient,
      penaltyIfUnproficient: isProficient ? 0 : -4
    };
  }

  /**
   * Generate random starting equipment
   * @param characterClass Character's class
   * @returns Starting equipment set
   */
  static generateStartingEquipment(characterClass: string): (Weapon | Armor)[] {
    const startingEquipment: { [className: string]: string[] } = {
      'Fighter': ['longsword', 'chainmail'],
      'Rogue': ['shortbow'],
      'Wizard': []
    };

    return (startingEquipment[characterClass] || [])
      .map(itemId => this.findEquipment({ id: itemId })[0])
      .filter(Boolean);
  }

  /**
   * Calculate total equipment weight
   * @param equipment List of equipment items
   * @returns Total weight
   */
  static calculateTotalWeight(equipment: EquipmentItem[]): number {
    return equipment.reduce((total, item) => total + item.weight, 0);
  }
}
