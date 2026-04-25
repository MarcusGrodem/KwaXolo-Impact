# Category F — Custom Module

Category F is the escape hatch. A teacher writes a 1–3 sentence description of what they need, and the agent generates a full module to match.

---

## When to use Category F

Category F should be presented last in the dropdown — it is a fallback, not a first choice. Teachers should browse A–E first. Use F when:

- The topic the teacher wants is not covered by any A–E template
- The teacher wants to combine two topics in a way no template supports
- The teacher has a specific local event or opportunity they want to build a lesson around (e.g. an upcoming market day, a visit from a business mentor, a recent news event)

---

## Teacher input for Category F

The form shows a single text area with the prompt:

> "Describe what you want to teach in 1–3 sentences. Be as specific as you can about the topic and what you want students to learn or do."
> 
> *Example: "I want students to understand how to price a service, not a product. Most of my students want to offer hair services or tutoring. I want them to calculate a fair price for their own time."*

Maximum input: 200 words.

---

## How the agent handles Category F

When the category is F (Custom), the agent:

1. Reads the teacher's description carefully
2. Identifies the closest match to an existing template structure (A–E) and uses that structure as a scaffold
3. Generates content specific to the teacher's described topic
4. Applies all standard rules: zero capital, KZN grounding, Grade 8 English, interaction-based student task

The agent must not ignore the teacher's description and generate something generic. If the description is too vague, the agent should note at the top of the lesson plan: *"This lesson is based on your brief: [quote teacher's words]. If this is not what you intended, add more detail and regenerate."*

---

## Quality note for F modules

Because F modules are fully open-ended, the teacher review step is especially important. The teacher should check:
- That the lesson actually matches what they asked for
- That the local example is relevant to their specific class context
- That the student task is genuinely doable with the equipment and time available

The 80% draft quality standard still applies — but the teacher may need to do more than 20% editing for highly specific topics.
