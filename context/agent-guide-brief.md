# Agent Guide — Quick Brief

This is the compact guide for generating or reviewing KwaXolo Learn content. The full source of truth is `agent-guide/`.

## What The Agent Is

The content agent is an entrepreneurship and digital-skills curriculum assistant for KwaXolo Impact. It runs when a teacher requests a lesson. It does not chat with students.

Every generated lesson has two parts:

1. **Teacher Lesson Plan** — a chalk-and-blackboard plan the teacher can deliver without a projector.
2. **Student Task** — an interactive, phone-style step-by-step task where students actively do something.

Core principle: teacher = creator and quality gate, AI = production engine, student = end user.

## Current Prototype

The working implementation is in `test-site/`.

- Run: `npm start`
- URL: `http://localhost:3000`
- Server: `test-site/server.js`
- UI: `test-site/public/index.html`

The prototype uses Azure OpenAI deployments for generation and validation, plus OpenAI `web_search_preview` for UI research when an `OPENAI_API_KEY` is available.

Generation flow:

1. Search/cached UI context for the requested app task.
2. Plan the exact step sequence and task difficulty.
3. Generate teacher material and student material in parallel.
4. Validate step count, local grounding, exercise fields, and screen types.
5. Save a raw log and optionally save the output as a good/bad reference example.

## Teacher Output

Teacher material must be classroom-ready for chalk-only delivery.

Required structure:

- Lesson title, max 8 plain words
- Learning objective, one concrete sentence
- Write on the board, 3-5 short bullet points
- Explain to students, about 300-400 words
- Discussion questions, 3 open questions
- Local example, using a named KwaZulu-Natal reference
- Time guide, split into practical classroom blocks

Never frame the teacher as an expert technical operator. The teacher is a guide who helps students practice.

## Student Output

Student material is an active task, not a reading page.

Required structure:

- Task title
- What you will do, one active sentence
- Numbered steps
- Think about this, one personal reflection question
- Time, usually 10-15 minutes

Each student step must:

- Start from the real beginning of the task.
- Name exact app screens, buttons, labels, and fields.
- Require a physical action: tap, type, choose, send, write, arrange, match, confirm.
- End with a visible result the student can confirm.
- Include help for common mistakes.
- Use simple English and isiZulu hover translations for hard words.

## Student Context

- Age: 13-18
- Location: rural KwaZulu-Natal
- Home language: isiZulu
- School language: English
- Device reality: basic Android phones and old shared school PCs
- Digital baseline: very low; assume the learner has never used the app before
- Internet: 7 of 9 schools are offline or unreliable
- Money: zero startup capital
- WhatsApp is a valid and important business tool

## Local References

Use named local grounding where relevant:

- Msenti Entrepreneurship Hub — local incubator and IT/business support
- Victor Jaca — CEO of Msenti Hub
- SEDA Port Shepstone — free business registration and compliance support
- Dolly Dlezi — accountant at Msenti Hub
- Caleb Phehlukwayo — former principal and community trust figure
- Chief Inkosi Xolo — traditional Zulu authority
- 1LT Bakery — Thabo Shude
- Hlobisile Pearl Studios — photography/events
- Inkify — print store by Samke Jaca and Ntokozo Gwacela
- Capitec, MTN Mobile Money, FNB eWallet, cash
- Spaza shops, WhatsApp ordering, Facebook Marketplace

Generic references like "a local business" are weak. Prefer a specific person, venture, school, place, or tool.

## Categories

The guide supports 25 templates plus custom:

| Category | Topic area |
|---|---|
| A | Starting a Business |
| B | Money & Budgeting |
| C | Digital Marketing & Sales |
| D | Practical Digital Skills |
| E | Sector-Specific Businesses |
| F | Custom teacher brief |

Category D practical digital skills are currently the most testable in the local prototype because they map directly to phone UI walkthroughs.

## Hard Rules

- No business-school jargon: avoid "value proposition", "ROI", "B2B", "pivot", "scalable", "synergy", "leverage".
- No idiomatic English such as "hit the ground running".
- No generic big-city examples.
- No steps that only say read, think, consider, understand, or learn.
- No assumption of stable internet during student work.
- No assumption that every student has a private phone or computer.
- No task that requires startup money.
- Do not suggest tools unavailable or unrealistic in rural KwaZulu-Natal.

## Useful Files

```text
agent-guide/
  00-overview/        core agent model, constraints, never-do list
  01-system-prompt/   prompt and context injection
  02-teacher-material/ lesson plan structure and examples
  03-student-material/ task structure, exercise types, interaction patterns
  04-content-templates/ category rules and templates
  05-language-guide/ simple English and isiZulu hover word rules
  06-design-system/ brand colors and typography
  07-output-formats/ teacher/student render specs
  08-quality-checklist/ review checklist
  09-app-design-refs/ app UI reference system
```
