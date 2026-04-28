require("dotenv").config();
const express = require("express");
const { OpenAI, AzureOpenAI } = require("openai");
const path    = require("path");
const fs      = require("fs");
const https   = require("https");
const http    = require("http");

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

// ─── Token pricing & logging ──────────────────────────────────────────────────
// Prices in USD per 1 million tokens (update when Azure rates change).
const MODEL_PRICING = {
  "gpt-5.4":      { input: 3.75, output: 15.00 },
  "gpt-5.4-mini": { input: 0.15, output:  0.60 },
  "gpt-4o-mini":  { input: 0.15, output:  0.60 },
};

function logTokens(phase, model, usage, ledger) {
  const inp  = usage.prompt_tokens   ?? usage.input_tokens   ?? 0;
  const out  = usage.completion_tokens ?? usage.output_tokens ?? 0;
  const tot  = usage.total_tokens    ?? (inp + out);
  const p    = MODEL_PRICING[model]  || { input: 0, output: 0 };
  const cost = (inp * p.input + out * p.output) / 1_000_000;
  console.log(
    `  [tokens] ${phase.padEnd(20)} ${model.padEnd(16)} in:${String(inp).padStart(6)}  out:${String(out).padStart(6)}  tot:${String(tot).padStart(7)}  $${cost.toFixed(5)}`
  );
  const entry = { phase, model, inputTokens: inp, outputTokens: out, totalTokens: tot, estimatedCostUSD: +cost.toFixed(6) };
  if (ledger) ledger.push(entry);
  return entry;
}

// ─── Log directories ──────────────────────────────────────────────────────────
// Raw logs: temporary, high volume, gitignored
const LOGS_DIR = path.join(__dirname, "logs", "raw");
// Good/bad examples: permanent, committed to git, used as future reference
const EXAMPLES_DIR = path.join(__dirname, "../agent-guide/examples");
const GOOD_DIR     = path.join(EXAMPLES_DIR, "good");
const BAD_DIR      = path.join(EXAMPLES_DIR, "bad");
// Web search cache: keyed by topic slug, persists across server restarts
const SEARCH_CACHE_DIR = path.join(__dirname, "cache", "web-search");
// App design MDs: one subfolder per app, reused across lessons
const APP_DESIGN_DIR = path.join(__dirname, "../Example sites/Markdown");
// Real app logos: PNG files cached, served statically
const LOGOS_DIR        = path.join(__dirname, "public", "logos");
// Local South Africa top-500 logo pack
const LOGOS_SOURCE_DIR = path.join(__dirname, "../Logos/south_africa_top_500_app_logos/logos");
const LOGOS_MANIFEST   = path.join(__dirname, "../Logos/south_africa_top_500_app_logos/manifest.csv");
[LOGS_DIR, GOOD_DIR, BAD_DIR, SEARCH_CACHE_DIR, LOGOS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── Logo manifest index ──────────────────────────────────────────────────────
// Build a lowercase-title → filename map from the local manifest CSV at startup.
const LOGO_MANIFEST_OVERRIDES = {
  "whatsapp":         "006_WhatsApp_Messenger.png",  // avoid matching WhatsApp Business
  "mtn mobile money": "185_MTN_MoMo_SA.png",
  "mtn momo":         "185_MTN_MoMo_SA.png",
};

const LOGO_MANIFEST_INDEX = (() => {
  try {
    const lines = fs.readFileSync(LOGOS_MANIFEST, "utf8").trim().split("\n");
    const idx = {};
    for (const line of lines.slice(1)) {  // skip header
      const cols = line.match(/"([^"]*)"/g)?.map(s => s.slice(1, -1));
      if (cols && cols[1] && cols[7]) idx[cols[1].toLowerCase()] = cols[7];
    }
    console.log(`✓ Logo manifest: ${Object.keys(idx).length} local logos indexed`);
    return idx;
  } catch (e) {
    console.warn("⚠ Logo manifest not loaded:", e.message);
    return {};
  }
})();

// Fuzzy-match an app name to a local logo filename.
// Priority: override → exact → title-starts-with-query → query-primary-equals-title-primary
function findLogoInManifest(appName) {
  const q = appName.toLowerCase().trim();
  if (LOGO_MANIFEST_OVERRIDES[q]) return LOGO_MANIFEST_OVERRIDES[q];
  if (LOGO_MANIFEST_INDEX[q]) return LOGO_MANIFEST_INDEX[q];

  // Title starts with query (e.g. "canva" → "canva: ai photo & video editor")
  // Pick shortest matching title to avoid preferring "lite" variants
  const startsWith = Object.entries(LOGO_MANIFEST_INDEX)
    .filter(([t]) => t.startsWith(q))
    .sort((a, b) => a[0].length - b[0].length);
  if (startsWith.length) return startsWith[0][1];

  // Primary name before punctuation must match exactly
  const primary = q.split(/[:\-,]/)[0].trim();
  const primaryMatch = Object.entries(LOGO_MANIFEST_INDEX)
    .filter(([t]) => t.split(/[:\-,]/)[0].trim() === primary)
    .sort((a, b) => a[0].length - b[0].length);
  if (primaryMatch.length) return primaryMatch[0][1];

  return null;
}

// ─── Logo domain map ──────────────────────────────────────────────────────────
// Maps the canonical app name to the domain used to fetch its real icon.
// Google's favicon service (sz=128) returns the same icon shown on Android.
const LOGO_DOMAINS = {
  "Gmail":          "mail.google.com",
  "WhatsApp":       "whatsapp.com",
  "WhatsApp Business": "business.whatsapp.com",
  "Facebook":       "facebook.com",
  "Google Sheets":  "sheets.google.com",
  "Google Maps":    "maps.google.com",
  "Google Drive":   "drive.google.com",
  "Canva":          "canva.com",
  "MTN Mobile Money": "mtn.com",
  "Capitec":        "capitec.co.za",
  "Play Store":     "play.google.com",
  "YouTube":        "youtube.com",
  "Instagram":      "instagram.com",
  "TikTok":         "tiktok.com",
  "LinkedIn":       "linkedin.com",
};

// Fetch a URL and follow redirects, returning the raw Buffer.
function fetchBuffer(url, redirects) {
  redirects = redirects === undefined ? 5 : redirects;
  return new Promise((resolve, reject) => {
    if (redirects < 0) { reject(new Error("Too many redirects")); return; }
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { "User-Agent": "Mozilla/5.0 KwaXoloBot/1.0" } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchBuffer(res.headers.location, redirects - 1));
        return;
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Use web search to find a Play Store icon URL for any app.
// Returns a direct image URL string, or null.
async function searchPlayStoreIconUrl(appName) {
  const client = openaiClient();
  if (!client) return null;
  try {
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: `Find the Google Play Store page for the Android app called "${appName}". Return ONLY the direct URL of the app icon image (square logo). The URL is usually from play-lh.googleusercontent.com. Return just the URL, nothing else.`
    });
    const text = (resp.output_text || "").trim();
    // Prefer play-lh CDN URLs (high-res Play Store icons)
    const playMatch = text.match(/https:\/\/play-lh\.googleusercontent\.com\/[^\s"'<>)]+/);
    if (playMatch) return playMatch[0].replace(/=s\d+/, "=s128");
    // Fall back to any PNG/JPG URL
    const anyMatch = text.match(/https?:\/\/[^\s"'<>)]+\.(png|jpg|jpeg|webp)/i);
    return anyMatch ? anyMatch[0] : null;
  } catch (e) {
    console.warn(`  ⚠ Play Store icon search failed for "${appName}":`, e.message);
    return null;
  }
}

// Fetch the real logo for an app and save to public/logos/<slug>.png.
// Cascade: local manifest → Google favicon → Clearbit → web search → null.
async function fetchAndSaveLogo(appName) {
  if (!appName) return null;
  const slug = slugify(appName);
  const dest = path.join(LOGOS_DIR, slug + ".png");
  if (fs.existsSync(dest)) return "/logos/" + slug + ".png";

  // 1. Local South Africa top-500 logo pack
  const manifestFile = findLogoInManifest(appName);
  if (manifestFile) {
    const src = path.join(LOGOS_SOURCE_DIR, manifestFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  → Logo (local):   ${manifestFile} → public/logos/${slug}.png`);
      return "/logos/" + slug + ".png";
    }
  }

  const domain = LOGO_DOMAINS[appName];

  // 2. Google S2 favicon service (fast, works for known domains)
  if (domain) {
    try {
      const buf = await fetchBuffer(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      if (buf.length > 200) {
        fs.writeFileSync(dest, buf);
        console.log(`  → Logo (favicon): public/logos/${slug}.png  (${buf.length}b)`);
        return "/logos/" + slug + ".png";
      }
    } catch (e) {}
  }

  // 3. Clearbit logo API (good coverage for brand domains)
  if (domain) {
    try {
      const buf = await fetchBuffer(`https://logo.clearbit.com/${domain}?size=128`);
      if (buf.length > 500) {
        fs.writeFileSync(dest, buf);
        console.log(`  → Logo (clearbit): public/logos/${slug}.png  (${buf.length}b)`);
        return "/logos/" + slug + ".png";
      }
    } catch (e) {}
  }

  // 4. Web search for Play Store icon (covers unknown apps not in LOGO_DOMAINS)
  console.log(`  → Logo (searching): looking up Play Store icon for "${appName}"...`);
  const iconUrl = await searchPlayStoreIconUrl(appName);
  if (iconUrl) {
    try {
      const buf = await fetchBuffer(iconUrl);
      if (buf.length > 500) {
        fs.writeFileSync(dest, buf);
        console.log(`  → Logo (web search): public/logos/${slug}.png  (${buf.length}b)`);
        return "/logos/" + slug + ".png";
      }
    } catch (e) {}
  }

  console.log(`  → Logo: no source found for "${appName}"`);
  return null;
}

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
  android_home         → Android phone home screen with app icons grid (use for step 1 when student must open an app from the home screen)
  play_store_search    → Play Store search screen with results
  play_store_app       → App detail page: name, icon, Install/Open button, reviews
  gmail_welcome        → Gmail first-launch welcome screen: "Create account" (blue) + "Sign in" buttons
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
- Step 1 for any lesson that involves opening an app → MUST be android_home (student taps the app icon from the home screen)
- Step 2 for install lessons → play_store_search (student lands in Play Store after opening it)
- Step 3 for install lessons → play_store_app (student finds and opens the app listing)
- Gmail first-launch welcome (choose Create account or Sign in) → gmail_welcome, NOT generic
- Creating account → early steps MUST use: gmail_welcome → gmail_signup_name → gmail_signup_user → gmail_signup_pass
- Steps must follow the EXACT ORDER a first-time user experiences them`;

// ─── App design MD system ─────────────────────────────────────────────────────
// Keyword → canonical app name mapping. Add more apps here as content grows.
const APP_NAME_KEYWORDS = [
  { name: "Gmail",         keywords: ["gmail", "google mail", "google account", "email account", "google email"] },
  { name: "WhatsApp",      keywords: ["whatsapp", "whatsapp business"] },
  { name: "Facebook",      keywords: ["facebook", "fb page", "facebook page", "facebook marketplace"] },
  { name: "Google Sheets", keywords: ["google sheets", "spreadsheet", "excel"] },
  { name: "Canva",         keywords: ["canva", "flyer design", "poster design", "banner design"] },
  { name: "Google Maps",   keywords: ["google maps", "maps", "directions", "navigate", "route"] },
];

function detectAppName(topic) {
  const lower = topic.toLowerCase();
  for (const entry of APP_NAME_KEYWORDS) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.name;
  }
  return null;
}

// Fuzzy-match folder name (case-insensitive substring), read first .md, cap at 3000 chars
function loadAppDesignMD(appName) {
  if (!appName) return "";
  try {
    const entries = fs.readdirSync(APP_DESIGN_DIR);
    const folder  = entries.find(e =>
      e.toLowerCase() === appName.toLowerCase() ||
      appName.toLowerCase().includes(e.toLowerCase()) ||
      e.toLowerCase().includes(appName.toLowerCase())
    );
    if (!folder) return "";
    const folderPath = path.join(APP_DESIGN_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) return "";
    const mds = fs.readdirSync(folderPath).filter(f => f.endsWith(".md"));
    if (mds.length === 0) return "";
    const content = fs.readFileSync(path.join(folderPath, mds[0]), "utf8");
    const capped = content.length > 3000 ? content.slice(0, 3000) + "\n...(truncated)" : content;
    console.log(`  → App design MD loaded: ${folder}/${mds[0]} (${capped.length} chars)`);
    return capped;
  } catch { return ""; }
}

// After generating a lesson for an unknown app, ask the LLM to write a concise
// phone-focused design spec and save it so future lessons reuse it.
async function generateAndSaveAppDesignMD(lesson, appName, uiContext) {
  if (!appName) return;
  // Skip if folder already exists (design MD was already loaded)
  try {
    const entries = fs.readdirSync(APP_DESIGN_DIR);
    const exists  = entries.find(e => e.toLowerCase() === appName.toLowerCase());
    if (exists) return;
  } catch { return; }

  const client = azClient(DEP_TEACHER);
  try {
    const stepSummary = (lesson.steps || [])
      .map(s => `[${s.screenType}] ${s.screenName}`)
      .join(", ");

    const prompt = `You are documenting the Android mobile UI of "${appName}" for a curriculum tool used in rural KwaZulu-Natal schools.
Students are 13–18 years old with no prior experience. Create a concise phone-focused design reference.

Lesson steps just generated:
${stepSummary}

Web UI research (if available):
${uiContext || "Use your knowledge of the app."}

Write a design spec markdown with these sections:
# ${appName} — Phone UI Design Reference

## Overview
(2–3 sentences: what the app does, Android version focus)

## Brand Colours
- Primary: #hex
- Background: #hex
- Text: #hex

## Key Screens
For each screen: **Screen Name** — purpose + 3–5 key UI elements with exact button/label text

## First-Time User Flow
Ordered list of screens from fresh install to first successful action

## Common UI Patterns
Bullet list of recurring elements (nav bar, FAB, bottom tabs, etc.) with exact labels

Keep under 600 words. Focus on EXACT SCREEN NAMES and BUTTON LABELS as they appear in the app.`;

    const response = await client.chat.completions.create({
      model: DEP_TEACHER,
      max_completion_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const mdContent = response.choices[0].message.content;
    const folderPath = path.join(APP_DESIGN_DIR, appName);
    fs.mkdirSync(folderPath, { recursive: true });
    const filename = `${appName.toLowerCase().replace(/\s+/g, "_")}_phone_design.md`;
    fs.writeFileSync(path.join(folderPath, filename), mdContent);
    console.log(`  → New app design MD saved: Example sites/Markdown/${appName}/${filename}`);
  } catch (e) {
    console.warn(`  ⚠ Failed to generate app design MD for ${appName}:`, e.message);
  }
}

// ─── Web search cache helpers ─────────────────────────────────────────────────
// Cache TTL: re-scrape if the cached result is older than this many days.
// App UIs change occasionally, so 30 days is a reasonable balance.
const CACHE_TTL_DAYS = parseInt(process.env.SEARCH_CACHE_TTL_DAYS || "30", 10);

function searchCachePath(topic) {
  return path.join(SEARCH_CACHE_DIR, `${slugify(topic)}.json`);
}

function readSearchCache(topic) {
  const file = searchCachePath(topic);
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data.result || !data.cachedAt) return null;
    const ageMs  = Date.now() - new Date(data.cachedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > CACHE_TTL_DAYS) return null; // stale — force re-scrape
    return { result: data.result, ageDays: Math.floor(ageDays) };
  } catch { return null; }
}

function writeSearchCache(topic, result) {
  fs.writeFileSync(
    searchCachePath(topic),
    JSON.stringify({ topic, result, cachedAt: new Date().toISOString() }, null, 2)
  );
}

// ─── Phase 1: web search targeted at the exact topic ─────────────────────────
// Stays on OpenAI — Azure Foundry has no drop-in web_search_preview equivalent.
// Results are cached to disk and reused for CACHE_TTL_DAYS (default 30 days).
// After that the cache is considered stale and a fresh scrape runs automatically.
async function searchUIContext(topic, ledger) {
  const cached = readSearchCache(topic);
  if (cached) {
    console.log(`  → Web search cache HIT (${cached.ageDays}d old, TTL ${CACHE_TTL_DAYS}d): "${topic}"`);
    return cached.result;
  }

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
    const result = response.output_text;
    if (response.usage) logTokens("web_search", "gpt-4o-mini", response.usage, ledger);
    writeSearchCache(topic, result);
    console.log(`  → Web search complete — cached: cache/web-search/${slugify(topic)}.json`);
    return result;
  } catch (e) {
    console.warn("Web search failed:", e.message);
    return "";
  }
}

// ─── Phase 2: plan steps calibrated to task difficulty ───────────────────────
async function planSteps(topic, uiContext, ledger) {
  const client = azClient(DEP_VALIDATOR);

  const response = await client.chat.completions.create({
    model: DEP_VALIDATOR,
    response_format: { type: "json_object" },
    max_completion_tokens: 3500,
    messages: [{
      role: "user",
      content: `Create a step plan for teaching a complete beginner: "${topic}"

Student: 13–18 years old, rural KwaZulu-Natal, South Africa. Basic Android phone.
Has NEVER used this app or done this task before. Treat every screen as completely new.

Real app UI from web search:
${uiContext || "Use your knowledge of the real app UI."}

STEP COUNT — calibrate to actual task difficulty:
  Simple task (1–2 screens, 1 goal):      8–10 steps
  Medium task (3–5 screens, setup flow): 10–12 steps
  Complex task (6+ screens, multi-goal): 12–13 steps

ABSOLUTE LIMIT: never return more than 13 steps. Aim for 10–13 steps. If the task has more details, combine closely related fields or confirmations into one clear step, but keep the final step as the real completed goal.

Examples of difficulty:
  Simple  → "Send a WhatsApp message to an existing contact"          → ~7 steps
  Medium  → "Set up a WhatsApp Business profile"                      → ~10 steps
  Complex → "Create a Gmail account from scratch and send first email" → 13 steps max

RULES:
- Start from the ABSOLUTE beginning of what the student must do:
    → App not installed: Step 1 = Open Play Store → find app → tap Install
    → New account needed: include EVERY signup screen as its own step
- Every distinct screen the user sees = its own step
- Every form field set = its own step (do not merge multiple fields into one)
- Every confirmation / permission / SMS code screen = its own step
- The FINAL step must show the student completing the main goal (not just setting up)
- Maximum 13 steps total. This is non-negotiable.
- Do NOT pad with trivial filler steps just to inflate the count
- You MAY combine closely related micro-actions into one step to stay under 13 steps
- Name the specific screen and button in each step description

Return JSON:
{
  "difficulty": "simple | medium | complex",
  "mainObjective": "One sentence — what the student will have DONE by the final step",
  "fullStepOutline": [
    "Step 1: [screen name] — [exact action and button]",
    "Step 2: [screen name] — [exact action and button]"
  ]
}`
    }]
  });

  if (response.usage) logTokens("plan", DEP_VALIDATOR, response.usage, ledger);
  const plan = JSON.parse(response.choices[0].message.content);
  if (plan.fullStepOutline?.length > 13) {
    console.warn(`  ⚠ Plan returned ${plan.fullStepOutline.length} steps — trimming to 13 max`);
    plan.fullStepOutline = plan.fullStepOutline.slice(0, 13);
  }
  const minByDifficulty = { simple: 8, medium: 10, complex: 12 };
  const min = minByDifficulty[plan.difficulty] || 6;
  if (plan.fullStepOutline.length < min) {
    console.warn(`  ⚠ Plan has ${plan.fullStepOutline.length} steps for "${plan.difficulty}" task (min ${min})`);
  }
  console.log(`  → Plan [${plan.difficulty}]: "${plan.mainObjective}" — ${plan.fullStepOutline.length} steps`);
  return plan;
}

// ─── Shared prompt blocks for both teacher + student calls ───────────────────
function commonContextBlock(category, catRules, examplesBlock) {
  return `═══════════════════════════════════════════
REFERENCE EXAMPLES — MATCH THIS QUALITY
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
CATEGORY-SPECIFIC RULES (Category ${category})
═══════════════════════════════════════════
${catRules}

═══════════════════════════════════════════
LOCAL CONTEXT — always use named references
═══════════════════════════════════════════
You MUST reference at least one of these by name where local grounding applies:
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

═══════════════════════════════════════════
WHAT THE AGENT MUST NEVER DO
═══════════════════════════════════════════
${NEVER_DO}`;
}

// ─── Phase 3a: generate teacher material (gpt-5.4-mini) ───────────────────────
async function generateTeacherMaterial(inputs, uiContext, plan, category, catRules, examplesBlock, ledger) {
  const client = azClient(DEP_TEACHER);

  const systemPrompt = `You are an entrepreneurship curriculum assistant for KwaXolo Impact.
You generate the TEACHER-FACING half of a lesson for teachers in rural KwaZulu-Natal, South Africa.
Output is read by the teacher to deliver class with chalk and a blackboard only.
The student-facing task steps are generated separately. Do NOT generate steps here.

${commonContextBlock(category, catRules, examplesBlock)}

═══════════════════════════════════════════
TEACHER LESSON PLAN STRUCTURE
═══════════════════════════════════════════
${LESSON_STRUCT}

═══════════════════════════════════════════
QUALITY CHECKLIST (run silently before returning)
═══════════════════════════════════════════
${QUALITY_CHECK}

Main objective for this lesson: ${plan.mainObjective}

Student task plan the teacher must prepare students for:
${plan.fullStepOutline.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Real app UI from web search (for context only — do not turn this into a projector demo):
${uiContext || "(no web search context)"}`;

  const userMsg = `Generate the TEACHER MATERIAL ONLY for: "${inputs.topic}"

What students struggle with: ${inputs.struggles || "none noted"}
Available class time: ${inputs.time}
Class context: ${inputs.context || "none provided"}

Return ONLY valid JSON in this exact shape:

{
  "teacherTitle": "Plain-language title, max 8 words, no jargon",
  "teacherObjective": "By the end of this lesson, students can... [one concrete, checkable sentence]",
  "teacherPrep": [
    "One short thing to prepare before class",
    "One short thing to write/check before class",
    "One short grouping/material note"
  ],
  "teacherBoardPoints": [
    "Point 1 — max 6 words",
    "Point 2 — max 6 words",
    "Point 3 — max 6 words",
    "Point 4 — max 6 words",
    "Point 5 — max 6 words"
  ],
  "teacherBoardLayout": {
    "title": "Exact title to write at top of board",
    "leftColumn": [
      "Key word: simple meaning",
      "Key word: simple meaning"
    ],
    "rightColumn": [
      "Simple class step 1",
      "Simple class step 2",
      "Simple class step 3"
    ],
    "bottomLine": "One reminder/question to keep on the board"
  },
  "teacherScript": [
    {
      "section": "Open",
      "minutes": 5,
      "say": "Short words the teacher can say directly. No projector. No computer demo.",
      "do": "Physical classroom action: write, point, ask, pair students, or check books."
    },
    {
      "section": "Explain",
      "minutes": 10,
      "say": "Simple explanation with a NAMED KZN reference.",
      "do": "How to use the board and questions to teach it."
    },
    {
      "section": "Practice",
      "minutes": 15,
      "say": "How to send students into the phone/PC task without demonstrating on a big screen.",
      "do": "How to group students, rotate roles, and walk around to support."
    },
    {
      "section": "Check",
      "minutes": 5,
      "say": "What to ask at the end to check understanding.",
      "do": "What evidence to look for in notebooks, phones, or group answers."
    }
  ],
  "teacherExplanation": "2 short paragraphs. Explain the idea in Grade 8 English, include one named KZN example, and connect clearly to the student task. This is fallback text for older renderers.",
  "teacherVocabulary": [
    {
      "word": "One important word",
      "simpleMeaning": "Simple meaning in plain English",
      "isiZuluSupport": "isiZulu support word or empty string"
    }
  ],
  "teacherDiscussionQuestions": [
    "Open question 1 — connects to student life, cannot be yes/no?",
    "Open question 2 — connects to the local example?",
    "Open question 3 — prepares students for the student task?"
  ],
  "teacherLocalExample": "2–3 sentences. Name a specific person, place, or venture from KwaZulu-Natal. Directly relevant to this topic. Concrete and specific — not generic.",
  "teacherDevicePlan": {
    "ifEnoughDevices": "How to run the task if enough phones/PCs are available.",
    "ifSharedDevices": "How groups should rotate roles when 4–6 students share one device.",
    "ifNoInternet": "A chalk/blackboard or notebook fallback that still teaches the concept."
  },
  "teacherCommonMistakes": [
    {
      "mistake": "Likely student mistake or confusion",
      "teacherResponse": "What the teacher should say or do to help"
    }
  ],
  "teacherAssessment": [
    "One visible result the teacher can check",
    "One question students should answer",
    "One notebook/board/group output to collect or hear"
  ],
  "teacherTimeGuide": [
    "5 min: opening and board",
    "10 min: explanation",
    "15 min: student task or no-internet fallback",
    "5 min: check and wrap-up"
  ],
  "teacherWrapUpQuestion": "One final question students answer in one sentence.",
  "teacherExtension": "Optional task for faster groups."
}

The teacher plan MUST be usable without a computer, projector, or big screen.
The teacherScript must tell the teacher what to SAY and what to DO.
The teacherDevicePlan.ifNoInternet must be a real no-device/no-internet classroom fallback, not "try again later".
The teacherExplanation AND teacherLocalExample MUST each name a specific KZN entity from the local context list.`;

  const response = await client.chat.completions.create({
    model: DEP_TEACHER,
    response_format: { type: "json_object" },
    max_completion_tokens: 8000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMsg }
    ]
  });

  if (response.usage) logTokens("teacher", DEP_TEACHER, response.usage, ledger);
  return JSON.parse(response.choices[0].message.content);
}

// ─── Phase 3b: generate student task material (gpt-5.4) ───────────────────────
async function generateStudentMaterial(inputs, uiContext, plan, category, catRules, examplesBlock, appDesignMD, ledger) {
  const client = azClient(DEP_STUDENT);

  const systemPrompt = `You are an entrepreneurship curriculum assistant for KwaXolo Impact.
You generate the STUDENT-FACING task — the Duolingo-style step-by-step phone walkthrough that students complete on their device.
The teacher-facing lesson plan is generated separately. Focus all effort on the steps.

${commonContextBlock(category, catRules, examplesBlock)}

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
PHONE SCREEN TYPES
═══════════════════════════════════════════
${SCREEN_TYPES}
${appDesignMD ? `
═══════════════════════════════════════════
APP UI DESIGN REFERENCE — use for accurate screen names, colours, and button labels
═══════════════════════════════════════════
${appDesignMD}` : ""}
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

  const userMsg = `Generate the STUDENT TASK ONLY for: "${inputs.topic}"

What students struggle with: ${inputs.struggles || "none noted"}
Class context: ${inputs.context || "none provided"}

You must generate ALL ${plan.fullStepOutline.length} steps listed in the step plan above.
Do not stop early. Do not merge steps. Every step must be fully filled out.
Never generate more than 13 steps total. Target 10–13 steps whenever the task has enough meaningful screens/actions.

Return ONLY valid JSON in this exact shape:

{
  "appName": "Exact app name as it appears in the app store",
  "appColor": "#hex brand colour",
  "appTextColor": "#fff or #1A1A1A",
  "taskTitle": "Task title matching the lesson topic",
  "taskIntro": "One active-voice sentence: what the student will HAVE when they finish (not what they will 'do')",
  "taskTime": "10–15 minutes",
  "taskReflection": "Personal reflection question — must connect to the student's real life — cannot be answered yes/no — requires having done the task",
  "steps": [
    {
      "number": 1,
      "screenType": "exact value from screen types list",
      "screenName": "Exact screen name as it appears in the app",
      "targetLabel": "Exact clickable/tappable target for this step. Must match one visible app icon, button, field, or menu label. Never leave empty for phone action steps.",
      "teach": "2–3 sentences. What is on this screen. What the student is about to do and why it matters for completing the main goal. Include a fail-recovery hint if the step could go wrong.",
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
Always include targetLabel for EVERY step that involves tapping, typing, selecting, or confirming something on the phone. The simulator only accepts this exact target as correct.
For android_home, targetLabel MUST be the exact app icon to tap, such as "Play Store", "Gmail", "WhatsApp", or "Facebook".
Vary exerciseTypes across steps — never more than 3 tap_correct in a row.
Use do_and_confirm for any step that requires the student to act on their real phone.
Use arrange_steps at least once per task if the topic involves a sequence.`;

  const response = await client.chat.completions.create({
    model: DEP_STUDENT,
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMsg }
    ]
  });

  if (response.usage) logTokens("student", DEP_STUDENT, response.usage, ledger);
  return JSON.parse(response.choices[0].message.content);
}

// ─── Phase 3: orchestrate teacher + student in parallel and merge ────────────
async function generateLesson(inputs, uiContext, plan, ledger) {
  const category      = detectCategory(inputs.topic);
  const catRules      = CAT[category] || CAT["F"];
  const examplesBlock = loadExamples();
  const appName       = detectAppName(inputs.topic);
  const appDesignMD   = loadAppDesignMD(appName);

  console.log(`  → Detected category: ${category}`);
  console.log(`  → App name detected: ${appName || "(none)"}`);
  console.log(`  → Teacher: ${DEP_TEACHER}  |  Student: ${DEP_STUDENT}`);

  const [teacherPart, studentPart] = await Promise.all([
    generateTeacherMaterial(inputs, uiContext, plan, category, catRules, examplesBlock, ledger),
    generateStudentMaterial(inputs, uiContext, plan, category, catRules, examplesBlock, appDesignMD, ledger)
  ]);

  const lesson = { ...teacherPart, ...studentPart };

  // Non-blocking: generate design MD and fetch logo for new apps
  if (appName && !appDesignMD) {
    generateAndSaveAppDesignMD(lesson, appName, uiContext).catch(() => {});
  }
  // Always try logo (re-uses cached file if already downloaded)
  if (appName) fetchAndSaveLogo(appName).catch(() => {});

  return lesson;
}

// ─── Validation 1: enforce difficulty-appropriate minimum step count ──────────
async function validateStepCount(lesson, topic, plan, ledger) {
  const count = (lesson.steps || []).length;
  if (count > 13) {
    lesson.steps = lesson.steps.slice(0, 13).map((s, i) => ({ ...s, number: i + 1 }));
    console.warn(`  ⚠ Step count capped at 13 for "${topic}"`);
    return lesson;
  }
  const minByDifficulty = { simple: 8, medium: 10, complex: 12 };
  const min = minByDifficulty[plan.difficulty] || 6;
  const cappedMin = Math.min(min, 13);

  if (count >= cappedMin) {
    console.log(`  → Step count OK: ${count} steps (target ${cappedMin}–13 for ${plan.difficulty || "?"} task)`);
    return lesson;
  }

  console.log(`  ⚠ Only ${count} steps — requesting missing steps to reach ${cappedMin}`);
  const client = azClient(DEP_STUDENT);

  const existing = lesson.steps.map(s =>
    `Step ${s.number}: [${s.screenType}] ${s.screenName} — ${(s.teach || "").slice(0, 100)}`
  ).join("\n");

  const response = await client.chat.completions.create({
    model: DEP_STUDENT,
    response_format: { type: "json_object" },
    max_completion_tokens: 6000,
    messages: [{
      role: "user",
      content: `A lesson about "${topic}" only has ${count} steps. It needs at least ${cappedMin} and at most 13 steps.
Main objective: ${plan.mainObjective}

Existing steps:
${existing}

Generate the MISSING steps to reach at least ${cappedMin} total AND complete the main objective.
Do not exceed 13 total steps.
Continue naturally from the last existing step.
Use the same step schema. Vary the exerciseTypes.

${SCREEN_TYPES}

Return JSON: { "additionalSteps": [ ...step objects with number, screenType, screenName, targetLabel, teach, exerciseType, question, options, correctAnswer, acceptedAnswers, tiles, correctOrder, pairs, instruction, visibleResult, feedbackCorrect, feedbackWrong, tip ] }`
    }]
  });

  if (response.usage) logTokens("validate_count", DEP_STUDENT, response.usage, ledger);
  const extra = JSON.parse(response.choices[0].message.content);
  if (extra.additionalSteps?.length > 0) {
    const offset = lesson.steps.length;
    const slots = Math.max(0, 13 - offset);
    lesson.steps = [
      ...lesson.steps,
      ...extra.additionalSteps.slice(0, slots).map((s, i) => ({ ...s, number: offset + i + 1 }))
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
async function validateExercises(lesson, ledger) {
  const client = azClient(DEP_VALIDATOR);

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
    model: DEP_VALIDATOR,
    response_format: { type: "json_object" },
    max_completion_tokens: 800,
    messages: [{ role: "user", content: prompt }]
  });

  if (response.usage) logTokens("validate_exercises", DEP_VALIDATOR, response.usage, ledger);
  const check = JSON.parse(response.choices[0].message.content);
  if (!check.valid && check.issues) {
    console.warn("  ⚠ Exercise issues:", check.issues.join(" | "));
  } else {
    console.log(`  → Exercise validation passed (${lesson.steps.length} steps)`);
  }
  return lesson;
}

// ─── Validation 4: screen types match steps ──────────────────────────────────
async function validateScreenTypes(lesson, topic, ledger) {
  const client = azClient(DEP_VALIDATOR);

  // Hard-coded rule: step 1 must always be android_home for any lesson
  // that starts with opening an app (i.e., almost every lesson).
  // Apply this before the LLM validation to catch the most common mistake.
  if (lesson.steps[0] && lesson.steps[0].screenType !== "android_home") {
    const firstTeach = (lesson.steps[0].teach || "").toLowerCase();
    const impliesHomeScreen = ["home screen", "open", "find", "tap", "play store", "app"].some(kw => firstTeach.includes(kw));
    if (impliesHomeScreen) {
      lesson.steps[0].screenType = "android_home";
      console.log("  → Step 1 auto-corrected to android_home");
    }
  }

  // Hard-coded content corrections: fix steps where screenType doesn't match the teach text.
  lesson.steps.forEach(s => {
    const t = (s.teach || "").toLowerCase();
    const app = (lesson.appName || "").toLowerCase();
    // Gmail welcome screen: teach mentions "create account" or "welcome" and shows welcome/sign-in choice
    if (app.includes("gmail") && s.screenType === "generic" &&
        (t.includes("create account") || t.includes("welcome to gmail") || t.includes("sign in") && t.includes("create"))) {
      s.screenType = "gmail_welcome";
      console.log(`  → Step ${s.number} auto-corrected to gmail_welcome`);
    }
    // Play Store app page: teach mentions "install" button but screenType is generic
    if (s.screenType === "generic" && (t.includes("install button") || t.includes("tap install"))) {
      s.screenType = "play_store_app";
      console.log(`  → Step ${s.number} auto-corrected to play_store_app`);
    }
  });

  const allSteps = lesson.steps.map(s =>
    `Step ${s.number}: screenType="${s.screenType}", teach: "${(s.teach||"").slice(0,90)}"`
  ).join("\n");

  const prompt = `Lesson about "${topic}", app: ${lesson.appName}.
ALL steps:
${allSteps}

Check that each screenType matches what would actually be visible at that step. Apply these rules:
- Step 1 for any lesson → MUST be android_home (student opens app from home screen)
- Step 2 for install lessons → play_store_search
- Step 3 for install lessons → play_store_app (app listing with Install button)
- Gmail first-launch welcome (shows "Create account" + "Sign in" buttons) → gmail_welcome NOT generic
- Creating account → gmail_welcome → gmail_signup_name → gmail_signup_user → gmail_signup_pass (in that order) NOT generic
- The screen shown must match EXACTLY what the teach text describes

${SCREEN_TYPES}

Return JSON: { "correct": true } if all screenTypes are correct.
Return JSON: { "correct": false, "corrections": [{ "step": 1, "screenType": "android_home" }, ...] }
List ONLY the step numbers that need fixing and their corrected screenType. Do NOT return the full steps array.`;

  const response = await client.chat.completions.create({
    model: DEP_VALIDATOR,
    response_format: { type: "json_object" },
    max_completion_tokens: 1200,
    messages: [{ role: "user", content: prompt }]
  });

  if (response.usage) logTokens("validate_screens", DEP_VALIDATOR, response.usage, ledger);
  const check = JSON.parse(response.choices[0].message.content);
  if (!check.correct && check.corrections?.length > 0) {
    check.corrections.forEach(({ step, screenType }) => {
      const s = lesson.steps.find(ls => ls.number === step);
      if (s && screenType) s.screenType = screenType;
    });
    console.log(`  → Screen type validation corrected ${check.corrections.length} step(s)`);
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
    teacherTimeGuide = [], teacherPrep = [], teacherBoardLayout = null,
    teacherScript = [], teacherVocabulary = [], teacherDevicePlan = null,
    teacherCommonMistakes = [], teacherAssessment = [],
    teacherWrapUpQuestion = "", teacherExtension = "", taskTitle = ""
  } = lesson;

  const renderList = (items, cls = "tp-list") => {
    const clean = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!clean.length) return "";
    return `<ul class="${cls}">${clean.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
  };

  const renderSection = (num, title, body, extraClass = "") => {
    if (!body) return "";
    return `<div class="tp-sec ${extraClass}">
    <h2 class="tp-h2"><span class="tp-num">${num}</span>${esc(title)}</h2>
    ${body}
  </div>`;
  };

  const boardLeft = teacherBoardLayout?.leftColumn?.length ? teacherBoardLayout.leftColumn : teacherBoardPoints;
  const boardRight = teacherBoardLayout?.rightColumn?.length
    ? teacherBoardLayout.rightColumn
    : ["Explain the idea", "Students practise", "Groups share one answer"];
  const boardBottom = teacherBoardLayout?.bottomLine || teacherWrapUpQuestion || "What can you show at the end?";
  const boardItems = teacherBoardPoints.map(p => `<li>${esc(p)}</li>`).join("");
  const explanationParas = teacherExplanation.split(/\n\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
  const questions = teacherDiscussionQuestions.map((q, i) => `<li><span class="tp-qn">${i+1}</span><span>${esc(q)}</span></li>`).join("");
  const timeItems = teacherTimeGuide.map(t => {
    const m = t.match(/^([^:]+):\s*(.+)$/);
    return m
      ? `<div class="tp-ti"><span class="tp-td">${esc(m[1])}</span><span class="tp-ta">${esc(m[2])}</span></div>`
      : `<div class="tp-ti"><span class="tp-ta">${esc(t)}</span></div>`;
  }).join("");
  const prepHTML = renderList(teacherPrep);
  const vocabHTML = Array.isArray(teacherVocabulary) && teacherVocabulary.length ? `<div class="tp-vocab">
    ${teacherVocabulary.map(v => `<div class="tp-vrow">
      <div class="tp-vword">${esc(v.word)}</div>
      <div class="tp-vmean">${esc(v.simpleMeaning)}</div>
      ${v.isiZuluSupport ? `<div class="tp-vzu">${esc(v.isiZuluSupport)}</div>` : ""}
    </div>`).join("")}
  </div>` : "";
  const scriptHTML = Array.isArray(teacherScript) && teacherScript.length ? `<div class="tp-script">
    ${teacherScript.map(s => `<div class="tp-step">
      <div class="tp-step-h">
        <span class="tp-step-name">${esc(s.section || "Teach")}</span>
        <span class="tp-step-min">${esc(s.minutes || "")}${s.minutes ? " min" : ""}</span>
      </div>
      <div class="tp-say"><strong>Say:</strong> ${esc(s.say)}</div>
      <div class="tp-do"><strong>Do:</strong> ${esc(s.do)}</div>
    </div>`).join("")}
  </div>` : explanationParas;
  const deviceHTML = teacherDevicePlan ? `<div class="tp-device-grid">
    <div><span>Enough devices</span>${esc(teacherDevicePlan.ifEnoughDevices || "")}</div>
    <div><span>Shared devices</span>${esc(teacherDevicePlan.ifSharedDevices || "")}</div>
    <div><span>No internet</span>${esc(teacherDevicePlan.ifNoInternet || "")}</div>
  </div>` : "";
  const mistakesHTML = Array.isArray(teacherCommonMistakes) && teacherCommonMistakes.length ? `<div class="tp-mistakes">
    ${teacherCommonMistakes.map(m => `<div class="tp-mistake">
      <div class="tp-m-label">Student may...</div>
      <div>${esc(m.mistake)}</div>
      <div class="tp-m-label">Teacher response</div>
      <div>${esc(m.teacherResponse)}</div>
    </div>`).join("")}
  </div>` : "";
  const assessmentHTML = renderList(teacherAssessment);

  return `<div class="tp">
  <div class="tp-hd">
    <div class="tp-obj-lbl">Chalk-and-board lesson plan</div>
    <h1 class="tp-title">${esc(teacherTitle)}</h1>
    <p class="tp-obj">${esc(teacherObjective)}</p>
    ${taskTitle ? `<p class="tp-linked">Student task: ${esc(taskTitle)}</p>` : ""}
  </div>
  ${renderSection(1, "Before Class", prepHTML)}
  <div class="tp-board">
    <div class="tp-board-ttl">Blackboard Plan</div>
    <div class="tp-board-sub">Use this instead of a projector. Students copy the key words and steps.</div>
    <div class="tp-board-title">${esc(teacherBoardLayout?.title || teacherTitle)}</div>
    <div class="tp-board-grid">
      <div>
        <div class="tp-board-col">Key words</div>
        ${renderList(boardLeft, "tp-bl")}
      </div>
      <div>
        <div class="tp-board-col">Class steps</div>
        ${renderList(boardRight, "tp-bl")}
      </div>
    </div>
    <div class="tp-board-bottom">${esc(boardBottom)}</div>
  </div>
  ${renderSection(2, "Teach It Directly", `<div class="tp-script-note">No computer or big screen needed. Read, adapt, and use the board.</div>${scriptHTML}`)}
  ${renderSection(3, "Key Words", vocabHTML)}
  ${renderSection(4, "Local Example", `<div class="tp-local">${esc(teacherLocalExample)}</div>`)}
  ${renderSection(5, "Discussion Questions", `<ol class="tp-qs">${questions}</ol>`)}
  ${renderSection(6, "Device And No-Internet Plan", deviceHTML)}
  ${renderSection(7, "Common Mistakes", mistakesHTML)}
  ${renderSection(8, "Check Understanding", assessmentHTML)}
  ${teacherWrapUpQuestion ? renderSection(9, "Wrap Up", `<div class="tp-local">${esc(teacherWrapUpQuestion)}</div>`) : ""}
  ${teacherExtension ? renderSection(10, "Fast Groups", `<div class="tp-note">${esc(teacherExtension)}</div>`) : ""}
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
  if (!AZ_ENDPOINT || !AZ_KEY) return res.status(500).json({ error: "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be set in .env" });

  try {
    const ledger = [];   // token usage records for this request

    progress(reqId, 5,  `Searching: "${topic}"...`);
    const uiContext = await searchUIContext(topic, ledger);

    progress(reqId, 18, "Planning steps...");
    const plan = await planSteps(topic, uiContext, ledger);

    const category = detectCategory(topic);
    progress(reqId, 32, `Generating (${plan.difficulty || "medium"}, ${plan.fullStepOutline.length} steps)...`);
    let lesson = await generateLesson({ topic, struggles, time, context }, uiContext, plan, ledger);

    progress(reqId, 65, "Checking step count...");
    lesson = await validateStepCount(lesson, topic, plan, ledger);

    progress(reqId, 74, "Checking local grounding...");
    lesson = validateLocalGrounding(lesson);

    progress(reqId, 82, "Checking exercise fields...");
    lesson = await validateExercises(lesson, ledger);

    progress(reqId, 91, "Checking screen types...");
    lesson = await validateScreenTypes(lesson, topic, ledger);

    lesson.teacherPlanHTML = buildTeacherHTML(lesson, time);

    const grounded = hasLocalGrounding((lesson.teacherExplanation||"") + (lesson.teacherLocalExample||""));

    // Token summary
    const totalTokens = ledger.reduce((s, e) => s + e.totalTokens, 0);
    const totalCost   = ledger.reduce((s, e) => s + e.estimatedCostUSD, 0);
    console.log(`  [tokens] ${"TOTAL".padEnd(20)} ${"".padEnd(16)} ${"".padStart(6+2+6)}  tot:${String(totalTokens).padStart(7)}  $${totalCost.toFixed(5)}`);
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
      tokens: { ledger, totalTokens, totalCostUSD: +totalCost.toFixed(6) },
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

// ─── Logo API — list cached logos + on-demand fetch ──────────────────────────
app.get("/api/logos", (req, res) => {
  try {
    const files = fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith(".png"));
    const map = {};
    files.forEach(f => { map[f.replace(".png", "")] = "/logos/" + f; });
    res.json(map);
  } catch { res.json({}); }
});

// Fetch a logo on demand (e.g. GET /api/fetch-logo?app=Canva)
app.get("/api/fetch-logo", async (req, res) => {
  const appName = (req.query.app || "").trim();
  if (!appName) return res.status(400).json({ error: "Missing app param" });
  try {
    const logoPath = await fetchAndSaveLogo(appName);
    res.json({ path: logoPath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log("KwaXolo → http://localhost:3000");
  // Pre-fetch all known logos in the background so they're ready for the first lesson
  Object.keys(LOGO_DOMAINS).forEach(name => fetchAndSaveLogo(name).catch(() => {}));
});
