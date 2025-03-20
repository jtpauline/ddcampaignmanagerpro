export class RandomGenerator {
  /**
   * Generate a random character name
   * @param gender Optional gender specification
   * @returns Randomly generated name
   */
  static generateCharacterName(
    gender?: 'male' | 'female' | 'neutral'
  ): string {
    const maleNames = [
      'Aragon', 'Thorne', 'Kael', 'Eldric', 'Rowan', 
      'Gareth', 'Finn', 'Brendan', 'Caleb', 'Darian'
    ];
    const femaleNames = [
      'Aria', 'Lyra', 'Elena', 'Saria', 'Nessa', 
      'Freya', 'Celeste', 'Isabelle', 'Maya', 'Raven'
    ];
    const lastNames = [
      'Stormwind', 'Shadowbane', 'Ironheart', 'Moonwhisper', 
      'Dragonborn', 'Silvermane', 'Oakenshield', 'Nightwalker'
    ];

    let firstName: string;
    if (gender === 'male') {
      firstName = maleNames[Math.floor(Math.random() * maleNames.length)];
    } else if (gender === 'female') {
      firstName = femaleNames[Math.floor(Math.random() * femaleNames.length)];
    } else {
      // Combine male and female names for neutral
      const allNames = [...maleNames, ...femaleNames];
      firstName = allNames[Math.floor(Math.random() * allNames.length)];
    }

    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  /**
   * Generate random ability scores
   * @param method Ability score generation method
   * @returns Generated ability scores
   */
  static generateAbilityScores(
    method: 'standard' | 'heroic' | 'elite' = 'standard'
  ): {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  } {
    const methodRules = {
      'standard': { minTotal: 72, maxTotal: 80 },
      'heroic': { minTotal: 80, maxTotal: 90 },
      'elite': { minTotal: 90, maxTotal: 100 }
    };

    const { minTotal, maxTotal } = methodRules[method];
    
    let abilityScores: number[];
    do {
      abilityScores = Array.from({ length: 6 }, () => {
        // Roll 4d6, drop lowest
        const rolls = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];
        rolls.sort((a, b) => a - b);
        return rolls.slice(1).reduce((a, b) => a + b, 0);
      });
    } while (
      abilityScores.reduce((a, b) => a + b, 0) < minTotal || 
      abilityScores.reduce((a, b) => a + b, 0) > maxTotal
    );

    return {
      strength: abilityScores[0],
      dexterity: abilityScores[1],
      constitution: abilityScores[2],
      intelligence: abilityScores[3],
      wisdom: abilityScores[4],
      charisma: abilityScores[5]
    };
  }

  /**
   * Generate a random alignment
   * @returns Randomly selected alignment
   */
  static generateAlignment(): string {
    const alignments = [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ];

    return alignments[Math.floor(Math.random() * alignments.length)];
  }

  /**
   * Generate random treasure
   * @param treasureType Type of treasure
   * @param challengeRating Challenge rating
   * @returns Generated treasure
   */
  static generateTreasure(
    treasureType: 'coin' | 'item' | 'magical' = 'coin',
    challengeRating: number = 1
  ): {
    type: string;
    value: number;
    details?: string;
  } {
    switch (treasureType) {
      case 'coin':
        return {
          type: 'Gold Coins',
          value: Math.floor(Math.random() * 100 * challengeRating) + 10
        };
      case 'item':
        const itemTypes = [
          'Weapon', 'Armor', 'Potion', 'Scroll', 'Trinket'
        ];
        return {
          type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
          value: Math.floor(Math.random() * 50 * challengeRating) + 5,
          details: this.generateItemDetails()
        };
      case 'magical':
        const magicalItemTypes = [
          'Wand', 'Ring', 'Amulet', 'Staff', 'Orb'
        ];
        return {
          type: magicalItemTypes[Math.floor(Math.random() * magicalItemTypes.length)],
          value: Math.floor(Math.random() * 200 * challengeRating) + 50,
          details: this.generateMagicalItemDetails()
        };
    }
  }

  /**
   * Generate item details
   * @returns Random item details
   */
  private static generateItemDetails(): string {
    const qualities = [
      'Masterwork', 'Ornate', 'Simple', 'Elegant', 'Rustic'
    ];
    const materials = [
      'Steel', 'Bronze', 'Silver', 'Leather', 'Wood'
    ];

    return `${qualities[Math.floor(Math.random() * qualities.length)]} ${
      materials[Math.floor(Math.random() * materials.length)]
    }`;
  }

  /**
   * Generate magical item details
   * @returns Random magical item details
   */
  private static generateMagicalItemDetails(): string {
    const enchantments = [
      'of Protection', 'of Healing', 'of Strength', 
      'of Wisdom', 'of Cunning', 'of Luck'
    ];
    const origins = [
      'Elven', 'Dwarven', 'Arcane', 'Celestial', 'Infernal'
    ];

    return `${
      origins[Math.floor(Math.random() * origins.length)]
    } ${
      enchantments[Math.floor(Math.random() * enchantments.length)]
    }`;
  }
}
