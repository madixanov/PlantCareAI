# AI Plant Care Assistant - Strapi Backend

## 🎯 Overview

Minimal Strapi v5 backend for the AI Plant Care Assistant MVP. Provides REST API for plant management and care tracking.

---

## 🚀 Quick Start

### 1. Install Dependencies (if not already done)
```bash
cd backend
npm install
```

### 2. Build the Admin Panel
```bash
npm run build
```

### 3. Start Development Server
```bash
npm run develop
```

The server will start on:
- **API**: http://localhost:1337/api
- **Admin Panel**: http://localhost:1337/admin

### 4. Create Admin User

On first run, you'll be prompted to create an admin user:
- Email: your-email@example.com
- Password: (choose a secure password)

---

## 📊 Content Types

### 1. Plant

**API Endpoint**: `/api/plants`

**Fields**:
- `name` (string, required) - Plant name
- `species` (string, required) - Scientific/common species name
- `photo` (media, optional) - Plant photo
- `location` (string, optional) - Where the plant is located
- `notes` (text, optional) - Additional notes
- `acquiredDate` (date, optional) - When you got the plant

**AI-Related Fields**:
- `lightLevel` (enum: low/medium/high) - Light requirements
- `humidity` (enum: low/medium/high) - Humidity preference
- `temperaturePreference` (enum: cold/moderate/warm) - Temperature preference
- `isToxicToPets` (boolean) - Pet safety indicator

**Relations**:
- `care_logs` (one-to-many) - Related care logs

---

### 2. Care Log

**API Endpoint**: `/api/care-logs`

**Fields**:
- `careType` (enum, required) - Type of care activity
  - watering
  - fertilizing
  - pruning
  - repotting
  - other
- `notes` (text, optional) - Care activity notes
- `date` (datetime, required) - When the care was performed
- `plant` (relation, required) - Related plant

---

## 🔌 API Endpoints

### Plants

```bash
# Get all plants
GET http://localhost:1337/api/plants

# Get single plant with care logs
GET http://localhost:1337/api/plants/:id?populate=care_logs

# Create plant
POST http://localhost:1337/api/plants
Content-Type: application/json

{
  "data": {
    "name": "Monstera",
    "species": "Monstera deliciosa",
    "location": "Living Room",
    "lightLevel": "medium",
    "humidity": "medium",
    "temperaturePreference": "warm",
    "isToxicToPets": true
  }
}

# Update plant
PUT http://localhost:1337/api/plants/:id
Content-Type: application/json

{
  "data": {
    "location": "Bedroom"
  }
}

# Delete plant
DELETE http://localhost:1337/api/plants/:id
```

### Care Logs

```bash
# Get all care logs
GET http://localhost:1337/api/care-logs?populate=plant

# Get care logs for specific plant
GET http://localhost:1337/api/care-logs?filters[plant][id][$eq]=1&populate=plant

# Create care log
POST http://localhost:1337/api/care-logs
Content-Type: application/json

{
  "data": {
    "careType": "watering",
    "notes": "Regular watering",
    "date": "2024-05-30T10:00:00Z",
    "plant": 1
  }
}
```

---

## 🔐 Access Control

**Public Access Enabled** for MVP/Demo purposes:
- ✅ find (GET all)
- ✅ findOne (GET by ID)
- ✅ create (POST)
- ✅ update (PUT)
- ✅ delete (DELETE)

**No authentication required** for hackathon demo.

---

## 🌱 Demo Data

The backend automatically seeds demo data on first run:

**5 Plants**:
1. Monstera Deliciosa (Living Room)
2. Snake Plant (Bedroom)
3. Pothos (Kitchen)
4. Spider Plant (Bathroom)
5. Peace Lily (Office)

**10 Care Logs**:
- Various care activities distributed across plants
- Realistic timestamps and notes
- Mix of watering, fertilizing, pruning, repotting

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── plant/
│   │   │   ├── content-types/plant/
│   │   │   │   └── schema.json          # Plant content type definition
│   │   │   ├── controllers/
│   │   │   │   └── plant.ts             # Plant controller
│   │   │   ├── services/
│   │   │   │   └── plant.ts             # Plant service
│   │   │   └── routes/
│   │   │       └── plant.ts             # Plant routes
│   │   └── care-log/
│   │       ├── content-types/care-log/
│   │       │   └── schema.json          # Care Log content type
│   │       ├── controllers/
│   │       │   └── care-log.ts
│   │       ├── services/
│   │       │   └── care-log.ts
│   │       └── routes/
│   │           └── care-log.ts
│   └── index.ts                         # Bootstrap with seeding & permissions
├── database/
│   └── .tmp/data.db                     # SQLite database
├── .env                                 # Environment variables
└── package.json
```

---

## 🛠️ Development Commands

```bash
# Start development server (with auto-reload)
npm run develop

# Build admin panel
npm run build

# Start production server
npm start

# Generate TypeScript types
npm run strapi ts:generate-types
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
HOST=0.0.0.0
PORT=1337

# Database (SQLite for MVP)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Security keys (auto-generated)
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
```

---

## 🎨 Admin Panel Features

Access at http://localhost:1337/admin

1. **Content Manager**
   - View/Edit/Delete plants
   - View/Edit/Delete care logs
   - Upload plant photos

2. **Content-Type Builder**
   - Modify Plant schema
   - Modify Care Log schema
   - Add new fields (if needed)

3. **Settings**
   - Configure API permissions
   - Manage roles
   - API tokens

---

## 🔗 Frontend Integration

### Example: Fetch Plants

```typescript
// frontend/lib/api.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getPlants() {
  const response = await fetch(`${STRAPI_URL}/api/plants?populate=care_logs`);
  const data = await response.json();
  return data.data;
}

export async function getPlantById(id: string) {
  const response = await fetch(`${STRAPI_URL}/api/plants/${id}?populate=care_logs`);
  const data = await response.json();
  return data.data;
}

export async function createPlant(plantData: any) {
  const response = await fetch(`${STRAPI_URL}/api/plants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: plantData }),
  });
  const data = await response.json();
  return data.data;
}
```

---

## 📝 Response Format

Strapi returns data in a specific format:

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Monstera Deliciosa",
      "species": "Monstera deliciosa",
      "location": "Living Room",
      "lightLevel": "medium",
      "createdAt": "2024-05-30T10:00:00.000Z",
      "updatedAt": "2024-05-30T10:00:00.000Z",
      "care_logs": {
        "data": [...]
      }
    }
  },
  "meta": {}
}
```

---

## 🚀 Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 2: Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Option 3: Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

---

## 🐛 Troubleshooting

### Issue: TypeScript errors during build

**Solution**: Type assertions with `as any` are used for MVP speed. Types will be generated after first build.

### Issue: Database locked

**Solution**: Stop all Strapi instances and delete `.tmp/data.db.lock`

### Issue: Port already in use

**Solution**: Change PORT in `.env` or kill process on port 1337

### Issue: Permissions not working

**Solution**: Check bootstrap function in `src/index.ts` ran successfully

---

## ✅ MVP Checklist

- [x] Strapi installed and configured
- [x] Plant content type created
- [x] Care Log content type created
- [x] Relations configured (Plant ↔ Care Logs)
- [x] Public API permissions enabled
- [x] Demo data seeding implemented
- [x] REST API endpoints working
- [x] Admin panel accessible
- [x] Documentation complete

---

## 🎯 Next Steps (Post-MVP)

1. **Authentication**: Add user authentication
2. **Image Upload**: Configure media library for plant photos
3. **Validation**: Add field validation rules
4. **PostgreSQL**: Switch from SQLite to PostgreSQL for production
5. **API Tokens**: Secure API with tokens
6. **Rate Limiting**: Add rate limiting for public endpoints
7. **Webhooks**: Add webhooks for real-time updates

---

## 📚 Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)
- [Content Type Builder](https://docs.strapi.io/user-docs/content-type-builder)

---

**Built with ❤️ for IBM Hackathon 2024**

*Demonstrating rapid MVP development with Strapi and IBM Bob IDE*
