# KwaXolo Impact — Lovable Build Prompts

Complete prompts for building the MVP in Lovable. Use in order: System Prompt first, then Teacher View, then Student View.

---

## Brand Colors (from KwaXolo Identity)

| Role | Color | Hex |
|---|---|---|
| Primary (Orange) | Energetic, forward | `#F37021` |
| Secondary (Red) | Brand anchor | `#D62B2B` |
| Success (Green) | Growth, progress | `#2D8B3E` |
| Trust (Blue) | Stability | `#1B5EA7` |
| Dark | Text, headers | `#1A1A1A` |
| Light bg | Page background | `#F9F6F2` |
| White | Cards, inputs | `#FFFFFF` |

---

## 1. System Prompt (paste into Lovable API call)

Use this as the `system` message in every Claude/GPT API call from the platform.

```
You are an entrepreneurship curriculum assistant for KwaXolo Impact, a programme serving secondary school students in rural KwaZulu-Natal, South Africa.

CONTEXT ABOUT THE STUDENTS:
- Age: approximately 13–18 years old
- Location: rural KwaZulu-Natal, South Africa
- Language: English with isiZulu as home language — use simple, clear English
- Digital access: smartphone (WhatsApp, basic browsing), no personal computer
- Capital available to start a business: zero — assume no startup money
- Education level: secondary school, some have limited reading ability
- Motivation: high — many want to earn money and support their families

CONTEXT ABOUT THE LOCAL ECONOMY (KwaZulu-Natal):
- Youth unemployment exceeds 60%
- Strong culture of informal entrepreneurship — street selling, services, crafts
- Key growth sectors: IT Services (12.9%), E-Commerce (8.8%), Agri-Tech (7.6%), Food & Artisan (6.1%), Construction (5.2%)
- Most viable zero-capital business types: agricultural micro-trading, food preparation, artisan crafts, phone repair, hair services, local delivery, tutoring younger students
- Payment infrastructure: Capitec Bank (most accessible), FNB eWallet, cash — WhatsApp used for customer communication and basic marketing
- WhatsApp is the dominant communication and business tool — nearly universal among adults
- Internet available via school WiFi during school hours
- Electricity and connectivity are stable at schools (updated 2026)

CONTEXT ABOUT THE TEACHER:
- The teacher is a facilitator, not an entrepreneurship expert
- They teach using chalk and blackboard only — no projector or screen
- They are engaged and motivated but may not know business theory
- They need practical, jargon-free lesson content they can deliver confidently

YOUR JOB:
When a teacher submits a topic and context via the form, generate TWO outputs:

OUTPUT 1 — TEACHER LESSON PLAN (for blackboard delivery):
- Title of lesson
- Learning objective (one sentence, plain language)
- Key concepts to write on the blackboard (3–5 bullet points, short phrases only)
- Step-by-step explanation the teacher reads and explains aloud (plain language, no jargon, 300–400 words)
- 3 discussion questions to ask the class
- One real local example from KwaZulu-Natal context

OUTPUT 2 — STUDENT TASK (for mobile):
- Title matching the lesson
- One clear task the student completes on their phone
- Step-by-step instructions (maximum 5 steps, simple language)
- One reflection question the student answers in writing
- Estimated time to complete: 10–15 minutes

RULES:
- Never use business school jargon (no "value proposition", "ROI", "B2B", "pivot")
- Always ground examples in rural KwaZulu-Natal reality
- Assume students have zero capital — never suggest they need money to start
- Keep language at approximately Grade 8 reading level
- WhatsApp is always a valid business tool — encourage its use
- If the topic involves digital steps (sending email, setting up a profile), the student task must include exact step-by-step phone instructions
```

---

## 2. Teacher View — Lovable Prompt

Paste this into Lovable to build the teacher-facing interface.

```
Build a web application for teachers called "KwaXolo Entrepreneurship Platform — Teacher Dashboard".

DESIGN:
- Use the following brand colours exactly:
  - Primary orange: #F37021
  - Brand red: #D62B2B
  - Success green: #2D8B3E
  - Dark text: #1A1A1A
  - Page background: #F9F6F2
  - Cards and inputs: #FFFFFF
- Clean, minimal layout — the teacher uses this on a school PC
- Large readable fonts (minimum 16px body text)
- No complex animations — performance matters on old hardware
- Logo text: "KwaXolo Impact" in bold dark, "Entrepreneurship Platform" in orange below

PAGES AND FUNCTIONALITY:

PAGE 1 — LOGIN:
- Simple login with email and password
- "Teacher" role only on this view
- Orange "Log in" button

PAGE 2 — DASHBOARD:
- Welcome message: "Welcome back, [Teacher Name]"
- Two panels side by side:
  LEFT: "Generate New Lesson" — a button in orange that goes to the lesson generator form
  RIGHT: "Your Students" — a list of enrolled student names with a green dot (active) or grey dot (not started) next to each name, and their progress shown as a simple fraction (e.g. "2/3 lessons complete")
- Below: "Recent Lessons" — a list of previously generated lessons the teacher can re-open and re-use

PAGE 3 — LESSON GENERATOR FORM:
- Heading: "Create a New Lesson"
- The form asks the teacher four simple questions:
  1. "What do you want to teach today?" — a dropdown with these options:
     - How to identify a local business opportunity
     - Who is your customer?
     - Write your one-sentence business description
     - How to set a price for your product or service
     - How to use WhatsApp to find customers
     - How to keep track of your money
     - What is a business? Selling once vs. running a business
     - How to find suppliers locally
     - How to accept mobile payments from customers
     - What is competition and how do you stand out?
  2. "What are your students struggling with or asking about?" — a short text input (placeholder: "e.g. They don't understand why pricing matters")
  3. "How much time do you have for this lesson?" — dropdown: 20 minutes / 30 minutes / 45 minutes / 1 hour
  4. "Any other context about your class?" — optional short text input (placeholder: "e.g. Most students want to sell food or do hair")
- Large orange "Generate Lesson" button at the bottom

PAGE 4 — GENERATED LESSON VIEW:
- Split into two clear sections with tab navigation:
  TAB 1: "Your Lesson Plan" (for teacher, blackboard delivery)
  TAB 2: "Student Task" (what gets pushed to students' phones)
- TAB 1 displays:
  - Lesson title (large, bold)
  - Learning objective (italic, smaller)
  - "Write on the board:" section — a styled list of blackboard key points in a dark bordered box
  - "Explain to students:" section — the step-by-step explanation in readable paragraphs
  - "Discussion questions:" section — numbered list
  - "Local example:" section — highlighted in a light green box
- TAB 2 displays:
  - Student task title
  - Task instructions as a numbered checklist
  - Reflection question in a highlighted orange box
  - Estimated time shown as a badge
- At the bottom of the page: a large green button "Push to All Students"
- Clicking "Push to All Students" sends the student task to all enrolled students and shows a confirmation: "Lesson pushed to [X] students ✓"
- Also show a "Print Lesson Plan" button that formats TAB 1 for printing

PAGE 5 — STUDENT MANAGEMENT:
- Simple table: student name, date enrolled, lessons completed, last active
- Button: "Add Student" — opens a modal with name and a generated student code they use to log in
- Button: "Remove Student"

API INTEGRATION:
- When the teacher clicks "Generate Lesson", make a POST request to the Claude API (claude-sonnet-4-6) with:
  - The system prompt from the platform's backend configuration
  - A user message that combines the four form inputs into a structured request
  - Parse the response and display OUTPUT 1 in TAB 1 and OUTPUT 2 in TAB 2
- Store generated lessons in Supabase so teachers can retrieve them later
- When "Push to All Students" is clicked, write the student task to a Supabase table linked to the classroom

Use React with Tailwind CSS. Use Supabase for auth and database.
```

---

## 3. Student View — Lovable Prompt

Paste this into Lovable to build the student-facing mobile interface.

```
Build a mobile-first web application for students called "KwaXolo — Build Your Business".

DESIGN:
- Mobile-first — optimised for a 375px wide phone screen
- Use the following brand colours exactly:
  - Primary orange: #F37021
  - Brand red: #D62B2B
  - Success green: #2D8B3E
  - Dark text: #1A1A1A
  - Page background: #F9F6F2
  - Cards: #FFFFFF
- Large touch targets — minimum 48px button height
- Maximum 2 columns at any point — single column preferred
- Simple bottom navigation bar with 3 icons: Home / My Tasks / My Business
- No complex animations
- All text minimum 16px, headings minimum 22px
- Encouraging tone throughout — this is for first-time learners

PAGES AND FUNCTIONALITY:

PAGE 1 — WELCOME / LOGIN:
- Large logo: "KwaXolo" in bold, "Build Your Business" in orange below
- "Enter your student code" — a large input field
- "Start Learning" button in orange
- No password needed — student code is enough for MVP

PAGE 2 — HOME:
- Greeting: "Hello, [Name]! 👋" — warm, personal
- Progress bar showing overall lessons completed (e.g. "2 of 3 lessons done")
- Current active task card — large, orange border, showing:
  - Task title
  - Estimated time (e.g. "~12 minutes")
  - "Start Task" button in orange
- Below: "Completed Tasks" — greyed out cards with a green checkmark

PAGE 3 — TASK VIEW:
- Task title at the top (large, bold)
- Step-by-step instructions displayed ONE STEP AT A TIME:
  - Large card showing the current step number and instruction
  - "Done — Next Step" button in orange at the bottom
  - Progress indicator: "Step 2 of 5"
- After the last step: a reflection question appears
  - Displayed in an orange box: "Think about this:"
  - Large text input below: "Write your answer here..."
  - "Submit" button in green
- On submit: celebration screen — green background, "Great work! ✓", summary of what they completed

PAGE 4 — MY BUSINESS:
- This page builds up over time as students complete tasks
- Shows a simple "Business Profile" card that fills in as they progress:
  - Name of their business idea (from Task 1)
  - Their customer description (from Task 2)
  - Their one-sentence business description (from Task 3)
- Each field shows "Complete Lesson [X] to unlock" until filled
- A "Share on WhatsApp" button at the bottom that generates a simple text summary of their business idea formatted for WhatsApp

PAGE 5 — COMPLETED TASK SUMMARY:
- After each task, show a simple summary:
  - What they learned (2–3 bullet points)
  - Their reflection answer
  - "Next up:" showing the title of the next lesson
  - "Back to Home" button

API INTEGRATION:
- On login with student code, fetch the student's profile and task list from Supabase
- Poll for new tasks every 60 seconds (teacher may push a task while student is logged in)
- When student submits a reflection, write it to Supabase
- The "Share on WhatsApp" button uses the WhatsApp URL scheme: https://wa.me/?text=[encoded message]

Use React with Tailwind CSS. Use Supabase for auth and database. This must work well on a basic Android smartphone browser — no heavy dependencies.
```

---

## 4. Supabase Schema (for reference)

Tell Lovable to create these tables:

```
teachers: id, email, name, school_name, created_at
students: id, student_code, name, teacher_id, created_at
lessons: id, teacher_id, topic, teacher_inputs, lesson_plan_json, student_task_json, created_at
student_progress: id, student_id, lesson_id, steps_completed, reflection_answer, completed_at
```

---

## 5. User Message Template (how the teacher's form inputs become an API request)

When the teacher submits the form, construct this message to send to the LLM:

```
Topic: [dropdown selection]
Student struggles or questions: [teacher's text input]
Available time: [dropdown selection]
Class context: [optional text input]

Please generate the lesson plan and student task for this topic, formatted exactly as instructed. Make all examples relevant to rural KwaZulu-Natal. Assume students have no startup capital.
```

---

## Build Order

1. Set up Supabase project with the schema above
2. Build Teacher View first — test the full form → LLM → output flow
3. Build Student View — connect to same Supabase project
4. Test end-to-end: teacher generates lesson → pushes to students → student completes task → progress appears on teacher dashboard
