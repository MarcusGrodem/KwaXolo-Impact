# Student Task Structure

Every student task is an **active exercise session** — not a reading list with a Next button. The student must correctly answer each step's exercise before advancing. This is the core mechanic: content teaches, the exercise confirms understanding, wrong answers are caught before moving on.

See `exercise-types.md` for the full spec on all 5 exercise types.

---

## Design principle: active before advancing

Every step has an **exercise type**. The student cannot tap Next without completing it correctly.

There is no passive reading step. If a step only explains something, it must end with a question that checks whether the student understood it.

The five exercise types:
- `tap_correct` — tap the right answer from 3–4 options
- `fill_blank` — type the correct word or phrase
- `arrange_steps` — tap shuffled tiles into the correct order
- `match_pairs` — connect terms to their meanings in two columns
- `do_and_confirm` — do something on the real phone, then answer a confirmation question

---

## The 5 sections

### 1. Task Title
Matches the lesson title exactly. Maximum 8 words. Plain English. No jargon.

---

### 2. What You Will Do
One sentence. Plain language. Active voice. Tells the student what they will have when they finish.

**Good:**
> You will set up a Gmail account and send your first professional email.

**Bad:**
> In this task, students will be introduced to the process of creating and using email.

Why bad: passive voice, no clear output, sounds like a school subject description.

---

### 3. Steps

3–5 steps. Each step is a teaching moment followed by an exercise.

**Step structure (agent JSON per step):**

```json
{
  "number": 1,
  "teach": "One to three sentences explaining what this step is about. What is on the screen. What the student is about to do.",
  "exerciseType": "tap_correct | fill_blank | arrange_steps | match_pairs | do_and_confirm",
  "question": "The question the student must answer to advance.",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option B",
  "acceptedAnswers": ["variant 1", "variant 2"],
  "feedbackCorrect": "Short affirmation — confirm what they just learned. 1 sentence.",
  "feedbackWrong": "Hint — tell them WHERE to look or what to try. Not the answer outright.",
  "tip": "Optional common-mistake warning. Empty string if not needed."
}
```

Notes:
- `options` is required for `tap_correct`, `match_pairs`, `do_and_confirm`
- `acceptedAnswers` is required for `fill_blank` (array of accepted strings, case-insensitive)
- `correctOrder` replaces `correctAnswer` for `arrange_steps`
- `pairs` replaces `options` for `match_pairs`
- `instruction` and `visibleResult` are added for `do_and_confirm`

See `exercise-types.md` for the full JSON schema per exercise type.

---

**Good step example (tap_correct):**
```json
{
  "number": 2,
  "teach": "When you find Gmail in the Play Store, you will see a blue button. This is how you get the app onto your phone.",
  "exerciseType": "tap_correct",
  "question": "Which button do you tap to get Gmail onto your phone?",
  "options": ["Open", "Update", "Install", "Share"],
  "correctAnswer": "Install",
  "feedbackCorrect": "Yes — Install downloads the app to your phone for free.",
  "feedbackWrong": "Look for the blue Install button. You will not see Open if the app is not on your phone yet.",
  "tip": "If you see Open instead of Install, Gmail is already on your phone — skip this step."
}
```

**Bad step (no exercise):**
```json
{
  "number": 2,
  "instruction": "Go ahead and install Gmail from the Play Store.",
  "targetLabel": "Install"
}
```

Why bad: no question, student just taps Next without proving they understood anything.

---

**Good step example (do_and_confirm):**
```json
{
  "number": 4,
  "teach": "Now you are going to write your first email. The compose window has three important fields: To, Subject, and the message body.",
  "exerciseType": "do_and_confirm",
  "instruction": "Open Gmail and tap the red pencil icon at the bottom right to start a new email. Look at the fields on screen.",
  "visibleResult": "You should see three blank fields: To, Subject, and a large white area for your message.",
  "question": "What is the field at the very top of the compose window called?",
  "options": ["From", "To", "Subject", "Body"],
  "correctAnswer": "To",
  "feedbackCorrect": "Correct — the To field is where you type the email address of the person you are writing to.",
  "feedbackWrong": "Open Gmail and tap the pencil button. Look at the very first field at the top of the screen.",
  "tip": ""
}
```

---

### 4. Think About This

One reflection question after the final step. The student types their answer in a text area. Cannot be answered with yes or no. Must connect the task to the student's own life.

**Good:**
> You now have a professional email. Write one real situation in your life — a job, a customer, or a school — where you might use this in the next few months.

**Bad:**
> Was this useful?

---

### 5. Time
Always state **10–15 minutes**. Do not use another time unless specifically instructed.

---

## Hearts and failure

Each task starts with 3 hearts (❤️❤️❤️).  
A wrong answer on any exercise except `match_pairs` costs 1 heart.  
Zero hearts = session ends, student restarts from step 1.

The agent does **not** control hearts logic — that is handled by the platform HTML. But the agent must write `feedbackWrong` text that helps the student recover without giving away the answer immediately.

---

## Display rules

- Steps are shown one at a time — the student completes the exercise to advance
- A progress bar shows completion percentage
- The student can tap **← Go back** to return to a previous step
- The reflection question appears after the final step
- Completion = green screen with confetti, hearts remaining displayed
- All text minimum 16px; headings minimum 22px
- Single column only on mobile — no side-by-side layout
- See `07-output-formats/student-html-spec.md` for the full HTML template
