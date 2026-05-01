/**
 * Strapi API Response Types
 * These types match the Strapi v4 response structure
 */

// Base Strapi response wrapper
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Strapi entity structure
export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

// Strapi collection response
export type StrapiCollectionResponse<T> = StrapiResponse<StrapiEntity<T>[]>;

// Strapi single response
export type StrapiSingleResponse<T> = StrapiResponse<StrapiEntity<T>>;

// Strapi Plant attributes (matches backend schema)
export interface StrapiPlantAttributes {
  name: string;
  species: string;
  photo?: {
    data?: StrapiEntity<{
      url: string;
      name: string;
      alternativeText?: string;
    }>;
  };
  location?: string;
  notes?: string;
  acquiredDate?: string;
  lightLevel?: 'low' | 'medium' | 'high';
  humidity?: 'low' | 'medium' | 'high';
  temperaturePreference?: 'cold' | 'moderate' | 'warm';
  isToxicToPets?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Strapi Care Log attributes (matches backend schema)
export interface StrapiCareLogAttributes {
  careType: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'other';
  notes?: string;
  date: string;
  plant?: {
    data?: StrapiEntity<StrapiPlantAttributes>;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Error response from Strapi
export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface StrapiErrorResponse {
  data: null;
  error: StrapiError;
}

// Made with Bob
