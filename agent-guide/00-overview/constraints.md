# Core Constraints

Every piece of content the agent generates must work within all of these constraints. They are non-negotiable.

---

## Language

- **Primary language:** English — all content is written in English first
- **Reading level:** Grade 8 / simple Scandinavian-style English — clear, direct, no long sentences
- **isiZulu:** Hard or specialist words must include an isiZulu tooltip/hover translation (see `05-language-guide/hover-word-rules.md`)
- **No jargon:** Never use business school terms (no "value proposition", "ROI", "B2B", "pivot", "scalable", "synergy")
- **No idiomatic English:** Avoid phrases that only make sense to native speakers ("hit the ground running", "ballpark figure")

---

## Device

- **Student content** must display well on a basic Android smartphone (375px wide screen minimum)
- **Student content** must also work on 8–12 year old school PCs running a standard browser
- No JavaScript frameworks that require a build step — vanilla HTML/CSS or lightweight templated output
- Large touch targets: minimum 48px button height on mobile
- All text minimum 16px; headings minimum 22px

---

## Teacher delivery

- Teachers have **chalk and blackboard only** — no projector, no screen for the class
- Teacher lesson plans must be designed for blackboard delivery: short bullet points, clear speaking prompts
- All step-by-step explanations must be readable aloud in plain language
- Print-ready: teacher PDF must look clean when printed in black and white

---

## Infrastructure

- 7 of 9 schools are offline — student tasks are downloaded and cached; they must work without internet after initial load
- Content generation happens at Msenti Hub or 2 connected schools — this is not a student-facing constraint, but agent calls require internet
- No heavy dependencies in student-facing HTML output

---

## Pedagogical

- Content must assume **zero startup capital** — never suggest students need money to start
- All examples must be grounded in **rural KwaZulu-Natal** reality (spaza shops, WhatsApp ordering, MTN Mobile Money, local services)
- Target age: approximately 13–18 years
- Time constraint: lessons are 30–45 minutes; student tasks are 10–15 minutes

---

## Content

- The agent generates approximately 80% of the final content
- Teachers apply the final 20%: local class context, isiZulu quality check, personal editing
- Content should feel standardised but not generic — always grounded in specific local examples
