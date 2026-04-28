# KwaXolo Impact Challenge — Project Context

Last updated from repository scan: 2026-04-28.

This file is the compact product/context reference for future agents. Original briefings and research live in `docs/briefings/` and `docs/research/`. The current working prototype lives in `test-site/`.

## Problem Statement
How should KwaXolo Impact digitally transform nine schools in rural KwaZulu-Natal to maximise digital literacy and long-term economic opportunity?

## Platform Name
**KwaXolo Learn**

## Current Repository Status

This repository contains both strategy materials and a working local agent prototype.

- Prototype: `test-site/`
- Run command: `npm start`
- Local URL: `http://localhost:3000`
- Main server: `test-site/server.js`
- Main UI: `test-site/public/index.html`
- Full content rules: `agent-guide/`
- Saved generation examples: `agent-guide/examples/good/` and `agent-guide/examples/bad/`
- Real app UI references: `Example sites/`
- South African Android logo pack: `Logos/south_africa_top_500_app_logos/`

The current prototype is a content-agent QA surface. It generates a teacher lesson plan and an interactive phone-style student task from a teacher's topic. It is not yet a full multi-role production platform with accounts, publishing, offline sync, or analytics.

## Deliverables
### 1. Strategy & Implementation Roadmap
- Phased transformation plan (5 phases — see Roadmap below)
- Must use case data

### 2. Learning Platform MVP
- Web app: teacher → AI agent → student flow
- Built with Lovable (100 credits)
- Focus: Phase 6 (entrepreneurship)
- Pitch date: April 29

## Evaluation Criteria
- Analysis (25%)
- Solution (25%)
- Creativity (20%)
- Feasibility (20%)
- Communication (10%)

---

## Users & Roles

### Teacher (primary creator)
- ~224 teachers across 9 secondary schools
- Digital literacy: assumed basic (browser, email, typing) — UX must be extremely simple
- Access: intermittent internet — most content creation at Msenti Hub or 2 connected schools
- Actions: generate modules via AI agent, edit/localise, publish to student library, view student progress

### Student (consumer)
- ~7,041 students across 9 schools (note: founder letter says ~6,000 — data discrepancy)
- ~65 students per working PC — groups of 4–6 sharing a machine
- Sessions: 30–45 minutes, often offline
- Digital baseline: 24% smartphone, 11% email, 4% Word/PPT, 2% Excel, 1% coding/AI
- Language: isiZulu is first language (81.8% in KZN); English is language of instruction
- Login: select school + name from class list (no password — shared PCs)

### Admin (oversight)
- Victor Jaca (CEO, Msenti Hub) and Thubelihle Sikobi (IT lead)
- Actions: view published content, flag/remove modules, view aggregate analytics, manage teacher accounts

---

## Infrastructure

### Connectivity (Updated — from platform spec)
- **2 of 9 schools** have stable internet
- **7 of 9 schools** are offline — content consumed offline after sync
- Msenti Hub has internet for teacher content generation
- Architecture: **online generation → offline consumption**
  - Generate at Msenti Hub / connected schools
  - Distribute via USB / local WiFi / periodic sync (Thubelihle as distribution channel)
  - Students consume cached content offline

### Hardware
- School PCs: 108 total (~12 per school), 8–12 years old
- 1 PC per teacher for generation/facilitation
- Shared student PCs: 4–6 students per machine
- No projector or screens — teachers use chalk and blackboard only

---

## Key Constraints
- No IT support on-site
- No licensed software
- Load shedding possible
- Students: zero startup capital
- Budget: DKK 2M total

---

## Language
- Full bilingual: English + isiZulu on every screen
- Language toggle (EN | ZU) always visible in navigation
- LLM generates content in both languages simultaneously
- Teacher (native/fluent isiZulu speaker) edits translation as quality gate
- Frame in pitch: "AI for first-draft translation, human teachers for QA"

---

## Strategic Focus
- **Phase 6 (entrepreneurship)** remains the product focus for KwaXolo Learn.
- Phase 1 basic digital literacy is a dependency and must be embedded into student tasks because many learners cannot yet use email, spreadsheets, app stores, or forms.
- Phases 2–5 are expected to involve external partners (Microsoft, Khan Academy, Google, SAP) — do not rebuild those ecosystems unless explicitly asked.
- Economic opportunity: **Chain A** (skills → formal employment over time) + **Chain B** (platform directly enables local micro-business creation now).

---

## AI Agent — Module Generation

Current implementation note: `test-site/server.js` has evolved from a single Lovable-style module generator into a multi-step local agent prototype.

Pipeline:
1. Search or load cached UI context for the topic/app.
2. Plan the full step sequence and difficulty.
3. Generate teacher material and student material in parallel.
4. Validate step count, local grounding, exercise fields, and screen types.
5. Save raw logs and allow good/bad example capture.

The current output is closer to a teacher lesson plan plus Duolingo-style student phone walkthrough than to a full bilingual module object. Full bilingual module/platform specs still live in the strategy docs and remain useful for the production product.

### Teacher flow
1. Select category (6 categories, A–F)
2. Select template (5 per category) or write custom brief (Category F)
3. Add local context (200 words max) + toggle grade/difficulty
4. Click Generate → LLM produces full bilingual module
5. Edit inline → Save draft or Publish

### Module templates (25 + custom)
#### A: Starting a Business
- A1: Finding a business idea in your community
- A2: Registering your business with SEDA
- A3: Writing a simple business plan (Lean Canvas)
- A4: Setting your first prices
- A5: Finding your first 10 customers

#### B: Money & Budgeting
- B1: Creating a weekly budget for your venture
- B2: Tracking income and expenses in a spreadsheet
- B3: Understanding profit, revenue, and cost
- B4: Opening a business bank account (or using MTN MoMo)
- B5: Applying for a micro-loan at Msenti Hub

#### C: Digital Marketing & Sales
- C1: Setting up a WhatsApp Business profile
- C2: Creating a Facebook page for your business
- C3: Taking good product photos with a phone
- C4: Writing a sales message that gets replies
- C5: Using Facebook Marketplace to sell locally

#### D: Practical Digital Skills
- D1: Creating a professional email and using it
- D2: Making a simple flyer in Canva or PowerPoint
- D3: Using Excel to track stock/inventory
- D4: Writing a quote/invoice for a customer
- D5: Using Google Maps to plan a delivery route

#### E: Sector-Specific
- E1: Starting a food business (baking, catering, preserves)
- E2: Starting a services business (photography, printing, tutoring)
- E3: Starting an agri-business (vegetable farming, poultry)
- E4: Starting a trade business (repairs, construction, sewing)
- E5: Selling crafts and handmade products online

#### F: Custom Module
- Teacher describes need in 1–3 sentences — last option, not first

### Module structure (production concept)
Learning Objectives → Key Concepts → Local Example → Practical Exercise → Quiz (5 questions) → Take-Home Challenge → Local Resources → Next Module Suggestion

### Current prototype output structure
- Teacher title
- Teacher objective
- Board points
- Teacher explanation
- Discussion questions
- Local example
- Time guide
- Student task title
- Student task intro
- App metadata
- Numbered interactive steps with screen type, exercise type, feedback, and visible result
- Reflection question

### Pedagogical model: Build–Practice–Present
- **Build:** Theory + local example (10 min)
- **Practice:** Group exercise on shared PC (15 min)
- **Present:** Take-home challenge, no computer required

Evidence base: Educate! RCT across Uganda/Rwanda/Kenya — 105% income increase.

---

## Local Context (for LLM system prompt)
- **Msenti Entrepreneurship Hub** — local incubator, Victor Jaca CEO. Offers business registration, mentorship, financial setup, IT support.
- **SEDA Port Shepstone** — government Small Enterprise Development Agency. Free business registration, compliance guidance.
- **Dolly Dlezi** — accountant at Msenti Hub. Bookkeeping and financial setup.
- **Caleb Phehlukwayo** — former principal, Deputy Chair of local school committee. Community trust leader.
- **Chief Inkosi Xolo** — traditional Zulu authority. Bridges local governance and district institutions.
- **Existing ventures from the Hub:** Hlobisile Pearl Studios (photography/events), 1LT Bakery (Thabo Shude), Inkify (printer store, Samke Jaca & Ntokozo Gwacela)
- **Payment:** cash-dominant, MTN Mobile Money growing, limited bank access
- **Local commerce:** spaza shops, WhatsApp-based ordering, Facebook Marketplace

---

## Growth Sectors (KZN)
- IT Services: 12.9% CAGR
- E-Commerce: 8.8%
- Agri-Tech: 7.6%
- Food & Artisan: 6.1%
- Construction & Trade: 5.2%
- Youth unemployment: >60%

---

## MVP Scope

Original Lovable MVP goal:
1. Teacher login → template selection → context input → AI generation → edit → publish
2. Student login → module library → lesson → quiz → progress
3. Admin view → published modules → basic analytics

Current local prototype demonstrates:
1. Teacher enters topic, learner struggles, time, and local context
2. Agent searches/plans/generates/validates a lesson
3. Teacher-facing plan renders in the browser
4. Student-facing phone simulator renders step-by-step app tasks
5. Reviewer can save generated output as a good or bad example
6. App logos and app design references are cached for reuse

Not implemented in the local prototype:
- User accounts
- Teacher edit/publish workflow
- Student library
- Persistent student progress
- Admin dashboard
- Offline caching / PWA
- USB sync / sneakernet distribution
- Multi-school deployment
- Kolibri integration

---

## Roadmap (5 phases)

| Phase | Timeline | Focus |
|---|---|---|
| 1 — MVP | Now | Web app, online only, single-school pilot, 3–5 modules |
| 2 — Pilot | Month 1–3 | 2 connected schools, 10 teachers, offline PWA caching, Kolibri integration |
| 3 — Expand | Month 3–6 | All 9 schools, USB sync, teacher-to-teacher sharing, admin analytics |
| 4 — Connect | Month 6–12 | Msenti Hub venture pipeline, alumni loop, Harambee job matching, Norden service-export pilot |
| 5 — Scale | Year 2+ | Open-source, Azure nonprofit credits, KZN DoE curriculum integration, multi-language |

---

## Key Assumptions to State in Pitch
1. Teachers can use a browser and type — no baseline data in case to confirm
2. KZN DoE partnership is achievable (case mentions as required, not confirmed)
3. Msenti Hub has reliable enough internet for AI generation sessions
4. Student count: using 7,041 (school table) — founder letter says ~6,000 (discrepancy flagged)
5. Mlonde and Thobigunya schools show identical data in case table — likely data entry error

## Implementation Constraints For Future Work

- Keep the agent template-driven; do not turn it into open-ended student chat.
- Keep teacher and student outputs separate.
- Preserve teacher review/QA before publishing.
- Treat isiZulu as a first-class language requirement, not a later translation layer.
- Preserve offline-first assumptions even when the local prototype is online-only.
- Prefer concrete app walkthroughs that start from first-time use.
- Preserve good/bad example capture; these are important feedback data for prompt iteration.
- Do not print secrets from `.env`.
- Do not assume `src/`, `assets/`, or `content/` contain active application code yet; they are placeholders.

---

## Data Model (simplified)
- **users:** id, name, role (teacher/student/admin), school, language_preference
- **modules:** id, title_en, title_zu, category, template_id, content (JSON), status, created_by, school, difficulty, grade
- **progress:** id, student_id, module_id, started_at, completed_at, current_section, quiz_score, quiz_answers

---

## Core Insight
Not a content problem — a system design problem under constraints. The teacher is the creator and quality gate; the AI is the production engine; the student is the end user.
