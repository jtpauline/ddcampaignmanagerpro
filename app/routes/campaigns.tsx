import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { CampaignManager } from '~/modules/campaigns';
import { CampaignAnalyzer } from '~/modules/campaign-analytics';

export const loader = async () => {
  const campaignManager = new CampaignManager();
  const campaigns = campaignManager.getAllCampaigns();
  const analytics = campaignManager.getCampaignAnalytics();

  return json({ campaigns, analytics });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const campaignManager = new CampaignManager();

  switch (intent) {
    case 'create':
      const newCampaign = campaignManager.createCampaign({
        name: formData.get('name'),
        dungeon_master: formData.get('dungeon_master'),
        difficulty: formData.get('difficulty')
      });
      return json({ success: true, campaign: newCampaign });

    case 'delete':
      const campaignId = formData.get('campaignId');
      campaignManager.deleteCampaign(campaignId);
      return json({ success: true });

    case 'export':
      const exportedCampaigns = campaignManager.exportCampaigns();
      return json({ 
        success: true, 
        exportedData: exportedCampaigns 
      });

    case 'import':
      const importData = formData.get('importData');
      campaignManager.importCampaigns(importData);
      return json({ success: true });

    default:
      return json({ success: false, message: 'Invalid action' });
  }
};

export default function CampaignsPage() {
  const { campaigns, analytics } = useLoaderData<typeof loader>();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Campaign Management</h1>

      {/* Analytics Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Campaigns</h2>
          <p className="text-2xl">{analytics.totalCampaigns}</p>
        </div>
        {Object.entries(analytics.campaignStatusBreakdown).map(([status, count]) => (
          <div key={status} className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold">{status} Campaigns</h2>
            <p className="text-2xl">{count}</p>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="bg-white shadow rounded">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Your Campaigns</h2>
          <div className="space-x-2">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Create Campaign
            </button>
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="btn btn-secondary"
            >
              Export Campaigns
            </button>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="btn btn-secondary"
            >
              Import Campaigns
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">DM</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(campaign => (
              <tr key={campaign.id} className="border-b">
                <td className="p-3">{campaign.name}</td>
                <td className="p-3">{campaign.dungeon_master}</td>
                <td className="p-3">{campaign.status}</td>
                <td className="p-3">
                  <button 
                    onClick={() => setSelectedCampaign(campaign)}
                    className="btn btn-sm btn-outline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="modal">
          <Form method="post" className="modal-content">
            <input type="hidden" name="intent" value="create" />
            <h2 className="text-xl mb-4">Create New Campaign</h2>
            <input 
              type="text" 
              name="name" 
              placeholder="Campaign Name" 
              required 
              className="input mb-2"
            />
            <input 
              type="text" 
              name="dungeon_master" 
              placeholder="Dungeon Master" 
              required 
              className="input mb-2"
            />
            <select 
              name="difficulty" 
              required 
              className="input mb-4"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
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
                Create Campaign
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Export Campaigns Modal */}
      {isExportModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl mb-4">Export Campaigns</h2>
            <textarea 
              readOnly 
              value={campaigns.length > 0 ? JSON.stringify(campaigns, null, 2) : 'No campaigns to export'}
              className="w-full h-64 p-2 border rounded"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(campaigns, null, 2));
                  alert('Campaigns copied to clipboard!');
                }}
                className="btn btn-primary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Campaigns Modal */}
      {isImportModalOpen && (
        <div className="modal">
          <Form method="post" className="modal-content">
            <input type="hidden" name="intent" value="import" />
            <h2 className="text-xl mb-4">Import Campaigns</h2>
            <textarea 
              name="importData"
              placeholder="Paste exported campaign JSON here"
              className="w-full h-64 p-2 border rounded mb-4"
              required
            />
            <div className="flex justify-end space-x-2">
              <button 
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Import Campaigns
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-2xl font-bold mb-4">{selectedCampaign.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Dungeon Master</h3>
                <p>{selectedCampaign.dungeon_master}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <p>{selectedCampaign.status}</p>
              </div>
              <div>
                <h3 className="font-semibold">Characters</h3>
                <p>{selectedCampaign.characters?.length || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold">Encounters</h3>
                <p>{selectedCampaign.encounters?.length || 0}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="container mx-auto p-6 bg-red-100">
      <h1 className="text-2xl font-bold text-red-800">Something went wrong</h1>
      <p>There was an error processing your campaign request.</p>
    </div>
  );
}
