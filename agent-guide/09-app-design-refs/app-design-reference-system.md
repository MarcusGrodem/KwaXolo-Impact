# App Design Reference System

## Purpose

When generating student lesson steps, the LLM needs to know the exact screen names, button labels, and UI flow of the app being taught. This system maintains a library of phone-focused design specs — one markdown file per app — so the LLM produces accurate, consistent screen descriptions across lessons.

## Folder Structure

```
Example sites/Markdown/
  Gmail/
    gmail_clone_design_spec.md        ← pre-existing desktop spec
  WhatsApp/
    whatsapp_clone_design_spec.md     ← pre-existing desktop spec
  Facebook/
    facebook_clone_design_spec.md     ← pre-existing desktop spec
  Google Sheets/
    google_sheets_phone_design.md     ← auto-generated
  Canva/
    canva_phone_design.md             ← auto-generated
  <AppName>/
    <appname>_phone_design.md         ← auto-generated for new apps
```

## How It Works

### 1. App Detection (`detectAppName`)

At lesson generation time the server matches the topic string against a keyword table to identify the primary app:

| App            | Keywords matched                                          |
|----------------|-----------------------------------------------------------|
| Gmail          | gmail, google mail, google account, email account         |
| WhatsApp       | whatsapp, whatsapp business                               |
| Facebook       | facebook, fb page, facebook page, facebook marketplace    |
| Google Sheets  | google sheets, spreadsheet, excel                         |
| Canva          | canva, flyer design, poster design, banner design         |
| Google Maps    | google maps, maps, directions, navigate, route            |

If no match, app design injection is skipped.

### 2. Load Existing MD (`loadAppDesignMD`)

- Fuzzy-matches folder names (case-insensitive substring match)
- Reads the first `.md` file found in the matched folder
- Caps content at **3 000 characters** before injection (prevents token bloat)
- Logs the file name and character count to the console

### 3. Inject into Student Prompt

When an app design MD is found it is injected into the `generateStudentMaterial` system prompt under the heading:

```
APP UI DESIGN REFERENCE — use for accurate screen names, colours, and button labels
```

This sits after the PHONE SCREEN TYPES section so the LLM uses exact labels from the reference when naming screens, buttons, and form fields in step objects.

### 4. Auto-Generate MD for New Apps

If the topic names a known app but **no design folder exists yet**:

- After lesson generation completes, the server calls `generateAndSaveAppDesignMD` in the background (non-blocking, errors are swallowed so they never interrupt delivery).
- It sends a focused prompt to `gpt-5.4-mini` asking for a concise phone UI spec based on the lesson steps just generated and the web search context.
- The result is saved to `Example sites/Markdown/<AppName>/<appname>_phone_design.md`.
- The **next** lesson for the same app will load this file automatically.

## What the Auto-Generated MD Should Contain

The LLM is instructed to include:

1. **Overview** — what the app does, Android focus
2. **Brand Colours** — primary, background, text hex values
3. **Key Screens** — name, purpose, 3–5 UI elements with exact button labels
4. **First-Time User Flow** — ordered screen sequence from install to first success
5. **Common UI Patterns** — recurring elements (nav bar, FABs, tabs) with exact labels

Target length: under 600 words.

## Adding Apps Manually

To add a new app before any lesson is generated:

1. Create `Example sites/Markdown/<AppName>/`
2. Add `<appname>_phone_design.md` with the sections above
3. Add a keyword entry to `APP_NAME_KEYWORDS` in `server.js`

The system will pick it up immediately on the next generation.

## Quality Notes

- The design MD is injected **read-only** — it guides screen naming and colour choices but does not override the step plan or exercise logic.
- If the spec is outdated (app updated its UI), delete the folder and a fresh one will be auto-generated on the next lesson.
- Pre-existing desktop design specs (Gmail, Facebook, WhatsApp) work fine — the first 3 000 characters cover the core UI patterns the LLM needs.
