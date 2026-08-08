# Oakami OS V1 - Backend API

## Overview
Node.js/Express REST API server for Oakami OS V1. Handles review sync, AI reply generation, platform integrations, and manager approvals.

## Architecture
7-layer architecture:
1. **Routes** - Express route handlers
2. **Controllers** - Request/response handling
3. **Middleware** - Authentication, validation, error handling
4. **Services** - Business logic (Claude API, platform APIs)
5. **Models** - Database queries
6. **Utils** - Helpers and utilities
7. **Config** - Environment and configuration

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Server runs on `http://localhost:3001`

## Environment Variables
See `.env.example` for all required variables:
- Database credentials
- API keys (Anthropic, OAuth)
- JWT secret
- Redis connection

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Reviews
- `GET /api/reviews` - List reviews (with filters)
- `GET /api/reviews/:id` - Get review details
- `POST /api/reviews/sync` - Sync reviews from platforms
- `DELETE /api/reviews/:id` - Delete review

### Replies
- `POST /api/replies/generate` - Generate AI reply
- `GET /api/replies/:id` - Get reply details
- `PATCH /api/replies/:id` - Update draft reply
- `POST /api/replies/:id/approve` - Request manager approval
- `DELETE /api/replies/:id` - Delete draft reply

### Reports
- `GET /api/reports/summary` - Dashboard summary
- `GET /api/reports/analytics` - Detailed analytics
- `GET /api/reports/export` - Export data

### Admin
- `GET /api/admin/integrations` - List platform integrations
- `POST /api/admin/integrations` - Connect new platform
- `DELETE /api/admin/integrations/:id` - Disconnect platform

## Key Services

### Claude API Service
Handles AI classification and reply generation:
```javascript
// Classification (low temperature for consistency)
const classified = await classifyReview(reviewText);
// Returns: { sentiment, tone, category, priority }

// Reply Generation (higher temperature for creativity)
const reply = await generateReply(reviewText, tone);
// Returns: { content, confidence_score }
```

### Platform Integration Service
Manages OAuth and platform APIs:
```javascript
// Sync reviews from all connected platforms
await syncAllPlatforms(orgId);

// Post approved reply to platform
await postReplyToReview(platformId, externalReviewId, replyText);
```

### Job Queue Service
Uses Bull/Redis for async operations:
```javascript
// Queue long-running tasks
await reviewSyncQueue.add({ orgId }, { repeat: { cron: '0 * * * *' } });
```

## Error Handling
All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Testing
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:api      # API integration tests
```

## Deployment
See `/docs/DEPLOYMENT.md` for production deployment:
- Docker containerization
- Environment-specific configs
- Database migrations
- CI/CD pipeline

## Performance Optimization
- Database connection pooling
- Redis caching for platform data
- Request rate limiting per IP
- Pagination on list endpoints
- Compression middleware

## Security
- HTTPS in production
- Helmet for security headers
- CORS configured
- Input validation on all endpoints
- JWT for authentication
- Field-level encryption for sensitive data
- Audit logging for compliance

## Monitoring & Logging
- Structured JSON logging
- Request/response logging
- Error tracking and alerting
- Performance metrics collection

## Troubleshooting

### Database connection fails
- Check DB_HOST, DB_PORT, DB_NAME in .env
- Ensure PostgreSQL is running
- Verify database user permissions

### Claude API errors
- Check ANTHROPIC_API_KEY is valid
- Monitor API rate limits
- Check token budget

### Platform integration issues
- Verify OAuth credentials in platform settings
- Check integration status in database
- Review API logs for platform-specific errors

## Development Workflow
1. Create feature branch from main
2. Implement changes
3. Write tests
4. Commit with clear messages
5. Push and create PR
6. Address review feedback
7. Merge when approved

See `/docs/DEVELOPMENT_SETUP.md` for full setup guide.
