/**
 * Strapi API Client (SAFE VERSION)
 */

import {
  StrapiCollectionResponse,
  StrapiSingleResponse,
  StrapiPlantAttributes,
  StrapiCareLogAttributes,
  StrapiErrorResponse,
  StrapiEntity,
} from './strapi-types';

import { Plant, CreatePlantInput, CareLog, CreateCareLogInput } from '@/types';

// ============================================================================
// IMAGE UPLOAD TYPES
// ============================================================================

export interface UploadedFile {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export interface ImageUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

// ============================================================================
// CONFIG
// ============================================================================

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const API_BASE = `${STRAPI_URL}/api`;

const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// ============================================================================
// ERROR CLASS
// ============================================================================

export class StrapiAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'StrapiAPIError';
  }
}

// ============================================================================
// FETCH WRAPPER (SAFE)
// ============================================================================

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    (headers as any)['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new StrapiAPIError(
        data?.error?.message || 'API Error',
        res.status,
        data?.error
      );
    }

    return data;
  } catch (err) {
    throw new StrapiAPIError(
      err instanceof Error ? err.message : 'Network error'
    );
  }
}

// ============================================================================
// SAFE NORMALIZERS
// ============================================================================

function normalizePlant(entity: any): Plant | null {
  if (!entity) return null;

  // Strapi v5: documentId is at root level, not in attributes
  const a = entity;

  return {
    id: entity.id,
    documentId: entity.documentId ?? '',
    name: a?.name ?? 'Unnamed plant',
    species: a?.species ?? '',
    location: a?.location ?? '',
    photo: a?.photo?.url
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${a.photo.url}`
      : undefined,
    notes: a?.notes ?? '',
    acquiredDate: a?.acquiredDate ?? null,
    createdAt: a?.createdAt ?? null,
    updatedAt: a?.updatedAt ?? null,
    care_logs: a?.care_logs ?? [],

  };
}

function normalizeCareLog(entity: any): CareLog | null {
  if (!entity) return null;

  const a = entity;

  return {
    id: entity.id,
    documentId: a?.documentId ?? '',

    careType: a?.careType ?? 'other',
    notes: a?.notes ?? '',
    date: a?.date ?? '',

    createdAt: a?.createdAt ?? null,
    updatedAt: a?.updatedAt ?? null,
  };
}

// ============================================================================
// PLANTS
// ============================================================================

export async function getPlants(): Promise<Plant[]> {
  const res = await fetchAPI<any>('/plants?populate=*');

  return (res?.data ?? [])
    .map(normalizePlant)
    .filter(Boolean);
}

export async function getPlantById(id: string): Promise<Plant | null> {
  try {
    const res = await fetchAPI<any>(`/plants/${id}?populate=*`);

    return normalizePlant(res?.data);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function createPlant(input: CreatePlantInput): Promise<Plant> {
  const res = await fetchAPI<any>('/plants', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });

  return normalizePlant(res?.data)!;
}

export async function deletePlant(id: string): Promise<boolean> {
  try {
    await fetchAPI(`/plants/${id}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// CARE LOGS
// ============================================================================

export async function getCareLogs(
  plantDocumentId: string
): Promise<CareLog[]> {
  const res = await fetchAPI<any>(
    `/care-logs?filters[plant][documentId][$eq]=${plantDocumentId}&populate=*`
  );

  return (res?.data ?? [])
    .map(normalizeCareLog)
    .filter(Boolean);
}

export async function createCareLog(input: CreateCareLogInput): Promise<CareLog> {
  const res = await fetchAPI<any>('/care-logs', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });

  return normalizeCareLog(res?.data)!;
}

// ============================================================================
// AI (MOCK SAFE)
// ============================================================================

export async function askAI(plantId: string, question: string): Promise<string> {
  const plant = await getPlantById(plantId);

  if (!plant) return 'Plant not found';

  return `AI response about ${plant.name}: ${question}`;
}

// ============================================================================
// PLANT RECOMMENDATIONS (MOCK)
// ============================================================================

import { RoomConditions, RoomRecommendationResponse, PlantRecommendation } from '@/types';

export async function getPlantRecommendations(
  conditions: RoomConditions
): Promise<RoomRecommendationResponse> {
  // Mock AI-powered plant recommendations based on room conditions
  const { lightLevel, temperature, pets, notes } = conditions;
  
  // Generate room summary
  const lightDesc = lightLevel === 'low' ? 'low light' : lightLevel === 'medium' ? 'medium light' : 'bright light';
  const tempDesc = temperature === 'cold' ? 'cool' : temperature === 'moderate' ? 'moderate' : 'warm';
  const petDesc = pets.includes('none') ? 'no pets' : pets.join(' and ');
  
  const roomSummary = `Your room has ${lightDesc} conditions with ${tempDesc} temperatures${pets.includes('none') ? '' : ` and ${petDesc}`}. ${notes ? `Additional notes: ${notes}` : ''}`;
  
  // Mock recommendations based on conditions
  const allRecommendations: PlantRecommendation[] = [
    {
      id: '1',
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      reason: 'Perfect for low-light conditions and very forgiving. Thrives on neglect and purifies air.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: [
        'Water every 2-3 weeks',
        'Tolerates low light',
        'Very drought-resistant'
      ]
    },
    {
      id: '2',
      name: 'Pothos',
      species: 'Epipremnum aureum',
      reason: 'Extremely adaptable and easy to care for. Great for beginners and tolerates various light conditions.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: [
        'Water when soil is dry',
        'Grows in low to bright indirect light',
        'Easy to propagate'
      ]
    },
    {
      id: '3',
      name: 'Spider Plant',
      species: 'Chlorophytum comosum',
      reason: 'Safe for pets and very easy to care for. Produces baby plants that can be propagated.',
      difficulty: 'easy',
      petSafe: true,
      careHighlights: [
        'Water regularly, keep soil moist',
        'Prefers bright indirect light',
        'Safe for cats and dogs'
      ]
    },
    {
      id: '4',
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      reason: 'Thrives in low light and tells you when it needs water by drooping slightly.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: [
        'Water when leaves start to droop',
        'Loves low to medium light',
        'Beautiful white flowers'
      ]
    },
    {
      id: '5',
      name: 'Boston Fern',
      species: 'Nephrolepis exaltata',
      reason: 'Safe for pets and loves humidity. Perfect for bathrooms or kitchens.',
      difficulty: 'medium',
      petSafe: true,
      careHighlights: [
        'Keep soil consistently moist',
        'Loves humidity',
        'Safe for cats and dogs'
      ]
    },
    {
      id: '6',
      name: 'Monstera',
      species: 'Monstera deliciosa',
      reason: 'Stunning tropical plant that makes a statement. Grows well in bright indirect light.',
      difficulty: 'medium',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: [
        'Water when top 2 inches of soil are dry',
        'Prefers bright indirect light',
        'Iconic split leaves'
      ]
    }
  ];
  
  // Filter recommendations based on conditions
  let recommendations = allRecommendations;
  
  // Filter by pet safety
  if (!pets.includes('none')) {
    recommendations = recommendations.filter(plant => plant.petSafe);
  }
  
  // Filter by light level (simplified logic)
  if (lightLevel === 'low') {
    recommendations = recommendations.filter(plant =>
      ['Snake Plant', 'Pothos', 'Peace Lily'].includes(plant.name)
    );
  } else if (lightLevel === 'bright') {
    recommendations = recommendations.filter(plant =>
      ['Monstera', 'Spider Plant', 'Pothos'].includes(plant.name)
    );
  }
  
  // If no recommendations match, return easy plants
  if (recommendations.length === 0) {
    recommendations = allRecommendations.filter(plant => plant.difficulty === 'easy').slice(0, 3);
  }
  
  // Return top 4 recommendations
  recommendations = recommendations.slice(0, 4);
  
  return {
    recommendations,
    roomSummary,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// IMAGE UPLOAD HELPERS
// ============================================================================

/**
 * Validate image file before upload
 */
export function validateImageFile(
  file: File,
  options: ImageUploadOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Upload image to Strapi Media Library
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<UploadedFile> {
  // Validate file first
  const validation = validateImageFile(file, options);
  if (!validation.valid) {
    throw new StrapiAPIError(validation.error || 'Invalid file');
  }

  const formData = new FormData();
  formData.append('files', file);

  const headers: HeadersInit = {};
  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new StrapiAPIError(
        error?.error?.message || 'Upload failed',
        res.status,
        error
      );
    }

    const data = await res.json();
    const uploadedFile = data[0];

    return {
      id: uploadedFile.id,
      name: uploadedFile.name,
      url: uploadedFile.url,
      mime: uploadedFile.mime,
      size: uploadedFile.size,
    };
  } catch (err) {
    if (err instanceof StrapiAPIError) throw err;
    throw new StrapiAPIError(
      err instanceof Error ? err.message : 'Upload failed'
    );
  }
}

/**
 * Update plant with uploaded image
 */
export async function updatePlantImage(
  plantId: string,
  imageId: number
): Promise<Plant> {
  const res = await fetchAPI<any>(`/plants/${plantId}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        photo: imageId,
      },
    }),
  });

  return normalizePlant(res?.data)!;
}

/**
 * Create plant with image
 */
export async function createPlantWithImage(
  input: CreatePlantInput,
  imageFile?: File
): Promise<Plant> {
  let photoId: number | undefined;

  // Upload image first if provided
  if (imageFile) {
    const uploadedFile = await uploadImage(imageFile);
    photoId = uploadedFile.id;
  }

  // Create plant with image reference
  const plantData = {
    ...input,
    ...(photoId && { photo: photoId }),
  };

  const res = await fetchAPI<any>('/plants', {
    method: 'POST',
    body: JSON.stringify({ data: plantData }),
  });

  return normalizePlant(res?.data)!;
}