require("dotenv").config();
const express = require("express");
const { OpenAI, AzureOpenAI } = require("openai");
const path    = require("path");
const fs      = require("fs");

// ─── Azure AI Foundry clients ─────────────────────────────────────────────────
// Two deployments: gpt-5.4 for student material (high quality, expensive),
// gpt-5.4-mini for teacher material + cheap validators.
const AZ_ENDPOINT    = process.env.AZURE_OPENAI_ENDPOINT;
const AZ_KEY         = process.env.AZURE_OPENAI_API_KEY;
const AZ_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-04-01-preview";
const DEP_STUDENT    = process.env.AZURE_DEPLOYMENT_STUDENT   || "gpt-5.4";
const DEP_TEACHER    = process.env.AZURE_DEPLOYMENT_TEACHER   || "gpt-5.4-mini";
const DEP_VALIDATOR  = process.env.AZURE_DEPLOYMENT_VALIDATOR || "gpt-5.4-mini";

function azClient(deployment) {
  if (!AZ_ENDPOINT || !AZ_KEY) {
    throw new Error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be set in .env");
  }
  return new AzureOpenAI({
    endpoint:   AZ_ENDPOINT,
    apiKey:     AZ_KEY,
    apiVersion: AZ_API_VERSION,
    deployment
  });
}

// OpenAI client kept ONLY for web_search_preview (Azure has no equivalent at the
// shape we use). Falls back to disabled if no key.
function openaiClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Log directories ──────────────────────────────────────────────────────────
// Raw logs: temporary, high volume, gitignored
const LOGS_DIR = path.join(__dirname, "logs", "raw");
// Good/bad examples: permanent, committed to git, used as future reference
const EXAMPLES_DIR = path.join(__dirname, "../agent-guide/examples");
const GOOD_DIR     = path.join(EXAMPLES_DIR, "good");
const BAD_DIR      = path.join(EXAMPLES_DIR, "bad");
[LOGS_DIR, GOOD_DIR, BAD_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

function writeLog(reqId, data) {
  const file = path.join(LOGS_DIR, `${reqId}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

function slugify(topic) {
  return (topic||"untitled").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function exampleFilename(reqId, topic) {
  return `${new Date().toISOString().slice(0,10)}_${slugify(topic)}_${reqId.slice(-6)}.json`;
}

// ─── Load saved good/bad examples at request time ────────────────────────────
// Called fresh each generation so newly saved examples are always picked up.
// Returns a formatted string ready to inject into the system prompt.
function loadExamples() {
  function readDir(dir, max) {
    try {
      return fs.readdirSync(dir)
        .filter(f => f.endsWith(".json"))
        .sort()           // alphabetical = chronological given the date prefix
        .slice(-max)      // take the most recent N
        .map(f => {
          try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }
          catch { return null; }
        })
        .filter(Boolean);
    } catch { return []; }
  }

  const goods = readDir(GOOD_DIR, 4);
  const bads  = readDir(BAD_DIR,  4);

  if (goods.length === 0 && bads.length === 0) return "";

  const lines = [];

  // ── Good examples ──────────────────────────────────────────────────────────
  if (goods.length > 0) {
    lines.push("═══════════════════════════════════════════");
    lines.push("SAVED GOOD EXAMPLES — outputs that were rated high quality");
    lines.push("Study the patterns: what made the local example specific, how the teach text is written, how exercises are varied.");
    lines.push("Where a ★ POINT TO IMPROVE note is listed, act on it — do better on that specific aspect in your output.");
    lines.push("═══════════════════════════════════════════");
    goods.forEach((ex, i) => {
      const l = ex.lesson || {};
      // Pick one representative step with an exercise
      const sampleStep = (l.steps || []).find(s => s.exerciseType && s.question) || (l.steps||[])[0] || {};
      lines.push(`\nGOOD EXAMPLE ${i + 1} — Topic: "${ex.topic}" (Category ${ex.category || "?"})`);
      if (l.teacherTitle)       lines.push(`  Title: ${l.teacherTitle}`);
      if (l.teacherObjective)   lines.push(`  Objective: ${l.teacherObjective}`);
      if (l.teacherLocalExample) lines.push(`  Local example used: "${l.teacherLocalExample.slice(0, 200)}"`);
      if (l.teacherExplanation) {
        const firstPara = l.teacherExplanation.split(/\n\n/)[0] || "";
        lines.push(`  Explanation opening: "${firstPara.slice(0, 300)}"`);
      }
      if (sampleStep.teach) {
        lines.push(`  Sample step teach: "${sampleStep.teach.slice(0, 200)}"`);
        lines.push(`  Sample exercise type: ${sampleStep.exerciseType}`);
        if (sampleStep.question)        lines.push(`  Sample question: "${sampleStep.question}"`);
        if (sampleStep.feedbackCorrect) lines.push(`  feedbackCorrect: "${sampleStep.feedbackCorrect}"`);
        if (sampleStep.feedbackWrong)   lines.push(`  feedbackWrong: "${sampleStep.feedbackWrong}"`);
      }
      const exerciseTypes = (l.steps||[]).map(s=>s.exerciseType).filter(Boolean);
      if (exerciseTypes.length) lines.push(`  Exercise types used across ${exerciseTypes.length} steps: ${[...new Set(exerciseTypes)].join(", ")}`);
      if (ex.improvementNote) lines.push(`  ★ POINT TO IMPROVE: "${ex.improvementNote}"`);
    });
  }

  // ── Bad examples ───────────────────────────────────────────────────────────
  if (bads.length > 0) {
    lines.push("\n═══════════════════════════════════════════");
    lines.push("SAVED BAD EXAMPLES — outputs that failed quality review");
    lines.push("Read the comments. Do NOT repeat these mistakes.");
    lines.push("═══════════════════════════════════════════");
    bads.forEach((ex, i) => {
      const l = ex.lesson || {};
      lines.push(`\nBAD EXAMPLE ${i + 1} — Topic: "${ex.topic}"`);
      lines.push(`  ⚠ WHAT WAS WRONG: "${ex.comment || "No comment recorded"}"`);
      // Show a problematic step if available
      const badStep = (l.steps||[]).find(s => !s.exerciseType || !s.teach || !s.feedbackWrong);
      if (badStep) {
        lines.push(`  Example of a weak step from this output:`);
        if (badStep.teach)         lines.push(`    teach: "${(badStep.teach||"").slice(0,150)}"`);
        if (!badStep.exerciseType) lines.push(`    → Missing exerciseType`);
        if (!badStep.feedbackWrong || badStep.feedbackWrong === "Try again.") lines.push(`    → feedbackWrong was empty or generic`);
      }
      if (l.teacherLocalExample && !hasLocalGrounding(l.teacherLocalExample)) {
        lines.push(`  → Local example lacked a named KZN reference`);
      }
    });
  }

  const block = lines.join("\n");
  console.log(`  → Loaded ${goods.length} good / ${bads.length} bad examples for prompt`);
  return block;
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Load agent-guide files at startup ───────────────────────────────────────
const GUIDE = path.join(__dirname, "../agent-guide");

const EXAMPLE_LESSON  = fs.readFileSync(path.join(GUIDE, "02-teacher-material/example-lesson-plan.md"),    "utf8");
const EXAMPLE_TASK    = fs.readFileSync(path.join(GUIDE, "03-student-material/example-student-task.md"),   "utf8");
const CONSTRAINTS     = fs.readFileSync(path.join(GUIDE, "00-overview/constraints.md"),                    "utf8");
const NEVER_DO        = fs.readFileSync(path.join(GUIDE, "00-overview/never-do-this.md"),                  "utf8");
const ENGLISH_STD     = fs.readFileSync(path.join(GUIDE, "05-language-guide/english-standard.md"),         "utf8");
const HOVER_RULES     = fs.readFileSync(path.join(GUIDE, "05-language-guide/hover-word-rules.md"),         "utf8");
const EXERCISE_SPEC   = fs.readFileSync(path.join(GUIDE, "03-student-material/exercise-types.md"),         "utf8");
const TASK_STRUCTURE  = fs.readFileSync(path.join(GUIDE, "03-student-material/task-structure.md"),         "utf8");
const LESSON_STRUCT   = fs.readFileSync(path.join(GUIDE, "02-teacher-material/lesson-plan-structure.md"),  "utf8");
const QUALITY_CHECK   = fs.readFileSync(path.join(GUIDE, "08-quality-checklist/review-checklist.md"),      "utf8");
const INTERACTION_PAT = fs.readFileSync(path.join(GUIDE, "03-student-material/interaction-patterns.md"),   "utf8");

// Category templates (A–F)
const CAT = {
  A: fs.readFileSync(path.join(GUIDE, "04-content-templates/category-A-business.md"),  "utf8"),
  B: fs.readFileSync(path.join(GUIDE, "04-content-templates/category-B-money.md"),     "utf8"),
  C: fs.readFileSync(path.join(GUIDE, "04-content-templates/category-C-marketing.md"), "utf8"),
  D: fs.readFileSync(path.join(GUIDE, "04-content-templates/category-D-digital.md"),   "utf8"),
  E: fs.readFileSync(path.join(GUIDE, "04-content-templates/category-E-sector.md"),    "utf8"),
  F: fs.readFileSync(path.join(GUIDE, "04-content-templates/category-F-custom.md"),    "utf8"),
};

console.log("✓ All agent-guide files loaded");

// ─── Category detection ───────────────────────────────────────────────────────
// Maps keywords in the topic to the relevant category template rules
const CATEGORY_KEYWORDS = [
  // Category D — Practical Digital Skills
  { cat: "D", keywords: ["gmail", "email", "google account", "inbox", "compose", "subject line"] },
  { cat: "D", keywords: ["canva", "flyer", "design", "poster", "banner"] },
  { cat: "D", keywords: ["google sheets", "spreadsheet", "excel", "track income", "track expenses", "track stock"] },
  { cat: "D", keywords: ["invoice", "quote", "quotation", "billing", "receipt"] },
  { cat: "D", keywords: ["google maps", "directions", "map", "route", "navigate", "delivery route"] },
  // Category C — Digital Marketing & Sales
  { cat: "C", keywords: ["whatsapp business", "whatsapp business profile", "business profile"] },
  { cat: "C", keywords: ["facebook page", "business page", "fb page"] },
  { cat: "C", keywords: ["product photo", "phone photo", "take a photo", "photograph"] },
  { cat: "C", keywords: ["sales message", "whatsapp message", "selling on whatsapp", "advertise on whatsapp"] },
  { cat: "C", keywords: ["facebook marketplace", "marketplace", "list a product", "sell online", "facebook listing"] },
  // Category B — Money & Budgeting
  { cat: "B", keywords: ["budget", "weekly budget", "plan money", "money plan"] },
  { cat: "B", keywords: ["income and expenses", "track money", "record money", "bookkeeping"] },
  { cat: "B", keywords: ["profit", "revenue", "cost", "money in", "money out", "understanding profit"] },
  { cat: "B", keywords: ["bank account", "capitec", "mtn mobile money", "mtn momo", "fnb ewallet", "open account"] },
  { cat: "B", keywords: ["loan", "micro-loan", "borrow money", "funding", "msenti hub loan"] },
  // Category A — Starting a Business
  { cat: "A", keywords: ["business idea", "find an idea", "community problem", "identify a need"] },
  { cat: "A", keywords: ["register", "seda", "business registration", "formal business"] },
  { cat: "A", keywords: ["business plan", "lean canvas", "planning a business", "simple plan"] },
  { cat: "A", keywords: ["pricing", "set prices", "first price", "how to price", "charge for"] },
  { cat: "A", keywords: ["first customers", "find customers", "10 customers", "who to sell to"] },
  // Category E — Sector-Specific
  { cat: "E", keywords: ["food business", "baking", "catering", "vetkoek", "amagwinya", "sell food"] },
  { cat: "E", keywords: ["photography", "tutoring", "printing business", "hair services", "services business"] },
  { cat: "E", keywords: ["farming", "agri", "vegetable", "garden", "poultry", "crops"] },
  { cat: "E", keywords: ["repairs", "sewing", "construction", "trade", "phone repair"] },
  { cat: "E", keywords: ["crafts", "handmade", "beadwork", "basket", "woodwork", "artisan"] },
];

function detectCategory(topic) {
  const lower = topic.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.cat;
  }
  return "F"; // Default to custom if no match
}

// ─── Local grounding validation (from HOW_TO_BUILD_AGENTS.md) ─────────────────
const KNOWN_KZN_ENTITIES = [
  "msenti", "seda", "1lt bakery", "inkify",
  "hlobisile pearl studios", "victor jaca", "dolly dlezi",
  "caleb phehlukwayo", "chief inkosi xolo", "inkosi xolo",
  "thabo shude", "samke jaca", "ntokozo gwacela",
  "mtn mobile money", "mtn momo", "capitec",
  "port shepstone", "kwazulu-natal", "kwazulu natal"
];

function hasLocalGrounding(text) {
  const lower = text.toLowerCase();
  return KNOWN_KZN_ENTITIES.some(name => lower.includes(name));
}

// ─── Screen types ─────────────────────────────────────────────────────────────
const SCREEN_TYPES = `
VALID screenType VALUES (use EXACTLY one per step):
  play_store_search    → Play Store home with search bar
  play_store_app       → App detail page: name, icon, Install/Open button, reviews
  gmail_signup_name    → Google account creation: enter first name, last name
  gmail_signup_user    → Choose Gmail address
  gmail_signup_pass    → Create a strong password
  gmail_inbox          → Gmail inbox listing received emails
  gmail_compose        → Compose window: To, Subject, Body fields visible
  whatsapp_welcome     → WhatsApp first-launch: logo + "Agree and Continue"
  whatsapp_phone       → Enter phone number screen
  whatsapp_verify      → 6-digit SMS code entry screen
  whatsapp_setup_name  → Enter your name screen
  whatsapp_chat_list   → Main WhatsApp chat list (home)
  whatsapp_chat        → Open conversation with messages
  whatsapp_business    → WhatsApp Business: profile setup
  facebook_feed        → Facebook news feed
  facebook_create_post → Post composer with photo/text options
  facebook_marketplace → Marketplace browse screen with listings grid
  fb_listing_form      → Create listing form: photo, price, title, location
  sheets_blank         → New empty Google Sheets spreadsheet
  sheets_data          → Spreadsheet with column headers and data rows
  generic              → Any app not listed — branded header + key UI elements

VISUAL ACCURACY RULES:
- Installing an app → step 1 MUST be play_store_app or play_store_search
- Creating account → early steps MUST use signup screens, NOT the app home
- Steps must follow the EXACT ORDER a first-time user experiences them`;

// ─── Phase 1: web search targeted at the exact topic ─────────────────────────
// Stays on OpenAI — Azure Foundry has no drop-in web_search_preview equivalent.
async function searchUIContext(topic) {
  const client = openaiClient();
  if (!client) return "";
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: `Find a detailed step-by-step tutorial for: "${topic}" on an Android smartphone.

I need the following for a student who has NEVER done this before:
1. The EXACT name of every screen the user sees, in the order they appear
2. The EXACT label of every button they need to tap
3. Every form field they fill in, and what kind of information goes there
4. Any verification or confirmation steps (SMS codes, agree/accept screens, etc.)
5. What the final success screen looks like and how the student knows they are done
6. The 3 most common mistakes beginners make and how to avoid them

Be very specific about button labels — use the exact text as it appears in the app.
Under 500 words total.`
    });
    return response.output_text;
  } catch (e) {
    console.warn("Web search failed:", e.message);
    return "";
  }
}

// ─── Phase 2: plan a thorough 8–12 step outline ──────────────────────────────
async function planSteps(topic, uiContext) {
  const client = azClient(DEP_VALIDATOR);

  const response = await client.chat.completions.create({
    model: DEP_VALIDATOR,
    response_format: { type: "json_object" },
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `Create a thorough step plan for teaching a complete beginner: "${topic}"

Student: 13–18 years old, rural KwaZulu-Natal, South Africa. Basic Android phone.
Has NEVER used this app or done this task before. Treat every screen as completely new.

Real app UI from web search:
${uiContext || "Use your knowledge of the real app UI."}

RULES FOR THE STEP PLAN:
- MINIMUM 8 steps. Aim for 10–12 steps. 12 is better than 8 for difficult tasks.
- Start from the ABSOLUTE beginning:
    → If the app needs installing: Step 1 = Open Play Store
    → If the app needs an account: include EVERY signup screen as its own step
- Every screen the user sees = its own step
- Every form that needs filling = its own step (or grouped if on the same screen)
- Every verification step (SMS code, agree button, confirm screen) = its own step
- The FINAL step must show the student COMPLETING the main goal, not just setting up:
    → "Send email" task: last step = tap Send, see sent confirmation
    → "Create listing" task: last step = listing published, visible to others
    → "Set up profile" task: last step = profile saved, visible to others
- Do NOT merge steps to hit a lower number — more steps = more thorough
- Name the specific screen and button in each step description

Return JSON:
{
  "mainObjective": "One sentence — what the student will have DONE by the final step",
  "fullStepOutline": [
    "Step 1: [screen name] — [exact action and button]",
    "Step 2: [screen name] — [exact action and button]",
    ...minimum 8, aim for 10–12...
  ]
}`
    }]
  });

  const plan = JSON.parse(response.choices[0].message.content);
  if (plan.fullStepOutline.length < 8) {
    console.warn(`  ⚠ Plan only has ${plan.fullStepOutline.length} steps — will enforce 8 minimum`);
  }
  console.log(`  → Plan: "${plan.mainObjective}" — ${plan.fullStepOutline.length} steps`);
  return plan;
}

// ─── Phase 3: generate the full lesson ───────────────────────────────────────
async function generateLesson(inputs, uiContext, plan) {
  const client      = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const category    = detectCategory(inputs.topic);
  const catRules    = CAT[category] || CAT["F"];
  const examplesBlock = loadExamples(); // fresh read every call

  console.log(`  → Detected category: ${category}`);

  const systemPrompt = `You are an entrepreneurship curriculum assistant for KwaXolo Impact.
Your job is to generate COMPLETE, PRODUCTION-READY lesson content for teachers and students in rural KwaZulu-Natal, South Africa.
Not a summary. Not an outline. A full lesson that can be delivered and completed with zero extra help.

═══════════════════════════════════════════
REFERENCE EXAMPLES — MATCH THIS QUALITY
Study these carefully. Every lesson you generate must reach this standard.
═══════════════════════════════════════════

REFERENCE TEACHER LESSON PLAN:
${EXAMPLE_LESSON}

REFERENCE STUDENT TASK:
${EXAMPLE_TASK}

${examplesBlock ? examplesBlock + "\n" : ""}
═══════════════════════════════════════════
CORE CONSTRAINTS (non-negotiable)
═══════════════════════════════════════════
${CONSTRAINTS}

═══════════════════════════════════════════
LANGUAGE RULES
═══════════════════════════════════════════
${ENGLISH_STD}

═══════════════════════════════════════════
ISIZULU HOVER WORD RULES
═══════════════════════════════════════════
${HOVER_RULES}

═══════════════════════════════════════════
TEACHER LESSON PLAN STRUCTURE
═══════════════════════════════════════════
${LESSON_STRUCT}

═══════════════════════════════════════════
STUDENT TASK STRUCTURE
═══════════════════════════════════════════
${TASK_STRUCTURE}

═══════════════════════════════════════════
EXERCISE TYPES (Duolingo-style active learning)
═══════════════════════════════════════════
${EXERCISE_SPEC}

═══════════════════════════════════════════
INTERACTION PATTERNS AND FAIL-RECOVERY
═══════════════════════════════════════════
${INTERACTION_PAT}

═══════════════════════════════════════════
CATEGORY-SPECIFIC RULES FOR THIS TOPIC (Category ${category})
These are mandatory rules for this exact topic. Follow every hard rule listed.
═══════════════════════════════════════════
${catRules}

═══════════════════════════════════════════
LOCAL CONTEXT — always use named references
═══════════════════════════════════════════
You MUST reference at least one of these by name in the teacher explanation AND in teacherLocalExample:
- Msenti Entrepreneurship Hub — Victor Jaca (CEO). Business registration, mentorship, IT support.
- SEDA Port Shepstone — free government business registration and compliance guidance
- Dolly Dlezi — accountant at Msenti Hub. Bookkeeping and financial setup for local businesses.
- Caleb Phehlukwayo — former school principal. Community trust figure.
- Chief Inkosi Xolo — traditional Zulu authority. Bridges community and local institutions.
- 1LT Bakery — Thabo Shude. Started from his kitchen, sold bread to neighbours. Zero capital.
- Hlobisile Pearl Studios — Hlobisile. Photography and events. Grew from a phone camera.
- Inkify — Samke Jaca and Ntokozo Gwacela. Print store. Uses WhatsApp and email for customers.
- Capitec — most accessible bank (no minimum balance). Recommended for students.
- MTN Mobile Money / FNB eWallet — mobile payments, no bank account required.
- WhatsApp — the PRIMARY business communication tool. Always encourage it. Never dismiss it.

Generic examples like "a local business owner" or "a young entrepreneur" are REJECTED.
Name a specific person, business, or place from the list above.

═══════════════════════════════════════════
PHONE SCREEN TYPES
═══════════════════════════════════════════
${SCREEN_TYPES}

═══════════════════════════════════════════
WHAT THE AGENT MUST NEVER DO
═══════════════════════════════════════════
${NEVER_DO}

═══════════════════════════════════════════
QUALITY CHECKLIST (run silently before returning)
═══════════════════════════════════════════
${QUALITY_CHECK}

═══════════════════════════════════════════
STEP PLAN TO FOLLOW EXACTLY
Main objective: ${plan.mainObjective}
═══════════════════════════════════════════
Expand EACH of these into a full step object. Do not merge. Do not skip.
${plan.fullStepOutline.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Real app UI from web search (use exact button and screen names from this):
${uiContext || "Use your knowledge of the real app UI."}`;

  const userMsg = `Generate the COMPLETE lesson for: "${inputs.topic}"

What students struggle with: ${inputs.struggles || "none noted"}
Available class time: ${inputs.time}
Class context: ${inputs.context || "none provided"}

You must generate ALL ${plan.fullStepOutline.length} steps listed in the step plan above.
Do not stop early. Do not merge steps. Every step must be fully filled out.

Return ONLY valid JSON in this exact shape:

{
  "teacherTitle": "Plain-language title, max 8 words, no jargon",
  "teacherObjective": "After this lesson, you will be able to... [one concrete, checkable sentence]",
  "teacherBoardPoints": [
    "Point 1 — max 6 words",
    "Point 2 — max 6 words",
    "Point 3 — max 6 words",
    "Point 4 — max 6 words",
    "Point 5 — max 6 words"
  ],
  "teacherExplanation": "Paragraph 1 — introduce the concept with context (2–4 sentences, Grade 8 language).\\n\\nParagraph 2 — explain how it works with a NAMED KZN reference (3–5 sentences). Name the specific person, place, or venture.\\n\\nParagraph 3 — connect to student life and preview the task they are about to do (2–3 sentences).",
  "teacherDiscussionQuestions": [
    "Open question 1 — connects to student life, cannot be yes/no?",
    "Open question 2 — makes students think about real situations?",
    "Open question 3 — connects to local economy or community?"
  ],
  "teacherLocalExample": "2–3 sentences. Name a specific person, place, or venture from KwaZulu-Natal. Directly relevant to this topic. Concrete and specific — not generic.",
  "teacherTimeGuide": [
    "5 min: write board points, students copy",
    "15 min: teacher explains",
    "10 min: class discussion",
    "10 min: students do task on phones",
    "5 min: recap — what is one thing you learned?"
  ],
  "appName": "Exact app name as it appears in the app store",
  "appColor": "#hex brand colour",
  "appTextColor": "#fff or #1A1A1A",
  "taskTitle": "Task title matching the lesson title",
  "taskIntro": "One active-voice sentence: what the student will HAVE when they finish (not what they will 'do')",
  "taskTime": "10–15 minutes",
  "taskReflection": "Personal reflection question — must connect to the student's real life — cannot be answered yes/no — requires having done the task",
  "steps": [
    {
      "number": 1,
      "screenType": "exact value from screen types list",
      "screenName": "Exact screen name as it appears in the app",
      "teach": "2–3 sentences. What is on this screen. What the student is about to do and why it matters for completing the main goal. Include a fail-recovery hint if the step could go wrong (e.g. 'If you see Open instead of Install, Gmail is already on your phone — skip to step 3.').",
      "exerciseType": "tap_correct | fill_blank | arrange_steps | match_pairs | do_and_confirm",
      "question": "The question the student must answer correctly before advancing.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "acceptedAnswers": [],
      "tiles": [],
      "correctOrder": [],
      "pairs": [],
      "instruction": "",
      "visibleResult": "",
      "feedbackCorrect": "Confirms what they just learned. Names the specific button, screen, or concept. 1 sentence.",
      "feedbackWrong": "Tells them exactly WHERE to look or what to try next. Does not give away the answer. 1 sentence.",
      "tip": "One specific common mistake for this step, or empty string"
    }
  ]
}

FIELD RULES BY EXERCISE TYPE:
- tap_correct:    fill options (3–4 items) + correctAnswer. Others empty.
- fill_blank:     fill acceptedAnswers (array of lowercase strings). Others empty.
- arrange_steps:  fill tiles (shuffled) + correctOrder (correct sequence). Others empty.
- match_pairs:    fill pairs as [{term, match}, ...] (max 4 pairs). Others empty.
- do_and_confirm: fill instruction + visibleResult + options + correctAnswer. Others empty.

Always include feedbackCorrect AND feedbackWrong for EVERY step.
Vary exerciseTypes across steps — never more than 3 tap_correct in a row.
Use do_and_confirm for any step that requires the student to act on their real phone.
Use arrange_steps at least once per task if the topic involves a sequence.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 16000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMsg }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── Validation 1: enforce minimum 8 steps ───────────────────────────────────
async function validateStepCount(lesson, topic, plan) {
  const count = (lesson.steps || []).length;
  if (count >= 8) {
    console.log(`  → Step count OK: ${count} steps`);
    return lesson;
  }

  console.log(`  ⚠ Only ${count} steps — requesting missing steps to reach 8`);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const existing = lesson.steps.map(s =>
    `Step ${s.number}: [${s.screenType}] ${s.screenName} — ${(s.teach || "").slice(0, 100)}`
  ).join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `A lesson about "${topic}" only has ${count} steps. It needs at least 8.
Main objective: ${plan.mainObjective}

Existing steps:
${existing}

Generate the MISSING steps to reach at least 8 total AND complete the main objective.
Continue naturally from the last existing step.
Use the same step schema. Vary the exerciseTypes.

${SCREEN_TYPES}

Return JSON: { "additionalSteps": [ ...step objects with number, screenType, screenName, teach, exerciseType, question, options, correctAnswer, acceptedAnswers, tiles, correctOrder, pairs, instruction, visibleResult, feedbackCorrect, feedbackWrong, tip ] }`
    }]
  });

  const extra = JSON.parse(response.choices[0].message.content);
  if (extra.additionalSteps?.length > 0) {
    const offset = lesson.steps.length;
    lesson.steps = [
      ...lesson.steps,
      ...extra.additionalSteps.map((s, i) => ({ ...s, number: offset + i + 1 }))
    ];
    console.log(`  → Added ${extra.additionalSteps.length} steps — now ${lesson.steps.length} total`);
  }
  return lesson;
}

// ─── Validation 2: local grounding check ─────────────────────────────────────
function validateLocalGrounding(lesson) {
  const combined = [
    lesson.teacherExplanation || "",
    lesson.teacherLocalExample || ""
  ].join(" ");

  if (hasLocalGrounding(combined)) {
    console.log("  → Local grounding check passed");
  } else {
    console.warn("  ⚠ Local grounding check FAILED — no named KZN entity found in teacher content");
  }
  return lesson;
}

// ─── Validation 3: exercise fields complete and varied ───────────────────────
async function validateExercises(lesson) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const summary = lesson.steps.map(s =>
    `Step ${s.number}: type="${s.exerciseType}", question="${(s.question||"").slice(0,60)}", options=${JSON.stringify(s.options||[])}, correctAnswer="${s.correctAnswer||""}", acceptedAnswers=${JSON.stringify(s.acceptedAnswers||[])}, tiles=${(s.tiles||[]).length}, correctOrder=${(s.correctOrder||[]).length}, pairs=${(s.pairs||[]).length}, hasInstruction=${!!s.instruction}, feedbackCorrect="${(s.feedbackCorrect||"").slice(0,40)}", feedbackWrong="${(s.feedbackWrong||"").slice(0,40)}"`
  ).join("\n");

  const prompt = `Check these ${lesson.steps.length} lesson steps for REAL problems only:
${summary}

Flag only genuine issues:
1. exerciseType is missing or not one of the 5 valid types
2. tap_correct has no options or no correctAnswer
3. fill_blank has empty acceptedAnswers array
4. arrange_steps has no tiles or no correctOrder
5. match_pairs has no pairs
6. do_and_confirm has no instruction or no options
7. feedbackCorrect is empty or just says "Correct!" with no content
8. feedbackWrong is empty or just says "Try again" with no hint about WHERE to look
9. All steps have identical exerciseType (should be varied)

Return JSON: { "valid": true } if no real issues.
Return JSON: { "valid": false, "issues": ["Step 2: ..."] } listing real issues only.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }]
  });

  const check = JSON.parse(response.choices[0].message.content);
  if (!check.valid && check.issues) {
    console.warn("  ⚠ Exercise issues:", check.issues.join(" | "));
  } else {
    console.log(`  → Exercise validation passed (${lesson.steps.length} steps)`);
  }
  return lesson;
}

// ─── Validation 4: screen types match steps ──────────────────────────────────
async function validateScreenTypes(lesson, topic) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const preview = lesson.steps.slice(0, 5).map(s =>
    `Step ${s.number}: screenType="${s.screenType}", teach: "${(s.teach||"").slice(0,80)}"`
  ).join("\n");

  const prompt = `Lesson about "${topic}", app: ${lesson.appName}.
First steps:
${preview}

Does each screenType match what would actually be visible at that step?
- Installing app → must be play_store_app or play_store_search
- Creating account → must use signup screens, not app home

${SCREEN_TYPES}

Return JSON: { "correct": true } if all screenTypes are correct.
Return JSON: { "correct": false, "steps": [full corrected steps array — fix screenType only, all other fields identical] } if mismatches exist.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 3500,
    messages: [{ role: "user", content: prompt }]
  });

  const check = JSON.parse(response.choices[0].message.content);
  if (!check.correct && check.steps?.length > 0) {
    console.log("  → Screen type validation corrected mismatches");
    lesson.steps = check.steps;
  } else {
    console.log("  → Screen type validation passed");
  }
  return lesson;
}

// ─── HTML builder for teacher lesson plan ────────────────────────────────────
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildTeacherHTML(lesson, time) {
  const {
    teacherTitle = "Lesson Plan", teacherObjective = "",
    teacherBoardPoints = [], teacherExplanation = "",
    teacherDiscussionQuestions = [], teacherLocalExample = "",
    teacherTimeGuide = []
  } = lesson;

  const boardItems       = teacherBoardPoints.map(p => `<li>${esc(p)}</li>`).join("");
  const explanationParas = teacherExplanation.split(/\n\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
  const questions        = teacherDiscussionQuestions.map((q, i) => `<li><span class="tp-qn">${i+1}</span><span>${esc(q)}</span></li>`).join("");
  const timeItems        = teacherTimeGuide.map(t => {
    const m = t.match(/^([^:]+):\s*(.+)$/);
    return m
      ? `<div class="tp-ti"><span class="tp-td">${esc(m[1])}</span><span class="tp-ta">${esc(m[2])}</span></div>`
      : `<div class="tp-ti"><span class="tp-ta">${esc(t)}</span></div>`;
  }).join("");

  return `<div class="tp">
  <div class="tp-hd">
    <div class="tp-obj-lbl">Learning Objective</div>
    <h1 class="tp-title">${esc(teacherTitle)}</h1>
    <p class="tp-obj">${esc(teacherObjective)}</p>
  </div>
  <div class="tp-board">
    <div class="tp-board-ttl">✏ Write on the Board</div>
    <div class="tp-board-sub">Write these before class starts — students copy them down</div>
    <ul class="tp-bl">${boardItems}</ul>
  </div>
  <div class="tp-sec">
    <h2 class="tp-h2"><span class="tp-num">2</span>Explain to Students</h2>
    <div class="tp-script-note">Read this aloud — then explain in your own words</div>
    <div class="tp-expl">${explanationParas}</div>
  </div>
  <div class="tp-sec">
    <h2 class="tp-h2"><span class="tp-num">3</span>Discussion Questions</h2>
    <ol class="tp-qs">${questions}</ol>
  </div>
  <div class="tp-sec">
    <h2 class="tp-h2"><span class="tp-num">4</span>Local Example</h2>
    <div class="tp-local">${esc(teacherLocalExample)}</div>
  </div>
  <div class="tp-tg">
    <div class="tp-tg-ttl">Time Guide — ${esc(time || "30 minutes")}</div>
    ${timeItems}
  </div>
  <button class="tp-print no-print" onclick="window.print()">Print Lesson Plan</button>
</div>`;
}

// ─── SSE progress ─────────────────────────────────────────────────────────────
const progressClients = {};

app.get("/progress/:id", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
  progressClients[req.params.id] = res;
  req.on("close", () => delete progressClients[req.params.id]);
});

function progress(id, pct, phase) {
  const c = progressClients[id];
  if (c) c.write(`data: ${JSON.stringify({ pct, phase })}\n\n`);
}

// ─── Generate route ───────────────────────────────────────────────────────────
app.post("/generate", async (req, res) => {
  const { topic, struggles, time, context, reqId } = req.body;
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

  try {
    progress(reqId, 5,  `Searching: "${topic}"...`);
    const uiContext = await searchUIContext(topic);

    progress(reqId, 18, "Planning 8–12 steps...");
    const plan = await planSteps(topic, uiContext);

    const category = detectCategory(topic);
    progress(reqId, 32, `Generating (category ${category}, ${plan.fullStepOutline.length} steps)...`);
    let lesson = await generateLesson({ topic, struggles, time, context }, uiContext, plan);

    progress(reqId, 65, "Checking step count...");
    lesson = await validateStepCount(lesson, topic, plan);

    progress(reqId, 74, "Checking local grounding...");
    lesson = validateLocalGrounding(lesson);

    progress(reqId, 82, "Checking exercise fields...");
    lesson = await validateExercises(lesson);

    progress(reqId, 91, "Checking screen types...");
    lesson = await validateScreenTypes(lesson, topic);

    lesson.teacherPlanHTML = buildTeacherHTML(lesson, time);

    const grounded = hasLocalGrounding((lesson.teacherExplanation||"") + (lesson.teacherLocalExample||""));
    console.log(`  ✓ Done — ${lesson.steps.length} steps, category ${category}, local grounding: ${grounded}`);

    // Write full log
    writeLog(reqId, {
      reqId,
      topic,
      category,
      generatedAt: new Date().toISOString(),
      stepCount: lesson.steps.length,
      localGrounding: grounded,
      inputs: { topic, struggles, time, context },
      lesson
    });
    console.log(`  → Log written: logs/raw/${reqId}.json`);

    progress(reqId, 100, "Done!");
    delete progressClients[reqId];
    res.json({ ...lesson, _reqId: reqId });
  } catch (err) {
    console.error(err);
    progress(reqId, 0, "Error: " + err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Save a good example → agent-guide/examples/good/ ────────────────────────
app.post("/save-good/:reqId", (req, res) => {
  const { reqId }   = req.params;
  const { comment } = req.body;   // optional "point to improve" note from teacher
  const src = path.join(LOGS_DIR, `${reqId}.json`);
  if (!fs.existsSync(src)) {
    return res.status(404).json({ error: "Log not found for this session." });
  }

  const data     = JSON.parse(fs.readFileSync(src, "utf8"));
  const filename = exampleFilename(reqId, data.topic);
  const dest     = path.join(GOOD_DIR, filename);

  fs.writeFileSync(dest, JSON.stringify({
    ...data,
    savedAt: new Date().toISOString(),
    rating: "good",
    improvementNote: (comment || "").trim()
  }, null, 2));
  console.log(`  ⭐ Good example saved: agent-guide/examples/good/${filename}  (topic: "${data.topic}")`);
  if (comment) console.log(`     Improvement note: ${(comment).slice(0, 120)}`);
  res.json({ ok: true, file: `agent-guide/examples/good/${filename}` });
});

// ─── Save a bad example → agent-guide/examples/bad/ ──────────────────────────
app.post("/save-bad/:reqId", (req, res) => {
  const { reqId }   = req.params;
  const { comment } = req.body;   // free-text comment from teacher
  const src = path.join(LOGS_DIR, `${reqId}.json`);
  if (!fs.existsSync(src)) {
    return res.status(404).json({ error: "Log not found for this session." });
  }

  const data     = JSON.parse(fs.readFileSync(src, "utf8"));
  const filename = exampleFilename(reqId, data.topic);
  const dest     = path.join(BAD_DIR, filename);

  fs.writeFileSync(dest, JSON.stringify({
    ...data,
    savedAt: new Date().toISOString(),
    rating: "bad",
    comment: (comment || "").trim()
  }, null, 2));
  console.log(`  👎 Bad example saved:  agent-guide/examples/bad/${filename}  (topic: "${data.topic}")`);
  console.log(`     Comment: ${(comment||"").slice(0,120)}`);
  res.json({ ok: true, file: `agent-guide/examples/bad/${filename}` });
});

app.listen(3000, () => console.log("KwaXolo → http://localhost:3000"));
