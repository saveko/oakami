# Oakami OS V1 - Development Setup Guide

## Overview
This guide covers setting up the development environment for Oakami OS V1, a restaurant review collection and AI reply generation system.

**Project Structure:**
- `backend/` - Node.js/Express API server
- `frontend/` - React 18+ web application
- `database/` - PostgreSQL schema and migrations

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (for job queues)
- Git

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Create database and user
createdb oakami_dev
psql oakami_dev < ../database/01_init_schema.sql
```

### 4. Start Backend
```bash
npm run dev
```
Backend runs on `http://localhost:3001`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Frontend
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## Development Workflow

### API Routes
All API routes are prefixed with `/api/v1/` (stub routes exist in `src/index.js`)

**Auth:**
- `POST /api/auth/login`
- `POST /api/auth/register`

**Reviews:**
- `GET /api/reviews` - List reviews
- `POST /api/reviews/sync` - Sync from platforms

**Replies:**
- `POST /api/replies/generate` - Generate AI reply
- `POST /api/replies/approve` - Approve reply for posting

### Component Structure
React components follow the design system from `UI_SPECIFICATION.md`:
- Pages: `src/pages/`
- Reusable Components: `src/components/`
- State Management: `src/stores/` (Zustand)
- API Services: `src/services/`

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Database Migrations
New migrations go in `database/` with sequential numbering:
- `01_init_schema.sql`
- `02_add_feature.sql`
- etc.

Apply with:
```bash
psql oakami_dev < database/02_add_feature.sql
```

## Deployment
See `ARCHITECTURE.md` for deployment strategy (Docker, AWS/Heroku/Vercel)

## Architecture Overview
- 7-layer backend architecture with service adapters
- React frontend with Zustand state management
- PostgreSQL with Redis caching
- Claude 3.5 Sonnet for AI classification and reply generation
- Webhook integration with 6 external review platforms

See research documents in `00_Research/` for complete specifications.
