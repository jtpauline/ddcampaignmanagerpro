import { useState } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { CampaignManager } from '~/modules/campaigns';

export const loader = async ({ params }) => {
  const campaignManager = new CampaignManager();
  const campaign = campaignManager.getCampaignById(params.campaignId);

  if (!campaign) {
    throw new Response('Campaign not found', { status: 404 });
  }

  return json({ campaign });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const campaignManager = new CampaignManager();

  switch (intent) {
    case 'add-note':
      const newNote = campaignManager.addCampaignNote(params.campaignId, {
        title: formData.get('title'),
        content: formData.get('content'),
        tags: formData.get('tags')?.split(',')
      });
      return json({ success: true, note: newNote });

    case 'add-location':
      const newLocation = campaignManager.addCampaignLocation(params.campaignId, {
        name: formData.get('name'),
        description: formData.get('description'),
        type: formData.get('type')
      });
      return json({ success: true, location: newLocation });

    case 'update-campaign':
      const updatedCampaign = campaignManager.updateCampaign(params.campaignId, {
        name: formData.get('name'),
        status: formData.get('status'),
        difficulty: formData.get('difficulty')
      });
      return json({ success: true, campaign: updatedCampaign });

    default:
      return json({ success: false, message: 'Invalid action' });
  }
};

export default function CampaignDetailPage() {
  const { campaign } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{campaign.name}</h1>

      {/* Tabs */}
      <div className="flex mb-6">
        {['overview', 'notes', 'locations', 'characters', 'encounters'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Campaign Details</h2>
            <Form method="post">
              <input type="hidden" name="intent" value="update-campaign" />
              <div className="mb-4">
                <label className="block mb-2">Campaign Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={campaign.name} 
                  className="input"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Status</label>
                <select 
                  name="status" 
                  defaultValue={campaign.status} 
                  className="input"
                >
                  {Object.values(CampaignStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Difficulty</label>
                <select 
                  name="difficulty" 
                  defaultValue={campaign.difficulty} 
                  className="input"
                >
                  {Object.values(CampaignDifficulty).map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Update Campaign</button>
            </Form>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Campaign Statistics</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">Characters</h3>
                <p className="text-2xl">{campaign.characters.length}</p>
              </div>
              <div className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">Encounters</h3>
                <p className="text-2xl">{campaign.encounters.length}</p>
              </div>
              <div className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-2xl">{campaign.notes.length}</p>
              </div>
              <div className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">Locations</h3>
                <p className="text-2xl">{campaign.locations.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Campaign Notes</h2>
          <Form method="post" className="mb-6">
            <input type="hidden" name="intent" value="add-note" />
            <div className="mb-4">
              <label className="block mb-2">Note Title</label>
              <input type="text" name="title" className="input" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Note Content</label>
              <textarea name="content" className="input h-32" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Tags (comma-separated)</label>
              <input type="text" name="tags" className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Add Note</button>
          </Form>

          <div className="space-y-4">
            {campaign.notes.map(note => (
              <div key={note.id} className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">{note.title}</h3>
                <p className="text-gray-600">{note.content}</p>
                <div className="mt-2 flex space-x-2">
                  {note.tags?.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {note.date.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Campaign Locations</h2>
          <Form method="post" className="mb-6">
            <input type="hidden" name="intent" value="add-location" />
            <div className="mb-4">
              <label className="block mb-2">Location Name</label>
              <input type="text" name="name" className="input" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Description</label>
              <textarea name="description" className="input h-32" />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Location Type</label>
              <select name="type" className="input">
                <option value="city">City</option>
                <option value="dungeon">Dungeon</option>
                <option value="wilderness">Wilderness</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add Location</button>
          </Form>

          <div className="grid grid-cols-3 gap-4">
            {campaign.locations.map(location => (
              <div key={location.id} className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">{location.name}</h3>
                <p className="text-gray-600">{location.description}</p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-2 inline-block">
                  {location.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for future tabs */}
      {['characters', 'encounters'].includes(activeTab) && (
        <div className="text-center text-gray-500">
          <p>Coming Soon: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</p>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="container mx-auto p-6 bg-red-100">
      <h1 className="text-2xl font-bold text-red-800">Campaign Not Found</h1>
      <p>The campaign you are looking for does not exist.</p>
    </div>
  );
}
