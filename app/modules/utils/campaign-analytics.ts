import { Character } from '../characters';
import { Encounter } from './encounter-generator';

export interface CampaignAnalytics {
  totalCharacters: number;
  averageCharacterLevel: number;
  characterClassDistribution: Record<string, number>;
  characterRaceDistribution: Record<string, number>;
  encounterStatistics: {
    totalEncounters: number;
    averageEncounterDifficulty: number;
    encounterDifficultyDistribution: Record<string, number>;
  };
  experienceStatistics: {
    totalExperienceEarned: number;
    averageExperiencePerCharacter: number;
    levelUpRate: number;
  };
}

export class CampaignAnalyticsManager {
  /**
   * Generate comprehensive campaign analytics
   * @param characters All characters in campaign
   * @param encounters All encounters in campaign
   * @returns Detailed campaign analytics
   */
  static generateCampaignAnalytics(
    characters: Character[], 
    encounters: Encounter[]
  ): CampaignAnalytics {
    return {
      totalCharacters: characters.length,
      averageCharacterLevel: this.calculateAverageCharacterLevel(characters),
      characterClassDistribution: this.calculateCharacterClassDistribution(characters),
      characterRaceDistribution: this.calculateCharacterRaceDistribution(characters),
      encounterStatistics: {
        totalEncounters: encounters.length,
        averageEncounterDifficulty: this.calculateAverageEncounterDifficulty(encounters),
        encounterDifficultyDistribution: this.calculateEncounterDifficultyDistribution(encounters)
      },
      experienceStatistics: {
        totalExperienceEarned: this.calculateTotalExperienceEarned(characters),
        averageExperiencePerCharacter: this.calculateAverageExperiencePerCharacter(characters),
        levelUpRate: this.calculateLevelUpRate(characters)
      }
    };
  }

  /**
   * Calculate average character level
   * @param characters Characters to analyze
   * @returns Average character level
   */
  private static calculateAverageCharacterLevel(characters: Character[]): number {
    if (characters.length === 0) return 0;
    return characters.reduce((sum, char) => sum + char.level, 0) / characters.length;
  }

  /**
   * Calculate character class distribution
   * @param characters Characters to analyze
   * @returns Class distribution
   */
  private static calculateCharacterClassDistribution(characters: Character[]): Record<string, number> {
    return characters.reduce((distribution, character) => {
      distribution[character.class] = (distribution[character.class] || 0) + 1;
      return distribution;
    }, {});
  }

  /**
   * Calculate character race distribution
   * @param characters Characters to analyze
   * @returns Race distribution
   */
  private static calculateCharacterRaceDistribution(characters: Character[]): Record<string, number> {
    return characters.reduce((distribution, character) => {
      distribution[character.race] = (distribution[character.race] || 0) + 1;
      return distribution;
    }, {});
  }

  /**
   * Calculate average encounter difficulty
   * @param encounters Encounters to analyze
   * @returns Average encounter difficulty
   */
  private static calculateAverageEncounterDifficulty(encounters: Encounter[]): number {
    const difficultyValues = {
      'Easy': 1,
      'Medium': 2,
      'Hard': 3,
      'Deadly': 4
    };

    if (encounters.length === 0) return 0;

    const totalDifficulty = encounters.reduce((sum, encounter) => 
      sum + difficultyValues[encounter.difficulty], 0
    );

    return totalDifficulty / encounters.length;
  }

  /**
   * Calculate encounter difficulty distribution
   * @param encounters Encounters to analyze
   * @returns Difficulty distribution
   */
  private static calculateEncounterDifficultyDistribution(encounters: Encounter[]): Record<string, number> {
    return encounters.reduce((distribution, encounter) => {
      distribution[encounter.difficulty] = (distribution[encounter.difficulty] || 0) + 1;
      return distribution;
    }, {});
  }

  /**
   * Calculate total experience earned
   * @param characters Characters to analyze
   * @returns Total experience
   */
  private static calculateTotalExperienceEarned(characters: Character[]): number {
    return characters.reduce((sum, character) => sum + character.experience, 0);
  }

  /**
   * Calculate average experience per character
   * @param characters Characters to analyze
   * @returns Average experience
   */
  private static calculateAverageExperiencePerCharacter(characters: Character[]): number {
    if (characters.length === 0) return 0;
    return this.calculateTotalExperienceEarned(characters) / characters.length;
  }

  /**
   * Calculate level up rate
   * @param characters Characters to analyze
   * @returns Percentage of characters that can level up
   */
  private static calculateLevelUpRate(characters: Character[]): number {
    if (characters.length === 0) return 0;

    const levelUpEligibleCharacters = characters.filter(character => 
      character.experience >= (character.level * 300)
    );

    return levelUpEligibleCharacters.length / characters.length;
  }

  /**
   * Generate campaign progress report
   * @param characters All characters in campaign
   * @param encounters All encounters in campaign
   * @returns Detailed progress report
   */
  static generateCampaignProgressReport(
    characters: Character[], 
    encounters: Encounter[]
  ): string {
    const analytics = this.generateCampaignAnalytics(characters, encounters);

    return `
CAMPAIGN PROGRESS REPORT
========================
Total Characters: ${analytics.totalCharacters}
Average Character Level: ${analytics.averageCharacterLevel.toFixed(2)}

CHARACTER CLASS DISTRIBUTION
----------------------------
${Object.entries(analytics.characterClassDistribution)
  .map(([className, count]) => `${className}: ${count}`)
  .join('\n')}

CHARACTER RACE DISTRIBUTION
---------------------------
${Object.entries(analytics.characterRaceDistribution)
  .map(([raceName, count]) => `${raceName}: ${count}`)
  .join('\n')}

ENCOUNTER STATISTICS
--------------------
Total Encounters: ${analytics.encounterStatistics.totalEncounters}
Average Encounter Difficulty: ${analytics.encounterStatistics.averageEncounterDifficulty.toFixed(2)}

ENCOUNTER DIFFICULTY DISTRIBUTION
---------------------------------
${Object.entries(analytics.encounterStatistics.encounterDifficultyDistribution)
  .map(([difficulty, count]) => `${difficulty}: ${count}`)
  .join('\n')}

EXPERIENCE STATISTICS
--------------------
Total Experience Earned: ${analytics.experienceStatistics.totalExperienceEarned}
Average Experience per Character: ${analytics.experienceStatistics.averageExperiencePerCharacter.toFixed(2)}
Level Up Rate: ${(analytics.experienceStatistics.levelUpRate * 100).toFixed(2)}%
    `;
  }
}
