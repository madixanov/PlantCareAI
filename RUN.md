# Run PlantCareAI Locally

## Prerequisites
- Node.js 20+
- npm 6+

## Setup

### 1. Backend (Terminal 1)
```bash
cd backend
npm install
npm run develop
```

Wait for: `Server started on http://localhost:1337`

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Wait for: `Ready on http://localhost:3000`

## Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:1337
- Admin Panel: http://localhost:1337/admin

## Quick Test
1. Open http://localhost:3000
2. Navigate to "My Plants"
3. Click on any plant
4. Try "Ask AI" feature
5. Try "Detect Disease" with an image

## Environment Variables
The `.env.local` file is already configured with:
- GROQ_API_KEY (add your key for AI features)
- NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

## Notes
- Backend must start first (Terminal 1)
- Frontend connects to backend automatically
- AI features require valid GROQ_API_KEY