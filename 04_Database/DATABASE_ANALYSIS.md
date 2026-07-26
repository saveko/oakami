# Database Analysis - Oakami OS Version 1

**Date:** 2026-07-27  
**Phase:** Research Phase - Day 2  
**Status:** ✅ ANALYSIS COMPLETE  
**Scope:** Review Collection + AI Review Reply System

---

## Executive Summary

**Finding:** Oakami OS Version 1 has a **greenfield database design** with no existing schemas in the codebase. The Version 1 scope locks a **13-table schema** optimized for review collection, classification, approval workflow, and reply generation.

**Assessment:** ✅ The locked schema is **well-designed, appropriately normalized, and production-ready** for Version 1 scope. No major gaps identified.

**Recommendation:** Proceed to DATABASE_FINAL.md specification phase. All 13 tables have clear purposes, appropriate fields, and proper relationships.

---

## Research Methodology

### Search Strategy
**Scanned for existing schemas:**
- ✅ SQL files (*.sql)
- ✅ Schema documentation (*schema*.md)
- ✅ Migration files (*migration*)
- ✅ Database config files (*.json, *.yaml)
- ✅ ERD diagrams (*.erd, *ERD*)
- ✅ Project documentation

**Search Results:** ❌ No existing database files found  
**Conclusion:** Clean slate - no legacy schemas to merge or deduplicate

---

## Version 1 Schema Analysis

### Overview

**Total Tables:** 13  
**Data Types:** Standard (UUID, Text, Integer, Timestamp, Boolean)  
**Relationships:** Hierarchical (business → locations → reviews)  
**Normalization:** 3NF (Third Normal Form)  
**Approach:** Event-driven, append-only audit trail

### Table Inventory & Assessment

#### 1. **users** ✅
**Purpose:** User accounts, authentication, role management  
**Fields:** 9 fields  
**Key Design:**
- id (primary key)
- email (unique, for auth)
- password_hash (security)
- role (Admin/Manager/Reviewer)
- location_id (FK to locations)
- status (Active/Inactive/Suspended)

**Assessment:** ✅ Complete
- Has all auth essentials (email, password_hash)
- Includes role for RBAC
- Links to location for multi-location support
- Timestamps for audit trail

**Observations:**
- Consider adding: phone, preferred_language (for multi-language support)
- Consider: last_login_at for security tracking
- Status field allows for soft deletes and account suspension

---

#### 2. **businesses** ✅
**Purpose:** Top-level organization container  
**Fields:** 5 fields  
**Key Design:**
- id (primary key)
- name (business name)
- description (business info)
- status (Active/Inactive)
- created_at, updated_at

**Assessment:** ✅ Complete
- Simple, focused structure
- One-to-many with locations

**Observations:**
- Minimal for V1 (good scope discipline)
- Could add: industry, website, email (future)
- No logo/branding fields needed for V1 (reviews only)

---

#### 3. **locations** ✅
**Purpose:** Physical business locations, API endpoint tracking  
**Fields:** 11 fields  
**Key Design:**
- id (primary key)
- business_id (FK to businesses)
- name, address, city, country, timezone
- google_place_id, facebook_page_id, tripadvsor_id
- status, created_at, updated_at

**Assessment:** ✅ Complete & Well-Designed
- Each source API (Google/Facebook/TripAdvisor) has identifier field
- Timezone critical for daily reports
- Multi-location support enabled
- Geographic data preserved

**Observations:**
- ✅ Correctly stores external IDs for each platform
- ✅ Timezone support prevents reporting issues
- Coordinates (lat/lon) not needed for V1 (good scope)
- API endpoints would be dynamic (not stored)

**Normalization:** Appropriate - avoids duplicate location data

---

#### 4. **reviews** ✅
**Purpose:** Core review storage  
**Fields:** 14 fields  
**Key Design:**
- id (primary key)
- location_id (FK to locations)
- source_id (FK to review_sources)
- external_review_id (unique ID from source API)
- content (review text)
- rating, sentiment, tone, category, priority
- reviewer_name, reviewer_email
- review_date (when review was posted)
- imported_at (when ingested)
- status, created_at, updated_at

**Assessment:** ✅ Complete & Production-Ready
- Stores full review metadata
- Preserves original source information
- Classification fields (sentiment, tone, category, priority)
- Temporal fields separate original timestamp from import time

**Observations:**
- ✅ Good: Separate review_date (source) vs imported_at (system)
- ✅ Good: external_review_id allows idempotent imports
- ✅ Good: sentiment/tone/category pre-computed for filtering
- Consider: Add language field for multi-language support
- Consider: Add keywords/tags (future enhancement)

**Performance:**
- Should index: location_id, source_id, external_review_id, status, sentiment
- Consider: Partition by location_id for large datasets (future)

---

#### 5. **review_sources** ✅
**Purpose:** Integration endpoints configuration  
**Fields:** 6 fields  
**Key Design:**
- id (primary key)
- name (Google/Facebook/TripAdvisor/Zomato/Swiggy)
- api_key (credential storage)
- status (Active/Inactive)
- last_sync (track import progress)
- created_at, updated_at

**Assessment:** ✅ Complete
- Supports 5 platforms (Google, Facebook, TripAdvisor, Zomato, Swiggy)
- API key storage (should be encrypted in practice)
- Last sync tracking prevents duplicate imports
- Status field enables/disables sources

**Observations:**
- ✅ last_sync is critical for incremental updates
- ⚠️ API keys should be encrypted in application layer
- ⚠️ Consider: api_rate_limit_remaining for monitoring
- Consider: webhook_enabled flag (for future real-time updates)

**Security Note:** API keys require encryption at rest + secure retrieval

---

#### 6. **review_replies** ✅
**Purpose:** AI-generated replies to reviews  
**Fields:** 9 fields  
**Key Design:**
- id (primary key)
- review_id (FK to reviews)
- content (reply text)
- generated_by (system/user)
- approved_by (FK to users, if approved)
- approval_status (Pending/Approved/Rejected)
- sent_status (Pending/Sent/Failed)
- sent_at (timestamp)
- external_reply_id (ID from target platform)
- created_at, updated_at

**Assessment:** ✅ Complete & Well-Designed
- Tracks full lifecycle: generated → approved → sent
- Distinguishes system-generated vs human-edited
- Stores external reply ID for tracking
- Timestamps allow audit trail

**Observations:**
- ✅ Separate approval_status and sent_status (good)
- ✅ generated_by allows system vs manual tracking
- Consider: Add language field (if multi-language)
- Consider: Add tone_applied field (which tone was used)
- Consider: retry_count for failed sends

**Relationships:**
- review_id → reviews (many-to-one)
- approved_by → users (many-to-one, nullable)

---

#### 7. **ai_prompts** ✅
**Purpose:** Prompt templates for AI reply generation  
**Fields:** 7 fields  
**Key Design:**
- id (primary key)
- name (prompt identifier)
- purpose (what the prompt does)
- content (actual prompt text)
- version (versioning)
- status (Active/Inactive)
- created_at, updated_at

**Assessment:** ✅ Complete
- Supports multiple prompts (different tones/purposes)
- Versioning allows A/B testing and rollback
- Status field enables/disables prompts

**Observations:**
- ✅ Version field critical for experimentation
- ✅ Status allows gradual rollout
- Consider: Add category field (tone, length, style, etc.)
- Consider: Add effectiveness_score (tracks performance)
- Consider: Add parameters field (for dynamic prompts)

**Expected Prompts (V1):**
- Professional tone
- Casual tone
- Formal tone
- Follow-up prompt
- Issue resolution prompt
- Thank you prompt

---

#### 8. **approval_queue** ✅
**Purpose:** Manager review workflow  
**Fields:** 7 fields  
**Key Design:**
- id (primary key)
- review_reply_id (FK to review_replies)
- reviewer_id (FK to users, who reviews)
- status (Pending/Approved/Rejected)
- submitted_at (when queued)
- completed_at (when manager acted)
- notes (rejection reason, feedback)
- created_at, updated_at

**Assessment:** ✅ Complete & Production-Ready
- Tracks full approval workflow
- Multiple managers can review same queue
- Notes field captures feedback
- Timestamps track SLA performance

**Observations:**
- ✅ Separate submitted_at and completed_at for SLA tracking
- ✅ notes field allows manager feedback
- Consider: priority field (urgent vs normal approvals)
- Consider: required_approval_count (bulk/single approval)
- Consider: assigned_to field (route to specific manager)

**Workflow Logic:**
```
review_reply (Pending Approval) → approval_queue (pending) → 
Manager reviews → approval_queue (approved/rejected) → 
review_reply (sent or regenerated)
```

---

#### 9. **notifications** ✅
**Purpose:** User notifications (alerts, summaries)  
**Fields:** 8 fields  
**Key Design:**
- id (primary key)
- user_id (FK to users)
- type (daily_report, urgent_review, approval_needed, etc.)
- title, content (message)
- read (boolean for read status)
- sent_at (when sent)
- created_at

**Assessment:** ✅ Complete
- Supports multiple notification types
- Read tracking for UX
- Sent timestamp for delivery tracking

**Observations:**
- ✅ type field allows filtering by notification class
- ✅ read boolean tracks engagement
- Consider: channel field (email, SMS, in-app)
- Consider: action_url field (deep link to review)
- Consider: expires_at field (auto-archive old notifications)

**Expected Notification Types (V1):**
- daily_report (morning summary)
- urgent_review (high-priority review)
- approval_needed (replies await approval)
- sending_confirmation (reply sent)
- error_alert (import/send failure)

---

#### 10. **daily_reports** ✅
**Purpose:** Daily aggregated metrics per location  
**Fields:** 11 fields  
**Key Design:**
- id (primary key)
- location_id (FK to locations)
- report_date (which day)
- total_reviews (count)
- positive_count, negative_count, neutral_count (sentiment breakdown)
- replies_generated, replies_approved, replies_sent (funnel metrics)
- pending_approvals (current queue depth)
- summary (narrative summary, optional)
- created_at (report generation time)

**Assessment:** ✅ Complete & Well-Designed
- Daily aggregation prevents repeated calculation
- Sentiment breakdown enables trend analysis
- Funnel metrics (generated → approved → sent) track efficiency
- One row per location per day

**Observations:**
- ✅ Separate counts for sentiment (enables trends)
- ✅ Funnel metrics show conversion rates
- ✅ pending_approvals snapshot for SLA tracking
- Consider: Add average_response_time
- Consider: Add top_issues (if needed)

**Data Model:**
```
Daily Report Funnel:
total_reviews (all)
  → replies_generated (processed by AI)
  → replies_approved (approved by manager)
  → replies_sent (successfully posted)
```

**Expected Row Count:** 1 row/location/day = manageable

---

#### 11. **activity_logs** ✅
**Purpose:** User action audit trail  
**Fields:** 7 fields  
**Key Design:**
- id (primary key)
- user_id (FK to users)
- action (login, generate_reply, approve_reply, send_reply, etc.)
- entity_type (review, reply, location, etc.)
- entity_id (ID of the entity affected)
- details (JSON: additional context)
- created_at

**Assessment:** ✅ Complete
- Comprehensive action tracking
- Flexible entity tracking
- JSON details for extensibility

**Observations:**
- ✅ entity_type and entity_id enable linked audit trail
- ✅ details field allows future extensibility
- Consider: ip_address (security audit)
- Consider: duration (for performance tracking)

**Expected Actions (V1):**
- login, logout
- generate_reply, approve_reply, reject_reply
- send_reply, resend_reply
- view_review, search_reviews
- export_report

---

#### 12. **audit_logs** ✅
**Purpose:** Security & compliance audit trail  
**Fields:** 7 fields  
**Key Design:**
- id (primary key)
- user_id (FK to users)
- action (create, update, delete, approve, etc.)
- resource (which table/entity)
- changes (JSON: before/after values)
- ip_address (request source)
- created_at

**Assessment:** ✅ Complete
- Immutable record of data changes
- IP tracking for security
- JSON changes enable full audit trail

**Observations:**
- ✅ Separate from activity_logs (right design)
- ✅ ip_address critical for compliance
- ✅ changes JSON shows exact modifications
- Consider: user_agent (browser tracking)
- Consider: session_id (linking related actions)

**Compliance Value:**
- Can answer: "Who changed what, when, from where?"
- Immutable record for regulatory compliance (if needed)

---

#### 13. **settings** ✅
**Purpose:** Application configuration key-value store  
**Fields:** 5 fields  
**Key Design:**
- id (primary key)
- key (setting name)
- value (setting value)
- type (string, integer, boolean, json)
- created_at, updated_at

**Assessment:** ✅ Complete
- Flexible configuration storage
- Type field supports validation
- Single table for all settings

**Observations:**
- ✅ key-value model supports unknown settings
- ✅ type field enables parsing
- Consider: scope field (global vs location-specific)
- Consider: encrypted flag (for sensitive settings)

**Expected Settings (V1):**
- app_name (Oakami)
- daily_report_time (9:00 AM)
- approval_timeout (24 hours)
- max_reply_length (500 chars)
- supported_languages (en, es, etc.)

---

## Relationship Analysis

### Entity Relationship Diagram (Logical)

```
businesses
    ↓ (one-to-many)
locations
    ├─ (one-to-many) → reviews
    │                      ├─ (many-to-one) → review_sources
    │                      └─ (one-to-many) → review_replies
    │                                             ├─ (many-to-one) → approval_queue
    │                                             └─ (many-to-one) → users (approved_by)
    │
    ├─ (one-to-many) → daily_reports
    │
    └─ (one-to-many) → users

users
    ├─ (one-to-many) → activity_logs
    ├─ (one-to-many) → audit_logs
    ├─ (one-to-many) → notifications
    └─ (many-to-one) → locations

review_sources
    └─ (one-to-many) → reviews

ai_prompts
    └─ (no direct FK, used by application logic)

settings
    └─ (no FK, global configuration)
```

### Cardinality Analysis

| Relationship | Type | Rationale |
|--------------|------|-----------|
| businesses:locations | 1:N | Multiple locations per business |
| locations:reviews | 1:N | Many reviews per location |
| locations:users | 1:N | Multiple managers per location |
| reviews:review_replies | 1:N | Multiple reply attempts per review |
| review_replies:approval_queue | 1:N | One queue entry per reply (logical 1:1) |
| review_sources:reviews | 1:N | One source has many reviews |

### Foreign Key Design ✅

All necessary relationships are properly defined:
- ✅ users.location_id → locations.id
- ✅ locations.business_id → businesses.id
- ✅ reviews.location_id → locations.id
- ✅ reviews.source_id → review_sources.id
- ✅ review_replies.review_id → reviews.id
- ✅ review_replies.approved_by → users.id (nullable)
- ✅ approval_queue.review_reply_id → review_replies.id
- ✅ approval_queue.reviewer_id → users.id
- ✅ notifications.user_id → users.id
- ✅ daily_reports.location_id → locations.id
- ✅ activity_logs.user_id → users.id
- ✅ audit_logs.user_id → users.id

---

## Normalization Analysis

### Third Normal Form (3NF) Assessment

**Status:** ✅ **PROPERLY NORMALIZED TO 3NF**

### 1NF (Atomic Values)
✅ All fields contain atomic values (no arrays/lists in columns)
- Exception: `details` and `changes` fields use JSON (acceptable for flexibility)
- Rationale: JSON fields are semi-structured and needed for extensibility

### 2NF (Remove Partial Dependencies)
✅ No partial dependencies detected
- All non-key fields depend on the entire primary key
- Review tables don't have misleading dependencies

### 3NF (Remove Transitive Dependencies)
✅ No transitive dependencies detected
- Example: location.timezone depends on location.id, not on any other attribute
- Sentiment/tone/category in reviews don't create transitive dependencies

### Denormalization (Intentional)
Strategic denormalization for performance:
- **daily_reports:** Stores aggregated counts instead of recalculating daily
- **reviews.sentiment/tone/category:** Pre-computed classifications stored with review (good for query performance)

**Assessment:** Denormalization choices are **justified and limited**—keeps queries fast without sacrificing data integrity.

---

## Performance Considerations

### Indexing Strategy

**Recommended Indexes (High Priority):**

```sql
-- reviews (heavily queried)
CREATE INDEX idx_reviews_location_id ON reviews(location_id);
CREATE INDEX idx_reviews_source_id ON reviews(source_id);
CREATE INDEX idx_reviews_external_id ON reviews(external_review_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- review_replies (approval workflow)
CREATE INDEX idx_replies_review_id ON review_replies(review_id);
CREATE INDEX idx_replies_status ON review_replies(approval_status);
CREATE INDEX idx_replies_sent_status ON review_replies(sent_status);

-- approval_queue (manager workflow)
CREATE INDEX idx_approval_reviewer_id ON approval_queue(reviewer_id);
CREATE INDEX idx_approval_status ON approval_queue(status);
CREATE INDEX idx_approval_submitted_at ON approval_queue(submitted_at);

-- daily_reports (dashboard queries)
CREATE INDEX idx_reports_location_id ON daily_reports(location_id);
CREATE INDEX idx_reports_date ON daily_reports(report_date);

-- notifications (inbox queries)
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- activity_logs (audit queries)
CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at);

-- audit_logs (compliance queries)
CREATE INDEX idx_audit_resource ON audit_logs(resource);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```

### Query Patterns (V1)

**Heavy Queries:**
1. `SELECT * FROM reviews WHERE location_id = ? ORDER BY created_at DESC` (dashboard)
2. `SELECT * FROM approval_queue WHERE status = 'pending'` (manager workflow)
3. `SELECT * FROM daily_reports WHERE location_id = ? AND report_date >= ?` (reports)

**Read-Heavy vs Write-Heavy:**
- Reviews: Write-heavy (continuous imports) → read-heavy (dashboard queries)
- Approvals: Write-moderate (manager actions)
- Logs: Write-only (audit trail)

### Scalability

**Table Growth Projections (1 Year, 10 Locations):**

| Table | Estimated Rows | Growth Pattern |
|-------|-----------------|-----------------|
| users | 50 | Linear (slow) |
| locations | 10 | Linear (very slow) |
| businesses | 10 | Linear (very slow) |
| reviews | 500K-1M | Linear (continuous import) |
| review_replies | 500K-1M | Linear (1:1 with replies) |
| review_sources | 50 | Linear (slow) |
| approval_queue | 10K-50K | Stable (processed daily) |
| daily_reports | 3,650 | Linear (1/location/day) |
| notifications | 100K-500K | Linear (multiple per day) |
| activity_logs | 1M-10M | Linear (audit trail) |
| audit_logs | 1M-10M | Linear (audit trail) |
| ai_prompts | 20-50 | Stable (small) |
| settings | 50-100 | Stable (small) |

**Scaling Strategy (for future):**
- reviews & review_replies: Partition by location_id (if > 10M rows)
- activity_logs & audit_logs: Partition by created_at (archive old records)
- daily_reports: Archive to data warehouse after 1 year

**Current Status:** ✅ Schema supports 1-2 years growth without major changes

---

## Security Assessment

### Field-Level Security ✅

| Table | Sensitive Fields | Protection |
|-------|------------------|-----------|
| users | password_hash | Hashed (bcrypt/argon2) |
| review_sources | api_key | Should be encrypted at rest |
| audit_logs | ip_address | Retained for compliance |
| activity_logs | user_id, details | Role-based access |

### Missing Security Elements

**Not in schema (application layer):**
- API key encryption (application should encrypt before storing)
- Session table (use application session store)
- Password reset tokens (use application cache)
- 2FA backup codes (if needed, separate table)

**Recommendation:** Implement field-level encryption for review_sources.api_key in application

### Compliance Ready ✅

**Audit Trail:** ✅ audit_logs table enables compliance
**Data Retention:** ✅ created_at fields support retention policies
**Access Logging:** ✅ activity_logs tracks all actions
**Immutable Records:** ✅ Logs are append-only

---

## Data Validation Rules (By Table)

### users
- email: Required, unique, valid format
- password_hash: Required, min 60 chars (bcrypt)
- role: Required, enum (admin/manager/reviewer)
- status: Required, enum (active/inactive/suspended)

### reviews
- external_review_id: Required, unique per source
- content: Required, max 10,000 chars
- rating: Required, integer 1-5
- sentiment: Required, enum (positive/neutral/negative)
- tone: Required, enum (formal/casual/emotional)
- category: Required, enum (food/service/ambience/value)
- priority: Required, enum (high/medium/low)

### review_replies
- approval_status: Required, enum (pending/approved/rejected)
- sent_status: Required, enum (pending/sent/failed)
- content: Required, max 1,000 chars

### ai_prompts
- name: Required, unique
- content: Required, max 5,000 chars
- status: Required, enum (active/inactive)
- version: Required, integer

---

## Missing Elements Assessment

### What's NOT in the schema (intentionally):

| Feature | Reason | When to Add |
|---------|--------|-------------|
| Customer/Reviewer profiles | Out of V1 scope | Week 2+ |
| Analytics tables | Use daily_reports + queries | Week 2+ |
| A/B testing | Not in V1 | Week 3+ |
| Template variations | In ai_prompts.name | Week 1 |
| Conversation history | One reply per review (V1 constraint) | Week 2+ |
| Bulk operations tracking | Not in V1 | Week 2+ |

### What IS complete:
✅ Review collection
✅ Classification
✅ Reply generation
✅ Approval workflow
✅ Sending tracking
✅ Daily reporting
✅ User management
✅ Audit trail
✅ Settings

---

## Recommendations

### For DATABASE_FINAL.md (Next Phase)

1. **Add Missing Field Considerations:**
   - users: phone, preferred_language
   - reviews: language, keywords
   - review_replies: tone_applied, retry_count
   - review_sources: webhook_enabled, rate_limit_tracking

2. **Add Indexes (Implementation Phase):**
   - Build comprehensive index strategy for PostgreSQL/MySQL
   - Include composite indexes for common query patterns
   - Plan for query optimization per DBMS

3. **Add Validation Rules:**
   - Document field-level constraints
   - Implement in application layer
   - Add database-level constraints (NOT NULL, UNIQUE, CHECK)

4. **API Key Security:**
   - Encrypt at rest (AES-256)
   - Decrypt on retrieval
   - Rotate strategy

5. **Data Retention Policy:**
   - Keep activity_logs for 1 year
   - Archive audit_logs after compliance period
   - Archive daily_reports to data warehouse

6. **Backup Strategy:**
   - Daily backups (incremental)
   - Point-in-time recovery capability
   - Test restore procedures

---

## Conclusion

### Summary Table

| Dimension | Assessment | Status |
|-----------|-----------|--------|
| Completeness | All 13 tables present, all required fields | ✅ COMPLETE |
| Normalization | Properly 3NF with justified denormalization | ✅ GOOD |
| Relationships | All foreign keys defined correctly | ✅ CORRECT |
| Scalability | Supports 1-2 years growth without redesign | ✅ ADEQUATE |
| Security | Audit trail ready, needs api_key encryption | ⚠️ READY w/ note |
| Performance | Proper indexing strategy needed | ✅ PLAN READY |
| Compliance | Supports audit trail and retention | ✅ READY |

### Overall Assessment: ✅ **PRODUCTION-READY FOR V1**

The Version 1 database schema is:
- **Well-designed:** Properly normalized, clear relationships
- **Appropriately-scoped:** Exactly what V1 needs, nothing extra
- **Secure:** Audit trail in place, ready for encryption
- **Scalable:** Supports expected growth patterns
- **Future-proof:** Extensions don't require schema redesign

### Next Steps
Proceed to **DATABASE_FINAL.md** to:
1. Generate SQL CREATE TABLE statements
2. Define field constraints (NOT NULL, UNIQUE, CHECK)
3. Create index definitions
4. Document migration strategy

---

**Report Status:** ✅ COMPLETE  
**Generated:** 2026-07-27  
**Location:** `/04_Database/DATABASE_ANALYSIS.md`  
**Next Document:** DATABASE_FINAL.md (Day 4)  
**Token Used:** ~4,000 tokens
