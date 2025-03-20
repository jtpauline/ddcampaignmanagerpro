export interface SpellComponent {
  type: 'Verbal' | 'Somatic' | 'Material';
  description?: string;
  materialComponent?: string;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  savingThrow: string;
  spellResistance: boolean;
  description: string;
  components: SpellComponent[];
  classAvailability: string[];
}

export class SpellSystem {
  /**
   * Comprehensive spell database
   */
  private static spellDatabase: Spell[] = [
    {
      name: 'Magic Missile',
      level: 1,
      school: 'Evocation',
      castingTime: '1 standard action',
      range: 'Medium (100 ft + 10 ft/level)',
      duration: 'Instantaneous',
      savingThrow: 'None',
      spellResistance: true,
      description: 'Fires multiple magic missiles that automatically hit the target.',
      components: [
        { type: 'Verbal' },
        { type: 'Somatic' }
      ],
      classAvailability: ['Wizard', 'Sorcerer']
    },
    {
      name: 'Fireball',
      level: 3,
      school: 'Evocation',
      castingTime: '1 standard action',
      range: 'Long (400 ft + 40 ft/level)',
      duration: 'Instantaneous',
      savingThrow: 'Reflex half',
      spellResistance: true,
      description: 'Hurls a ball of fire that explodes, dealing damage to all creatures in the area.',
      components: [
        { type: 'Verbal' },
        { type: 'Somatic' },
        { 
          type: 'Material', 
          materialComponent: 'A tiny ball of bat guano and sulfur' 
        }
      ],
      classAvailability: ['Wizard', 'Sorcerer']
    }
  ];

  /**
   * Find spells by various criteria
   * @param criteria Search criteria
   * @returns Matching spells
   */
  static findSpells(criteria: Partial<Spell>): Spell[] {
    return this.spellDatabase.filter(spell => 
      Object.entries(criteria).every(([key, value]) => 
        spell[key] === value
      )
    );
  }

  /**
   * Calculate spell save DC
   * @param spellLevel Spell level
   * @param casterAbilityScore Caster's ability score
   * @returns Spell save DC
   */
  static calculateSpellSaveDC(spellLevel: number, casterAbilityScore: number): number {
    const abilityModifier = Math.floor((casterAbilityScore - 10) / 2);
    return 10 + spellLevel + abilityModifier;
  }

  /**
   * Generate spell preparation slots
   * @param characterClass Character's class
   * @param level Character's level
   * @param intelligenceScore Intelligence ability score
   * @returns Spell preparation slots
   */
  static generateSpellPreparationSlots(
    characterClass: string, 
    level: number, 
    intelligenceScore: number
  ): { [spellLevel: number]: number } {
    const intelligenceModifier = Math.floor((intelligenceScore - 10) / 2);
    
    const spellSlots: { [characterClass: string]: (level: number, intMod: number) => { [spellLevel: number]: number } } = {
      'Wizard': (lvl, intMod) => ({
        0: 4 + intMod,
        1: Math.max(1 + intMod, 0),
        2: Math.max(Math.floor(lvl / 2) + intMod, 0),
        3: Math.max(Math.floor((lvl - 1) / 2) + intMod, 0)
      }),
      'Sorcerer': (lvl, intMod) => ({
        0: 4 + intMod,
        1: Math.max(lvl + 1, 0),
        2: Math.max(Math.floor(lvl / 2), 0),
        3: Math.max(Math.floor((lvl - 1) / 2), 0)
      })
    };

    return spellSlots[characterClass] 
      ? spellSlots[characterClass](level, intelligenceModifier)
      : {};
  }

  /**
   * Simulate spell casting
   * @param spell Spell to cast
   * @param caster Caster's details
   * @param target Target details
   * @returns Spell casting result
   */
  static castSpell(
    spell: Spell, 
    caster: { 
      level: number, 
      abilityScore: number 
    },
    target?: { 
      savingThrow?: number 
    }
  ): {
    success: boolean;
    damage?: number;
    effect: string;
  } {
    const saveDC = this.calculateSpellSaveDC(spell.level, caster.abilityScore);
    
    // Basic damage calculation
    const baseDamage = spell.level * 2;
    
    // Saving throw check
    if (spell.savingThrow !== 'None' && target?.savingThrow) {
      const saveResult = target.savingThrow;
      const success = saveResult >= saveDC;
      
      return {
        success: !success,
        damage: success ? Math.floor(baseDamage / 2) : baseDamage,
        effect: success 
          ? 'Partial effect (half damage)' 
          : 'Full spell effect'
      };
    }
    
    return {
      success: true,
      damage: baseDamage,
      effect: 'Spell cast successfully'
    };
  }
}
