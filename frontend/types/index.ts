// Plant Types
export interface Plant {
  id: number;
  name: string;
  species: string;
  location?: string;
  photo?: string;
  notes?: string;
  acquiredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlantInput {
  name: string;
  species: string;
  location?: string;
  notes?: string;
  acquiredDate?: string;
}

// Care Log Types
export type CareType = 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'other';

export interface CareLog {
  id: number;
  careType: CareType;
  notes?: string;
  date: string;
  plant: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareLogInput {
  careType: CareType;
  notes?: string;
  date: string;
  plant: number;
}

// AI Types
export interface AIRequest {
  plantId: string;
  question: string;
  includeContext?: boolean;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  context?: {
    plantName: string;
    recentCareActivities: string[];
  };
  timestamp: string;
}

// Made with Bob
