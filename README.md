# Oakami OS Version 1

**Status:** 🔬 RESEARCH PHASE  
**Start Date:** 2026-07-26  
**Target Launch:** TBD (After Research Complete)  
**Version:** 1.0  

---

## 📋 Project Overview

**Oakami OS Version 1** is a Review Collection & AI Review Reply System designed to:
1. Collect reviews from multiple sources (Google, Facebook, TripAdvisor, Zomato, Swiggy)
2. Automatically classify reviews (sentiment, tone, category)
3. Generate AI-powered professional replies
4. Route through manager approval
5. Send replies to source platforms
6. Generate daily reports
7. Notify responsible persons

**Scope:** Review Collection + AI Reply **ONLY**. Nothing else.

---

## 🎯 Quick Navigation

### Phase: Research (Week 1)
- 📖 [Research Framework](./01_Research/Research-Reports/RESEARCH_FRAMEWORK.md)
- 📊 [Project Inventory](./01_Research/Research-Reports/PROJECT_INVENTORY.md)
- 🔒 [Version 1 Scope](./00_Project-Control/Product-Scope/VERSION_1_SCOPE.md)

### Key Research Documents (In Progress)
- 🗄️ [Database Analysis](./01_Research/Research-Reports/DATABASE_ANALYSIS.md) - Due 2026-07-27
- 🤖 [Prompt Analysis](./01_Research/Research-Reports/PROMPT_ANALYSIS.md) - Due 2026-07-27
- 🎨 [UI Research](./01_Research/Research-Reports/UI_RESEARCH.md) - Due 2026-07-28
- 📡 [API Research](./01_Research/Research-Reports/API_RESEARCH.md) - Due 2026-07-28
- 🏗️ [Architecture Design](./03_Architecture/System-Architecture/ARCHITECTURE.md) - Due 2026-07-30
- ⚠️ [Risk Analysis](./00_Project-Control/Risks/RISK_ANALYSIS.md) - Due 2026-07-30
- 🗺️ [Development Roadmap](./02_Product/Roadmap/ROADMAP.md) - Due 2026-07-31

---

## 📁 Folder Structure

```
/Oakami
├── 00_Project-Control/         # Project governance & decisions
│   ├── Vision/                 # Project vision
│   ├── Mission/                # Project mission
│   ├── Product-Scope/          # V1 scope (LOCKED)
│   ├── Success-Metrics/        # Success criteria
│   ├── Constraints/            # Project constraints
│   ├── Risks/                  # Risk management
│   └── Decisions/              # Decision log
│
├── 01_Research/                # Research phase (CURRENT)
│   ├── Existing-Documents/     # Found documents
│   ├── PRD-Research/           # PRD analysis
│   ├── Technical-Research/     # Technical specs
│   ├── AI-Research/            # AI requirements
│   ├── API-Research/           # API analysis
│   ├── Database-Research/      # DB analysis
│   ├── Security-Research/      # Security specs
│   └── Research-Reports/       # Final reports
│
├── 02_Product/                 # Product definition
│   ├── Product-Requirements/   # PRD for V1
│   ├── User-Stories/           # User stories
│   ├── Use-Cases/              # Use cases
│   ├── Personas/               # User personas
│   └── Roadmap/                # Development roadmap
│
├── 03_Architecture/            # System design
│   ├── System-Architecture/    # High-level design
│   ├── Software-Architecture/  # Layers & components
│   ├── Data-Flow/              # Data flow diagrams
│   ├── Sequence-Diagrams/      # Flow diagrams
│   └── Decision-Records/       # Architecture decisions
│
├── 04_Database/                # Database design
│   ├── Existing-Schema/        # Current schemas
│   ├── Proposed-Schema/        # V1 schema
│   ├── ERD/                    # Entity relationship diagrams
│   ├── Migrations/             # Schema migrations
│   ├── SQL/                    # SQL scripts
│   └── Reports/                # Analysis reports
│
├── 05_API/                     # API specifications
│   ├── Internal/               # Internal APIs
│   ├── External/               # External integrations
│   ├── Authentication/         # Auth spec
│   ├── Webhooks/               # Webhook specs
│   └── OpenAPI/                # OpenAPI definitions
│
├── 06_AI/                      # AI & ML components
│   ├── Prompt-Library/         # System prompts
│   ├── Review-Classification/  # Classification models
│   ├── Reply-Generation/       # Reply templates
│   ├── Models/                 # Model definitions
│   └── Evaluation/             # Quality metrics
│
├── 07_UI-UX/                   # Design system
│   ├── Design-System/          # Component library
│   ├── Wireframes/             # Low-fi designs
│   ├── Mockups/                # High-fi designs
│   ├── Prototype/              # Interactive prototype
│   ├── Assets/                 # Design assets
│   └── Design-Reviews/         # Review findings
│
├── 08_Frontend/                # Frontend code (Dev Phase)
│   ├── Web/                    # Web application
│   ├── Components/             # React components
│   ├── Pages/                  # Page components
│   └── Services/               # API clients
│
├── 09_Backend/                 # Backend code (Dev Phase)
│   ├── Authentication/         # Auth service
│   ├── Reviews/                # Review service
│   ├── AI/                     # AI service
│   ├── Reports/                # Report service
│   └── Notifications/          # Notification service
│
├── 10_Integrations/            # Third-party integrations
│   ├── Google/                 # Google Reviews
│   ├── Facebook/               # Facebook Reviews
│   ├── TripAdvisor/            # TripAdvisor
│   ├── Zomato/                 # Zomato
│   └── Swiggy/                 # Swiggy
│
├── 11_Reports/                 # Report templates
│   ├── Daily/                  # Daily reports
│   ├── Weekly/                 # Weekly reports
│   └── Templates/              # Report templates
│
├── 12_Testing/                 # QA & Testing
│   ├── Unit/                   # Unit tests
│   ├── Integration/            # Integration tests
│   ├── End-to-End/             # E2E tests
│   └── Test-Reports/           # Test results
│
├── 13_Security/                # Security specs
│   ├── Authentication/         # Auth strategy
│   ├── Encryption/             # Encryption specs
│   ├── Compliance/             # Compliance docs
│   └── Audit/                  # Audit logs
│
├── 14_Deployment/              # Deployment scripts
│   ├── Docker/                 # Docker configs
│   ├── CI/                     # CI/CD pipelines
│   ├── Environment/            # Environment configs
│   └── Monitoring/             # Monitoring setup
│
├── 15_Operations/              # Operations docs
│   ├── SOP/                    # Standard procedures
│   ├── Monitoring/             # Monitoring guide
│   ├── Incident/               # Incident response
│   └── Maintenance/            # Maintenance guide
│
├── 16_Documentation/           # User & developer docs
│   ├── User-Guide/             # End-user guide
│   ├── Developer-Guide/        # Dev documentation
│   ├── Setup/                  # Setup instructions
│   └── Troubleshooting/        # Troubleshooting
│
├── 17_Project-Management/      # PM artifacts
│   ├── Sprint/                 # Sprint planning
│   ├── Backlog/                # Product backlog
│   ├── Tasks/                  # Task tracking
│   ├── Daily-Reports/          # Daily progress
│   ├── Progress/               # Progress tracking
│   └── Team/                   # Team info
│
├── 18_Business/                # Business docs
│   ├── Pricing/                # Pricing model
│   ├── Sales/                  # Sales materials
│   ├── Marketing/              # Marketing plan
│   ├── Branding/               # Brand guidelines
│   └── Legal/                  # Legal documents
│
├── 19_Assets/                  # Media & assets
│   ├── Images/                 # Screenshots, images
│   ├── Logos/                  # Logo files
│   ├── Videos/                 # Video files
│   ├── Icons/                  # Icon sets
│   └── Templates/              # Templates
│
├── 20_Archive/                 # Old/historical files
│
├── 21_Scripts/                 # Build & deployment scripts
│   ├── Setup/                  # Setup scripts
│   ├── Build/                  # Build scripts
│   ├── Database/               # DB scripts
│   └── Migration/              # Migration scripts
│
├── 22_Config/                  # Configuration files
│   ├── Environment/            # .env templates
│   ├── Application/            # App config
│   ├── AI/                     # AI models config
│   ├── Database/               # DB config
│   └── Logging/                # Logging config
│
├── 23_Tools/                   # AI tools & prompts
│   ├── Claude/                 # Claude prompts
│   ├── Cursor/                 # Cursor config
│   ├── MCP/                    # MCP servers
│   └── Automation/             # Automation scripts
│
├── 24_Logs/                    # Application logs
│   ├── AI/                     # AI logs
│   ├── Backend/                # Backend logs
│   ├── Frontend/               # Frontend logs
│   ├── Deployment/             # Deployment logs
│   └── Errors/                 # Error logs
│
└── 25_Release/                 # Release management
    ├── Alpha/                  # Alpha release
    ├── Beta/                   # Beta release
    └── Production/             # Production release
```

---

## 📊 Current Status

| Component | Status | Progress | Owner |
|-----------|--------|----------|-------|
| Research | 🔄 IN PROGRESS | 5% | Team |
| Database | ⏳ PENDING | 0% | DB Architect |
| UI/UX | ⏳ PENDING | 0% | Designer |
| API | ⏳ PENDING | 0% | API Architect |
| AI | ⏳ PENDING | 0% | AI Specialist |
| Backend | ⏳ PENDING | 0% | Backend Lead |
| Frontend | ⏳ PENDING | 0% | Frontend Lead |
| Architecture | ⏳ PENDING | 0% | Architect |
| Documentation | 🔄 IN PROGRESS | 15% | Writer |

---

## 🗓️ Timeline

### Week 1 - Research Phase (CURRENT)
- **Day 1** (Today): Project Scan & Inventory
- **Day 2**: Database & Prompt Analysis
- **Day 3**: Folder Structure & Cleanup
- **Day 4**: UI & API Research
- **Day 5**: Finalization
- **Day 6**: Architecture & Risk Analysis
- **Day 7**: Roadmap & Ready for Development

### Week 2-4 - Development Phase (TBD)
- Backend implementation
- Frontend implementation
- Integration testing
- Performance optimization

### Week 5+ - Deployment Phase (TBD)
- QA & UAT
- Staging deployment
- Production deployment
- Launch preparation

---

## 📋 Research Phase Checklist

### Day 1 (Today - 2026-07-26)
- ✅ Create folder structure
- ✅ Create PROJECT_INVENTORY.md
- ✅ Create RESEARCH_FRAMEWORK.md
- ✅ Create VERSION_1_SCOPE.md
- ✅ Create README.md
- ⏳ Document initial findings

### Day 2 (2026-07-27)
- ⏳ Complete DATABASE_ANALYSIS.md
- ⏳ Complete PROMPT_ANALYSIS.md
- ⏳ Create daily report

### Day 3-4 (2026-07-28 to 2026-07-29)
- ⏳ Complete UI_RESEARCH.md
- ⏳ Complete API_RESEARCH.md
- ⏳ Create daily reports

### Day 5-6 (2026-07-30 to 2026-07-31)
- ⏳ Complete ARCHITECTURE.md
- ⏳ Complete RISK_ANALYSIS.md
- ⏳ Finalize all research
- ⏳ Create daily reports

### Day 7 (2026-08-01)
- ⏳ Complete ROADMAP.md
- ⏳ Create TASK_BACKLOG.md
- ⏳ Ready for Development
- ⏳ Final review

---

## 🚀 Getting Started

### For New Team Members
1. Read this README
2. Read [VERSION_1_SCOPE.md](./00_Project-Control/Product-Scope/VERSION_1_SCOPE.md)
3. Check [Research Framework](./01_Research/Research-Reports/RESEARCH_FRAMEWORK.md)
4. Review daily progress reports in `/17_Project-Management/Daily-Reports/`

### For Researchers
1. Follow [RESEARCH_FRAMEWORK.md](./01_Research/Research-Reports/RESEARCH_FRAMEWORK.md)
2. Document findings in respective research folders
3. Create daily reports
4. Cross-reference with scope document

### For Developers (Week 2+)
1. Wait for research completion
2. Review [ARCHITECTURE.md](./03_Architecture/System-Architecture/ARCHITECTURE.md)
3. Review [DATABASE_FINAL.md](./04_Database/Proposed-Schema/DATABASE_FINAL.md)
4. Review API specifications in `/05_API/`
5. Start with backend implementation

---

## 📞 Support & Questions

### Research Phase
- **Questions about scope?** → See [VERSION_1_SCOPE.md](./00_Project-Control/Product-Scope/VERSION_1_SCOPE.md)
- **How to document findings?** → See [RESEARCH_FRAMEWORK.md](./01_Research/Research-Reports/RESEARCH_FRAMEWORK.md)
- **Current progress?** → Check `/17_Project-Management/Daily-Reports/`

### Development Phase (Week 2+)
- **Architecture questions?** → See `/03_Architecture/`
- **Database questions?** → See `/04_Database/`
- **API integration?** → See `/05_API/` and `/10_Integrations/`
- **AI/ML questions?** → See `/06_AI/`
- **UI/UX questions?** → See `/07_UI-UX/`

---

## 📚 Key Documents

### Governance
- [Vision](./00_Project-Control/Vision/) - Project vision
- [Mission](./00_Project-Control/Mission/) - Project mission
- [Version 1 Scope (LOCKED)](./00_Project-Control/Product-Scope/VERSION_1_SCOPE.md)
- [Success Metrics](./00_Project-Control/Success-Metrics/)
- [Risk Management](./00_Project-Control/Risks/)

### Research
- [Research Framework](./01_Research/Research-Reports/RESEARCH_FRAMEWORK.md)
- [Project Inventory](./01_Research/Research-Reports/PROJECT_INVENTORY.md)
- [Daily Progress Reports](./17_Project-Management/Daily-Reports/)

### Design
- [Architecture](./03_Architecture/)
- [Database Design](./04_Database/)
- [UI/UX System](./07_UI-UX/)
- [API Specs](./05_API/)
- [AI Components](./06_AI/)

### Development (After Research)
- [Backend Code](./09_Backend/)
- [Frontend Code](./08_Frontend/)
- [Integrations](./10_Integrations/)
- [Tests](./12_Testing/)
- [Deployment](./14_Deployment/)

---

## ✅ Success Criteria

Research phase is complete when:
1. ✅ All research documents are 100% complete
2. ✅ No gaps or assumptions remain
3. ✅ Complete traceability from document to requirement
4. ✅ All risks identified and mitigation planned
5. ✅ Architecture approved
6. ✅ Database schema finalized
7. ✅ UI specification complete
8. ✅ API specification complete
9. ✅ AI prompts finalized
10. ✅ Development roadmap ready

---

## 📝 Document History

| Date | Version | Status | Author |
|------|---------|--------|--------|
| 2026-07-26 | 1.0 | CREATED | Architect |

---

**Last Updated:** 2026-07-26  
**Next Update:** 2026-07-27  
**Status:** 🔬 RESEARCH PHASE - DAY 1

