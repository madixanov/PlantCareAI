# AI-Powered Plant Care System - Hackathon Execution Plan

**Theme**: "Turn idea into impact faster"  
**Tech Stack**: Next.js (App Router) + TypeScript + Strapi + IBM Bob IDE  
**Timeline**: 2-3 days (hackathon pace)  
**Team**: 2 developers working in parallel

---

## 1. MVP SCOPE - Core Features Only

### Must-Have Features (MVP)
1. **Plant Management**
   - Add new plant (name, species, photo, location)
   - View plant list with cards
   - View individual plant details
   - Delete plant

2. **AI Plant Assistant**
   - Ask questions about plant care
   - Get AI-powered recommendations
   - Context-aware responses based on plant data

3. **Care Tracking**
   - Log care activities (watering, fertilizing, pruning)
   - View care history per plant
   - Simple timeline view

### Explicitly Out of Scope (v1)
- User authentication
- Multi-user support
- Mobile app
- Push notifications
- Advanced analytics
- Image recognition for plant diseases

---

## 2. SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS FRONTEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │  API Routes  │      │
│  │  /plants     │  │  PlantCard   │  │  /api/ai     │      │
│  │  /plants/[id]│  │  ChatBox     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
└─────────────────────────────────────────────┼──────────────┘
                         │                     │
                         │                     │ AI Request
                         │ REST API            │
                         ▼                     ▼
┌─────────────────────────────────┐  ┌────────────────────┐
│      STRAPI CMS (Backend)       │  │   AI MODULE        │
│  ┌────────────┐  ┌────────────┐ │  │  ┌──────────────┐ │
│  │   Plant    │  │  CareLog   │ │  │  │ LLM Provider │ │
│  │   Model    │  │   Model    │ │  │  │ Integration  │ │
│  └────────────┘  └────────────┘ │  │  └──────────────┘ │
│                                  │  │  ┌──────────────┐ │
│  ┌────────────────────────────┐ │  │  │   Prompts    │ │
│  │      SQLite Database       │ │  │  │  Engineering │ │
│  └────────────────────────────┘ │  │  └──────────────┘ │
└─────────────────────────────────┘  └────────────────────┘
```

### Data Flow Explanation

**Flow 1: Plant Management**
1. User creates plant via frontend form
2. Next.js sends POST to Strapi `/api/plants`
3. Strapi validates and stores in SQLite
4. Returns plant object with ID
5. Frontend updates UI with new plant

**Flow 2: AI Consultation**
1. User asks question in chat interface
2. Frontend sends request to Next.js API route `/api/ai`
3. API route fetches relevant plant data from Strapi
4. Constructs prompt with plant context
5. Calls LLM provider with enriched prompt
6. Returns AI response to frontend
7. Optionally saves interaction to Strapi

**Flow 3: Care Logging**
1. User logs care activity (e.g., "watered today")
2. Frontend sends POST to Strapi `/api/care-logs`
3. Strapi creates care log linked to plant
4. Returns updated care history
5. Frontend displays in timeline

---

## 3. REPOSITORY STRUCTURE

### Monorepo Layout

```
plant-care-system/
├── README.md
├── package.json (root workspace config)
├── .gitignore
│
├── frontend/                    # Next.js application
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── plants/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── api/
│   │   │       └── ai/
│   │   │           └── route.ts
│   │   ├── components/
│   │   │   ├── PlantCard.tsx
│   │   │   ├── PlantForm.tsx
│   │   │   ├── ChatBox.tsx
│   │   │   └── CareTimeline.tsx
│   │   ├── lib/
│   │   │   ├── strapi.ts      # Strapi client
│   │   │   └── utils.ts
│   │   └── styles/
│   │       └── globals.css
│   └── public/
│
├── backend/                     # Strapi CMS
│   ├── package.json
│   ├── config/
│   │   └── database.js
│   ├── src/
│   │   ├── api/
│   │   │   ├── plant/
│   │   │   │   ├── content-types/
│   │   │   │   │   └── plant/
│   │   │   │   │       └── schema.json
│   │   │   │   └── controllers/
│   │   │   └── care-log/
│   │   │       ├── content-types/
│   │   │       │   └── care-log/
│   │   │       │       └── schema.json
│   │   │       └── controllers/
│   │   └── extensions/
│   └── public/
│
├── ai/                          # AI module
│   ├── package.json
│   ├── src/
│   │   ├── prompts/
│   │   │   ├── system-prompt.ts
│   │   │   └── plant-care-prompt.ts
│   │   ├── providers/
│   │   │   └── llm-client.ts
│   │   └── utils/
│   │       └── context-builder.ts
│   └── tests/
│
└── shared/                      # Shared types and constants
    ├── package.json
    ├── src/
    │   ├── types/
    │   │   ├── plant.ts
    │   │   ├── care-log.ts
    │   │   └── ai.ts
    │   └── constants/
    │       └── care-types.ts
    └── tsconfig.json
```

### Why This Structure Prevents Merge Conflicts

1. **Clear Boundaries**: Each developer owns distinct directories
   - Developer A: `/frontend` (UI, pages, components)
   - Developer B: `/ai` (prompts, LLM logic)
   - Shared: `/backend` (Strapi models - set up once, rarely touched)

2. **Shared Types Package**: Both devs import from `/shared`
   - No duplicate type definitions
   - Single source of truth for interfaces
   - Changes here are coordinated

3. **API Contract First**: Define interfaces in `/shared` before implementation
   - Frontend uses types without backend being ready
   - AI module uses types without frontend being ready
   - Mock data based on shared types

4. **Independent Deployments**:
   - Frontend can be developed with mock data
   - AI module can be tested independently
   - Strapi runs as separate service

---

## 4. PARALLEL TEAM WORKFLOW

### Developer A: Frontend Development

**Responsibilities**:
- Build all UI components
- Implement pages and routing
- Integrate with Strapi API
- Handle state management
- Create API route for AI integration

**Work Process**:
1. Start with shared types from `/shared`
2. Build components with mock data
3. Create Strapi client library
4. Connect to real Strapi once backend is ready
5. Integrate AI module via API route

**No Blocking**: Can work entirely with TypeScript interfaces and mock data

---

### Developer B: AI Module Development

**Responsibilities**:
- Design prompt engineering strategy
- Build LLM integration layer
- Create context-aware prompt builders
- Test AI responses
- Optimize for plant care domain

**Work Process**:
1. Start with shared types from `/shared`
2. Design system prompts for plant care
3. Build prompt templates with plant context
4. Test LLM responses independently
5. Expose as importable module for frontend

**No Blocking**: Can test AI logic with sample plant data from shared types

---

### How They Work in Parallel

**Phase 1: Setup (Hour 0-2)**
- Both: Define shared types together in `/shared`
- Dev A: Initialize Next.js project
- Dev B: Initialize AI module structure
- Both: Set up Strapi models together (30 min)

**Phase 2: Independent Development (Hour 2-20)**
- Dev A: Builds UI with mock data, no waiting
- Dev B: Tests AI prompts with sample data, no waiting
- Communication: Slack/Discord for type changes only

**Phase 3: Integration (Hour 20-24)**
- Dev A: Connects frontend to real Strapi
- Dev B: Exports AI functions for frontend API route
- Both: Test end-to-end flow together

**Key Enabler: API Contracts**
```typescript
// shared/src/types/ai.ts
export interface AIRequest {
  plantId: string;
  question: string;
  context?: PlantContext;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
}
```

Both developers code against these interfaces immediately, no waiting.

---

## 5. API CONTRACT DESIGN

### Data Models

#### Plant Model (Strapi)
```json
{
  "kind": "collectionType",
  "collectionName": "plants",
  "info": {
    "singularName": "plant",
    "pluralName": "plants",
    "displayName": "Plant"
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "species": {
      "type": "string",
      "required": true
    },
    "location": {
      "type": "string"
    },
    "photo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "notes": {
      "type": "text"
    },
    "acquiredDate": {
      "type": "date"
    },
    "careLogs": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::care-log.care-log",
      "mappedBy": "plant"
    }
  }
}
```

#### Care Log Model (Strapi)
```json
{
  "kind": "collectionType",
  "collectionName": "care_logs",
  "info": {
    "singularName": "care-log",
    "pluralName": "care-logs",
    "displayName": "Care Log"
  },
  "attributes": {
    "careType": {
      "type": "enumeration",
      "enum": ["watering", "fertilizing", "pruning", "repotting", "other"],
      "required": true
    },
    "notes": {
      "type": "text"
    },
    "date": {
      "type": "datetime",
      "required": true
    },
    "plant": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::plant.plant",
      "inversedBy": "careLogs"
    }
  }
}
```

### API Examples

#### Example 1: Create Plant
**Request**:
```http
POST http://localhost:1337/api/plants
Content-Type: application/json

{
  "data": {
    "name": "Monstera Deliciosa",
    "species": "Monstera deliciosa",
    "location": "Living Room - East Window",
    "notes": "Needs bright indirect light",
    "acquiredDate": "2024-01-15"
  }
}
```

**Response**:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Monstera Deliciosa",
      "species": "Monstera deliciosa",
      "location": "Living Room - East Window",
      "notes": "Needs bright indirect light",
      "acquiredDate": "2024-01-15",
      "createdAt": "2024-05-01T10:30:00.000Z",
      "updatedAt": "2024-05-01T10:30:00.000Z"
    }
  }
}
```

#### Example 2: Request AI Advice
**Request**:
```http
POST http://localhost:3000/api/ai
Content-Type: application/json

{
  "plantId": "1",
  "question": "My monstera leaves are turning yellow, what should I do?",
  "includeContext": true
}
```

**Response**:
```json
{
  "answer": "Yellow leaves on your Monstera Deliciosa can indicate overwatering. Based on your care logs, you've watered 3 times in the past week, which may be too frequent. Recommendations:\n\n1. Check soil moisture - let top 2 inches dry between waterings\n2. Ensure proper drainage in the pot\n3. Reduce watering frequency to once per week\n4. Remove yellow leaves to prevent energy waste\n\nMonitor for 2 weeks and adjust based on soil dryness.",
  "confidence": 0.85,
  "context": {
    "plantName": "Monstera Deliciosa",
    "recentCareActivities": [
      "Watered on 2024-04-28",
      "Watered on 2024-04-25",
      "Watered on 2024-04-22"
    ]
  },
  "timestamp": "2024-05-01T10:35:00.000Z"
}
```

#### Example 3: Log Care Activity
**Request**:
```http
POST http://localhost:1337/api/care-logs
Content-Type: application/json

{
  "data": {
    "careType": "watering",
    "notes": "Watered thoroughly until water drained from bottom",
    "date": "2024-05-01T09:00:00.000Z",
    "plant": 1
  }
}
```

**Response**:
```json
{
  "data": {
    "id": 15,
    "attributes": {
      "careType": "watering",
      "notes": "Watered thoroughly until water drained from bottom",
      "date": "2024-05-01T09:00:00.000Z",
      "createdAt": "2024-05-01T10:40:00.000Z",
      "updatedAt": "2024-05-01T10:40:00.000Z",
      "plant": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "Monstera Deliciosa"
          }
        }
      }
    }
  }
}
```

---

## 6. IBM BOB USAGE STRATEGY

### IBM Bob as Development Partner

IBM Bob is NOT just a chatbot - it's an AI-powered development accelerator integrated into your IDE. Here's exactly how to leverage it:

---

### Use Case 1: Architecture Design
**When**: Project kickoff  
**How**: 
```
Prompt to Bob:
"Design a Strapi content type schema for a plant management system. 
Include: name, species, location, photo, care logs relationship. 
Output as JSON schema."
```

**Result**: Bob generates complete Strapi schema in seconds, saving 30+ minutes of documentation reading.

---

### Use Case 2: Component Generation
**When**: Building frontend  
**How**:
```
Prompt to Bob:
"Create a React component PlantCard that displays plant name, species, 
photo thumbnail, and last watered date. Use TypeScript and Tailwind CSS. 
Include hover effects."
```

**Result**: Bob generates complete component with types, styling, and best practices. Developer only needs to adjust styling preferences.

---

### Use Case 3: Strapi Model Setup
**When**: Backend initialization  
**How**:
```
Prompt to Bob:
"Generate Strapi lifecycle hooks for the Plant model that automatically 
creates a welcome care log when a new plant is added."
```

**Result**: Bob creates lifecycle hook code with proper Strapi API usage, saving hours of API documentation reading.

---

### Use Case 4: AI Prompt Engineering
**When**: Building AI module  
**How**:
```
Prompt to Bob:
"Create a system prompt for an AI plant care assistant. The AI should:
- Be knowledgeable about common houseplants
- Provide actionable advice
- Consider plant care history
- Be concise but thorough
Include context injection template."
```

**Result**: Bob generates professional prompt template with context variables, saving trial-and-error iterations.

---

### Use Case 5: API Integration Code
**When**: Connecting frontend to backend  
**How**:
```
Prompt to Bob:
"Create a TypeScript client for Strapi API with methods for:
- fetchPlants()
- createPlant(data)
- updatePlant(id, data)
- deletePlant(id)
Include error handling and TypeScript types."
```

**Result**: Bob generates complete API client with proper error handling and types.

---

### Use Case 6: Code Explanation & Refactoring
**When**: Understanding complex code or optimizing  
**How**:
```
Prompt to Bob:
"Explain this Strapi controller code and suggest performance optimizations:
[paste code]"
```

**Result**: Bob provides detailed explanation and suggests query optimizations, caching strategies, etc.

---

### Use Case 7: Test Data Generation
**When**: Testing features  
**How**:
```
Prompt to Bob:
"Generate 10 realistic plant objects with names, species, locations, 
and care notes for testing. Output as JSON array."
```

**Result**: Bob creates realistic test data instantly.

---

### Use Case 8: Debugging Assistance
**When**: Encountering errors  
**How**:
```
Prompt to Bob:
"I'm getting this error in Next.js API route:
[paste error]
Here's my code:
[paste code]
What's wrong and how do I fix it?"
```

**Result**: Bob identifies the issue and provides corrected code.

---

### Quantified Time Savings with IBM Bob

| Task | Without Bob | With Bob | Time Saved |
|------|-------------|----------|------------|
| Strapi schema design | 45 min | 5 min | 40 min |
| Component creation | 30 min | 8 min | 22 min |
| API client code | 60 min | 10 min | 50 min |
| Prompt engineering | 90 min | 15 min | 75 min |
| Debugging | 45 min | 10 min | 35 min |
| **Total** | **4.5 hours** | **48 min** | **3.7 hours** |

**For 2 developers over 2 days**: ~15 hours saved = 30% faster development

---

## 7. DEVELOPMENT PLAN - Time-Based Phases

### Phase 1: Foundation (Hours 0-6)

**Hour 0-1: Project Setup**
- [ ] Create monorepo structure
- [ ] Initialize Next.js with TypeScript
- [ ] Initialize Strapi project
- [ ] Set up shared types package
- [ ] Configure workspace dependencies

**Hour 1-2: Shared Contracts**
- [ ] Define Plant interface in `/shared`
- [ ] Define CareLog interface in `/shared`
- [ ] Define AI request/response interfaces
- [ ] Export all types from shared package

**Hour 2-4: Backend Setup (Both Devs)**
- [ ] Create Plant content type in Strapi
- [ ] Create CareLog content type in Strapi
- [ ] Configure relationships
- [ ] Test Strapi API with Postman
- [ ] Seed 5 sample plants

**Hour 4-6: Parallel Development Begins**

**Dev A**:
- [ ] Create basic Next.js layout
- [ ] Build PlantCard component with mock data
- [ ] Create plants list page
- [ ] Set up Tailwind CSS styling

**Dev B**:
- [ ] Research plant care knowledge base
- [ ] Design system prompt for AI
- [ ] Set up LLM provider client
- [ ] Test basic AI responses

---

### Phase 2: Core Features (Hours 6-18)

**Hour 6-10: Plant Management**

**Dev A**:
- [ ] Build PlantForm component
- [ ] Implement create plant functionality
- [ ] Connect to Strapi API (replace mocks)
- [ ] Build plant detail page
- [ ] Add delete plant feature

**Dev B**:
- [ ] Create context-aware prompt builder
- [ ] Implement plant data injection into prompts
- [ ] Test AI responses with different scenarios
- [ ] Build response formatting logic

**Hour 10-14: AI Integration**

**Dev A**:
- [ ] Create ChatBox component
- [ ] Build `/api/ai` route in Next.js
- [ ] Integrate AI module into API route
- [ ] Handle loading and error states
- [ ] Display AI responses in UI

**Dev B**:
- [ ] Optimize prompts for accuracy
- [ ] Add care history context to prompts
- [ ] Implement confidence scoring
- [ ] Create fallback responses
- [ ] Export AI functions for frontend

**Hour 14-18: Care Tracking**

**Dev A**:
- [ ] Build CareLogForm component
- [ ] Create care logging functionality
- [ ] Build CareTimeline component
- [ ] Display care history on plant detail page
- [ ] Add care type filtering

**Dev B**:
- [ ] Enhance AI with care log analysis
- [ ] Add care recommendations based on history
- [ ] Test edge cases (no care logs, many logs)
- [ ] Optimize response time

---

### Phase 3: Polish & Demo Prep (Hours 18-24)

**Hour 18-20: UI Polish**

**Dev A**:
- [ ] Improve responsive design
- [ ] Add loading skeletons
- [ ] Enhance error messages
- [ ] Add empty states
- [ ] Improve overall UX

**Dev B**:
- [ ] Fine-tune AI responses
- [ ] Add more plant species knowledge
- [ ] Test AI with edge cases
- [ ] Document AI capabilities

**Hour 20-22: Integration Testing**

**Both Devs**:
- [ ] Test complete user flows
- [ ] Fix integration bugs
- [ ] Verify data persistence
- [ ] Test AI accuracy
- [ ] Performance check

**Hour 22-24: Demo Preparation**

**Both Devs**:
- [ ] Create demo script
- [ ] Seed impressive demo data
- [ ] Prepare talking points about IBM Bob usage
- [ ] Test demo flow multiple times
- [ ] Create README with setup instructions
- [ ] Record demo video (backup)

---

### Deployment Checklist

**Frontend (Vercel)**:
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Configure environment variables
- [ ] Deploy and test

**Backend (Local/Optional)**:
- [ ] Document Strapi setup steps
- [ ] Create `.env.example`
- [ ] Test local deployment
- [ ] (Optional) Deploy to Railway/Render if time allows

---

## 8. RISK MITIGATION

### Potential Blockers & Solutions

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strapi setup issues | High | Use Strapi quickstart, keep SQLite default |
| LLM API rate limits | Medium | Implement caching, use fallback responses |
| Merge conflicts | Medium | Strict directory ownership, frequent pulls |
| Time overrun | High | Cut features aggressively, MVP first |
| AI responses too slow | Medium | Add loading states, optimize prompts |
| Deployment issues | Low | Focus on local demo, deploy if time allows |

---

## 9. SUCCESS METRICS

### Demo Must Show:
1. ✅ Add a new plant with photo
2. ✅ View plant list with cards
3. ✅ Ask AI a plant care question
4. ✅ Get intelligent, context-aware response
5. ✅ Log a care activity
6. ✅ View care history timeline

### IBM Bob Impact Story:
- Show before/after code generation
- Demonstrate time saved on component creation
- Highlight prompt engineering assistance
- Quantify development speed increase

---

## 10. QUICK REFERENCE COMMANDS

### Setup Commands
```bash
# Initialize monorepo
npm init -y
npm install -D typescript @types/node

# Create Next.js frontend
npx create-next-app@latest frontend --typescript --tailwind --app

# Create Strapi backend
npx create-strapi-app@latest backend --quickstart

# Create shared package
mkdir -p shared/src/types
cd shared && npm init -y
```

### Development Commands
```bash
# Run frontend
cd frontend && npm run dev

# Run Strapi
cd backend && npm run develop

# Run both (use concurrently)
npm install -D concurrently
# Add to root package.json:
# "dev": "concurrently \"npm run dev --prefix frontend\" \"npm run develop --prefix backend\""
```

### Strapi API Endpoints
```
GET    /api/plants
POST   /api/plants
GET    /api/plants/:id
PUT    /api/plants/:id
DELETE /api/plants/:id

GET    /api/care-logs
POST   /api/care-logs
GET    /api/care-logs/:id
```

---

## FINAL NOTES

This plan is optimized for **speed and parallel execution**. Key principles:

1. **Start with contracts** (shared types) - enables parallel work
2. **Use IBM Bob aggressively** - don't write boilerplate manually
3. **Mock first, integrate later** - don't wait for backend
4. **Cut features ruthlessly** - MVP only, no gold plating
5. **Test continuously** - catch issues early
6. **Demo-driven development** - build what looks good in demo

**Remember**: The goal is to demonstrate how IBM Bob accelerates development, not to build a production-ready app. Focus on the story: "We built this in 2 days with IBM Bob's help."

Good luck! 🚀🌱