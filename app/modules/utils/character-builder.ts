import { v4 as uuidv4 } from 'uuid';
import { Character, CharacterClass, CharacterRace } from '../characters';
import { AbilityScoreUtils } from './ability-score-utils';
import { SpellSystem } from './spell-system';
import { InventoryManagement } from './inventory-management';

export interface CharacterCreationOptions {
  generationMethod?: 'standard' | 'heroic' | 'elite';
  backgroundType?: 'random' | 'custom';
}

export class CharacterBuilder {
  /**
   * Create a new character with advanced generation options
   * @param characterClass Character's class
   * @param race Character's race
   * @param options Character creation options
   * @returns Fully generated character
   */
  static createCharacter(
    characterClass: CharacterClass, 
    race: CharacterRace, 
    options: CharacterCreationOptions = {}
  ): Character {
    const {
      generationMethod = 'standard',
      backgroundType = 'random'
    } = options;

    // Generate base ability scores
    const abilityScores = this.generateAbilityScores(generationMethod);

    // Apply racial modifiers
    const modifiedAbilityScores = this.applyRacialAbilityModifiers(abilityScores, race);

    // Calculate base hit points
    const hitPoints = this.calculateInitialHitPoints(characterClass, modifiedAbilityScores);

    // Generate background
    const background = backgroundType === 'random' 
      ? this.generateRandomBackground() 
      : this.createEmptyBackground();

    // Initial inventory based on class
    const initialInventory = this.generateStartingInventory(characterClass);

    // Initial spells for spellcasting classes
    const initialSpells = SpellSystem.isSpellcaster(characterClass)
      ? SpellSystem.getAvailableSpells({ class: characterClass } as Character).slice(0, 2)
      : [];

    return {
      id: uuidv4(),
      name: this.generateRandomName(race),
      race,
      class: characterClass,
      level: 1,
      experience: 0,
      abilityScores: modifiedAbilityScores,
      hitPoints,
      armorClass: InventoryManagement.calculateArmorClass({ 
        abilityScores: modifiedAbilityScores 
      } as Character),
      inventory: initialInventory,
      spells: initialSpells,
      backstory: background.backstory,
      traits: background.traits,
      status: 'Active'
    } as Character;
  }

  /**
   * Generate ability scores based on method
   * @param method Ability score generation method
   * @returns Generated ability scores
   */
  private static generateAbilityScores(method: 'standard' | 'heroic' | 'elite'): Character['abilityScores'] {
    const methodMultipliers = {
      'standard': 1,
      'heroic': 1.2,
      'elite': 1.5
    };

    const baseScores = {
      strength: this.rollAbilityScore(),
      dexterity: this.rollAbilityScore(),
      constitution: this.rollAbilityScore(),
      intelligence: this.rollAbilityScore(),
      wisdom: this.rollAbilityScore(),
      charisma: this.rollAbilityScore()
    };

    const multiplier = methodMultipliers[method];
    return Object.fromEntries(
      Object.entries(baseScores).map(([key, value]) => [
        key, 
        Math.floor(value * multiplier)
      ])
    ) as Character['abilityScores'];
  }

  /**
   * Roll ability score using 4d6 drop lowest method
   * @returns Rolled ability score
   */
  private static rollAbilityScore(): number {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    return rolls
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Apply racial ability score modifiers
   * @param baseScores Initial ability scores
   * @param race Character's race
   * @returns Modified ability scores
   */
  private static applyRacialAbilityModifiers(
    baseScores: Character['abilityScores'], 
    race: CharacterRace
  ): Character['abilityScores'] {
    const racialModifiers = {
      'Human': { 
        strength: 1, 
        dexterity: 1, 
        constitution: 1, 
        intelligence: 1, 
        wisdom: 1, 
        charisma: 1 
      },
      'Elf': { 
        dexterity: 2, 
        intelligence: 1 
      },
      'Dwarf': { 
        constitution: 2, 
        strength: 1 
      }
    };

    const modifiers = racialModifiers[race] || {};
    return Object.fromEntries(
      Object.entries(baseScores).map(([key, value]) => [
        key, 
        value + (modifiers[key] || 0)
      ])
    ) as Character['abilityScores'];
  }

  /**
   * Calculate initial hit points based on class and constitution
   * @param characterClass Character's class
   * @param abilityScores Character's ability scores
   * @returns Initial hit points
   */
  private static calculateInitialHitPoints(
    characterClass: CharacterClass, 
    abilityScores: Character['abilityScores']
  ): number {
    const baseHitDice = {
      'Fighter': 10,
      'Wizard': 6,
      'Cleric': 8,
      'Rogue': 8,
      'Barbarian': 12,
      'Ranger': 10,
      'Paladin': 10,
      'Druid': 8,
      'Monk': 8,
      'Warlock': 8
    };

    const constitutionModifier = Math.floor((abilityScores.constitution - 10) / 2);
    const baseHitPoints = baseHitDice[characterClass] || 8;

    return baseHitPoints + constitutionModifier;
  }

  /**
   * Generate a random character name based on race
   * @param race Character's race
   * @returns Generated name
   */
  private static generateRandomName(race: CharacterRace): string {
    const nameGenerators = {
      'Human': () => `${this.getRandomName('human-first')} ${this.getRandomName('human-last')}`,
      'Elf': () => `${this.getRandomName('elf-first')} ${this.getRandomName('elf-last')}`,
      'Dwarf': () => `${this.getRandomName('dwarf-first')} ${this.getRandomName('dwarf-last')}`
    };

    return (nameGenerators[race] || (() => 'Unnamed Character'))();
  }

  /**
   * Get a random name from a predefined list
   * @param nameType Type of name to generate
   * @returns Random name
   */
  private static getRandomName(nameType: string): string {
    const names = {
      'human-first': ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia'],
      'human-last': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'],
      'elf-first': ['Aelindor', 'Faelyn', 'Lyriael', 'Caelynn', 'Thaelar'],
      'elf-last': ['Moonwhisper', 'Starweaver', 'Dawnblade', 'Silverleaf'],
      'dwarf-first': ['Thorin', 'Gimli', 'Balin', 'Dwalin', 'Brenna'],
      'dwarf-last': ['Stonehammer', 'Ironbeard', 'Goldaxe', 'Rockseeker']
    };

    const nameList = names[nameType] || [];
    return nameList[Math.floor(Math.random() * nameList.length)] || 'Unknown';
  }

  /**
   * Generate starting inventory based on character class
   * @param characterClass Character's class
   * @returns Initial inventory items
   */
  private static generateStartingInventory(characterClass: CharacterClass): any[] {
    const classInventories = {
      'Fighter': [
        { 
          id: 'starter-sword', 
          name: 'Longsword', 
          type: 'weapon', 
          weight: 3, 
          value: 15 
        },
        { 
          id: 'starter-shield', 
          name: 'Shield', 
          type: 'armor', 
          weight: 6, 
          value: 10 
        }
      ],
      'Wizard': [
        { 
          id: 'starter-staff', 
          name: 'Quarterstaff', 
          type: 'weapon', 
          weight: 4, 
          value: 5 
        },
        { 
          id: 'starter-spellbook', 
          name: 'Spellbook', 
          type: 'misc', 
          weight: 3, 
          value: 50 
        }
      ]
    };

    return classInventories[characterClass] || [];
  }

  /**
   * Generate a random background
   * @returns Character background details
   */
  private static generateRandomBackground() {
    const personalityTraits = [
      'Brave', 'Cautious', 'Curious', 'Loyal', 'Ambitious'
    ];
    const ideals = [
      'Justice', 'Knowledge', 'Freedom', 'Power', 'Tradition'
    ];
    const bonds = [
      'Family', 'Hometown', 'Mentor', 'Childhood Friend', 'Personal Goal'
    ];
    const flaws = [
      'Overconfident', 'Stubborn', 'Impulsive', 'Greedy', 'Secretive'
    ];

    return {
      backstory: this.generateRandomBackstoryText(),
      traits: {
        personality: [this.getRandomItem(personalityTraits)],
        ideals: [this.getRandomItem(ideals)],
        bonds: [this.getRandomItem(bonds)],
        flaws: [this.getRandomItem(flaws)]
      }
    };
  }

  /**
   * Create an empty background
   * @returns Empty background structure
   */
  private static createEmptyBackground() {
    return {
      backstory: '',
      traits: {
        personality: [],
        ideals: [],
        bonds: [],
        flaws: []
      }
    };
  }

  /**
   * Generate a random backstory text
   * @returns Generated backstory
   */
  private static generateRandomBackstoryText(): string {
    const backstoryTemplates = [
      'Raised in a small village, {name} always dreamed of adventure.',
      '{name} was apprenticed to a master {profession} before becoming an adventurer.',
      'After a tragic event, {name} left home to seek purpose and meaning.',
      'Born into a noble family, {name} rejected a life of comfort for excitement.',
      'A mysterious prophecy guided {name} to become an adventurer.'
    ];

    return this.getRandomItem(backstoryTemplates)
      .replace('{name}', this.getRandomName('human-first'))
      .replace('{profession}', this.getRandomProfession());
  }

  /**
   * Get a random profession
   * @returns Random profession
   */
  private static getRandomProfession(): string {
    const professions = [
      'blacksmith', 'merchant', 'scholar', 'artisan', 'sailor'
    ];
    return this.getRandomItem(professions);
  }

  /**
   * Get a random item from an array
   * @param array Array to select from
   * @returns Randomly selected item
   */
  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
