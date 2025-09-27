export interface Tirth {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: {
    main: string;
    gallery: string[];
  };
  details: {
    significance: string;
    history: string;
    timings: string;
    entryFee?: number;
    facilities: string[];
    bestTimeToVisit: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  category: 'temple' | 'gurudwara' | 'mosque' | 'church' | 'historical' | 'natural';
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
}

export interface TirthFilters {
  category?: string;
  city?: string;
  state?: string;
  tags?: string[];
}

export interface TirthSearchParams {
  query: string;
  filters: TirthFilters;
  sortBy: 'name' | 'distance' | 'relevance';
  sortOrder: 'asc' | 'desc';
}
