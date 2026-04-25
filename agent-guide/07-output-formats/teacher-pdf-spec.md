# Teacher Lesson Plan — PDF/Print Spec

Teacher lesson plans are displayed as HTML on the platform and can be printed as a PDF. The print view must be clean, readable, and functional without color (black and white printer).

---

## Print CSS

Add this to the teacher lesson plan HTML to control print layout:

```css
@media print {
  body { font-family: Georgia, "Times New Roman", serif; font-size: 12pt; color: #000000; background: #FFFFFF; }
  .no-print { display: none !important; }
  .page-break { page-break-before: always; }

  h1 { font-size: 18pt; font-weight: bold; margin-bottom: 6pt; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; border-bottom: 1pt solid #000000; padding-bottom: 2pt; }
  p, li { font-size: 12pt; line-height: 1.5; margin-bottom: 6pt; }

  .board-box {
    border: 2pt solid #000000;
    padding: 10pt;
    margin: 10pt 0;
    background: #FFFFFF;
  }
  .board-box ul { padding-left: 16pt; }
  .board-box li { font-weight: bold; font-size: 13pt; }

  .local-example-box {
    border-left: 4pt solid #000000;
    padding-left: 10pt;
    margin: 10pt 0;
    font-style: italic;
  }

  .time-guide {
    background: #F0F0F0;
    padding: 8pt;
    font-size: 11pt;
    margin-top: 14pt;
  }
}
```

---

## HTML structure for teacher lesson plan

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[LESSON_TITLE] — Teacher Lesson Plan</title>
  <!-- Include print CSS above, plus screen CSS below -->
  <style>
    /* Screen styles */
    body { font-family: system-ui, sans-serif; font-size: 16px; line-height: 1.6; color: #1A1A1A; background: #F9F6F2; padding: 24px; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
    .objective { font-size: 16px; color: #555555; font-style: italic; margin-bottom: 24px; }
    h2 { font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 8px; color: #1A1A1A; }

    .board-box {
      border: 2px solid #1A1A1A;
      padding: 16px;
      background: #FFFFFF;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .board-box-label { font-size: 13px; font-weight: 600; color: #F37021; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .board-box ul { padding-left: 20px; }
    .board-box li { font-weight: 600; font-size: 16px; margin-bottom: 6px; }

    .explanation p { margin-bottom: 14px; }

    .discussion-questions ol { padding-left: 20px; }
    .discussion-questions li { margin-bottom: 10px; }

    .local-example-box {
      background: #F0FAF2;
      border-left: 4px solid #2D8B3E;
      padding: 14px 16px;
      border-radius: 0 4px 4px 0;
      margin-top: 8px;
    }

    .time-guide {
      background: #F9F6F2;
      border: 1px solid #DDDDDD;
      padding: 14px 16px;
      border-radius: 4px;
      font-size: 14px;
      margin-top: 28px;
    }
    .time-guide strong { display: block; margin-bottom: 6px; }

    .print-btn {
      background: #1A1A1A;
      color: #FFFFFF;
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      cursor: pointer;
      margin-bottom: 24px;
    }
    /* Print CSS here */
    @media print { /* ... paste print CSS block above ... */ }
  </style>
</head>
<body>

  <button class="print-btn no-print" onclick="window.print()">Print Lesson Plan</button>

  <h1>[LESSON_TITLE]</h1>
  <p class="objective">Learning objective: [LEARNING_OBJECTIVE]</p>

  <h2>Write on the Board</h2>
  <div class="board-box">
    <div class="board-box-label">Write these points on the blackboard before the lesson starts</div>
    <ul>
      <li>[BOARD_POINT_1]</li>
      <li>[BOARD_POINT_2]</li>
      <li>[BOARD_POINT_3]</li>
      <!-- up to 5 points -->
    </ul>
  </div>

  <h2>Explain to Students</h2>
  <div class="explanation">
    <p>[EXPLANATION_PARAGRAPH_1]</p>
    <p>[EXPLANATION_PARAGRAPH_2]</p>
    <p>[EXPLANATION_PARAGRAPH_3]</p>
  </div>

  <h2>Discussion Questions</h2>
  <div class="discussion-questions">
    <ol>
      <li>[QUESTION_1]</li>
      <li>[QUESTION_2]</li>
      <li>[QUESTION_3]</li>
    </ol>
  </div>

  <h2>Local Example</h2>
  <div class="local-example-box">
    <p>[LOCAL_EXAMPLE]</p>
  </div>

  <div class="time-guide">
    <strong>Time Guide ([TOTAL_TIME])</strong>
    [TIME_BREAKDOWN]
  </div>

</body>
</html>
```

---

## PDF export options

For MVP, `window.print()` is sufficient — the teacher selects "Save as PDF" from the browser print dialog.

For a production implementation, use one of:
- **Puppeteer** (Node.js) — renders the HTML template to PDF server-side
- **html2pdf.js** (client-side) — lightweight, no server required
- **@react-pdf/renderer** — if the platform is React-based (Lovable uses React)

PDF page size: A4. Margins: 20mm all sides.
