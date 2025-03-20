import { Campaign, CampaignStatus } from './campaigns';
import { CampaignStorage } from './campaign-storage';

export interface CampaignAnalytics {
  totalCampaigns: number;
  campaignStatusBreakdown: {
    [key in CampaignStatus]: number;
  };
  averageCampaignDuration: number;
  mostActiveYear: number;
}

export class CampaignAnalyzer {
  /**
   * Generate comprehensive campaign analytics
   */
  static generateAnalytics(): CampaignAnalytics {
    const campaigns = CampaignStorage.getAllCampaigns();

    return {
      totalCampaigns: campaigns.length,
      campaignStatusBreakdown: this.calculateStatusBreakdown(campaigns),
      averageCampaignDuration: this.calculateAverageDuration(campaigns),
      mostActiveYear: this.findMostActiveYear(campaigns)
    };
  }

  /**
   * Calculate campaign status breakdown
   */
  private static calculateStatusBreakdown(campaigns: Campaign[]): 
    {[key in CampaignStatus]: number} {
    return campaigns.reduce((breakdown, campaign) => {
      breakdown[campaign.status] = (breakdown[campaign.status] || 0) + 1;
      return breakdown;
    }, {} as {[key in CampaignStatus]: number});
  }

  /**
   * Calculate average campaign duration in days
   */
  private static calculateAverageDuration(campaigns: Campaign[]): number {
    const completedCampaigns = campaigns.filter(
      campaign => campaign.startDate && campaign.endDate
    );

    if (completedCampaigns.length === 0) return 0;

    const totalDuration = completedCampaigns.reduce((total, campaign) => {
      const duration = campaign.endDate 
        ? (campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 3600 * 24)
        : 0;
      return total + duration;
    }, 0);

    return totalDuration / completedCampaigns.length;
  }

  /**
   * Find the most active year for campaigns
   */
  private static findMostActiveYear(campaigns: Campaign[]): number {
    const yearCounts = campaigns.reduce((counts, campaign) => {
      const year = campaign.startDate.getFullYear();
      counts[year] = (counts[year] || 0) + 1;
      return counts;
    }, {} as {[year: number]: number});

    return Object.entries(yearCounts).reduce((mostActive, [year, count]) => 
      count > yearCounts[mostActive] ? parseInt(year) : mostActive, 
      campaigns[0]?.startDate.getFullYear() || new Date().getFullYear()
    );
  }

  /**
   * Generate campaign progression report
   */
  static generateProgressionReport(campaignId: string) {
    const campaign = CampaignStorage.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return {
      characterProgression: campaign.characters.map(characterId => ({
        characterId,
        // You would call CharacterManager to get detailed progression
      })),
      encounterCompletion: {
        total: campaign.encounters.length,
        completed: campaign.encounters.filter(encounterId => 
          // You would call EncounterManager to check completion status
          true
        ).length
      },
      notesCount: campaign.notes.length,
      locationsDiscovered: campaign.locations.length
    };
  }
}
