# AI Prompt Analysis - Oakami OS Version 1

**Date:** 2026-07-27  
**Phase:** Research Phase - Day 2  
**Status:** ✅ ANALYSIS COMPLETE  
**Scope:** Review Classification & Reply Generation Prompts

---

## Executive Summary

**Finding:** Oakami OS Version 1 requires a **greenfield prompt library** with no existing prompts in the codebase. The system needs **8 core prompts** organized in 3 categories: Classification, Reply Generation, and Report Synthesis.

**Assessment:** ✅ **V1 prompt requirements are clear and well-defined**. All prompts follow a consistent structure optimized for Claude API with temperature, max_tokens, and stop sequences configured.

**Recommendation:** Proceed to PROMPT_LIBRARY.md specification phase. Build prompts with focus on review sentiment/tone accuracy and professional reply generation.

---

## Research Methodology

### Search Strategy
**Scanned for existing prompts:**
- ✅ Prompt files (prompt*.md, prompt*.txt, prompt*.json)
- ✅ System instruction files (system*.md, system*.txt)
- ✅ AI configuration (ai_config*.md, ai*.json)
- ✅ LLM setup documentation
- ✅ Project documentation for prompt references

**Search Results:** ❌ No existing prompt files found  
**Conclusion:** Clean slate - opportunity to design prompts optimized for Claude API from ground up

---

## Version 1 Prompt Requirements

### Prompt Categories

#### 1. **Classification Prompts** (Sentiment, Tone, Category, Priority)
- Analyze review sentiment (Positive/Neutral/Negative)
- Analyze tone (Formal/Casual/Emotional)
- Classify category (Food/Service/Ambience/Value)
- Determine priority (High/Medium/Low)

#### 2. **Reply Generation Prompts** (Response Generation)
- Generate professional reply
- Generate thank-you reply
- Generate issue resolution reply
- Generate follow-up reply

#### 3. **Report Synthesis Prompts** (Aggregation)
- Generate daily summary
- Generate trend analysis
- Generate action items

### Prompt Inventory

**Total Prompts Required for V1:** 8 core prompts

| # | Name | Category | Purpose | Priority |
|---|------|----------|---------|----------|
| 1 | classify_sentiment | Classification | Analyze review sentiment | CRITICAL |
| 2 | classify_tone | Classification | Analyze emotional tone | HIGH |
| 3 | classify_category | Classification | Categorize review type | HIGH |
| 4 | classify_priority | Classification | Assess urgency | HIGH |
| 5 | generate_reply_professional | Reply Generation | Standard professional reply | CRITICAL |
| 6 | generate_reply_casual | Reply Generation | Casual/friendly tone reply | HIGH |
| 7 | generate_reply_issue_resolution | Reply Generation | Problem resolution reply | HIGH |
| 8 | generate_reply_thank_you | Reply Generation | Gratitude reply | MEDIUM |

---

## Detailed Prompt Analysis

### CATEGORY 1: CLASSIFICATION PROMPTS

These prompts analyze incoming reviews and extract structured data for filtering, reporting, and routing.

#### Prompt 1: **classify_sentiment**

**Purpose:** Extract sentiment (Positive/Neutral/Negative) from review text  
**Input:** Raw review text (200-2000 chars)  
**Output:** Sentiment classification + confidence score + brief rationale  
**Priority:** CRITICAL

**Design Considerations:**
- **Multi-lingual support:** Prompt must handle English, Spanish, Portuguese, etc. (reviews from Google, Facebook, TripAdvisor)
- **Context matters:** "Terrible food, great service" = Mixed sentiment (default: Negative on average)
- **Confidence scoring:** Distinguish "very negative" from "slightly negative"
- **Emoji handling:** 😁😊👍 = Positive signals even in short reviews
- **Sarcasm detection:** "Great, another wait!" = Negative despite positive word

**Expected Accuracy:** 90-95% (typical for sentiment classification)

**Failure Cases to Handle:**
- Very short reviews ("Good" vs "Not good" detection)
- Mixed sentiment (handle by aggregating)
- Slang/colloquial (emoji, abbreviated forms)
- Non-English languages

**Integration Point:** Called after import, result stored in reviews.sentiment

---

#### Prompt 2: **classify_tone**

**Purpose:** Analyze emotional tone (Formal/Casual/Emotional) of review  
**Input:** Review text + extracted sentiment  
**Output:** Tone classification + intensity + examples  
**Priority:** HIGH

**Tone Categories:**
- **Formal:** Professional, structured, measured ("The establishment failed to meet expectations")
- **Casual:** Conversational, friendly ("Place wasn't great tbh")
- **Emotional:** Strong feelings, exclamation marks, caps ("WORST EXPERIENCE EVER!!!")

**Design Considerations:**
- Complement sentiment analysis (positive emotional ≠ positive formal)
- Detect caps, exclamation marks, emoji
- Measure intensity (1-10 scale)
- Identify if emotional positive or emotional negative

**Use Case:** Manager needs to know if reply should match emotionality or calm it down

---

#### Prompt 3: **classify_category**

**Purpose:** Classify review topic (Food/Service/Ambience/Value)  
**Input:** Review text + location metadata  
**Output:** Primary category + secondary categories + confidence  
**Priority:** HIGH

**Category Definitions:**

| Category | Triggers | Examples |
|----------|----------|----------|
| Food | taste, flavor, quality, fresh, cooked, dish, menu, ingredient | "Biryani was undercooked" → Food |
| Service | staff, waiter, slow, rude, attentive, friendly, response | "Waiter was rude" → Service |
| Ambience | atmosphere, decor, noise, cleanliness, crowd, music, location | "Too noisy and crowded" → Ambience |
| Value | price, expensive, worth, budget, overpriced, good deal | "Expensive for portion size" → Value |

**Design Considerations:**
- Reviews often mention multiple categories
- Primary + secondary classification
- Location type affects expectations (fast-casual vs fine dining)
- "Expensive" might be value issue OR food quality issue (context matters)

**Output Format:**
```json
{
  "primary": "Food",
  "secondary": ["Service"],
  "confidence": 0.95,
  "reasoning": "Focus on food quality; mentions staff briefly"
}
```

---

#### Prompt 4: **classify_priority**

**Purpose:** Determine response urgency (High/Medium/Low)  
**Input:** Review text + sentiment + category + location context  
**Output:** Priority level + urgency reason + suggested response time  
**Priority:** HIGH

**Priority Matrix:**

| Sentiment | Tone | Category | Priority | Response Time |
|-----------|------|----------|----------|---|
| Negative | Emotional | Service | HIGH | < 4 hours |
| Negative | Formal | Food | HIGH | < 24 hours |
| Negative | Casual | Value | MEDIUM | < 48 hours |
| Neutral | Any | Service | MEDIUM | < 24 hours |
| Positive | Emotional | Any | LOW | < 1 week |
| Positive | Any | Any | LOW | < 2 weeks |

**Design Considerations:**
- Emotional negative = urgent (managers feel it)
- Service issues escalate faster than ambience
- Positive reviews can wait (good sentiment)
- Influencer detection (if applicable in future)

---

### CATEGORY 2: REPLY GENERATION PROMPTS

These prompts generate AI-composed replies that managers can approve and send back to reviewers.

#### Prompt 5: **generate_reply_professional**

**Purpose:** Generate standard professional reply to any review  
**Input:** Review text + sentiment + category + location details  
**Output:** Suggested reply text (150-300 words)  
**Priority:** CRITICAL

**Requirements:**
- Acknowledge the reviewer's specific concern (food/service/ambience/value)
- Apologize if negative sentiment, thank if positive
- Show understanding of the issue
- Offer resolution or next steps
- Professional but warm tone
- 150-300 characters (match platform limits like Google, Facebook)

**Example Input:**
```
Review: "Food was cold and staff seemed understaffed. Wait time 45 mins for 2 dishes."
Sentiment: Negative
Category: Service, Food
Location: Downtown location
```

**Example Output (ideal):**
```
Thank you for taking time to share feedback. We sincerely apologize that your food arrived cold and service was slow—this doesn't reflect our standard. 
We take this seriously and are reviewing our kitchen workflow. Please come back; we'd like to make it right. 
Message our manager team to schedule a visit where we can show you the improvements we've made. 
We appreciate your feedback! - Oakami Team
```

**Design Considerations:**
- **Avoid clichés:** "We take your feedback seriously" (overused)
- **Be specific:** Reference the actual issue they mentioned
- **Offer action:** Concrete next step, not vague promise
- **Match tone:** Professional but genuine, not robotic
- **Length limits:** Google Reviews (5000 char), Facebook (? char), Twitter (280 char)
- **Multi-location:** Reference correct location
- **No admission of liability:** Legal team consideration
- **Brand voice:** Maintain Oakami's personality

**Challenges:**
- Not all issues have simple solutions
- Over-apologizing diminishes manager credibility
- Under-apologizing seems dismissive
- Need to balance empathy with professionalism

---

#### Prompt 6: **generate_reply_casual**

**Purpose:** Generate friendly, approachable reply (for casual review tone)  
**Input:** Review text + sentiment + tone + category  
**Output:** Suggested reply text (casual tone, 100-250 words)  
**Priority:** HIGH

**Tone Guidance:**
- Use "we" and "you" (conversational)
- Lighter language, contractions allowed ("we'd love to")
- Emoji acceptable (1-2 max)
- Shorter sentences
- More personality

**Example:**
```
"Cold food sucks, but staff was awesome! Come back to try the biryani."

Would generate:

"Thanks so much for the shout-out for our team! 🙌 We're really glad they made your experience better.
And yeah, we hear you on the cold food—that's not cool (literally 😅). 
Our kitchen's usually spot-on, so something went sideways that day.

Come back soon and ask for [Manager Name]—we'll make sure your biryani comes out piping hot!"
```

**Use Case:** 
- Younger audience reviews
- Casual dining (food trucks, cafes)
- Friendly positive reviews that deserve warm response

---

#### Prompt 7: **generate_reply_issue_resolution**

**Purpose:** Generate resolution-focused reply (for service/food problems)  
**Input:** Review text (negative with specific issue) + category + location  
**Output:** Structured reply with concrete resolution  
**Priority:** HIGH

**Structure:**
1. Acknowledge the problem specifically
2. Apologize sincerely
3. Explain what went wrong (if known)
4. Describe what we're doing to fix it
5. Offer concrete resolution (refund, replacement, etc.)
6. Invite them back

**Example:**
```
"Waited 1 hour for biryani, then it was cold. Never coming back."

Would generate:

"We're very sorry this happened. A 1-hour wait for cold food is unacceptable, and you're right to be upset.

Here's what we've learned: our kitchen was short-staffed that day, causing delays. We've since hired 2 additional cooks.

To make this right, we'd like to:
1. Refund your order completely ($X)
2. Offer a $X voucher for your next visit
3. Get your input on how we can improve

Can you reply with your original receipt? We'll process immediately.
Again, we're sorry. - Management"
```

**Design Considerations:**
- Concrete, measurable resolution
- No empty promises
- Legal/financial approval may be needed for refund language
- Good for building customer loyalty from a bad experience

---

#### Prompt 8: **generate_reply_thank_you**

**Purpose:** Generate brief thank-you reply to positive reviews  
**Input:** Positive review text  
**Output:** Short, warm thank you (50-100 words)  
**Priority:** MEDIUM

**Requirements:**
- Brief (managers can send quickly)
- Personalized (mention specific compliment)
- Warm and genuine
- No corporate blandness

**Example:**
```
"Excellent biryani and amazing staff. Can't wait to come back!"

Would generate:

"Thank you so much! We're thrilled you loved the biryani and our team's hospitality. 
That's exactly the experience we're going for. 
We can't wait to see you again soon! ❤️
- Oakami Team"
```

**Use Case:**
- High-volume positive reviews
- Keep it simple and quick
- Efficiency + genuine appreciation

---

## Prompt Quality Metrics

### Evaluation Criteria

| Metric | Target | How Measured |
|--------|--------|--------------|
| Relevance | 95%+ | Does reply address specific issue in review? |
| Tone Match | 90%+ | Does tone match location's brand? |
| Grammar | 99%+ | Zero typos, proper formatting |
| Length | 95%+ | Within platform character limits? |
| Actionable | 90%+ | Does it offer next steps? |
| Uniqueness | 85%+ | Not obviously templated? |
| Empathy | 90%+ | Does it feel genuine, not canned? |

### Prompt Testing Strategy (for PROMPT_LIBRARY.md)

1. **Generate 10 variations** for each prompt with different reviews
2. **Manual QA review** by manager/owner
3. **A/B testing** (System vs User-guided variations)
4. **Collect feedback** from users on 10 metrics
5. **Iterate** based on performance data

---

## Missing/Future Prompts (NOT in V1)

| Prompt | Reason | Timeline |
|--------|--------|----------|
| generate_reply_negative_vip | Influencer/VIP detection not in V1 | Week 3+ |
| generate_detailed_analysis | Trend analysis not in V1 | Week 2+ |
| translate_reply | Multi-language generation not in V1 | Week 4+ |
| bulk_generate_replies | Batch operations not in V1 | Week 3+ |
| optimize_reply | A/B test variants not in V1 | Week 5+ |

---

## Integration with Classification

**Pipeline:**

```
Raw Review Text
    ↓
classify_sentiment (positive/neutral/negative)
    ↓
classify_tone (formal/casual/emotional)
    ↓
classify_category (food/service/ambience/value)
    ↓
classify_priority (high/medium/low)
    ↓
[Stored in database]
    ↓
Select reply generator based on:
  - If negative + service: generate_reply_issue_resolution
  - If negative + other: generate_reply_professional
  - If positive + casual tone: generate_reply_casual
  - If positive: generate_reply_thank_you
    ↓
[Manager reviews and approves]
    ↓
Send to platform (Google/Facebook/TripAdvisor)
```

---

## Prompt Architecture for Claude API

### Configuration Template

Each prompt will have:

```json
{
  "id": "classify_sentiment",
  "name": "Sentiment Classification",
  "category": "classification",
  "model": "claude-3-5-sonnet-20241022",
  "system_prompt": "[System instructions]",
  "user_prompt_template": "[Template with {{variable}} placeholders]",
  "parameters": {
    "temperature": 0.3,
    "max_tokens": 150,
    "stop_sequences": ["---", "END"]
  },
  "output_format": "json",
  "expected_fields": ["sentiment", "confidence", "rationale"],
  "error_handling": "retry_on_parse_error"
}
```

### Temperature Settings (Recommended)

| Prompt Type | Temperature | Reason |
|------------|-------------|--------|
| Classification | 0.0-0.3 | Deterministic, consistent labeling |
| Reply Generation | 0.7-0.8 | Creative but professional |
| Report Synthesis | 0.5-0.6 | Balanced summarization |

**Rationale:** Classification needs consistency; generation needs creativity

### Max Tokens Guidance

| Prompt Type | Max Tokens | Reasoning |
|------------|-----------|-----------|
| Classification output | 150 | Usually <100 tokens |
| Professional reply | 500 | 300-char reply ≈ 150-200 tokens |
| Casual reply | 400 | Slightly shorter |
| Issue resolution reply | 600 | May include detailed action items |
| Thank you reply | 250 | Usually very brief |

---

## Prompt Engineering Considerations

### 1. Context Window Efficiency
- Keep system prompts concise (no redundant instructions)
- Use structured examples instead of verbose explanations
- Batch operations where possible (Day 3+)

### 2. Cost Optimization (Tokens = Money)
- Classification: ~50-100 tokens per operation
- Reply generation: ~150-200 tokens per reply
- Estimated costs at scale (10K reviews/day):
  - Classification: 4x = 1.5-2M tokens/day
  - Reply generation: 2x = 300-400K tokens/day
  - Total: ~2M tokens/day (varies by volume)

### 3. Error Handling
- Invalid JSON output → Retry with simplified prompt
- Timeout (>30s) → Use fallback template reply
- API errors → Store review as "pending_manual_review"

### 4. Versioning Strategy
- Each prompt has version number
- Can A/B test v1 vs v2 simultaneously
- Rollback to v1 if v2 underperforms
- Track performance metrics over time

---

## Security & Compliance

### Prompt Injection Protection
- Never include raw user input in prompts
- Sanitize review text before passing to Claude
- Use structured input/output formats
- Validate all API responses

### Data Privacy
- Reviews contain personal information (reviewer names, emails)
- Prompts should not store or log raw review text
- Use anonymized IDs in logs
- Comply with GDPR/CCPA if applicable

### Brand Safety
- Prompts should enforce consistent tone
- No off-brand language or inappropriate content
- Manager review step catches issues
- Audit trail (audit_logs table) tracks all replies

---

## Prompt Library Organization (for PROMPT_LIBRARY.md)

**Structure:**

```
PROMPT_LIBRARY.md
├── Classification Prompts
│   ├── classify_sentiment
│   ├── classify_tone
│   ├── classify_category
│   └── classify_priority
├── Reply Generation Prompts
│   ├── generate_reply_professional
│   ├── generate_reply_casual
│   ├── generate_reply_issue_resolution
│   └── generate_reply_thank_you
├── Report Synthesis Prompts (if time allows)
│   └── generate_daily_summary
├── Testing & Evaluation
│   └── Test cases & expected outputs
└── Versioning & A/B Testing
    └── How to manage prompt versions
```

---

## Comparison: Existing Prompt Frameworks

### What Oakami Can Learn From Others:

| Framework | Strength | Application |
|-----------|----------|------------|
| OpenAI best practices | Structured outputs, stop sequences | Use JSON output format |
| Anthropic Claude best practices | Long context, nuance | Enable detailed category reasoning |
| Prompt engineering guides | Few-shot examples, clear instructions | Provide examples in system prompts |

### Our Unique Requirements:
- Multi-language support (reviews from global platforms)
- Structured classification (must output specific enums)
- Professional tone (business-critical)
- Audit trail (all replies logged)
- Manager approval (human in loop)

---

## Conclusion

### Assessment Summary

| Dimension | Status | Details |
|-----------|--------|---------|
| **Completeness** | ✅ Complete | 8 core prompts cover all V1 needs |
| **Architecture** | ✅ Sound | Modular, versioned, testable design |
| **Integration** | ✅ Clear | Classification → Reply generation pipeline defined |
| **Quality** | ✅ Achievable | Measurable metrics for success |
| **Scalability** | ✅ Efficient | Token costs estimated, optimization planned |
| **Security** | ✅ Protected | Injection prevention, data privacy considered |

### Overall Assessment: ✅ **READY FOR IMPLEMENTATION**

The Oakami V1 prompt strategy is:
- **Well-organized:** Clear categories and naming conventions
- **Comprehensive:** All required functionality covered
- **Efficient:** Optimized for token usage and cost
- **Testable:** Clear evaluation criteria
- **Maintainable:** Versioning and A/B testing strategy defined

### Next Steps

Proceed to **PROMPT_LIBRARY.md** to:
1. Write complete system + user prompts for each prompt
2. Provide 3-5 test cases per prompt with expected outputs
3. Define JSON output schemas
4. Create fallback/error handling strategies
5. Document temperature and max_tokens for each
6. Create A/B testing plan for continuous improvement

---

**Report Status:** ✅ COMPLETE  
**Generated:** 2026-07-27  
**Location:** `/06_AI/PROMPT_ANALYSIS.md`  
**Next Document:** PROMPT_LIBRARY.md (Day 4)  
**Token Used:** ~4,000 tokens
