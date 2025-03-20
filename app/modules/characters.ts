import { v4 as uuidv4 } from 'uuid';
import { CharacterBuilder } from './utils/character-builder';
import { CharacterSheetGenerator } from './utils/character-sheet-generator';
import { AbilityScoreUtils } from './utils/ability-score-utils';
import { InventoryManagement } from './utils/inventory-management';
import { SpellSystem } from './utils/spell-system';

export enum CharacterStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DECEASED = 'Deceased',
  RETIRED = 'Retired'
}

export interface CharacterExport {
  version: string;
  character: Character;
  metadata: {
    exportedAt: string;
    exportVersion: string;
  };
}

export class CharacterManager {
  /**
   * Create a new character with advanced generation
   */
  createCharacter(characterData: Partial<Character>, generationMethod: 'standard' | 'heroic' | 'elite' = 'standard'): Character {
    // Use CharacterBuilder for more advanced character generation
    const characterTemplate = CharacterBuilder.createCharacter(
      characterData.class || 'Fighter', 
      characterData.race || 'Human', 
      generationMethod
    );

    const newCharacter: Character = {
      ...this.baseCharacterStructure(characterData),
      ...characterTemplate,
      status: CharacterStatus.ACTIVE
    };

    this.saveCharacter(newCharacter);
    return newCharacter;
  }

  /**
   * Generate base character structure
   */
  private baseCharacterStructure(characterData: Partial<Character>): Character {
    return {
      id: characterData.id || uuidv4(),
      name: characterData.name || 'Unnamed Character',
      level: characterData.level || 1,
      experience: 0,
      campaignId: characterData.campaignId,
      status: CharacterStatus.ACTIVE,
      inventory: [],
      spells: [],
      backstory: characterData.backstory || '',
      traits: {
        personality: [],
        ideals: [],
        bonds: [],
        flaws: []
      }
    };
  }

  /**
   * Advanced level up with more comprehensive progression
   */
  levelUpCharacter(characterId: string): Character {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Increment level
    character.level++;

    // Update hit points
    character.hitPoints += this.calculateHitPointIncrease(character);

    // Potential ability score improvement
    if (character.level % 4 === 0) {
      this.offerAbilityScoreImprovement(character);
    }

    // Spell progression
    this.updateSpellProgression(character);

    // Experience tracking
    character.experience = this.calculateExperience(character);

    this.saveCharacter(character);
    return character;
  }

  /**
   * Offer ability score improvement at certain levels
   */
  private offerAbilityScoreImprovement(character: Character): void {
    // Logic for ability score improvement
    // Could be expanded to offer UI choices
    const improvableAbilities = Object.keys(character.abilityScores)
      .filter(ability => AbilityScoreUtils.canImproveAbilityScore(character, ability as keyof typeof character.abilityScores));
    
    if (improvableAbilities.length > 0) {
      // Simple improvement - could be made more sophisticated
      const abilityToImprove = improvableAbilities[0] as keyof typeof character.abilityScores;
      AbilityScoreUtils.improveAbilityScore(character, abilityToImprove);
    }
  }

  /**
   * Update spell progression based on character level and class
   */
  private updateSpellProgression(character: Character): void {
    const newSpells = SpellSystem.getNewSpellsForLevel(character);
    character.spells = [...(character.spells || []), ...newSpells];
  }

  /**
   * Calculate experience based on level and activities
   */
  private calculateExperience(character: Character): number {
    // Simplified XP calculation
    const baseXP = 300;
    return character.level * baseXP;
  }

  /**
   * Export character to shareable format
   */
  exportCharacter(characterId: string): CharacterExport {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    return {
      version: '1.0.0',
      character,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0.0'
      }
    };
  }

  /**
   * Import character from exported data
   */
  importCharacter(exportData: CharacterExport): Character {
    // Validate import data
    if (exportData.version !== '1.0.0') {
      throw new Error('Incompatible export version');
    }

    const importedCharacter = {
      ...exportData.character,
      id: uuidv4() // Generate new ID to prevent conflicts
    };

    this.saveCharacter(importedCharacter);
    return importedCharacter;
  }

  /**
   * Add detailed backstory and character traits
   */
  updateCharacterBackground(characterId: string, backstoryData: {
    backstory?: string;
    personality?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  }): Character {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    character.backstory = backstoryData.backstory || character.backstory;
    character.traits = {
      personality: backstoryData.personality || character.traits.personality,
      ideals: backstoryData.ideals || character.traits.ideals,
      bonds: backstoryData.bonds || character.traits.bonds,
      flaws: backstoryData.flaws || character.traits.flaws
    };

    this.saveCharacter(character);
    return character;
  }

  // Existing methods from previous implementation...
  saveCharacter(character: Character): void {
    const characters = this.getAllCharacters();
    const existingIndex = characters.findIndex(c => c.id === character.id);
    
    if (existingIndex !== -1) {
      characters[existingIndex] = character;
    } else {
      characters.push(character);
    }

    localStorage.setItem('dnd-characters-v2', JSON.stringify(characters));
  }

  getAllCharacters(): Character[] {
    const charactersJson = localStorage.getItem('dnd-characters-v2');
    return charactersJson ? JSON.parse(charactersJson) : [];
  }

  getCharacterById(characterId: string): Character | undefined {
    return this.getAllCharacters().find(
      character => character.id === characterId
    );
  }

  getCharactersByCampaign(campaignId: string): Character[] {
    return this.getAllCharacters().filter(
      character => character.campaignId === campaignId
    );
  }
}

// Extend existing Character interface
export interface Character {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
  experience: number;
  status: CharacterStatus;
  abilityScores: AbilityScores;
  hitPoints: number;
  armorClass: number;
  campaignId?: string;
  inventory: CharacterItem[];
  spells: CharacterSpell[];
  backstory?: string;
  traits?: {
    personality: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
}
