require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── OpenAI web search: look up real app UI ───────────────────────────────────
async function searchUIContext(topic) {
  if (!process.env.OPENAI_API_KEY) return "";
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: `Search: "${topic}" step by step tutorial on Android smartphone.
Describe the EXACT screen names, button labels, their positions, and what each screen looks like.
Include: what the very first screen looks like, every button the user taps, in order.
Under 300 words. Be precise about button labels.`
    });
    return response.output_text;
  } catch (e) {
    console.warn("Web search failed:", e.message);
    return "";
  }
}

// ─── OpenAI: generate structured lesson ──────────────────────────────────────
const SCREEN_TYPES = `
VALID screenType VALUES — use EXACTLY one per step:
  play_store_search    → Play Store home with search bar
  play_store_app       → App detail page showing name, icon, Install/Open button, reviews
  gmail_signup_name    → Google account creation: enter first name, last name
  gmail_signup_user    → Choose Gmail address (e.g. thandi.nzama@gmail.com)
  gmail_signup_pass    → Create a strong password
  gmail_inbox          → Gmail inbox listing received emails
  gmail_compose        → Compose window open (To, Subject, Body fields visible)
  whatsapp_welcome     → WhatsApp first-launch: logo + "Agree and Continue" button
  whatsapp_phone       → Enter phone number screen
  whatsapp_verify      → 6-digit SMS code entry screen
  whatsapp_setup_name  → Enter your name screen
  whatsapp_chat_list   → Main WhatsApp chat list (home)
  whatsapp_chat        → Open conversation with messages
  whatsapp_business    → WhatsApp Business: profile setup (name, category, hours, photo)
  facebook_feed        → Facebook news feed
  facebook_create_post → Post composer expanded with photo/text options
  facebook_marketplace → Marketplace browse screen with listings grid
  fb_listing_form      → Create listing form: photo, price, title, location fields
  sheets_blank         → New empty Google Sheets spreadsheet
  sheets_data          → Spreadsheet with column headers and some data rows
  generic              → For any app not listed — shows branded header + key UI elements`;

const VISUAL_RULES = `
CRITICAL — VISUAL ACCURACY (the student sees a phone screen that matches your screenType):
1. If the task involves DOWNLOADING or INSTALLING an app → step 1 MUST use screenType "play_store_app"
2. If the task involves CREATING A NEW ACCOUNT → early steps must use signup screens, NOT the main app
3. NEVER show gmail_inbox or whatsapp_chat_list as step 1 for a "create account" task
4. Steps must follow the EXACT ORDER a first-time user experiences them
5. The instruction text for each step must describe what is VISIBLE on that screenType
6. If step instruction says "tap Install" → screenType must be "play_store_app"
7. If step instruction says "enter your name" during signup → screenType must be the signup screen`;

// ─── Phase 2a: plan the full step outline before generating ──────────────────
async function planSteps(topic, uiContext) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `Return a JSON plan for teaching: "${topic}"

The student is a total beginner in rural KwaZulu-Natal, South Africa.

Identify exactly what the student needs to do from start to finish.
Be explicit: if the app needs downloading, include that. If setup is needed, include it.
But ALWAYS continue past setup to show the student completing the actual main task.

App UI context from web search:
${uiContext || "Use your knowledge."}

Return JSON:
{
  "mainObjective": "One sentence: the single concrete action the student performs to finish the task (e.g. 'Student sends a professional email to a contact')",
  "fullStepOutline": [
    "Step 1: short plain-language description",
    "Step 2: ...",
    "...",
    "Final step: [must match mainObjective — e.g. 'Student taps Send and sees email delivered']"
  ]
}

Rules:
- fullStepOutline must start from the very beginning (Play Store if app needs installing)
- fullStepOutline must end at the main objective being DONE — not just set up
- If topic is about sending an email, the last steps must include composing and sending
- If topic is about listing a product, last steps must include publishing the listing
- Include every step a first-time user needs — typically 8-12 steps total`
    }]
  });

  const plan = JSON.parse(response.choices[0].message.content);
  console.log(`  → Plan: "${plan.mainObjective}" — ${plan.fullStepOutline.length} steps`);
  return plan;
}

// ─── Phase 2b: generate full lesson following the plan ────────────────────────
async function generateLesson(inputs, uiContext, plan) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are a curriculum expert for KwaXolo Impact, rural KwaZulu-Natal, South Africa.

STUDENT CONTEXT:
- Age 13-18, isiZulu home language, English instruction, Grade 8 reading level
- Smartphone access, zero startup capital, rural KwaZulu-Natal
- Many have never used these apps before — assume total beginner

LOCAL CONTEXT (use these in examples):
- Msenti Hub (Victor Jaca), SEDA Port Shepstone, Inkify, 1LT Bakery, Hlobisile Pearl Studios
- MTN Mobile Money, Capitec. WhatsApp is the primary business tool.

RULES:
- No jargon. Grade 8 English. Short sentences.
- All examples from rural KwaZulu-Natal.
- Zero capital assumption.

REAL APP UI FROM WEB SEARCH — use exact button names and screen names from here:
${uiContext || "Use your knowledge of the real app UI."}

${SCREEN_TYPES}

${VISUAL_RULES}

YOU MUST FOLLOW THIS EXACT STEP PLAN — do not deviate, do not stop early:
Main objective: ${plan.mainObjective}

Required steps (expand each into full detail):
${plan.fullStepOutline.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Generate one detailed step object for EACH item in the plan above.
Do not merge steps. Do not skip steps. Do not stop before the final step.
The last step must show the student completing: "${plan.mainObjective}"

Return ONLY valid JSON:
{
  "teacherTitle": "Short plain-language lesson title — max 8 words",
  "teacherObjective": "After this lesson, you will be able to... [one concrete sentence matching the main objective]",
  "teacherBoardPoints": ["Point 1 — max 6 words", "Point 2", "Point 3", "Point 4", "Point 5"],
  "teacherExplanation": "Paragraph 1 — introduce the idea (2-4 sentences).\n\nParagraph 2 — explain how it works + embed one real KwaZulu-Natal example (3-5 sentences).\n\nParagraph 3 — connect to student life and transition: After this lesson, you will practise [specific task] on your phone.",
  "teacherDiscussionQuestions": ["Open-ended question 1?", "Open-ended question 2?", "Open-ended question 3?"],
  "teacherLocalExample": "One specific local KwaZulu-Natal example: name a real person, place, or venture. 2-3 sentences. Concrete and specific — not generic.",
  "teacherTimeGuide": ["5 min: write board points, students copy", "15 min: teacher explains", "10 min: discussion questions", "X min: students do task on phones", "5 min: recap — what is one thing you learned?"],
  "appName": "Exact app name",
  "appColor": "#hex brand color",
  "appTextColor": "#fff or #1A1A1A",
  "taskTitle": "Short task title",
  "taskIntro": "${plan.mainObjective}",
  "taskTime": "15-20 minutes",
  "taskReflection": "Open reflection question connecting to student real life",
  "steps": [
    {
      "number": 1,
      "screenType": "exact screenType from list above",
      "screenName": "Exact screen name",
      "instruction": "3+ sentences. What is on screen. Which element to tap/type. What happens after.",
      "targetLabel": "Exact text of button or field as it appears in the app",
      "arrowText": "Short callout e.g. Tap here",
      "arrowPosition": "above",
      "tip": "Common mistake tip or empty string"
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 4000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Return a JSON object for this lesson request. Follow the step plan exactly — all ${plan.fullStepOutline.length} steps.\n\nTopic: ${inputs.topic}\nStudent struggles: ${inputs.struggles || "none"}\nTime: ${inputs.time}\nClass context: ${inputs.context || "none"}` }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

// ─── Validation pass: check + correct step/screen mismatches ─────────────────
async function validateAndCorrect(lesson, topic) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stepsPreview = lesson.steps.slice(0, 3).map(s =>
    `Step ${s.number}: screenType="${s.screenType}", instruction starts: "${s.instruction?.slice(0, 80)}"`
  ).join("\n");

  const prompt = `Return a JSON object. A lesson was generated about: "${topic}"
App: ${lesson.appName}

First 3 steps:
${stepsPreview}

CHECK: Do the screenTypes match what would actually be visible when following the instructions?
- If topic involves creating/installing — step 1 should be "play_store_app" or a signup screen
- If step 1 instruction mentions "Install" or "download" but screenType is "gmail_inbox" → WRONG
- Each screenType must show what the instruction describes

${SCREEN_TYPES}

Return JSON: { "correct": true, "steps": null } if everything is correct.
Return JSON: { "correct": false, "steps": [corrected full steps array — fixed screenTypes only, all other fields identical] } if there are mismatches.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }]
  });

  const check = JSON.parse(response.choices[0].message.content);
  if (!check.correct && check.steps && check.steps.length > 0) {
    console.log("  → Validation corrected step screenTypes");
    lesson.steps = check.steps;
  } else {
    console.log("  → Validation passed");
  }
  return lesson;
}

// ─── Validation pass 2: did the steps actually complete the main objective? ───
async function validateObjectiveCompletion(lesson, topic) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stepsSummary = lesson.steps.map(s =>
    `Step ${s.number} [${s.screenType}]: ${s.instruction?.slice(0, 100) || ''}...`
  ).join("\n");

  const prompt = `Return a JSON object. A student lesson was generated for the topic: "${topic}"

Here are ALL the steps:
${stepsSummary}

QUESTION: Does the student actually COMPLETE the main objective by the end of the last step?
- For "how to send an email" → the student must have SENT an email (gmail_compose step with Send button tapped)
- For "create a WhatsApp Business profile" → the profile must be saved and visible
- For "list on Facebook Marketplace" → the listing must be published live
- For "create a Gmail account" → account must be fully created AND the inbox must be shown

Setup steps (downloading, account creation) count as prerequisites — they are NOT the completion of the objective unless setup IS the objective.

If the last few steps show the student completing the actual main task: return { "complete": true, "missingSteps": [] }

If the steps stop at setup or prerequisites and never complete the main task, return JSON with the missing steps to add:
{
  "complete": false,
  "missingSteps": [
    {
      "number": 9,
      "screenType": "gmail_compose",
      "screenName": "Gmail — Compose",
      "instruction": "Full detailed instruction for what the student does here...",
      "targetLabel": "Exact button or field label",
      "arrowText": "Short arrow text",
      "arrowPosition": "above",
      "tip": ""
    }
  ]
}

${SCREEN_TYPES}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }]
  });

  const check = JSON.parse(response.choices[0].message.content);

  if (!check.complete && check.missingSteps && check.missingSteps.length > 0) {
    console.log(`  → Objective check: adding ${check.missingSteps.length} missing steps to complete the goal`);
    // Renumber and append
    const offset = lesson.steps.length;
    const extra = check.missingSteps.map((s, i) => ({ ...s, number: offset + i + 1 }));
    lesson.steps = [...lesson.steps, ...extra];
  } else {
    console.log("  → Objective check passed: main goal is completed in steps");
  }

  return lesson;
}

// ─── HTML builder for teacher lesson plan ────────────────────────────────────
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTeacherHTML(lesson, time) {
  const {
    teacherTitle = 'Lesson Plan',
    teacherObjective = '',
    teacherBoardPoints = [],
    teacherExplanation = '',
    teacherDiscussionQuestions = [],
    teacherLocalExample = '',
    teacherTimeGuide = []
  } = lesson;

  const boardItems = teacherBoardPoints
    .map(p => `<li>${esc(p)}</li>`)
    .join('');

  const explanationParas = teacherExplanation
    .split(/\n\n+/)
    .filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`)
    .join('');

  const questions = teacherDiscussionQuestions
    .map((q, i) => `<li><span class="tp-qn">${i + 1}</span><span>${esc(q)}</span></li>`)
    .join('');

  const timeItems = teacherTimeGuide.map(t => {
    const m = t.match(/^([^:]+):\s*(.+)$/);
    if (m) return `<div class="tp-ti"><span class="tp-td">${esc(m[1])}</span><span class="tp-ta">${esc(m[2])}</span></div>`;
    return `<div class="tp-ti"><span class="tp-ta">${esc(t)}</span></div>`;
  }).join('');

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
    <div class="tp-tg-ttl">Time Guide — ${esc(time || '30 minutes')}</div>
    ${timeItems}
  </div>

  <button class="tp-print no-print" onclick="window.print()">Print Lesson Plan</button>
</div>`;
}

// ─── SSE progress stream ──────────────────────────────────────────────────────
const progressClients = {};

app.get("/progress/:id", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  progressClients[req.params.id] = res;
  req.on("close", () => delete progressClients[req.params.id]);
});

function progress(id, pct, phase) {
  const c = progressClients[id];
  if (c) c.write(`data: ${JSON.stringify({ pct, phase })}\n\n`);
}

// ─── Route ────────────────────────────────────────────────────────────────────
app.post("/generate", async (req, res) => {
  const { topic, struggles, time, context, reqId } = req.body;
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

  try {
    progress(reqId, 5,  "Searching app UI...");
    const uiContext = await searchUIContext(topic);

    progress(reqId, 25, "Planning full step outline...");
    const plan = await planSteps(topic, uiContext);

    progress(reqId, 45, `Generating ${plan.fullStepOutline.length} steps...`);
    let lesson = await generateLesson({ topic, struggles, time, context }, uiContext, plan);

    progress(reqId, 88, "Checking visuals match steps...");
    lesson = await validateAndCorrect(lesson, topic);

    lesson.teacherPlanHTML = buildTeacherHTML(lesson, time);

    progress(reqId, 100, "Done!");
    delete progressClients[reqId];
    res.json(lesson);
  } catch (err) {
    console.error(err);
    progress(reqId, 0, "Error: " + err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("KwaXolo → http://localhost:3000"));
