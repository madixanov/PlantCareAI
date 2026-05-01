# Plant Care System - Frontend

A modern Next.js application for managing plants with AI-powered care recommendations.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Data Layer**: Mock API (ready for backend integration)

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with Navbar
│   ├── page.tsx             # Home/Dashboard page
│   ├── globals.css          # Global styles with Tailwind
│   ├── plants/
│   │   ├── page.tsx         # Plants list page
│   │   ├── add/
│   │   │   └── page.tsx     # Add plant form
│   │   └── [id]/
│   │       └── page.tsx     # Plant detail page
│   └── ai-assistant/
│       └── page.tsx         # AI assistant UI
├── components/              # Reusable React components
│   ├── Navbar.tsx          # Navigation bar
│   └── PlantCard.tsx       # Plant card component
├── lib/                     # Utility functions and services
│   ├── api.ts              # API service layer (mock data)
│   └── mock-data.ts        # Mock plant and care log data
├── types/                   # TypeScript type definitions
│   └── index.ts            # Shared types
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Features

### Pages

1. **Dashboard (/)** - Overview with stats and recent plants
2. **Plants List (/plants)** - Grid view of all plants
3. **Plant Detail (/plants/[id])** - Detailed view with:
   - Plant information
   - AI chat interface
   - Care history timeline
   - Care logging form
4. **Add Plant (/plants/add)** - Form to add new plants
5. **AI Assistant (/ai-assistant)** - General AI chat interface

### Components

- **Navbar** - Responsive navigation with active state
- **PlantCard** - Reusable plant card with image, name, species, location
- **Layout** - Root layout wrapper with footer

### Data Layer

- **Mock API** - Simulates backend API calls with delays
- **Service Functions**:
  - `getPlants()` - Fetch all plants
  - `getPlantById(id)` - Fetch single plant
  - `createPlant(data)` - Create new plant
  - `updatePlant(id, data)` - Update plant
  - `deletePlant(id)` - Delete plant
  - `getCareLogs(plantId)` - Fetch care logs
  - `createCareLog(data)` - Create care log
  - `askAI(plantId, question)` - AI assistant (mock responses)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Design System

### Colors

- **Primary**: Green shades (plant theme)
  - `primary-50` to `primary-900`
- **Gray**: Neutral colors for text and backgrounds
- **Semantic**: Red (danger), Blue (info), Yellow (warning)

### Components Classes

- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-danger` - Destructive action button
- `.card` - Card container
- `.input-field` - Form input field
- `.label` - Form label

### Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 📊 Mock Data

The application includes 6 sample plants with care logs:

1. Monstera Deliciosa
2. Snake Plant
3. Pothos
4. Fiddle Leaf Fig
5. Peace Lily
6. Spider Plant

Each plant has associated care logs (watering, fertilizing, pruning, etc.)

## 🔌 Backend Integration

The frontend is designed to easily integrate with a real backend:

1. **Update API base URL** in `lib/api.ts`:
   ```typescript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
   ```

2. **Replace mock functions** with real API calls:
   ```typescript
   export async function getPlants(): Promise<Plant[]> {
     const res = await fetch(`${API_URL}/api/plants`);
     const data = await res.json();
     return data.data;
   }
   ```

3. **Add environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:1337
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   ```

## 🤖 AI Integration

The AI assistant UI is complete but uses mock responses. To integrate real AI:

1. Create API route at `app/api/ai/route.ts`
2. Connect to AI backend service
3. Update `askAI()` function in `lib/api.ts`

## 📱 Features Implemented

✅ Responsive design (mobile + desktop)  
✅ Plant CRUD operations (UI)  
✅ Care log tracking  
✅ AI assistant interface  
✅ Mock data layer  
✅ TypeScript types  
✅ Tailwind styling  
✅ Component architecture  
✅ Navigation system  
✅ Form validation  
✅ Loading states  
✅ Error handling  

## 🚧 Not Implemented (As Per Requirements)

❌ Real backend connection  
❌ AI logic implementation  
❌ Image upload functionality  
❌ User authentication  
❌ Database integration  

## 📝 Notes

- All TypeScript errors are expected until dependencies are installed
- The application uses mock data for demonstration
- Backend and AI modules are separate and not included in this frontend
- Follow the architecture documents for backend integration

## 🎓 Built With

This frontend was built following the architecture diagrams and execution plan provided in:
- `ARCHITECTURE_DIAGRAMS.md`
- `HACKATHON_EXECUTION_PLAN.md`
- `QUICK_START_GUIDE.md`

## 📄 License

This project is part of the IBM Hackathon submission.