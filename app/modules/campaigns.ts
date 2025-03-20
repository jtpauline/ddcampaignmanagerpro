import { v4 as uuidv4 } from 'uuid';
import { CampaignStorage } from './campaign-storage';
import { CampaignAnalyzer } from './campaign-analytics';

export enum CampaignStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned'
}

export enum CampaignDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EPIC = 'Epic'
}

export interface Campaign {
  id: string;
  name: string;
  dungeon_master: string;
  status: CampaignStatus;
  difficulty: CampaignDifficulty;
  startDate: Date;
  endDate?: Date;
  characters: string[]; // Character IDs
  encounters: string[]; // Encounter IDs
  notes: CampaignNote[];
  locations: CampaignLocation[];
  settings?: CampaignSettings;
}

export interface CampaignNote {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags?: string[];
}

export interface CampaignLocation {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'dungeon' | 'wilderness' | 'other';
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface CampaignSettings {
  ruleset?: string;
  homebrewRules?: string[];
  sessionFrequency?: 'weekly' | 'biweekly' | 'monthly';
  maxPlayers?: number;
}

export class CampaignManager {
  /**
   * Create a new campaign
   */
  createCampaign(campaignData: Partial<Campaign>): Campaign {
    const newCampaign: Campaign = {
      id: uuidv4(),
      name: campaignData.name || 'Untitled Campaign',
      dungeon_master: campaignData.dungeon_master || 'Unknown DM',
      status: campaignData.status || CampaignStatus.PLANNING,
      difficulty: campaignData.difficulty || CampaignDifficulty.MEDIUM,
      startDate: new Date(),
      characters: [],
      encounters: [],
      notes: [],
      locations: [],
      settings: campaignData.settings
    };

    CampaignStorage.saveCampaign(newCampaign);
    return newCampaign;
  }

  /**
   * Update an existing campaign
   */
  updateCampaign(campaignId: string, updates: Partial<Campaign>): Campaign {
    const campaign = CampaignStorage.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const updatedCampaign = {
      ...campaign,
      ...updates,
      id: campaign.id // Ensure ID remains the same
    };

    CampaignStorage.saveCampaign(updatedCampaign);
    return updatedCampaign;
  }

  /**
   * Delete a campaign
   */
  deleteCampaign(campaignId: string): void {
    CampaignStorage.deleteCampaign(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): Campaign[] {
    return CampaignStorage.getAllCampaigns();
  }

  /**
   * Get campaign by ID
   */
  getCampaignById(campaignId: string): Campaign | undefined {
    return CampaignStorage.getCampaignById(campaignId);
  }

  /**
   * Add a note to a campaign
   */
  addCampaignNote(campaignId: string, note: Partial<CampaignNote>): CampaignNote {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const newNote: CampaignNote = {
      id: uuidv4(),
      title: note.title || 'Untitled Note',
      content: note.content || '',
      date: new Date(),
      tags: note.tags || []
    };

    campaign.notes.push(newNote);
    CampaignStorage.saveCampaign(campaign);
    return newNote;
  }

  /**
   * Add a location to a campaign
   */
  addCampaignLocation(campaignId: string, location: Partial<CampaignLocation>): CampaignLocation {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const newLocation: CampaignLocation = {
      id: uuidv4(),
      name: location.name || 'Unnamed Location',
      description: location.description || '',
      type: location.type || 'other',
      coordinates: location.coordinates
    };

    campaign.locations.push(newLocation);
    CampaignStorage.saveCampaign(campaign);
    return newLocation;
  }

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics() {
    return CampaignAnalyzer.generateAnalytics();
  }

  /**
   * Export all campaigns to JSON
   */
  exportCampaigns(): string {
    return CampaignStorage.exportCampaigns();
  }

  /**
   * Import campaigns from JSON
   */
  importCampaigns(jsonString: string): void {
    CampaignStorage.importCampaigns(jsonString);
  }

  /**
   * Get campaign progression report
   */
  getCampaignProgressionReport(campaignId: string) {
    return CampaignAnalyzer.generateProgressionReport(campaignId);
  }
}
