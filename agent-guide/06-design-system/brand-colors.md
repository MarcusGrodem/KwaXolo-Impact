# Brand Colors

All student-facing HTML output and teacher-facing UI must use these exact colors.

---

## Color palette

| Name | Hex | RGB | Usage |
|---|---|---|---|
| Primary Orange | `#F37021` | 243, 112, 33 | Buttons, CTAs, active state, highlights |
| Brand Red | `#D62B2B` | 214, 43, 43 | Alerts, errors, emphasis (use sparingly) |
| Success Green | `#2D8B3E` | 45, 139, 62 | Completion, progress, positive feedback |
| Trust Blue | `#1B5EA7` | 27, 94, 167 | Links, informational highlights, secondary actions |
| Dark Text | `#1A1A1A` | 26, 26, 26 | All body text, headings |
| Light Background | `#F9F6F2` | 249, 246, 242 | Page background, section backgrounds |
| White | `#FFFFFF` | 255, 255, 255 | Cards, input fields, content boxes |

---

## Usage rules

### Primary Orange `#F37021`
- Primary action buttons ("Start Task", "Generate Lesson", "Submit")
- Progress indicators and active step markers
- Reflection question highlight boxes
- Logo accent color
- Do not use for body text — low contrast on white

### Brand Red `#D62B2B`
- Error messages and form validation
- Urgent notices
- Do not use as a general highlight — reserve for errors and critical emphasis
- Never use on large areas of background

### Success Green `#2D8B3E`
- "Done — Next Step" confirmation
- Completed task cards (with green checkmark)
- Celebration/completion screen background
- Progress bar fill

### Trust Blue `#1B5EA7`
- Hyperlinks
- Informational panels ("Did you know...")
- Secondary buttons

### Dark Text `#1A1A1A`
- All body text — not pure black, slightly softer
- Headings
- Do not use colored text for body content — legibility is the priority

### Light Background `#F9F6F2`
- Page and app background — warm off-white, not pure white
- Section dividers

### White `#FFFFFF`
- Cards and content containers
- Input fields and text areas
- Modal backgrounds

---

## Contrast ratios (accessibility)

| Foreground | Background | Ratio | WCAG |
|---|---|---|---|
| `#1A1A1A` | `#FFFFFF` | 18.1:1 | AAA |
| `#1A1A1A` | `#F9F6F2` | 15.8:1 | AAA |
| `#FFFFFF` | `#F37021` | 3.1:1 | AA (large text only) |
| `#FFFFFF` | `#2D8B3E` | 4.6:1 | AA |
| `#FFFFFF` | `#1B5EA7` | 6.2:1 | AA |
| `#FFFFFF` | `#D62B2B` | 5.1:1 | AA |

White text on Primary Orange passes AA only for large text (18pt+) and bold text (14pt+ bold). For small button labels, use dark text on orange or test manually.

---

## Print (teacher PDF)

When printing teacher lesson plans in black and white:
- Primary Orange becomes approximately 60% grey — use it sparingly in print
- Rely on bold, borders, and spacing for hierarchy — not color
- The "Write on the Board" box should use a thick black border, not an orange background, to remain readable when printed
