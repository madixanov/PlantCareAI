# AI-Powered Plant Care System - IBM Hackathon

**Theme**: "Turn idea into impact faster"

A full-stack AI-powered plant care application demonstrating how IBM Bob IDE accelerates software development and reduces engineering effort.

---

## 🎯 Project Overview

This hackathon project showcases rapid development of a production-quality plant care system using:
- **Next.js** (App Router) with TypeScript
- **Strapi** headless CMS
- **AI/LLM** integration for intelligent plant care recommendations
- **IBM Bob IDE** as development accelerator

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`HACKATHON_EXECUTION_PLAN.md`](./HACKATHON_EXECUTION_PLAN.md) | Complete execution plan with MVP scope, architecture, workflows, and timelines |
| [`ARCHITECTURE_DIAGRAMS.md`](./ARCHITECTURE_DIAGRAMS.md) | Visual diagrams of system architecture, data flows, and component hierarchy |
| [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md) | Step-by-step setup guide to get from zero to coding in 15 minutes |

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd plant-care-system

# Install dependencies
npm install

# Start development servers
npm run dev

# Frontend: http://localhost:3000
# Strapi Admin: http://localhost:1337/admin
```

For detailed setup instructions, see [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md)

---

## 🏗️ Project Structure

```
plant-care-system/
├── frontend/          # Next.js application (Developer A)
├── backend/           # Strapi CMS (Shared setup)
├── ai/                # AI module (Developer B)
├── shared/            # Shared TypeScript types
└── docs/              # Documentation
```

---

## ✨ Key Features (MVP)

1. **Plant Management**
   - Add, view, and track plants
   - Upload plant photos
   - Store plant care information

2. **AI Plant Assistant**
   - Ask questions about plant care
   - Get context-aware recommendations
   - Intelligent responses based on plant data and care history

3. **Care Tracking**
   - Log care activities (watering, fertilizing, etc.)
   - View care history timeline
   - Track plant health over time

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + TypeScript | Modern React framework with App Router |
| Backend | Strapi v4 | Headless CMS with REST API |
| Database | SQLite | Lightweight database (dev), PostgreSQL (prod) |
| AI | OpenAI GPT-4 / Claude | LLM for plant care intelligence |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Deployment | Vercel + Railway | Frontend and backend hosting |

---

## 👥 Team Workflow

### Developer A: Frontend
- Build UI components
- Implement pages and routing
- Integrate with Strapi API
- Create AI chat interface

### Developer B: AI Module
- Design prompt engineering strategy
- Build LLM integration layer
- Create context-aware responses
- Optimize AI accuracy

**Parallel Development**: Both developers work independently using shared TypeScript interfaces, preventing merge conflicts and enabling fast iteration.

---

## 🤖 IBM Bob Usage

IBM Bob IDE accelerates development by:

1. **Component Generation**: Create React components with TypeScript in seconds
2. **API Client Code**: Generate Strapi integration code automatically
3. **Schema Design**: Build Strapi content type schemas quickly
4. **Prompt Engineering**: Design AI prompts with best practices
5. **Code Explanation**: Understand complex code instantly
6. **Debugging**: Identify and fix issues faster

**Estimated Time Savings**: 30-40% faster development compared to traditional methods

---

## 📊 Development Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1: Foundation** | 0-6 hours | Setup, shared types, Strapi models |
| **Phase 2: Core Features** | 6-18 hours | Plant management, AI integration, care tracking |
| **Phase 3: Polish & Demo** | 18-24 hours | UI polish, testing, demo preparation |

---

## 🎨 Architecture Highlights

### Data Flow
```
User → Next.js Frontend → Strapi API → SQLite Database
                ↓
         AI Module → LLM Provider
```

### Key Design Decisions
- **Monorepo structure** for parallel development
- **API-first approach** with shared TypeScript types
- **Strapi as single source of truth** for plant data
- **Next.js API routes** for AI integration
- **Context-aware AI** using plant and care log data

---

## 🔧 Development Commands

```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend

# Build for production
npm run build

# Run tests
npm test
```

---

## 🌐 API Endpoints

### Strapi REST API
```
GET    /api/plants              # List all plants
POST   /api/plants              # Create plant
GET    /api/plants/:id          # Get plant details
PUT    /api/plants/:id          # Update plant
DELETE /api/plants/:id          # Delete plant

GET    /api/care-logs           # List care logs
POST   /api/care-logs           # Create care log
```

### Next.js API Routes
```
POST   /api/ai                  # AI plant care consultation
```

---

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
OPENAI_API_KEY=your_api_key_here
```

### AI Module (`.env`)
```env
OPENAI_API_KEY=your_api_key_here
```

---

## 🎯 Demo Script

1. **Show plant list** - Display existing plants
2. **Add new plant** - Create plant with photo and details
3. **Ask AI question** - "My monstera leaves are turning yellow, what should I do?"
4. **View AI response** - Context-aware recommendation
5. **Log care activity** - Record watering
6. **View care timeline** - Show care history

**Key Message**: "We built this in 2 days with IBM Bob's help - demonstrating how AI-powered development tools turn ideas into impact faster."

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Deploy via Vercel CLI
vercel --prod
```

### Backend (Railway/Render)
```bash
# Deploy Strapi to Railway
railway up
```

---

## 📈 Success Metrics

- ✅ Complete MVP in 24-48 hours
- ✅ 2 developers working in parallel without conflicts
- ✅ 30%+ time savings using IBM Bob
- ✅ Production-ready demo
- ✅ Clear documentation of IBM Bob impact

---

## 🤝 Contributing

This is a hackathon project. For questions or suggestions:
1. Check documentation in `/docs`
2. Review architecture diagrams
3. Follow the execution plan

---

## 📄 License

MIT License - Built for IBM Hackathon 2024

---

## 🙏 Acknowledgments

- **IBM Bob IDE** - AI-powered development acceleration
- **Strapi** - Headless CMS framework
- **Next.js** - React framework
- **Vercel** - Deployment platform

---

**Built with ❤️ and IBM Bob IDE**

*Demonstrating how AI-powered development tools turn ideas into impact faster.*