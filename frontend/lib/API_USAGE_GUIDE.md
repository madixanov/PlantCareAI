# Strapi API Integration Guide

This guide explains how to use the Strapi API client in your Next.js components.

## Table of Contents

1. [Setup](#setup)
2. [Plant API](#plant-api)
3. [Care Log API](#care-log-api)
4. [AI Functions](#ai-functions)
5. [Error Handling](#error-handling)
6. [TypeScript Types](#typescript-types)

---

## Setup

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Import the API Client

```typescript
import {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  getCareLogs,
  createCareLog,
  askAI,
  analyzePlantImage,
  StrapiAPIError,
} from '@/lib/strapi';
```

---

## Plant API

### Get All Plants

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getPlants } from '@/lib/strapi';
import { Plant } from '@/types';

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlants() {
      try {
        const data = await getPlants();
        setPlants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plants');
      } finally {
        setLoading(false);
      }
    }

    fetchPlants();
  }, []);

  if (loading) return <div>Loading plants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Plants</h1>
      {plants.map(plant => (
        <div key={plant.id}>
          <h2>{plant.name}</h2>
          <p>{plant.species}</p>
        </div>
      ))}
    </div>
  );
}
```

### Get Single Plant by ID

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getPlantById } from '@/lib/strapi';
import { Plant } from '@/types';

export default function PlantDetailPage({ params }: { params: { id: string } }) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlant() {
      try {
        const data = await getPlantById(params.id);
        setPlant(data);
      } catch (err) {
        console.error('Failed to fetch plant:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlant();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!plant) return <div>Plant not found</div>;

  return (
    <div>
      <h1>{plant.name}</h1>
      <p>Species: {plant.species}</p>
      <p>Location: {plant.location || 'Not specified'}</p>
      {plant.photo && <img src={plant.photo} alt={plant.name} />}
    </div>
  );
}
```

### Create a New Plant

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlant } from '@/lib/strapi';
import { CreatePlantInput } from '@/types';

export default function AddPlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const input: CreatePlantInput = {
      name: formData.get('name') as string,
      species: formData.get('species') as string,
      location: formData.get('location') as string,
      notes: formData.get('notes') as string,
      acquiredDate: formData.get('acquiredDate') as string,
    };

    try {
      const newPlant = await createPlant(input);
      console.log('Plant created:', newPlant);
      router.push(`/plants/${newPlant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plant');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add New Plant</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="name">Plant Name *</label>
        <input type="text" id="name" name="name" required />
      </div>
      
      <div>
        <label htmlFor="species">Species *</label>
        <input type="text" id="species" name="species" required />
      </div>
      
      <div>
        <label htmlFor="location">Location</label>
        <input type="text" id="location" name="location" />
      </div>
      
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" />
      </div>
      
      <div>
        <label htmlFor="acquiredDate">Acquired Date</label>
        <input type="date" id="acquiredDate" name="acquiredDate" />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Add Plant'}
      </button>
    </form>
  );
}
```

### Update a Plant

```typescript
import { updatePlant } from '@/lib/strapi';

async function handleUpdate(plantId: string) {
  try {
    const updated = await updatePlant(plantId, {
      location: 'Living Room',
      notes: 'Moved to brighter spot',
    });
    
    if (updated) {
      console.log('Plant updated:', updated);
    }
  } catch (err) {
    console.error('Failed to update plant:', err);
  }
}
```

### Delete a Plant

```typescript
import { deletePlant } from '@/lib/strapi';

async function handleDelete(plantId: string) {
  if (!confirm('Are you sure you want to delete this plant?')) {
    return;
  }

  try {
    const success = await deletePlant(plantId);
    if (success) {
      console.log('Plant deleted successfully');
      // Redirect or update UI
    }
  } catch (err) {
    console.error('Failed to delete plant:', err);
  }
}
```

---

## Care Log API

### Get Care Logs for a Plant

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCareLogs } from '@/lib/strapi';
import { CareLog } from '@/types';

export default function PlantCareHistory({ plantId }: { plantId: string }) {
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCareLogs() {
      try {
        const logs = await getCareLogs(plantId);
        setCareLogs(logs);
      } catch (err) {
        console.error('Failed to fetch care logs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCareLogs();
  }, [plantId]);

  if (loading) return <div>Loading care history...</div>;

  return (
    <div>
      <h2>Care History</h2>
      {careLogs.length === 0 ? (
        <p>No care logs yet</p>
      ) : (
        <ul>
          {careLogs.map(log => (
            <li key={log.id}>
              <strong>{log.careType}</strong> - {new Date(log.date).toLocaleDateString()}
              {log.notes && <p>{log.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Create a Care Log

```typescript
'use client';

import { useState } from 'react';
import { createCareLog } from '@/lib/strapi';
import { CreateCareLogInput, CareType } from '@/types';

export default function AddCareLogForm({ plantId }: { plantId: number }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const input: CreateCareLogInput = {
      careType: formData.get('careType') as CareType,
      notes: formData.get('notes') as string,
      date: formData.get('date') as string,
      plant: plantId,
    };

    try {
      const newLog = await createCareLog(input);
      console.log('Care log created:', newLog);
      // Refresh care logs or update UI
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to create care log:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Log Care Activity</h3>
      
      <div>
        <label htmlFor="careType">Activity Type *</label>
        <select id="careType" name="careType" required>
          <option value="watering">Watering</option>
          <option value="fertilizing">Fertilizing</option>
          <option value="pruning">Pruning</option>
          <option value="repotting">Repotting</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="date">Date *</label>
        <input 
          type="datetime-local" 
          id="date" 
          name="date" 
          defaultValue={new Date().toISOString().slice(0, 16)}
          required 
        />
      </div>
      
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Log Activity'}
      </button>
    </form>
  );
}
```

---

## AI Functions

### Ask AI a Question

```typescript
'use client';

import { useState } from 'react';
import { askAI } from '@/lib/strapi';

export default function AIAssistant({ plantId }: { plantId: string }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await askAI(plantId, question);
      setAnswer(response);
    } catch (err) {
      console.error('AI request failed:', err);
      setAnswer('Sorry, I could not process your question.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Ask AI Assistant</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about your plant's care..."
        rows={3}
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      
      {answer && (
        <div className="ai-response">
          <h3>AI Response:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
        </div>
      )}
    </div>
  );
}
```

### Analyze Plant Image

```typescript
'use client';

import { useState } from 'react';
import { analyzePlantImage } from '@/lib/strapi';

export default function ImageAnalysis({ plantId }: { plantId: string }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      setAnalyzing(true);
      try {
        const analysis = await analyzePlantImage(plantId, base64);
        setResult(analysis);
      } catch (err) {
        console.error('Image analysis failed:', err);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <h2>AI Image Analysis</h2>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload}
        disabled={analyzing}
      />
      
      {analyzing && <p>Analyzing image...</p>}
      
      {result && (
        <div className={`analysis-result status-${result.status}`}>
          <h3>Status: {result.status.toUpperCase()}</h3>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(0)}%</p>
          
          {result.issues.length > 0 && (
            <div>
              <h4>Issues Detected:</h4>
              <ul>
                {result.issues.map((issue: string, i: number) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4>Care Advice:</h4>
            <ul>
              {result.careAdvice.map((advice: string, i: number) => (
                <li key={i}>{advice}</li>
              ))}
            </ul>
          </div>
          
          <p>{result.analysis}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

### Using Try-Catch

```typescript
import { getPlants, StrapiAPIError } from '@/lib/strapi';

async function fetchData() {
  try {
    const plants = await getPlants();
    return plants;
  } catch (error) {
    if (error instanceof StrapiAPIError) {
      console.error('Strapi API Error:', {
        message: error.message,
        status: error.status,
        details: error.details,
      });
      
      // Handle specific error codes
      if (error.status === 404) {
        console.log('Resource not found');
      } else if (error.status === 401) {
        console.log('Unauthorized - check authentication');
      } else if (error.status === 500) {
        console.log('Server error - try again later');
      }
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

### Error Boundary Component

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { StrapiAPIError } from '@/lib/strapi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class APIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      
      if (error instanceof StrapiAPIError) {
        return (
          <div className="error-container">
            <h2>API Error</h2>
            <p>{error.message}</p>
            {error.status && <p>Status Code: {error.status}</p>}
            <button onClick={() => this.setState({ hasError: false })}>
              Try Again
            </button>
          </div>
        );
      }
      
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## TypeScript Types

All types are exported from `@/types`:

```typescript
import {
  Plant,
  CreatePlantInput,
  CareLog,
  CreateCareLogInput,
  CareType,
} from '@/types';
```

### Available Types

- **Plant**: Complete plant object with all fields
- **CreatePlantInput**: Input for creating/updating plants
- **CareLog**: Complete care log object
- **CreateCareLogInput**: Input for creating care logs
- **CareType**: Union type for care activity types

---

## Best Practices

### 1. Use React Query for Data Fetching (Recommended)

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlants, createPlant } from '@/lib/strapi';

export function usePlants() {
  return useQuery({
    queryKey: ['plants'],
    queryFn: getPlants,
  });
}

export function useCreatePlant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });
}
```

### 2. Create Custom Hooks

```typescript
// hooks/usePlant.ts
import { useEffect, useState } from 'react';
import { getPlantById } from '@/lib/strapi';
import { Plant } from '@/types';

export function usePlant(id: string) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const data = await getPlantById(id);
        if (!cancelled) {
          setPlant(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { plant, loading, error };
}
```

### 3. Server-Side Data Fetching

```typescript
// app/plants/page.tsx (Server Component)
import { getPlants } from '@/lib/strapi';

export default async function PlantsPage() {
  const plants = await getPlants();

  return (
    <div>
      <h1>My Plants</h1>
      {plants.map(plant => (
        <div key={plant.id}>
          <h2>{plant.name}</h2>
          <p>{plant.species}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### CORS Issues

If you encounter CORS errors, configure Strapi's CORS settings in `backend/config/middlewares.ts`:

```typescript
export default [
  // ... other middlewares
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'],
      credentials: true,
    },
  },
];
```

### Connection Issues

Check if Strapi is running:

```typescript
import { checkConnection } from '@/lib/strapi';

const isConnected = await checkConnection();
if (!isConnected) {
  console.error('Cannot connect to Strapi backend');
}
```

---

## Summary

This API client provides:

✅ **Type-safe** API calls with full TypeScript support  
✅ **Centralized** error handling  
✅ **Normalized** responses (clean data, no Strapi wrapper)  
✅ **Reusable** functions across all components  
✅ **Scalable** architecture for future endpoints  

For questions or issues, refer to the Strapi documentation or check the backend API routes.