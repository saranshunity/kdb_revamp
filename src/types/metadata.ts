export interface AppMetadata {
  version: string;
  updateRequired: boolean;
  updateMessage: string;
  updateTitle: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  features: FeatureConfig;
  announcements: Announcement[];
  lastUpdated: string;
}

export interface FeatureConfig {
  tirthMitra: {
    enabled: boolean;
    version: string;
  };
  stalls: {
    enabled: boolean;
    version: string;
  };
  events: {
    enabled: boolean;
    version: string;
  };
  locateMembers: {
    enabled: boolean;
    version: string;
  };
  applyStallsShops: {
    enabled: boolean;
    version: string;
  };
  adminPanel: {
    enabled: boolean;
    version: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: number; // Higher number = higher priority
  actionButton?: {
    text: string;
    action: string;
  };
  startDate: string;
  endDate: string;
  targetAudience?: 'all' | 'tirthMitra' | 'stallOwner' | 'eventManager';
}

export interface AppVersion {
  current: string;
  minimum: string;
  latest: string;
  forceUpdate: boolean;
}
