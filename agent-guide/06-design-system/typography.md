# Typography

---

## Font stack

Use system fonts — no web font loading for performance on old hardware and slow connections.

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

This renders as:
- San Francisco on iOS/macOS
- Roboto on Android (most student devices)
- Segoe UI on Windows (school PCs)

No custom fonts. No Google Fonts. No icon fonts — use Unicode characters or inline SVG for icons.

---

## Type scale

| Element | Size | Weight | Color | Notes |
|---|---|---|---|---|
| Page heading (H1) | 26px / 1.625rem | 700 | `#1A1A1A` | Lesson or task title |
| Section heading (H2) | 22px / 1.375rem | 600 | `#1A1A1A` | Section labels |
| Sub-heading (H3) | 18px / 1.125rem | 600 | `#1A1A1A` | Sub-sections |
| Body text | 16px / 1rem | 400 | `#1A1A1A` | All paragraphs and instructions |
| Step instruction | 18px / 1.125rem | 400 | `#1A1A1A` | Slightly larger for readability |
| Caption / tip | 14px / 0.875rem | 400 | `#555555` | Tip text, time estimates |
| Button label | 16px / 1rem | 600 | Varies | See button specs |

**Minimum:** 14px for any text visible to students. 16px minimum for body content.

---

## Line height

- Body text: 1.6 — generous for readability on small screens
- Headings: 1.2
- Step instructions: 1.7 — extra space for easier reading on mobile

---

## Text alignment

- Left-aligned for all body text and instructions
- Centered for page titles only (H1)
- Never justify text — ragged right is easier to read at small sizes and varying widths

---

## Emphasis

- **Bold** for key terms on first use and for critical instructions ("Tap Send")
- Do not use italic for emphasis — hard to read at small sizes on low-quality screens
- Underline is reserved for links only

---

## Print (teacher PDF)

| Element | Print size | Notes |
|---|---|---|
| Lesson title | 18pt | Bold |
| Section headings | 14pt | Bold |
| Body text | 12pt | Standard |
| Blackboard box | 12pt | Bold, boxed |
| Time guide | 11pt | Italic |

Minimum 12pt for any printed text. Line height 1.5 minimum.
