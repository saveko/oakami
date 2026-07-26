# Oakami OS Version 1 - Project Inventory

**Date:** 2026-07-26  
**Phase:** Research Phase (Day 1)  
**Branch:** claude/oakami-v1-research-usjcnq  
**Status:** INITIATED - Scan & Inventory

---

## Executive Summary

This document serves as the master inventory of all project assets, documents, specifications, and resources for Oakami OS Version 1. The application is scoped to **Review Collection + AI Review Reply** only.

**Version 1 Scope (ONLY):**
1. Collect Reviews
2. Store Reviews
3. Classify Reviews
4. Generate AI Review Reply
5. Manager Approval (optional)
6. Send Reply
7. Generate Daily Report
8. Notify Responsible Person

---

## Project Status Overview

| Element | Status | Location | Owner | Notes |
|---------|--------|----------|-------|-------|
| Repository | Fresh | saveko/oakami | Team | Initialized, no commits yet |
| Branch | Active | claude/oakami-v1-research-usjcnq | Team | Primary research branch |
| Folder Structure | Created | /Oakami | Architect | 25 main folders + subfolders |
| Documentation | In Progress | /01_Research | Writer | Beginning inventory |
| Database Design | Pending | /04_Database | DB Architect | Will analyze & design |
| UI/UX | Pending | /07_UI-UX | Designer | Version 1 screens only |
| API | Pending | /05_API | API Architect | Core integrations only |
| AI | Pending | /06_AI | AI Specialist | Prompt library & classification |
| Backend | Pending | /09_Backend | Backend Lead | Review system core |
| Frontend | Pending | /08_Frontend | Frontend Lead | Dashboard & UI |

---

## Source Documents Status

### Research Phase Artifacts (CREATED)
- ✅ PROJECT_INVENTORY.md (this file) - Day 1
- ⏳ DATABASE_ANALYSIS.md - Due Day 2
- ⏳ PROMPT_ANALYSIS.md - Due Day 2
- ⏳ UI_RESEARCH.md - Due Day 3-4
- ⏳ API_RESEARCH.md - Due Day 4
- ⏳ ARCHITECTURE.md - Due Day 6
- ⏳ RISK_ANALYSIS.md - Due Day 6
- ⏳ ROADMAP.md - Due Day 7

### Existing Specifications (TO BE FOUND)
- [ ] Product Requirements Document (PRD)
- [ ] Technical Specifications
- [ ] Database Schemas
- [ ] API Documentation
- [ ] AI Prompts
- [ ] UI Designs / Wireframes
- [ ] Architecture Diagrams
- [ ] Security Policies
- [ ] Deployment Guides

---

## Version 1 - Core Components ONLY

### User Interfaces (8 Screens)
1. **Login** - Authentication
2. **Dashboard** - Overview & Summary
3. **Review Inbox** - List & Filter Reviews
4. **Review Detail** - Single Review View
5. **AI Reply** - Generate & Edit Replies
6. **Approval** - Manager Approval Queue
7. **Reports** - Daily/Weekly/Monthly Reports
8. **Settings** - Configuration & Profile

### Core Database Tables (Expected)
1. **Users** - Authentication & Profiles
2. **Businesses** - Business Information
3. **Locations** - Multi-location Support
4. **Reviews** - Collected Reviews
5. **Review Sources** - Google, Facebook, TripAdvisor, etc.
6. **Review Replies** - Generated & Approved Replies
7. **AI Prompts** - System Prompts
8. **Approval Queue** - Manager Approvals
9. **Notifications** - User Notifications
10. **Daily Reports** - Auto-Generated Reports
11. **Activity Logs** - Audit Trail
12. **Audit Logs** - Security Logs
13. **Settings** - System Configuration

### API Integrations (Minimum)
1. **Google Reviews** - Extract & Webhooks
2. **Facebook Reviews** - Extract & Webhooks
3. **TripAdvisor** - Extract (if available)
4. **Zomato** - Extract (if applicable)
5. **Swiggy** - Extract (if applicable)
6. **Internal API** - Dashboard & Management
7. **Webhooks** - Review notifications
8. **Authentication** - OAuth2/JWT

### AI Components
1. **Review Classification** - Sentiment/Tone/Category
2. **AI Reply Generation** - Context-aware responses
3. **Manager Approval** - Optional review cycle
4. **Daily Report** - Automated summaries
5. **Notification** - Alert generation

---

## Project Constraints (VERSION 1 ONLY)

### IN SCOPE
- ✅ Review Collection from multiple sources
- ✅ AI-powered reply generation
- ✅ Manager approval workflow
- ✅ Daily reporting
- ✅ Basic notifications
- ✅ Multi-location support
- ✅ User authentication

### OUT OF SCOPE (Future Versions)
- ❌ Inventory Management
- ❌ Reservations
- ❌ Analytics & Forecasting
- ❌ CRM Features
- ❌ Marketing Automation
- ❌ Finance Module
- ❌ HR Module
- ❌ Advanced Dashboards
- ❌ Custom Workflows
- ❌ Mobile App (Initial Release)

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Research Completion | 100% | 5% |
| Database Design | Final Schema | Pending |
| UI/UX Complete | 8 Screens | Pending |
| API Specifications | All Defined | Pending |
| AI Prompts | All Tested | Pending |
| Documentation | Complete & Linked | In Progress |
| Architecture Approved | Board Review | Pending |
| Risk Mitigation | All Critical | Pending |

---

## Key Decisions

| Decision | Value | Status | Rationale |
|----------|-------|--------|-----------|
| Scope | Review Collection + AI Reply Only | LOCKED | Mission Critical |
| Version | V1 Only | LOCKED | Timeline Critical |
| Stack | TBD | Pending | Research Phase |
| Database | TBD | Pending | Research Phase |
| Deployment | TBD | Pending | Research Phase |

---

## Dependencies & Blockers

### Critical Dependencies
1. **API Access** - Google Reviews, Facebook Reviews, TripAdvisor
2. **AI Model** - Claude or equivalent for reply generation
3. **Database** - PostgreSQL or Cloud SQL
4. **Authentication** - OAuth2 or JWT infrastructure

### Current Blockers
- None identified (research phase)

### Potential Risks
- API rate limiting for review sources
- AI response quality & consistency
- Multi-language support requirement
- Data privacy & compliance

---

## Research Timeline

| Day | Focus | Deliverable | Status |
|-----|-------|-------------|--------|
| 1 (Today) | Scan & Inventory | PROJECT_INVENTORY.md | ✅ IN PROGRESS |
| 2 | Database & Prompts | DATABASE_ANALYSIS.md, PROMPT_ANALYSIS.md | ⏳ PENDING |
| 3 | Folder Structure & Cleanup | FOLDER_STRUCTURE_PLAN.md | ⏳ PENDING |
| 4 | UI & API | UI_RESEARCH.md, API_RESEARCH.md | ⏳ PENDING |
| 5 | Finalization | DATABASE_FINAL.md | ⏳ PENDING |
| 6 | Architecture & Risk | ARCHITECTURE.md, RISK_ANALYSIS.md | ⏳ PENDING |
| 7 | Ready | ROADMAP.md, TASK_BACKLOG.md | ⏳ PENDING |

---

## Next Steps (Day 1 Continued)

1. ✅ Create folder structure
2. ⏳ Create PROJECT_INVENTORY.md (current)
3. ⏳ Check for existing documentation
4. ⏳ Review any available specifications
5. ⏳ Document initial findings

---

## Document History

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2026-07-26 | 1.0 | Architect | Initial inventory created |

---

**Status:** ACTIVE - Research Phase Day 1  
**Next Update:** 2026-07-27 (End of Day 2)
