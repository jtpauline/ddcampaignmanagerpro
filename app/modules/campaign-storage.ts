import { Campaign, CampaignStatus, CampaignNote, CampaignLocation } from './campaigns';
import { v4 as uuidv4 } from 'uuid';

export class CampaignStorage {
  private static STORAGE_KEY = 'dnd-campaigns-v1';

  /**
   * Save campaign to local storage
   */
  static saveCampaign(campaign: Campaign): void {
    const campaigns = this.getAllCampaigns();
    
    // Remove existing campaign if it exists
    const existingIndex = campaigns.findIndex(c => c.id === campaign.id);
    if (existingIndex !== -1) {
      campaigns[existingIndex] = campaign;
    } else {
      campaigns.push(campaign);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(campaigns));
  }

  /**
   * Get all campaigns
   */
  static getAllCampaigns(): Campaign[] {
    const campaignsJson = localStorage.getItem(this.STORAGE_KEY);
    return campaignsJson ? JSON.parse(campaignsJson) : [];
  }

  /**
   * Get campaign by ID
   */
  static getCampaignById(campaignId: string): Campaign | undefined {
    const campaigns = this.getAllCampaigns();
    return campaigns.find(campaign => campaign.id === campaignId);
  }

  /**
   * Delete campaign
   */
  static deleteCampaign(campaignId: string): void {
    const campaigns = this.getAllCampaigns();
    const updatedCampaigns = campaigns.filter(campaign => campaign.id !== campaignId);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCampaigns));
  }

  /**
   * Export campaigns to JSON
   */
  static exportCampaigns(): string {
    const campaigns = this.getAllCampaigns();
    return JSON.stringify(campaigns, null, 2);
  }

  /**
   * Import campaigns from JSON
   */
  static importCampaigns(jsonString: string): void {
    try {
      const importedCampaigns: Campaign[] = JSON.parse(jsonString);
      
      // Validate imported campaigns
      const validCampaigns = importedCampaigns.map(campaign => ({
        ...campaign,
        id: campaign.id || uuidv4(),
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        notes: campaign.notes.map(note => ({
          ...note,
          date: new Date(note.date)
        }))
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validCampaigns));
    } catch (error) {
      throw new Error('Invalid campaign import data');
    }
  }
}
