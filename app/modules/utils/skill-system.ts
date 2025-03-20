import { Character } from '../characters';

export interface SkillDefinition {
  name: string;
  relatedAbility: keyof Character['abilityScores'];
  description: string;
}

export interface SkillProgression {
  [characterClass: string]: {
    skillPointsPerLevel: number;
    classSkills: string[];
  };
}

export class SkillSystem {
  /**
   * Comprehensive skill definitions
   */
  private static skillDefinitions: SkillDefinition[] = [
    { 
      name: 'Acrobatics', 
      relatedAbility: 'dexterity', 
      description: 'Represents physical agility and balance' 
    },
    { 
      name: 'Arcana', 
      relatedAbility: 'intelligence', 
      description: 'Knowledge of magical and mystical lore' 
    },
    { 
      name: 'Athletics', 
      relatedAbility: 'strength', 
      description: 'Physical prowess and athletic capabilities' 
    },
    { 
      name: 'Deception', 
      relatedAbility: 'charisma', 
      description: 'Ability to mislead and lie convincingly' 
    },
    { 
      name: 'Insight', 
      relatedAbility: 'wisdom', 
      description: 'Perception of motives and emotional states' 
    }
    // Add more skills as needed
  ];

  /**
   * Skill progression rules by character class
   */
  private static skillProgression: SkillProgression = {
    'Rogue': {
      skillPointsPerLevel: 4,
      classSkills: ['Acrobatics', 'Deception', 'Stealth']
    },
    'Wizard': {
      skillPointsPerLevel: 2,
      classSkills: ['Arcana', 'History', 'Investigation']
    },
    'Fighter': {
      skillPointsPerLevel: 2,
      classSkills: ['Athletics', 'Intimidation']
    }
  };

  /**
   * Improve character skills on level up
   * @param character Character to improve skills for
   */
  static improveSkillsOnLevelUp(character: Character): void {
    const classProgression = this.skillProgression[character.class];
    if (!classProgression) return;

    // Initialize skills if not exists
    if (!character.skills) {
      character.skills = {};
    }

    // Allocate skill points
    const skillPointsToAllocate = classProgression.skillPointsPerLevel;
    
    // Prioritize class skills
    classProgression.classSkills.forEach(skillName => {
      const currentSkillLevel = character.skills[skillName] || 0;
      character.skills[skillName] = Math.min(currentSkillLevel + 1, 5);
    });
  }

  /**
   * Calculate skill check modifier
   * @param character Character performing skill check
   * @param skillName Skill to check
   * @returns Skill check modifier
   */
  static calculateSkillCheckModifier(
    character: Character, 
    skillName: string
  ): number {
    const skill = this.skillDefinitions.find(s => s.name === skillName);
    if (!skill) return 0;

    const abilityScore = character.abilityScores[skill.relatedAbility];
    const abilityModifier = Math.floor((abilityScore - 10) / 2);
    const skillLevel = character.skills?.[skillName] || 0;

    // Proficiency bonus calculation
    const proficiencyBonus = Math.ceil(character.level / 4);

    return abilityModifier + (skillLevel * proficiencyBonus);
  }

  /**
   * Determine skill proficiencies
   * @param character Character to analyze
   * @returns Proficient skills
   */
  static determineProficientSkills(character: Character): string[] {
    const classProgression = this.skillProgression[character.class];
    return classProgression ? classProgression.classSkills : [];
  }

  /**
   * Perform skill challenge
   * @param character Character performing skill challenge
   * @param skillName Skill to challenge
   * @param difficulty Difficulty class
   * @returns Success of skill challenge
   */
  static performSkillChallenge(
    character: Character, 
    skillName: string, 
    difficulty: number
  ): {
    success: boolean;
    rollResult: number;
    modifier: number;
  } {
    const modifier = this.calculateSkillCheckModifier(character, skillName);
    const rollResult = Math.floor(Math.random() * 20) + 1 + modifier;

    return {
      success: rollResult >= difficulty,
      rollResult,
      modifier
    };
  }
}
