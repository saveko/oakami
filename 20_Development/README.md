# Oakami OS V1 - Development Phase

**Status:** Week 2 Scaffolding (Ready for Development)

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
```bash
psql oakami_dev < database/01_init_schema.sql
```

## Structure

```
20_Development/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Custom middleware
│   │   ├── services/    # External services (Claude API, OAuth)
│   │   └── utils/       # Utilities
│   ├── package.json
│   └── .env.example
├── frontend/            # React 18+ SPA
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page containers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── stores/      # Zustand state
│   │   ├── services/    # API clients
│   │   └── utils/       # Utilities
│   ├── package.json
│   └── vite.config.js
├── database/            # PostgreSQL schema & migrations
│   └── 01_init_schema.sql
└── docs/
    └── DEVELOPMENT_SETUP.md
```

## Key Implementation Areas

### Week 2 (Infrastructure - Critical Path)
- [ ] Backend server setup & health checks
- [ ] Database connection pooling
- [ ] JWT authentication middleware
- [ ] Redis connection & job queue setup
- [ ] CORS & security middleware (helmet)

### Week 3 (Authentication - Critical Path)
- [ ] Google OAuth 2.0 integration
- [ ] Facebook OAuth integration
- [ ] Session management
- [ ] Role-based access control (RBAC)

### Week 4-5 (Core Features)
- [ ] Platform API integrations (TripAdvisor, Zomato, Swiggy)
- [ ] Review sync service
- [ ] AI classification (Claude API)
- [ ] AI reply generation

### Week 6-7 (UI & Refinement)
- [ ] React page components
- [ ] Form validation
- [ ] Responsive design
- [ ] Error handling

### Week 8 (Testing & Deployment)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Docker containerization
- [ ] Production deployment

## Design System Reference
- See `FIGMA_DESIGN_GUIDE.md` for complete UI specifications
- Color palette, typography, component specs all documented
- 7 screen layouts ready for implementation

## API Specification
- See `API_RESEARCH.md` for detailed endpoint specifications
- All 6 external platform APIs documented
- Request/response formats and error handling defined

## Database Schema
- See `DATABASE_FINAL.md` for complete schema documentation
- 13 tables with proper normalization and indexing
- Field-level encryption and audit trail included

## Development Notes
- Frontend uses Tailwind CSS for styling
- Backend uses Express with modular architecture
- State management: Zustand (frontend)
- API communication: Axios (frontend), Express middleware (backend)

## Next Steps
1. Install dependencies in backend/ and frontend/
2. Configure environment variables (.env files)
3. Initialize PostgreSQL database
4. Start development servers
5. Begin implementing routes and components per the roadmap

See `docs/DEVELOPMENT_SETUP.md` for detailed instructions.
