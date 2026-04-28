# WhatsApp Design Clone Brief — Screenshot-Based Markdown Specification

Use this file as a prompt/specification for an LLM or frontend agent to recreate the visual design shown in the provided screenshots.

> **Important use note:** This is for internal learning, prototyping, UI practice, or design analysis. If used publicly, replace WhatsApp logos, brand names, real user names, avatars, phone numbers, and copyrighted imagery with fictional equivalents.

---

## 1. Objective

Recreate three WhatsApp-inspired pages/states from screenshots with high visual fidelity:

1. **WhatsApp Web — Chat list home state**
2. **WhatsApp Web — Communities state**
3. **WhatsApp marketing landing page — “Message privately” hero**

The screenshots are the visual source of truth. The clone should match layout, proportions, colors, typography, spacing, navigation, cards, buttons, icons, avatars, empty states, and general UI feeling.

Do not redesign. Do not make it “better.” Recreate what is visible.

---

## 2. Global Design Direction

The design is clean, minimal, spacious, and product-focused. It uses:

- Soft off-white backgrounds
- WhatsApp green as the primary accent
- Rounded pills and cards
- System-style typography
- Thin borders and subtle dividers
- Light gray iconography
- Large empty states
- Sparse, practical UI controls
- Rounded hero imagery on the marketing page

The UI should feel like a polished modern communication app, with strong whitespace and calm visual hierarchy.

---

## 3. Recommended Tech Stack

Use either:

```text
React + CSS Modules
React + Tailwind
HTML + CSS + JavaScript
Next.js if routing is needed
```

Recommended route/page structure:

```text
/
/web-chat
/web-communities
/landing
```

If building a single-page demo, use tabs or buttons to switch between the three screenshots.

---

## 4. Global Typography

### Font family

Use a modern system font stack:

```css
--font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

WhatsApp Web visually resembles a system UI font. Avoid decorative fonts.

### General typography scale

```css
--font-xs: 12px;
--font-sm: 14px;
--font-md: 16px;
--font-lg: 20px;
--font-xl: 24px;
--font-2xl: 30px;
--font-hero: 72px;
```

### Text weights

```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Text colors

```css
--text-primary: #111111;
--text-secondary: #545454;
--text-muted: #667781;
--text-light: #ffffff;
--text-green: #008069;
```

---

## 5. Global Color Tokens

Use these approximate values:

```css
:root {
  --wa-green: #25d366;
  --wa-green-dark: #00a884;
  --wa-green-text: #008069;
  --wa-green-button: #1ed760;
  --wa-green-soft: #d9ffd6;
  --wa-green-pill: #d9fdd3;

  --background-app: #f7f5f3;
  --background-panel: #ffffff;
  --background-sidebar: #f7f7f7;
  --background-chip: #ffffff;
  --background-muted: #f0f0f0;
  --background-hover: #f5f6f6;

  --border-light: #e9edef;
  --border-medium: #d1d7db;
  --border-dark: #1c1e21;

  --text-primary: #111111;
  --text-secondary: #54656f;
  --text-muted: #667781;
  --text-soft: #8696a0;

  --icon-default: #54656f;
  --icon-muted: #9ca3af;

  --white: #ffffff;
  --black: #000000;
}
```

### Color notes from screenshots

| Element | Approx color |
|---|---:|
| WhatsApp green logo/text | `#25D366` or `#1FA855` |
| Chat unread badge | `#1FA855` |
| Active filter chip | `#D9FDD3` |
| Notification banner | `#D9FFD6` |
| Main app background | `#F7F5F3` |
| Web left sidebar background | `#F7F7F7` |
| Panel white | `#FFFFFF` |
| Muted gray text | `#667781` |
| Borders/dividers | `#E9EDEF` |
| Landing page cream background | `#FCF6EA` / `#FBF3E6` |

---

## 6. Radius, Borders, Shadows

```css
:root {
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-2xl: 34px;
  --radius-pill: 999px;

  --border-thin: 1px solid #e9edef;

  --shadow-soft: 0 1px 2px rgba(0,0,0,0.08);
  --shadow-card: 0 8px 24px rgba(0,0,0,0.06);
}
```

Use shadows very sparingly. WhatsApp Web is mostly flat.

---

# 7. Page 1 — WhatsApp Web Chat List Home State

## 7.1 Screenshot Description

This page shows WhatsApp Web with:

- A narrow vertical navigation rail on the far left
- A wider chat list column
- A large empty right-side main panel
- A centered card prompting the user to download WhatsApp for Mac
- Three shortcut cards below the download card

The viewport is very wide and desktop-oriented.

---

## 7.2 Overall Layout

```text
┌────────────┬──────────────────────────────┬──────────────────────────────────────────┐
│ Icon rail  │ Chat list panel              │ Main empty state panel                   │
│ 64px       │ ~550px                       │ remaining width                          │
└────────────┴──────────────────────────────┴──────────────────────────────────────────┘
```

Approximate dimensions from screenshot:

```css
.app-shell {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 64px 550px 1fr;
  background: #f7f5f3;
}
```

---

## 7.3 Left Icon Rail

Width: `64px`

Background: `#f7f7f7`

Border-right: `1px solid #e9edef`

Layout:

- Icons stacked vertically
- Main nav icons at top
- Utility icons near bottom
- Active item has a pale circular background
- Unread badge appears near top icon

```css
.icon-rail {
  width: 64px;
  background: #f7f7f7;
  border-right: 1px solid #e9edef;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
}

.rail-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #54656f;
}

.rail-icon.active {
  background: #e9edef;
  color: #111111;
}
```

### Icon style

Use Lucide icons or similar line icons:

- Chat/message icon
- Status/circle icon
- Channels/chat bubble icon
- Communities/users icon
- Image/gallery icon
- Settings icon
- User/profile icon

Icon size: `22–24px`

Stroke width: around `2px`

### Notification badge

```css
.notification-badge {
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #1fa855;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
```

Position it overlapping the upper-right of the top nav icon.

---

## 7.4 Chat List Panel

Width: approximately `550px`

Background: `#ffffff`

Border-right: `1px solid #d8dbdf`

Padding:

```css
.chat-panel {
  background: #ffffff;
  border-right: 1px solid #d8dbdf;
  padding: 28px 24px;
  overflow-y: auto;
}
```

---

## 7.5 Chat Header

Left title:

```text
WhatsApp
```

Style:

```css
.chat-title {
  font-size: 30px;
  font-weight: 700;
  color: #1fa855;
}
```

Right icons:

- New chat icon
- More/options vertical dots icon

Container:

```css
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
```

---

## 7.6 Search Bar

Position below header.

Approximate dimensions:

```css
.search-bar {
  height: 46px;
  border-radius: 999px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  color: #667781;
  font-size: 18px;
}
```

Placeholder text:

```text
Search or start a new chat
```

Icon: search icon, 20–22px, gray.

---

## 7.7 Filter Chips

Located under search bar.

Chips:

```text
All
Unread 14
Favourites
Groups 13
+
```

Style:

```css
.filter-row {
  display: flex;
  gap: 10px;
  margin: 14px 0 18px;
}

.filter-chip {
  height: 40px;
  border-radius: 999px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid #d1d7db;
  color: #54656f;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.filter-chip.active {
  background: #d9fdd3;
  border-color: #a8e6a1;
  color: #008069;
}
```

The plus chip is circular:

```css
.filter-chip.add {
  width: 40px;
  padding: 0;
  justify-content: center;
}
```

---

## 7.8 Notification Banner

Text:

```text
Message notifications are off. Turn on
```

Style:

```css
.notification-banner {
  height: 74px;
  border-radius: 18px;
  background: #d9ffd6;
  color: #111111;
  display: flex;
  align-items: center;
  padding: 0 22px;
  gap: 20px;
  margin-bottom: 26px;
}

.notification-banner strong {
  color: #008069;
  font-weight: 700;
}
```

Left icon: muted bell, green.  
Right icon: close `X`, black.

---

## 7.9 Archived Row

```text
Archived                                  1
```

Style:

```css
.archive-row {
  height: 56px;
  display: grid;
  grid-template-columns: 54px 1fr auto;
  align-items: center;
  color: #667781;
  font-size: 18px;
  margin-bottom: 12px;
}
```

Archive icon: gray, 22–24px.

---

## 7.10 Chat List Items

Each chat row should have:

- Avatar area
- Optional group/community label above title
- Chat title
- Message preview
- Right-side timestamp
- Optional unread badge
- Optional muted icon

Approximate layout:

```css
.chat-item {
  min-height: 86px;
  display: grid;
  grid-template-columns: 66px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 8px 8px 8px 12px;
  border-radius: 12px;
}

.chat-item:hover {
  background: #f5f6f6;
}

.avatar {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  object-fit: cover;
  background: #dfe5e7;
}

.chat-label {
  font-size: 14px;
  color: #667781;
  margin-bottom: 3px;
}

.chat-name {
  font-size: 18px;
  font-weight: 500;
  color: #111111;
  margin-bottom: 5px;
}

.chat-preview {
  font-size: 16px;
  color: #667781;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  align-self: start;
  padding-top: 10px;
  text-align: right;
  font-size: 14px;
  color: #667781;
}

.chat-time.unread {
  color: #1fa855;
  font-weight: 700;
}

.unread-count {
  margin-top: 10px;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #1fa855;
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: inline-grid;
  place-items: center;
}
```

### Visible chat examples

Use mock rows similar to:

```text
UMEUS Frederiksberg 🏡
UMEUS | Laundry
+30 697 807 1142: 1,3,8,9,10,11 are done
18:30
7

Johan Schommartz
Okok we try to do in the weekend maybe.
18:14

Mauritania Trip – General Info
~Jesse Mahoney removed +1 (312) 841-2687
17:44
4

UMEUS General Chat 💬
+34 634 58 13 69: Wondering the same, they'v...
17:34
3
```

Replace real names and phone numbers if public.

---

## 7.11 Main Empty Panel

Background: `#f7f5f3`

There is a large centered white card and three smaller cards below.

```css
.main-panel {
  background: #f7f5f3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.empty-content {
  margin-top: -20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

---

## 7.12 Download Card

Dimensions:

```css
.download-card {
  width: 440px;
  min-height: 420px;
  border-radius: 26px;
  background: #ffffff;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  text-align: center;
  padding: 42px;
}
```

Illustration:

- Simple laptop illustration
- Green panel on left
- Cream panel on right
- Phone icon
- Size: approximately `150px wide`

Heading:

```text
Download WhatsApp for Mac
```

```css
.download-card h1 {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 500;
  color: #111111;
}
```

Body:

```text
Make calls and get a faster experience when you download the Mac app.
```

```css
.download-card p {
  font-size: 16px;
  line-height: 1.45;
  color: #667781;
}
```

Button:

```text
Get from App Store
```

```css
.app-store-button {
  height: 42px;
  border-radius: 999px;
  background: #d9fdd3;
  color: #008069;
  font-size: 16px;
  font-weight: 700;
  border: none;
  padding: 0 24px;
}
```

---

## 7.13 Shortcut Cards

Three cards below download card:

```text
Send document
Add contact
Ask Meta AI
```

Layout:

```css
.shortcut-row {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  color: #667781;
  font-size: 16px;
}

.shortcut-card {
  width: 120px;
  height: 120px;
  border-radius: 18px;
  background: #f0eeec;
  display: grid;
  place-items: center;
}
```

Icons:

- Document icon
- Add person icon
- Purple Meta AI flower/star placeholder

---

# 8. Page 2 — WhatsApp Web Communities State

## 8.1 Screenshot Description

This page shows WhatsApp Web’s Communities section:

- Same far-left icon rail
- Communities panel on the left
- Large empty state on the right
- Main text: “Create communities”
- Subtext describing topic-based groups
- Footer encryption note

---

## 8.2 Overall Layout

```css
.communities-shell {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 68px 430px 1fr;
  background: #f7f5f3;
}
```

The communities panel is narrower than the chat list screenshot.

---

## 8.3 Communities Panel

```css
.communities-panel {
  background: #ffffff;
  border-right: 1px solid #d8dbdf;
  padding: 22px 22px;
}
```

Header:

```text
Communities
```

```css
.communities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.communities-title {
  font-size: 24px;
  font-weight: 500;
  color: #111111;
}
```

Right icon: plus inside a circle, black.

---

## 8.4 New Community Row

```text
New community
```

Left icon:

- Green rounded square
- White group/users icon inside

```css
.new-community {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 34px;
}

.new-community-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #1fa855;
  color: #ffffff;
  display: grid;
  place-items: center;
}

.new-community span {
  font-size: 16px;
  color: #111111;
}
```

---

## 8.5 Community Group Block

Visible community:

```text
UMEUS Frederiksberg 🏡
```

Avatar:

- Rounded square image
- Size: around `48px`
- Radius: `10–12px`

```css
.community-root {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.community-root img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.community-root-title {
  font-size: 16px;
  font-weight: 600;
}
```

Subgroup row:

```text
UMEUS | Laundry
~Ifigeneia Siozou: 1,3,8,9,10,11 are done
18:30
7
```

```css
.community-chat {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.community-chat-avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
}

.community-chat-title {
  font-size: 16px;
  font-weight: 500;
  color: #111111;
  margin-bottom: 4px;
}

.community-chat-preview {
  font-size: 14px;
  color: #667781;
}

.community-chat-time {
  font-size: 13px;
  color: #1fa855;
  font-weight: 700;
}

.community-unread {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #1fa855;
  color: white;
  font-size: 12px;
  display: inline-grid;
  place-items: center;
}
```

View all link:

```text
View all
```

```css
.view-all {
  color: #008069;
  font-size: 16px;
  font-weight: 500;
  margin-left: 64px;
}
```

---

## 8.6 Communities Empty State

Right panel:

```css
.communities-main {
  background: #f7f5f3;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Centered content:

```css
.communities-empty {
  text-align: center;
  max-width: 520px;
  transform: translateY(-40px);
}
```

Icon:

- Gray group/users icon
- Approx size: 68px wide
- Color: `#c7c7c7`

Heading:

```text
Create communities
```

```css
.communities-empty h1 {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 400;
  color: #111111;
  margin-top: 28px;
}
```

Body:

```text
Bring members together in topic-based groups and easily send them admin announcements.
```

```css
.communities-empty p {
  font-size: 16px;
  line-height: 1.45;
  color: #54656f;
  margin-top: 16px;
}
```

Bottom encryption note:

```text
Your personal messages in communities are end-to-end encrypted
```

Position:

```css
.encryption-note {
  position: absolute;
  bottom: 42px;
  left: 0;
  right: 0;
  text-align: center;
  color: #667781;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
```

Lock icon: small, 14–16px.

---

# 9. Page 3 — WhatsApp Marketing Landing Page

## 9.1 Screenshot Description

This page shows the official WhatsApp-style landing page hero:

- Cream/off-white background
- Header with logo left
- Navigation links in the center
- Login and Download buttons on right
- Large rounded hero image card
- Big white text overlay: “Message privately”
- Subheading
- Green download CTA
- Floating chat UI elements over the hero image

---

## 9.2 Page Background

```css
.landing-page {
  min-height: 100vh;
  background: #fcf6ea;
  color: #1c1e21;
  font-family: var(--font-main);
}
```

---

## 9.3 Header

Height: approximately `92px`

Horizontal padding: `48–60px`

```css
.landing-header {
  height: 92px;
  padding: 0 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

## 9.4 Logo

Left logo:

```text
WhatsApp
```

Icon: circular WhatsApp-like phone bubble mark.

Color: bright green.

```css
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #25d366;
  font-size: 24px;
  font-weight: 700;
}
```

Logo icon size: `32–36px`

---

## 9.5 Navigation

Center nav links:

```text
Features ▾
Privacy
Help Center
Blog
For Business
Apps
```

Style:

```css
.nav-links {
  display: flex;
  align-items: center;
  gap: 46px;
  font-size: 18px;
  font-weight: 500;
  color: #1c1e21;
}
```

Hover:

```css
.nav-links a:hover {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 6px;
}
```

---

## 9.6 Header Actions

Right buttons:

```text
Log in  >
Download ↓
```

Button dimensions:

```css
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-button,
.download-button {
  height: 64px;
  border-radius: 999px;
  padding: 0 32px;
  font-size: 18px;
  font-weight: 500;
}
```

Login button:

```css
.login-button {
  background: #ffffff;
  border: 2px solid #1c1e21;
  color: #1c1e21;
}
```

Download button:

```css
.download-button {
  background: #25d366;
  border: 2px solid #1c1e21;
  color: #1c1e21;
}
```

Both buttons have black outlines.

Icons:

- Login arrow: right chevron
- Download icon: down arrow

Icon size: `20–22px`

---

## 9.7 Hero Container

Large rounded image card below header.

Spacing:

```css
.hero-wrap {
  padding: 36px 48px 0;
}
```

Hero:

```css
.hero {
  position: relative;
  height: calc(100vh - 140px);
  min-height: 620px;
  border-radius: 28px;
  overflow: hidden;
  background: #222;
}
```

Hero image:

```css
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

Image characteristics:

- Warm city/cafe background
- A young person looking at phone
- Strong shallow depth of field
- Large subject slightly left-center
- Darker left side to support white text
- Warm highlights/bokeh on right

If original image is unavailable, use a placeholder with similar composition.

Add subtle dark overlay:

```css
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.42) 0%,
    rgba(0,0,0,0.18) 42%,
    rgba(0,0,0,0.08) 100%
  );
}
```

---

## 9.8 Hero Text Block

Position: left side, over image.

```css
.hero-copy {
  position: absolute;
  z-index: 2;
  left: 128px;
  top: 160px;
  max-width: 470px;
  color: #ffffff;
}
```

Heading:

```text
Message
privately
```

```css
.hero-copy h1 {
  font-size: 88px;
  line-height: 0.95;
  font-weight: 400;
  letter-spacing: -2.5px;
  margin: 0 0 28px;
}
```

Subheading:

```text
Simple, reliable, private messaging and calling for free*, available all over the world.
```

```css
.hero-copy p {
  font-size: 21px;
  line-height: 1.35;
  font-weight: 400;
  max-width: 430px;
  margin-bottom: 92px;
}
```

CTA button:

```css
.hero-download-button {
  height: 66px;
  border-radius: 999px;
  background: #25d366;
  color: #1c1e21;
  border: none;
  padding: 0 34px;
  font-size: 18px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
```

---

## 9.9 Floating Hero UI Elements

These are decorative WhatsApp-style overlays on top of the hero image.

### Floating group/event label

Near upper-right/mid area:

```text
French Class
[small avatars] & 4 others
```

Position:

```css
.float-class {
  position: absolute;
  z-index: 3;
  top: 150px;
  right: 355px;
  color: white;
}
```

Include:

- Small calendar circle icon to the left
- Text label
- Row of overlapping avatars
- White pill with “& 4 others”

Calendar icon circle:

```css
.calendar-dot {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: #ffffff;
  color: #1c1e21;
  display: grid;
  place-items: center;
}
```

Label:

```css
.float-class-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}
```

Avatars:

```css
.avatar-stack img {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  margin-left: -8px;
}
```

Pill:

```css
.others-pill {
  background: #ffffff;
  color: #5f6368;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 15px;
  font-weight: 600;
}
```

### Join button

Top-right over hero:

```text
Join
```

```css
.join-button {
  position: absolute;
  z-index: 3;
  top: 150px;
  right: 170px;
  height: 54px;
  border-radius: 999px;
  background: #00a884;
  color: #ffffff;
  padding: 0 26px;
  font-size: 21px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
```

Video icon: white.

### Green message bubble

```text
Still on for studying?
11:53 ✓✓
```

Position:

```css
.message-bubble-green {
  position: absolute;
  z-index: 3;
  top: 245px;
  right: 246px;
  background: #d9fdd3;
  color: #1c1e21;
  border-radius: 12px;
  padding: 12px 14px 8px;
  font-size: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.14);
}
```

Timestamp:

```css
.bubble-time {
  font-size: 12px;
  color: #667781;
  text-align: right;
}
```

Read ticks color: `#34b7f1`

### White reply bubble

```text
Natalie
Ready when you are!
11:59
👍 ❤️ 😎
```

Position:

```css
.message-bubble-white {
  position: absolute;
  z-index: 3;
  top: 340px;
  right: 395px;
  width: 270px;
  background: #ffffff;
  color: #1c1e21;
  border-radius: 12px;
  padding: 12px 14px 8px;
  font-size: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.16);
}
```

Name:

```css
.bubble-name {
  color: #7b61ff;
  font-weight: 700;
  font-size: 16px;
}
```

Emoji reaction pill:

```css
.reaction-pill {
  margin-top: 6px;
  display: inline-flex;
  background: #ffffff;
  border-radius: 999px;
  padding: 4px 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18);
}
```

---

# 10. Icons

Recommended icon library:

```bash
npm install lucide-react
```

Use icons such as:

```text
MessageCircle
CircleDashed
Users
Settings
Image
User
Search
Plus
MoreVertical
BellOff
X
Archive
FileText
UserPlus
Lock
Download
ChevronRight
ChevronDown
Video
CalendarDays
```

Icon styling:

```css
.icon {
  width: 22px;
  height: 22px;
  stroke-width: 2;
}
```

Landing page icon strokes may be slightly heavier.

---

# 11. Avatar and Image Handling

For app screens:

- Use circular avatars for chats
- Use rounded-square avatar for communities root item
- Use realistic placeholder photos or gradient placeholders
- Keep avatar dimensions consistent

```css
.avatar-circle {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-square {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
}
```

For landing hero:

- Use one large image with object-fit cover
- Use border radius around the entire hero image
- Use dark overlay if text readability is poor

---

# 12. Responsive Behavior

## Desktop priority

The screenshots are desktop screenshots. Prioritize desktop fidelity first.

## Below 1100px

- Hide or reduce landing nav links
- Reduce hero heading size
- Move floating bubbles closer inward
- Keep the app sidebars fixed width if possible

## Below 768px

For WhatsApp Web:

```text
Show only icon rail + chat/community panel.
Hide the empty right panel or stack it below.
```

For landing page:

```text
Stack header
Collapse nav into menu button
Reduce hero height
Reduce hero text size to 48–56px
Move hero text lower/left with smaller padding
Hide some floating bubbles if needed
```

Example responsive CSS:

```css
@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 56px 1fr;
  }

  .main-panel {
    display: none;
  }

  .landing-header {
    padding: 0 24px;
  }

  .nav-links {
    display: none;
  }

  .hero-copy {
    left: 36px;
    top: 90px;
  }

  .hero-copy h1 {
    font-size: 56px;
  }
}
```

---

# 13. Implementation Checklist

Before final output, compare against the screenshots:

## Layout

- [ ] Far-left WhatsApp Web rail is correct width
- [ ] Chat panel and communities panel widths are close
- [ ] Main panel is centered and spacious
- [ ] Landing hero fills most of the viewport
- [ ] Header spacing matches screenshot

## Typography

- [ ] WhatsApp Web title is green and bold
- [ ] Communities title is black and medium weight
- [ ] Landing hero heading is very large, white, and light weight
- [ ] Body text uses muted gray
- [ ] Buttons use medium/bold weight

## Colors

- [ ] WhatsApp green is consistent
- [ ] App backgrounds are off-white, not pure gray
- [ ] Chat panels are white
- [ ] Notification banner is pale green
- [ ] Landing page background is cream
- [ ] Header buttons have black outlines

## Components

- [ ] Search bar is rounded pill
- [ ] Filter chips are rounded pills
- [ ] Unread badges are green circles
- [ ] Download card is centered and rounded
- [ ] Shortcut cards are square-ish and pale gray
- [ ] Landing hero has rounded corners
- [ ] Floating chat bubbles are layered over image

## Details

- [ ] Icons have consistent stroke style
- [ ] Borders are subtle
- [ ] Avatars have correct size and shape
- [ ] Timestamps align right
- [ ] Empty-state text is centered
- [ ] Encryption note sits near bottom

---

# 14. Suggested Mock Data

Use fictionalized data if needed:

```js
const chats = [
  {
    group: "UMEUS Frederiksberg 🏡",
    name: "UMEUS | Laundry",
    preview: "+30 697 807 1142: 1,3,8,9,10,11 are done",
    time: "18:30",
    unread: 7,
    avatar: "/avatars/laundry.jpg"
  },
  {
    name: "Johan Schommartz",
    preview: "Okok we try to do in the weekend maybe.",
    time: "18:14",
    unread: 0,
    avatar: "/avatars/johan.jpg"
  },
  {
    group: "Mauritania Iron Ore Train Trips",
    name: "Mauritania Trip – General Info",
    preview: "~Jesse Mahoney removed +1 (312) 841-2687",
    time: "17:44",
    unread: 4,
    muted: true,
    avatar: "/avatars/desert.jpg"
  },
  {
    group: "UMEUS Frederiksberg 🏡",
    name: "UMEUS General Chat 💬",
    preview: "+34 634 58 13 69: Wondering the same, they'v...",
    time: "17:34",
    unread: 3,
    avatar: "/avatars/group.jpg"
  }
];
```

---

# 15. Final Prompt for an LLM/Coding Agent

Copy this section when giving the task to another LLM:

```markdown
You are a senior frontend engineer and visual UI designer.

Recreate the attached screenshots as a high-fidelity frontend clone. The screenshots show three WhatsApp-inspired pages/states:

1. WhatsApp Web chat list home screen
2. WhatsApp Web communities screen
3. WhatsApp marketing landing page with “Message privately” hero

Use the screenshots as the source of truth. Do not redesign or generalize the interface. Match layout, colors, typography, spacing, buttons, chips, cards, sidebars, empty states, avatars, badges, icons, and image overlays as closely as possible.

Use React + CSS/Tailwind or plain HTML/CSS/JS. Use mock data. No backend is needed.

Important:
- Desktop fidelity is the first priority.
- Use a system font stack similar to WhatsApp Web.
- Use WhatsApp green, pale green banners, off-white app backgrounds, white panels, muted gray text, and subtle borders.
- Recreate the left icon rail, chat list panel, communities panel, centered download card, shortcut cards, communities empty state, landing header, rounded hero image, large white hero text, green CTA buttons, and floating chat bubbles.
- Use placeholder images if original images are unavailable, but match composition, crop, and mood.
- Replace real names, phone numbers, logos, and copyrighted images with fictional equivalents if the clone will be public.

After implementation, compare the result to the screenshots and refine:
- widths
- heights
- spacing
- font sizes
- colors
- border radius
- icon sizes
- button shapes
- avatar sizes
- floating element positions

Deliver a complete working frontend with clean structure and clear run instructions.
```

---

# 16. Minimal CSS Token Starter

```css
:root {
  --wa-green: #25d366;
  --wa-green-dark: #00a884;
  --wa-green-text: #008069;
  --wa-green-soft: #d9ffd6;
  --wa-green-pill: #d9fdd3;

  --app-bg: #f7f5f3;
  --panel-bg: #ffffff;
  --rail-bg: #f7f7f7;
  --muted-bg: #f0f2f5;
  --cream-bg: #fcf6ea;

  --border-light: #e9edef;
  --border-medium: #d1d7db;

  --text-primary: #111111;
  --text-secondary: #54656f;
  --text-muted: #667781;
  --text-soft: #8696a0;

  --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 28px;
  --radius-pill: 999px;
}
```

---

# 17. Notes on Accuracy

The values in this file are close approximations based on screenshot inspection. The frontend agent should still adjust spacing and sizing visually during implementation. The screenshots remain the final reference.
