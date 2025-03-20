import { Character } from '../characters';
import { Monster } from '../monsters';

export interface Encounter {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  monsters: Monster[];
  experience: number;
  recommendedLevel: number;
  terrain: string;
  specialConditions?: string[];
}

export class EncounterGenerator {
  /**
   * Calculate encounter difficulty
   * @param characters Party characters
   * @param monsters Monsters in encounter
   * @returns Encounter difficulty
   */
  static calculateEncounterDifficulty(
    characters: Character[], 
    monsters: Monster[]
  ): Encounter['difficulty'] {
    const partyLevel = this.calculateAveragePartyLevel(characters);
    const totalMonsterXP = monsters.reduce((sum, monster) => sum + monster.experience, 0);
    const adjustedXP = this.adjustExperienceForPartySize(totalMonsterXP, characters.length);

    const difficultyThresholds = {
      'Easy': partyLevel * 25,
      'Medium': partyLevel * 50,
      'Hard': partyLevel * 75,
      'Deadly': partyLevel * 100
    };

    if (adjustedXP <= difficultyThresholds['Easy']) return 'Easy';
    if (adjustedXP <= difficultyThresholds['Medium']) return 'Medium';
    if (adjustedXP <= difficultyThresholds['Hard']) return 'Hard';
    return 'Deadly';
  }

  /**
   * Generate an encounter
   * @param characters Party characters
   * @param options Encounter generation options
   * @returns Generated encounter
   */
  static generateEncounter(
    characters: Character[], 
    options: {
      difficulty?: Encounter['difficulty'];
      terrain?: string;
      monsterTypes?: string[];
    } = {}
  ): Encounter {
    const partyLevel = this.calculateAveragePartyLevel(characters);
    const difficulty = options.difficulty || 
      this.calculateEncounterDifficulty(characters, []);

    const monsters = this.selectMonsters(partyLevel, difficulty, options.monsterTypes);

    return {
      id: crypto.randomUUID(),
      name: this.generateEncounterName(monsters),
      difficulty,
      monsters,
      experience: monsters.reduce((sum, monster) => sum + monster.experience, 0),
      recommendedLevel: partyLevel,
      terrain: options.terrain || this.generateRandomTerrain(),
      specialConditions: this.generateSpecialConditions(difficulty)
    };
  }

  /**
   * Select monsters for encounter
   * @param partyLevel Average party level
   * @param difficulty Encounter difficulty
   * @param monsterTypes Optional monster type filter
   * @returns Selected monsters
   */
  private static selectMonsters(
    partyLevel: number, 
    difficulty: Encounter['difficulty'],
    monsterTypes?: string[]
  ): Monster[] {
    // Mock monster selection logic
    const monsterPool: Monster[] = [
      {
        name: 'Goblin',
        challenge_rating: 0.25,
        experience: 50,
        type: 'humanoid'
      },
      {
        name: 'Orc',
        challenge_rating: 0.5,
        experience: 100,
        type: 'humanoid'
      },
      {
        name: 'Bugbear',
        challenge_rating: 1,
        experience: 200,
        type: 'humanoid'
      }
    ];

    const difficultyMultipliers = {
      'Easy': 0.5,
      'Medium': 1,
      'Hard': 1.5,
      'Deadly': 2
    };

    const targetExperience = partyLevel * 100 * difficultyMultipliers[difficulty];
    const filteredMonsters = monsterTypes 
      ? monsterPool.filter(m => monsterTypes.includes(m.type))
      : monsterPool;

    const selectedMonsters: Monster[] = [];
    let currentExperience = 0;

    while (currentExperience < targetExperience) {
      const availableMonsters = filteredMonsters
        .filter(m => m.experience + currentExperience <= targetExperience);
      
      if (availableMonsters.length === 0) break;

      const selectedMonster = availableMonsters[
        Math.floor(Math.random() * availableMonsters.length)
      ];
      
      selectedMonsters.push(selectedMonster);
      currentExperience += selectedMonster.experience;
    }

    return selectedMonsters;
  }

  /**
   * Calculate average party level
   * @param characters Party characters
   * @returns Average party level
   */
  private static calculateAveragePartyLevel(characters: Character[]): number {
    if (characters.length === 0) return 1;
    return Math.floor(
      characters.reduce((sum, char) => sum + char.level, 0) / characters.length
    );
  }

  /**
   * Adjust experience for party size
   * @param experience Base encounter experience
   * @param partySize Number of characters
   * @returns Adjusted experience
   */
  private static adjustExperienceForPartySize(
    experience: number, 
    partySize: number
  ): number {
    const multipliers = {
      1: 1,
      2: 1.5,
      3: 2,
      4: 2.5,
      5: 3,
      6: 4
    };

    return experience * (multipliers[partySize] || 4);
  }

  /**
   * Generate encounter name
   * @param monsters Monsters in encounter
   * @returns Generated encounter name
   */
  private static generateEncounterName(monsters: Monster[]): string {
    const monsterNames = monsters.map(m => m.name);
    const namePrefixes = [
      'Ambush of', 
      'Lair of', 
      'Gathering of', 
      'Raid of'
    ];

    return `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]} ${monsterNames.join(' and ')}`;
  }

  /**
   * Generate random terrain
   * @returns Random terrain type
   */
  private static generateRandomTerrain(): string {
    const terrainTypes = [
      'Forest', 
      'Mountain', 
      'Cave', 
      'Desert', 
      'Swamp', 
      'Plains'
    ];

    return terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
  }

  /**
   * Generate special encounter conditions
   * @param difficulty Encounter difficulty
   * @returns Special conditions
   */
  private static generateSpecialConditions(
    difficulty: Encounter['difficulty']
  ): string[] {
    const conditionPools = {
      'Easy': [
        'Difficult Terrain',
        'Light Fog'
      ],
      'Medium': [
        'Difficult Terrain',
        'Partial Cover',
        'Dim Lighting'
      ],
      'Hard': [
        'Difficult Terrain',
        'Heavy Fog',
        'Challenging Elevation',
        'Limited Visibility'
      ],
      'Deadly': [
        'Extreme Terrain',
        'Zero Visibility',
        'Hazardous Environment',
        'Multiple Terrain Types'
      ]
    };

    const conditions = conditionPools[difficulty] || [];
    const numConditions = Math.floor(Math.random() * 2) + 1;

    return conditions
      .sort(() => 0.5 - Math.random())
      .slice(0, numConditions);
  }
}
