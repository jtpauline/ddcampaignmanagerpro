import { useState } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Form, useNavigate } from '@remix-run/react';
import { CampaignManager } from '~/modules/campaigns';
import { CharacterManager, CharacterClass, CharacterRace, Character } from '~/modules/characters';
import { CharacterSheetGenerator } from '~/modules/utils/character-sheet-generator';
import { CharacterValidation, ValidationError } from '~/modules/utils/character-validation';
import { CharacterExportManager } from '~/modules/utils/character-export';

export const loader = async ({ params }) => {
  const campaignManager = new CampaignManager();
  const characterManager = new CharacterManager();
  
  const campaign = campaignManager.getCampaignById(params.campaignId);
  if (!campaign) {
    throw new Response('Campaign not found', { status: 404 });
  }

  const characters = characterManager.getCharactersByCampaign(params.campaignId);

  return json({ 
    campaign, 
    characters,
    characterGenerationMethods: ['standard', 'heroic', 'elite']
  });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const characterManager = new CharacterManager();
  const campaignManager = new CampaignManager();

  try {
    switch (intent) {
      case 'create-character':
        const newCharacterData = {
          name: formData.get('name'),
          race: formData.get('race'),
          class: formData.get('class'),
          campaignId: params.campaignId
        };

        // Validate character creation
        const creationErrors = CharacterValidation.validateCharacterCreation(newCharacterData);
        if (creationErrors.length > 0) {
          return json({ 
            success: false, 
            errors: creationErrors 
          }, { status: 400 });
        }

        const newCharacter = characterManager.createCharacter(
          newCharacterData, 
          formData.get('generationMethod') as 'standard' | 'heroic' | 'elite'
        );

        // Update campaign to include new character
        const campaign = campaignManager.getCampaignById(params.campaignId);
        if (campaign) {
          campaign.characters.push(newCharacter.id);
          campaignManager.updateCampaign(campaign.id, campaign);
        }

        return json({ success: true, character: newCharacter });

      case 'level-up':
        const characterId = formData.get('characterId');
        const character = characterManager.getCharacterById(characterId);
        
        // Validate level up
        const levelUpErrors = CharacterValidation.validateLevelUp(character);
        if (levelUpErrors.length > 0) {
          return json({ 
            success: false, 
            errors: levelUpErrors 
          }, { status: 400 });
        }

        const leveledCharacter = characterManager.levelUpCharacter(characterId);
        return json({ success: true, character: leveledCharacter });

      case 'update-background':
        const backgroundCharacterId = formData.get('characterId');
        const backgroundData = {
          backstory: formData.get('backstory')?.toString(),
          personality: formData.get('personality')?.toString().split(','),
          ideals: formData.get('ideals')?.toString().split(','),
          bonds: formData.get('bonds')?.toString().split(','),
          flaws: formData.get('flaws')?.toString().split(',')
        };

        // Validate background
        const backgroundErrors = CharacterValidation.validateCharacterBackground(backgroundData);
        if (backgroundErrors.length > 0) {
          return json({ 
            success: false, 
            errors: backgroundErrors 
          }, { status: 400 });
        }

        const updatedCharacter = characterManager.updateCharacterBackground(
          backgroundCharacterId, 
          backgroundData
        );
        return json({ success: true, character: updatedCharacter });

      case 'export-character':
        const exportCharacterId = formData.get('characterId');
        const characterToExport = characterManager.getCharacterById(exportCharacterId);
        
        const exportedCharacter = CharacterExportManager.exportCharacter(characterToExport);
        const exportFilename = CharacterExportManager.generateExportFilename(characterToExport);

        return json({ 
          success: true, 
          exportData: exportedCharacter,
          filename: exportFilename
        });

      default:
        return json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Character Management Error:', error);
    return json({ 
      success: false, 
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
};

// Rest of the component remains the same as in the previous implementation
export default function CampaignCharactersPage() {
  // ... (previous implementation)
}
