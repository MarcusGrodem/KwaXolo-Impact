# How to Build the KwaXolo Content Agent

A practical implementation guide adapted from the [LangChain agent-building framework](https://www.langchain.com/blog/how-to-build-an-agent), applied to the KwaXolo Learn content generation agent.

**Current tech stack (as of 2026-04-23):**
- **Generation:** OpenAI GPT-4o (`gpt-4o`) — JSON structured output, 7–8 steps per lesson
- **Web search:** Google Gemini 2.0 Flash — Google Search grounding to understand real app UI before generating
- **Validation:** OpenAI GPT-4o-mini — checks that visual `screenType` per step matches the instruction text
- **Working prototype:** `test-site/` — local Express server, run with `npm start`

**3-phase pipeline:**
1. Gemini searches the real app's UI (button labels, screen names)
2. GPT-4o generates structured JSON lesson with `screenType` per step
3. GPT-4o-mini validates that step 1 screenType matches the task (e.g. "create Gmail account" must start at `play_store_app`, not `gmail_inbox`)

---

## Table of Contents

1. [What the agent does](#1-what-the-agent-does)
2. [The 6-step framework](#2-the-6-step-framework)
3. [Step 1 — Define the job with examples](#3-step-1--define-the-job-with-examples)
4. [Step 2 — Design the operating procedure (system prompt)](#4-step-2--design-the-operating-procedure)
5. [Step 3 — Build the MVP prompt](#5-step-3--build-the-mvp-prompt)
6. [Step 4 — Connect and orchestrate](#6-step-4--connect-and-orchestrate)
7. [Step 5 — Test and iterate](#7-step-5--test-and-iterate)
8. [Step 6 — Deploy, scale, and refine](#8-step-6--deploy-scale-and-refine)
9. [Weekly web scraping — local business news](#9-weekly-web-scraping--local-business-news)
10. [Student view — per-step screen rendering](#10-student-view--per-step-screen-rendering)
11. [Screen types reference](#11-screen-types-reference)
12. [Free tier limits and cost control](#12-free-tier-limits-and-cost-control)
13. [Error handling](#13-error-handling)
14. [Quick-start checklist](#14-quick-start-checklist)

---

## 1. What the agent does

The KwaXolo content agent is a **single-purpose curriculum assistant**. It takes a teacher's form input and produces two structured outputs per lesson:

1. **Teacher Lesson Plan** — a blackboard-ready document for chalk-only classroom delivery
2. **Student Task** — an interactive HTML module for phone or PC

The agent is invisible to students. It runs when a teacher clicks "Generate Lesson". The LLM bridges the gap between a teacher's plain-language input and structured, pedagogically sound content.

**Core principle from LangChain:** *"Pick something you could teach a smart intern."*
That is this agent — a well-briefed curriculum intern who knows rural KwaZulu-Natal, writes at Grade 8 English level, and never uses jargon.

**Why Gemini 2.1 Flash:**
- Free on the Google AI free tier (1,500 requests/day, 15 RPM)
- Built-in Google Search grounding — perfect for the weekly local news scraping
- Fast response times suitable for teacher-facing generation
- No billing setup needed for MVP and demo

---

## 2. The 6-step framework

| Step | LangChain name | KwaXolo equivalent |
|---|---|---|
| 1 | Define the job with examples | Define what a good lesson looks like — 5 worked examples |
| 2 | Design the SOP | Write the system prompt and two-output structure |
| 3 | Build MVP prompt | One API call → two outputs. Test hand-fed data first |
| 4 | Connect and orchestrate | Wire form → API → Supabase → rendered HTML/PDF |
| 5 | Test and iterate | Team review → teacher review → quality metrics |
| 6 | Deploy, scale, refine | Ship Category D only. Expand based on feedback |

---

## 3. Step 1 — Define the job with examples

### Scope check: agent or traditional software?

The LangChain guide warns against using agents when traditional software would work. For KwaXolo, the case for an LLM is clear:

- Output must vary by topic, class context, and local grounding — not templatable with fixed text
- Quality requires judgment: what counts as a good local example? Is this sentence too complex?
- The teacher is not a curriculum writer — bridging plain input to structured content is what LLMs do

### The 5 reference examples (ground truth)

Every generated lesson should reach this quality bar:

- `02-teacher-material/example-lesson-plan.md` — teacher output (D1: Email)
- `03-student-material/example-student-task.md` — student output (D1: Email)

Generate 3 more before production. Recommended topics:
- A5 (Finding first 10 customers) — tests "write and reflect" student task pattern
- C1 (WhatsApp Business profile) — tests step-by-step digital instructions
- B3 (Profit, revenue, cost) — tests explaining abstract concepts in plain language

### LangChain's three pitfalls, applied to KwaXolo

| Pitfall | KwaXolo equivalent | How to avoid |
|---|---|---|
| Too vague | "Generate educational content" | Specify: 7-section lesson plan + 5-section student task, exact format |
| Agent where software suffices | Static template with fixed text | The agent exercises judgment on tone, local examples, and language level |
| Expecting capabilities that don't exist | Expecting the LLM to know current local prices | Inject static local context via system prompt; do not rely on live knowledge |

---

## 4. Step 2 — Design the operating procedure

The SOP is the system prompt. It encodes how a human curriculum writer would approach this task.

**Full system prompt:** `01-system-prompt/system-prompt.md`

### How the SOP maps to human process

A human writing a lesson for a KwaZulu-Natal teacher would:
1. Think about who the students are (age, language, device, capital, motivation)
2. Think about the teacher's constraints (chalk only, not an expert, limited time)
3. Choose a real, specific local example — not a generic one
4. Write the explanation in plain language, short sentences
5. Design a task where the student does something, not just reads
6. Check no jargon slipped in

Every section of the system prompt maps to one of these steps.

### The two-output structure

The SOP produces two clearly labelled outputs per call. The labels are parsed programmatically — do not change them.

```
--- OUTPUT 1: TEACHER LESSON PLAN ---
LESSON TITLE / LEARNING OBJECTIVE / WRITE ON THE BOARD /
EXPLAIN TO STUDENTS / DISCUSSION QUESTIONS / LOCAL EXAMPLE / TIME GUIDE

--- OUTPUT 2: STUDENT TASK ---
TASK TITLE / WHAT YOU WILL DO / STEPS / THINK ABOUT THIS / TIME
```

---

## 5. Step 3 — Build the MVP prompt

### Architecture: single-shot for MVP

For MVP, the agent is a **single API call** — not a reasoning loop.

- Free: one call per lesson on the free tier
- Fast: no intermediate steps to wait for
- Easy to debug: one input → one output

### Installation

```bash
npm install @google/generative-ai
```

Get a free API key at [aistudio.google.com](https://aistudio.google.com) — no billing required.

### The API call (TypeScript)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateLesson(
  formInputs: {
    topic: string;
    struggles?: string;
    time: string;
    context?: string;
  },
  localNewsContext: string
): Promise<string> {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.1-flash",
    systemInstruction: SYSTEM_PROMPT + "\n\n" + localNewsContext
    // SYSTEM_PROMPT: full text from 01-system-prompt/system-prompt.md
    // localNewsContext: weekly-scraped KZN news (see Section 9)
  });

  const result = await model.generateContent(buildUserMessage(formInputs));
  return result.response.text();
}
```

### User message builder

```typescript
function buildUserMessage(inputs: {
  topic: string;
  struggles?: string;
  time: string;
  context?: string;
}): string {
  return `Topic: ${inputs.topic}
Student struggles or questions: ${inputs.struggles || "None provided"}
Available time: ${inputs.time}
Class context: ${inputs.context || "None provided"}

Please generate the lesson plan and student task for this topic, formatted exactly as instructed. Make all examples relevant to rural KwaZulu-Natal. Assume students have zero startup capital.`;
}
```

### Response parser

```typescript
function parseResponse(rawText: string): {
  teacherPlan: string;
  studentTask: string;
} {
  const teacherMarker = "--- OUTPUT 1: TEACHER LESSON PLAN ---";
  const studentMarker = "--- OUTPUT 2: STUDENT TASK ---";

  const teacherStart = rawText.indexOf(teacherMarker) + teacherMarker.length;
  const studentStart = rawText.indexOf(studentMarker);
  const studentContentStart = studentStart + studentMarker.length;

  if (teacherStart < teacherMarker.length || studentStart === -1) {
    throw new Error("Agent response missing expected output markers — regenerate");
  }

  return {
    teacherPlan: rawText.slice(teacherStart, studentStart).trim(),
    studentTask: rawText.slice(studentContentStart).trim()
  };
}
```

### Test before you wire

LangChain is explicit: **test with hand-fed data before connecting real APIs or UI.**

1. Open [Google AI Studio](https://aistudio.google.com) — free, no signup beyond a Google account
2. Create a new prompt, paste the system prompt from `01-system-prompt/system-prompt.md`
3. Type a user message for topic D1 (Email)
4. Compare output to `02-teacher-material/example-lesson-plan.md`
5. Adjust system prompt until output matches reference quality
6. Only then wire it to the form

---

## 6. Step 4 — Connect and orchestrate

### Data flow

```
Teacher form (4 inputs)
        ↓
buildUserMessage() — structures inputs into prompt
        ↓
Gemini 2.1 Flash (system prompt + weekly news context + user message)
        ↓
Raw text response (with OUTPUT 1 and OUTPUT 2 markers)
        ↓
parseResponse() — splits into { teacherPlan, studentTask }
        ↓
hasLocalGrounding() — quality validation check
        ↓
    ┌──────────────────┬───────────────────────┐
    ↓                  ↓                       ↓
Supabase          Teacher HTML render     Student HTML render
(lessons table)   (teacher dashboard)    (pushed to students)
```

### Supabase schema

```sql
teachers (
  id uuid primary key,
  email text,
  name text,
  school_name text,
  created_at timestamptz default now()
)

students (
  id uuid primary key,
  student_code text unique,
  name text,
  teacher_id uuid references teachers(id),
  created_at timestamptz default now()
)

lessons (
  id uuid primary key,
  teacher_id uuid references teachers(id),
  topic text,
  teacher_inputs jsonb,         -- { topic, struggles, time, context }
  lesson_plan_text text,        -- Parsed OUTPUT 1
  student_task_text text,       -- Parsed OUTPUT 2
  status text default 'draft',  -- draft | published
  created_at timestamptz default now()
)

student_lessons (
  id uuid primary key,
  lesson_id uuid references lessons(id),
  student_id uuid references students(id),
  pushed_at timestamptz,
  completed_at timestamptz,
  reflection_answer text
)

agent_logs (
  id uuid primary key,
  lesson_id uuid references lessons(id),
  teacher_id uuid references teachers(id),
  model text,
  latency_ms int,
  local_grounding_pass boolean,
  created_at timestamptz default now()
)

agent_context (
  key text primary key,         -- e.g. 'local_news'
  value text,
  updated_at timestamptz default now()
)
```

### Local grounding validation

```typescript
const KNOWN_ENTITIES = [
  "Msenti", "SEDA", "1LT Bakery", "Inkify",
  "Hlobisile Pearl Studios", "Victor Jaca", "Dolly Dlezi",
  "Caleb Phehlukwayo", "Chief Inkosi Xolo",
  "MTN Mobile Money", "MTN MoMo", "Capitec",
  "Port Shepstone", "KwaZulu-Natal"
];

function hasLocalGrounding(text: string): boolean {
  const lower = text.toLowerCase();
  return KNOWN_ENTITIES.some(name => lower.includes(name.toLowerCase()));
}
```

If `hasLocalGrounding` returns `false`, show a yellow warning in the teacher editor:
> *"The local example may not be specific to your community. Consider editing before publishing."*

---

## 7. Step 5 — Test and iterate

### Quality metrics

| Metric | What to check | Pass signal |
|---|---|---|
| Local grounding | Names a real KZN entity | `hasLocalGrounding()` returns true |
| Language level | No banned jargon; sentences under 20 words | Zero hits from banned word list |
| Task interactivity | Every student step starts with an action verb | No step starts with "Read" or "Think" or "Consider" |
| Output structure | Both outputs present with correct headers | `parseResponse()` succeeds without error |
| Time fit | Time guide matches teacher's selected duration | Explanation word count ÷ 130 ≤ selected minutes |

### Automated quality check

```typescript
const BANNED_WORDS = [
  "value proposition", "ROI", "B2B", "B2C", "pivot", "scalable",
  "synergy", "leverage", "onboarding", "stakeholder", "KPI",
  "demographics", "monetise", "monetize"
];

function qualityCheck(teacherPlan: string, studentTask: string): {
  pass: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const combined = (teacherPlan + " " + studentTask).toLowerCase();

  BANNED_WORDS.forEach(word => {
    if (combined.includes(word.toLowerCase())) {
      warnings.push(`Banned word found: "${word}"`);
    }
  });

  if (!hasLocalGrounding(teacherPlan)) {
    warnings.push("Teacher plan lacks specific KZN local example");
  }

  const stepLines = studentTask.split("\n").filter(l => /^step \d/i.test(l));
  const badSteps = stepLines.filter(l =>
    /^step \d.*?: (read|think|consider|learn|understand)/i.test(l)
  );
  if (badSteps.length > 0) {
    warnings.push(`Non-interactive student steps found: ${badSteps.length}`);
  }

  return { pass: warnings.length === 0, warnings };
}
```

### Agent call logging

```typescript
await supabase.from("agent_logs").insert({
  lesson_id: lesson.id,
  teacher_id: teacher.id,
  model: "gemini-2.1-flash",
  latency_ms: endTime - startTime,
  local_grounding_pass: hasLocalGrounding(parsedOutput.teacherPlan),
  created_at: new Date().toISOString()
});
```

---

## 8. Step 6 — Deploy, scale, and refine

### Launch incrementally

LangChain: *"Treat deployment as the start of iteration, not the end of development."*

- **Week 1:** Ship Category D only (Practical Digital Skills). Most testable — verify step-by-step instructions yourself on a phone. Get 3 teachers to use it.
- **Week 2–3:** Open Category A and C based on teacher feedback.
- **Month 2:** Open all categories. If the free tier rate limit becomes an issue, upgrade to the paid Gemini API.

### Teacher feedback signal

After publishing, show a one-question rating:
> *"Was this lesson useful? 👍 / 👎"*

Store against the lesson. Patterns in low-rated lessons point to system prompt improvements.

### System prompt iteration

Log the diff between generated content and published content. After 20 lessons, review:
- Teachers always change the local example → add more specific KZN context to system prompt
- Teachers always simplify the explanation → tighten the "Grade 8 English" instruction
- Teachers always add more steps → adjust step count target upward

---

## 9. Weekly web scraping — local business news

The agent generates more relevant content when it knows what is happening locally. A weekly scraping job fetches KZN business news and injects it into the system instruction alongside the static system prompt.

**Key advantage of Gemini here:** Google Search grounding is a built-in tool on Gemini models. No external scraping infrastructure needed — Gemini searches Google directly and returns grounded results.

### What to fetch

| Topic | Search query |
|---|---|
| KZN small business news | `"small business" "KwaZulu-Natal" site:iol.co.za OR site:timeslive.co.za` |
| Port Shepstone / Ugu district | `"Port Shepstone" OR "Ugu district" business 2026` |
| SEDA updates | `SEDA "Small Enterprise Development Agency" South Africa 2026` |
| Youth entrepreneurship SA | `youth entrepreneurship "South Africa" 2026` |
| MTN MoMo / Capitec | `"MTN Mobile Money" OR "Capitec" "small business" South Africa 2026` |

### The scraping agent (Gemini + Google Search grounding)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const LOCAL_NEWS_PROMPT = `
Search Google for recent news (last 7 days) on these topics:
1. Small business news in KwaZulu-Natal, South Africa
2. Local economy or business news in Port Shepstone or the Ugu district
3. SEDA (Small Enterprise Development Agency) South Africa updates
4. Youth entrepreneurship in South Africa
5. MTN Mobile Money or Capitec Bank news for small business owners

For each topic, find 1–2 relevant stories. For each story, summarise:
- Headline (max 10 words)
- One sentence summary of what happened
- Why this matters to a young entrepreneur in rural KwaZulu-Natal

Format the output under this heading:
"CURRENT LOCAL BUSINESS CONTEXT — week of ${new Date().toDateString()}"

Keep the total under 400 words. Write in plain English at Grade 8 level.
Do not include stories about national politics, crime, or sports.
`;

async function scrapeLocalNews(): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.1-flash",
    tools: [{ googleSearch: {} }]   // Built-in Google Search grounding — free
  });

  const result = await model.generateContent(LOCAL_NEWS_PROMPT);
  return result.response.text();
}
```

### Storing and injecting the scraped context

```typescript
// Run weekly — store result in Supabase
async function updateLocalNewsContext(): Promise<void> {
  const news = await scrapeLocalNews();

  await supabase.from("agent_context").upsert({
    key: "local_news",
    value: news,
    updated_at: new Date().toISOString()
  }, { onConflict: "key" });
}

// Retrieve at lesson generation time
async function getLocalNewsContext(): Promise<string> {
  const { data } = await supabase
    .from("agent_context")
    .select("value, updated_at")
    .eq("key", "local_news")
    .single();

  if (!data) return "";

  const ageDays = (Date.now() - new Date(data.updated_at).getTime()) / 86_400_000;
  if (ageDays > 10) {
    console.warn("Local news context is stale — run updateLocalNewsContext()");
  }

  return data.value;
}
```

### Using the news context in lesson generation

The news is appended to the system instruction. The static system prompt comes first; the weekly news block follows.

```typescript
const localNews = await getLocalNewsContext();

const model = genAI.getGenerativeModel({
  model: "gemini-2.1-flash",
  systemInstruction:
    SYSTEM_PROMPT +
    (localNews ? "\n\n" + localNews : "")
  // If local news context is present and a relevant story exists for this lesson topic,
  // reference it in the LOCAL EXAMPLE section.
});

const result = await model.generateContent(buildUserMessage(formInputs));
const rawText = result.response.text();
```

### Scheduling the scrape

**Supabase Edge Function + cron (recommended):**

```typescript
// supabase/functions/update-local-news/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const news = await scrapeLocalNews();
  await updateSupabaseContext(news);
  return new Response("OK", { status: 200 });
});
```

```sql
-- Schedule in Supabase Dashboard → Edge Functions → Schedules
SELECT cron.schedule(
  'weekly-local-news',
  '0 4 * * 1',   -- Every Monday at 04:00 UTC (06:00 SAST)
  $$SELECT net.http_post(url => 'https://[project].supabase.co/functions/v1/update-local-news')$$
);
```

**Or a simple Node.js cron script:**

```
# crontab -e
0 4 * * 1 cd /path/to/project && node scripts/update-local-news.js
```

---

## 10. Gemini tool use reference

### Built-in tools (no extra setup)

| Tool | How to enable | KwaXolo use case |
|---|---|---|
| Google Search grounding | `tools: [{ googleSearch: {} }]` | Weekly local news scraping |
| Code execution | `tools: [{ codeExecution: {} }]` | Not needed for MVP |

### Custom function calling

For future features (e.g. fetching live SEDA registration steps, checking local weather for agricultural modules):

```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-2.1-flash",
  tools: [{
    functionDeclarations: [{
      name: "get_local_price",
      description: "Get the current price of a common item in Port Shepstone market",
      parameters: {
        type: "object",
        properties: {
          item: {
            type: "string",
            description: "The item to look up, e.g. 'bread', 'airtime', 'tomatoes'"
          }
        },
        required: ["item"]
      }
    }]
  }]
});
```

The model will request the function when it needs it; your code executes the function and returns the result.

---

## 11. Free tier limits and cost control

### Gemini 2.1 Flash free tier (as of April 2026)

| Limit | Value | Impact for KwaXolo |
|---|---|---|
| Requests per minute | 15 RPM | Fine — teachers generate lessons one at a time |
| Requests per day | 1,500 RPD | Supports up to 1,500 lesson generations per day |
| Tokens per minute | 1,000,000 TPM | Well within limits for this use case |
| Cost | Free | No billing setup needed for MVP |

At 10 teachers each generating 5 lessons/day = 50 requests/day — far below the 1,500 RPD limit.

### When to upgrade

If teacher usage exceeds 1,500 lessons/day, move to the paid Gemini API. At that point the product is working and paying for itself. Gemini 2.1 Flash paid pricing is very low — far cheaper than GPT-4 class models.

### Rate limit handling

The free tier is 15 RPM. If two teachers generate simultaneously, queue requests rather than firing in parallel:

```typescript
// Simple request queue for free tier
const requestQueue: Array<() => Promise<any>> = [];
let activeRequests = 0;
const MAX_CONCURRENT = 3;  // Stay safely under 15 RPM

async function queuedGenerate(fn: () => Promise<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try { resolve(await fn()); }
      catch (e) { reject(e); }
      finally { activeRequests--; processQueue(); }
    });
    processQueue();
  });
}

function processQueue() {
  while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
    activeRequests++;
    requestQueue.shift()!();
  }
}
```

---

## 12. Error handling

### Common Gemini API errors

| Error | Cause | What to do |
|---|---|---|
| 429 RESOURCE_EXHAUSTED | Rate limit hit | Retry with exponential backoff |
| 400 INVALID_ARGUMENT | Bad request or blocked content | Log and show teacher a polite message |
| 500 INTERNAL | Google server error | Retry up to 3 times |
| Empty response text | Safety filter blocked output | Regenerate with softer framing |

### Retry with exponential backoff

```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable =
        err.status === 429 ||   // Rate limit
        err.status >= 500;      // Server error

      if (!isRetryable || attempt === maxRetries - 1) throw err;

      const delay = baseDelay * Math.pow(2, attempt) * (0.9 + Math.random() * 0.2);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries reached");
}

// Usage
const rawText = await callWithRetry(() => generateLesson(formInputs, localNews));
```

### Empty response guard

```typescript
const rawText = result.response.text();

if (!rawText || rawText.trim().length < 100) {
  throw new Error("Gemini returned an empty or very short response — retry or rephrase");
}
```

Show the teacher: *"The lesson could not be generated. Please try again, or add more detail in the 'class context' field."*

---

## 10. Student view — per-step screen rendering

The single most important architectural decision in the student view: **the screen rebuilds on every step**, not just the highlighted element.

Each step in the LLM output contains a `screenType` field. When the student taps "Done — Next Step", the entire phone screen is replaced with the HTML for that `screenType`. This is what makes the visual match the instruction.

```javascript
function nextStep(idx) {
  renderScreen(idx + 1); // rebuilds entire screen from screenType
}

function renderScreen(idx) {
  const step = DATA.steps[idx];
  const type = step.screenType;          // e.g. "play_store_app"
  const html = getScreenHTML(type, step); // returns the full screen HTML
  document.getElementById('shell-body').innerHTML = html;
  updateStepUI(idx);                     // update progress bar + instruction text
  placeArrow(step.targetLabel, step.arrowText, step.arrowPosition); // floating arrow
}
```

### Arrow guidance

An overlay div sits above the phone screen (`pointer-events: none`). At each step:
1. Find the target element by `data-label` attribute matching
2. Calculate position relative to the phone screen container
3. Insert a pulsing orange callout arrow near the element

Every interactive element in every screen builder has `data-label="Exact Button Text"` so arrows can find them regardless of screen type.

### Why this matters for visual accuracy

The old approach (static shell + highlighted element) caused the Gmail inbox to show while steps described creating an account. The new approach forces each step's screen to match its instruction because they share the same `screenType` value.

---

## 11. Screen types reference

The LLM must return one of these exact `screenType` values per step. The frontend has a builder function for each.

| screenType | What it renders |
|---|---|
| `play_store_search` | Play Store home with search bar |
| `play_store_app` | App detail page: icon, Install button, reviews, screenshots |
| `gmail_signup_name` | Google account creation — first/last name fields |
| `gmail_signup_user` | Choose Gmail address with @gmail.com suffix |
| `gmail_signup_pass` | Password + confirm password fields |
| `gmail_inbox` | Gmail inbox with real-looking email rows + Compose FAB |
| `gmail_compose` | Compose window: To, Subject, Body, Send button |
| `whatsapp_welcome` | WhatsApp first-launch: logo + "Agree and Continue" |
| `whatsapp_phone` | Phone number entry with +27 country code |
| `whatsapp_verify` | 6-digit SMS code entry boxes |
| `whatsapp_setup_name` | Enter your name + profile photo circle |
| `whatsapp_chat_list` | Main chat list (home screen) |
| `whatsapp_chat` | Open conversation with message bubbles |
| `whatsapp_business` | WhatsApp Business profile: name, category, hours, photo |
| `facebook_feed` | Facebook news feed with composer and posts |
| `facebook_create_post` | Post composer expanded with photo/text |
| `facebook_marketplace` | Marketplace grid with local listings |
| `fb_listing_form` | Create listing: photo, price, title, location, description |
| `sheets_blank` | Empty Google Sheets spreadsheet |
| `sheets_data` | Spreadsheet with column headers and sample data |
| `generic` | Branded header with app color + key UI elements for unknown apps |

**Visual accuracy rule:** If the task is about creating an account, step 1 must be `play_store_app` or a signup screen — never `gmail_inbox` or `whatsapp_chat_list`.

---

## 12. Free tier limits and cost control

| API | Model | Usage | Cost |
|---|---|---|---|
| Google AI | Gemini 2.0 Flash | Search phase (1 call/lesson) | Free |
| OpenAI | GPT-4o | Generation phase (1 call/lesson) | ~$0.04/lesson |
| OpenAI | GPT-4o-mini | Validation phase (1 call/lesson) | ~$0.002/lesson |
| **Total** | | | **~$0.042/lesson** |

At 50 lessons/day for the demo: ~$2/day. Well within budget for the April 29 pitch.

Gemini 2.0 Flash free tier: 1,500 requests/day, 15 RPM. More than enough for the search phase.

---

## 13. Quick-start checklist

### One-time setup (already done in test-site/)
- [x] `npm install express openai @google/generative-ai dotenv`
- [x] `GEMINI_API_KEY` in `.env` — for search phase
- [x] `OPENAI_API_KEY` in `.env` — for generation + validation
- [x] Working prototype at `test-site/` — run with `npm start`

### Test the prototype
- [ ] `npm start` → open http://localhost:3000
- [ ] Type a custom topic or use a quick-pick
- [ ] Verify step 1 screenType matches the task (create account → Play Store)
- [ ] Check arrows point to the correct element at each step
- [ ] Verify teacher plan language: no jargon, Grade 8 English, KZN examples

### When moving to production (Lovable / full app)
- [ ] Move system prompt from `test-site/server.js` to `01-system-prompt/system-prompt.md` (they should be in sync)
- [ ] Add Supabase schema from Section 6
- [ ] Add `agent_logs` table for cost tracking
- [ ] Implement weekly Gemini news scraping (Section 9)
- [ ] Add teacher 👍/👎 feedback on published lessons
- [ ] Ship Category D first, expand based on feedback

---

## File map

| You want to... | File |
|---|---|
| Run the working prototype | `test-site/` → `npm start` → http://localhost:3000 |
| See the server + API logic | `test-site/server.js` |
| See the interactive student view | `test-site/public/index.html` |
| Get the exact system prompt | `01-system-prompt/system-prompt.md` |
| See a good teacher output | `02-teacher-material/example-lesson-plan.md` |
| See a good student output | `03-student-material/example-student-task.md` |
| See the screen type list | Section 11 of this file |
| Know the quality bar | `08-quality-checklist/review-checklist.md` |
| Understand language rules | `05-language-guide/english-standard.md` |
| See all 25 module templates | `04-content-templates/` |
| Check brand colors | `06-design-system/brand-colors.md` |
