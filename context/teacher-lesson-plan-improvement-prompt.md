# Teacher Lesson Plan Improvement Context & Prompt

Use this file when asking an AI agent or developer to improve the teacher lesson plan experience in the KwaXolo Learn webapp.

## Webapp Context

KwaXolo Learn is a local prototype for the KwaXolo Impact Challenge. It helps teachers in rural KwaZulu-Natal generate practical digital-skills and entrepreneurship lessons for secondary school students.

The current webapp is not a full production platform. It is a local testing and quality-assurance surface for the content-generation agent.

Run it with:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Main files:

- `test-site/server.js` — Express server, AI orchestration, validation, logging, and API routes.
- `test-site/public/index.html` — single-page UI for generating, viewing, and rating lessons.
- `agent-guide/` — source-of-truth rules for lesson content.
- `agent-guide/examples/good/` — saved high-quality generated examples.
- `agent-guide/examples/bad/` — saved weak generated examples.
- `context/agent-guide-brief.md` — compact agent behavior summary.
- `context/KwaXolo_Impact_Case.md` — project/product context.

## What The Webapp Does Today

The teacher enters:

- Lesson topic
- What students struggle with
- Available class time
- Local classroom/community context

The server then:

1. Searches or loads cached UI context for the requested app/task.
2. Plans the full student step sequence and task difficulty.
3. Generates teacher material and student material in parallel.
4. Validates step count, local grounding, exercise fields, and screen types.
5. Returns one combined lesson object to the browser.

The UI renders two main outputs:

1. **Teacher lesson plan** — a printable classroom plan.
2. **Student phone task** — an interactive phone-style walkthrough.

The user can mark an output as good or bad. These saved examples become future prompt/reference data.

## Current Teacher Lesson Plan Shape

The teacher plan is generated in `generateTeacherMaterial()` inside `test-site/server.js`.

Current JSON shape:

```json
{
  "teacherTitle": "Plain-language title, max 8 words, no jargon",
  "teacherObjective": "After this lesson, you will be able to...",
  "teacherBoardPoints": [
    "Point 1",
    "Point 2",
    "Point 3"
  ],
  "teacherExplanation": "Three paragraph explanation",
  "teacherDiscussionQuestions": [
    "Open question 1?",
    "Open question 2?",
    "Open question 3?"
  ],
  "teacherLocalExample": "Named KZN example",
  "teacherTimeGuide": [
    "5 min: write board points",
    "15 min: teacher explains"
  ]
}
```

The plan is converted to HTML by `buildTeacherHTML()` in `test-site/server.js` and styled/rendered in `test-site/public/index.html`.

## Target Users

Teachers:

- Around 224 teachers across 9 secondary schools.
- Basic browser, email, and typing ability is assumed, but advanced digital confidence is not.
- Many lessons happen without projectors or classroom screens.
- Teachers may only have chalk and blackboard.
- Teachers should not be framed as technical experts.
- The teacher is a guide, facilitator, and quality gate.

Students:

- Age 13-18.
- Rural KwaZulu-Natal.
- Home language is mostly isiZulu.
- English is the school language.
- Digital literacy is very low.
- Many students share old school PCs.
- Some use basic Android phones.
- Internet access is unreliable or absent in 7 of 9 schools.
- Startup capital should be assumed to be zero.

## Problem To Solve

The current teacher lesson plan is useful but can be improved. It should feel more like something a real teacher can confidently use in a low-resource classroom.

Improve the plan so it is:

- Easier to teach from directly.
- More specific about what the teacher says and does.
- Better aligned with chalk-and-blackboard teaching.
- More supportive for teachers who are not subject-matter experts.
- More locally grounded in KwaZulu-Natal.
- Better connected to the student phone/PC task.
- More practical for 30-45 minute sessions.
- More reusable as a printed handout.

## Non-Negotiable Constraints

- Do not assume a projector.
- Do not assume each student has a device.
- Do not assume stable internet.
- Do not require paid software.
- Do not require startup money.
- Do not use business-school jargon.
- Do not use idiomatic English that non-native speakers may misunderstand.
- Do not make the teacher plan too long to use in class.
- Do not make the teacher sound like an expert lecturer.
- Keep the teacher as a practical guide.
- Keep the language simple.
- Ground examples in rural KwaZulu-Natal.
- Use named local references where relevant.

Useful local references:

- Msenti Entrepreneurship Hub
- Victor Jaca
- SEDA Port Shepstone
- Dolly Dlezi
- Caleb Phehlukwayo
- Chief Inkosi Xolo
- 1LT Bakery
- Hlobisile Pearl Studios
- Inkify
- Capitec
- MTN Mobile Money
- FNB eWallet
- WhatsApp
- Spaza shops
- Facebook Marketplace

## Desired Improvement Direction

Improve both content and presentation of the teacher lesson plan.

The plan should include:

- A plain lesson title.
- A clear objective.
- Teacher preparation checklist.
- Blackboard layout.
- Exact board text.
- Short teacher script.
- Key vocabulary with simple explanations.
- Local example.
- Facilitation instructions.
- Pair/group activity instructions.
- Link to the student task.
- Common student mistakes.
- What to do if there are too few devices.
- What to do if the internet is unavailable.
- Quick assessment/check-for-understanding.
- Wrap-up question.
- Optional extension for faster groups.

The output should still be concise enough to print and use.

## Suggested New Teacher Plan Schema

Consider replacing or extending the current teacher JSON shape with something like:

```json
{
  "teacherTitle": "Plain-language title, max 8 words",
  "teacherObjective": "By the end of this lesson, students can...",
  "teacherPrep": [
    "Check that...",
    "Write...",
    "Prepare..."
  ],
  "teacherBoardLayout": {
    "title": "Board title",
    "leftColumn": [
      "Key word: simple meaning",
      "Key word: simple meaning"
    ],
    "rightColumn": [
      "Step 1...",
      "Step 2..."
    ],
    "bottomLine": "Question or reminder"
  },
  "teacherScript": [
    {
      "section": "Open",
      "minutes": 5,
      "say": "Short script the teacher can read or adapt.",
      "do": "What the teacher does physically."
    },
    {
      "section": "Explain",
      "minutes": 10,
      "say": "Simple explanation with local example.",
      "do": "Point to board / ask students / write example."
    },
    {
      "section": "Practice",
      "minutes": 15,
      "say": "Set up the student task.",
      "do": "Group students and monitor."
    },
    {
      "section": "Check",
      "minutes": 5,
      "say": "Ask quick check questions.",
      "do": "Listen for misconceptions."
    }
  ],
  "teacherLocalExample": "Specific KwaZulu-Natal example.",
  "teacherVocabulary": [
    {
      "word": "profit",
      "simpleMeaning": "money left after costs",
      "isiZuluSupport": "inzuzo"
    }
  ],
  "teacherDiscussionQuestions": [
    "Open question connected to student life?",
    "Open question connected to local business?",
    "Open question connected to the student task?"
  ],
  "teacherDevicePlan": {
    "ifEnoughDevices": "How to run the activity.",
    "ifSharedDevices": "How groups should rotate roles.",
    "ifNoInternet": "Offline fallback."
  },
  "teacherCommonMistakes": [
    {
      "mistake": "What students may do wrong.",
      "teacherResponse": "How the teacher should help."
    }
  ],
  "teacherAssessment": [
    "One thing students must show",
    "One question students must answer",
    "One visible result to check"
  ],
  "teacherTimeGuide": [
    "5 min: opening and board",
    "10 min: explanation",
    "15 min: student task",
    "5 min: check and wrap-up"
  ],
  "teacherExtension": "Optional task for faster groups."
}
```

## Comprehensive Prompt

Paste the prompt below into an AI coding agent when you want it to improve the teacher lesson plan.

```text
You are working in the KwaXolo Learn repository.

Goal:
Improve the teacher lesson plan output in the local webapp so a rural KwaZulu-Natal teacher can use it directly in a chalk-and-blackboard classroom.

Repository context:
- The local prototype lives in test-site/.
- Run with npm start and open http://localhost:3000.
- Main server file: test-site/server.js.
- Main browser UI: test-site/public/index.html.
- The agent guide lives in agent-guide/.
- Compact context lives in context/.

Current behavior:
- A teacher enters a topic, student struggles, class time, and local context.
- The server searches/plans/generates/validates a combined lesson.
- Teacher material is generated in generateTeacherMaterial() in test-site/server.js.
- Student material is generated separately.
- The teacher plan is rendered as HTML through buildTeacherHTML().
- The UI displays the teacher plan next to a phone-style student task.
- Good/bad outputs can be saved into agent-guide/examples/.

Problem:
The teacher lesson plan is currently too basic. It has title, objective, board points, explanation, discussion questions, local example, and time guide. Improve it into a practical classroom plan that better supports teachers with limited digital confidence and limited classroom technology.

Target teacher:
- Rural KwaZulu-Natal secondary school teacher.
- Basic browser/email/typing ability, not a digital expert.
- May have no projector or screen for the class.
- May teach with chalk and blackboard only.
- May have students sharing old PCs or basic Android phones.
- Needs a plan that can be followed in class without extra preparation.

Target students:
- Age 13-18.
- Mostly isiZulu-speaking.
- English is school language.
- Very low digital literacy.
- Often share devices.
- Internet may be unreliable or unavailable.
- Zero startup capital.

Requirements:
1. Inspect the current code before editing.
2. Update the teacher generation prompt/schema in test-site/server.js.
3. Update buildTeacherHTML() so the richer teacher plan renders cleanly.
4. Update test-site/public/index.html styles if needed so the teacher plan is readable, printable, and not visually cluttered.
5. Preserve the existing student task generation and phone simulator unless a small compatibility change is required.
6. Preserve progress updates, raw logs, and good/bad example saving.
7. Keep JSON parsing reliable. Use a strict schema and handle missing optional fields gracefully.
8. Do not print or expose .env values.
9. Do not remove existing validations.
10. Keep the output useful for 30-45 minute classes.

The improved teacher plan should include:
- Plain title.
- Lesson objective.
- Teacher preparation checklist.
- Blackboard layout.
- Exact board text.
- Short teacher script split by lesson phase.
- Key vocabulary with simple meanings and optional isiZulu support.
- Local KwaZulu-Natal example using named references where relevant.
- Practical facilitation instructions.
- Device plan for enough devices, shared devices, and no internet.
- Connection to the student task.
- Common student mistakes and teacher responses.
- Quick assessment/check-for-understanding.
- Wrap-up question.
- Optional extension for faster groups.
- Time guide.

Content constraints:
- Keep English simple, roughly Grade 8 level.
- Avoid business jargon and idiomatic English.
- Do not assume a projector.
- Do not assume stable internet.
- Do not assume one student per device.
- Do not require paid software.
- Do not require startup money.
- Do not make the teacher sound like an expert lecturer.
- Ground examples in rural KwaZulu-Natal.
- Use named local references where useful: Msenti Entrepreneurship Hub, Victor Jaca, SEDA Port Shepstone, Dolly Dlezi, Caleb Phehlukwayo, Chief Inkosi Xolo, 1LT Bakery, Hlobisile Pearl Studios, Inkify, Capitec, MTN Mobile Money, FNB eWallet, WhatsApp, spaza shops, Facebook Marketplace.

Suggested JSON shape:
{
  "teacherTitle": "...",
  "teacherObjective": "...",
  "teacherPrep": ["..."],
  "teacherBoardLayout": {
    "title": "...",
    "leftColumn": ["..."],
    "rightColumn": ["..."],
    "bottomLine": "..."
  },
  "teacherScript": [
    {
      "section": "Open",
      "minutes": 5,
      "say": "...",
      "do": "..."
    }
  ],
  "teacherLocalExample": "...",
  "teacherVocabulary": [
    {
      "word": "...",
      "simpleMeaning": "...",
      "isiZuluSupport": "..."
    }
  ],
  "teacherDiscussionQuestions": ["..."],
  "teacherDevicePlan": {
    "ifEnoughDevices": "...",
    "ifSharedDevices": "...",
    "ifNoInternet": "..."
  },
  "teacherCommonMistakes": [
    {
      "mistake": "...",
      "teacherResponse": "..."
    }
  ],
  "teacherAssessment": ["..."],
  "teacherTimeGuide": ["..."],
  "teacherExtension": "..."
}

Implementation guidance:
- Keep backward compatibility in buildTeacherHTML() for older logs/examples that only have the old teacher fields.
- Prefer small helper functions for escaping/rendering repeated list sections.
- Keep the printed plan compact and scannable.
- Avoid adding a new framework.
- Do not refactor unrelated student UI code.
- After editing, run npm start if possible and generate or inspect at least one lesson.
- If API keys are unavailable, verify by checking rendering against a mocked lesson object or existing saved example.

Definition of done:
- The teacher generation prompt asks for the richer plan.
- The server accepts and logs the richer teacher JSON.
- The browser renders the richer teacher plan clearly.
- Existing generation flow still works.
- Existing good/bad save flow still works.
- The plan remains printable and practical for chalk-and-blackboard teaching.
- The final answer lists changed files and any verification performed.
```
