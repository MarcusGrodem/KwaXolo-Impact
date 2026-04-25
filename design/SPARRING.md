# KwaXolo — Sparring Log & Agreements

A running record of sparring sessions, key arguments tested, and conclusions reached.

---

## Core Design Constraints

> Non-negotiables. Every solution must work within these.

- No IT support on-site
- No licensed software
- isiZulu is the primary language — English literacy cannot be assumed
- 86% learning poverty rate in sub-Saharan Africa — many students cannot read simple text
- Budget: DKK 2M total (covers strategy + MVP + rollout)
- 1 PC per teacher only — students do not have PC access

## Infrastructure (Updated 2026-04-22)
- WiFi available at all schools
- Stable power available
- Near-universal phone access among students — mobile-first is viable and correct device strategy
- Previous offline-first constraint no longer applies

---

## Strategic Insight

> The sharpest observation from research so far.

**KwaXolo's solution needs to operate below the current market floor.** Every major African EdTech platform (Eneza, uLesson, most e-learning tools) assumes English literacy and some baseline digital familiarity. KwaXolo's Phase 1 students have neither. This is not just a constraint — it is genuine whitespace. The hardest-to-reach learners are the most underserved by existing solutions.

---

## Agreements & Conclusions

> Settled positions — things we've stress-tested and landed on.

- **English embedded, not taught** — given ~1-2h seat time/week per student, explicit English instruction is not feasible. English should be ambient in the interface (labels, buttons, file names) while isiZulu carries the instructional layer. *(Sessions 1–2, now updated: English is primary, isiZulu hoverable on difficult words only)*
- **Engagement is not the problem** — novelty of computers in this context means engagement is already there. The design challenge is directing it, not manufacturing it.
- **Ownership over gamification** — tasks that feel personal and real (type your name, save a file) are more effective and cheaper than point systems.
- **Capital should flow toward:** offline robustness, teacher enablement, hardware compatibility — not engagement mechanics.
- **Phase 6, not Phase 1** — updated infrastructure (WiFi, power, near-universal phone access) removes the offline-first constraint. Focus is entrepreneurship, not basic PC literacy. *(Session 3, 2026-04-22)*
- **Mobile-first for students** — phone is the student device. 1 PC per teacher only. *(Session 3)*
- **LLM is invisible infrastructure** — students never interact with AI directly. LLM generates content in the background; students see guided tasks. Teachers use a simple form to trigger generation. *(Session 3)*
- **Teacher as content trigger, not expert** — the form asks plain-language questions. LLM bridges the gap between teacher's simple input and structured curriculum. *(Session 3)*
- **Two LLM outputs per lesson** — (1) blackboard lesson plan for teacher, (2) student mobile task. These are connected: same topic, complementary layers. *(Session 3)*
- **Content is context-specific micro-business** — zero startup capital assumed. Examples and opportunities grounded in rural KwaZulu-Natal (food, artisan, agri-tech, local services). No generic business school content. *(Session 3)*
- **Economic opportunity via Chain A + Chain B** — Chain A: skills → formal employment over time. Chain B: platform directly enables local micro-business creation now. *(Session 3)*
- **WhatsApp is a business tool, not a distraction** — already universal, already trusted. Platform treats it as legitimate business infrastructure. *(Session 3)*
- **MVP = 3 lessons end-to-end** — identify local opportunity → who is your customer → write your one-sentence business description. Demonstrates full system without overbuilding. *(Session 3)*
- **Real LLM API for demo** — not hardcoded/simulated content. Claude API with KwaZulu-Natal system prompt. More impressive and closer to the real product. *(Session 3)*

---

## Open Questions

> Things still under debate or not yet resolved.

- How do you sustain engagement *after* novelty wears off (months 3–12)?
- How do you sustain the teacher layer long-term — what's the incentive for teachers to keep using the platform?
- What happens to a student's progress if they change schools or lose their phone?
- How does the platform handle students with very low reading ability — is the text-based mobile task sufficient, or does it need audio/visual support?
- Is the Business Profile card enough as a student outcome, or does the platform need to connect students to actual market opportunities?
- What local data specifically feeds the LLM system prompt — who at KwaXolo owns and updates this?
- Web scraping for daily local business data: who builds and maintains the scraper, and is it realistic before MVP?
- Does the platform need student accounts for privacy reasons (minors), or is a simple code sufficient long-term?

---

## Ideas to Keep Warm

> Not agreed on — but worth developing further before closing off.

- **Local LLM** — a small language model running entirely on-device, no internet required. Could power adaptive tutoring, isiZulu/English interaction, or Q&A without cloud dependency.
- **Simple offline learning portal** — a lightweight web app or local application running on existing school PCs. Low-tech, high-reach, works within hardware and connectivity constraints.
- **Hybrid PC + SMS model** — PC is the learning environment at school; SMS delivers accountability and reinforcement outside school. Students do sessions on PC, receive SMS summaries or micro-quizzes at home. Teachers get SMS progress updates without needing a laptop. Separates the learning layer (PC, rich) from the reach layer (SMS, universal).
- **Pre-scripted branching dialogue** — a decision-tree conversation system. Student picks answers or types keywords, system follows pre-written paths. Runs on any hardware, fully offline, no hallucinations. Weakness: breaks when students go off-script. Could be authored in isiZulu with English embedded at key moments. Teachers could potentially contribute content over time.

---

## Data & Evidence

- **Mobile ownership in South Africa** (source: screenshot, 2026-04-20)
  - 2020: 83% own a mobile phone
  - 2024: 89% own a mobile phone
  - Change 2013–2024: +6 percentage points (+7%)
  - **Note:** This is mobile *ownership* (any phone), not smartphone ownership. The 24% smartphone figure from the case study is still the relevant constraint for app-based solutions. But SMS/basic-phone approaches can reach nearly 9 in 10 people today.

---

## References & Inspiration

- **M-Shule** ([UNESCO case study](https://www.uil.unesco.org/en/litbase/m-shule-sms-learning-training-kenya)) — SMS-based adaptive learning, Kenya. "Mobile school" in Swahili.
  - **How it works:** delivers lessons and assessments via SMS on any basic phone, no internet or smartphone needed. AI personalises content based on performance.
  - **Languages:** Swahili + English. Also supports Dholuo, Kamba, Kikuyu, Ng'aturkana, Somali across East Africa — 7 languages total. Strong non-English model.
  - **What works:** 20%+ exam score improvement reported; 82% of parents saw positive impact; reached 23,000+ learners including refugees; reduced teacher admin burden.
  - **What doesn't:** struggles with content contextualisation across communities with different digital literacy levels; scaling requires telecom partnerships which can be slow/restricted.
  - **Key lesson for us:** language localisation is doable and impactful. SMS removes the smartphone barrier entirely. But digital literacy variation across communities is a real design challenge.

- **Eneza Education** ([Engineering for Change](https://www.engineeringforchange.org/solutions/product/eneza-education/)) — SMS/USSD/Android learning platform, Kenya, Ghana, Nigeria, Tanzania, Côte d'Ivoire.
  - **How it works:** students activate quizzes via code, answer via SMS/USSD, get instant feedback. "Ask-a-Teacher" feature connects learners to live teachers within 30 min.
  - **Languages:** ⚠️ English only — a significant limitation given its reach into non-English regions.
  - **What works:** 9-point test score improvement in impact studies; 15%+ improvement in 3-month pilot; reached 6 million learners across 3 countries.
  - **What doesn't:** English-only excludes the communities it claims to serve; no documented accommodation for low-literacy users; requires airtime (~$0.10/week) which is a cost barrier.
  - **Key lesson for us:** Eneza proves the SMS/USSD delivery model scales. But it failed the language problem — exactly the gap KwaXolo's solution needs to fill. Reach without language accessibility is shallow reach.
- **Combined EdTech Africa Analysis** (synthesised in `edtech_africa_report_2.md` — draws on BCG report + academic journal)
  - 98 million children out of school in sub-Saharan Africa; 15 million teachers missing; 72 million youth aged 15–24 not in education or work
  - M-Shule and Eneza Education specifically cited as mobile-first models that work on basic connectivity
  - >80% of African EdTech startups are e-learning — most lack personalisation, engagement, or local relevance
  - Affordability is not just devices — it includes data, electricity, maintenance, and time
  - **The hardest-to-reach learners are in the weakest-infrastructure places** — the people who need it most are the most expensive to serve
  - EdTech works best as part of a broader system strategy, not as a standalone fix
  - **Key implication:** teacher training is not optional — without it, technology is bought but not used educationally

- **BCG — "Boosting Education Technology in Africa"** (June 2025, summarised in `edtech_africa_report.md`)
  - EdTech fails in Africa not because demand is weak, but because operating conditions are hard
  - Mobile-first, low-bandwidth, offline-capable, locally adapted = the winning profile
  - Most EdTech is overconcentrated in basic e-learning — not deep personalisation, not workforce readiness
  - Teacher shortages + low qualifications = technology alone cannot fix systemic problems
  - Infrastructure is *uneven*, not absent — one connected school next to one that isn't
  - Payment and monetisation are harder than assumed — strong user need, fragile business model
  - **Key implication for KwaXolo:** designing below the current market floor (pre-literacy, isiZulu-first) is genuinely underserved whitespace, not just a constraint

- **uLesson Classboard** ([link](https://ulesson.com/classboard)) — classroom experience platform for African schools.
  - ⚠️ Appears designed for adults or higher educational levels
  - ⚠️ English-first — not built for non-English speakers or very low literacy levels
  - **Gap it highlights:** most existing African edtech still assumes a baseline of English and functional literacy that KwaXolo's Phase 1 students do not have. This is a space we need to design *below* the current market floor.

- **M-Lugha** — Kenyan edtech specifically built to help children learn in their native language. More targeted at the language-first problem than M-Shule. Worth deeper investigation.

- **UNESCO IICBA — "Empowering Education: Transformative Role of Technology in Africa"** ([link](https://www.iicba.unesco.org/en/empowering-education-transformative-role-technology-africa))
  - 97.5 million African children (primary–secondary age) not in school
  - 86% learning poverty rate in sub-Saharan Africa (can't read simple text by age 10)
  - Africa had 570 million internet users in 2022 — more than double 2015
  - Mobile devices are the primary driver of digital education access
  - Urban-rural divide is the core infrastructure gap
  - Teachers need explicit training to use technology effectively — adoption is not automatic
  - Digital literacy framed as: accessing resources, coding, data, digital communication — workforce-relevant skills

---

## Questions to KwaXolo for Clarification

> Things we need answered before we can close certain design decisions.

- What is the actual baseline of teacher readiness across the 9 schools — digital skill level, motivation, capacity to adopt new tools?
- What is the actual isiZulu literacy level among students — can they read isiZulu text, or is literacy the deeper problem before language?
- Is there any existing digital infrastructure at the schools (LAN, local server, UPS/battery backup)?
- Who owns the PCs — KwaXolo, the schools, or government? This affects what software can be installed.
- Has KwaXolo attempted any digital literacy intervention before, and what happened?
- Are teachers paid by the school or government — and do they have any incentive structure tied to student outcomes?

---

## Sparring Rules

- Claude pressure-tests thinking — does not hand out solutions
- Keep options open and ideas warm — don't close off prematurely
- Agreements only land here once both sides have stress-tested them

---

## Session Log

### Session 1 — 2026-04-20

- Discussed engagement strategy and English acquisition
- Agreed: English embedded in UI > explicit English curriculum
- Agreed: real tasks > gamification for initial engagement
- Agreed: capital should prioritize infrastructure and teachers over UX polish
- Open: long-term engagement, teacher training model, phased language approach

### Session 2 — 2026-04-20

- Introduced mobile learning as a component — researched M-Shule and Eneza Education
- Key distinction surfaced: mobile *ownership* (89%) vs smartphone ownership (24%) vs SMS reach (near-universal)
- Introduced local LLM, offline learning portal, and pre-scripted branching dialogue as ideas to keep warm
- BCG + UNESCO research confirmed: KwaXolo is designing below the existing market floor — genuine whitespace
- Eneza Education identified as a cautionary model: scaled to 6M users but stayed English-only — shallow reach
- M-Shule identified as closer reference: 7 languages, SMS-based, strong outcomes
- Deep unresolved tension flagged: 86% learning poverty means text-based interfaces may hit a literacy wall before a language wall
- Added M-Lugha as a reference to investigate for native-language-first approach

### Session 3 — 2026-04-22

**Major infrastructure update received from KwaXolo:**
- Near-universal phone access among students (not 24%)
- WiFi and stable power available at schools
- 1 PC per teacher only — no student PC access
- Offline-first constraint removed entirely

**Strategic pivot: Phase 1 → Phase 6**
- Focus shifts from basic PC literacy to entrepreneurship
- Target: all students, universal — not just a self-selecting motivated subset
- Content must be context-specific micro-business for rural KwaZulu-Natal, zero capital assumed

**Platform architecture settled:**
- Teacher (PC): simple form → LLM generates lesson plan + student task
- Student (mobile): guided one-step-at-a-time tasks, no LLM interaction
- LLM is invisible infrastructure — powered by Claude API with KwaZulu-Natal system prompt
- Teacher uses chalk/blackboard only — lesson plan output must be blackboard-friendly
- Two LLM outputs per lesson: (1) blackboard script for teacher, (2) mobile task for student

**Economic opportunity framing resolved:**
- Chain A + Chain B both valid
- Chain B more immediate: platform directly enables micro-business creation in local context
- Chain A: longer-term pathway through skill progression

**MVP scope locked:**
- 3 lessons: identify local opportunity → who is your customer → one-sentence business description
- Real Claude API with pre-crafted KwaZulu-Natal system prompt (not hardcoded demo content)
- Teacher-view and student-view split between group members
- Build order: Supabase → Teacher View → Student View → end-to-end test

**Language decision (revised by platform spec):**
- Full bilingual: EN + isiZulu toggle on every screen (not just hoverable)
- LLM generates both languages simultaneously
- Teacher QAs isiZulu translation

**20-topic lesson library defined** — see KwaXolo_Impact_Case.md for full list

### Session 3 — Platform Spec Update (2026-04-22)

**Read KwaXolo_Platform_System_Prompt.md — significant corrections and additions:**

- **Platform name:** KwaXolo Learn
- **Student device corrected:** shared PCs (4–6 per machine), NOT mobile-first — earlier update was partially wrong
- **Connectivity corrected:** only 2 of 9 schools have internet; 7 are offline — earlier "WiFi everywhere" was incomplete
- **Architecture:** online generation (Msenti Hub / 2 schools) → offline consumption (all 9 via USB/sync)
- **Three roles:** Teacher, Student, Admin (Victor Jaca + Thubelihle Sikobi)
- **Module templates:** 6 categories × 5 templates + custom (25 total structured templates)
- **Module structure:** Learning Objectives → Key Concepts → Local Example → Exercise → Quiz → Take-Home Challenge → Local Resources
- **Pedagogical evidence:** Educate! Build–Practice–Present model, 105% income increase RCT
- **Local context locked in:** Msenti Hub, SEDA, specific community leaders, existing ventures, MTN Mobile Money
- **Pitch date:** April 29
- **5-phase roadmap:** MVP → Pilot (2 schools) → Expand (9 schools) → Connect (ventures + jobs) → Scale (open-source)

### Session 4 — 2026-04-23

**Built and tested the agent prototype. Key decisions locked in:**

**Agent guide created (`agent-guide/`):**
- Comprehensive 24-file spec covering system prompt, teacher material structure, student task structure, 25 content templates (A–F), language rules, design system, HTML/PDF output formats, and quality checklist
- Two-output model confirmed: teacher lesson plan (blackboard script, PDF/HTML) + student interactive task (HTML, phone/PC)
- Agent targets 80% finished; teacher applies final 20% (isiZulu QA, local context, class edit)

**Working prototype built (`test-site/`):**
- Local Express server + single HTML file
- Run: `npm start` → http://localhost:3000
- Free-form teacher topic input — teacher types anything, not just presets

**3-phase pipeline settled:**
1. **Gemini 2.0 Flash** (Google Search grounding) searches the real app UI — gets actual button labels, screen names, exact flow
2. **GPT-4o** (JSON mode) generates structured lesson with `screenType` per step
3. **GPT-4o-mini** validation pass checks that step 1 screenType matches the topic (e.g. "create Gmail account" → must start at `play_store_app`, not `gmail_inbox`)

**Visual accuracy as a non-negotiable:**
- Visuals must match instructions exactly. A lesson about creating a Gmail account must show the Play Store and Gmail signup screens, not the inbox.
- Implemented per-step screen rendering: the phone screen rebuilds on every step based on `screenType`
- 20 distinct screen builders: `play_store_app`, `gmail_signup_name`, `gmail_signup_user`, `gmail_signup_pass`, `gmail_inbox`, `gmail_compose`, `whatsapp_welcome`, `whatsapp_phone`, `whatsapp_verify`, `whatsapp_setup_name`, `whatsapp_chat_list`, `whatsapp_chat`, `whatsapp_business`, `facebook_feed`, `facebook_create_post`, `facebook_marketplace`, `fb_listing_form`, `sheets_blank`, `sheets_data`, `generic`

**Arrow guidance system:**
- Pulsing orange callout arrows positioned over the exact UI element described in each step
- Arrow placement uses `data-label` matching — finds elements by their visible text label
- Arrows float and bounce to draw attention

**Student view design principle confirmed:**
- Course material should look like the real app being taught — Gmail steps look like Gmail, WhatsApp steps look like WhatsApp
- Students should feel they are practicing inside the actual tool, not reading about it
- Each step is one screen, one action, one arrow — no multi-step overwhelm

**API keys in use:**
- `GEMINI_API_KEY` — free tier, Google AI Studio
- `OPENAI_API_KEY` — paid, ~$0.04/lesson generation + $0.002/validation

---

## How This Works

- **Agreements** = positions we've both stress-tested and accepted. Once here, we don't re-litigate.
- **Open Questions** = live debates, unresolved tensions, or assumptions that need more scrutiny.
- **Session Log** = what we argued about each session and how it moved.
