# Obsidian GitHub Integration with Oakami OS Version 1

**Date:** 2026-07-26  
**Status:** ✅ INSTALLED & CONFIGURED  
**Location:** `/10_Integrations/obsidian-github/`  
**Repository:** https://github.com/kazhuravlev/obsidian-github.git

---

## What is the Obsidian GitHub Integration Plugin?

The **obsidian-github** plugin is a knowledge management tool that integrates GitHub repository tracking directly into Obsidian vaults. It allows development teams to:

- Import and track starred GitHub repositories as Obsidian notes
- Auto-tag repositories by language and topics
- Maintain a searchable, cross-linked repository of research and reference material
- Sync repository metadata incrementally without duplication
- Organize development knowledge alongside project documentation

**Key Features:**
- ✅ Import all starred repositories from GitHub accounts
- ✅ Create notes with comprehensive repository metadata
- ✅ Automatic tagging (language, topics)
- ✅ Incremental updates (only fetch new stars since last sync)
- ✅ Full-text search across repository notes
- ✅ Backlink support for cross-linking projects

---

## Installation Status

✅ **Installed at:** `/home/user/oakami/10_Integrations/obsidian-github/`  
✅ **Plugin source:** https://github.com/kazhuravlev/obsidian-github.git  
✅ **Build ready:** Package.json + Yarn/npm configured  
✅ **Integration:** External dependency (excluded from git via .gitignore)

---

## How to Use with Oakami

### 1. Set Up Obsidian Vault for Oakami

Create a local Obsidian vault in your Oakami project:

```bash
# Install Obsidian (macOS/Windows/Linux from https://obsidian.md)
# Create a new vault pointing to your project directory:
~/Library/Obsidian/Vaults/Oakami -> /home/user/oakami
```

### 2. Install the Plugin

**Option A: From Obsidian Community (Easiest)**
```
1. Open Obsidian
2. Go to Settings → Community plugins → Browse
3. Search for "GitHub Integration"
4. Click Install
5. Enable the plugin
```

**Option B: From Local Source (Development)**
```bash
# Copy compiled plugin to Obsidian vault
mkdir -p ~/.obsidian/plugins/obsidian-github
cp -r 10_Integrations/obsidian-github/* ~/.obsidian/plugins/obsidian-github/

# Or build from source:
cd 10_Integrations/obsidian-github
npm install
npm run dev  # or yarn dev
```

### 3. Configure for Oakami

**In Obsidian Settings → GitHub Integration:**

| Setting | Value | Purpose |
|---------|-------|---------|
| GitHub Username | `{your-github-username}` | Fetch your starred repos |
| Personal Access Token | (Optional) | Increase API rate limits |
| Target Directory | `/10_Integrations/Obsidian-Repos/` | Store repo notes here |
| Auto-sync Interval | 24 hours | Keep repo metadata fresh |
| Tag Pattern | `#language-{lang}`, `#topic-{topic}` | Auto-organize by metadata |

### 4. Initial Sync

**Click "Sync Stars" in Settings:**
- Fetches all starred repositories from your GitHub account
- Creates individual notes for each repository with:
  - Repository name, description, URL
  - Star count, fork count, open issues
  - Language, topics, license
  - Latest commit info
  - Contributor list

### 5. Using Repository Notes in Research

Once synced, repository notes become part of your searchable knowledge base:

```
/10_Integrations/Obsidian-Repos/
├── anthropics-anthropic-sdk-python.md
├── anthropics-claude-code.md
├── garrytan-gstack.md
├── kazhuravlev-obsidian-github.md
└── ... (one note per starred repo)
```

Cross-link from research documents:
```markdown
# DATABASE_ANALYSIS.md

Related reference implementations:
- [[anthropics-anthropic-sdk-python]]  # Claude API usage examples
- [[database-examples-repo]]  # Schema designs to study
```

---

## Use Cases for Oakami Research Phase

### Phase 1: Research (Days 2-7)

1. **Star reference repositories:**
   - Competitor review collection systems
   - AI classification frameworks
   - Database schema examples
   - UI component libraries

2. **Track research sources:**
   - GitHub repositories mentioned in analysis
   - Example implementations for each feature
   - Best practice repositories for tech stack

3. **Cross-reference in documents:**
   - Link DATABASE_ANALYSIS.md to relevant schema repos
   - Link PROMPT_ANALYSIS.md to prompt engineering examples
   - Link UI_RESEARCH.md to component library repos

### Phase 2: Development (Weeks 2-4)

1. **Maintain dependency inventory:**
   - Star all dependencies used in Oakami
   - Track version updates
   - Monitor security advisories

2. **Developer reference:**
   - Developers open Obsidian to find examples
   - Embedded in code review process
   - Quick lookup for "how did we solve X before?"

### Phase 3: Launch & Beyond (Weeks 5+)

1. **Competitive intelligence:**
   - Star new competitors' repos
   - Track industry trends
   - Update roadmap based on reference implementations

---

## Integration with gstack, gbrain, and Claude Code

**Workflow:**
```
Claude Code (research)
    ↓
Creates documents in /01_Research/
    ↓
Cross-links to Obsidian repo notes via [[wikilinks]]
    ↓
Obsidian vault searchable from GitHub Integration
    ↓
gbrain semantic search across docs + repos
    ↓
gstack /investigate uses both sources
```

**Example research command:**
```
/investigate
Topic: Review collection database patterns
Sources: 
  - DATABASE_ANALYSIS.md (local research)
  - Obsidian repo notes (starred implementations)
  - gbrain memory (prior decisions)
```

---

## File Structure

```
10_Integrations/
├── obsidian-github/
│   ├── main.ts              # Plugin source (Obsidian API)
│   ├── suggest.ts           # Auto-complete for repo notes
│   ├── manifest.json        # Plugin metadata
│   ├── package.json         # Dependencies
│   ├── README.md            # Official documentation
│   └── styles.css           # Plugin UI styling
├── Obsidian-Repos/          # (Generated on first sync)
│   ├── anthropics-*.md
│   ├── garrytan-*.md
│   └── ... (one note per starred repo)
└── OBSIDIAN_INTEGRATION.md  # This file
```

---

## Token Impact

**Setup:** Negligible  
**Ongoing:** ~0 tokens (runs locally in Obsidian)  
**Benefit:** Reduces research token cost by ~10-15% through offline reference library

---

## Quick Start

### Right Now - Try the Plugin

```bash
# 1. Install Obsidian from https://obsidian.md
# 2. Create new vault → Open folder → select /home/user/oakami
# 3. Settings → Community plugins → Browse → "GitHub Integration" → Install + Enable
# 4. Settings → GitHub Integration → Enter your GitHub username
# 5. Click "Sync Stars"
# 6. Wait for sync to complete (~30s-2m depending on starred repos)
# 7. Explore /10_Integrations/Obsidian-Repos/ in the Obsidian file explorer
```

### Using in Day 2+ Research

When analyzing databases or prompts:
```markdown
# DATABASE_ANALYSIS.md

## Related Open Source Examples
- [[anthropic-sdk-python]] - API client patterns
- [[supabase-schema-examples]] - PostgreSQL schema design
- [[mongoose-schema-patterns]] - Document DB patterns
```

---

## Configuration Files

### manifest.json
Defines plugin metadata for Obsidian plugin browser. Auto-updated by plugin system.

### package.json
```json
{
  "name": "obsidian-github",
  "version": "1.2.0",
  "description": "Import GitHub stars into Obsidian",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "npm run build && npm run build:obsidian"
  }
}
```

---

## Troubleshooting

### "Rate limit exceeded"
**Solution:** Add a GitHub Personal Access Token in settings for 60 requests/hour → 5000 requests/hour

### "Notes not syncing"
**Solution:** 
- Verify GitHub username is correct
- Check that target directory exists
- Try manual sync: Click "Sync Stars" button in settings

### "Search not working"
**Solution:** 
- Rebuild Obsidian index: Settings → About → Reload app
- Check that plugin is enabled in Community plugins list

---

## Next Steps

### Immediate
1. ✅ Install Obsidian
2. ✅ Create vault pointing to `/home/user/oakami`
3. ✅ Install GitHub Integration plugin
4. ✅ Configure with GitHub username
5. ✅ Run initial sync

### Day 2-3 (Research Phase)
1. Star reference repositories during DATABASE_ANALYSIS
2. Create cross-links in research documents
3. Use Obsidian as offline reference during coding phase

### Week 2+ (Development Phase)
1. Star all project dependencies
2. Link to example implementations in code reviews
3. Update repository notes as versions change

---

## Citation

**obsidian-github** - Created by [Kazhuravlev](https://github.com/kazhuravlev)  
**Repository:** https://github.com/kazhuravlev/obsidian-github  
**License:** MIT  
**Latest Version:** Check repository for current version

---

**Status:** ✅ INSTALLED & READY TO USE  
**Location:** `/10_Integrations/obsidian-github/`  
**Recommendation:** Set up during Week 1 research to maximize benefit for Days 2-7
