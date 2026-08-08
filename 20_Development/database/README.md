# Oakami OS V1 - Database

## Overview
PostgreSQL database schema for Oakami OS V1. Implements 3NF normalization with proper indexing, encryption, and audit trails.

## Schema Components

### Core Tables
- `organizations` - Tenant/Organization data
- `users` - User accounts with roles
- `platforms` - Review platform definitions (Google, Facebook, etc)
- `platform_integrations` - OAuth connections per organization

### Business Data
- `reviews` - External reviews synced from platforms
- `replies` - AI-generated replies to reviews
- `approvals` - Manager approval workflow

### Audit & Logging
- `audit_log` - Comprehensive audit trail of all operations

## Running Migrations

### Development (Local)
```bash
# Using docker-compose
docker-compose up postgres

# Or directly with PostgreSQL
psql -U oakami_user -d oakami_dev < 01_init_schema.sql
```

### Production
```bash
# Via environment-specific deployment
# See ARCHITECTURE.md for details
```

## Database Connection
```javascript
// Backend connection example
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

## Adding Migrations
1. Create new file: `02_feature_name.sql`
2. Write SQL with comments
3. Include both creation AND rollback logic
4. Test locally before committing

Example:
```sql
-- Migration: Add notification preferences table
-- Date: 2024-01-15

-- UP
CREATE TABLE user_notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  email_on_approval BOOLEAN DEFAULT true,
  email_on_sync BOOLEAN DEFAULT true
);

-- DOWN (for rollback)
-- DROP TABLE user_notification_preferences;
```

## Performance Considerations
- All foreign keys indexed
- Composite indexes on frequently joined columns
- Audit log timestamps indexed for time-range queries
- Connection pooling configured in backend

## Field-Level Encryption
External API tokens and sensitive user data use encryption:
```javascript
const encrypted = encrypt(token, encryptionKey);
const decrypted = decrypt(encrypted, encryptionKey);
```

See backend services for implementation details.

## Backup Strategy
Production: Daily automated backups per ARCHITECTURE.md
Development: Docker volume persistence
