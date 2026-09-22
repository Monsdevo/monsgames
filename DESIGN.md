---
name: Bartu Yılmaz — Personal Portfolio
description: A clear, person-led portfolio with a numbered work index and restrained cobalt emphasis.
colors:
  canvas: "#f8f8f8"
  charcoal: "#121a2b"
  muted: "#69748f"
  cobalt: "#0856f8"
  rule: "#dbe2ef"
  pale-blue: "#f0f5ff"
typography:
  display:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "clamp(70px, 7vw, 107px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-.025em"
  headline:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "46px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-.025em"
  body:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: ".23em"
rounded:
  action: "5px"
  highlight: "6px"
spacing:
  gutter: "clamp(24px, 5.2vw, 80px)"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "#fff"
    typography: "{typography.body}"
    rounded: "{rounded.action}"
    height: "54px"
    padding: "0 31px"
  button-primary-hover:
    backgroundColor: "#064bd9"
  project-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.charcoal}"
    height: "140px"
  practice-highlight:
    backgroundColor: "{colors.pale-blue}"
    textColor: "{colors.cobalt}"
    rounded: "{rounded.highlight}"
---

# Design System: Bartu Yılmaz — Personal Portfolio

## Overview

**Creative North Star: "The Clear Work Index"**

The homepage is a classic, clean portfolio that introduces Bartu Yılmaz before his studio and current game. A centered name, short introduction, two direct actions, and full-width numbered work rows let a visitor understand the author and choose a destination immediately. The interface is deliberately quiet around the work: a near-white canvas, charcoal sans-serif type, cobalt used sparingly for action, pale-blue contextual emphasis, and precise hairline rules.

This system governs `index.html` and `personal.css` only. `bad-haunts.html` is a separate game presentation governed by `portfolio.css`; its established Midnight Prompt Book identity must not be restyled by these portfolio tokens. The difference is intentional, not drift.

**Key Characteristics:**

- Bartu's name is the largest gesture; Mons appears only through the small masthead mark, while Mons Games is named as studio work.
- Two numbered, rule-separated project rows form the work index; practice statements are not project cards.
- TASA Orbiter carries the entire portfolio, with cobalt actions and arrows against a light, flat canvas.

## Colors

The palette is cool and restrained. Cobalt signals action and selected emphasis; charcoal does the reading work.

### Primary

- **Action Cobalt:** The sole portfolio accent powers the small Mons mark, primary action, text actions, row arrows, visible focus, and the highlighted Vita3K heading. A darker cobalt appears only as the primary button's hover state.

### Neutral

- **Open Canvas:** The near-white page background keeps typography and the index foregrounded.
- **Reading Charcoal:** Main text, names, and section headings use a blue-leaning near-black rather than pure black.
- **Quiet Slate:** Secondary descriptions and numbers recede without becoming ornamental.
- **Hairline Blue-Gray:** One-pixel dividers separate project rows, practice columns, and larger sections.
- **Pale-Blue Wash:** The contact section and one practice highlight use a low-contrast background tint.

**The One Accent Rule.** Cobalt belongs to navigation feedback, actions, arrows, focus, and a small number of contextual cues; do not recolor entire portfolio sections as game-role panels.

## Typography

**Display and body font:** TASA Orbiter, with Arial and generic sans-serif fallbacks. The variable-weight local WOFF2 is preloaded and uses `font-display: swap`.

**Character:** A contemporary, compact sans-serif gives the name confidence and the project index clarity without relying on decorative display lettering.

### Hierarchy

- **Display:** Bold, tightly tracked name at the hero scale defined above; a narrower-screen rule reduces it to `clamp(48px, 8.4vw, 68px)` at 760px and below.
- **Headline:** Bold project names at the headline token size, reduced to 40px at 1100px and 27px at 760px and below.
- **Section heading:** Bold studio and contact headings use `clamp(54px, 6vw, 82px)` with tight tracking.
- **Body:** Standard reading copy begins at 17px/1.5; descriptive text is sized by context, from the 18px practice note to larger hero and project summaries.
- **Label:** Small uppercase section labels use the label token; the practice label tracks slightly less (`.14em`).

**The Name Leads Rule.** Bartu's name remains the page's largest typographic statement; studio and game names are clearly subordinate in the homepage hierarchy.

## Layout

The masthead places the supplied Mons mark at left and three inline navigation links at right. The hero centers the name, introduction, and paired actions. The selected-work index stretches across the content area: each row places its number, project name and factual descriptor, and cobalt arrow in a three-column grid. Practice follows as three columns, with the middle item on a pale-blue inset; the studio and contact sections use two-column heading/copy layouts. The shared responsive horizontal gutter is the `spacing.gutter` token.

At 1200–1535px, several vertical dimensions and index type sizes interpolate with viewport width. At 1100px, the hero, row, and practice type and spacing tighten. At 760px and below, the masthead, hero, work rows, and typography tighten further, while the practice grid stacks into one column. The shipped CSS retains inline navigation; it does not currently provide a collapsed homepage menu. Document any later responsive change from the implementation rather than assuming the game page's breakpoints apply.

The semantic sequence is stable: person, work index, practice, Mons Games detail, contact, footer. The index contains only the supplied Bad Haunts and Mons Games entries; iOS experiments and the Vita3K attempt remain accurately framed as practice.

## Elevation & Depth

The portfolio has no box-shadow or elevated-card scale. Depth comes from typographic hierarchy, whitespace, rules, the single pale-blue practice inset, and the contact tint. Hover on a work row adds a faint cool background, not a lift.

**The Flat Index Rule.** Keep work in open, ruled rows and practice in a light grid; do not convert the homepage into a shadowed card gallery.

## Shapes

Most edges are square: project rows are divided by thin rules, links are typographic, and sections use clean rectangular fields. The primary button has a restrained 5px corner; the pale-blue practice highlight has a 6px corner. These small curves soften actions and inset emphasis without establishing a rounded-card language. Inline arrows are simple strokes, not filled icon badges.

## Components

### Masthead navigation

The compact masthead uses the supplied Mons mark as a cobalt mask and three uppercase TASA Orbiter links. Links have 44px minimum target height and change to cobalt on hover. The homepage currently keeps its navigation inline across CSS breakpoints; the hidden Menu button is not an active mobile visual pattern.

### Hero actions

The primary "View work" link is a filled cobalt action with white text, a 54px minimum height, and a modest 5px radius. The secondary "Contact" link is cobalt text without a filled container. Both carry stroked arrows that move 5px on hover or keyboard focus; the filled action darkens on hover.

### Numbered work rows

Each work entry is one full-width link with a tabular number, bold name, muted factual descriptor, and cobalt arrow. Hairlines define the rows. On hover or focus, the arrow nudges right and the surface subtly cools; hover also turns the project name cobalt. This is a navigable index, not an image card.

### Practice grid

Three concise experience statements sit in adjacent columns, with one-pixel dividers. The middle Vita3K item receives a pale-blue inset and cobalt heading. The explanatory note below explicitly distinguishes experiments and the ongoing port attempt from released products.

### Studio, contact, and footer

The studio detail is a two-column, text-led explanation with a direct Bad Haunts link. Contact uses the pale-blue wash, a large invitation, and a prominent cobalt email link. The footer returns to compact text and practical social, privacy, and back-to-top destinations. Actions retain visible cobalt keyboard outlines; reduced-motion preference removes animation and transition and disables smooth scrolling.

### Protected Bad Haunts exception

The dedicated `bad-haunts.html` page remains a separate Midnight Prompt Book system in `portfolio.css`: cream and black stock textures, Six Caps/Courier Prime/Kalam/Share/Barlow voices, orange Human cues against violet Haunt responses, handwritten annotations, and its role-based facing pages. Its wide opening uses `--u`-scaled absolute composition; below 1280px it returns to document flow, with a mobile navigation treatment at 700px and single role column below 360px. Native cue buttons expose `aria-pressed`; numbered match notes, build-note disclosure, social follow actions, focus, and reduced-motion behavior remain game-specific. Do not import the portfolio's cobalt, TASA Orbiter, open index rows, or pale-blue wash into that page without a separate game-page request.

## Do's and Don'ts

### Do:

- Do lead with Bartu's name, then the two-entry work index, practice, studio detail, and contact path.
- Do use the existing Mons mark at small masthead scale and keep the portfolio palette light, charcoal, and cobalt.
- Do preserve factual qualifiers such as "in development," "experiments," and "ongoing attempt."
- Do keep project rows as accessible full-width links with visible focus and reduced-motion behavior.
- Do preserve the dedicated Bad Haunts design as a separate visual system.

### Don't:

- Don't reuse Bad Haunts' paper grain, black stock, role colors, handwriting, or prompt-book composition on the homepage.
- Don't turn iOS experiments, the Vita3K port attempt, or unsupplied projects into finished portfolio cards.
- Don't replace the numbered index with speculative project imagery or an elevated card grid.
- Don't present the homepage's hidden Menu control as a shipped collapsed-navigation pattern.
- Don't apply the homepage's cobalt or TASA Orbiter rules to `bad-haunts.html`.
