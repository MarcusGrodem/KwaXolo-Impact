# Exercise Types

Every student task step is an **exercise** — not just a text block with a Next button. The student must actively answer correctly before advancing. This is the core Duolingo-style mechanic: the content teaches, the exercise confirms understanding, and wrong answers are caught before the student moves on.

---

## The 5 exercise types

### Type 1 — tap_correct (Multiple choice)

**What the student sees:** A question and 3–4 large answer buttons.  
**What they must do:** Tap the correct answer.  
**If correct:** Button flashes green, short chime, advances automatically after 1 second.  
**If wrong:** Button flashes red, screen shakes, correct answer is revealed briefly, then re-presented.

**Best for:** Checking knowledge of button names, screen names, app features, vocabulary, or "what comes next" in a process.

**Example:**
```
Question: "You want to install WhatsApp from the Play Store. Which button do you tap?"
Options:
  A) Share
  B) Install  ← correct
  C) Open
  D) Update
```

**Agent JSON:**
```json
{
  "exerciseType": "tap_correct",
  "question": "You want to install WhatsApp from the Play Store. Which button do you tap?",
  "options": ["Share", "Install", "Open", "Update"],
  "correctAnswer": "Install",
  "feedbackCorrect": "Yes — the Install button downloads the app to your phone.",
  "feedbackWrong": "Not quite. Look for the blue Install button on the app page."
}
```

---

### Type 2 — fill_blank (Type the answer)

**What the student sees:** A sentence with a blank or a short "what would you type?" prompt. A text input field.  
**What they must do:** Type the correct word or phrase.  
**If correct:** Field turns green, advances.  
**If wrong:** Field shakes red, hint shown, student tries again.  
**Matching rules:** Case-insensitive, trim whitespace. Accept 1–2 accepted variants (list in `acceptedAnswers`).

**Best for:** Button labels, screen names, exact app text, email addresses, passwords (structure, not value).

**Example:**
```
Question: "When writing an email, the line that tells the reader what the email is about is called the ___"
Answer: "subject" (also accept: "subject line")
```

**Agent JSON:**
```json
{
  "exerciseType": "fill_blank",
  "question": "When writing an email, the line that tells the reader what it is about is called the ___",
  "acceptedAnswers": ["subject", "subject line"],
  "feedbackCorrect": "Correct — the subject line tells the reader what to expect before they open it.",
  "feedbackWrong": "Look at the field at the top of the compose window. It says 'Subject'."
}
```

---

### Type 3 — arrange_steps (Put in order)

**What the student sees:** 3–5 shuffled step tiles. A "Check order" button.  
**What they must do:** Tap tiles in the correct order (tiles move into a queue as tapped). Tap Check.  
**If correct:** Tiles flash green in sequence, advances.  
**If wrong:** Tiles flash red, correct order revealed, re-presented.  
**Implementation note:** No drag-and-drop — tap-to-queue only (works on all basic Android browsers).

**Best for:** Teaching the correct sequence of a multi-step process (install → open → create account → verify).

**Example:**
```
Arrange these steps in the correct order to create a Gmail account:
  □ Choose a Gmail address
  □ Open the Play Store
  □ Enter your name
  □ Tap Install on Gmail
  □ Create a password

Correct order: Open Play Store → Tap Install → Enter name → Choose address → Create password
```

**Agent JSON:**
```json
{
  "exerciseType": "arrange_steps",
  "question": "Arrange these steps in the correct order to create a Gmail account:",
  "tiles": [
    "Choose a Gmail address",
    "Open the Play Store",
    "Enter your name",
    "Tap Install on Gmail",
    "Create a password"
  ],
  "correctOrder": [
    "Open the Play Store",
    "Tap Install on Gmail",
    "Enter your name",
    "Choose a Gmail address",
    "Create a password"
  ],
  "feedbackCorrect": "Exactly right — that is the order you will follow on your phone.",
  "feedbackWrong": "Not quite. You need to install the app before you can open it."
}
```

---

### Type 4 — match_pairs (Match them)

**What the student sees:** Two columns of 3–4 items. Left column: terms. Right column: definitions or descriptions, shuffled.  
**What they must do:** Tap one item on the left, then one on the right to connect them. Repeat until all matched.  
**If all correct:** Lines connecting pairs flash green, advances.  
**If a pair is wrong:** That connection shakes red, student tries again. No hearts lost for match mistakes — only for submitting a wrong final answer.

**Best for:** Vocabulary (English → isiZulu), app terms → meaning, screen names → what you do there.

**Example:**
```
Match each term to its meaning:

Left          Right (shuffled)
Subject       The address you send an email to
Password      The topic of your email
To field      The secret word that opens your account
Inbox         Where received emails are kept
```

**Agent JSON:**
```json
{
  "exerciseType": "match_pairs",
  "question": "Match each term to its meaning:",
  "pairs": [
    { "term": "Subject", "match": "The topic of your email" },
    { "term": "Password", "match": "The secret word that opens your account" },
    { "term": "To field", "match": "The address you send an email to" },
    { "term": "Inbox", "match": "Where received emails are kept" }
  ],
  "feedbackCorrect": "All matched correctly — these are the four main parts of every email.",
  "feedbackWrong": "One or more pairs are wrong. Look at the word 'Subject' — what does it mean in everyday English?"
}
```

---

### Type 5 — do_and_confirm (Real-world action)

**What the student sees:** A clear instruction to do something on their real phone. A description of what they should see when done. Then a multiple-choice question that can only be answered correctly if they did the action.  
**What they must do:** Complete the real action, then answer the confirmation question.  
**Why not just a Next button:** The confirmation question forces the student to look at their screen and report what they see — it cannot be answered by guessing without doing the task.

**Best for:** Any step that requires the student to do something on their actual device (open an app, send a message, take a photo, check their inbox).

**Example:**
```
Do this now: Open WhatsApp on your phone. Look at the bottom of the screen.

Confirmation question: "How many icons are at the bottom of the WhatsApp home screen?"
Options: A) 2  B) 3  C) 4 ← correct  D) 5
```

**Agent JSON:**
```json
{
  "exerciseType": "do_and_confirm",
  "instruction": "Open WhatsApp on your phone now. Look at the bottom row of icons on the home screen.",
  "visibleResult": "You should see a row of icons at the bottom — chat bubbles, a phone, a camera, and more.",
  "question": "How many icons are in the bottom row of WhatsApp?",
  "options": ["2", "3", "4", "5"],
  "correctAnswer": "4",
  "feedbackCorrect": "Correct — you can see Chats, Status, Channels, and Calls at the bottom.",
  "feedbackWrong": "Look again at the very bottom of the WhatsApp screen. Count the icons slowly."
}
```

---

## Hearts system

Each task starts with **3 hearts** (❤️❤️❤️).  
Every wrong answer on a `tap_correct`, `fill_blank`, `arrange_steps`, or `do_and_confirm` exercise costs 1 heart.  
Match_pairs mistakes do not cost hearts.  
Losing all 3 hearts ends the session with a "Try again" screen — the student restarts from step 1.  
Completing a task with all 3 hearts shows a "Perfect!" banner on the celebration screen.

**Why 3 hearts, not 5:** Students on shared devices or time-limited school sessions need shorter restart loops. 3 is enough to allow recovery without dragging out a failed run.

---

## Feedback mechanics

| Event | Visual | Sound (optional) |
|---|---|---|
| Correct answer | Button/field flashes green, checkmark icon, 1-second pause, auto-advance | Short high chime |
| Wrong answer | Button/field flashes red, screen shakes left-right 2×, heart removed, correct answer shown | Low thud |
| Task complete | Confetti animation, green completion screen, hearts remaining shown | Celebration sound |
| Hearts empty | Red "Out of hearts" screen, restart button | None — keep it calm |
| Perfect run | Gold banner on completion screen: "No mistakes!" | None needed |

**Shake animation (CSS):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}
.shake { animation: shake 0.4s ease; }
```

---

## Choosing the right exercise type per step

| Step content | Best exercise type |
|---|---|
| "What button do you tap?" | tap_correct |
| "What is this screen called?" | tap_correct |
| "Type the name of the field" | fill_blank |
| "What does this word mean?" | tap_correct or match_pairs |
| "Put these steps in order" | arrange_steps |
| "Connect these terms to their meanings" | match_pairs |
| "Do this on your phone right now" | do_and_confirm |
| "How many X are on the screen?" | do_and_confirm |

---

## Streak (session-level only)

Track correct-answer streaks within a session (not across days — that requires backend). After 3 correct answers in a row, show a small "🔥 3 in a row!" badge. This resets on any wrong answer. Lightweight, no server needed — pure localStorage or in-session JS variable.
