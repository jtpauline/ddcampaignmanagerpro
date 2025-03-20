import { useState } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { CampaignManager } from '~/modules/campaigns';
import { EncounterManager, EncounterType, EncounterDifficulty } from '~/modules/encounters';
import { CharacterManager } from '~/modules/characters';

export const loader = async ({ params }) => {
  const campaignManager = new CampaignManager();
  const encounterManager = new EncounterManager();
  const characterManager = new CharacterManager();
  
  const campaign = campaignManager.getCampaignById(params.campaignId);
  if (!campaign) {
    throw new Response('Campaign not found', { status: 404 });
  }

  const encounters = encounterManager.getEncountersByCampaign(params.campaignId);
  const characters = characterManager.getCharactersByCampaign(params.campaignId);

  return json({ campaign, encounters, characters });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const encounterManager = new EncounterManager();
  const campaignManager = new CampaignManager();

  switch (intent) {
    case 'create-encounter':
      const newEncounter = encounterManager.createEncounter({
        name: formData.get('name'),
        description: formData.get('description'),
        type: formData.get('type'),
        difficulty: formData.get('difficulty'),
        campaignId: params.campaignId,
        characters: formData.getAll('characters')
      });

      // Update campaign to include new encounter
      const campaign = campaignManager.getCampaignById(params.campaignId);
      if (campaign) {
        campaign.encounters.push(newEncounter.id);
        campaignManager.updateCampaign(campaign.id, campaign);
      }

      return json({ success: true, encounter: newEncounter });

    case 'add-enemy':
      const encounterId = formData.get('encounterId');
      const newEnemy = encounterManager.addEncounterEnemy(encounterId, {
        name: formData.get('name'),
        hitPoints: Number(formData.get('hitPoints')),
        armorClass: Number(formData.get('armorClass')),
        challengeRating: Number(formData.get('challengeRating'))
      });

      return json({ success: true, enemy: newEnemy });

    case 'complete-encounter':
      const completedEncounterId = formData.get('encounterId');
      const completedEncounter = encounterManager.completeEncounter(completedEncounterId);

      return json({ success: true, encounter: completedEncounter });

    default:
      return json({ success: false, message: 'Invalid action' });
  }
};

export default function CampaignEncountersPage() {
  const { campaign, encounters, characters } = useLoaderData<typeof loader>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Encounters in {campaign.name}
        </h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Create Encounter
        </button>
      </div>

      {/* Encounter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {encounters.map(encounter => (
          <div 
            key={encounter.id} 
            className="bg-white shadow rounded p-4 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{encounter.name}</h2>
              <span 
                className={`text-xs px-2 py-1 rounded ${
                  encounter.completed ? 'bg-green-100 text-green-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                {encounter.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-semibold">{encounter.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Difficulty</p>
                <p className="font-semibold">{encounter.difficulty}</p>
              </div>
              <div>
                <p className="text-gray-600">Enemies</p>
                <p className="font-semibold">{encounter.enemies.length}</p>
              </div>
              <div>
                <p className="text-gray-600">XP</p>
                <p className="font-semibold">{encounter.experience}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button 
                onClick={() => setSelectedEncounter(encounter)}
                className="btn btn-sm btn-secondary"
              >
                Manage Encounter
              </button>
              <Form method="post">
                <input type="hidden" name="intent" value="complete-encounter" />
                <input type="hidden" name="encounterId" value={encounter.id} />
                <button 
                  type="submit" 
                  className="btn btn-sm btn-outline"
                  disabled={encounter.completed}
                >
                  Complete
                </button>
              </Form>
            </div>
          </div>
        ))}
      </div>

      {/* Create Encounter Modal */}
      {isCreateModalOpen && (
        <div className="modal">
          <Form method="post" className="modal-content">
            <input type="hidden" name="intent" value="create-encounter" />
            <h2 className="text-xl mb-4">Create New Encounter</h2>
            <div className="mb-4">
              <label className="block mb-2">Encounter Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Description</label>
              <textarea 
                name="description" 
                className="input h-24"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Encounter Type</label>
              <select name="type" required className="input">
                {Object.values(EncounterType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Difficulty</label>
              <select name="difficulty" required className="input">
                {Object.values(EncounterDifficulty).map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Characters</label>
              <div className="grid grid-cols-2 gap-2">
                {characters.map(character => (
                  <label key={character.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="characters" 
                      value={character.id} 
                      className="mr-2"
                    />
                    {character.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Create Encounter
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Encounter Management Modal */}
      {selectedEncounter && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-2xl font-bold mb-4">{selectedEncounter.name}</h2>
            
            {/* Add Enemy Form */}
            <Form method="post" className="mb-6">
              <input type="hidden" name="intent" value="add-enemy" />
              <input type="hidden" name="encounterId" value={selectedEncounter.id} />
              <h3 className="text-xl mb-4">Add Enemy</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Enemy Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className="input"
                  />
                </div>
                <div>
                  <label className="block mb-2">Hit Points</label>
                  <input 
                    type="number" 
                    name="hitPoints" 
                    required 
                    className="input"
                  />
                </div>
                <div>
                  <label className="block mb-2">Armor Class</label>
                  <input 
                    type="number" 
                    name="armorClass" 
                    required 
                    className="input"
                  />
                </div>
                <div>
                  <label className="block mb-2">Challenge Rating</label>
                  <input 
                    type="number" 
                    name="challengeRating" 
                    step="0.25" 
                    required 
                    className="input"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Add Enemy
                </button>
              </div>
            </Form>

            {/* Enemy List */}
            <div>
              <h3 className="text-xl mb-4">Enemies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEncounter.enemies.map(enemy => (
                  <div 
                    key={enemy.id} 
                    className="bg-gray-100 rounded p-3"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{enemy.name}</h4>
                      <span className="text-sm text-gray-600">
                        CR: {enemy.challengeRating}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      <div>
                        <p className="text-xs text-gray-600">HP</p>
                        <p>{enemy.hitPoints}Continuing from the previous response:

                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">AC</p>
                        <p>{enemy.armorClass}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button 
                onClick={() => setSelectedEncounter(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {encounters.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-xl mb-4">No encounters yet</p>
          <p>Create your first encounter for this campaign!</p>
        </div>
      )}
    </div>
  );
}
