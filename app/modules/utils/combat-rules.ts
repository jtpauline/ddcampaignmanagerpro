export interface CombatAction {
  name: string;
  type: 'attack' | 'defense' | 'special';
  description: string;
}

export interface WeaponType {
  name: string;
  damage: string;
  criticalRange: number;
  criticalMultiplier: number;
  type: 'melee' | 'ranged' | 'magical';
}

export class CombatRules {
  /**
   * Standard weapon types in D&D 3.5
   */
  private static weaponTypes: WeaponType[] = [
    {
      name: 'Longsword',
      damage: '1d8',
      criticalRange: 19,
      criticalMultiplier: 2,
      type: 'melee'
    },
    {
      name: 'Shortbow',
      damage: '1d6',
      criticalRange: 20,
      criticalMultiplier: 3,
      type: 'ranged'
    },
    {
      name: 'Wizard Staff',
      damage: '1d4',
      criticalRange: 20,
      criticalMultiplier: 2,
      type: 'magical'
    }
  ];

  /**
   * Calculate attack roll with modifiers
   * @param baseAttackBonus Base attack bonus
   * @param abilityModifier Strength or Dexterity modifier
   * @param weaponBonus Weapon-specific bonus
   * @returns Attack roll result
   */
  static calculateAttackRoll(
    baseAttackBonus: number, 
    abilityModifier: number, 
    weaponBonus: number = 0
  ): {
    roll: number;
    total: number;
    isCriticalThreat: boolean;
  } {
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const total = d20Roll + baseAttackBonus + abilityModifier + weaponBonus;
    
    return {
      roll: d20Roll,
      total: total,
      isCriticalThreat: d20Roll >= 19  // Simplified critical threat
    };
  }

  /**
   * Calculate damage for an attack
   * @param weaponName Weapon used in attack
   * @param criticalHit Whether the attack is a critical hit
   * @returns Damage calculation
   */
  static calculateDamage(weaponName: string, criticalHit: boolean = false): number {
    const weapon = this.weaponTypes.find(w => w.name === weaponName);
    if (!weapon) throw new Error(`Weapon ${weaponName} not found`);

    // Simplified damage calculation
    const baseDamage = this.rollDice(weapon.damage);
    
    return criticalHit 
      ? baseDamage * weapon.criticalMultiplier 
      : baseDamage;
  }

  /**
   * Simulate dice roll
   * @param diceNotation Dice notation (e.g., '1d8')
   * @returns Total roll result
   */
  private static rollDice(diceNotation: string): number {
    const [count, sides] = diceNotation.split('d').map(Number);
    return Array.from({ length: count }, () => 
      Math.floor(Math.random() * sides) + 1
    ).reduce((a, b) => a + b, 0);
  }

  /**
   * Determine available combat actions
   * @param characterClass Character's class
   * @returns List of available combat actions
   */
  static getAvailableCombatActions(characterClass: string): CombatAction[] {
    const classCombatActions = {
      'Fighter': [
        { 
          name: 'Power Attack', 
          type: 'attack', 
          description: 'Trade accuracy for damage' 
        },
        { 
          name: 'Defensive Stance', 
          type: 'defense', 
          description: 'Increase defensive capabilities' 
        }
      ],
      'Wizard': [
        { 
          name: 'Spell Combat', 
          type: 'special', 
          description: 'Cast spell as part of attack action' 
        }
      ],
      'Rogue': [
        { 
          name: 'Sneak Attack', 
          type: 'attack', 
          description: 'Extra damage against vulnerable targets' 
        }
      ]
    };

    return classCombatActions[characterClass] || [];
  }

  /**
   * Calculate armor class
   * @param baseAC Base armor class
   * @param dexterityModifier Dexterity modifier
   * @param armorBonus Additional armor bonuses
   * @returns Calculated Armor Class
   */
  static calculateArmorClass(
    baseAC: number, 
    dexterityModifier: number, 
    armorBonus: number = 0
  ): number {
    return 10 + baseAC + dexterityModifier + armorBonus;
  }
}
