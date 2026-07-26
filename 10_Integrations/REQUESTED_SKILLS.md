# Requested Skills & Plugins for Oakami OS Version 1

**Date:** 2026-07-27  
**Status:** RESEARCH PHASE - REQUESTED INTEGRATIONS

---

## Pending Skill Requests

### 1. UI/UX Pro Max Skill (PRIORITY: HIGH)

**Request:** `nextlevelbuilder/ui-ux-pro-max-skill`  
**Purpose:** Advanced UI/UX design methodology for Days 3-5 research  
**Status:** ⏳ REQUESTED - NOT YET AVAILABLE IN MARKETPLACE

**Requested Features:**
- UI component design patterns
- Wireframing & prototyping guidance
- Design system creation
- Accessibility audits (WCAG)
- Developer handoff specifications
- UX copy writing

**Alternative Available:** 
- **design** plugin (already enabled)
  - `/design:critique` - Design feedback
  - `/design:handoff` - Developer specs
  - `/design:accessibility` - WCAG audit
  - `/design:ux-copy` - UX writing
  - `/design:research-synthesis` - User research synthesis

**Timeline:**
- Needed for: UI_RESEARCH.md (Day 3), UI_SPECIFICATION.md (Day 5)
- If available: Install and use for Days 3-5
- If unavailable: Use default design plugin + /design-consultation skill from gstack

**Impact on Project:**
- ✅ Not blocking - alternative design tools available
- ⚠️ Nice-to-have for enhanced UI research quality
- Token impact: ~2,000 tokens if integrated

---

## Already Integrated Skills

### Primary Integrations
1. ✅ **gstack** (v1.60.1.0) - 23+ skills
   - /office-hours, /plan-ceo-review, /plan-eng-review
   - /design-consultation, /design-review
   - /review, /ship, /qa, /qa-only
   - /cso (security), /investigate, /retro, /canary
   
2. ✅ **gbrain** - Semantic memory system
   - 30+ MCP tools for knowledge management
   
3. ✅ **obsidian-github** - GitHub integration for Obsidian
   - Track starred repositories as notes

4. ✅ **design plugin** - UI/UX design skills (default)
   - Already enabled and available

---

## Next Steps

**If ui-ux-pro-max-skill becomes available:**
1. Document in marketplace when available
2. Install via: `plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`
3. Enable: `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`
4. Use for Day 3-5 UI research tasks

**Current Plan (Days 2-5):**
- Use existing **design** plugin for UI/UX guidance
- Use **gstack /design-consultation** for design system work
- Use **gstack /plan-design-review** for design validation
- Document research findings in UI_RESEARCH.md and UI_SPECIFICATION.md

---

**Status:** Ready to proceed with available tools.  
**Impact on Schedule:** None - alternative tools available.  
**Action:** Monitor marketplace for ui-ux-pro-max availability; integrate if/when available.
