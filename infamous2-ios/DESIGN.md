---
name: inFAMOUS 2 on iOS — Mons Games
description: A cinematic graphic-novel showcase grounded in real iPhone captures and an honest prototype status.
colors:
  coal: "#101213"
  deep: "#0b0d0e"
  paper: "#ecece6"
  muted: "#adb2b2"
  blue: "#57caff"
  action: "#78d5ff"
  ember: "#ff9d73"
  rule: "#383d3e"
  action-ink: "#10222b"
  action-hover: "#b8eaff"
  performance-paper: "#e6e6df"
  performance-ink: "#202627"
  performance-copy: "#4c5550"
typography:
  display:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(78px, 8.2vw, 124px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(42px, 4.6vw, 66px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-.015em"
  statement:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "clamp(30px, 3vw, 44px)"
    fontWeight: 600
    lineHeight: 1.17
    letterSpacing: "-.025em"
  title:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-.02em"
  body:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "10px"
    letterSpacing: ".12em"
rounded:
  square: "0px"
  dot: "50%"
spacing:
  gutter: "clamp(24px, 4.2vw, 64px)"
  gutter-mobile: "22px"
  gutter-narrow: "20px"
  capture-column-gap: "24px"
  capture-row-gap: "36px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.square}"
    padding: "14px 23px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  text-link:
    textColor: "{colors.paper}"
    height: "44px"
  text-link-hover:
    textColor: "{colors.blue}"
  status-reached:
    textColor: "{colors.blue}"
  status-active:
    textColor: "{colors.ember}"
  status-future:
    textColor: "{colors.muted}"
  performance-panel:
    backgroundColor: "{colors.performance-paper}"
    textColor: "{colors.performance-ink}"
  icon-button:
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    width: "44px"
    height: "44px"
  icon-button-hover:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.deep}"
---

# Design System: inFAMOUS 2 on iOS — Mons Games

## Overview

**Creative North Star: "The Charged Graphic Novel"**

Coal fields, oversized condensed lettering, electric-blue traces and real device captures give this project its own cinematic world. The opening behaves like a graphic-novel splash spread; quieter TASA Orbiter reading text carries the technical explanation and prototype limitations. Ember marks active development and the transition into the light performance panel.

This system governs `infamous2-ios/index.html`, `style.css` and `page.js` only. The shared Mons Games mark and TASA reading typography connect it to the existing site. The homepage and Bad Haunts retain their separate systems in [the root design document](../DESIGN.md). The showcase uses supplied screenshots, with no video or synthetic game artwork.

**Key Characteristics:**

- Authentic iPhone imagery leads, with a single electric-current signature and sharp rectangular controls.
- Anton carries game identity and section headlines; TASA Orbiter carries statements, navigation and evidence.
- Blue signals action and reached milestones; ember signals active work and prototype caution.
- Open ruled layouts make limitations and development evidence as legible as the cinematic opening.

## Colors

The palette combines coal and dirty white with electric blue and warm ember; the frontmatter records the shipped values.

### Primary

- **Electric Blue:** The blue token colors the game numeral, emphasized statement, current, capture labels, reached states, links and dark-surface keyboard focus.
- **Action Blue:** A lighter fill keeps dark action text legible; the hover fill becomes paler still.

### Secondary

- **Ember:** Prototype status, the active milestone, the newest development state and the performance panel's top rule use this warm cue.

### Neutral

- **Coal and Deep:** Coal is the reading canvas and deep is the cinematic image field. A translucent coal layer over a grain raster gives the page restrained material texture.
- **Dirty White and Muted Gray:** Paper carries main text; muted gray carries supporting explanations and future states. Fine gray rules structure the open layouts.
- **Performance Paper and Ink:** A warm light panel uses dark headings and subdued dark copy to make the measured performance and its caveats a distinct reading moment.

**The Evidence Rule.** Preserve the distinction between reached, active and future work in visible words as well as color.

## Typography

**Display Font:** Local Anton with Arial Narrow and sans-serif fallbacks. **Body Font:** Local TASA Orbiter with Arial and sans-serif fallbacks. Both use `font-display: swap` and are preloaded; TASA supports weights 400–700.

**Character:** Anton's narrow, forceful capitals deliver the graphic-novel voice. TASA keeps technical paragraphs, status labels and controls calm and readable.

### Hierarchy

- **Display:** The game word follows the display token with a slight upward skew. Its blue numeral is larger (1.65em), rotated, and separated from the smaller TASA iOS suffix. Mobile reduces the display to `clamp(64px, 12.4vw, 86px)` and the numeral to 1.55em; at 360px and below the base becomes 61px.
- **Headline:** Anton section headings follow the headline token, with muted spans providing a second voice. Specific performance, log and closing headings adjust within the same condensed hierarchy.
- **Statement:** The hero's TASA statement follows the statement token; the project introduction uses 23px/1.45 with a 460px maximum width. Mobile uses 32px for the hero statement and 21px for the introduction.
- **Title:** TASA milestone and log titles use the title token. Capture titles are lighter in scale (18px/1.35, weight 500), and technical subheads use 26px/1.25, weight 600.
- **Body:** Standard reading copy follows the body token; contextual paragraphs range from 12–17px. Long log copy is limited to 770px and milestone copy to 750px. The hero description is limited to 410px.
- **Label:** Small uppercase capture labels follow the label token. Navigation uses 13px, weight 500; status words use 12px. Capture indices and measurement context use tabular numerals.

**The Reading Voice Rule.** Keep Anton for identity, major headings and the large FPS reading; preserve TASA for explanations, labels and actions.

## Layout

Content wraps at a maximum width of 1440px with the shared fluid gutter. The header is 88px high with the mark left, project anchors toward the right and a GitHub action at the end. The desktop hero has a 700px minimum and a height capped at 780px; its image starts behind the right-hand portion while coal gradients protect left-aligned copy. The caption sits toward the lower right and the current line sits at the foot.

Project explanation and performance each use two columns. The architecture strip is three stages joined by narrow arrow columns. The four-capture grid has two columns, with the first and fourth captures spanning the full width; previews use a 16:9 crop while original images remain available. Milestones use status and copy columns beside a vertical line. Log entries use state and copy columns divided by horizontal rules. Desktop section spacing is generally 90–115px, with gallery and reading gaps adapted to content rather than a card grid.

- **At 1700px and wider:** The hero image begins farther right, the content gains top spacing, and hero height is 780px.
- **At 1100px and below:** Navigation gaps, hero proportions, architecture columns, performance gap and log columns tighten; the caption's secondary detail disappears.
- **At 700px and below:** The gutter becomes 22px. A 74px masthead gains a second, 45px navigation row; navigation remains visible rather than collapsing behind a menu. The hero image moves above the reading content, the hero becomes content-height, and actions stack. Project, gallery, architecture, milestones, performance, log and legal content become single-column layouts. Architecture arrows turn downward. Main section spacing contracts to approximately 54–70px. Lightbox margins shrink and icon controls remain 44px high.
- **At 360px and below:** The gutter becomes 20px and display and headline sizes reduce further. The document's minimum supported width is 320px.

The stable semantic sequence is header, one main landmark containing named sections, footer, and a native image dialog. One h1 names the game, h2 elements introduce sections, h3 elements name captures and milestones, and h4 elements organize technical details. The skip link targets main content; navigation has a project label, decorative marks and SVGs are hidden from assistive technology, and real capture images carry descriptive alternative text.

## Elevation & Depth

Depth comes primarily from screenshot bleeds, dark gradients, restrained coal grain and tonal contrast. Reading sections remain open and flat; rules define structure. The closing image is dimmed behind text. The native lightbox alone receives a substantial modal shadow (`0 24px 80px #0009`) and near-black backdrop, separating image inspection from the page.

The electric current draws once on entry (1.8s after a .15s delay). Action and navigation feedback use the shared `cubic-bezier(.16,1,.3,1)` easing; underline traces take .3–.4s, action fills .25s, and capture zoom/brightness .8s. These are deliberate state changes, with no autoplay video. With reduced motion, smooth scrolling is disabled, transitions and animations are removed, the current is fully drawn, and capture hover no longer scales the image. Other state changes remain immediate.

## Shapes

Controls, screenshot frames, the performance panel and the modal use square corners. Fine straight rules and stroke arrows reinforce the graphic-novel geometry. Small circular dots are reserved for capture provenance and milestone state; future milestones use an outlined dot. The game-title skew and rotated numeral provide the expressive geometry without distorting reading copy.

## Components

### Mons Games masthead and navigation

The supplied mark is a paper-colored mask, paired with compact stacked MONS/GAMES lettering. Brand and navigation links offer at least 44px target height. Project links reveal a blue underline on hover or keyboard focus; the GitHub arrow is blue. The mobile second row retains all three project anchors.

### Primary and text actions

The square primary anchor uses the action fill, dark action ink, bold 14px TASA, a 54px minimum height and the frontmatter padding. Hover lightens the fill; hover or keyboard focus nudges its arrow and draws a thin blue line below. Mobile uses a 52px minimum height and 13px type. Text actions pair a quiet label with a stroked arrow, becoming blue on hover or focus. Global visible focus is a 3px blue outline offset by 6px; within the light performance panel its outline becomes dark blue (`#07658e`).

### Prototype status strip

An ember dot and explicit early-prototype wording sit beside a plainly stated performance reading and limitations anchor. Desktop lays these across the page; mobile stacks them. This is status communication rather than a decorative badge.

### Capture figures and inspection

Each figure is an original-image link containing a responsive WebP preview, a square open icon and a caption with title, blue category and tabular index. Hover slightly enlarges and brightens the preview; hover or focus changes the open icon to blue with dark ink. Real originals retain their full image rather than the preview crop.

When supported, JavaScript opens a labeled native dialog with previous, next, close and original-image controls. Left/right keys navigate, Escape uses native dismissal, outside clicks close it, and closing restores focus to the opener. Image alternative text follows the selected capture. Loading and failure messages use a polite status region, and the current count is announced politely. Without JavaScript or dialog support, each capture remains a direct original-image link. There are no forms, inputs or filter chips in this page system.

### Development milestones and log

The ordered milestone list pairs a colored dot with a written state and descriptive title. Reached/tested entries are blue, the active entry ember and future work muted with an outlined marker. Open log entries repeat this restrained state/copy relationship; the latest state is ember. Fine rules carry separation without filled cards.

### Performance panel

A five-pixel ember top rule introduces the warm light panel. A large Anton FPS reading and its device/test context sit beside technical copy and ruled subtopics. The dark ink, dark blue focus ring and explicit prototype warning keep this section readable and factual.

### Follow panel and footer

The closing screenshot is subdued behind the headline and GitHub action. Closed-source and publishing limitations remain readable body copy below the action. The footer repeats the shared mark, authorship, back-to-top link, general foundational-work acknowledgment, Sony/Sucker Punch attribution and Privacy destination.

## Do's and Don'ts

### Do:

- Do preserve the supplied Mons Games mark and TASA reading typography while keeping this page's separate visual world.
- Do use real device screenshots and preserve full-resolution originals behind the gallery previews.
- Do keep prototype qualifiers, performance context and written development states close to the evidence.
- Do retain semantic headings, visible keyboard focus, native dialog behavior and direct-image fallback.
- Do keep the electric current still and interactions immediate when reduced motion is requested.

### Don't:

- Don't import this page's coal, Anton, blue/ember composition into the homepage or Bad Haunts.
- Don't add video or synthetic game imagery to this showcase at this stage.
- Don't use screenshot HUD readings as sustained benchmark claims or imply that future milestones are complete.
- Don't turn the public progress tracker into a source-code or downloadable-build promise.
- Don't round the gallery into cards or add ambient shadows to the open reading layouts.
