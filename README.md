# Oakami Waste Intelligence System

**Status:** 🚀 Development  
**Version:** 1.0.0  
**Target Launch:** Q3 2026

## 🎯 Overview

Oakami is an **enterprise-grade Restaurant Food Waste Intelligence System** that helps restaurants track, analyze, and reduce food waste through AI-powered insights and real-time analytics.

### Key Metrics Impact
- **Reduce** food waste by 25-40%
- **Save** $2,000+ per restaurant annually
- **Prevent** inventory loss through predictive alerts
- **Achieve** sustainability goals (track carbon footprint)

---

## 🏗️ Project Structure

```
oakami/
├── apps/
│   ├── backend/          # NestJS REST API
│   │   ├── src/
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── database/      # Prisma database layer
│   │   │   ├── config/        # Configuration management
│   │   │   ├── common/        # Shared utilities & filters
│   │   │   └── main.ts        # Application entry point
│   │   └── package.json
│   │
│   └── frontend/         # Next.js React App
│       ├── src/
│       │   ├── app/           # App router & layouts
│       │   ├── styles/        # Global styles
│       │   └── components/    # React components
│       └── package.json
│
├── packages/
│   ├── database/         # Prisma & Database Schema
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Complete data model
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   └── shared/           # Shared types & utilities
│       └── package.json
│
├── docker/
│   └── docker-compose.yml # PostgreSQL + Redis
│
├── scripts/
│   └── db/               # Database scripts
│
├── docs/                 # Documentation
├── tests/                # Test suites
└── package.json          # Monorepo root
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **React 18** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Data visualization
- **Zustand** — State management
- **Axios** — HTTP client

### Backend
- **NestJS** — TypeScript framework
- **Prisma** — ORM & migrations
- **PostgreSQL** — Relational database
- **Redis** — Caching & sessions
- **JWT** — Authentication
- **Passport.js** — Authorization

### DevOps
- **Docker** — Containerization
- **Docker Compose** — Local development
- **GitHub Actions** — CI/CD (coming)

---

## 📦 Core Modules

### ✅ Authentication
- User registration & login
- JWT tokens + refresh tokens
- Role-based access control (STAFF, MANAGER, OWNER, ADMIN)
- Password hashing with bcrypt

### ✅ Database Layer
- 20+ Prisma models
- Complete schema for:
  - Users & Permissions
  - Organizations & Settings
  - Ingredients & Categories
  - Inventory Management
  - Waste Recording
  - Suppliers & Purchases
  - Reports & Analytics
  - AI Predictions
  - Audit Logs

### 📋 (Coming Next)
- **Waste Recording API** — Multi-step form with photo upload
- **Analytics** — Dashboard KPIs, trend charts, heatmaps
- **Inventory Management** — Stock tracking, expiry alerts
- **Reports** — Daily/weekly/monthly reports
- **AI Insights** — Waste predictions, risk scoring
- **Frontend UI** — Connect with design system

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (if not using Docker)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL & Redis

```bash
npm run docker:up
```

Wait for services to be healthy:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 3. Setup Database

```bash
cd packages/database
npm run migrate
npm run seed
```

### 4. Start Backend

```bash
cd apps/backend
npm run start:dev
```

Backend will run on `http://localhost:3000`

### 5. Start Frontend (new terminal)

```bash
cd apps/frontend
npm run dev
```

Frontend will run on `http://localhost:3001`

---

## 📚 API Endpoints

### Authentication
```
POST   /api/v1/auth/register      # Create account
POST   /api/v1/auth/login         # Login
POST   /api/v1/auth/refresh       # Refresh token
POST   /api/v1/auth/me            # Get profile
```

### Health
```
GET    /api/v1/health             # API health check
```

### (Coming Soon)
- Waste Records API
- Inventory API
- Reports API
- Analytics API
- Suppliers API
- Users API

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Backend Tests
```bash
cd apps/backend
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

---

## 📝 Development Workflow

### Create a Feature Branch
```bash
git checkout -b feature/waste-recording-api
```

### Make Changes
- Edit files in `apps/backend/`, `apps/frontend/`, or `packages/database/`

### Database Changes
```bash
cd packages/database
npm run migrate:create -- add_waste_records
# Edit prisma/migrations/...
npm run migrate:dev
```

### Commit & Push
```bash
git add .
git commit -m "feat: add waste recording endpoints"
git push origin feature/waste-recording-api
```

---

## 🔒 Security Best Practices

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React)
- ✅ Audit logging for all actions

---

## 📊 Database Schema

Key models:
- **User** — Users with roles
- **Organization** — Multi-tenant support
- **Ingredient** — Menu items tracked
- **WasteRecord** — Individual waste entries
- **InventoryItem** — Stock tracking
- **Supplier** — Source management
- **AIPrediction** — ML predictions
- **Report** — Generated reports
- **AuditLog** — Compliance tracking

See `packages/database/prisma/schema.prisma` for full schema.

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs oakami-db

# Restart database
npm run docker:down
npm run docker:up
```

### Port Already in Use
```bash
# Backend (3000)
lsof -i :3000 | grep LISTEN

# Frontend (3001)
lsof -i :3001 | grep LISTEN

# Kill process
kill -9 <PID>
```

### Migration Issues
```bash
cd packages/database
npm run reset      # ⚠️ Drops all data!
npm run migrate
npm run seed
```

---

## 📋 Development Checklist

- [x] Project structure initialized
- [x] Monorepo setup (npm workspaces)
- [x] Database schema (Prisma)
- [x] Backend scaffolding (NestJS)
- [x] Authentication module
- [x] Frontend scaffolding (Next.js)
- [x] Docker Compose setup
- [ ] Waste Recording endpoints
- [ ] Analytics endpoints
- [ ] Inventory endpoints
- [ ] Waste Recording UI
- [ ] Dashboard UI
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Production deployment

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes following code style
3. Test your changes: `npm run test`
4. Commit: `git commit -am "feat: description"`
5. Push: `git push origin feature/name`
6. Create Pull Request

---

## 📚 Documentation

- [Design System](./docs/DESIGN_SYSTEM.md) — UI components & tokens
- [API Documentation](./docs/API.md) — Endpoint specifications
- [Database Schema](./packages/database/prisma/schema.prisma) — Data model
- [Deployment Guide](./docs/DEPLOYMENT.md) — Production setup

---

## 🎯 Next Steps

1. **Implement Waste Recording API** — Core feature
2. **Build Dashboard UI** — Connect to API
3. **Create Analytics Endpoints** — Trends & charts
4. **AI Integration** — Predictions & alerts
5. **Report Generation** — PDF exports
6. **Performance Optimization** — Load testing
7. **Security Audit** — Penetration testing
8. **Production Deployment** — Docker, CI/CD

---

## 📞 Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Documentation:** `/docs` folder

---

## 📄 License

Proprietary — All rights reserved

---

**Last Updated:** August 2, 2026  
**Version:** 1.0.0  
**Status:** 🚀 Active Development
