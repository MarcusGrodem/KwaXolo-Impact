# KwaXolo Learn — System Prompt & Build Specification

## What this document is

This is the complete specification for a learning platform MVP built for the KwaXolo Impact Challenge. It serves two purposes: (1) as a Lovable build prompt — paste relevant sections directly into Lovable to generate the app, and (2) as a team reference document for the pitch on April 29.

---

## 1. Product concept (one paragraph)

KwaXolo Learn is a web-based platform where teachers in rural KwaZulu-Natal use an AI agent to generate locally relevant entrepreneurship learning modules — in isiZulu and English — which students then consume on shared school computers, with or without internet. The teacher is the creator and quality gate; the AI is the production engine; the student is the end user. The platform solves the content gap between "basic PC literacy" (Phase 1) and "running a digital venture" (Phase 6) in KwaXolo Impact's six-phase digital transformation model.

---

## 2. Users and roles

### 2.1 Teacher (primary creator)
- ~224 teachers across 9 secondary schools in rural KwaZulu-Natal
- Digital literacy level: assumed basic (can use browser, email, type) — but NOT assumed to be advanced. UX must be extremely simple.
- Access pattern: intermittent internet. Most content creation happens at Msenti Hub or the 2 schools with connectivity.
- Core actions: generate modules via AI agent, edit/localize content, publish to student-facing library, view student progress.

### 2.2 Student (consumer)
- ~7,000 students across 9 schools. ~65 students per working PC.
- Digital literacy baseline: 24% have smartphones, 11% can use email, 4% know Word/PPT, 2% know Excel, 1% coding/AI.
- Access pattern: shared PCs (groups of 4-6 students per machine), sessions of 30-45 minutes, often offline.
- Core actions: browse module library, work through lessons, complete exercises/quizzes, view own progress.
- Language: isiZulu is first language (81.8% in KZN). English is language of instruction at school. All content must be available in both languages.

### 2.3 Admin (oversight)
- Victor Jaca (CEO Msenti Hub) and Thubelihle Sikobi (IT lead) as primary admins.
- Core actions: view all published content, flag/remove inappropriate modules, view aggregate analytics (modules created, students active, quiz completion rates), manage teacher accounts.

---

## 3. The AI Agent — behavior specification

### 3.1 What the agent does
The agent generates structured entrepreneurship learning modules on demand. It does NOT have a free-form chat interface. It operates through a guided, template-driven flow where the teacher selects a category, provides local context, and the agent produces a complete module.

### 3.2 System prompt for the LLM agent

```
You are KwaXolo Learn Assistant, an AI that creates entrepreneurship learning modules for secondary school students in rural KwaZulu-Natal, South Africa.

CONTEXT YOU MUST KNOW:
- You are creating content for students aged 14-19 in the KwaXolo region
- Students have near-zero digital literacy (4% know Word, 2% know Excel)
- 81.8% speak isiZulu as first language, English at school
- Youth unemployment exceeds 60% in this region
- Students share computers (4-6 per PC, 30-45 min sessions)
- The goal is to teach skills that lead to real ventures, not theoretical knowledge

LOCAL CONTEXT (KwaXolo-specific):
- Msenti Entrepreneurship Hub: the local incubator run by Victor Jaca. Offers business registration, mentorship, financial setup, IT support.
- SEDA Port Shepstone: government Small Enterprise Development Agency office. Free business registration support, compliance guidance.
- Dolly Dlezi: accountant at Msenti Hub. Provides bookkeeping and financial setup for new ventures.
- Caleb Phehlukwayo: former school principal, Deputy Chair of local school committee. Community trust leader.
- Chief Inkosi Xolo: traditional Zulu authority. Bridges local governance and district institutions.
- Existing ventures from the Hub: Hlobisile Pearl Studios (photography/events), 1LT Bakery (Thabo Shude), Inkify (printer store, Samke Jaca & Ntokozo Gwacela).
- Local payment methods: cash-dominant, MTN Mobile Money growing, limited bank access.
- Local commerce: spaza shops (informal convenience stores), WhatsApp-based ordering, Facebook Marketplace for local trade.
- Growing sectors in KZN: IT Services (12.9% CAGR), E-Commerce (8.8%), Agri-Tech (7.6%), Food & Artisan Production (6.1%), Construction & Trade (5.2%).

WHEN GENERATING A MODULE, ALWAYS:
1. Produce content in BOTH English and isiZulu (provide both versions, clearly separated)
2. Use concrete local examples (real places, real services, real prices in South African Rand)
3. Include at least one practical exercise the student can complete in 20 minutes on a shared PC
4. Include a 5-question quiz with immediate feedback
5. Reference relevant local resources (Msenti Hub, SEDA, etc.) where applicable
6. Keep language simple — Grade 8-10 reading level
7. Structure every module as: Learning Objectives → Key Concepts → Local Example → Practical Exercise → Quiz → Next Steps
8. Suggest a "take-home challenge" that does NOT require a computer (so students can practice between sessions)

NEVER:
- Use jargon without explaining it
- Reference tools or services not available in rural KZN (e.g., don't assume Uber, Netflix, or contactless payment)
- Produce content longer than what can be consumed in a 30-minute session
- Generate content that requires internet access to complete exercises
- Assume one-student-per-computer — exercises should work for groups sharing a screen
```

### 3.3 Module templates (pre-defined categories)

The teacher does NOT type a freeform prompt. They select from these categories, then add local context:

#### Category A: Starting a Business
- Template A1: "Finding a business idea in your community"
- Template A2: "Registering your business with SEDA"
- Template A3: "Writing a simple business plan (Lean Canvas)"
- Template A4: "Setting your first prices"
- Template A5: "Finding your first 10 customers"

#### Category B: Money & Budgeting
- Template B1: "Creating a weekly budget for your venture"
- Template B2: "Tracking income and expenses in a spreadsheet"
- Template B3: "Understanding profit, revenue, and cost"
- Template B4: "Opening a business bank account (or using MTN MoMo)"
- Template B5: "Applying for a micro-loan at Msenti Hub"

#### Category C: Digital Marketing & Sales
- Template C1: "Setting up a WhatsApp Business profile"
- Template C2: "Creating a Facebook page for your business"
- Template C3: "Taking good product photos with a phone"
- Template C4: "Writing a sales message that gets replies"
- Template C5: "Using Facebook Marketplace to sell locally"

#### Category D: Practical Digital Skills
- Template D1: "Creating a professional email and using it"
- Template D2: "Making a simple flyer in Canva or PowerPoint"
- Template D3: "Using Excel to track stock/inventory"
- Template D4: "Writing a quote/invoice for a customer"
- Template D5: "Using Google Maps to plan a delivery route"

#### Category E: Sector-Specific Modules
- Template E1: "Starting a food business (baking, catering, preserves)"
- Template E2: "Starting a services business (photography, printing, tutoring)"
- Template E3: "Starting an agri-business (vegetable farming, poultry)"
- Template E4: "Starting a trade business (repairs, construction, sewing)"
- Template E5: "Selling crafts and handmade products online"

#### Category F: Custom Module
- Teacher describes what they need in 1-3 sentences
- Agent generates based on the description + system prompt context
- This is the only freeform option — and it's the last one in the list, not the first

### 3.4 Agent output structure

Every generated module follows this exact JSON structure (for rendering in the student-facing UI):

```json
{
  "title": { "en": "...", "zu": "..." },
  "category": "A|B|C|D|E|F",
  "template_id": "A1|A2|...|F_custom",
  "estimated_duration_minutes": 25,
  "learning_objectives": [
    { "en": "...", "zu": "..." }
  ],
  "sections": [
    {
      "heading": { "en": "...", "zu": "..." },
      "content": { "en": "...", "zu": "..." },
      "type": "theory|example|exercise|tip"
    }
  ],
  "exercise": {
    "title": { "en": "...", "zu": "..." },
    "instructions": { "en": "...", "zu": "..." },
    "group_size": "2-4 students",
    "requires_computer": true,
    "requires_internet": false
  },
  "quiz": [
    {
      "question": { "en": "...", "zu": "..." },
      "options": [
        { "en": "...", "zu": "..." }
      ],
      "correct_index": 0,
      "explanation": { "en": "...", "zu": "..." }
    }
  ],
  "take_home_challenge": { "en": "...", "zu": "..." },
  "local_resources": [
    {
      "name": "Msenti Hub",
      "what_they_offer": { "en": "...", "zu": "..." },
      "contact": "Victor Jaca"
    }
  ],
  "next_module_suggestion": "B2",
  "created_by_teacher": "teacher_id",
  "school": "school_name",
  "status": "draft|published|flagged",
  "created_at": "ISO-8601",
  "published_at": "ISO-8601"
}
```

---

## 4. Platform architecture

### 4.1 The fundamental split: online generation, offline consumption

```
┌──────────────────────────────────┐
│     ONLINE ZONE                  │
│  (Msenti Hub / 2 schools w/ net) │
│                                  │
│  Teacher → Agent → Generate      │
│  Teacher → Edit → Publish        │
│  Admin → Review → Dashboard      │
│  Sync engine → push to offline   │
└──────────────┬───────────────────┘
               │
    USB / local WiFi / periodic sync
               │
┌──────────────▼───────────────────┐
│     OFFLINE ZONE                 │
│  (7 schools without stable net)  │
│                                  │
│  Student → Browse → Learn → Quiz │
│  Progress stored locally         │
│  Syncs back when connection      │
│  available                       │
└──────────────────────────────────┘
```

### 4.2 For the Lovable MVP — simplified version

The Lovable MVP does NOT need to implement offline sync. It demonstrates the concept as a web app. In the pitch, the team explains the offline architecture verbally/on slides while the MVP shows the online flow working.

**What the MVP must show:**
1. Teacher login → template selection → context input → AI generation → edit → publish
2. Student login → module library → lesson consumption → quiz → progress tracking
3. Admin view → published modules list → basic analytics

**What the MVP does NOT need to show (explain in slides):**
- Offline caching / PWA functionality
- USB sync / sneakernet distribution
- Multi-school deployment
- Kolibri integration

### 4.3 Technical stack for Lovable

- Frontend: React (Lovable default)
- Auth: simple role-based (teacher/student/admin) — can use Supabase auth if Lovable supports it, otherwise mock with localStorage
- LLM: API call to Claude or GPT via Anthropic/OpenAI API — or, for demo purposes, a pre-generated module with a "generating..." animation
- Database: Supabase (if available) or in-memory state for MVP
- Styling: clean, minimal, mobile-friendly. White backgrounds, single accent color. Large touch targets (students may be using old PCs with imprecise mice).

---

## 5. UI/UX specification

### 5.1 Design principles

1. **Radically simple.** If a teacher needs instructions to use this, we've failed. Every action should be achievable in 2-3 clicks max.
2. **Large text, high contrast.** Many screens are old, many rooms are bright. Minimum 16px body text, preferably 18px. Black on white. No subtle grays.
3. **Bilingual by default.** Every screen has a language toggle (EN | ZU) in the top bar. Default is English. One tap switches everything.
4. **Progress is visible.** Students should always see "you are on module 3 of 8" or "you have completed 60%". Motivation through visibility.
5. **Group-friendly.** Exercises should display well for 2-4 students looking at one screen. Consider: large fonts, numbered steps, clear turn-taking instructions.

### 5.2 Screen-by-screen specification

#### Screen 1: Login
- Simple card: "I am a..." with three large buttons: TEACHER | STUDENT | ADMIN
- Teacher/Admin: email + password
- Student: school dropdown + student name (no password — these are shared PCs, authentication is minimal. Student selects their name from a class list.)

#### Screen 2: Teacher Dashboard
- Welcome message: "Sawubona, [name]. What would you like to create today?"
- Grid of 6 category cards (A through F) with icons and short descriptions
- Below: "Your published modules" — list with title, date, school, views
- Top bar: language toggle, logout, "View as student" button

#### Screen 3: Module Creator (Teacher)
- Step 1: Category selected (shown as breadcrumb)
- Step 2: Template selection — 5 options per category, displayed as cards with one-line descriptions
- Step 3: Context input — a single text area: "Add any local details you want the module to include (e.g., specific business type, location, budget amount)" — max 200 words. Plus toggles for: target grade (8/9/10/11/12), difficulty (beginner/intermediate)
- Step 4: "Generate Module" button → loading state with progress messages ("Researching local context...", "Writing learning objectives...", "Creating quiz questions...", "Translating to isiZulu...")
- Step 5: Generated module preview — full module displayed in an editable view. Teacher can: edit any text field inline, delete sections, reorder sections, regenerate individual sections ("Regenerate this quiz")
- Step 6: "Save as Draft" or "Publish" buttons. Publish adds to student-visible library.

#### Screen 4: Student Home
- Top: student name, school, progress bar ("You've completed X modules")
- "Continue where you left off" — card linking to last incomplete module
- "All modules" — filterable grid: by category, by difficulty, by language
- Each module card shows: title, category icon, estimated time, difficulty badge, completion status (not started / in progress / completed)

#### Screen 5: Module Viewer (Student)
- Clean reading view. One section at a time (not full-scroll — paginated, like a book)
- Language toggle always visible
- Section types rendered differently:
  - Theory: text with optional image/diagram
  - Example: highlighted box with local context
  - Exercise: step-by-step instructions, numbered, with group-size indicator ("Do this in pairs")
  - Quiz: one question per page, immediate feedback on answer, explanation shown after
- Progress indicator: "Section 3 of 7"
- End screen: completion message, score, take-home challenge displayed prominently, "Next suggested module" button

#### Screen 6: Admin Dashboard
- Stats cards: total modules published, total students active, average quiz score, modules created this week
- Table: all published modules with columns: title, teacher, school, date, views, average quiz score, status
- Action: click to view module, button to flag/unpublish
- Simple — this is for Victor and Thubelihle, not a data science team

---

## 6. Content & pedagogy notes for the pitch

### 6.1 Why templates, not freeform

Freeform prompting requires prompt engineering skill. Teachers in KwaXolo don't have that, and shouldn't need it. Templates guarantee:
- Consistent module quality (every module has objectives, exercise, quiz)
- Coverage of the Phase 6 curriculum (categories map to KwaXolo's sector focus)
- Faster generation (less ambiguity for the LLM = better output)
- Easier quality control (admin knows what to expect)

### 6.2 The "Build-Practice-Present" arc (from Educate! Rwanda model)

Every module follows this proven pedagogical structure:
- **Build**: Theory + local example (10 min) — student absorbs the concept
- **Practice**: Hands-on exercise in groups (15 min) — student applies the concept
- **Present**: Take-home challenge (after class) — student demonstrates to peers/family

This is the same structure used by Educate!, which achieved 105% income increase in RCT evaluations across Uganda, Rwanda, and Kenya. Mentioning this in the pitch gives evidence-based credibility.

### 6.3 isiZulu translation quality

The LLM will produce isiZulu that is functional but imperfect. This is acknowledged. The teacher — who is a native or fluent isiZulu speaker — edits the translation as part of the review step. Over time, corrected modules become a corpus that improves future generation. In the pitch, frame this honestly: "We use AI for first-draft translation and human teachers for quality assurance."

---

## 7. Data model (simplified for MVP)

### Users
```
users {
  id: uuid
  name: string
  role: "teacher" | "student" | "admin"
  school: string (one of 9 school names)
  language_preference: "en" | "zu"
  created_at: timestamp
}
```

### Modules
```
modules {
  id: uuid
  title_en: string
  title_zu: string
  category: string
  template_id: string
  content: json (full module structure from section 3.4)
  status: "draft" | "published" | "flagged"
  created_by: uuid (teacher)
  school: string
  difficulty: "beginner" | "intermediate"
  target_grade: integer
  created_at: timestamp
  published_at: timestamp
}
```

### Progress
```
progress {
  id: uuid
  student_id: uuid
  module_id: uuid
  started_at: timestamp
  completed_at: timestamp (nullable)
  current_section: integer
  quiz_score: integer (nullable)
  quiz_answers: json
}
```

---

## 8. Roadmap phases (for strategy slides)

### Phase 1 (MVP — now): Prove the concept
- Web app demonstrating teacher→agent→student flow
- Online only, single-school pilot
- 100 Lovable credits budget
- Target: 3-5 working modules demonstrating the system

### Phase 2 (Month 1-3): Pilot at 2 connected schools
- Deploy on Msenti Hub server
- Onboard 10 teachers (2 per school with best connectivity)
- Add offline caching (PWA with service workers)
- Begin Kolibri integration for Phase 1 basic literacy content
- Measure: modules created per week, student quiz completion rates

### Phase 3 (Month 3-6): Expand to all 9 schools
- USB-sync mechanism for offline schools (Thubelihle as distribution channel)
- Teacher-to-teacher module sharing (best modules propagate across schools)
- Admin analytics dashboard for KwaXolo Impact reporting
- Microsoft 365 Education license deployment (Phase 2-3 of KwaXolo's six phases)

### Phase 4 (Month 6-12): Connect to economic outcomes
- Msenti Hub venture pipeline: students who complete module track → matched with mentors
- Alumni loop: Phase 6 graduates contribute modules back as guest content creators
- Integration with Harambee Youth Employment Accelerator for job matching
- Service export pilot: top students matched with Norwegian/Danish SME tasks via KwaXolo's volunteer network

### Phase 5 (Year 2+): Scale beyond KwaXolo
- Open-source the platform for other rural South African communities
- Microsoft for Nonprofits Azure credits ($2,000/year) for hosting
- Partner with KZN Department of Education for curriculum integration
- Multi-language expansion (isiXhosa, Afrikaans, Sesotho)

---

## 9. Key assumptions to state in the pitch

These are data gaps in the case that any honest proposal should acknowledge:

1. **Teacher digital literacy**: We assume teachers can use a browser and type. The case provides no baseline data on teacher digital skills. If this assumption is wrong, a teacher onboarding module must precede everything else.

2. **KZN DoE partnership status**: We assume the public-private partnership with the KwaZulu-Natal Department of Education is in place or achievable. The case mentions it as required but doesn't confirm its status.

3. **Internet at Msenti Hub**: We assume Msenti Hub has reliable enough internet for teachers to run AI generation sessions. If not, a satellite or dedicated line (~R2,000/month) is a prerequisite investment.

4. **Student enrollment data mismatch**: The case gives both ~6,000 (founder letter) and 7,041 (school status table). We use 7,041 as the more recent figure and flag the discrepancy.

5. **Mlonde and Thobigunya identical data**: These two schools show identical numbers in the case table (33/35 teachers, 956 students, 95.4% pass rate). This is likely a data entry error. We treat them as separate schools but note the anomaly.

---

## 10. Pitch structure suggestion (10 minutes)

| Time | Section | Content |
|------|---------|---------|
| 0:00-1:00 | The Problem | 7,000 students, 108 PCs, zero entrepreneurship content. Phase 1 and Phase 6 are broken links. |
| 1:00-2:30 | What Others Have Done | Kolibri (offline), Educate! (entrepreneur pedagogy), Rwanda Smart Classrooms (national scale), Harambee (SA job matching). What works, what's missing. |
| 2:30-4:00 | Our Solution | KwaXolo Learn: AI-powered content creation by teachers, consumed offline by students. The three-layer architecture: generate (online) → distribute (sync) → consume (offline). |
| 4:00-6:30 | Live Demo | Walk through: teacher selects template → adds context → agent generates → teacher edits → publishes. Switch to student view → module library → lesson → quiz. |
| 6:30-8:00 | Strategy Roadmap | 5-phase plan from MVP to scale. Offline sync via Thubelihle. Kolibri integration. Alumni pipeline. Norden service-export channel. |
| 8:00-9:00 | Feasibility & Impact | Budget: Azure credits via Microsoft for Startups. Evidence: Educate! RCT data. KPIs: modules created/week, quiz completion, ventures launched. |
| 9:00-10:00 | Assumptions & Ask | Honest about data gaps. What KwaXolo Impact needs to validate. Closing statement. |

---

## 11. Lovable-specific build prompt

If pasting into Lovable, use this condensed version:

```
Build a web application called "KwaXolo Learn" — an AI-powered entrepreneurship learning platform for rural South African schools.

THREE USER ROLES:
1. Teacher: creates learning modules using an AI assistant
2. Student: consumes modules, completes quizzes
3. Admin: views analytics and manages content

TEACHER FLOW:
- Dashboard showing 6 module categories (Starting a Business, Money & Budgeting, Digital Marketing, Practical Digital Skills, Sector-Specific, Custom)
- Each category has 5 pre-defined templates
- Teacher selects template → adds local context in a text box → clicks "Generate"
- AI generates a structured module with: learning objectives, 3-4 content sections, a group exercise, a 5-question quiz, and a take-home challenge
- All content generated in BOTH English and isiZulu
- Teacher can edit any field inline before publishing
- "Save Draft" and "Publish" buttons

STUDENT FLOW:
- Login by selecting school + name from list (no password)
- Home: progress bar, "continue where you left off", module library grid
- Module viewer: paginated (one section at a time, not scroll), language toggle (EN/ZU), quiz with immediate feedback
- Completion screen: score, take-home challenge, next module suggestion

ADMIN FLOW:
- Stats dashboard: modules published, active students, average quiz score
- Table of all published modules with ability to flag/unpublish

DESIGN:
- Clean, minimal, high-contrast (black text on white, single accent color)
- Large text (18px body minimum) — users have old screens and low digital literacy
- Mobile-responsive but optimized for desktop (shared school PCs)
- Language toggle (EN | ZU) in top navigation bar, always visible
- No decorative elements — every pixel serves a purpose
- Warm, encouraging tone in all UI copy

TECH:
- React with TypeScript
- Supabase for auth and database
- Anthropic Claude API (or mock with pre-generated content for demo)
- Tailwind CSS for styling

The app serves 9 schools, 224 teachers, and ~7,000 students in rural KwaZulu-Natal, South Africa. Internet is unreliable. Content must be generated when online and consumed offline. For the MVP, focus on the online flow — offline sync is described in slides.
```
