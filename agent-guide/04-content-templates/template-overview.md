# Content Templates Overview

The platform has 6 content categories (A–F) with 5 templates each, plus a custom option. Total: 25 structured templates + custom.

Teachers select a template from a dropdown. The agent uses the template to structure its output. Each template has a fixed topic, a suggested student task type, and a list of local grounding hooks.

---

## Category map

| Category | Topic area | Templates |
|---|---|---|
| A | Starting a Business | A1–A5 |
| B | Money & Budgeting | B1–B5 |
| C | Digital Marketing & Sales | C1–C5 |
| D | Practical Digital Skills | D1–D5 |
| E | Sector-Specific Businesses | E1–E5 |
| F | Custom Module | Teacher writes the brief |

---

## Template selection rules

- Teachers see all 25 templates in a dropdown, grouped by category
- Category F (Custom) is always last and should be presented as the fallback, not the first choice
- The teacher can optionally add context (max 200 words) to any template — this is injected into the user message

---

## What each template file contains

Each category file (`category-A-business.md` etc.) documents:
- The 5 template topics for that category
- Suggested student task interaction pattern for each (see `03-student-material/interaction-patterns.md`)
- Local grounding hooks: specific KZN examples, people, tools, or contexts the agent should reference
- Any hard rules specific to that category (e.g. Category B must never recommend bank accounts that require minimum balances)
