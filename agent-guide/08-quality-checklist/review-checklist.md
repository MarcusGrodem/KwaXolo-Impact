# Quality Checklist

There are two checklists here: one the **agent runs silently before output**, and one the **teacher runs before publishing**.

---

## Agent pre-output checklist

The agent must silently check every item before returning its response. If any item fails, correct it first.

```
TEACHER LESSON PLAN
[ ] Both Output 1 and Output 2 are present
[ ] Lesson title is under 8 words, plain English, no jargon
[ ] Learning objective is one sentence starting with "After this lesson..."
[ ] Board points are 3–5, max 6 words each
[ ] Explanation is 300–400 words, readable aloud, no jargon
[ ] Exactly 3 open discussion questions (no yes/no answers)
[ ] One named, specific KZN local example included
[ ] Time guide fits within 30–45 minutes

STUDENT TASK
[ ] Task title matches or mirrors the lesson title
[ ] "What You Will Do" is one active-voice sentence
[ ] Steps start with action verbs (Open, Type, Write, Tap, Send, etc.)
[ ] Every step requires a physical action
[ ] Every step ends with a visible, confirmable result
[ ] App names and button names are exact (as they appear in the real app)
[ ] Task is possible with zero startup money
[ ] Task is possible on a basic Android phone or old PC
[ ] No step requires live internet without a fallback alternative
[ ] isiZulu hover tags on all core vocabulary words
[ ] Reflection question is personal and cannot be answered yes/no
[ ] Task time is stated as 10–15 minutes

LANGUAGE AND CONTEXT
[ ] No banned jargon words (see english-standard.md)
[ ] No idioms
[ ] All examples grounded in rural KwaZulu-Natal
[ ] No assumption that students have money or internet
```

---

## Teacher review checklist

Before a teacher publishes a generated lesson, they review it against this checklist. The platform should surface these as a simple checklist the teacher ticks before clicking Publish.

The agent targets 80% completion. The teacher's review is the final 20%.

### Teacher lesson plan

- [ ] The learning objective is one sentence and makes sense
- [ ] The board points are short enough to write quickly (max 6 words each)
- [ ] The explanation uses simple language I can read aloud confidently
- [ ] The local example is real and specific to our community
- [ ] The discussion questions will start a real conversation in my class
- [ ] There are no words I do not understand or cannot explain
- [ ] The time guide fits my available class time

### Student task

- [ ] The task title matches the lesson I just reviewed
- [ ] The "What You Will Do" sentence is clear and motivating
- [ ] Each step asks the student to do something real (not just read)
- [ ] The steps are in the right order — each one builds on the previous
- [ ] Step instructions are specific enough that a student could follow them alone
- [ ] Any app names and button names are correct (I have checked on my own phone)
- [ ] The reflection question cannot be answered with yes or no
- [ ] The reflection question connects to the student's real life

### Language (both outputs)

- [ ] No business school jargon (value proposition, ROI, B2B, pivot, etc.)
- [ ] No idioms that would confuse a non-native English speaker
- [ ] The isiZulu hover translations look correct (I speak isiZulu — these are my responsibility)
- [ ] Hard words are marked for hover translation where needed
- [ ] Sentence length feels manageable — not too long

### Local context

- [ ] Examples reference real people, places, or businesses from our community when relevant
- [ ] No assumption that students have money to start
- [ ] WhatsApp is treated as a valid business tool (not dismissed)
- [ ] No steps that require a projector or screen in the classroom

---

## What to do if something is wrong

The teacher edits directly in the lesson editor before publishing. Common edits:
- Swap a generic example for a local one you know
- Correct an isiZulu translation
- Shorten an explanation paragraph
- Rewrite a step that assumes too much prior knowledge

If the generated content is fundamentally wrong for the topic, the teacher can regenerate — but should add more context in the form first.
