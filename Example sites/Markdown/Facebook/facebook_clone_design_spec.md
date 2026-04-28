# Facebook Clone Design Spec From Screenshots

Use this markdown file as a design brief/prompt for an LLM or frontend coding agent. The goal is to recreate the visible Facebook pages/states from the screenshots as closely as possible for internal learning, prototyping, or UI analysis.

> Important: If this is used publicly, replace real brand names, logos, profile names, personal data, product images, listings, ads, and copyrighted/trademarked material with fictional equivalents. For private/internal study, the screenshots are the visual source of truth.

---

# Master Prompt

You are a senior frontend engineer and UI designer.

Recreate the Facebook web interface shown in the provided screenshots as a high-fidelity frontend clone. Do not redesign it. Do not modernize it. Do not simplify it into a generic social-media template. Match the layout, colors, typography, spacing, component shape, density, icon style, sidebars, cards, marketplace screens, feed screens, login screen, and modal/creation states as closely as possible.

The screenshots include these states/pages:

1. Facebook Marketplace listing creation: “Vare til salgs” form with preview panel.
2. Facebook Marketplace create listing type selection: “Opprett ny oppføring”.
3. Facebook Marketplace browse page: product grid and left marketplace navigation.
4. Facebook home/feed page: left navigation, stories, composer, feed post, right ads/friend requests column.
5. Facebook login page: split illustration/login panel.

Create separate routes or screen components for each state.

Suggested routes:

```text
/login
/home
/marketplace
/marketplace/create
/marketplace/create/item
```

Use mock data where needed. Match the screenshots visually before adding interactions.

---

# Global Visual System

## Overall Style

The interface uses Facebook’s clean, dense desktop web style:

- Light grey app background.
- White cards and sidebars.
- Rounded search fields and icon buttons.
- Strong Facebook blue active states.
- Subtle borders and shadows.
- System sans-serif typography.
- Dense navigation and list spacing.
- Fixed/sticky top navigation on main app screens.
- Left sidebar navigation on home and marketplace.
- Right sidebar on home feed.

## Design Tokens

Use these approximate tokens:

```css
:root {
  --fb-blue: #0866ff;
  --fb-blue-dark: #075ce5;
  --fb-blue-light: #e7f3ff;

  --bg-main: #f0f2f5;
  --bg-page-soft: #f4f6fa;
  --surface: #ffffff;
  --surface-muted: #f0f2f5;
  --surface-hover: #e4e6eb;
  --surface-active: #e7f3ff;

  --text-primary: #050505;
  --text-secondary: #65676b;
  --text-muted: #8a8d91;
  --text-disabled: #bcc0c4;

  --border-light: #dddfe2;
  --border-medium: #ced0d4;
  --border-strong: #c4c7cc;

  --danger: #e41e3f;
  --success: #31a24c;
  --warning: #f7b928;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 999px;

  --shadow-nav: 0 1px 2px rgba(0, 0, 0, 0.12);
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.15);
  --shadow-floating: 0 4px 12px rgba(0, 0, 0, 0.18);

  --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  --topbar-height: 56px;
  --left-sidebar-width: 360px;
  --marketplace-create-sidebar-width: 440px;
  --right-sidebar-width: 360px;
}
```

---

# Typography

Use system font. Approximate sizing:

| Element | Size | Weight | Color | Notes |
|---|---:|---:|---|---|
| Main page title | 24–28px | 700 | `#050505` | Marketplace, create screens |
| Section title | 20–22px | 700 | `#050505` | “Dagens forslag”, “Velg oppføringstype” |
| Card title/listing price | 18–22px | 700 | `#050505` | Product prices, post titles |
| Body text | 15–16px | 400 | `#050505` | Nav labels, post text |
| Secondary text | 13–15px | 400 | `#65676b` | Metadata, descriptions |
| Muted placeholder | 15–17px | 400 | `#65676b` | Search, input placeholders |
| Login hero text | 54–64px | 700 | `#050505` / blue | Very large display type |
| Button text | 14–16px | 600 | varies | Facebook button style |

Line height should be tight and practical:

```css
body { font-family: var(--font-main); font-size: 15px; line-height: 1.333; }
h1 { font-size: 28px; line-height: 1.15; font-weight: 700; }
h2 { font-size: 22px; line-height: 1.2; font-weight: 700; }
```

---

# Shared Components

## Top Navigation Bar

Used on `/home` and `/marketplace`.

### Layout

- Fixed at top.
- Height: `56px`.
- Background: white.
- Bottom shadow: subtle.
- Three zones:
  - Left: Facebook logo + search.
  - Center: large nav icons.
  - Right: circular action buttons.

### Left zone

- Facebook logo: blue circle/icon, approx `40x40px`.
- Search input:
  - Width around `240px` on home.
  - Background `#f0f2f5`.
  - Border radius: pill.
  - Height `40px`.
  - Placeholder: “Søk på Facebook”.
  - Search icon left, text 15–16px.

### Center nav

- Icons evenly spaced.
- Each nav item width roughly `110–130px`.
- Height full topbar.
- Active tab:
  - Icon blue.
  - Blue underline `3px` at bottom.
- Inactive icons grey/black line style.
- Marketplace active screen uses store icon active.
- Home active screen uses home icon active.

### Right zone

- Circular icon buttons: `40x40px`.
- Background `#e4e6eb` or very light grey.
- Gap: `8px`.
- Icons: grid/menu, messenger, notifications, profile.
- Notification badge:
  - Red `#e41e3f`.
  - Size `18–22px`.
  - White number.
  - Positioned top-right.

---

## Left Sidebar Navigation

### Home sidebar

Width: approx `360px` including padding.
Background: same as page `#f0f2f5`.
Starts below topbar.
Padding: `16px 12px`.

Navigation item:

```css
.sidebar-item {
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  font-size: 15px;
  font-weight: 600;
}
.sidebar-item:hover { background: #e4e6eb; }
```

Icons:

- Size `32–36px` circular/icon-like.
- Some colorful icons for Meta AI, Friends, Memories, Saved, Groups, Reels.
- User row has grey avatar circle.

Divider:

- Border top `1px solid #ced0d4`.
- Margin `12px 8px`.

Shortcut section:

- Title “Dine snarveier” grey bold.
- Smaller rows with image thumbnails, `32x32px`, rounded.

### Marketplace sidebar

Width approx `360px`.
White or near-white background.
Border-right/shadow subtle.
Padding top below topbar.

Header:

- Title “Marketplace” `28px`, bold.
- Gear icon circular button on right.

Search:

- Rounded pill input, height `40px`, background `#f0f2f5`.
- Placeholder “Søk på Marketplace”.

Nav rows:

- Height `52–56px`.
- Left circular grey/blue icon.
- Text bold/semi-bold.
- Selected row light grey/blue background.
- Active icon blue circle.

Create listing button:

- Full width.
- Height `44px`.
- Background `#e7f3ff`.
- Text blue, bold.
- Border radius `8px`.
- Label: “+ Opprett ny oppføring”.

Sections:

- `Sted`, `Kategorier`.
- Section headings `20px`, bold.
- Links blue.

---

## Floating Compose/Edit Button

Used bottom-right on marketplace/create screens.

- Position: fixed bottom `24px`, right `24px`.
- Size `48x48px`.
- White circle.
- Shadow `0 2px 8px rgba(0,0,0,.2)`.
- Black pencil icon centered.

---

# Page 1: Facebook Marketplace Browse `/marketplace`

Screenshot: Marketplace grid with `Dagens forslag`.

## Layout

- Full app background `#f0f2f5`.
- Topbar fixed, height 56px.
- Left marketplace sidebar fixed width about `360px`.
- Main content starts after sidebar.
- Main padding: top `72px`, left/right `32px`.
- Content grid fills available width.

## Main header

- Left: `Dagens forslag`, bold `24px`.
- Right/top: location link `København V · 20 km`, blue, with location pin.

## Product grid

- 4 columns on large desktop.
- Gap: `12–16px` horizontal, `24px` vertical.
- Card has no visible container background; image + text.
- Image:
  - Aspect ratio approx `1.05:1` or square-ish.
  - Width full.
  - Height around `300px` in screenshot depending viewport.
  - Border radius `8px`.
  - Object fit cover.
- Text below:
  - Price `20–22px`, bold.
  - Title `16px`, regular/medium.
  - Location `15px`, grey.

Example mock listings visible:

```js
[
  { price: "DKK 10 000", title: "1 golf 4", location: "Gladsaxe" },
  { price: "DKK 5 000", title: "iPhone 16 pro Grey", location: "Copenhagen" },
  { price: "DKK 890 000", title: "Billig andel på Nørrebro med stor altan - søger BYTTE til større", location: "Copenhagen" },
  { price: "DKK 1 300 000", title: "Kolonihave Ishøj", location: "Ishøj" }
]
```

## Sidebar visible labels

- Marketplace
- Search placeholder: `Søk på Marketplace`
- Bla gjennom alle
- Varsler
- Tilgang til Marketplace
- Kjøp
- Salg
- `+ Opprett ny oppføring`
- Sted
- Copenhagen · Innenfor 20 km
- Kategorier
- Kjøretøy
- Utleie av eiendom

---

# Page 2: Marketplace Create Type `/marketplace/create`

Screenshot: `Opprett ny oppføring` with 3 centered cards.

## Layout

- No full topbar center nav; a modal-like creation layout.
- Left sidebar width: approx `360px`.
- Main content background `#f0f2f5`.
- Top left: close circle + Facebook logo.
- Top right: round action icons.

## Left panel

- White background.
- Width `360px`.
- Full height.
- Subtle right border/shadow.
- Top close button:
  - Grey circle `48x48px`.
  - White X icon.
- Facebook logo next to close button, size `48x48px`.
- Title: `Opprett ny oppføring`, `24–28px`, bold.
- Nav card selected:
  - Background `#f0f2f5`.
  - Border radius `8px`.
  - Height around `52px`.
  - Blue circular icon on left.
  - Text: `Velg oppføringstype`.
- Divider.
- Other nav rows:
  - `Dine oppføringer`
  - `Hjelp for selgere`
  - Grey circular icon left.

## Main content

- Centered vertically/horizontally in remaining area.
- Heading: `Velg oppføringstype`, `22px`, bold.
- Cards row: 3 cards, equal size.

### Listing type cards

- Width approx `160px`.
- Height approx `210px`.
- Background white.
- Border `1px solid #dddfe2`.
- Border radius `10–12px`.
- Shadow subtle.
- Padding `24px 16px`.
- Text centered.
- Icon/illustration top:
  - Circle illustration, approx `72x72px`.
- Title bold `15–16px`.
- Description grey `13–14px`, 2–3 lines.

Cards:

1. `Vare til salgs` — “Opprett én oppføring for en eller flere ting du vil selge.”
2. `Kjøretøy til salgs` — “Selg en bil, lastebil eller annen type kjøretøy.”
3. `Bolig til salgs eller leie` — “Publiser et hus eller en leilighet til salgs eller leie.”

---

# Page 3: Marketplace Item Listing Form `/marketplace/create/item`

Screenshot: `Vare til salgs` creation form with live preview.

## Layout

- Left form panel: approx `440px` wide.
- Main preview area: remaining width.
- Background main: `#f0f2f5`.
- Left panel white, full height, scrollable.
- Top area has close button + Facebook logo.
- Preview card centered with shadow.

## Left form panel

### Header

- Small breadcrumb/section label: `Marketplace`, grey `13–14px`.
- Title: `Vare til salgs`, `26–28px`, bold.
- Disabled save draft button top right:
  - Text `Lagre utkast`.
  - Background `#e4e6eb`.
  - Text disabled grey.
  - Border radius `8px`.
  - Height `44px`.

### User block

- Avatar circle `48px`, grey placeholder.
- Name: `Marcus Grude-Grødem`, bold.
- Metadata: `Publiseres på Marketplace · Offentlig`, grey.

### Image uploader

Label: `Bilder · 0/10 Du kan legge til opptil 10 bilder.`

Upload box:

- Width full.
- Height approx `190px`.
- Border `1px solid #ced0d4`.
- Border radius `6px`.
- White background.
- Centered icon and text.
- Icon small stacked photo/add symbol in grey circle.
- Text:
  - `Legg til bilder`, bold.
  - `eller dra og slipp`, grey.

### Phone upload prompt

- Light grey rounded box.
- Height around `74px`.
- Display flex.
- Phone icon left.
- Text: `Last opp bilder rett fra telefonen. Finn ut mer`.
- Button right: `Prøv det`, grey rounded.

### Required section

- Heading `Obligatorisk`, `20px`, bold.
- Description `Beskriv det så godt du kan.`, grey.
- Input:
  - Placeholder `Tittel`.
  - Height `70px`.
  - Border `1px solid #ced0d4`.
  - Border radius `12px`.
  - Padding `16px 20px`.
  - Font `16px`.

### Bottom progress/footer

- Sticky footer at bottom of left panel.
- Progress bar:
  - Blue filled segment ~50%.
  - Grey remainder.
  - Height `8px`.
  - Rounded.
- Disabled next button:
  - Full width.
  - Height `48px`.
  - Background `#e4e6eb`.
  - Text `Neste`, grey.
  - Border radius `8px`.

## Preview panel

### Outer card

- Large white card centered in main area.
- Width around `1180px`.
- Height around `760px`.
- Border radius `8px`.
- Shadow `0 2px 12px rgba(0,0,0,.2)`.
- Padding top `24px`.
- Title above preview inside card: `Forhåndsvisning`, bold.

### Inner preview frame

- Border `1px solid #dddfe2`.
- Border radius `8px`.
- Display flex.
- Left media area 65%, right details area 35%.
- Height approx `670px`.

Left media area:

- Background `#f0f2f5` / very light grey.
- Centered text block.
- Large bold grey title: `Forhåndsvisning av oppføringen`.
- Description grey, centered, max width.

Right details area:

- White background.
- Border-left `1px solid #dddfe2`.
- Padding `20px`.
- Placeholder listing text grey:
  - `Tittel`, large bold grey.
  - `Pris`, medium grey.
  - `Oppført for noen sekunder siden her: København V`.
- Details section:
  - `Detaljer`, bold grey.
  - `Beskrivelsen vises her.`
- Divider.
- Seller information row:
  - `Selgerinformasjon` bold grey.
  - info icon.
  - `Selgeropplysninger` right/grey.
- Seller row:
  - Avatar grey circle.
  - Name grey bold.
- Bottom sticky/anchored contact area:
  - Disabled button `Melding` full width grey.
  - Small blue link `Finn ut mer` followed by grey disclosure text.

---

# Page 4: Facebook Home Feed `/home`

Screenshot: main feed with stories, post composer, post card, right ads/friend requests.

## Layout

- Top nav fixed `56px`.
- Background `#f0f2f5`.
- Three-column layout:
  - Left sidebar `360px`.
  - Center feed `680–760px`.
  - Right sidebar `360px`.
- Main content starts below topbar with top margin `16px`.

## Center feed

### Composer card

- White card.
- Border radius `10–12px`.
- Shadow subtle.
- Padding `12px 16px`.
- Width approx `680px`.
- Row:
  - Avatar `40px`.
  - Input pill background `#f0f2f5`, height `44px`, text “Hva tenker du på, Marcus?”
  - Icons to right: live video red, photo green, smile yellow.

### Stories row

- Horizontal row of story cards.
- Gap `8px`.
- Height approx `245px`.
- First card:
  - White card.
  - Grey avatar placeholder upper image area.
  - Blue plus circle overlapping.
  - Text `Opprett en historie`.
- Other story cards:
  - Width `140px`.
  - Height `245px`.
  - Rounded corners `10px`.
  - Image background cover.
  - Gradient overlay at bottom.
  - Circular profile ring top.
  - Name white bottom.
- Right arrow overlay on final/edge story.

### Feed post card

- White card.
- Border radius `10px`.
- Shadow subtle.
- Width same as composer.
- Header:
  - Page/profile avatar.
  - Page name: `SAS EuroBonus🥇Eurobonusjeger 🇳🇴`.
  - Metadata: `EuroBonusguiden.no · 8 t · public icon`.
  - Three dots and X on right.
- Post title text:
  - Large-ish `22px`, bold.
  - `Nye bestillingsavgifter på SkyTeam-bonusbilletter`
- Bullet list inside post:
  - Standard bullets.
  - Font 16px.
- Link preview:
  - Border top or separate grey area.
  - Image left, text right.
  - Site label uppercase grey.
  - Title bold.
  - Snippet grey.

## Right sidebar

- Width approx `360px`.
- Padding `16px`.
- Section title grey bold `17px`.

Sponsored cards:

- Row with image `160x110` and text.
- White/transparent container.
- Image rounded `8px`.
- Text title bold, URL grey.
- Two visible ads.

Divider line.

Friend request:

- Section `Venneforespørsler`, link `Se alle` blue.
- Avatar circle.
- Name `C. C.`.
- Time `1 d`.
- Buttons:
  - Confirm blue `Bekreft`.
  - Remove grey `Fjern`.
  - Height `40px`, border radius `6px`.

Birthday section begins below.

---

# Page 5: Facebook Login `/login`

Screenshot: login page with left illustration/hero and right form.

## Layout

- Full viewport white.
- Two equal columns.
- Vertical divider at center `1px solid #dddfe2`.
- Bottom subtle line/shadow.
- No normal app topbar.

Left column:

- Facebook logo top-left-ish, blue, size `64px`.
- Large hero text near lower-left:
  - `Explore`
  - `the`
  - `things`
  - `you love.`
- Font size approx `58–64px`.
- Weight `700`.
- Line-height `1.05`.
- `you love.` in Facebook blue.
- Decorative illustration cards around center/right of left column:
  - Overlapping image cards.
  - Rounded corners.
  - Small emoji bubble.
  - Heart bubble.
  - Profile circle.
  - Blue/white carousel dots.

Right column:

- Centered login form, max width around `560px`.
- Form title `Log in to Facebook`, 18px bold.
- Inputs:
  - Width full.
  - Height `58px`.
  - Border `1px solid #ccd0d5`.
  - Border radius `12px`.
  - Padding `0 16px`.
  - Placeholder grey.
  - Margin-bottom `12px`.
- Login button:
  - Full width.
  - Height `48px`.
  - Background Facebook blue.
  - White text.
  - Border radius pill.
  - Font 15–16px, medium/bold.
- Forgotten password link centered.
- Create new account button:
  - Full width.
  - Height `44px`.
  - White background.
  - Blue text.
  - Blue border.
  - Border radius pill.
- Meta logo centered below.

Approx CSS:

```css
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
}
.login-left, .login-right {
  position: relative;
  min-height: 100vh;
}
.login-right {
  border-left: 1px solid #dddfe2;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

# Icon Style

Use one consistent icon library, preferably:

- Lucide React for generic icons.
- Or inline SVG for exact control.

Match Facebook style:

- Round grey icon backgrounds.
- Filled/solid-ish icons where appropriate.
- Active icons blue.
- Icon size usually `20–24px` inside `36–44px` circles.
- Topbar main icons approx `28px`.

For the Facebook logo, use either:

1. A simple blue circle with white lowercase `f` for prototyping.
2. A real logo only for private/internal reproduction.

---

# Spacing and Sizing Summary

| Area | Size |
|---|---:|
| Topbar height | 56px |
| Topbar icon button | 40px |
| Main sidebar width | 360px |
| Create item sidebar width | 440px |
| Feed center width | 680–760px |
| Right sidebar width | 320–360px |
| Story card | 140 × 245px |
| Marketplace product image | responsive, approx square |
| Marketplace create card | 160 × 210px |
| Form input height | 56–70px |
| Login input height | 58px |
| Primary button height | 44–48px |
| General card radius | 8–12px |
| Pill radius | 999px |

---

# Responsive Behavior

Desktop fidelity is the priority because screenshots are desktop.

After matching desktop:

- Below `1100px`, hide or collapse right sidebar.
- Below `900px`, reduce left sidebar width or hide it behind menu.
- Feed center remains centered.
- Marketplace grid moves from 4 columns to 3, 2, then 1.
- Login page stacks vertically on small screens and hides decorative illustration if needed.

---

# Implementation Requirements

Use React, HTML/CSS, or Tailwind. React is recommended because of repeated components.

Recommended component structure:

```text
src/
  App.jsx
  routes/
    LoginPage.jsx
    HomePage.jsx
    MarketplacePage.jsx
    MarketplaceCreatePage.jsx
    MarketplaceCreateItemPage.jsx
  components/
    FacebookLogo.jsx
    TopNav.jsx
    IconButton.jsx
    SidebarItem.jsx
    MarketplaceSidebar.jsx
    ProductCard.jsx
    StoryCard.jsx
    ComposerCard.jsx
    FeedPost.jsx
    RightRail.jsx
    CreateListingSidebar.jsx
    ListingTypeCard.jsx
    ListingPreview.jsx
  styles/
    globals.css
```

If creating a single-file prototype, keep sections clearly separated and use CSS variables.

---

# Interaction Notes

Add only lightweight interactions:

- Hover states on nav rows, icon buttons, product cards.
- Active selected navigation state.
- Search/input focus states.
- Marketplace create cards should be clickable and route to `/marketplace/create/item`.
- Close button can route back to `/marketplace`.
- Floating edit button can be static.

Do not implement real Facebook functionality, backend, login, marketplace posting, messaging, or data persistence.

---

# Final Quality Checklist

Before finishing, compare to screenshots:

- Does the topbar height and icon positioning match?
- Is the Facebook blue close to `#0866ff`?
- Are sidebars the correct width and density?
- Is the marketplace grid image size and spacing close?
- Is the create listing screen centered with the same card proportions?
- Is the item form preview split correctly into media/details columns?
- Does the feed have the correct three-column layout?
- Do story cards match the height, rounded corners, and overlay feel?
- Does the login page split into two equal columns with large hero type?
- Are disabled buttons grey and visually inactive?
- Are borders and shadows subtle, not heavy?
- Does it feel like the provided Facebook screenshots, not a generic clone?

---

# Final Instruction to Coding Agent

Recreate all provided screenshots as a high-fidelity Facebook desktop web clone.

Use the screenshots as the source of truth. Build the UI first, then compare and refine until spacing, typography, layout, colors, icon scale, cards, sidebars, and empty/disabled states are close to the screenshots.
