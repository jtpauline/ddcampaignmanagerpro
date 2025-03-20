export class DiceRoller {
  /**
   * Roll a specified number of dice with given sides
   * @param numberOfDice Number of dice to roll
   * @param sides Number of sides on each die
   * @returns Total roll result
   */
  static roll(numberOfDice: number, sides: number): number {
    let total = 0;
    for (let i = 0; i < numberOfDice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }

  /**
   * Roll with advantage (roll twice, take highest)
   * @param sides Number of sides on the die
   * @returns Highest roll
   */
  static rollWithAdvantage(sides: number): number {
    const roll1 = Math.floor(Math.random() * sides) + 1;
    const roll2 = Math.floor(Math.random() * sides) + 1;
    return Math.max(roll1, roll2);
  }

  /**
   * Roll with disadvantage (roll twice, take lowest)
   * @param sides Number of sides on the die
   * @returns Lowest roll
   */
  static rollWithDisadvantage(sides: number): number {
    const roll1 = Math.floor(Math.random() * sides) + 1;
    const roll2 = Math.floor(Math.random() * sides) + 1;
    return Math.min(roll1, roll2);
  }

  /**
   * Generate random encounter difficulty
   * @param partyLevel Average party level
   * @returns Encounter difficulty
   */
  static generateEncounterDifficulty(partyLevel: number): 'Easy' | 'Medium' | 'Hard' | 'Deadly' {
    const difficultyRoll = this.roll(1, 20);
    
    if (difficultyRoll <= 5) return 'Easy';
    if (difficultyRoll <= 10) return 'Medium';
    if (difficultyRoll <= 15) return 'Hard';
    return 'Deadly';
  }
}
