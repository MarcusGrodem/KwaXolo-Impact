# Context Injection

This file documents what local context is injected into the system prompt and how to update it.

---

## What context injection is

The system prompt includes a LOCAL PEOPLE AND ORGANISATIONS block. This grounds the agent in real KwaZulu-Natal people and places. When the agent generates a local example, it can name Msenti Hub, SEDA, or a real existing venture rather than making something generic up.

This context should be updated when:
- New local ventures or community leaders become relevant
- Msenti Hub expands services
- New organisations partner with KwaXolo

---

## Current injected context

| Entity | Type | Relevance |
|---|---|---|
| Msenti Entrepreneurship Hub (Victor Jaca) | Incubator | Business registration, mentorship, IT support |
| SEDA Port Shepstone | Government agency | Free business registration, compliance |
| Dolly Dlezi | Individual (accountant) | Bookkeeping, financial setup |
| Caleb Phehlukwayo | Individual (community leader) | Trust, school committee |
| Chief Inkosi Xolo | Traditional authority | Local governance |
| Hlobisile Pearl Studios | Existing venture | Photography/events example |
| 1LT Bakery (Thabo Shude) | Existing venture | Food business example |
| Inkify (Samke Jaca & Ntokozo Gwacela) | Existing venture | Printing/services example |

---

## User message template

When the teacher submits the form, construct the user message as follows:

```
Topic: [dropdown selection]
Student struggles or questions: [teacher's text input — can be blank]
Available time: [dropdown: 20 min / 30 min / 45 min / 1 hour]
Class context: [optional free text — max 200 words]

Please generate the lesson plan and student task for this topic, formatted exactly as instructed in the system prompt. Make all examples relevant to rural KwaZulu-Natal. Assume students have zero startup capital.
```

---

## How to update local context

1. Add the new entity to the system prompt's LOCAL PEOPLE AND ORGANISATIONS section
2. Update the table above
3. Note the date of the change in a comment in this file

Last updated: 2026-04-22
