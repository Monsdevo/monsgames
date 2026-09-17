---
name: Bartu Yılmaz / Mons — Personal Portfolio
description: A tactile paper-and-ink portfolio that puts the maker before the studio and game.
colors:
  ink: "#0b0a0d"
  paper: "#ead8c0"
  orange: "#e97445"
  violet: "#a278e1"
typography:
  display:
    fontFamily: "Six Caps, sans-serif"
    fontSize: "clamp(112px, 13.8vw, 210px)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "0.025em"
  headline:
    fontFamily: "Six Caps, sans-serif"
    fontSize: "clamp(64px, 6vw, 92px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.025em"
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "0.025em"
  body:
    fontFamily: "Courier Prime, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  navigation:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.12em"
  action:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "21px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.035em"
spacing:
  gutter: "clamp(24px, 5.6vw, 96px)"
components:
  masthead:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "12px clamp(24px, 5.6vw, 96px)"
  action-link:
    typography: "{typography.action}"
    padding: "7px 0"
  game-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  contact-band:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    padding: "58px clamp(24px, 5.6vw, 96px)"
---

# Design System: Bartu Yılmaz / Mons

## Overview

**Creative North Star: "The Maker's Open Book"**

The personal portfolio is an editorial introduction to Bartu Yılmaz / Mons. Warm paper and black stock give his name and mark a two-page opening; the dark practice spread, ruled work entries, and orange contact band move from author to process to projects. The material feels handled and authored, but the content stays plainspoken and legible.

This document governs `index.html` with `personal.css`. It does not redesign `bad-haunts.html` or replace its `portfolio.css` rules. That dedicated game page keeps its Midnight Prompt Book system: cream and black facing pages, orange Human cues, violet Haunt replies, handwritten annotations, and its existing responsive and interaction behavior. Shared assets and some colors do not make the two pages interchangeable.

**Key Characteristics:**

- A person-first editorial hierarchy: Bartu, practice, Mons Games, Bad Haunts, then contact.
- Flat cream and near-black stock with the existing Mons mark and emphatically narrow lettering.
- Orange as the portfolio's personal/action accent; violet is reserved for game-related work.

## Colors

The portfolio uses warm paper against near-black ink. Its accent colors signal authorship and project context, not the opposed player roles of the game page.

### Primary

- **Maker Orange:** The warm personal accent marks the name, link feedback, selection, and full-width contact band. A deeper red-orange period and softer orange practice label are local variations in `personal.css`, not separate global palette tokens.

### Secondary

- **Project Violet:** The Bad Haunts feature and Unreal/practice details pick up violet. It should help visitors locate the game, not recolor the entire portfolio.

### Neutral

- **Script Ink / Cream Paper:** These reverse as text and background across the opening, practice spread, project feature, and footer.
- **Editorial Rules:** Fine ink and locally tuned dark dividers maintain structure; there is no shared rule-color primitive in the current implementation.

**The Author Before Roles Rule.** Orange identifies the maker and contact path on the portfolio; the Human-orange/Haunt-violet pairing belongs to `bad-haunts.html` alone.

## Typography

Four local WOFF2 faces are used by the portfolio: Six Caps, Courier Prime regular and bold, and Barlow Condensed. They use `font-display: swap`; Six Caps and regular Courier Prime are preloaded. The type system is deliberately discontinuous: very tall, narrow display lettering over compact typewritten copy.

- **Display:** Six Caps names Bartu in the opening and renders the Mons alias and studio/game names. The hero uses the display token, then reflows to `clamp(116px, 27vw, 176px)` on narrow screens.
- **Headline:** Six Caps carries section statements. The experience heading is independently larger (`clamp(84px, 8vw, 132px)`), rather than forcing every heading into a single scale.
- **Title:** Barlow Condensed labels practice entries and project types in uppercase; it stays distinct from body copy.
- **Body:** Courier Prime carries introductions, descriptions, and project copy. Standard reading text is 16px with generous 1.6 line height; some mobile practice copy becomes 15px. Copy measures are constrained by the actual section (`37ch`, `48ch`, `50ch`, `56ch`, or `62ch`) rather than a universal width.
- **Navigation:** Barlow Condensed makes the masthead's uppercase, tracked links readable without competing with the display name.

**The Name Leads Rule.** Use the largest display gesture for Bartu's name; studio and game titles remain subordinate to the author on the homepage.

## Layout

The opening is a two-column paper/ink spread (`1.45fr 1fr`) with a minimum height of 660px. The practice spread uses a narrower intro beside a wider ruled list; the work area moves from a divided studio row to a two-column game feature. The contact band is a paired heading and message. Reused horizontal gutters come from the `gutter` token; section-specific vertical padding is intentional.

At 1000px and below, the opening tightens, the practice spread becomes one column, and project art and copy shrink. At 700px and below, the opening, studio row, game feature, and contact band all stack; the Mons mark/alias compress into a compact identity strip and the menu becomes an enhanced button. Navigation remains visible without JavaScript. Do not preserve wide page coordinates on mobile.

The content order is semantic and stable: person, areas of practice, studio, one documented game, contact. The experience rows are experience statements, not a manufactured project gallery; add future work only when supplied.

## Elevation & Depth

The portfolio has no UI shadow or floating-card elevation scale. Local cream and black stock textures, broad tonal reversal, thin rules, and the bordered game-art panel create depth without lifting surfaces. The work and experience sections rely on document flow, not nested cards.

**The Flat Stock Rule.** Separate stories with paper tone, dark stock, spacing, and rules; do not introduce generic raised cards or shadow stacks.

## Shapes

Page divisions, link underlines, the game-art frame, and the Mons-mark block are square-edged. Fine one-pixel rules structure the work and experience lists. The game-art panel alone has a visible one-pixel violet-tinted frame; this is a project feature, not a general card radius or border token. Curves belong to supplied artwork and inline SVG icon paths, not layout containers.

## Components

### Masthead navigation

The ink masthead carries the existing Mons mark and condensed wordmark. Four uppercase links have at least 44px-high targets and turn orange on hover. At 700px and below, the JavaScript-enhanced native Menu button toggles navigation; the unenhanced document still exposes the links. The shared focus treatment is a current-color 3px outline offset by 5px.

### Action links

Text-led, square-edged links use Barlow Condensed uppercase labels, an underline border, a minimum 48px height, and an inline arrow. The arrow moves 4px on hover or keyboard focus; the opening's downward arrow moves vertically. The game feature uses a lighter violet link color to identify its project context.

### Experience rows

The dark practice list uses fine dark rules, uppercase Barlow Condensed titles, and Courier Prime explanations. It is a ruled editorial list, not a set of achievement cards. On narrow screens each row becomes one column, keeping title before explanation.

### Studio and game features

The studio row pairs the supplied Mons mark with a typographic signature and plain descriptive copy. The Bad Haunts feature is one dark split panel: official game logo artwork on a bordered stock surface, followed by title, development context, a description, a link to the dedicated page, and social destinations. The feature points to the game system but does not import its Human/Haunt interface.

### Contact and footer

The warm orange contact band makes the email destination unmistakable. The dark footer returns to small type and practical links. Interactive destinations retain readable text and at least 44px targets where they are used as navigation.

All portfolio interactions retain visible keyboard focus. Reduced-motion preference disables animation and transition and turns smooth scrolling off.

### Protected game-page exception

`bad-haunts.html` remains governed by `portfolio.css`, not the portfolio tokens above. Its wide opening is an absolute-positioned two-page prompt book using the viewport unit `--u`; it reflows to normal document flow below 1280px, a narrow navigation/menu and stacked sections at 700px, and a single role column below 360px. The page retains its Six Caps/Courier Prime/Kalam/Share/Barlow voices, cream/black stock, orange Human and violet Haunt mapping, bordered follow actions, native cue buttons with `aria-pressed`, numbered match notes, native build-note disclosure, local artwork, visible focus, and reduced-motion behavior. Future portfolio edits must leave those game-specific rules intact unless the user separately requests a game-page change.

## Do's and Don'ts

### Do:

- Do keep Bartu's name and the existing Mons mark as the opening's visual authority.
- Do keep cream/ink stock, Six Caps display type, readable Courier Prime copy, and square-edged editorial rules.
- Do use orange for the portfolio's personal and contact emphasis; use violet to locate game-related work.
- Do preserve semantic content order, keyboard focus, reduced-motion support, and normal-flow mobile reflow.
- Do treat Bad Haunts as a linked project with its own unchanged design system.

### Don't:

- Don't apply the portfolio's author-first hierarchy or orange contact band to `bad-haunts.html`.
- Don't turn iOS experiments, the Vita3K attempt, or unsupplied future projects into finished project cards.
- Don't replace the flat editorial layout with rounded, elevated card grids.
- Don't make the game feature reproduce the dedicated game's cue controls or role-page composition.
- Don't trade readable copy and usable links for exact desktop positioning.
