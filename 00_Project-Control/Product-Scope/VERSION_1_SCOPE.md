# Oakami OS Version 1 - Scope Definition

**Date:** 2026-07-26  
**Status:** LOCKED  
**Scope:** REVIEW COLLECTION + AI REVIEW REPLY ONLY

---

## MISSION CRITICAL

**One Product. One Version.**

Version 1 contains **ONLY ONE PRODUCT:**
- Review Collection + AI Review Reply System

**Nothing else. Ignore everything else.**

---

## Version 1 Core Functions (8 Jobs)

### 1. ✅ Collect Reviews
- Extract from Google Reviews
- Extract from Facebook Reviews
- Extract from TripAdvisor
- Extract from Zomato (if available)
- Extract from Swiggy (if applicable)
- Support for multiple locations
- Timestamp tracking
- Source tracking

### 2. ✅ Store Reviews
- Database storage
- Full review content
- Metadata preservation
- Source information
- Location information
- Review date/time
- Reviewer information

### 3. ✅ Classify Reviews
- Sentiment analysis (Positive/Negative/Neutral)
- Tone classification (Formal/Casual/Emotional)
- Category classification (Food/Service/Ambience/Value)
- Priority level (High/Medium/Low)
- Language detection
- Issues identification

### 4. ✅ Generate AI Review Reply
- Context-aware responses
- Manager-approved tone
- Location-specific details
- Professional formatting
- Multiple language support
- Customizable templates

### 5. ✅ Manager Approval (Optional)
- Review queue management
- Approve/Reject workflow
- Edit before sending
- Bulk approval capability
- Scheduled sending

### 6. ✅ Send Reply
- Reply to Google
- Reply to Facebook
- Reply to TripAdvisor
- Email notification
- Delivery confirmation
- Tracking

### 7. ✅ Generate Daily Report
- Reviews collected (daily)
- Reviews classified (daily)
- Replies generated (daily)
- Replies approved (daily)
- Replies sent (daily)
- Outstanding reviews (daily)
- Summary statistics
- Trends (if applicable)

### 8. ✅ Notify Responsible Person
- Daily summary email
- Urgent reviews alert
- Approval needed notification
- Sending confirmation
- Error notifications
- Manager digest

---

## Version 1 User Roles

### 1. Admin
- System configuration
- User management
- API key management
- Settings

### 2. Manager
- Review dashboard access
- Approve replies
- View reports
- Configure notifications

### 3. Staff/Employee
- View assigned reviews
- Draft replies
- Submit for approval
- View their activity

---

## Version 1 User Interfaces (8 Screens ONLY)

### Screen 1: Login
- Email/password authentication
- Forgot password option
- Remember me option
- OAuth integration (optional)

### Screen 2: Dashboard
- Quick stats (reviews, pending, sent)
- Recent activity
- Today's summary
- Navigation menu
- User profile

### Screen 3: Review Inbox
- List all reviews
- Filter by source
- Filter by status
- Filter by location
- Search capability
- Sort options
- Pagination

### Screen 4: Review Detail
- Full review display
- Source information
- Reviewer details
- Classification info
- Reply history
- Action buttons

### Screen 5: AI Reply Generation
- Review content (read-only)
- AI-generated reply
- Edit capability
- Tone adjustment
- Template selection
- Preview
- Submit for approval

### Screen 6: Manager Approval
- Pending replies queue
- Approve button
- Reject button
- Edit before approval
- Schedule sending
- Bulk actions

### Screen 7: Reports
- Daily report summary
- Statistics
- Trends
- Export options
- Date range selector
- Department breakdown

### Screen 8: Settings
- Profile settings
- Notification preferences
- Location settings
- API configuration
- User management
- System settings

---

## Version 1 Data Model

### Core Tables

#### 1. users
- id
- email
- password_hash
- name
- role
- location_id
- status
- created_at
- updated_at

#### 2. businesses
- id
- name
- description
- status
- created_at
- updated_at

#### 3. locations
- id
- business_id
- name
- address
- city
- country
- timezone
- google_place_id
- facebook_page_id
- tripadvsor_id
- status
- created_at
- updated_at

#### 4. reviews
- id
- location_id
- source_id
- external_review_id
- content
- rating
- sentiment
- tone
- category
- priority
- reviewer_name
- reviewer_email
- review_date
- imported_at
- status
- created_at
- updated_at

#### 5. review_sources
- id
- name (Google/Facebook/TripAdvisor/Zomato/Swiggy)
- api_key
- status
- last_sync
- created_at
- updated_at

#### 6. review_replies
- id
- review_id
- content
- generated_by (system/user)
- approved_by
- approval_status
- sent_status
- sent_at
- external_reply_id
- created_at
- updated_at

#### 7. ai_prompts
- id
- name
- purpose
- content
- version
- status
- created_at
- updated_at

#### 8. approval_queue
- id
- review_reply_id
- reviewer_id
- status
- submitted_at
- completed_at
- notes
- created_at
- updated_at

#### 9. notifications
- id
- user_id
- type
- title
- content
- read
- sent_at
- created_at

#### 10. daily_reports
- id
- location_id
- report_date
- total_reviews
- positive_count
- negative_count
- neutral_count
- replies_generated
- replies_approved
- replies_sent
- pending_approvals
- summary
- created_at

#### 11. activity_logs
- id
- user_id
- action
- entity_type
- entity_id
- details
- created_at

#### 12. audit_logs
- id
- user_id
- action
- resource
- changes
- ip_address
- created_at

#### 13. settings
- id
- key
- value
- type
- created_at
- updated_at

---

## Version 1 API Integrations

### External APIs (Required)
1. **Google Reviews API**
   - Read reviews
   - Post replies
   - Webhooks

2. **Facebook Reviews API**
   - Read reviews
   - Post replies
   - Webhooks

3. **TripAdvisor API**
   - Read reviews (if available)
   - Post replies (if available)

4. **Zomato API** (if applicable)
   - Read reviews
   - Post replies

5. **Swiggy API** (if applicable)
   - Read reviews

### Internal APIs (Required)
1. **Authentication API**
   - Login
   - Logout
   - Token refresh

2. **Review API**
   - Get reviews
   - Get review detail
   - Filter/search

3. **AI API**
   - Generate reply
   - Classify review

4. **Report API**
   - Get daily report
   - Get statistics

5. **Notification API**
   - Send notification
   - Get notifications

6. **Webhook Endpoints**
   - Receive review updates

---

## Version 1 AI Components

### Classification System
- **Sentiment Analysis**
  - Positive (5-star, happy, satisfied)
  - Neutral (3-star, factual, informational)
  - Negative (1-2 star, dissatisfied, complaint)

- **Tone Classification**
  - Formal (professional, business-like)
  - Casual (friendly, informal)
  - Emotional (upset, excited, passionate)

- **Category Classification**
  - Food Quality
  - Service Quality
  - Ambience/Cleanliness
  - Value for Money
  - Staff Behavior

### Reply Generation
- Context-aware responses
- Personalized based on review
- Tone matching
- Location-specific details
- Professional templates

---

## Explicitly OUT OF SCOPE (Future Versions)

### ❌ Inventory Management
- Menu management
- Stock tracking
- Supplier management
- Cost analysis

### ❌ Reservations
- Booking system
- Table management
- Capacity planning
- Wait list

### ❌ Analytics & Forecasting
- Predictive analytics
- Trend forecasting
- Demand planning
- Revenue forecasting

### ❌ CRM Features
- Customer database
- Customer journey
- Email campaigns
- Customer communication

### ❌ Marketing Automation
- Marketing campaigns
- Email sequences
- Social media scheduling
- Customer acquisition

### ❌ Finance Module
- Invoicing
- Payment processing
- Accounting
- Profit/Loss analysis

### ❌ HR Module
- Employee management
- Payroll
- Attendance
- Performance reviews

### ❌ Advanced Analytics
- Custom dashboards
- BI tools
- Data warehousing
- Real-time analytics

### ❌ Custom Workflows
- Workflow builder
- Automation rules
- Conditional logic

### ❌ Mobile App
- Native mobile application
- Mobile optimization

### ❌ Multi-tenant SaaS
- Tenant isolation
- Custom branding
- Subscription management

### ❌ Advanced Features
- AI training
- Custom models
- Prompt engineering UI
- Advanced permissions

---

## Version 1 Constraints

### Technical Constraints
- ✅ Single database (no sharding)
- ✅ Single backend server (no clustering)
- ✅ Single frontend deployment
- ✅ Basic authentication (JWT)
- ✅ No complex caching

### Business Constraints
- ✅ Single currency
- ✅ English language (primary)
- ✅ Single timezone (configurable)
- ✅ Basic reporting
- ✅ No advanced analytics

### Scalability Constraints
- ✅ Up to 10 locations
- ✅ Up to 100 users
- ✅ Up to 10,000 reviews/day
- ✅ Basic infrastructure

---

## Scope Lock Rules

1. **NO FEATURES** outside of Review Collection + AI Reply
2. **NO MODULES** for inventory, CRM, marketing, HR, finance
3. **NO ROADMAP ITEMS** from future versions
4. **NO ASSUMPTIONS** about future needs
5. **NO OVER-ENGINEERING** for scale we won't need
6. **NO PREMATURE ABSTRACTIONS**
7. **NO GOLD-PLATING**

---

## Success Definition (Version 1)

The application successfully launches when it can:
1. ✅ Collect reviews from multiple sources reliably
2. ✅ Store and classify them accurately
3. ✅ Generate professional AI replies contextually
4. ✅ Route replies through manager approval
5. ✅ Send replies to source platforms
6. ✅ Generate daily reports automatically
7. ✅ Notify responsible persons reliably
8. ✅ Support multiple locations
9. ✅ Maintain data integrity & security
10. ✅ Operate with <2% errors

---

## Scope Governance

### When to Say NO
- "Can we add inventory?" → NO (Out of scope)
- "Can we add CRM?" → NO (Out of scope)
- "Can we build mobile app?" → NO (Out of scope, V2)
- "Can we add forecasting?" → NO (Out of scope)

### When to Say YES
- "Can we add more review sources?" → YES (Within scope)
- "Can we add more languages?" → YES (Enhances core feature)
- "Can we improve AI replies?" → YES (Core feature improvement)
- "Can we add manager approval?" → YES (Included in spec)

---

## Change Control Process

### To Add Something Not in This Scope:
1. Document the request
2. State the business impact
3. Get executive approval
4. Create a new issue/task
5. Schedule for V2 roadmap
6. **Do NOT add to V1**

---

## Document History

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-07-26 | 1.0 | LOCKED - FINAL | Architect |

---

**Status:** LOCKED  
**Authority:** Project Architect  
**Review Date:** N/A (Locked)  
**Next Review:** Post V1 Launch

