import { v4 as uuidv4 } from 'uuid';
import { CampaignStorage } from './campaign-storage';

export enum EncounterDifficulty {
  TRIVIAL = 'Trivial',
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  DEADLY = 'Deadly'
}

export enum EncounterType {
  COMBAT = 'Combat',
  SOCIAL = 'Social',
  EXPLORATION = 'Exploration',
  PUZZLE = 'Puzzle',
  ROLEPLAY = 'Roleplay'
}

export interface Encounter {
  id: string;
  name: string;
  description: string;
  type: EncounterType;
  difficulty: EncounterDifficulty;
  campaignId: string;
  characters: string[]; // Character IDs
  enemies: EncounterEnemy[];
  experience: number;
  rewards?: EncounterReward[];
  notes?: string;
  completed: boolean;
}

export interface EncounterEnemy {
  id: string;
  name: string;
  hitPoints: number;
  armorClass: number;
  challengeRating: number;
}

export interface EncounterReward {
  type: 'gold' | 'item' | 'experience';
  value: number | string;
}

export class EncounterManager {
  /**
   * Create a new encounter
   */
  createEncounter(encounterData: Partial<Encounter>): Encounter {
    const newEncounter: Encounter = {
      id: uuidv4(),
      name: encounterData.name || 'Unnamed Encounter',
      description: encounterData.description || '',
      type: encounterData.type || EncounterType.COMBAT,
      difficulty: encounterData.difficulty || EncounterDifficulty.EASY,
      campaignId: encounterData.campaignId || '',
      characters: encounterData.characters || [],
      enemies: encounterData.enemies || [],
      experience: encounterData.experience || 0,
      rewards: encounterData.rewards || [],
      notes: encounterData.notes,
      completed: false
    };

    this.saveEncounter(newEncounter);
    return newEncounter;
  }

  /**
   * Save encounter to storage
   */
  saveEncounter(encounter: Encounter): void {
    const encounters = this.getAllEncounters();
    const existingIndex = encounters.findIndex(e => e.id === encounter.id);
    
    if (existingIndex !== -1) {
      encounters[existingIndex] = encounter;
    } else {
      encounters.push(encounter);
    }

    localStorage.setItem('dnd-encounters-v1', JSON.stringify(encounters));
  }

  /**
   * Get all encounters
   */
  getAllEncounters(): Encounter[] {
    const encountersJson = localStorage.getItem('dnd-encounters-v1');
    return encountersJson ? JSON.parse(encountersJson) : [];
  }

  /**
   * Get encounters by campaign
   */
  getEncountersByCampaign(campaignId: string): Encounter[] {
    return this.getAllEncounters().filter(
      encounter => encounter.campaignId === campaignId
    );
  }

  /**
   * Add enemy to encounter
   */
  addEncounterEnemy(encounterId: string, enemy: Partial<EncounterEnemy>): EncounterEnemy {
    const encounter = this.getEncounterById(encounterId);
    if (!encounter) {
      throw new Error('Encounter not found');
    }

    const newEnemy: EncounterEnemy = {
      id: uuidv4(),
      name: enemy.name || 'Unnamed Enemy',
      hitPoints: enemy.hitPoints || 10,
      armorClass: enemy.armorClass || 10,
      challengeRating: enemy.challengeRating || 0.25
    };

    encounter.enemies.push(newEnemy);
    this.saveEncounter(encounter);
    return newEnemy;
  }

  /**
   * Get encounter by ID
   */
  getEncounterById(encounterId: string): Encounter | undefined {
    return this.getAllEncounters().find(
      encounter => encounter.id === encounterId
    );
  }

  /**
   * Mark encounter as completed
   */
  completeEncounter(encounterId: string): Encounter {
    const encounter = this.getEncounterById(encounterId);
    if (!encounter) {
      throw new Error('Encounter not found');
    }

    encounter.completed = true;
    this.saveEncounter(encounter);
    return encounter;
  }

  /**
   * Calculate encounter experience
   */
  calculateEncounterExperience(encounter: Encounter): number {
    return encounter.enemies.reduce(
      (total, enemy) => total + this.calculateEnemyExperience(enemy), 
      0
    );
  }

  /**
   * Calculate enemy experience based on challenge rating
   */
  private calculateEnemyExperience(enemy: EncounterEnemy): number {
    const experienceTable: Record<number, number> = {
      0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200,
      2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300,
      7: 2900, 8: 3900, 9: 5000, 10: 5900
    };

    return experienceTable[enemy.challengeRating] || 0;
  }
}
