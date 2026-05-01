# API Integration Layer

This directory contains the complete API integration layer for communicating with the Strapi backend.

## 📁 Files

### `strapi.ts`
**Main API client** - Contains all API functions for interacting with Strapi backend.

**Key Features:**
- ✅ Centralized fetch wrapper with error handling
- ✅ Response normalization (removes Strapi wrapper structure)
- ✅ TypeScript type safety
- ✅ Environment-based configuration
- ✅ Reusable across all components

**Exports:**
- Plant API: `getPlants()`, `getPlantById()`, `createPlant()`, `updatePlant()`, `deletePlant()`
- Care Log API: `getCareLogs()`, `createCareLog()`, `updateCareLog()`, `deleteCareLog()`
- AI Functions: `askAI()`, `analyzePlantImage()` (mock implementations)
- Utilities: `checkConnection()`, `getStrapiURL()`, `getMediaURL()`
- Error class: `StrapiAPIError`

### `strapi-types.ts`
**TypeScript type definitions** for Strapi API responses.

**Includes:**
- Strapi response wrappers (`StrapiResponse`, `StrapiEntity`)
- Plant attributes (`StrapiPlantAttributes`)
- Care Log attributes (`StrapiCareLogAttributes`)
- Error types (`StrapiError`, `StrapiErrorResponse`)

### `api.ts`
**Legacy mock API** - Original implementation with mock data. Can be used for:
- Development without backend
- Testing UI components
- Fallback when Strapi is unavailable

### `mock-data.ts`
Mock data for development and testing.

### `API_USAGE_GUIDE.md`
**Complete usage documentation** with examples for:
- Setup and configuration
- All API functions
- Error handling patterns
- React component examples
- Best practices

## 🚀 Quick Start

### 1. Configure Environment

Create `.env.local`:
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### 2. Import and Use

```typescript
import { getPlants, createPlant, StrapiAPIError } from '@/lib/strapi';

// Fetch plants
const plants = await getPlants();

// Create plant
const newPlant = await createPlant({
  name: 'Monstera',
  species: 'Monstera deliciosa',
  location: 'Living Room',
});

// Error handling
try {
  const plant = await getPlantById('123');
} catch (error) {
  if (error instanceof StrapiAPIError) {
    console.error('API Error:', error.message, error.status);
  }
}
```

## 🔄 Migration from Mock API

To switch from mock API to Strapi:

**Before:**
```typescript
import { getPlants } from '@/lib/api';
```

**After:**
```typescript
import { getPlants } from '@/lib/strapi';
```

The function signatures are identical, so no other changes needed!

## 📊 API Response Flow

```
Frontend Component
    ↓
strapi.ts (API Client)
    ↓
fetchAPI() wrapper
    ↓
Strapi Backend
    ↓
Response Normalization
    ↓
Clean Data to Component
```

## 🛡️ Error Handling

All API functions throw `StrapiAPIError` on failure:

```typescript
class StrapiAPIError extends Error {
  status?: number;        // HTTP status code
  details?: object;       // Additional error details
}
```

## 🎯 Design Principles

1. **Single Source of Truth**: All API calls go through this layer
2. **Type Safety**: Full TypeScript support
3. **Clean Responses**: Frontend receives clean objects, not Strapi wrappers
4. **Centralized Errors**: Consistent error handling
5. **Reusability**: Functions work in any component
6. **Scalability**: Easy to add new endpoints

## 📚 Documentation

See `API_USAGE_GUIDE.md` for:
- Detailed examples
- React component patterns
- Error handling strategies
- Best practices
- Troubleshooting

## 🔧 Extending the API

To add a new endpoint:

1. **Add types** to `strapi-types.ts`:
```typescript
export interface StrapiNewEntityAttributes {
  field1: string;
  field2: number;
}
```

2. **Add normalizer** to `strapi.ts`:
```typescript
function normalizeNewEntity(entity: StrapiEntity<StrapiNewEntityAttributes>) {
  return {
    id: entity.id,
    field1: entity.attributes.field1,
    field2: entity.attributes.field2,
  };
}
```

3. **Add API function** to `strapi.ts`:
```typescript
export async function getNewEntities() {
  const response = await fetchAPI<StrapiCollectionResponse<StrapiNewEntityAttributes>>(
    '/new-entities'
  );
  return response.data.map(normalizeNewEntity);
}
```

## ✅ Testing

Test API connection:
```typescript
import { checkConnection } from '@/lib/strapi';

const isConnected = await checkConnection();
console.log('Strapi connected:', isConnected);
```

## 🔐 Authentication (Future)

To add authentication:

1. Store JWT token in localStorage/cookies
2. Add to fetch wrapper:
```typescript
const token = getAuthToken();
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

## 📝 Notes

- All functions use `async/await`
- Responses are automatically normalized
- Media URLs are converted to full URLs
- Strapi v4 API structure is used
- Population is handled automatically where needed

---

**Need help?** Check `API_USAGE_GUIDE.md` for detailed examples and patterns.