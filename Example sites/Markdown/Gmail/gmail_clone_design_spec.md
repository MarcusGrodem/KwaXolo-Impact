# Gmail Clone Design Specification

Use this markdown file as a prompt/design specification for an LLM or frontend coding agent to recreate the Gmail pages shown in the provided screenshots.

The screenshots show three Gmail-related screens:

1. **Gmail inbox with compose window open**
2. **Gmail inbox without compose window**
3. **Google/Gmail sign-in page**

The goal is to recreate these screens as high-fidelity frontend pages using HTML/CSS/JavaScript, React, Vue, or another frontend framework.

> Important: This is for internal learning, prototyping, and design analysis. If used publicly, replace real logos, product names, email senders, personal names, profile initials, and brand assets with fictional equivalents.

---

# 1. Overall Design Language

## Visual Style

The design is clean, utility-focused, spacious, and highly structured. It follows modern Google Material-style UI conventions:

- Soft light-gray application background
- Rounded containers and panels
- Thin dividers
- Minimal shadows
- Blue active states
- Color-coded category labels
- Compact rows with strong alignment
- System-like typography
- Icons used as navigation and action affordances

## Font

Use Google-style system typography.

Recommended stack:

```css
font-family: "Google Sans", "Roboto", Arial, sans-serif;
```

If Google Sans is not available, use:

```css
font-family: "Roboto", Arial, Helvetica, sans-serif;
```

General typography:

| Element | Size | Weight | Line height | Notes |
|---|---:|---:|---:|---|
| Gmail logo text | 22px | 400 | 1.2 | Dark gray |
| Sidebar item | 14px | 400/600 | 20px | Active item semi-bold |
| Inbox category tab | 14px | 500 | 20px | Active tab blue |
| Email sender | 14px | 600 | 20px | Bold for unread |
| Email subject | 14px | 600 | 20px | Bold for unread |
| Email preview | 14px | 400 | 20px | Muted gray |
| Email time/date | 12px–13px | 600 | 18px | Right aligned |
| Compose title | 14px | 600 | 20px | Dark text |
| Compose field text | 14px | 400 | 20px | Muted gray placeholders |
| Sign-in heading | 44px | 400 | 52px | Google sign-in page |
| Sign-in body | 16px | 400 | 24px | Normal text |
| Button text | 14px | 500 | 20px | Medium weight |

---

# 2. Design Tokens

Use these as CSS variables.

```css
:root {
  /* Core colors */
  --color-bg-app: #f6f8fc;
  --color-bg-soft: #eef3fb;
  --color-surface: #ffffff;
  --color-surface-muted: #f2f6fc;
  --color-surface-hover: #f1f3f4;
  --color-border: #e0e3e7;
  --color-divider: #e5e8ec;

  /* Google/Gmail colors */
  --color-google-blue: #1a73e8;
  --color-google-blue-dark: #0b57d0;
  --color-google-blue-soft: #d3e3fd;
  --color-compose-blue: #c2e7ff;
  --color-google-red: #ea4335;
  --color-google-yellow: #fbbc04;
  --color-google-green: #34a853;

  /* Category colors */
  --color-promo-green: #188038;
  --color-social-blue: #1a73e8;
  --color-update-orange: #f29900;

  /* Text */
  --color-text-primary: #202124;
  --color-text-secondary: #5f6368;
  --color-text-muted: #80868b;
  --color-text-light: #ffffff;

  /* Icons */
  --color-icon: #5f6368;
  --color-icon-dark: #3c4043;
  --color-icon-active: #0b57d0;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-compose: 0 8px 24px rgba(60, 64, 67, 0.25);
  --shadow-card: 0 2px 8px rgba(60, 64, 67, 0.15);

  /* Layout */
  --topbar-height: 64px;
  --left-sidebar-width: 256px;
  --right-rail-width: 56px;
  --inbox-row-height: 40px;
}
```

---

# 3. Page A: Gmail Inbox

## Viewport

The screenshot is a wide desktop browser view around **1450px × 705px**.

The app fills the entire viewport.

```css
.gmail-app {
  width: 100vw;
  height: 100vh;
  background: #f6f8fc;
  display: grid;
  grid-template-rows: 64px 1fr;
}
```

---

## Top Header

### Layout

Header height: **64px**

Columns:

1. Left menu + Gmail logo area: approx. 256px
2. Search bar: approx. 720px wide
3. Flexible spacer
4. Action icons: help, settings, apps, profile

```css
.gmail-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
  background: #f6f8fc;
}
```

### Left Logo Area

- Hamburger menu icon: 24px, dark gray
- Gmail logo: multicolor M icon, approx. 32px wide
- Text: “Gmail”, 22px, color `#3c4043`
- Tooltip may appear as a small dark label when hovering the logo.

```css
.logo-wrap {
  width: 220px;
  display: flex;
  align-items: center;
  gap: 14px;
}
```

### Search Bar

Search bar is large, pill-shaped, light blue-gray.

Approximate dimensions:

- Width: 720px
- Height: 48px
- Border radius: 24px
- Background: `#eaf1fb` or `#edf3fb`
- Placeholder: “Søk i e-post”
- Search icon left: 24px
- Filter/sliders icon right: 24px

```css
.search-bar {
  width: min(720px, 55vw);
  height: 48px;
  border-radius: 24px;
  background: #eaf1fb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 14px;
}

.search-bar input {
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 16px;
  flex: 1;
  color: #202124;
}
```

### Header Actions

Right actions:

- Help icon
- Settings icon
- Gemini/spark icon
- Google apps 3x3 dot grid
- Profile avatar

Icon size: **24px**
Hit area: **40px**
Profile avatar: **32px**, circular, orange/red background with letter “M”, small alert badge.

---

# 4. Main Inbox Layout

Below the header, the screen is a three-column layout.

```css
.gmail-main {
  display: grid;
  grid-template-columns: 256px 1fr 56px;
  height: calc(100vh - 64px);
}
```

Columns:

| Region | Width | Background |
|---|---:|---|
| Left sidebar | 256px | `#f6f8fc` |
| Email list panel | flexible | `#ffffff` with rounded top corners |
| Right rail | 56px | `#f6f8fc` |

---

# 5. Left Sidebar

## Compose Button

Norwegian label: **“Skriv ny”**

Approximate dimensions:

- Width: 132px
- Height: 56px
- Margin left: 12px
- Background: `#c2e7ff`
- Border radius: 16px
- Icon: pencil/compose, 24px, dark
- Text: 14px, weight 500

```css
.compose-button {
  width: 132px;
  height: 56px;
  border-radius: 16px;
  background: #c2e7ff;
  border: none;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  color: #001d35;
}
```

## Sidebar Navigation Items

Item height: **32px**
Horizontal padding: **24px / 12px**
Icon size: **20px**
Text size: **14px**
Count aligned right.

Active item:

- Label: **Innboks**
- Background: `#d3e3fd`
- Border radius: right pill, approx. 0 16px 16px 0 or 18px
- Text: `#001d35`
- Font weight: 600

```css
.sidebar-item {
  height: 32px;
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 0 12px 0 28px;
  margin-right: 12px;
  border-radius: 0 16px 16px 0;
  font-size: 14px;
  color: #202124;
}

.sidebar-item.active {
  background: #d3e3fd;
  font-weight: 600;
}
```

### Sidebar Items Visible

Use these labels and counts:

| Icon | Label | Count |
|---|---|---:|
| inbox | Innboks | 3 060 |
| star | Stjernemerket | |
| clock | Utsatt | |
| tag/marker | Viktig | |
| send | Sendt | |
| document | Utkast | 10 |
| shopping bag | Kjøp | 23 |
| people | Sosialt | 3 021 |
| info/circle | Oppdateringer | 3 352 |
| forum/chat | Forumer | 14 |
| tag | Reklame | 9 779 |
| chevron | Mer | |

### Labels Section

- Title: **Etiketter**
- Plus icon on the right
- One label: **Notes** with folder/tag icon

### Upgrade Button

Bottom-left pill:

- Text: **Oppgrader**
- Icon in circle on left
- Arrow on right
- Background: white
- Height: 40px
- Width: about 220px
- Border radius: 20px

---

# 6. Inbox List Panel

The central panel has a white background and rounded top corners.

```css
.inbox-panel {
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  margin-right: 0;
}
```

## Toolbar

Height: approx. **48px**

Left actions:

- Checkbox
- Dropdown arrow
- Refresh icon
- More vertical icon

Right actions:

- Text: `1–50 av 3 829`
- Left chevron
- Right chevron
- Keyboard icon
- Dropdown arrow

Text size: 12px–13px, color `#5f6368`.

---

# 7. Category Tabs

Three large tabs across the top of the inbox.

Height: **64px**
Border bottom: **1px solid #e0e0e0**
Active tab has thick blue underline.

## Tabs

### Primary / Primær

- Label: **Primær**
- Active blue underline
- Icon: inbox
- Text color: `#0b57d0`
- Font weight: 500

### Reklame

- Label: **Reklame**
- Green pill: **41 nye**
- Preview: `DJI Store Danmark – Lad os intr...`
- Icon: tag

### Sosialt

- Label: **Sosialt**
- Blue pill: **35 nye**
- Preview: `Strava – Anders Studt mentione...`
- Icon: people

### Oppdateringer

- Label: **Oppdateringer**
- Orange pill: **30 nye**
- Preview: `Komoot – Your run: The adventu...`
- Icon: info

```css
.category-tabs {
  height: 64px;
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  border-bottom: 1px solid #e0e3e7;
}

.category-tab {
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr;
  align-items: center;
  padding: 0 16px;
  color: #5f6368;
}

.category-tab.active {
  color: #0b57d0;
}

.category-tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 3px;
  background: #0b57d0;
  border-radius: 3px 3px 0 0;
}
```

---

# 8. Email Rows

## Row Layout

Each row height: approx. **40px–42px**
Border bottom: `1px solid #e8eaed`

Grid columns:

1. Checkbox: 32px
2. Star: 28px
3. Important marker: 28px
4. Sender: 160px
5. New badge: 44px
6. Subject/preview: flexible
7. Time/date: 80px

```css
.email-row {
  height: 40px;
  display: grid;
  grid-template-columns: 32px 28px 28px 160px 48px minmax(0, 1fr) 80px;
  align-items: center;
  padding: 0 16px 0 16px;
  border-bottom: 1px solid #e8eaed;
  font-size: 14px;
  color: #202124;
}

.email-row:hover {
  box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px rgba(60,64,67,.3);
  z-index: 1;
}

.email-row.unread .sender,
.email-row.unread .subject,
.email-row.unread .time {
  font-weight: 700;
}
```

## Text Treatment

- Sender: black/dark, ellipsis if too long
- Subject: bold if unread
- Preview: muted gray
- Time: right aligned
- Attachment chips below or inline where visible

## New Badge

Small blue pill:

- Text: **Ny**
- Background: `#1a73e8`
- Color: white
- Border radius: pill
- Font size: 12px
- Height: 18px
- Width: approx. 26px

```css
.new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 18px;
  border-radius: 999px;
  background: #1a73e8;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}
```

## Attachment Chips

Visible in the first email and DigitalOcean email.

- Border: `1px solid #dadce0`
- Border radius: 16px
- Height: 28px
- Padding: 0 10px
- Small red PDF/YouTube icon
- Text muted gray
- Max width with ellipsis

```css
.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  border: 1px solid #dadce0;
  border-radius: 16px;
  padding: 0 10px;
  color: #5f6368;
  background: #fff;
  font-size: 13px;
}
```

## Visible Email Data

Use this mock data to match the screenshot:

```js
const emails = [
  {
    sender: "Anthropic, PBC",
    subject: "Your receipt from Anthropic, PBC #2586-1599-4885",
    preview: "Your receipt from Anthropic, PBC #2586-1599-488...",
    time: "18:34",
    unread: true,
    new: true,
    important: true,
    attachments: ["Invoice-NUJKH...", "Receipt-2586-1..."]
  },
  {
    sender: "GitHub",
    subject: "[GitHub] A third-party OAuth application has been added to your account",
    preview: "Hey MarcusGrodem! A thir...",
    time: "10:39",
    unread: true,
    new: true
  },
  {
    sender: "Polestar",
    subject: "Oppdateringer til Polestar personvernregler",
    preview: "Se hva som har endret seg. Vis i nettleser Besøk polestar.n...",
    time: "10:38",
    unread: true,
    new: true
  },
  {
    sender: "Team DigitalOcea...",
    subject: "[Getting started on DO] Part 4 of 4: Meet Autoscale: Scale your Droplets the smart way",
    preview: "Use the righ...",
    time: "27. apr.",
    unread: true,
    new: true
  },
  {
    sender: "Railway",
    subject: "Updates to Railway Terms and Policies",
    preview: "Hi, We've updated the Railway Terms of Service, Privacy Policy, a...",
    time: "27. apr.",
    unread: true,
    new: true
  },
  {
    sender: "Ryanair",
    subject: "O74CYX | Sjekk inn online for flyvningen din til Copenhagen",
    preview: "Unngå innsjekkingsgebyret på 55€ ved fly...",
    time: "25. apr.",
    unread: true,
    new: true
  },
  {
    sender: "føtex",
    subject: "Husk det nu - dit betalingskort synger på sidste vers 🎶💳",
    preview: "Opdater nu, så du fortsat kan synge med på...",
    time: "25. apr.",
    unread: true
  },
  {
    sender: "Team DigitalOcea...",
    subject: "[Getting started on DO] Part 2 of 4: Your ideal Virtual Machine solution",
    preview: "Select the best Droplet to me...",
    time: "24. apr.",
    unread: true,
    new: true,
    attachments: ["DigitalOcean Dr..."]
  },
  {
    sender: "Ryanair",
    subject: "O74CYX | Sjekk inn online for flyvningen din til Copenhagen",
    preview: "Unngå innsjekkingsgebyret på 55€ ved fly...",
    time: "24. apr.",
    unread: true,
    new: true
  },
  {
    sender: "Google",
    subject: "⚠️ Gmail-lagringsplassen din er 99 % full",
    preview: "Få mer lagringsplass eller frigjør plass",
    time: "24. apr.",
    unread: true,
    important: true
  },
  {
    sender: "ant.wilson",
    subject: "Your Supabase Project Dummy Project has been paused.",
    preview: "Hi there, To optimize cloud resources, we automa...",
    time: "24. apr.",
    unread: false
  }
];
```

---

# 9. Right Rail

The right side rail is narrow, approximately **56px** wide.

Elements:

- Calendar icon
- Keep icon
- Tasks icon
- Contacts icon
- Divider
- Plus icon
- Bottom chevron

Icon hit area: 40px
Icon size: 20px–24px
Background: app background `#f6f8fc`

---

# 10. Compose Window State

One screenshot shows a compose modal/dock open in the lower-right area.

## Position and Size

Approximate:

- Width: **545px**
- Height: **500px**
- Fixed to bottom right, above bottom browser edge
- Right offset: approx. **70px** because right rail exists
- Bottom: **0px**
- Shadow: strong but soft
- Background: white
- Border radius: top-left/top-right approx. 12px

```css
.compose-window {
  position: fixed;
  right: 70px;
  bottom: 0;
  width: 545px;
  height: 500px;
  background: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 8px 24px rgba(60, 64, 67, 0.25);
  overflow: hidden;
  display: grid;
  grid-template-rows: 44px 40px 40px 1fr 92px 52px;
}
```

## Compose Header

- Height: 44px
- Background: `#f2f6fc`
- Title: **Skriv ny e-post**
- Title size: 14px, weight 600
- Controls right: minimize, popout, close
- Icon size: 18px

```css
.compose-header {
  height: 44px;
  background: #f2f6fc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: #202124;
  font-size: 14px;
  font-weight: 600;
}
```

## Fields

To row:

- Label/placeholder: **Til**
- Right text: **Kopi Blindkopi**
- Height: 40px
- Border bottom: `#e8eaed`

Subject row:

- Placeholder: **Emne**
- Height: 40px

Input field styling:

```css
.compose-field {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaed;
  font-size: 14px;
  color: #5f6368;
}
```

## Body Area

Large white empty area.

---

## Storage Warning

A gray warning strip appears above the toolbar.

- Height: approx. **92px**
- Background: `#f1f3f4`
- Warning red triangle icon
- Bold text: **99 % lagringsplass brukt.**
- Body: `Hvis du går tom for plass, kan du ikke sende e-post.`
- Link: **Administrer lagringsplassen** in blue
- Right link: **Lukk**

```css
.storage-warning {
  background: #f1f3f4;
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 14px 16px;
  font-size: 14px;
  color: #202124;
}

.storage-warning a {
  color: #0b57d0;
  text-decoration: none;
  font-size: 13px;
}
```

## Compose Toolbar

Bottom height: **52px**

Left:

- Blue Send button with dropdown
- Formatting A
- Attach file
- Link
- Emoji
- Drive
- Image
- Confidential mode lock
- Pen/signature
- More

Right:

- Trash icon

Send button:

- Height: 36px
- Border radius: 18px
- Background: `#0b57d0`
- Text: white
- Dropdown split section

```css
.send-button {
  height: 36px;
  border-radius: 18px;
  background: #0b57d0;
  color: white;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
}
```

---

# 11. Page B: Google/Gmail Sign-In Page

This screenshot shows the Google sign-in page for Gmail.

## Viewport and Background

- Full viewport
- Background: very light blue-gray `#f0f4fb` or `#f3f7ff`
- Centered large white sign-in card

```css
.signin-page {
  min-height: 100vh;
  background: #f0f4fb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

## Sign-In Card

Approximate dimensions:

- Width: **1280px**
- Height: **495px**
- Background: white
- Border radius: **32px**
- No visible border
- Very subtle/no shadow
- Layout: two columns
- Padding: 48px

```css
.signin-card {
  width: min(1280px, calc(100vw - 96px));
  min-height: 495px;
  background: #fff;
  border-radius: 32px;
  padding: 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 80px;
}
```

## Left Column

Elements:

1. Google “G” logo, approx. 48px
2. Heading: **Sign in**
3. Subtitle: **to continue to Gmail**

Spacing:

- Logo at top-left
- Heading about 36px below logo
- Subtitle about 20px below heading

Typography:

```css
.signin-title {
  font-size: 44px;
  font-weight: 400;
  line-height: 1.18;
  color: #1f1f1f;
}

.signin-subtitle {
  font-size: 16px;
  color: #1f1f1f;
}
```

## Right Column

Elements:

1. Outlined email input
2. **Forgot email?** link
3. Guest mode explanation text
4. **Create account** text button
5. **Next** blue button

### Email Input

- Width: full column, approx. 565px
- Height: **64px**
- Border: 2px solid Google blue
- Border radius: 4px
- Floating label: **Email or phone**
- Label background white
- Cursor visible inside field

```css
.input-wrap {
  position: relative;
  width: 100%;
  margin-top: 96px;
}

.input-wrap label {
  position: absolute;
  top: -9px;
  left: 12px;
  background: #fff;
  padding: 0 4px;
  font-size: 14px;
  color: #0b57d0;
  font-weight: 500;
}

.input-wrap input {
  width: 100%;
  height: 64px;
  border: 2px solid #0b57d0;
  border-radius: 4px;
  font-size: 18px;
  padding: 0 16px;
  outline: none;
}
```

### Links

Blue link color: `#0b57d0`
Font size: 16px
Weight: 500

Text shown:

- **Forgot email?**
- `Learn more about using Guest mode`
- **Create account**

### Guest Mode Text

Text:

`Not your computer? Use Guest mode to sign in privately. Learn more about using Guest mode`

Position: around the middle-lower part of the right column, below email input.

### Bottom Actions

Right aligned at card bottom:

- Create account: text button, blue text
- Next: blue pill/rounded rectangle

Next button:

- Width: approx. 96px
- Height: 48px
- Border radius: 24px
- Background: `#0b57d0`
- Color: white

```css
.signin-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 32px;
  margin-top: 52px;
}

.next-button {
  height: 48px;
  min-width: 96px;
  border-radius: 24px;
  background: #0b57d0;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 500;
}
```

## Footer

Below the card:

- Same width as card
- Left: language selector `English (United States)` with small chevron
- Right: links `Help`, `Privacy`, `Terms`

```css
.signin-footer {
  width: min(1280px, calc(100vw - 96px));
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 20px 0;
  font-size: 14px;
  color: #1f1f1f;
}

.footer-links {
  display: flex;
  gap: 36px;
}
```

---

# 12. Icons

Use a consistent line icon set, such as:

- Material Symbols
- Material Icons
- Lucide Icons
- Heroicons

For closest Gmail feel, use **Material Symbols Rounded**.

Recommended icon sizes:

| Context | Size |
|---|---:|
| Header icons | 24px |
| Sidebar icons | 20px |
| Category tab icons | 20px |
| Email row icons | 18px |
| Compose toolbar icons | 18px–20px |
| Right rail icons | 22px |

Icon color defaults:

```css
.icon {
  color: #5f6368;
}

.icon.active {
  color: #0b57d0;
}
```

---

# 13. Logo Treatment

## Gmail Logo

For public or safe prototypes, do not use the real Gmail logo. Use a simplified placeholder:

- Small multicolor M-like mark
- Text “Mail” or “Gmail” only if internal/prototyping use allows it

## Google Sign-In Logo

For public prototypes, use a simplified multicolor G-like placeholder or neutral logo.

---

# 14. Responsive Behavior

Desktop fidelity is the priority.

Suggested responsive behavior:

## Under 1100px

- Reduce search bar width
- Collapse sidebar counts
- Reduce category tabs to icons + labels only
- Hide right rail

## Under 800px

- Sidebar becomes narrow icon rail
- Inbox list fills remaining width
- Hide email preview text
- Compose window becomes full-width bottom sheet

## Under 600px

- Sign-in card becomes single-column
- Card width: `calc(100vw - 32px)`
- Card padding: 32px 24px
- Sign-in heading: 36px
- Footer stacks or wraps

---

# 15. Recommended File Structure

```text
src/
  App.jsx
  main.jsx
  styles.css
  data/
    emails.js
  components/
    GmailHeader.jsx
    Sidebar.jsx
    InboxPanel.jsx
    CategoryTabs.jsx
    EmailRow.jsx
    RightRail.jsx
    ComposeWindow.jsx
    SignInPage.jsx
```

Routes or state examples:

```text
/inbox
/inbox-compose
/signin
```

Or create a simple toggle at the top for testing states:

```js
const page = "inbox" | "compose" | "signin";
```

---

# 16. Implementation Prompt for an LLM/Coding Agent

Copy and paste this section into a coding agent.

```markdown
You are a senior frontend engineer and UI designer.

Recreate the Gmail screens from the provided screenshots as a high-fidelity frontend prototype.

The screenshots include:

1. Gmail inbox with compose window open
2. Gmail inbox without compose window
3. Google/Gmail sign-in page

Use the screenshots as the source of truth. Do not create a generic email UI. Match the layout, spacing, colors, typography, icons, rows, tabs, compose window, and sign-in card as closely as possible.

Build using React + CSS unless another stack is specified.

Create three views:

- `/inbox`
- `/inbox-compose`
- `/signin`

Use mock data for the emails. Use the visible Norwegian labels from the screenshots:

- Skriv ny
- Søk i e-post
- Innboks
- Stjernemerket
- Utsatt
- Viktig
- Sendt
- Utkast
- Kjøp
- Sosialt
- Oppdateringer
- Forumer
- Reklame
- Mer
- Etiketter
- Notes
- Oppgrader
- Primær
- Reklame
- Sosialt
- Oppdateringer
- Skriv ny e-post
- Til
- Kopi
- Blindkopi
- Emne
- Send

Use the design tokens and measurements from this markdown file.

Important visual requirements:

- App background: #f6f8fc
- Inbox panel: white with rounded top corners
- Header height: 64px
- Left sidebar width: 256px
- Right rail width: 56px
- Search bar: 720px wide, 48px tall, pill-shaped, #eaf1fb
- Compose button: 132px × 56px, #c2e7ff, radius 16px
- Active sidebar item: #d3e3fd
- Email rows: 40px high, compact, thin dividers
- Active category underline: #0b57d0, 3px
- Compose window: fixed bottom-right, 545px × 500px, white, shadow, rounded top corners
- Compose header: #f2f6fc
- Storage warning strip: #f1f3f4
- Sign-in page background: #f0f4fb
- Sign-in card: 1280px wide, approx. 495px high, white, 32px border radius, two columns
- Sign-in input: 64px high, 2px blue border, floating label
- Next button: #0b57d0, 96px × 48px, pill radius

Use Material Symbols Rounded or a similar icon library.

If real logos or brand assets are unavailable, create simple placeholder SVGs that visually approximate the layout without depending on external assets.

Keep the code clean and componentized.

After implementing, compare against the screenshots and refine spacing, font sizes, and colors.
```

---

# 17. Quality Checklist

Before finishing, verify:

- Header height and alignment match the screenshot
- Sidebar width and active item styling match
- Search bar size, color, and radius match
- Inbox panel starts at the right x-position and has rounded top corners
- Toolbar icons are aligned and spaced correctly
- Category tabs have correct labels, badges, preview text, and underline
- Email rows are compact and show correct sender/subject/time hierarchy
- Attachment chips are rounded and sized correctly
- Right rail has vertical icons and plus button
- Compose window is docked bottom-right with correct size and shadow
- Compose warning strip text matches the screenshot
- Sign-in card is large, centered, two-column, rounded, and spacious
- Sign-in input has floating blue label and 2px blue outline
- Footer language and links align under the sign-in card

---

# 18. Notes on Accuracy

The screenshots appear to be captured on a large desktop viewport. Prioritize desktop accuracy first. Make the UI responsive only after the desktop recreation is visually close.

Use pixel approximations where needed. The most important qualities are:

1. Correct structure
2. Correct spacing
3. Correct colors
4. Correct typography
5. Correct component behavior and states

