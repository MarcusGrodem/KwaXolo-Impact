# CLAUDE.md

This file gives Claude Code the working context for this repository.

## Project

KwaXolo Impact Challenge / KwaXolo Learn is an AI-assisted learning platform concept for nine rural schools in KwaZulu-Natal, South Africa. The current product direction is a teacher-facing content agent that produces:

1. A blackboard-ready teacher lesson plan
2. A student-facing, step-by-step interactive task for basic Android phones or shared school PCs

The core principle is: teacher = creator and quality gate, AI = production engine, student = end user.

## Current State

This is no longer a blank strategy repo. It contains a working local prototype in `test-site/`.

- Run prototype: `npm start`
- Local URL: `http://localhost:3000`
- Server: `test-site/server.js`
- UI: `test-site/public/index.html`
- Package manager: npm
- Main dependencies: `express`, `openai`, `dotenv`, `@google/generative-ai`, `playwright`

There is no meaningful automated test suite yet. `npm test` is still the default placeholder and exits with an error.

## Environment

The prototype expects `.env` values for Azure/OpenAI generation.

Important variables used by `test-site/server.js`:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION` default: `2025-04-01-preview`
- `AZURE_DEPLOYMENT_STUDENT` default: `gpt-5.4`
- `AZURE_DEPLOYMENT_TEACHER` default: `gpt-5.4-mini`
- `AZURE_DEPLOYMENT_VALIDATOR` default: `gpt-5.4-mini`
- `OPENAI_API_KEY` optional, used for `web_search_preview`
- `SEARCH_CACHE_TTL_DAYS` default: `30`

Do not print `.env` contents.

## Repository Map

- `context/` — compact project and agent briefs for future work.
- `agent-guide/` — source-of-truth instructions for generated teacher/student content.
- `agent-guide/examples/good/` and `agent-guide/examples/bad/` — committed generation examples used as feedback data.
- `design/` — strategy, Lovable prompts, LLM-optimized product brief, and sparring notes.
- `docs/briefings/` — original project brief PDFs and partnership materials.
- `docs/research/` — market/research reports and earlier platform specifications.
- `Example sites/` — screenshots and Markdown app design references for real app UI patterns.
- `Logos/south_africa_top_500_app_logos/` — local logo pack and manifest for South African Android app logos.
- `test-site/cache/web-search/` — cached app/tutorial research, persisted across local runs.
- `test-site/logs/raw/` — high-volume raw generation logs, gitignored.
- `test-site/public/logos/` — cached/served app logos.
- `src/`, `assets/`, `content/` — placeholders only at the moment.

## Agent Pipeline

`test-site/server.js` implements the current generation pipeline:

1. Search UI context for the requested task with OpenAI `web_search_preview`, cached under `test-site/cache/web-search/`.
2. Plan difficulty and exact steps with the validator deployment.
3. Generate teacher material and student material in parallel.
4. Validate minimum step count.
5. Validate local grounding.
6. Validate exercise fields.
7. Validate screen types.
8. Build teacher HTML and return the combined lesson.
9. Save raw logs and optionally save good/bad examples into `agent-guide/examples/`.

Teacher material uses the cheaper teacher deployment. Student material uses the higher-quality student deployment. Validators use the validator deployment.

## Content Rules

Keep generated lessons grounded in rural KwaZulu-Natal and the KwaXolo context.

- Students are 13-18, mostly isiZulu-speaking, and often complete tasks on shared devices.
- Students may have near-zero digital literacy.
- Do not assume stable internet at schools.
- Do not assume one student per computer.
- Do not require startup capital.
- Keep English simple, roughly Grade 8 level.
- Avoid business jargon and idiomatic English.
- Use named local references when useful: Msenti Entrepreneurship Hub, Victor Jaca, SEDA Port Shepstone, Dolly Dlezi, Caleb Phehlukwayo, Chief Inkosi Xolo, 1LT Bakery, Hlobisile Pearl Studios, Inkify, Capitec, MTN Mobile Money, FNB eWallet, WhatsApp.
- Student steps must require concrete action and include visible confirmation.
- Teacher output should support chalk-and-blackboard delivery, not projector-based teaching.

Full rules live in `agent-guide/`, especially:

- `agent-guide/00-overview/constraints.md`
- `agent-guide/00-overview/never-do-this.md`
- `agent-guide/01-system-prompt/system-prompt.md`
- `agent-guide/03-student-material/`
- `agent-guide/05-language-guide/`
- `agent-guide/08-quality-checklist/review-checklist.md`

## Design / UI Notes

The prototype is a local testing surface, not the final production app. The phone simulator and teacher plan renderer are intentionally dense because they are for lesson QA.

When working on UI:

- Preserve the two-column result view: teacher plan and phone-like student task.
- Preserve good/bad feedback saving.
- Preserve progress updates through `/progress/:id`.
- Use the real app screenshots/design references in `Example sites/` where available.
- Use logo cache behavior rather than hardcoding new remote image URLs.

## Git Hygiene

The worktree may contain user changes. Do not revert them unless explicitly asked.

Known generated/high-churn areas:

- `test-site/logs/raw/` is gitignored.
- `test-site/cache/web-search/` is persistent cache and may change when generation runs.
- `test-site/public/logos/` may gain files as logos are fetched.
- `Example sites/Markdown/<App>/` may gain generated app design references.

Before editing, check `git status --short`. Keep documentation updates separate from prototype behavior changes unless the user asks for both.
