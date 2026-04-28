# KwaXolo Learn — Agent Content Guide

This folder is the complete guide for the AI agent that generates course content for the KwaXolo Learn platform.

---

## What the agent does

The agent takes a teacher's simple form input and produces **two outputs per lesson**:

1. **Teacher Lesson Plan** — a blackboard-ready PDF/HTML document the teacher delivers with chalk only
2. **Student Task** — an interactive HTML module students complete on their phone or PC

The agent does not interact with students. It is invisible infrastructure. Students see guided tasks; teachers see lesson plans. The LLM bridges the gap between a teacher's plain-language input and structured, pedagogically sound content.

---

## Who is this guide for

- Developers implementing the AI agent
- Anyone writing or updating the system prompt
- Designers building the HTML output templates
- Teachers or admins reviewing quality standards

---

## Current implementation status (2026-04-23)

A working local prototype lives at `test-site/`. Run `npm start` from the project root, then open http://localhost:3000.

**Tech stack:**
- Generation: Azure OpenAI deployments for student tasks and teacher plans
- Web search: OpenAI `web_search_preview`, cached under `test-site/cache/web-search/`
- Validation: Azure OpenAI validator deployment for step count, grounding, exercise fields, and screen types
- Frontend: Vanilla HTML/JS with 20 per-step phone screen builders

**Pipeline per lesson:**
1. Search or load cached UI context for the requested app task
2. Plan a 10-13 step sequence, with a hard cap of 13 steps
3. Generate teacher material and student material in parallel
4. Validate step count, local grounding, exercise fields, and screen types
5. Render the teacher plan, phone simulator, raw log, and good/bad example capture

**Key implementation guide:** `HOW_TO_BUILD_AGENTS.md`

---

## How to use this guide

| You want to... | Go to... |
|---|---|
| Run the prototype | `../test-site/` → `npm start` |
| Read the full implementation guide | `HOW_TO_BUILD_AGENTS.md` |
| Understand the full agent model | `00-overview/what-the-agent-does.md` |
| See what the agent must NEVER do + bad examples | `00-overview/never-do-this.md` |
| Get the ready-to-paste system prompt | `01-system-prompt/system-prompt.md` |
| Understand how teacher PDFs are structured | `02-teacher-material/` |
| Understand how student tasks are structured | `03-student-material/` |
| See the 4 interaction patterns + app step templates | `03-student-material/interaction-patterns.md` |
| See the 5 Duolingo-style exercise types (full spec) | `03-student-material/exercise-types.md` |
| See the 25 module templates (A–F) | `04-content-templates/` |
| Apply language rules (English + isiZulu) | `05-language-guide/` |
| Use brand colors and typography | `06-design-system/` |
| Get the HTML/PDF output templates | `07-output-formats/` |
| Agent pre-output checklist + teacher review checklist | `08-quality-checklist/review-checklist.md` |

---

## Core principle

> The teacher is the creator and quality gate. The AI is the production engine. The student is the end user.

The agent targets 80% finished content. The teacher applies the final 20%: local context, isiZulu quality check, and personal knowledge of the class.

---

## Quick reference — brand colors

| Name | Hex |
|---|---|
| Primary Orange | `#F37021` |
| Brand Red | `#D62B2B` |
| Success Green | `#2D8B3E` |
| Trust Blue | `#1B5EA7` |
| Dark Text | `#1A1A1A` |
| Light Background | `#F9F6F2` |
| White (cards) | `#FFFFFF` |
