# Quick Start Guide - Plant Care Hackathon

## 🚀 Getting Started in 5 Minutes

This guide gets you from zero to coding in the fastest way possible.

---

## Prerequisites

```bash
# Check you have these installed
node --version  # v18+ required
npm --version   # v9+ required
git --version
```

---

## Step 1: Initialize Project (2 minutes)

```bash
# Create project directory
mkdir plant-care-system
cd plant-care-system

# Initialize git
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".DS_Store" >> .gitignore

# Create root package.json
npm init -y

# Install concurrently for running multiple services
npm install -D concurrently
```

---

## Step 2: Create Frontend (3 minutes)

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# When prompted:
# ✓ Would you like to use TypeScript? Yes
# ✓ Would you like to use ESLint? Yes
# ✓ Would you like to use Tailwind CSS? Yes
# ✓ Would you like to use `src/` directory? No
# ✓ Would you like to use App Router? Yes
# ✓ Would you like to customize the default import alias? No
```

---

## Step 3: Create Backend (2 minutes)

```bash
# Create Strapi project with SQLite (quickstart)
npx create-strapi-app@latest backend --quickstart --no-run

# This creates a Strapi project with:
# - SQLite database (no setup needed)
# - Admin panel
# - REST API
```

---

## Step 4: Create Shared Types (1 minute)

```bash
# Create shared package
mkdir -p shared/src/types
cd shared

# Initialize package
npm init -y

# Install TypeScript
npm install -D typescript

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
EOF

cd ..
```

---

## Step 5: Create AI Module (1 minute)

```bash
# Create AI module structure
mkdir -p ai/src/{prompts,providers,utils}
cd ai

# Initialize package
npm init -y

# Install dependencies
npm install openai dotenv

# Install TypeScript
npm install -D typescript @types/node

cd ..
```

---

## Step 6: Configure Root Scripts (1 minute)

Edit root `package.json`:

```json
{
  "name": "plant-care-system",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run develop",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## Step 7: Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Frontend will be at: http://localhost:3000
# Strapi admin will be at: http://localhost:1337/admin
```

---

## Step 8: Create Strapi Admin User

1. Open http://localhost:1337/admin
2. Fill in admin user details:
   - First name: Admin
   - Last name: User
   - Email: admin@example.com
   - Password: (choose a strong password)
3. Click "Let's start"

---

## Step 9: Create Strapi Content Types

### Create Plant Content Type

1. Go to Content-Type Builder
2. Click "Create new collection type"
3. Display name: `Plant`
4. Click "Continue"
5. Add fields:

**Field 1: name**
- Type: Text
- Name: `name`
- Required: Yes

**Field 2: species**
- Type: Text
- Name: `species`
- Required: Yes

**Field 3: location**
- Type: Text
- Name: `location`

**Field 4: photo**
- Type: Media
- Name: `photo`
- Type: Single media
- Allowed types: Images

**Field 5: notes**
- Type: Rich text
- Name: `notes`

**Field 6: acquiredDate**
- Type: Date
- Name: `acquiredDate`

6. Click "Finish"
7. Click "Save"

### Create Care Log Content Type

1. Click "Create new collection type"
2. Display name: `CareLog`
3. Add fields:

**Field 1: careType**
- Type: Enumeration
- Name: `careType`
- Values: `watering`, `fertilizing`, `pruning`, `repotting`, `other`
- Required: Yes

**Field 2: notes**
- Type: Rich text
- Name: `notes`

**Field 3: date**
- Type: DateTime
- Name: `date`
- Required: Yes

**Field 4: plant (Relation)**
- Type: Relation
- Relation: CareLog many-to-one Plant
- Display name: `plant`

4. Click "Finish"
5. Click "Save"

---

## Step 10: Configure Strapi Permissions

1. Go to Settings → Roles → Public
2. Enable permissions for:
   - Plant: find, findOne, create, update, delete
   - Care-log: find, findOne, create, update, delete
3. Click "Save"

---

## Step 11: Create Shared Types

Create `shared/src/types/plant.ts`:

```typescript
export interface Plant {
  id: number;
  name: string;
  species: string;
  location?: string;
  photo?: {
    url: string;
    name: string;
  };
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
```

Create `shared/src/types/care-log.ts`:

```typescript
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
```

Create `shared/src/types/ai.ts`:

```typescript
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
```

Create `shared/src/types/index.ts`:

```typescript
export * from './plant';
export * from './care-log';
export * from './ai';
```

---

## Step 12: Test Strapi API

```bash
# Create a test plant
curl -X POST http://localhost:1337/api/plants \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Monstera Deliciosa",
      "species": "Monstera deliciosa",
      "location": "Living Room",
      "notes": "Needs bright indirect light"
    }
  }'

# Get all plants
curl http://localhost:1337/api/plants
```

---

## Step 13: Create Strapi Client in Frontend

Create `frontend/lib/strapi.ts`:

```typescript
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchPlants() {
  const res = await fetch(`${STRAPI_URL}/api/plants?populate=*`);
  if (!res.ok) throw new Error('Failed to fetch plants');
  return res.json();
}

export async function fetchPlant(id: string) {
  const res = await fetch(`${STRAPI_URL}/api/plants/${id}?populate=*`);
  if (!res.ok) throw new Error('Failed to fetch plant');
  return res.json();
}

export async function createPlant(data: any) {
  const res = await fetch(`${STRAPI_URL}/api/plants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error('Failed to create plant');
  return res.json();
}

export async function fetchCareLogs(plantId: string) {
  const res = await fetch(
    `${STRAPI_URL}/api/care-logs?filters[plant][id][$eq]=${plantId}&populate=*&sort=date:desc`
  );
  if (!res.ok) throw new Error('Failed to fetch care logs');
  return res.json();
}

export async function createCareLog(data: any) {
  const res = await fetch(`${STRAPI_URL}/api/care-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error('Failed to create care log');
  return res.json();
}
```

---

## Step 14: Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
OPENAI_API_KEY=your_openai_api_key_here
```

Create `ai/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## You're Ready! 🎉

Your project structure should now look like:

```
plant-care-system/
├── frontend/          # Next.js app running on :3000
├── backend/           # Strapi CMS running on :1337
├── ai/                # AI module (to be developed)
├── shared/            # Shared TypeScript types
└── package.json       # Root workspace config
```

---

## Next Steps

1. **Developer A**: Start building UI components in `frontend/`
2. **Developer B**: Start building AI prompts in `ai/`
3. **Both**: Use IBM Bob to accelerate development

---

## Useful Commands

```bash
# Start everything
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Access Strapi admin
open http://localhost:1337/admin

# Access frontend
open http://localhost:3000

# View Strapi API docs
open http://localhost:1337/documentation
```

---

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 1337
npx kill-port 1337
```

**Strapi won't start:**
```bash
cd backend
rm -rf .cache build
npm run develop
```

**Frontend build errors:**
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

---

## IBM Bob Tips

Use IBM Bob to generate:
- React components: "Create a PlantCard component with TypeScript"
- API functions: "Create a Strapi client with error handling"
- Strapi schemas: "Generate Strapi schema for plant care logs"
- Prompts: "Create a system prompt for plant care AI assistant"

---

**Time to first code: ~15 minutes**  
**Time to working API: ~20 minutes**  
**Time to first component: ~25 minutes**

Now start building! 🚀🌱