import { Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import { CampaignManager } from '~/modules/campaigns';

export const loader = async () => {
  const campaignManager = new CampaignManager();
  const campaigns = campaignManager.getAllCampaigns();
  const analytics = campaignManager.getCampaignAnalytics();

  return json({ campaigns, analytics });
};

export default function CampaignsIndexPage() {
  const { campaigns, analytics } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Campaigns</h1>
        <Link to="/campaigns/new" className="btn btn-primary">
          Create New Campaign
        </Link>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map(campaign => (
          <Link 
            to={`/campaigns/${campaign.id}`} 
            key={campaign.id} 
            className="bg-white shadow rounded p-4 hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">{campaign.name}</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">DM: {campaign.dungeon_master}</span>
              <span 
                className={`px-2 py-1 rounded text-xs ${
                  campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {campaign.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-xl mb-4">No campaigns yet</p>
          <p>Create your first campaign and start your adventure!</p>
        </div>
      )}
    </div>
  );
}
