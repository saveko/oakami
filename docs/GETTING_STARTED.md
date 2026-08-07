# Getting Started - Oakami Waste Intelligence System

## 🎯 What You Have

You now have a **production-ready MVP** with:

### ✅ Complete Database Schema (Prisma)
- 20+ models for all business entities
- Multi-tenancy support
- Proper relationships and indexing
- Ready for PostgreSQL

### ✅ Full Authentication System
- JWT-based authentication
- Refresh tokens
- Role-based access control
- Password hashing with bcrypt

### ✅ 4 Core API Modules (30+ endpoints)
1. **Waste Recording** — Track and manage food waste
2. **Inventory** — Monitor stock levels and expiry
3. **Organizations** — Multi-tenant management
4. **Ingredients** — Master data and categorization

### ✅ Frontend Scaffolding
- Next.js 14 with React 18
- Tailwind CSS ready
- TypeScript configuration
- Environment setup

### ✅ Docker Setup
- PostgreSQL 16
- Redis 7
- Docker Compose for easy local development

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Database
```bash
npm run docker:up
```

Wait for "healthy" status:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Step 3: Setup Database
```bash
cd packages/database
npm run migrate
```

### Step 4: Start Backend (Terminal 1)
```bash
cd apps/backend
npm run start:dev
```

You should see:
```
[NestApplication] Application running on port 3000
[NestApplication] Environment: development
```

### Step 5: Start Frontend (Terminal 2)
```bash
cd apps/frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
  - Local: http://localhost:3001
```

### Step 6: Test API
```bash
# Check health
curl http://localhost:3000/api/v1/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakami.local",
    "password": "SecurePassword123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakami.local",
    "password": "SecurePassword123"
  }'
```

---

## 📚 Available API Endpoints

### Authentication
```
POST   /api/v1/auth/register        # Create account
POST   /api/v1/auth/login           # Login (returns JWT token)
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/me              # Get profile (requires token)
```

### Waste Recording (Core Feature)
```
POST   /api/v1/waste                # Record waste entry
GET    /api/v1/waste                # List waste records (paginated)
GET    /api/v1/waste/:id            # Get waste record details
GET    /api/v1/waste/dashboard/stats # Dashboard statistics
PATCH  /api/v1/waste/:id/approve    # Approve waste record
PATCH  /api/v1/waste/:id/reject     # Reject waste record
```

### Inventory Management
```
POST   /api/v1/inventory                # Add stock
GET    /api/v1/inventory                # List inventory items
GET    /api/v1/inventory/:id            # Get item details
GET    /api/v1/inventory/summary        # Inventory summary
GET    /api/v1/inventory/expiring       # Expiring items alert
GET    /api/v1/inventory/low-stock      # Low stock alert
PATCH  /api/v1/inventory/:id            # Update item
PATCH  /api/v1/inventory/:id/adjust     # Adjust quantity
```

### Ingredients & Categories
```
POST   /api/v1/ingredients              # Add ingredient
GET    /api/v1/ingredients              # List ingredients (searchable)
GET    /api/v1/ingredients/:id          # Get ingredient
PATCH  /api/v1/ingredients/:id          # Update ingredient
DELETE /api/v1/ingredients/:id          # Delete ingredient

POST   /api/v1/ingredients/categories   # Add category
GET    /api/v1/ingredients/categories   # List categories
```

### Organizations
```
POST   /api/v1/organizations            # Create organization
GET    /api/v1/organizations/:id        # Get organization
GET    /api/v1/organizations/:id/settings  # Get settings
PATCH  /api/v1/organizations/:id/settings  # Update settings
GET    /api/v1/organizations/:id/stats     # Get statistics
```

### Health Check
```
GET    /api/v1/health                # API & database health
```

---

## 🔐 Authentication Example

All protected endpoints require a Bearer token:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakami.local",
    "password": "SecurePassword123"
  }'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clm7...",
    "email": "admin@oakami.local",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}

# 2. Use token in Authorization header
curl http://localhost:3000/api/v1/waste \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📁 Project Structure

```
oakami/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── waste/        # Waste recording module
│   │   │   ├── inventory/    # Inventory management
│   │   │   ├── organizations/# Multi-tenancy
│   │   │   ├── ingredients/  # Master data
│   │   │   └── main.ts       # Entry point
│   │   └── package.json
│   └── frontend/             # Next.js React app
│       ├── src/
│       │   ├── app/          # App Router
│       │   ├── styles/       # Global styles
│       │   └── components/   # React components
│       └── package.json
│
├── packages/
│   ├── database/             # Prisma + Schema
│   │   ├── prisma/schema.prisma
│   │   └── package.json
│   └── shared/               # Shared types (optional)
│
├── docker/
│   └── docker-compose.yml    # Services
│
├── docs/                      # Documentation
├── README.md                  # Main README
└── package.json               # Monorepo root
```

---

## 🛠️ Development Workflow

### Create a Feature Branch
```bash
git checkout -b feature/my-feature
```

### Make Changes
```bash
# Edit files in apps/backend, apps/frontend, or packages/database
```

### Commit Changes
```bash
git add .
git commit -m "feat: description of changes"
```

### Push to Remote
```bash
git push origin feature/my-feature
```

### Database Changes
```bash
cd packages/database

# Create new migration
npm run migrate:create -- add_new_table

# Review generated files in prisma/migrations/

# Apply migration
npm run migrate:dev

# Regenerate Prisma client
npm run generate
```

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
cd apps/backend && npm install
cd ../frontend && npm install
cd ../../packages/database && npm install
```

### Database connection failed
```bash
# Check Docker is running
docker ps

# Check PostgreSQL is healthy
docker logs oakami-db

# Restart services
npm run docker:down
npm run docker:up
```

### Port already in use
```bash
# Backend (3000)
lsof -i :3000 | grep LISTEN
kill -9 <PID>

# Frontend (3001)
lsof -i :3001 | grep LISTEN
kill -9 <PID>
```

### Reset everything
```bash
# Stop services
npm run docker:down

# Remove volumes
docker volume rm oakami_postgres_data oakami_redis_data

# Restart
npm run docker:up

# Reset database
cd packages/database
npm run reset
npm run migrate
```

---

## 📊 Database Models

The Prisma schema includes:

**Core Entities:**
- User, Organization, Role, Permission
- Ingredient, WasteCategory, WasteReason, Supplier
- WasteRecord, InventoryItem, Purchase
- Report, AIPrediction, Notification
- AuditLog

**Key Relationships:**
- Organizations → Users (multi-tenancy)
- Ingredients → Categories → Suppliers
- WasteRecords → Ingredients → Suppliers
- InventoryMovements → InventoryItems

See `packages/database/prisma/schema.prisma` for full details.

---

## 🔒 Security Features

✅ **Password Security:**
- Bcrypt hashing (10 rounds)
- Minimum 8 characters required

✅ **API Security:**
- JWT tokens (24-hour expiration)
- CORS configuration
- Input validation on all endpoints

✅ **Data Security:**
- SQL injection prevention (Prisma)
- XSS protection (React)
- Multi-tenancy isolation

✅ **Audit Trail:**
- All operations logged
- User tracking
- Change history

---

## 📈 Next Steps

1. **Implement Reports API** (2-3 days)
   - Daily/weekly/monthly reports
   - PDF export
   - Scheduled delivery

2. **Implement Analytics API** (3-4 days)
   - Trend analysis
   - Cost breakdown
   - Category performance

3. **Build Frontend UI** (3-4 days)
   - Dashboard
   - Waste recording form
   - Analytics charts
   - Settings page

4. **Add Advanced Features** (2-3 days)
   - AI predictions
   - Real-time notifications
   - Report automation

---

## 📞 Support

**Issues:**
- Check `docs/IMPLEMENTATION_PROGRESS.md` for detailed progress
- Review error messages in terminal logs
- Check Docker container logs: `docker logs oakami-db`

**Code References:**
- Database schema: `packages/database/prisma/schema.prisma`
- Backend entry: `apps/backend/src/main.ts`
- Auth module: `apps/backend/src/auth/`

---

## 🎯 Key Features Implemented

### Waste Recording ✅
- Record waste with ingredient, category, cost
- Approval workflow (Pending → Approved/Rejected)
- Dashboard stats with breakdown by category
- Top wasted ingredients analysis

### Inventory Tracking ✅
- Monitor stock levels
- Track expiring items (alerts for 30-day window)
- Low stock alerts
- Batch tracking for expiry management
- Quantity adjustments with audit trail

### Multi-Tenant Architecture ✅
- Organizations can have multiple users
- Data isolation via organizationId
- Organization settings (timezone, currency, alerts)
- Member management (add/remove users)

### Ingredient Management ✅
- Master ingredient database
- Category organization
- Supplier linking
- Search and filter capabilities
- Usage tracking

---

## 📝 Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://oakami:password@localhost:5432/oakami_db
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3001
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Database (.env)
```
DATABASE_URL=postgresql://oakami:password@localhost:5432/oakami_db
```

---

## 🚀 Production Deployment

When ready to deploy:

1. **Environment Variables:** Set production secrets
2. **Database:** Use managed PostgreSQL service
3. **API:** Deploy NestJS backend (Docker recommended)
4. **Frontend:** Deploy Next.js frontend (Vercel recommended)
5. **Monitoring:** Set up error tracking & logging
6. **Security:** Enable HTTPS, configure CORS properly

---

**Version:** 1.0.0  
**Status:** 🚀 MVP Ready  
**Last Updated:** August 2, 2026

---

*Ready to build amazing waste management features! 🌱*
