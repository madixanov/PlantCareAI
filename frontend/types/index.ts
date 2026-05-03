// Plant Types
export interface Plant {
  id: number;
  documentId: string;
  name: string;
  species: string;
  location?: string;
  photo?: string;
  notes?: string;
  acquiredDate?: string;
  createdAt: string;
  updatedAt: string;
  care_logs?: CareLog[];
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
  documentId: string;

  careType: CareType;
  notes?: string;
  date: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateCareLogInput {
  careType: CareType;
  notes?: string;
  date: string;
  plant: string;
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

// AI Image Analysis Types
export interface AIImageAnalysisRequest {
  plantId: string;
  image: string; // base64 encoded image
  question?: string; // optional additional question
}

export interface AIImageAnalysisResponse {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  careAdvice: string[];
  confidence: number;
  analysis: string;
  timestamp: string;
}

// Room Plant Recommendation Types (New API Structure)
export type LightLevel = 'low' | 'medium' | 'bright';
export type TemperatureLevel = 'cold' | 'moderate' | 'warm';
export type PetType = 'cats' | 'dogs' | 'none';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type WindowDirection = 'north' | 'south' | 'east' | 'west' | 'none';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';

// New API request format
export interface RecommendRequest {
  light: LightLevel;
  temperature: number; // Celsius
  humidity: 'low' | 'medium' | 'high';
  windowDirection: WindowDirection;
  experienceLevel: ExperienceLevel;
}

// New API response format
export interface PlantRecommendation {
  rank: number;
  name: string;
  reason: string;
  difficulty: DifficultyLevel;
  benefits: string[];
  tips: string[];
}

export interface RecommendResponse {
  recommendations: PlantRecommendation[];
  conditions: RecommendRequest;
}

// Legacy types (for backward compatibility)
export interface RoomConditions {
  lightLevel: LightLevel;
  temperature: TemperatureLevel;
  pets: PetType[];
  notes?: string;
}

export interface LegacyPlantRecommendation {
  id: string;
  name: string;
  species: string;
  reason: string;
  difficulty: DifficultyLevel;
  petSafe: boolean;
  petWarning?: string;
  careHighlights: string[];
  imageUrl?: string;
}

export interface RoomRecommendationResponse {
  recommendations: LegacyPlantRecommendation[];
  roomSummary: string;
  timestamp: string;
}

// Made with Bob
