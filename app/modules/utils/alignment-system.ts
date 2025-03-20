import { Character } from '../characters';

export enum AlignmentAxis {
  LAWFUL = 'Lawful',
  NEUTRAL = 'Neutral',
  CHAOTIC = 'Chaotic',
  GOOD = 'Good',
  EVIL = 'Evil'
}

export interface Alignment {
  moral: AlignmentAxis;
  ethical: AlignmentAxis;
}

export class AlignmentSystem {
  /**
   * Comprehensive alignment definitions
   */
  private static alignmentDefinitions: Record<string, Alignment> = {
    'Lawful Good': {
      moral: AlignmentAxis.GOOD,
      ethical: AlignmentAxis.LAWFUL
    },
    'Neutral Good': {
      moral: AlignmentAxis.GOOD,
      ethical: AlignmentAxis.NEUTRAL
    },
    'Chaotic Good': {
      moral: AlignmentAxis.GOOD,
      ethical: AlignmentAxis.CHAOTIC
    },
    'Lawful Neutral': {
      moral: AlignmentAxis.NEUTRAL,
      ethical: AlignmentAxis.LAWFUL
    },
    'True Neutral': {
      moral: AlignmentAxis.NEUTRAL,
      ethical: AlignmentAxis.NEUTRAL
    },
    'Chaotic Neutral': {
      moral: AlignmentAxis.NEUTRAL,
      ethical: AlignmentAxis.CHAOTIC
    },
    'Lawful Evil': {
      moral: AlignmentAxis.EVIL,
      ethical: AlignmentAxis.LAWFUL
    },
    'Neutral Evil': {
      moral: AlignmentAxis.EVIL,
      ethical: AlignmentAxis.NEUTRAL
    },
    'Chaotic Evil': {
      moral: AlignmentAxis.EVIL,
      ethical: AlignmentAxis.CHAOTIC
    }
  };

  /**
   * Assign alignment to character
   * @param character Character to assign alignment to
   * @param alignmentName Alignment name
   * @returns Alignment assignment result
   */
  static assignAlignment(
    character: Character, 
    alignmentName: string
  ): {
    success: boolean;
    errors: string[];
    alignment?: Alignment;
  } {
    const alignment = this.alignmentDefinitions[alignmentName];
    
    if (!alignment) {
      return {
        success: false,
        errors: ['Invalid alignment']
      };
    }

    character.alignment = alignment;

    return {
      success: true,
      errors: [],
      alignment
    };
  }

  /**
   * Calculate alignment shift based on character actions
   * @param character Character whose alignment might shift
   * @param action Character action
   * @returns Alignment shift result
   */
  static calculateAlignmentShift(
    character: Character, 
    action: {
      type: 'moral' | 'ethical';
      severity: 'minor' | 'moderate' | 'major';
      direction: 'good' | 'evil' | 'lawful' | 'chaotic';
    }
  ): {
    alignmentChanged: boolean;
    newAlignment?: Alignment;
  } {
    if (!character.alignment) {
      return { alignmentChanged: false };
    }

    let newAlignment = { ...character.alignment };
    let alignmentChanged = false;

    // Alignment shift logic
    const shiftThresholds = {
      'minor': 0.2,
      'moderate': 0.5,
      'major': 0.8
    };

    const shiftSeverity = shiftThresholds[action.severity];

    if (action.type === 'moral') {
      if (action.direction === 'good' && newAlignment.moral !== AlignmentAxis.GOOD) {
        newAlignment.moral = this.calculateAxisShift(newAlignment.moral, AlignmentAxis.GOOD, shiftSeverity);
        alignmentChanged = true;
      } else if (action.direction === 'evil' && newAlignment.moral !== AlignmentAxis.EVIL) {
        newAlignment.moral = this.calculateAxisShift(newAlignment.moral, AlignmentAxis.EVIL, shiftSeverity);
        alignmentChanged = true;
      }
    } else if (action.type === 'ethical') {
      if (action.direction === 'lawful' && newAlignment.ethical !== AlignmentAxis.LAWFUL) {
        newAlignment.ethical = this.calculateAxisShift(newAlignment.ethical, AlignmentAxis.LAWFUL, shiftSeverity);
        alignmentChanged = true;
      } else if (action.direction === 'chaotic' && newAlignment.ethical !== AlignmentAxis.CHAOTIC) {
        newAlignment.ethical = this.calculateAxisShift(newAlignment.ethical, AlignmentAxis.CHAOTIC, shiftSeverity);
        alignmentChanged = true;
      }
    }

    if (alignmentChanged) {
      character.alignment = newAlignment;
    }

    return {
      alignmentChanged,
      newAlignment: alignmentChanged ? newAlignment : undefined
    };
  }

  /**
   * Calculate axis shift based on severity
   * @param currentAxis Current alignment axis
   * @param targetAxis Target alignment axis
   * @param severity Shift severity
   * @returns New alignment axis
   */
  private static calculateAxisShift(
    currentAxis: AlignmentAxis, 
    targetAxis: AlignmentAxis, 
    severity: number
  ): AlignmentAxis {
    const axisOrder = [
      AlignmentAxis.LAWFUL, 
      AlignmentAxis.NEUTRAL, 
      AlignmentAxis.CHAOTIC
    ];

    const currentIndex = axisOrder.indexOf(currentAxis);
    const targetIndex = axisOrder.indexOf(targetAxis);

    // Determine shift direction
    const shiftDirection = currentIndex < targetIndex ? 1 : -1;

    // Calculate new index based on severity
    const newIndex = currentIndex + (shiftDirection * Math.ceil(severity));

    // Ensure index stays within bounds
    const clampedIndex = Math.max(0, Math.min(newIndex, axisOrder.length - 1));

    return axisOrder[clampedIndex];
  }

  /**
   * Get alignment description
   * @param alignment Alignment to describe
   * @returns Alignment description
   */
  static getAlignmentDescription(alignment: Alignment): string {
    const alignmentName = Object.entries(this.alignmentDefinitions)
      .find(([, def]) => 
        def.moral === alignment.moral && 
        def.ethical === alignment.ethical
      )?.[0];

    const descriptions = {
      'Lawful Good': 'Follows rules and helps others, always striving to do what is right.',
      'Neutral Good': 'Does good without bias for or against order.',
      'Chaotic Good': 'Acts as their conscience directs, with little regard for what others expect.',
      'Lawful Neutral': 'Acts according to law, tradition, or personal code.',
      'True Neutral': 'Acts naturally, without prejudice or compulsion.',
      'Chaotic Neutral': 'Follows their whims, holding their personal freedom above all else.',
      'Lawful Evil': 'Methodically takes what they want, within the limits of code of tradition.',
      'Neutral Evil': 'Does whatever they can get away with.',
      'Chaotic Evil': 'Acts with arbitrary violence, spurred by greed, hatred, or bloodlust.'
    };

    return descriptions[alignmentName] || 'No specific description available.';
  }
}
