# Student Task HTML Template

This template renders a Duolingo-style interactive task. Students must answer each step's exercise correctly before advancing. Wrong answers shake the screen and remove a heart. The task ends with a confetti celebration.

Designed for:
- Mobile-first (375px min width)
- Old Android phones in a standard browser
- School PCs with older browsers (Chrome 80+)
- Offline use after initial load (no external resources)
- Vanilla HTML/CSS/JS only — no frameworks

---

## Data shape expected from the agent

```json
{
  "taskTitle": "Set Up Your Professional Email",
  "whatYouWillDo": "You will create a Gmail account and send your first professional email.",
  "taskTime": "12–15 minutes",
  "steps": [
    {
      "number": 1,
      "teach": "Gmail is a free email service made by Google. You can use it on any Android phone.",
      "exerciseType": "tap_correct",
      "question": "Where do you go to get Gmail onto your phone?",
      "options": ["Settings", "Play Store", "Phone app", "Browser"],
      "correctAnswer": "Play Store",
      "feedbackCorrect": "Correct — the Play Store is where you download free apps.",
      "feedbackWrong": "Look for the Play Store icon — it is a coloured triangle on your home screen.",
      "tip": ""
    }
  ],
  "reflectionQuestion": "Write one real situation where you would use your new email address in the next few months."
}
```

---

## Full HTML template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TASK_TITLE] — KwaXolo Learn</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1A1A1A;
      background: #F9F6F2;
    }

    .page { max-width: 560px; margin: 0 auto; padding: 16px 16px 40px; }

    /* ── Header ── */
    .task-header {
      background: #fff;
      border-top: 4px solid #F37021;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 14px;
    }
    .task-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .task-intro { font-size: 16px; color: #444; margin-bottom: 4px; }
    .task-time { font-size: 13px; color: #888; }

    /* ── Hearts ── */
    .hearts-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
    }
    .heart { font-size: 22px; transition: opacity 0.3s; }
    .heart.lost { opacity: 0.2; }
    .hearts-label { font-size: 12px; color: #888; margin-left: 4px; }

    /* ── Progress bar ── */
    .progress-wrap { margin-bottom: 16px; }
    .progress-label { font-size: 12px; color: #888; margin-bottom: 5px; }
    .progress-track { height: 6px; background: #e5e5e5; border-radius: 3px; }
    .progress-fill {
      height: 6px;
      background: #F37021;
      border-radius: 3px;
      transition: width 0.4s cubic-bezier(.4,0,.2,1);
    }

    /* ── Back button ── */
    .btn-back {
      background: none;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 7px 14px;
      font-size: 13px;
      color: #888;
      cursor: pointer;
      margin-bottom: 12px;
      display: none;
    }
    .btn-back.visible { display: inline-flex; align-items: center; gap: 5px; }
    .btn-back:hover { background: #f5f5f5; color: #444; }

    /* ── Step card ── */
    .step-card {
      background: #fff;
      border-radius: 10px;
      padding: 22px 20px 20px;
      margin-bottom: 14px;
    }
    .step-number {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: #F37021;
      margin-bottom: 10px;
    }
    .step-teach {
      font-size: 16px;
      line-height: 1.7;
      color: #1A1A1A;
      margin-bottom: 18px;
      padding-bottom: 18px;
      border-bottom: 1px solid #f0f0f0;
    }
    .step-question {
      font-size: 17px;
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 14px;
      line-height: 1.45;
    }
    .step-tip {
      background: #FFF5EE;
      border-left: 3px solid #F37021;
      padding: 8px 12px;
      font-size: 13px;
      color: #555;
      border-radius: 0 6px 6px 0;
      margin-top: 12px;
    }

    /* ── Feedback banner ── */
    .feedback {
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 12px;
      display: none;
    }
    .feedback.correct { background: #e8f8ed; color: #1e7a3c; border: 1px solid #a8e0ba; display: block; }
    .feedback.wrong   { background: #fde8e8; color: #c0392b; border: 1px solid #f5b7b1; display: block; }

    /* ── tap_correct options ── */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .option-btn {
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 10px;
      padding: 13px 10px;
      font-size: 15px;
      font-weight: 600;
      color: #1A1A1A;
      cursor: pointer;
      text-align: center;
      min-height: 52px;
      transition: border-color .15s, background .15s;
    }
    .option-btn:hover { border-color: #F37021; background: #fff8f3; }
    .option-btn.selected-correct { border-color: #2D8B3E; background: #e8f8ed; color: #1e7a3c; }
    .option-btn.selected-wrong   { border-color: #D62B2B; background: #fde8e8; color: #c0392b; }

    /* ── fill_blank ── */
    .blank-input {
      width: 100%;
      padding: 13px 14px;
      font-size: 17px;
      font-family: inherit;
      border: 2px solid #ddd;
      border-radius: 10px;
      background: #fff;
      transition: border-color .15s;
    }
    .blank-input:focus { outline: none; border-color: #F37021; }
    .blank-input.correct { border-color: #2D8B3E; background: #e8f8ed; }
    .blank-input.wrong   { border-color: #D62B2B; background: #fde8e8; }
    .btn-check {
      width: 100%;
      margin-top: 10px;
      padding: 14px;
      background: #F37021;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      min-height: 52px;
    }
    .btn-check:hover { background: #d95e0f; }
    .btn-check:disabled { background: #ccc; cursor: not-allowed; }

    /* ── arrange_steps ── */
    .tiles-pool {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      min-height: 44px;
      padding: 8px;
      background: #f9f6f2;
      border-radius: 8px;
      border: 1px dashed #ddd;
    }
    .tiles-queue {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
      min-height: 44px;
      padding: 8px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    .tile {
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 9px 13px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: border-color .15s;
    }
    .tile:hover { border-color: #F37021; }
    .tile.in-queue { background: #F9F6F2; border-color: #F37021; color: #F37021; }
    .tile.correct  { border-color: #2D8B3E; background: #e8f8ed; color: #1e7a3c; }
    .tile.wrong    { border-color: #D62B2B; background: #fde8e8; color: #c0392b; }

    /* ── match_pairs ── */
    .pairs-container { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .pair-col { display: flex; flex-direction: column; gap: 6px; }
    .pair-item {
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color .15s, background .15s;
    }
    .pair-item.selected  { border-color: #F37021; background: #fff8f3; }
    .pair-item.matched   { border-color: #2D8B3E; background: #e8f8ed; color: #1e7a3c; pointer-events: none; }
    .pair-item.wrong     { border-color: #D62B2B; background: #fde8e8; }

    /* ── do_and_confirm ── */
    .do-instruction {
      background: #EEF4FB;
      border-left: 3px solid #1B5EA7;
      padding: 12px 14px;
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      color: #1A1A1A;
      margin-bottom: 10px;
    }
    .visible-result {
      font-size: 13px;
      color: #555;
      font-style: italic;
      margin-bottom: 16px;
    }

    /* ── Hover words (isiZulu) ── */
    .hover-word {
      border-bottom: 1px dotted #F37021;
      cursor: pointer;
      position: relative;
    }
    .hover-word::after {
      content: attr(data-zu);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1A1A1A;
      color: #fff;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
      margin-bottom: 4px;
      z-index: 10;
    }
    .hover-word:hover::after,
    .hover-word:focus::after { opacity: 1; }

    /* ── Reflection ── */
    .reflection-card {
      background: #fff;
      border: 2px solid #F37021;
      border-radius: 10px;
      padding: 20px;
      display: none;
    }
    .reflection-card.visible { display: block; }
    .reflection-card h2 { font-size: 18px; font-weight: 700; color: #F37021; margin-bottom: 10px; }
    .reflection-card p  { font-size: 16px; margin-bottom: 14px; line-height: 1.6; }
    .reflection-input {
      width: 100%;
      min-height: 110px;
      padding: 12px;
      font-size: 16px;
      font-family: inherit;
      border: 1.5px solid #ccc;
      border-radius: 8px;
      resize: vertical;
      line-height: 1.5;
    }
    .reflection-input:focus { outline: 2px solid #F37021; border-color: #F37021; }
    .btn-submit {
      width: 100%;
      background: #2D8B3E;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 12px;
      min-height: 52px;
    }

    /* ── Completion screen ── */
    .completion {
      background: #2D8B3E;
      border-radius: 10px;
      padding: 36px 24px;
      text-align: center;
      color: #fff;
      display: none;
    }
    .completion.visible { display: block; }
    .completion h2 { font-size: 28px; font-weight: 800; margin-bottom: 10px; }
    .completion p  { font-size: 16px; line-height: 1.6; margin-bottom: 6px; }
    .hearts-remaining { font-size: 22px; margin-top: 14px; letter-spacing: 4px; }
    .perfect-banner {
      background: #FFD700;
      color: #1A1A1A;
      font-size: 14px;
      font-weight: 700;
      border-radius: 20px;
      padding: 6px 16px;
      display: inline-block;
      margin-top: 10px;
    }

    /* ── Hearts-out screen ── */
    .hearts-out {
      background: #fff;
      border: 2px solid #D62B2B;
      border-radius: 10px;
      padding: 28px 20px;
      text-align: center;
      display: none;
    }
    .hearts-out.visible { display: block; }
    .hearts-out h2 { font-size: 22px; font-weight: 700; color: #D62B2B; margin-bottom: 8px; }
    .hearts-out p  { font-size: 15px; color: #555; margin-bottom: 18px; }
    .btn-restart {
      background: #F37021;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px 24px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      min-height: 52px;
    }

    /* ── Shake animation ── */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-6px); }
      80%       { transform: translateX(6px); }
    }
    .shake { animation: shake 0.4s ease; }

    /* ── Confetti (pure CSS, no library) ── */
    .confetti-piece {
      position: fixed;
      width: 10px;
      height: 10px;
      top: -10px;
      border-radius: 2px;
      animation: confetti-fall 2.5s ease-in forwards;
    }
    @keyframes confetti-fall {
      to { top: 110vh; transform: rotate(720deg); opacity: 0; }
    }

    .hidden { display: none !important; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="task-header">
    <h1 id="task-title"></h1>
    <p class="task-intro" id="task-intro"></p>
    <p class="task-time" id="task-time"></p>
  </div>

  <!-- Hearts -->
  <div class="hearts-row" id="hearts-row">
    <span class="heart" id="h1">❤️</span>
    <span class="heart" id="h2">❤️</span>
    <span class="heart" id="h3">❤️</span>
    <span class="hearts-label">Be careful — 3 chances</span>
  </div>

  <!-- Progress -->
  <div class="progress-wrap">
    <div class="progress-label" id="progress-label">Step 1</div>
    <div class="progress-track"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
  </div>

  <!-- Back button -->
  <button class="btn-back" id="btn-back" onclick="goBack()">← Go back</button>

  <!-- Step card (rebuilt per step) -->
  <div id="step-card"></div>

  <!-- Reflection -->
  <div class="reflection-card" id="reflection">
    <h2>Think About This</h2>
    <p id="reflection-question"></p>
    <textarea class="reflection-input" id="reflection-answer" placeholder="Write your answer here..."></textarea>
    <button class="btn-submit" onclick="submitTask()">Submit</button>
  </div>

  <!-- Completion -->
  <div class="completion" id="completion">
    <div style="font-size:48px;margin-bottom:10px">🎉</div>
    <h2>Lesson complete!</h2>
    <p id="completion-title"></p>
    <p style="margin-top:8px;font-size:14px;opacity:.8">Your answer has been saved.</p>
    <div class="hearts-remaining" id="hearts-remaining"></div>
    <div class="perfect-banner hidden" id="perfect-banner">⭐ No mistakes!</div>
  </div>

  <!-- Hearts out -->
  <div class="hearts-out" id="hearts-out">
    <div style="font-size:40px;margin-bottom:8px">💔</div>
    <h2>Out of hearts</h2>
    <p>Don't worry — try again from the beginning.</p>
    <button class="btn-restart" onclick="restartTask()">Try again</button>
  </div>

</div>

<script>
// ── Task data injected by platform ───────────────────────────────────────────
var TASK = {}; // Platform injects the parsed lesson JSON here

// ── State ─────────────────────────────────────────────────────────────────────
var currentStep = 0;
var hearts      = 3;
var streak      = 0;
var initialHearts = 3;

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  document.getElementById('task-title').textContent  = TASK.taskTitle || '';
  document.getElementById('task-intro').textContent  = TASK.whatYouWillDo || '';
  document.getElementById('task-time').textContent   = 'Estimated time: ' + (TASK.taskTime || '10–15 minutes');
  document.getElementById('reflection-question').textContent = TASK.reflectionQuestion || '';
  renderStep(0);
}

// ── Render a step ─────────────────────────────────────────────────────────────
function renderStep(idx) {
  currentStep = idx;
  var step  = TASK.steps[idx];
  var total = TASK.steps.length;

  // Progress
  var pct = Math.round(((idx + 1) / (total + 1)) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = 'Step ' + (idx + 1) + ' of ' + total;

  // Back button
  var back = document.getElementById('btn-back');
  if (idx > 0) back.classList.add('visible'); else back.classList.remove('visible');

  // Build step card
  var html = '<div class="step-card" id="current-step">';
  html += '<div class="step-number">Step ' + (idx + 1) + ' of ' + total + '</div>';
  if (step.teach) html += '<div class="step-teach">' + esc(step.teach) + '</div>';
  html += '<div class="step-question">' + esc(step.question || step.instruction || '') + '</div>';

  switch (step.exerciseType) {
    case 'tap_correct':   html += buildTapCorrect(step);   break;
    case 'fill_blank':    html += buildFillBlank(step);    break;
    case 'arrange_steps': html += buildArrangeSteps(step); break;
    case 'match_pairs':   html += buildMatchPairs(step);   break;
    case 'do_and_confirm':html += buildDoAndConfirm(step); break;
    default:              html += buildTapCorrect(step);   break;
  }

  if (step.tip) html += '<div class="step-tip">💡 ' + esc(step.tip) + '</div>';
  html += '<div class="feedback" id="feedback"></div>';
  html += '</div>';

  document.getElementById('step-card').innerHTML = html;
}

// ── Exercise builders ─────────────────────────────────────────────────────────
function buildTapCorrect(step) {
  var html = '<div class="options-grid">';
  (step.options || []).forEach(function(opt) {
    html += '<button class="option-btn" onclick="checkTap(this, \'' + escQ(opt) + '\')">' + esc(opt) + '</button>';
  });
  html += '</div>';
  return html;
}

function buildFillBlank(step) {
  return '<input class="blank-input" id="blank-input" type="text" placeholder="Type your answer..." autocomplete="off" autocorrect="off" autocapitalize="off">' +
         '<button class="btn-check" onclick="checkBlank()">Check answer</button>';
}

function buildArrangeSteps(step) {
  var shuffled = shuffle((step.tiles || []).slice());
  var html = '<p style="font-size:13px;color:#888;margin-bottom:6px">Tap the steps in the correct order:</p>';
  html += '<div class="tiles-queue" id="tiles-queue"></div>';
  html += '<div class="tiles-pool" id="tiles-pool">';
  shuffled.forEach(function(t, i) {
    html += '<div class="tile" id="tile-' + i + '" data-text="' + escQ(t) + '" onclick="tapTile(this)">' + esc(t) + '</div>';
  });
  html += '</div>';
  html += '<button class="btn-check" onclick="checkOrder()">Check order</button>';
  return html;
}

function buildMatchPairs(step) {
  var pairs   = step.pairs || [];
  var terms   = pairs.map(function(p){ return p.term; });
  var matches = shuffle(pairs.map(function(p){ return p.match; }));
  var html    = '<div class="pairs-container">';
  html += '<div class="pair-col">';
  terms.forEach(function(t, i) {
    html += '<div class="pair-item" id="term-' + i + '" data-val="' + escQ(t) + '" onclick="selectPair(this,\'term\')">' + esc(t) + '</div>';
  });
  html += '</div><div class="pair-col">';
  matches.forEach(function(m, i) {
    html += '<div class="pair-item" id="match-' + i + '" data-val="' + escQ(m) + '" onclick="selectPair(this,\'match\')">' + esc(m) + '</div>';
  });
  html += '</div></div>';
  html += '<button class="btn-check" onclick="checkPairs()" style="margin-top:10px">Check matches</button>';
  return html;
}

function buildDoAndConfirm(step) {
  var html = '';
  if (step.instruction)   html += '<div class="do-instruction">' + esc(step.instruction) + '</div>';
  if (step.visibleResult) html += '<div class="visible-result">✓ ' + esc(step.visibleResult) + '</div>';
  html += '<div class="options-grid">';
  (step.options || []).forEach(function(opt) {
    html += '<button class="option-btn" onclick="checkTap(this, \'' + escQ(opt) + '\')">' + esc(opt) + '</button>';
  });
  html += '</div>';
  return html;
}

// ── Check functions ───────────────────────────────────────────────────────────
function checkTap(btn, value) {
  var step    = TASK.steps[currentStep];
  var correct = (value.toLowerCase().trim() === step.correctAnswer.toLowerCase().trim());
  // Disable all buttons
  btn.closest('.options-grid').querySelectorAll('.option-btn').forEach(function(b){ b.disabled = true; });

  if (correct) {
    btn.classList.add('selected-correct');
    showFeedback(true, step.feedbackCorrect);
    streak++;
    setTimeout(function(){ advance(); }, 1400);
  } else {
    btn.classList.add('selected-wrong');
    shake();
    showFeedback(false, step.feedbackWrong);
    loseHeart();
  }
}

function checkBlank() {
  var step  = TASK.steps[currentStep];
  var input = document.getElementById('blank-input');
  var val   = (input.value || '').toLowerCase().trim();
  var accepted = (step.acceptedAnswers || [step.correctAnswer]).map(function(a){ return a.toLowerCase().trim(); });
  var correct  = accepted.indexOf(val) !== -1;

  input.disabled = true;
  document.querySelector('.btn-check').disabled = true;

  if (correct) {
    input.classList.add('correct');
    showFeedback(true, step.feedbackCorrect);
    streak++;
    setTimeout(function(){ advance(); }, 1400);
  } else {
    input.classList.add('wrong');
    shake();
    showFeedback(false, step.feedbackWrong);
    loseHeart();
  }
}

var tileQueue = [];
function tapTile(el) {
  if (el.classList.contains('in-queue')) {
    // Remove from queue
    tileQueue = tileQueue.filter(function(t){ return t !== el.dataset.text; });
    el.classList.remove('in-queue');
    document.getElementById('tiles-queue').innerHTML = tileQueue.map(function(t,i){
      return '<div class="tile in-queue">' + esc(t) + '</div>';
    }).join('');
  } else {
    tileQueue.push(el.dataset.text);
    el.classList.add('in-queue');
    var queueEl = document.getElementById('tiles-queue');
    queueEl.innerHTML += '<div class="tile in-queue">' + esc(el.dataset.text) + '</div>';
  }
}

function checkOrder() {
  var step    = TASK.steps[currentStep];
  var correct = JSON.stringify(tileQueue) === JSON.stringify(step.correctOrder);
  document.querySelector('.btn-check').disabled = true;

  if (correct) {
    showFeedback(true, step.feedbackCorrect);
    streak++;
    setTimeout(function(){ advance(); }, 1400);
  } else {
    shake();
    showFeedback(false, step.feedbackWrong);
    loseHeart();
  }
}

var selectedTerm  = null;
var selectedMatch = null;
var pairsMatched  = 0;

function selectPair(el, side) {
  if (el.classList.contains('matched')) return;
  if (side === 'term') {
    if (selectedTerm) selectedTerm.classList.remove('selected');
    selectedTerm = el;
  } else {
    if (selectedMatch) selectedMatch.classList.remove('selected');
    selectedMatch = el;
  }
  el.classList.add('selected');
  if (selectedTerm && selectedMatch) tryMatch();
}

function tryMatch() {
  var step   = TASK.steps[currentStep];
  var tVal   = selectedTerm.dataset.val;
  var mVal   = selectedMatch.dataset.val;
  var valid  = step.pairs.some(function(p){ return p.term === tVal && p.match === mVal; });

  if (valid) {
    selectedTerm.classList.replace('selected','matched');
    selectedMatch.classList.replace('selected','matched');
    pairsMatched++;
    if (pairsMatched === step.pairs.length) {
      showFeedback(true, step.feedbackCorrect);
      streak++;
      setTimeout(function(){ advance(); }, 1400);
    }
  } else {
    selectedTerm.classList.add('wrong');
    selectedMatch.classList.add('wrong');
    shake();
    setTimeout(function(){
      selectedTerm.classList.remove('wrong','selected');
      selectedMatch.classList.remove('wrong','selected');
    }, 700);
  }
  selectedTerm = null; selectedMatch = null;
}

function checkPairs() {
  // "Check matches" triggers full-state check if user hasn't tapped pairs
  var step    = TASK.steps[currentStep];
  if (pairsMatched < step.pairs.length) {
    showFeedback(false, 'Keep going — tap one item on each side to match them.');
  }
}

// ── Advance ───────────────────────────────────────────────────────────────────
function advance() {
  var next = currentStep + 1;
  if (next < TASK.steps.length) {
    renderStep(next);
  } else {
    showReflection();
  }
}

function goBack() {
  if (currentStep > 0) renderStep(currentStep - 1);
}

// ── Reflection & completion ───────────────────────────────────────────────────
function showReflection() {
  document.getElementById('step-card').innerHTML  = '';
  document.getElementById('btn-back').className   = 'btn-back';
  document.getElementById('hearts-row').style.display = 'none';
  document.getElementById('progress-label').textContent = 'Almost done!';
  document.getElementById('progress-fill').style.width = '90%';
  document.getElementById('reflection').classList.add('visible');
  window.scrollTo(0, 0);
}

function submitTask() {
  var answer = (document.getElementById('reflection-answer').value || '').trim();
  if (answer.length < 10) { alert('Please write at least one sentence before submitting.'); return; }
  document.getElementById('reflection').classList.remove('visible');
  document.getElementById('completion').classList.add('visible');
  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('progress-label').textContent = 'Completed!';
  document.getElementById('completion-title').textContent = 'You completed: ' + TASK.taskTitle;
  document.getElementById('hearts-remaining').textContent = Array(hearts).fill('❤️').join('') + Array(initialHearts - hearts).fill('🤍').join('');
  if (hearts === initialHearts) document.getElementById('perfect-banner').classList.remove('hidden');
  launchConfetti();
  window.scrollTo(0, 0);
  // POST answer to platform API here
}

// ── Hearts ────────────────────────────────────────────────────────────────────
function loseHeart() {
  hearts--;
  streak = 0;
  var heartEl = document.getElementById('h' + (hearts + 1));
  if (heartEl) heartEl.classList.add('lost');
  if (hearts <= 0) {
    setTimeout(function(){
      document.getElementById('step-card').innerHTML = '';
      document.getElementById('reflection').classList.remove('visible');
      document.getElementById('hearts-out').classList.add('visible');
    }, 1800);
  }
}

function restartTask() {
  hearts = initialHearts;
  streak = 0;
  document.getElementById('h1').classList.remove('lost');
  document.getElementById('h2').classList.remove('lost');
  document.getElementById('h3').classList.remove('lost');
  document.getElementById('hearts-out').classList.remove('visible');
  document.getElementById('hearts-row').style.display = 'flex';
  renderStep(0);
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showFeedback(correct, text) {
  var el = document.getElementById('feedback');
  if (!el || !text) return;
  el.className = 'feedback ' + (correct ? 'correct' : 'wrong');
  el.textContent = (correct ? '✓ ' : '✗ ') + text;
}

function shake() {
  var card = document.getElementById('current-step');
  if (!card) return;
  card.classList.remove('shake');
  void card.offsetWidth; // reflow to restart animation
  card.classList.add('shake');
}

function launchConfetti() {
  var colors = ['#F37021','#2D8B3E','#1B5EA7','#FFD700','#D62B2B'];
  for (var i = 0; i < 60; i++) {
    var piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.2 + 's';
    piece.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
    piece.style.width  = (7 + Math.random() * 8) + 'px';
    piece.style.height = (7 + Math.random() * 8) + 'px';
    document.body.appendChild(piece);
    setTimeout(function(p){ p.remove(); }, 3500, piece);
  }
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escQ(s) {
  return String(s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

// ── Start ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function(){ if(TASK.steps) init(); });
</script>
</body>
</html>
```

---

## Placeholder reference

| Field in TASK | Description |
|---|---|
| `taskTitle` | Task title from agent output |
| `whatYouWillDo` | One-sentence intro |
| `taskTime` | e.g. "12–15 minutes" |
| `steps[].teach` | Teaching text shown before the question |
| `steps[].exerciseType` | One of the 5 types |
| `steps[].question` | The question to answer |
| `steps[].options` | Array of answer options (tap_correct, do_and_confirm) |
| `steps[].correctAnswer` | The correct option string |
| `steps[].acceptedAnswers` | Array of accepted strings for fill_blank |
| `steps[].correctOrder` | Ordered array of strings for arrange_steps |
| `steps[].pairs` | Array of {term, match} objects for match_pairs |
| `steps[].instruction` | Real-world action instruction for do_and_confirm |
| `steps[].visibleResult` | What the student should see after doing the action |
| `steps[].feedbackCorrect` | Shown on correct answer |
| `steps[].feedbackWrong` | Shown on wrong answer — hint, not the answer |
| `steps[].tip` | Optional tip shown below the exercise |
| `reflectionQuestion` | The final open reflection prompt |
