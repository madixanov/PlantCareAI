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

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY
npm run dev
```

## Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:1337
- Admin Panel: http://localhost:1337/admin