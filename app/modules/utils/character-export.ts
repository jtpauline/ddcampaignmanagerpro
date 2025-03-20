import { Character } from '../characters';
import { CharacterValidationSystem } from './character-validation';
import { v4 as uuidv4 } from 'uuid';

export interface ExportFormat {
  version: string;
  exportId: string;
  timestamp: number;
  character: Partial<Character>;
  metadata: {
    validationResult: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
    exportVersion: string;
  };
}

export class CharacterExportSystem {
  /**
   * Advanced character export with comprehensive validation
   * @param character Character to export
   * @returns Exported character data or validation errors
   */
  static exportCharacter(character: Character): {
    success: boolean;
    data?: ExportFormat;
    errors?: string[];
  } {
    // Comprehensive validation before export
    const validationResult = CharacterValidationSystem.validateCharacter(character);
    
    if (!validationResult.isValid) {
      return {
        success: false,
        errors: validationResult.errors
      };
    }

    // Prepare export format with enhanced metadata
    const exportData: ExportFormat = {
      version: '1.1.0',
      exportId: uuidv4(),
      timestamp: Date.now(),
      character: this.sanitizeCharacterData(character),
      metadata: {
        validationResult: {
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        },
        exportVersion: '1.1.0'
      }
    };

    return {
      success: true,
      data: exportData
    };
  }

  /**
   * Advanced character import with comprehensive validation
   * @param exportData Exported character data
   * @returns Imported character or validation errors
   */
  static importCharacter(exportData: ExportFormat): {
    success: boolean;
    character?: Character;
    errors?: string[];
  } {
    // Version compatibility check
    if (exportData.version !== '1.1.0') {
      return {
        success: false,
        errors: ['Incompatible export version']
      };
    }

    // Export age validation
    const MAX_EXPORT_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year
    if (Date.now() - exportData.timestamp > MAX_EXPORT_AGE) {
      return {
        success: false,
        errors: ['Export data is too old']
      };
    }

    // Reconstruct character
    const importedCharacter = {
      ...exportData.character,
      id: uuidv4() // Generate new unique ID
    } as Character;

    // Validate imported character
    const validationResult = CharacterValidationSystem.validateCharacter(importedCharacter);
    
    if (!validationResult.isValid) {
      return {
        success: false,
        errors: validationResult.errors
      };
    }

    return {
      success: true,
      character: importedCharacter
    };
  }

  /**
   * Enhanced character data sanitization
   * @param character Character to sanitize
   * @returns Sanitized character data
   */
  private static sanitizeCharacterData(character: Character): Partial<Character> {
    const { 
      // Exclude sensitive or unnecessary fields
      id, 
      status, 
      campaignId,
      ...sanitizedCharacter 
    } = character;

    return {
      ...sanitizedCharacter,
      exportedAt: Date.now()
    };
  }

  /**
   * Advanced character backup mechanism
   * @param character Character to backup
   * @returns Backup data
   */
  static createCharacterBackup(character: Character): {
    success: boolean;
    backup?: ExportFormat;
    errors?: string[];
  } {
    const exportResult = this.exportCharacter(character);
    
    if (!exportResult.success) {
      return exportResult;
    }

    // Additional backup-specific processing
    return {
      success: true,
      backup: {
        ...exportResult.data!,
        metadata: {
          ...exportResult.data!.metadata,
          backupType: 'full'
        }
      }
    };
  }

  /**
   * Restore character from backup with advanced validation
   * @param backupData Backup data
   * @returns Restored character
   */
  static restoreCharacterFromBackup(backupData: ExportFormat): {
    success: boolean;
    character?: Character;
    errors?: string[];
  } {
    // Validate backup type
    if (backupData.metadata.backupType !== 'full') {
      return {
        success: false,
        errors: ['Invalid backup type']
      };
    }

    // Import character
    return this.importCharacter(backupData);
  }
}
