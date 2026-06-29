# New Client Website Rebuild — Master Prompt

> **How to use this file:**
> 1. Copy this file into a new empty project folder for the client.
> 2. Fill in every `[FILL IN: ...]` placeholder in the CLIENT BRIEF section below.
> 3. Complete the CONTENT EXTRACTION steps (see Section 2) and drop the files into the project folder.
> 4. Pass this file to the AI with the message: *"Read this file fully, then begin building the website."*
> 5. The AI builds the site and runs its own technical quality checklist.
> 6. **You then run the human eye-test (Section 4) — this is the final step before delivery.** Report back any visual issues and the AI fixes them.

---

## SECTION 1 — CLIENT BRIEF (fill this in before passing to AI)

```
COMPANY NAME:         [FILL IN: e.g. "Apex Roofing Solutions"]
TAGLINE:              [FILL IN: e.g. "Built to last. Backed by 30 years."]
PRIMARY PHONE:        [FILL IN: e.g. "312-555-0100"]
PRIMARY EMAIL:        [FILL IN: e.g. "info@apexroofing.com"]
FULL ADDRESS:         [FILL IN: e.g. "4400 Main St, Chicago, IL 60601"]
EXISTING WEBSITE URL: [FILL IN: e.g. "https://www.apexroofing.com"]

INDUSTRY:             [FILL IN: e.g. "Roofing / Home Services / B2B / Hospitality / Medical / Restaurant / Legal / etc."]
TARGET AUDIENCE:      [FILL IN: e.g. "Homeowners and property managers in the Chicago metro area"]
PRIMARY CONVERSION:   [FILL IN: What should a visitor DO? e.g. "Call for a free estimate" / "Fill out quote form" / "Book an appointment" / "Request a demo"]

BRAND COLORS:
  Primary dark:       [FILL IN: hex or "extract from existing site"]
  Primary mid:        [FILL IN: hex or "extract from existing site"]
  Accent / highlight: [FILL IN: hex or "extract from existing site"]

FONT FEEL:            [FILL IN: choose one — "modern/clean" / "bold/strong" / "friendly/approachable" / "luxury/editorial" / "trustworthy/medical"]

LOGO FILE:            [FILL IN: filename of logo placed in this project folder, e.g. "logo.png" — or "extract from existing site"]

SERVICES OFFERED:
  1. [FILL IN]
  2. [FILL IN]
  3. [FILL IN]
  4. [FILL IN]
  (add more as needed)

INDUSTRIES / AUDIENCES SERVED (if applicable):
  1. [FILL IN]
  2. [FILL IN]

LOCATIONS / SERVICE AREAS:
  1. [FILL IN: e.g. "Chicago, IL"]
  2. [FILL IN]

TESTIMONIALS (copy directly from existing site or provided by client):
  1. Quote: [FILL IN]
     Attribution: [FILL IN: Name, Title, Company]
  2. Quote: [FILL IN]
     Attribution: [FILL IN]
  3. Quote: [FILL IN]
     Attribution: [FILL IN]

KEY DIFFERENTIATORS / "WHY US" POINTS (3-5 bullet points from existing site):
  1. [FILL IN]
  2. [FILL IN]
  3. [FILL IN]

PARTNER / CLIENT LOGOS TO DISPLAY: [FILL IN: list company names, or "none"]

PAGES NEEDED:
  [x] Home
  [ ] Services hub
  [ ] Individual service page
  [ ] Contact page
  [ ] Locations hub
  [ ] Individual location page
  [ ] Industry page
  [ ] Case study page
  [ ] Blog / guide page
  [ ] Legal / privacy policy
  (check all that apply)

SPECIAL REQUIREMENTS OR NOTES: [FILL IN: anything unique — booking widget, multilingual, specific sections to include/exclude, etc.]
```

---

## SECTION 2 — CONTENT EXTRACTION GUIDE (do this before passing to AI)

The goal is to extract all usable content and assets from the existing website in under 2 hours. Follow these steps:

### Step 0 — Identify the platform first (2 min)

Before choosing an extraction tool, check what the site is built on. In Chrome: right-click → View Page Source. Look for clues in the HTML:
- `wixsite.com` or `wix.com` in URLs → **Wix**
- `squarespace.com` in URLs or `data-controller` attributes → **Squarespace**
- `webflow.io` or `webflow.com` → **Webflow**
- `/wp-content/` in URLs → **WordPress**
- Plain `.html` files with no CMS markers → **Static HTML**

**Why this matters:** Wix, Squarespace, and Webflow are JavaScript-heavy — their content is injected at runtime. `wget` will download empty shells for these platforms. WordPress and static HTML sites work with `wget` perfectly.

| Platform | Use this method |
|---|---|
| Wix / Squarespace / Webflow | SingleFile CLI (batch) or SingleFile browser extension per page |
| WordPress | wget mirror — gets everything in one command |
| Static HTML | wget mirror |
| Unknown | Use SingleFile — it always works regardless of platform |

### Step 1 — Save the full site HTML (15-30 min)

**For Wix / Squarespace / Webflow — SingleFile (captures rendered content):**

*Option A — Browser extension, page by page (small sites, <15 pages):*
1. Install [SingleFile](https://chrome.google.com/webstore/detail/singlefile/) in Chrome.
2. Visit each key page (home, services, about, contact, locations, etc.).
3. Click the SingleFile icon — saves each page as a self-contained `.html` file with all images and styles inlined.
4. Save into `existing-site/` folder. Name clearly: `existing-home.html`, `existing-services.html`.
5. Takes ~1 minute per page. A 12-page site = ~15 minutes.

*Option B — SingleFile CLI, all pages at once (larger sites):*
1. First use [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) (free, up to 500 URLs) to crawl the site and export all page URLs as a CSV.
2. Install SingleFile CLI: `npm install -g single-file-cli`
3. Run: `single-file --urls-file urls.txt --output-directory existing-site/`
4. This processes the full URL list automatically and saves each page.

**For WordPress / Static HTML — wget mirror (automated, one command):**
```bash
wget --mirror --convert-links --page-requisites --no-parent -P existing-site/ https://www.CLIENTSITE.com/
```
This recursively downloads the full site tree including all images, CSS, and JS into `existing-site/`.

**Fallback — Browser "Save As":**
In Chrome: File → Save Page As → "Webpage, Complete". Saves HTML + a folder of assets. Works on any platform. Use only if the above options fail.

### Step 2 — Screenshot every page (5 min)

Take a full-page screenshot of: Home, Services, About, Contact (and any other key pages).
- Chrome: DevTools → Ctrl+Shift+P → "Capture full size screenshot"
- Or use [GoFullPage](https://chrome.google.com/webstore/detail/gofullpage/) extension.

Save screenshots as `screenshot-home.png`, `screenshot-services.png`, etc. in this project folder. The AI will use these as visual reference.

### Step 3 — Collect assets (10 min)

From the saved HTML files or the live site, collect:
- **Logo**: Save as `logo.png` or `logo.svg` in the project folder. If only available as a URL, note the URL in the CLIENT BRIEF above.
- **Hero image** (if any): Save as `hero.jpg`.
- **Team / staff photos**: Save as `team-1.jpg`, `team-2.jpg`, etc.
- **Any other branded photography**: Save in an `assets/` subfolder.

If assets are hosted on a CDN (Wix, Squarespace, etc.), right-click → "Save image as" directly from the browser.

### Step 4 — Extract text content (30-45 min)

Open each saved HTML file and copy the following into the CLIENT BRIEF above (if not already filled in):
- Hero headline and subheadline
- Services (name + short description for each)
- About / company story paragraph
- "Why us" / differentiators
- All testimonials (full quote + attribution)
- Contact details (phone, email, address, hours)
- Footer links and legal pages

You do not need to copy everything word for word — just the key content blocks. The AI will rewrite copy for clarity and conversion where needed.

### Step 5 — Note the biggest problems on the existing site

Before handing off, answer these three questions (add answers to SPECIAL REQUIREMENTS above):
1. What is the #1 thing that would make a visitor leave immediately? (slow load, no clear CTA, confusing nav, looks broken on mobile, etc.)
2. Is there a conversion path at all? (can a visitor easily call, book, or contact?)
3. What does the competitor's site do better?

---

## SECTION 3 — AI INSTRUCTIONS (the AI reads from here)

> **AI: Everything above has been filled in by the project owner. Read the CLIENT BRIEF and review any files in this folder (existing-site/, screenshots, logo, assets). Then follow the instructions below to build the website.**

---

### Your task

Build a complete, modern, conversion-optimised static website for the client described in the CLIENT BRIEF above. The output is plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies beyond a Google Fonts link.

**Mobile is not optional.** A large share of visitors — often the majority for local service businesses — will arrive on a phone. Every section, every component, every interaction must work and look intentional on a 375px screen, not just on a 1440px desktop. Do not build desktop-first and patch mobile at the end. Write mobile styles alongside desktop styles from the start.

---

### Step 1 — Design Strategy (do this before writing any code)

Before opening any file, answer the following three questions based on the CLIENT BRIEF. State your answers explicitly at the start of your response so the project owner can review them.

**Q1: What is the single conversion action?**
Based on the PRIMARY CONVERSION field, identify the one action the entire site should drive toward. Every CTA, every section, and every layout decision serves this one action.

**Q2: What visual archetype fits this business?**

Choose the closest match from the list below and explain why in one sentence:

- **Enterprise / B2B**: Clean, minimal, authority-driven. Dark navy or charcoal palette. Whitespace-heavy. Primary trust signals: client logos, case studies, years in business. Primary CTA: quote form or demo request.
- **Hospitality / luxury**: Warm, image-forward, experience-driven. Rich photography sections. Atmospheric hero. Emotional, outcome-focused copy. Primary CTA: booking or enquiry.
- **Local trades / home services**: Urgency-led, locally anchored. Phone number above the fold. Bold CTAs. Before/after proof. Review count visible early. Primary CTA: phone call.
- **Medical / healthcare**: Reassuring, credentialed, clean. Blues or greens. Certifications and staff photos prominent. Plain language. Primary CTA: appointment booking.
- **Restaurant / food**: Appetite-driven. Full-bleed food photography. Menu preview section. Hours and location immediately visible. Primary CTA: reservation or order link.
- **Professional services (legal, finance, accounting)**: Trustworthy, precise, conservative. Serif or clean sans accents. No clutter. Credentials and association logos. Primary CTA: consultation booking.

**Q3: What are the three biggest conversion problems on the existing site?**
Review the screenshots and saved HTML from `existing-site/`. Identify the three most harmful issues — no CTA above fold, no social proof, no mobile layout, confusing navigation, slow images, copy that lists features not outcomes, etc. State them plainly.

Write a one-paragraph design brief that captures all three answers, e.g.:
> *"Primary CTA: phone call for a free roofing estimate. Archetype: local trades — urgency-led, locally anchored. Conversion fixes: no phone number visible above fold, no customer reviews, navigation collapses on mobile."*

This brief governs every layout and section choice in the build.

---

### Step 2 — File structure

Create the following files in the project root. Only create pages that are checked in the PAGES NEEDED list:

```
index.html
styles.css
script.js
[other pages as checked in PAGES NEEDED]
```

Every HTML file links to the same `styles.css` and `script.js`. No inline styles except where absolutely necessary for a one-off layout on a single page (e.g. legal page reading width).

---

### Step 3 — Design system (styles.css)

Build a single CSS file that covers the full design system. Use CSS custom properties at `:root` for all tokens:

```css
:root {
  /* Brand — fill from CLIENT BRIEF */
  --navy:        [primary dark color];
  --primary:     [primary mid color];
  --accent:      [accent/highlight color];

  /* Neutrals */
  --bg:          #ffffff;
  --bg-alt:      #f5f7f9;
  --bg-tint:     #eef1f4;
  --text:        #1a1a2e;
  --text-muted:  #5a6a7a;
  --border:      #e2e8f0;

  /* Shape */
  --radius:      [16px for friendly, 8px for corporate, 0 for bold/stark];
  --radius-sm:   calc(var(--radius) * 0.625);
  --shadow:      0 2px 12px rgba(0,0,0,.08);
  --shadow-lg:   0 8px 32px rgba(0,0,0,.14);

  /* Layout */
  --maxw:        1200px;
  --font:        [Google Font matching the FONT FEEL], sans-serif;
}
```

The design system must include:
- Typography scale (h1–h4, body, `.eyebrow`)
- Button variants (`.btn-primary`, `.btn-outline`, `.btn-sm`, `.btn-lg`)
- `.container` with max-width and horizontal padding
- `.section` base padding (desktop and mobile)
- `.section-alt` (light grey background), `.section-navy` (dark brand background)
- `.reveal` scroll-animation class (opacity + translateY, triggered by IntersectionObserver in script.js)
- Header: `.site-header`, `.header-inner` (3-column grid: logo | nav | cta), `.scrolled` state
- Footer: `.site-footer`, `.footer-grid`, `.footer-col`
- Page hero: `.page-hero` (for inner pages)
- Content layout: `.content-2col` (prose + sidebar), `.prose`, `.sidebar-card`
- Card grids: `.card-grid-2`, `.card-grid-3`
- Form styles: `.contact-form`, `.form-group`, `.form-row`
- All section-specific component styles as needed

Design principles to follow:
- Generous whitespace — sections breathe
- Clear visual hierarchy — one thing draws the eye per section
- Mobile-first responsive — breakpoints at 1060px, 960px, 760px, 480px
- No decorative clutter — every element earns its place
- Typography does heavy lifting — font weight and size create contrast, not colour noise

**Mandatory mobile rules — every component must follow these:**

| Component | Mobile requirement |
|---|---|
| Header | Logo + hamburger only. Nav and CTA hidden, revealed via toggle. Nav opens as a full-width dropdown or slide-in. Phone number accessible from the mobile nav or a sticky bottom bar. |
| Hero | Single column. Headline font size reduced (use `clamp()`). Stats stack vertically. CTA button full-width. Minimum 56px tap target. |
| Navigation (mobile open) | Links stack vertically with generous padding (min 48px height per item). Closes when any link is tapped. Closes when tapping outside. |
| Grid sections (services, industries, why-us, card grids) | All multi-column grids collapse to single column at 760px or narrower. No horizontal overflow. |
| Partner logo carousel | Arrows still visible and tappable (min 44px touch target). Slides work with touch swipe. Track does not overflow the viewport. |
| Case studies / horizontal scroll | Hint at scroll with a partially visible next card. Scrollbar hidden but scrollable. Fade edge on right side. |
| Forms | Fields full-width. Labels above inputs (never placeholder-only). Submit button full-width. |
| Footer | All columns stack vertically. Logo, tagline, then link columns one per row. Bottom bar (copyright line) stacks to two lines if needed. |
| Typography | All `clamp()` values — headings never overflow or get too small. Minimum body font size 15px on mobile. |
| Images | `max-width: 100%`, `height: auto`. No fixed pixel widths on images inside flex/grid containers. |
| Buttons | Full-width on mobile where they appear alone. Minimum 48px height. |
| Sticky mobile CTA bar | On all pages: a fixed bottom bar with the phone number and a "Get a Quote" button. `z-index` high enough to stay above content. Hidden on desktop. |

**Breakpoint reference to use in CSS:**
```css
/* Tablet */
@media (max-width: 1060px) { }
/* Small tablet / large phone landscape */
@media (max-width: 960px) { }
/* Mobile — main breakpoint where nav collapses */
@media (max-width: 760px) { }
/* Small phones */
@media (max-width: 480px) { }
```

Use `clamp()` for fluid typography so text scales smoothly between breakpoints rather than jumping:
```css
h1 { font-size: clamp(2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.6rem, 3.5vw, 2.5rem); }
h3 { font-size: clamp(1.2rem, 2.5vw, 1.75rem); }
```

---

### Step 4 — Homepage sections (index.html)

Build the homepage using the sections below. Select and order them based on the visual archetype and conversion goal from your design brief. Not all sections are required — include only what serves the conversion action.

**Available sections (pick what fits):**

| Section | When to include |
|---|---|
| Hero — centered, full-width gradient | Default for B2B/enterprise; no hero image needed |
| Hero — split (copy left, image right) | When a strong photo asset is available |
| Hero — minimal (headline + CTA only) | For very bold or luxury brands |
| Partner / client logos carousel | When client has recognisable brand partners |
| Services — tabbed (multiple categories) | When services split into 2+ distinct groups |
| Services — grid | When services are a flat list |
| Industries / audiences grid | When client serves clearly distinct verticals |
| Why us / differentiators | Always include — 3-4 cards with numbers or icons |
| Testimonials / case studies | Always include — use real quotes from CLIENT BRIEF |
| Contact / CTA band | Always include — primary conversion action |
| About / story section | For trust-heavy archetypes (medical, professional services) |
| Franchise / partnership section | Only if relevant |

**Rules for every section:**
- Every section that contains content has an eyebrow label (small all-caps label above the heading)
- Headings are outcome-focused, not feature-focused ("Get a hotel-grade deep clean in 48 hours" not "Our Cleaning Services")
- Social proof is never generic — use real names, real companies, real quotes from the CLIENT BRIEF
- Every section with a CTA uses the same primary conversion action identified in Step 1

---

### Step 5 — Inner pages

For each page checked in PAGES NEEDED, build a complete HTML file with:
- The shared header and footer
- A `.page-hero` section (eyebrow + h1 + short description)
- The page-specific content using `.content-2col`, `.card-grid-2/3`, `.prose`, `.sidebar-card` etc. from the design system
- At least one `.cta-band` section driving the primary conversion action

Content for inner pages should be drawn from the extracted text in `existing-site/` and the CLIENT BRIEF. Rewrite for clarity, brevity, and outcome-focus where the original is vague or bloated.

---

### Step 6 — Interactions (script.js)

The script must include:
- Mobile navigation toggle (hamburger → open/close, closes on link click)
- Scroll-triggered header compression (`.scrolled` class after 40px)
- Tab switching (if tabs are used)
- IntersectionObserver scroll-reveal for all `.reveal` elements
- Partner logo carousel (if logos section is included): infinite seamless loop using DOM cloning, no autoscroll, prev/next arrow navigation
- Form feedback (button text → "Sent!" for 4 seconds on submit)

---

### Step 7 — Quality checklist (verify before finishing)

Before declaring the build complete, confirm all of the following:

**Content & accuracy**
- [ ] All testimonials use real quotes and attributions from the CLIENT BRIEF — no placeholders
- [ ] All partner logos are real and sourced from the CLIENT BRIEF
- [ ] No section contains placeholder text (Lorem ipsum, "TBD", "[FILL IN]")
- [ ] No broken image references — all `src` values point to files that exist or are valid URLs
- [ ] Phone number is correct and consistent across header, footer, and sticky mobile bar
- [ ] JSON-LD structured data in `index.html` `<head>` has correct business name, phone, address, and URL

**Desktop layout**
- [ ] Logo is visible and correctly sized in the header
- [ ] Header has balanced spacing — logo left, nav centered, CTA right (3-column grid)
- [ ] Primary CTA is visible above the fold
- [ ] All multi-column grids align correctly with no overflow
- [ ] All pages link to each other correctly in nav and footer
- [ ] `styles.css` has no orphaned selectors for sections that were removed

**Mobile layout — simulate at 375px width in browser DevTools before submitting**
- [ ] Header shows logo + hamburger only — desktop nav and CTA are hidden
- [ ] Hamburger opens the mobile nav; tapping any link closes it
- [ ] Mobile nav links have at least 48px tap height, no items are cut off
- [ ] Hero text is readable — headline does not overflow or wrap awkwardly
- [ ] Hero CTA button is full-width and tappable
- [ ] Every grid section (services, industries, why-us, cards) collapses to a single column
- [ ] No section causes horizontal scroll on the page
- [ ] Partner logo carousel arrows are visible and tappable on mobile
- [ ] All form fields are full-width; labels are above the field (not placeholder-only)
- [ ] Submit button is full-width on mobile
- [ ] Footer columns stack vertically
- [ ] Sticky mobile CTA bar is present at the bottom of the screen on all pages
- [ ] All images scale correctly — none overflow their container
- [ ] Font sizes are readable — body text no smaller than 15px, headings not oversized
- [ ] No fixed-pixel widths causing overflow on narrow screens

---

### Step 8 — Deployment prep

At the end of the build, provide:
1. A list of all files created
2. Instructions for pushing to GitHub and connecting to Vercel
3. The `brand.css` token summary (just the `:root` variables used) for future reference

---

*End of AI instructions. Begin with Step 1 — state your design strategy before writing any code.*

---

## SECTION 4 — HUMAN EYE-TEST (run this after the AI finishes)

> **This section is for you — the project owner — not the AI.**
> The AI handles technical correctness. You handle visual quality. No automated checklist replaces actually looking at the site with fresh eyes. This is the final gate before delivery.

### How to run the eye-test

Open the site in a browser. Use a local server (VS Code Live Server, or `npx serve .` in the project folder). Do not just open the HTML file directly — some assets may not load correctly without a server.

Run through the checklist below. For anything that looks off, note it plainly in plain language (e.g. "the hero headline is too large on mobile", "the partner logos section feels cramped", "the footer text is hard to read"). Pass those notes back to the AI in a follow-up message and it will fix them.

---

### Desktop eye-test (view at 1280px–1440px width)

**First impression (above the fold only)**
- [ ] Does the page immediately communicate what the business does?
- [ ] Is there a clear, obvious action the visitor should take?
- [ ] Does the visual hierarchy feel intentional — one main thing drawing the eye?
- [ ] Does it look modern and trustworthy, or dated and cluttered?

**Header**
- [ ] Logo is visible, correctly sized, not cropped or blurry
- [ ] Navigation links are readable and evenly spaced
- [ ] CTA button in the header is visible and distinct
- [ ] Header does not feel cramped or unbalanced

**Section by section, scroll the full page**
- [ ] Each section has enough breathing room — nothing feels squeezed
- [ ] Section backgrounds alternate correctly (white / light grey / dark navy) — no two same-coloured sections back to back with no break
- [ ] All headings are outcome-focused, not jargon-heavy
- [ ] All images load and are not stretched, pixelated, or misaligned
- [ ] Testimonials/case studies feel credible — real names, real logos, real quotes
- [ ] CTAs appear at logical moments — not only at the very bottom
- [ ] No section looks obviously "unfinished" — no stray borders, alignment gaps, or oversized whitespace

**Footer**
- [ ] All four columns present and aligned
- [ ] Phone number, address, and legal links are correct
- [ ] Footer doesn't feel too heavy or too sparse relative to the page

---

### Mobile eye-test (open DevTools → toggle device toolbar → set to iPhone 12 Pro, 390px)

**Header on mobile**
- [ ] Logo is centered in the header bar
- [ ] Hamburger icon is clearly visible on the right
- [ ] Tapping the hamburger opens a full-screen overlay
- [ ] Overlay links are large, well-spaced, easy to tap
- [ ] X close button is easy to tap and correctly positioned
- [ ] Phone number and CTA are visible in the overlay

**Hero on mobile**
- [ ] Headline is large but not so large it wraps into 4+ lines
- [ ] Subheadline is readable without zooming
- [ ] CTA button spans the width and looks intentional
- [ ] Stats (if any) stack neatly below

**Scrolling through on mobile**
- [ ] No section causes the page to scroll horizontally
- [ ] All grids collapse to a single column — nothing is cut off
- [ ] All images stay within the screen width
- [ ] Text in cards/tiles does not overflow or clip
- [ ] Tab components (if used) are tappable and clearly labelled
- [ ] Partner logo carousel scrolls and arrows are tappable
- [ ] Forms: all fields are full-width, labels above inputs, submit is full-width

**Sticky bar and footer**
- [ ] Sticky mobile CTA bar is fixed to the bottom — phone + quote button
- [ ] Sticky bar does not overlap any important content
- [ ] Footer columns stack vertically, all readable

---

### The "stranger test" (optional but valuable)

Show the page to someone who has never heard of the business. Ask two questions only:
1. What does this company do?
2. What would you do if you needed their service right now?

If they can answer both within 10 seconds, the page is working. If they hesitate, something in the hero or CTA needs to be sharper.

---

### Reporting issues back to the AI

When you find something to fix, describe it in plain terms. You do not need to know CSS or HTML. Examples of good feedback:

- *"The hero headline feels too large on mobile — it's wrapping onto 5 lines."*
- *"The services section on desktop has too much empty space on the right side."*
- *"The footer looks fine on desktop but on mobile the columns are side by side instead of stacked."*
- *"The partner logos feel too small — they're hard to read."*
- *"The contact form section looks out of place — the background colour doesn't match the flow of the page."*

The AI will make the fix and you re-check. Repeat until the page passes the full eye-test. That is the delivery-ready state.
