# Architecture Diagrams - Plant Care System

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[User Browser]
    end
    
    subgraph "Frontend - Next.js"
        Pages[Pages Layer]
        Components[Components Layer]
        APIRoutes[API Routes]
        StrapiClient[Strapi Client]
    end
    
    subgraph "Backend - Strapi CMS"
        PlantAPI[Plant API]
        CareLogAPI[Care Log API]
        Controllers[Controllers]
        Database[(SQLite DB)]
    end
    
    subgraph "AI Module"
        PromptEngine[Prompt Engine]
        LLMProvider[LLM Provider]
        ContextBuilder[Context Builder]
    end
    
    Browser --> Pages
    Pages --> Components
    Components --> StrapiClient
    Components --> APIRoutes
    
    StrapiClient --> PlantAPI
    StrapiClient --> CareLogAPI
    
    APIRoutes --> ContextBuilder
    ContextBuilder --> StrapiClient
    ContextBuilder --> PromptEngine
    PromptEngine --> LLMProvider
    
    PlantAPI --> Controllers
    CareLogAPI --> Controllers
    Controllers --> Database
    
    style Browser fill:#e1f5ff
    style Pages fill:#fff4e1
    style Components fill:#fff4e1
    style APIRoutes fill:#fff4e1
    style PlantAPI fill:#e8f5e9
    style CareLogAPI fill:#e8f5e9
    style Database fill:#f3e5f5
    style PromptEngine fill:#ffe0b2
    style LLMProvider fill:#ffe0b2
```

## 2. Data Flow - Plant Management

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Strapi
    participant Database
    
    User->>Frontend: Fill plant form
    User->>Frontend: Click "Add Plant"
    Frontend->>Frontend: Validate input
    Frontend->>Strapi: POST /api/plants
    Strapi->>Strapi: Validate schema
    Strapi->>Database: INSERT plant record
    Database-->>Strapi: Return plant with ID
    Strapi-->>Frontend: 201 Created + plant data
    Frontend->>Frontend: Update UI
    Frontend-->>User: Show success message
```

## 3. Data Flow - AI Consultation

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIRoute
    participant Strapi
    participant AIModule
    participant LLM
    
    User->>Frontend: Ask plant care question
    Frontend->>APIRoute: POST /api/ai
    APIRoute->>Strapi: GET /api/plants/:id
    Strapi-->>APIRoute: Return plant data
    APIRoute->>Strapi: GET /api/care-logs?plant=:id
    Strapi-->>APIRoute: Return care history
    APIRoute->>AIModule: buildContext(plant, careLogs)
    AIModule-->>APIRoute: Enriched context
    APIRoute->>AIModule: buildPrompt(question, context)
    AIModule-->>APIRoute: Complete prompt
    APIRoute->>LLM: Send prompt
    LLM-->>APIRoute: AI response
    APIRoute->>APIRoute: Format response
    APIRoute-->>Frontend: Return AI answer
    Frontend-->>User: Display answer
```

## 4. Data Flow - Care Logging

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Strapi
    participant Database
    
    User->>Frontend: Select care type
    User->>Frontend: Add notes
    User->>Frontend: Click "Log Care"
    Frontend->>Strapi: POST /api/care-logs
    Note over Strapi: Validate care type enum
    Strapi->>Database: INSERT care log
    Database-->>Strapi: Return care log with ID
    Strapi-->>Frontend: 201 Created
    Frontend->>Strapi: GET /api/care-logs?plant=:id
    Strapi-->>Frontend: Return updated history
    Frontend->>Frontend: Update timeline UI
    Frontend-->>User: Show updated care history
```

## 5. Component Hierarchy

```mermaid
graph TD
    RootLayout[Root Layout]
    
    RootLayout --> HomePage[Home Page]
    RootLayout --> PlantsPage[Plants List Page]
    RootLayout --> PlantDetailPage[Plant Detail Page]
    
    PlantsPage --> PlantCard1[Plant Card]
    PlantsPage --> PlantCard2[Plant Card]
    PlantsPage --> PlantCard3[Plant Card]
    PlantsPage --> AddPlantButton[Add Plant Button]
    
    PlantDetailPage --> PlantHeader[Plant Header]
    PlantDetailPage --> PlantInfo[Plant Info Section]
    PlantDetailPage --> ChatBox[AI Chat Box]
    PlantDetailPage --> CareTimeline[Care Timeline]
    PlantDetailPage --> CareLogForm[Care Log Form]
    
    AddPlantButton --> PlantForm[Plant Form Modal]
    
    ChatBox --> MessageList[Message List]
    ChatBox --> ChatInput[Chat Input]
    
    CareTimeline --> CareLogItem1[Care Log Item]
    CareTimeline --> CareLogItem2[Care Log Item]
    CareTimeline --> CareLogItem3[Care Log Item]
    
    style RootLayout fill:#e3f2fd
    style PlantsPage fill:#fff9c4
    style PlantDetailPage fill:#fff9c4
    style ChatBox fill:#f3e5f5
    style CareTimeline fill:#e8f5e9
```

## 6. Monorepo Structure Visualization

```mermaid
graph LR
    Root[plant-care-system/]
    
    Root --> Frontend[frontend/]
    Root --> Backend[backend/]
    Root --> AI[ai/]
    Root --> Shared[shared/]
    
    Frontend --> FrontendSrc[src/]
    FrontendSrc --> App[app/]
    FrontendSrc --> Components[components/]
    FrontendSrc --> Lib[lib/]
    
    Backend --> BackendSrc[src/]
    BackendSrc --> APIFolder[api/]
    APIFolder --> PlantAPI[plant/]
    APIFolder --> CareLogAPI[care-log/]
    
    AI --> AISrc[src/]
    AISrc --> Prompts[prompts/]
    AISrc --> Providers[providers/]
    AISrc --> Utils[utils/]
    
    Shared --> SharedSrc[src/]
    SharedSrc --> Types[types/]
    SharedSrc --> Constants[constants/]
    
    style Root fill:#e1f5ff
    style Frontend fill:#fff4e1
    style Backend fill:#e8f5e9
    style AI fill:#ffe0b2
    style Shared fill:#f3e5f5
```

## 7. Parallel Development Workflow

```mermaid
gantt
    title Hackathon Development Timeline
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Setup
    Project Init           :done, setup1, 00:00, 1h
    Shared Types          :done, setup2, 01:00, 1h
    Strapi Models         :done, setup3, 02:00, 2h
    
    section Dev A - Frontend
    UI Components         :active, devA1, 04:00, 4h
    Strapi Integration    :devA2, 08:00, 4h
    AI Integration        :devA3, 12:00, 4h
    UI Polish            :devA4, 16:00, 4h
    
    section Dev B - AI
    Prompt Design         :active, devB1, 04:00, 4h
    LLM Integration       :devB2, 08:00, 4h
    Context Builder       :devB3, 12:00, 4h
    AI Optimization       :devB4, 16:00, 4h
    
    section Integration
    Testing              :test1, 20:00, 2h
    Demo Prep            :demo1, 22:00, 2h
```

## 8. Data Model Relationships

```mermaid
erDiagram
    PLANT ||--o{ CARE_LOG : has
    
    PLANT {
        int id PK
        string name
        string species
        string location
        media photo
        text notes
        date acquiredDate
        datetime createdAt
        datetime updatedAt
    }
    
    CARE_LOG {
        int id PK
        enum careType
        text notes
        datetime date
        int plant_id FK
        datetime createdAt
        datetime updatedAt
    }
```

## 9. AI Module Architecture

```mermaid
graph TB
    subgraph "AI Module Internal"
        Input[User Question + Plant ID]
        
        Input --> Fetcher[Data Fetcher]
        Fetcher --> PlantData[Plant Data]
        Fetcher --> CareHistory[Care History]
        
        PlantData --> ContextBuilder[Context Builder]
        CareHistory --> ContextBuilder
        
        ContextBuilder --> EnrichedContext[Enriched Context]
        
        EnrichedContext --> PromptEngine[Prompt Engine]
        Input --> PromptEngine
        
        PromptEngine --> SystemPrompt[System Prompt]
        PromptEngine --> UserPrompt[User Prompt]
        
        SystemPrompt --> LLMClient[LLM Client]
        UserPrompt --> LLMClient
        
        LLMClient --> ResponseFormatter[Response Formatter]
        ResponseFormatter --> Output[Formatted AI Response]
    end
    
    style Input fill:#e3f2fd
    style ContextBuilder fill:#fff9c4
    style PromptEngine fill:#f3e5f5
    style LLMClient fill:#ffe0b2
    style Output fill:#e8f5e9
```

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph "Production"
        Vercel[Vercel - Frontend]
        Local[Local/Railway - Strapi]
        LLMService[LLM API Service]
    end
    
    subgraph "Development"
        DevFrontend[localhost:3000]
        DevStrapi[localhost:1337]
        DevLLM[LLM API]
    end
    
    Users[Users] --> Vercel
    Vercel --> Local
    Vercel --> LLMService
    
    Developers[Developers] --> DevFrontend
    DevFrontend --> DevStrapi
    DevFrontend --> DevLLM
    
    style Vercel fill:#e8f5e9
    style Local fill:#fff9c4
    style LLMService fill:#ffe0b2
    style DevFrontend fill:#e3f2fd
    style DevStrapi fill:#f3e5f5
```

## 11. IBM Bob Integration Points

```mermaid
graph LR
    subgraph "Development Tasks"
        Task1[Component Creation]
        Task2[API Client Code]
        Task3[Strapi Schema]
        Task4[Prompt Engineering]
        Task5[Type Definitions]
        Task6[Bug Fixing]
    end
    
    subgraph "IBM Bob Assistance"
        Bob[IBM Bob IDE]
    end
    
    subgraph "Output"
        Code1[React Components]
        Code2[API Functions]
        Code3[JSON Schemas]
        Code4[Prompt Templates]
        Code5[TypeScript Types]
        Code6[Fixed Code]
    end
    
    Task1 --> Bob
    Task2 --> Bob
    Task3 --> Bob
    Task4 --> Bob
    Task5 --> Bob
    Task6 --> Bob
    
    Bob --> Code1
    Bob --> Code2
    Bob --> Code3
    Bob --> Code4
    Bob --> Code5
    Bob --> Code6
    
    style Bob fill:#ffe0b2
    style Task1 fill:#e3f2fd
    style Task2 fill:#e3f2fd
    style Task3 fill:#e3f2fd
    style Task4 fill:#e3f2fd
    style Task5 fill:#e3f2fd
    style Task6 fill:#e3f2fd
```

## 12. User Journey Flow

```mermaid
graph TD
    Start([User Opens App]) --> ViewPlants[View Plant List]
    
    ViewPlants --> Decision1{What to do?}
    
    Decision1 -->|Add New| AddPlant[Fill Plant Form]
    Decision1 -->|View Details| SelectPlant[Click Plant Card]
    
    AddPlant --> SubmitPlant[Submit Form]
    SubmitPlant --> ViewPlants
    
    SelectPlant --> PlantDetail[Plant Detail Page]
    
    PlantDetail --> Decision2{What to do?}
    
    Decision2 -->|Ask AI| TypeQuestion[Type Question]
    Decision2 -->|Log Care| FillCareForm[Fill Care Form]
    Decision2 -->|View History| ScrollTimeline[Scroll Timeline]
    
    TypeQuestion --> SendQuestion[Send to AI]
    SendQuestion --> ViewResponse[View AI Response]
    ViewResponse --> Decision2
    
    FillCareForm --> SubmitCare[Submit Care Log]
    SubmitCare --> UpdateTimeline[Timeline Updates]
    UpdateTimeline --> Decision2
    
    ScrollTimeline --> Decision2
    
    Decision2 -->|Done| ViewPlants
    
    style Start fill:#e3f2fd
    style ViewPlants fill:#fff9c4
    style PlantDetail fill:#fff9c4
    style ViewResponse fill:#e8f5e9
    style UpdateTimeline fill:#e8f5e9
```

---

## Notes on Diagrams

All diagrams are created using Mermaid syntax for easy rendering in markdown viewers and documentation platforms. These diagrams provide visual clarity for:

1. **System Architecture**: High-level component interaction
2. **Data Flows**: Step-by-step sequence of operations
3. **Component Hierarchy**: Frontend structure organization
4. **Development Workflow**: Parallel team coordination
5. **Data Models**: Database relationships
6. **Deployment**: Production vs development environments
7. **User Journey**: End-to-end user experience

Use these diagrams during:
- Team onboarding
- Architecture discussions
- Demo presentations
- Documentation