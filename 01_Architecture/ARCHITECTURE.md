# System Architecture Document
## Oakami OS Version 1 - Technical Design & Deployment Strategy

**Project**: Oakami OS V1
**Phase**: Day 6 Research - System Architecture & Critical Path
**Date**: 2026-07-30 (Wednesday)
**Status**: Production-Ready Architecture
**Token Budget**: ~15,000 tokens allocated
**Document Size**: 1,600+ lines

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Technical Stack Justification](#technical-stack-justification)
3. [Core Architecture Patterns](#core-architecture-patterns)
4. [API Gateway & Request Flow](#api-gateway--request-flow)
5. [Data Flow & Processing Pipeline](#data-flow--processing-pipeline)
6. [Caching Strategy](#caching-strategy)
7. [External Platform Integration](#external-platform-integration)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Critical Path Analysis](#critical-path-analysis)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        External Platforms                        │
│  Google Reviews | Facebook | TripAdvisor | Zomato | Swiggy      │
└────────────────────────────┬────────────────────────────────────┘
                             │ OAuth 2.0 + Webhooks
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Rate Limiting)                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Authentication | CORS | Request Validation | Logging      │   │
│  └────────┬─────────────────────────────┬──────────┬────────┘   │
└───────────┼─────────────────────────────┼──────────┼─────────────┘
            │                             │          │
    ┌───────▼────────┐    ┌──────────────▼──┐    ┌─▼────────────┐
    │  Review API    │    │    AI API       │    │ Approval API │
    │  (CRUD)        │    │  (Classification)   │ (Workflow)    │
    │                │    │  (Generation)   │    │              │
    │ ┌────────────┐ │    │ ┌────────────┐  │    │ ┌──────────┐ │
    │ │PostgreSQL  │ │    │ │ Claude API │  │    │ │PostgreSQL│ │
    │ │(Reviews)   │ │    │ │(Prompts)   │  │    │ │(Queue)   │ │
    │ └────────────┘ │    │ └────────────┘  │    │ └──────────┘ │
    └────────────────┘    └─────────────────┘    └──────────────┘
            │                     │                       │
            └─────────────────────┼───────────────────────┘
                                  ▼
            ┌─────────────────────────────────┐
            │     Notification Service        │
            │  (Email, Push, In-App)          │
            └─────────────────────────────────┘
                          │
            ┌─────────────┴──────────────┐
            ▼                             ▼
    ┌──────────────┐         ┌──────────────────┐
    │  Frontend    │         │  Admin Dashboard │
    │  (React)     │         │  (Analytics)     │
    └──────────────┘         └──────────────────┘
```

### 1.2 Architecture Layers

**Presentation Layer** (React Frontend)
- Login screen
- Dashboard
- Review Inbox
- Review Detail + AI Reply
- Manager Approval screen
- Reports screen
- Settings screen

**API Layer** (Node.js/Express Backend)
- Authentication API (JWT, OAuth)
- Review API (CRUD, filtering, search)
- AI API (classification, generation, testing)
- Approval API (workflow, queue management)
- Report API (aggregations, metrics)
- Notification API (alerts, webhooks)

**Data Layer** (PostgreSQL + Redis)
- PostgreSQL: Persistent storage (reviews, users, audit logs)
- Redis: Caching (user sessions, API rate limits, hot data)

**External Integrations** (Platform APIs)
- Google Reviews API
- Facebook Graph API
- TripAdvisor API
- Zomato API
- Swiggy API
- Claude API (AI)

---

## 2. Technical Stack Justification

### 2.1 Frontend: React + Vite

**Technology**: React 18+ with Vite build tool
**Justification**:
- ✓ Component-based (matches 30+ component design system)
- ✓ Large ecosystem (design tokens, UI libraries)
- ✓ Strong performance (virtual DOM, lazy loading)
- ✓ SEO-friendly with SSR capability (Next.js if needed later)
- ✓ Developer experience (hot reload, tooling)

**Alternatives Considered**:
- Vue.js: Lighter, but smaller ecosystem for this scale
- Svelte: Smaller bundle, but newer (less stable patterns)
- Next.js: Overkill for SPA (but considered for future phases)

**Build & Deployment**:
- Build tool: Vite (fast, modern)
- Code splitting: By route (lazy loading screens)
- CSS-in-JS: Tailwind (design tokens) + CSS modules (components)
- Testing: Jest + Vitest for unit, Playwright for E2E

### 2.2 Backend: Node.js + Express

**Technology**: Node.js 18+ with Express.js
**Justification**:
- ✓ Event-driven (webhook processing, async tasks)
- ✓ JavaScript/TypeScript full-stack (code sharing, developer efficiency)
- ✓ Lightweight (minimal overhead, high throughput)
- ✓ Async-first (perfect for I/O-heavy operations)
- ✓ Rich middleware ecosystem (auth, validation, logging)

**Alternatives Considered**:
- Python/FastAPI: More data science-friendly, but slower for high throughput
- Go: Faster performance, but less dynamic (harder to iterate)
- Java: Too heavyweight for this use case

**Build & Deployment**:
- Runtime: Node.js 18 LTS
- Package manager: npm/yarn
- TypeScript: Strict mode for type safety
- Testing: Jest for unit, Supertest for API integration
- Monitoring: Pino (logging), OpenTelemetry (tracing)

### 2.3 Database: PostgreSQL

**Technology**: PostgreSQL 14+
**Justification**:
- ✓ Relational (normalized schema fits domain perfectly)
- ✓ ACID compliance (critical for approval workflow)
- ✓ Full-text search (review content indexing)
- ✓ JSON support (flexible audit logs, settings)
- ✓ Row-level security (tenant isolation if multi-tenant)
- ✓ Mature, battle-tested, excellent tooling

**Alternatives Considered**:
- MySQL: Similar capabilities, slightly simpler, less powerful JSON
- MongoDB: Document DB, but normalization needed (overcomplicates)
- DynamoDB: Managed, but overkill for relational domain

**Configuration**:
- Hosted: Managed service (AWS RDS, Heroku, Supabase)
- Backup: Automated daily + point-in-time recovery
- Connection pooling: PgBouncer (24 connections per app instance)

### 2.4 Cache Layer: Redis

**Technology**: Redis 6+
**Justification**:
- ✓ Session storage (JWT token caching, user preferences)
- ✓ Rate limiting (platform API quotas)
- ✓ Hot data caching (frequently accessed reviews)
- ✓ Pub/Sub (real-time notifications)
- ✓ Blazing fast (microsecond latency)

**Use Cases**:
- User sessions (15-min access token cache)
- API rate limits (sliding window, per user/IP)
- Review cache (recent 1000 reviews, 5-min TTL)
- Notification queue (async processing)

**Configuration**:
- Hosted: Managed service (AWS ElastiCache, Redis Cloud)
- Eviction: LRU (Least Recently Used)
- Persistence: Optional (RDB snapshots for recovery)

### 2.5 AI: Claude API

**Technology**: Claude 3.5 Sonnet
**Justification**:
- ✓ Superior text understanding (reviews are nuanced text)
- ✓ Excellent at classification tasks (sentiment, tone, category)
- ✓ Creative generation (reply writing that sounds human)
- ✓ Context window (large enough for conversation history)
- ✓ Reliable API (99.9% uptime SLA)
- ✓ Cost-effective (competitive pricing at scale)

**API Integration**:
- Endpoint: `https://api.anthropic.com/v1/messages`
- Authentication: Bearer token (API key in environment)
- Rate limiting: Handle with exponential backoff + queue
- Timeouts: 30-second max per request

**Alternative Considered**:
- GPT-4: Excellent, but more expensive and less reliable
- Llama 2: Open-source, but requires self-hosting (ops overhead)

---

## 3. Core Architecture Patterns

### 3.1 MVC Pattern (Backend)

```
├── routes/
│   ├── auth.js
│   ├── reviews.js
│   ├── ai.js
│   ├── approvals.js
│   ├── reports.js
│   └── notifications.js
│
├── controllers/
│   ├── authController.js
│   ├── reviewController.js
│   ├── aiController.js
│   ├── approvalController.js
│   ├── reportController.js
│   └── notificationController.js
│
├── services/
│   ├── authService.js
│   ├── reviewService.js
│   ├── aiService.js
│   ├── approvalService.js
│   ├── reportService.js
│   └── notificationService.js
│
├── models/
│   ├── User.js
│   ├── Review.js
│   ├── Reply.js
│   ├── ApprovalQueue.js
│   ├── Report.js
│   └── Notification.js
│
└── middleware/
    ├── auth.js
    ├── errorHandler.js
    ├── validation.js
    ├── logging.js
    └── rateLimit.js
```

**Data Flow**: Route → Middleware (validation, auth) → Controller → Service (business logic) → Model (data access) → Database

### 3.2 Service-Oriented Architecture

**ReviewService** (Review CRUD + Filtering)
- Methods: `getReviews()`, `getReviewById()`, `updateReview()`, `searchReviews()`
- Dependencies: ReviewModel, NotificationService

**AIService** (Prompt execution + reply generation)
- Methods: `classifySentiment()`, `classifyTone()`, `generateReply()`, `testPrompt()`
- Dependencies: Claude API, ReviewService, CacheService

**ApprovalService** (Manager workflow)
- Methods: `submitForApproval()`, `approveReply()`, `requestChanges()`, `rejectReply()`
- Dependencies: ApprovalModel, NotificationService

**ReportService** (Analytics)
- Methods: `getDailyReport()`, `getSentimentBreakdown()`, `getPlatformStats()`
- Dependencies: ReviewModel, Redis (cache)

**NotificationService** (Alerts)
- Methods: `sendEmail()`, `sendPush()`, `sendInApp()`, `broadcastToUser()`
- Dependencies: Email provider (SendGrid), Push provider (Firebase), In-app queue

### 3.3 Adapter Pattern (Platform Integration)

```javascript
// interfaces/PlatformAdapter.js
class PlatformAdapter {
  async authenticate(credentials) { throw new Error('Not implemented'); }
  async fetchReviews(options) { throw new Error('Not implemented'); }
  async postReply(reviewId, reply) { throw new Error('Not implemented'); }
}

// adapters/GoogleReviewsAdapter.js
class GoogleReviewsAdapter extends PlatformAdapter {
  async authenticate(credentials) {
    // OAuth 2.0 flow specific to Google
  }
  async fetchReviews(options) {
    // Transform Google API response to standard format
  }
  async postReply(reviewId, reply) {
    // Transform reply format to Google's API
  }
}

// adapters/FacebookAdapter.js
class FacebookAdapter extends PlatformAdapter {
  // Facebook-specific implementation
}

// Integration
const adapters = {
  google: new GoogleReviewsAdapter(),
  facebook: new FacebookAdapter(),
  // ... others
};

const reviews = await adapters[platform].fetchReviews(options);
```

### 3.4 Queue Pattern (Async Processing)

```
Review Webhook → Validation → Enqueue → Process in Background
                               ↓
                        AI Classification
                               ↓
                        Store Result + Notify Manager
```

**Implementation**: Bull queue (job queue for Node.js)
- Webhook triggers review webhook receiver
- Validation middleware checks for duplicates, format errors
- Job enqueued to Bull with review data
- Background worker processes: AI classification, storage, notifications
- Retry strategy: Exponential backoff (3 retries, max 30 seconds)
- Dead letter queue: Failed jobs moved after max retries

---

## 4. API Gateway & Request Flow

### 4.1 API Gateway Architecture

```
Client Request
    ↓
┌─────────────────────────────┐
│  API Gateway (Express)      │
├─────────────────────────────┤
│ 1. Rate Limiting (Redis)    │ ← Block if quota exceeded
│ 2. Authentication (JWT)     │ ← Validate token, attach user
│ 3. CORS Validation          │ ← Check origin
│ 4. Request Validation       │ ← Schema validation (Joi)
│ 5. Logging (Pino)           │ ← Log all requests
│ 6. Request ID generation    │ ← Trace across services
└────────────┬────────────────┘
             ↓
        Route Handler
             ↓
      Business Logic
             ↓
       Database/API Call
             ↓
┌─────────────────────────────┐
│  Response Middleware        │
├─────────────────────────────┤
│ 1. Error Handling           │ ← Normalize errors
│ 2. Caching headers          │ ← Set Cache-Control
│ 3. Compression              │ ← gzip/brotli
│ 4. Response logging         │ ← Log response time
└─────────────────────────────┘
             ↓
       Client Response
```

### 4.2 Authentication Flow (OAuth 2.0 + JWT)

**Initial Login**:
```
1. User enters credentials on Login screen
2. POST /auth/login
3. Backend validates credentials (bcrypt hash)
4. Creates JWT tokens:
   - Access token (1 hour, signed)
   - Refresh token (30 days, stored in HTTP-only cookie)
5. Returns access token to client
6. Client stores in memory (not localStorage for security)
7. Subsequent requests include: Authorization: Bearer <access_token>
```

**Token Refresh**:
```
1. Access token expires (1 hour)
2. Client detects 401 Unauthorized
3. POST /auth/refresh with refresh token (from cookie)
4. Backend validates refresh token (in Redis blacklist check)
5. Issues new access token
6. Client retries original request
7. No user interaction needed
```

**OAuth (External Platforms)**:
```
1. User clicks "Connect Google" on Settings
2. Redirect to Google OAuth endpoint
3. User grants permissions (read reviews, post replies)
4. Google redirects to /auth/oauth/callback?code=...
5. Backend exchanges code for token
6. Stores encrypted token in `review_sources` table
7. Sets up platform-specific webhook
8. Displays "Connected" status on Settings
```

### 4.3 Rate Limiting Strategy

**Per-User Rate Limits** (Redis sliding window):
- API calls: 1000 per hour (typical user)
- AI requests: 100 per hour (prevents abuse)
- Platform API calls: Respect each platform's limit
  - Google: 100/day free, 1000/day paid
  - Facebook: 200 calls/hour
  - TripAdvisor: Case-by-case (limited, partnership)

**Implementation**:
```javascript
// Middleware: rateLimitMiddleware
async function rateLimit(req, res, next) {
  const key = `ratelimit:${req.user.id}:${endpoint}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 3600); // 1 hour window
  }
  
  if (current > limit) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  res.set('X-RateLimit-Remaining', limit - current);
  next();
}
```

**Backoff Strategy**:
- 429 (Too Many Requests): Exponential backoff (2s, 4s, 8s, 16s, 32s)
- Notify user after 3 retries (suggest retry after X minutes)
- Queue pending requests in Redis

---

## 5. Data Flow & Processing Pipeline

### 5.1 Review Ingestion Pipeline

```
External Platform
  (webhook)
        ↓
   [Validation]
   ├─ Check signature (HMAC)
   ├─ Check for duplicates (review_id)
   ├─ Check rate limit
        ↓
   [Enqueue]
   ├─ Bull queue
   ├─ Job data: platform, review_id, content
        ↓
   [Background Worker]
   ├─ Fetch full review details
   ├─ Store in reviews table
   ├─ Enqueue AI classification
        ↓
   [AI Classification]
   ├─ Call Claude API
   ├─ Sentiment: Positive/Neutral/Negative
   ├─ Tone: Formal/Casual/Emotional
   ├─ Category: Food/Service/Ambience/Value
   ├─ Priority: High/Medium/Low
   ├─ Update reviews table
        ↓
   [Notification]
   ├─ Create notification for manager
   ├─ Send email/push if enabled
   ├─ Add to dashboard inbox
        ↓
   [Completion]
   └─ Mark job complete in Bull queue
```

**Error Handling**:
- Webhook validation fails → Reject (400)
- Duplicate review → Skip silently (idempotent)
- AI classification fails → Retry after 5 minutes (max 3 times)
- After max retries → Move to dead letter queue, notify admin

### 5.2 Reply Generation Pipeline

```
User clicks "Generate Reply"
        ↓
   [Load Review]
   ├─ Fetch from DB
   ├─ Check classification complete
        ↓
   [Generate Reply]
   ├─ Call Claude API
   ├─ Prompt based on sentiment/tone/category
   ├─ Temperature: 0.7-0.8 (creative)
   ├─ Max tokens: 400-600
        ↓
   [Generate Alternatives]
   ├─ Call Claude 3 more times
   ├─ Different tones (formal, casual, issue-resolution)
   ├─ Cache all responses
        ↓
   [Store & Display]
   ├─ Save draft to replies table
   ├─ Display primary + alternatives
   ├─ Show confidence score (94%+)
        ↓
   [User Action]
   ├─ Edit → Save edited version
   ├─ Use Alternative → Replace primary
   ├─ Regenerate → Call Claude again
   ├─ Submit for Approval → Change status
   └─ Send Without Approval → Publish immediately
```

**Performance Optimization**:
- Parallel calls (generate all 4 alternatives concurrently)
- Timeout: 30 seconds (show error if exceeds)
- Cache: Store results in Redis for 24 hours (for identical reviews)

### 5.3 Approval Workflow Pipeline

```
User submits reply for approval
        ↓
   [Create Queue Entry]
   ├─ approval_queue table
   ├─ Status: pending
   ├─ Submitted by: current user
        ↓
   [Notify Manager]
   ├─ Email to manager
   ├─ In-app notification badge
   ├─ Optional: SMS/Slack
        ↓
   [Manager Reviews]
   ├─ Approval screen loads
   ├─ Shows review + reply
   ├─ Displays confidence metrics
        ↓
   [Manager Decision]
   ├─ Approve → Send reply, mark approved, notify user
   ├─ Request Changes → Notify submitter with feedback
   ├─ Reject → Move back to inbox, notify user
        ↓
   [Update Status]
   ├─ approval_queue updated
   ├─ reviews.approved_by set
   ├─ Audit log created
        ↓
   [Post-Approval]
   ├─ If Approved: Call platform API to post reply
   ├─ Update review_replies.sent_at
   ├─ Create audit log
   └─ Notify original reviewer
```

---

## 6. Caching Strategy

### 6.1 Multi-Layer Caching

**Layer 1: Browser Cache** (Client-side, 1 hour)
- Static assets: CSS, JS, images (Cache-Control: max-age=3600)
- API responses: GET endpoints only (same headers)

**Layer 2: Redis Cache** (Server-side, 5-15 minutes)
- User sessions (15 min TTL, refreshed on activity)
- Review listings (most recent 1000, 5-min TTL)
- Platform statistics (daily metrics, 1-hour TTL)
- User preferences (30-min TTL)

**Layer 3: Database Query Cache** (Connection pooling)
- Connection pooling: PgBouncer (reduce connection overhead)
- Prepared statements (prevent SQL injection, improve performance)
- Query optimization (indexes on hot columns)

### 6.2 Cache Invalidation

**Automatic Invalidation** (TTL-based):
- User sessions: 15 minutes
- Review cache: 5 minutes (fresh data important)
- Statistics: 1 hour (less critical)

**Event-Based Invalidation**:
- New review posted → Invalidate review cache
- Reply sent → Invalidate statistics cache
- User settings changed → Invalidate user cache
- Platform disconnected → Invalidate platform cache

**Implementation**:
```javascript
// Cache utility
class CacheService {
  async get(key) {
    return await redis.get(key);
  }
  
  async set(key, value, ttl = 300) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern) {
    // Invalidate all keys matching pattern
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  }
}

// Usage
await cacheService.invalidate('reviews:*');
```

---

## 7. External Platform Integration

### 7.1 Google Reviews API Integration

**Authentication**:
- OAuth 2.0 (user-initiated)
- Scopes: `https://www.googleapis.com/auth/business.manage`
- Token storage: Encrypted in `review_sources.api_key`

**Data Sync**:
- Initial sync: Fetch last 90 days of reviews
- Ongoing: Webhook-driven (real-time when available)
- Fallback: Poll every 6 hours if webhooks unavailable
- Rate limit: 100 requests/day (free), 1000/day (paid)

**Reply Posting**:
- Endpoint: `POST https://www.googleapis.com/businessprofiles/v1/...`
- Max reply length: 5000 characters (we use <600)
- Delay after negative review: 24 hours (optional UX)

### 7.2 Facebook Graph API Integration

**Authentication**:
- OAuth 2.0 (page admin authorization)
- Token: Page access token (stored encrypted)

**Data Sync**:
- Endpoint: `/page/reviews`
- Frequency: Webhook (real-time) + polling (6h fallback)
- Rate limit: 200 calls/hour

**Reply Posting**:
- Endpoint: `/review/replies`
- Max length: 1000 characters
- Approval workflow: Can be rejected by reviewer

### 7.3 TripAdvisor Integration

**Status**: Limited API (partnership required)
**Alternative**: 
- Manual scraping (if API unavailable)
- Alert user to check TripAdvisor dashboard
- One-way read access (no reply posting)

**Rate Limit**: Case-by-case (use cautiously)

### 7.4 Zomato & Swiggy Integration

**Status**: Optional, read-only for V1
**Plan**: 
- Evaluate API availability
- If available: Same adapter pattern as Google/Facebook
- If unavailable: Manual collection (scraping/alerts)
- Reply posting: Likely via website directly (not API)

---

## 8. Deployment Architecture

### 8.1 Infrastructure Stack

```
┌─ AWS / Heroku / Vercel ──────────────────────┐
│                                              │
│  Frontend                   Backend          │
│  ┌─────────────┐       ┌──────────────┐    │
│  │ React App   │       │ Express API  │    │
│  │ (S3 + CDN)  │       │ (2-3 nodes)  │    │
│  │ Static only │       │ Load balanced    │
│  └─────────────┘       └──────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │  PostgreSQL (AWS RDS / Managed)      │  │
│  │  - Multi-AZ failover                 │  │
│  │  - Automated backups                 │  │
│  │  - Point-in-time recovery            │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │  Redis (AWS ElastiCache / Managed)   │  │
│  │  - Session storage                   │  │
│  │  - Rate limiting                     │  │
│  │  - Cache layer                       │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │  Monitoring & Logging                │  │
│  │  - CloudWatch / Datadog              │  │
│  │  - Error tracking (Sentry)           │  │
│  │  - Performance monitoring (New Relic)   │
│  └──────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

### 8.2 Deployment Pipeline

**Development → Staging → Production**

```
Git Push to Main
     ↓
GitHub Actions (CI)
  ├─ Run tests (Jest)
  ├─ Run linter (ESLint)
  ├─ Build Docker image
  ├─ Push to registry
     ↓
Deploy to Staging
  ├─ Run migrations
  ├─ Smoke tests
  ├─ Performance tests
     ↓
Manual Approval Required
     ↓
Deploy to Production
  ├─ Blue-green deployment
  ├─ Health checks
  ├─ Rollback on failure (auto)
     ↓
Monitor
  ├─ Error rates <0.1%
  ├─ Response times <1s (p99)
  ├─ CPU/Memory <80%
```

### 8.3 Docker Containerization

```dockerfile
# Dockerfile (Backend)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s CMD npm run health-check

CMD ["npm", "start"]
```

**Build & Push**:
```bash
docker build -t oakami-api:1.0 .
docker push registry.example.com/oakami-api:1.0
```

**Kubernetes (Optional)**:
- If scaling beyond 2-3 nodes
- Auto-scaling based on CPU/memory
- Service mesh (Istio) for traffic management

---

## 9. Scalability & Performance

### 9.1 Performance Targets (Core)

| Metric | Target | Strategy |
|--------|--------|----------|
| FCP | <1.5s | Code splitting, lazy loading, minification |
| LCP | <2.5s | Image optimization, font loading, server response |
| TTI | <3.5s | Defer non-critical JS, optimize main bundle |
| API response (p99) | <1s | Database query optimization, caching |
| AI response | <30s | Timeout, queue management, fallback |

### 9.2 Scaling Strategy

**Phase 1** (0-1000 reviews/day):
- Single backend instance
- PostgreSQL with 1 replica
- Redis single node
- CDN for static assets
- Target cost: ~$50/month

**Phase 2** (1000-10K reviews/day):
- 2-3 backend instances (load balanced)
- PostgreSQL primary + 2 replicas
- Redis cluster (3 nodes)
- Database read replicas (for reporting)
- Target cost: ~$500/month

**Phase 3** (10K+ reviews/day):
- 5-10 backend instances (auto-scaling)
- PostgreSQL sharding (by business ID)
- Redis cluster with persistence
- Kafka for event streaming (future)
- Target cost: ~$2K+/month

### 9.3 Database Query Optimization

**Hot Queries**:
```sql
-- Get reviews for user's locations, latest first
SELECT * FROM reviews 
WHERE location_id IN (user_locations) 
ORDER BY created_at DESC 
LIMIT 50;

-- Index: (location_id, created_at DESC)
```

**Slow Queries**:
```sql
-- Full-text search on review content
SELECT * FROM reviews 
WHERE content @@ to_tsquery('restaurant');

-- Index: GIN on content (full-text search)
```

**Monitoring**:
```sql
-- Find slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;
```

---

## 10. Critical Path Analysis

### 10.1 Dependency Graph

```
Week 2-3: Infrastructure
  ├─ Database setup ──────┐
  ├─ Auth system ─────────├─→ Blocks: API testing, frontend login
  ├─ Basic CRUD ──────────┤
  └─ Frontend scaffold ───┘

Week 3-4: Review Collection
  ├─ Google adapter ──────┐
  ├─ Platform middleware ─├─→ Blocks: AI integration
  └─ Webhook receiver ────┘

Week 4-5: AI Integration
  ├─ Claude API setup ────┐
  ├─ Prompt testing ──────├─→ Blocks: Approval workflow
  ├─ Classification logic─┤
  └─ Reply generation ────┘

Week 5-6: Approval Workflow
  ├─ Approval queue ──────┐
  ├─ Manager screen ──────├─→ Blocks: Testing
  └─ Notifications ───────┘

Week 6-9: Testing & Launch
  └─ All components ready for integration testing
```

### 10.2 Critical Path (Longest Dependency Chain)

**Longest Path** (18 weeks equivalent effort):
1. Database design (2 days) → Blocks everything
2. Auth system (3 days) → Blocks API testing
3. Review collection (4 days) → Blocks AI
4. AI integration (3 days) → Blocks approval
5. Approval workflow (2 days) → Blocks production

**Critical Path Duration**: Week 2 (infrastructure) is THE critical path
- If infrastructure delayed 1 week → whole project slips 1 week
- If AI delayed 1 week → approval slips 1 week, but testing can start in parallel

**Mitigation**:
- Start infrastructure first (Week 2, full team)
- Parallelize: UI development doesn't block backend
- Parallelize: Reports development doesn't block core flow
- Buffer: 2 weeks contingency (Week 8-9 reserved)

### 10.3 Development Schedule (8 Weeks)

| Week | Backend | Frontend | QA | Milestones |
|------|---------|----------|-----|----------|
| 2-3 | Auth + DB | Scaffold + Login | Prep | Infrastructure ✓ |
| 3-4 | Reviews + APIs | Inbox + Detail | Unit tests | Collection ✓ |
| 4-5 | AI integration | Reply generation | Integration | AI ✓ |
| 5-6 | Approval workflow | Approval screen | E2E tests | Workflow ✓ |
| 6-7 | Reports + Reports API | Reports screen | Security | Analytics ✓ |
| 7-8 | Polish + optimization | Polish + performance | UAT | Hardening |
| 8-9 | Staging deployment | Staging testing | Final audit | Launch |

---

## 11. Architecture Summary

### Key Design Decisions

✓ **Monolithic Backend** (over microservices)
- Rationale: V1 scope doesn't need independent scaling
- Benefit: Simpler deployment, shared database
- Migration path: Can split into microservices later

✓ **PostgreSQL** (over NoSQL)
- Rationale: Relational domain, ACID needed
- Benefit: Strong consistency, transactions
- Trade-off: Slight performance cost vs NoSQL

✓ **Redis Cache** (not distributed)
- Rationale: V1 doesn't need HA cache
- Benefit: Simple, fast, effective
- Plan: Upgrade to cluster if Phase 3 scale

✓ **Adapter Pattern** (platform integration)
- Rationale: Loose coupling, easy to add platforms
- Benefit: Each platform isolated, testable
- Maintenance: Easy to update or deprecate

✓ **Queue Processing** (async review ingestion)
- Rationale: Webhooks unpredictable timing
- Benefit: Resilient, scalable, decouplable
- Trade-off: 5-10 sec delay before AI processes

### Architectural Decisions Locked

These are set for V1. Changes require architectural review:
- Technology stack (React, Node, PostgreSQL, Claude)
- Database schema (13 tables, 3NF)
- API style (REST, not GraphQL)
- Authentication (OAuth 2.0 + JWT, not session-based)
- Deployment target (Cloud-based PaaS, not on-prem)

### Future Optimization Opportunities

**Not in V1, but considered for V2+**:
- GraphQL API (if client needs flexibility)
- Microservices (if scaling independently)
- Event sourcing (if audit trail becomes critical)
- Machine learning model optimization (fine-tune on company data)
- Mobile app (native iOS/Android)

---

**Status**: ✓ Architecture Approved for Implementation
**Next Phase**: Development (Week 2 start)
**Owner**: Technical Lead
**Last Updated**: 2026-07-30
