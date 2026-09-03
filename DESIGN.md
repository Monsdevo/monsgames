---
name: Mons Games — Midnight Prompt Book
description: Cream paper, black script stock, and opposing orange/violet voices.
colors:
  ink: "#0b0a0d"
  paper: "#ead8c0"
  orange: "#cf4719"
  violet: "#a278e1"
  follow-orange: "#d34718"
  follow-violet: "#7939de"
  follow-orange-small: "#df642f"
  follow-violet-small: "#a478e8"
  paper-rule: "#ae8263"
  dark-rule: "#42384f"
typography:
  display:
    fontFamily: "Six Caps, sans-serif"
    fontSize: "calc(122 * var(--u))"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Six Caps, sans-serif"
    fontSize: "clamp(64px, 6.5vw, 96px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0.035em"
  body:
    fontFamily: "Courier Prime, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  title:
    fontFamily: "Courier Prime, monospace"
    fontSize: "clamp(16px, 1.14vw, 20px)"
    fontWeight: 700
    lineHeight: 1.3
  navigation:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "calc(23 * var(--u))"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
  tool-label:
    fontFamily: "Share, sans-serif"
    fontSize: "calc(20 * var(--u))"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.025em"
  annotation:
    fontFamily: "Kalam, cursive"
    fontSize: "calc(16 * var(--u))"
    fontWeight: 400
    lineHeight: 1.3
spacing:
  control-gap: "12px"
  text-gap: "16px"
  block-gap: "20px"
  narrow-gutter: "22px"
  wide-gutter-min: "28px"
  narrow-section: "48px"
components:
  follow-instagram:
    backgroundColor: "{colors.follow-orange}"
    textColor: "#080708"
    height: "calc(50 * var(--u))"
    padding: "0 calc(22 * var(--u))"
  follow-youtube:
    backgroundColor: "{colors.follow-violet}"
    textColor: "#080708"
    height: "calc(50 * var(--u))"
    padding: "0 calc(22 * var(--u))"
  follow-instagram-small:
    backgroundColor: "{colors.follow-orange-small}"
    textColor: "{colors.ink}"
    height: "52px"
    padding: "0 18px"
  follow-youtube-small:
    backgroundColor: "{colors.follow-violet-small}"
    textColor: "{colors.ink}"
    height: "52px"
    padding: "0 18px"
  navigation:
    typography: "{typography.navigation}"
  cue-switch:
    padding: "12px 0"
  build-notes:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px 0"
---

# Design System: Mons Games

## Overview

**Creative North Star: "Midnight Prompt Book"**

Midnight Prompt Book pairs cream paper with black script stock: condensed display lettering, typewritten notes, ruled controls, and authored pencil marks. Orange Human cues and violet Haunt replies give opposing voices a shared visual grammar.

The material is flat and tactile, not a cinematic gaming backdrop. Preserve the recognizable Mons Games and Bad Haunts assets. Responsive clarity and accessibility take precedence over exact lettering and pixel placement; local textures and type carry the identity when the wide composition reflows.

**Key Characteristics:**

- Opposing paper tones with orange and violet role accents.
- Narrow display type, readable typewritten copy, handwritten annotations.
- Flat page materials, rules, tape tabs, and semantic controls.

## Colors

Warm stock and near-black ink establish the reading surfaces; orange and violet distinguish the opposing voices.

### Primary

- **Human Orange:** Human annotations, masthead dividers, and the orange follow action. The follow variants are distinct component fills, not replacements for the role accent.

### Secondary

- **Haunt Violet:** Haunt headings, numbered markers, dark-page accents, and the solid contact surface. The follow action has separate wide and small-screen fills.

### Neutral

- **Cream Paper / Script Ink:** Complementary light and dark reading surfaces, reversed as text.
- **Paper Rule / Dark Rule:** Thin separators on their corresponding stock.

**The Opposing Voices Rule.** Use orange for Human cues and violet for Haunt replies; neutral paper and ink carry essential reading.

## Typography

Five families are supplied through six local WOFF2 files: Six Caps (400), Courier Prime (400 and 700), Kalam (400), Share (400), and Barlow Condensed (500). All use font-display swap; display and regular body faces are preloaded. The source fallbacks are sans-serif, monospace, and cursive.

The ramp is deliberately discontinuous: emphatically narrow display lettering above compact, typewritten explanations. It is not a uniform modular scale.

- **Display:** Six Caps for role headings and game lettering. Wide role headings use the display token; reflowed headings become 96px, then 72px at the narrow breakpoint. The extra-narrow single-column role heading is 82px.
- **Headline:** Six Caps for section statements, with the headline token as the shared starting point and section-specific responsive sizing.
- **Title:** Bold Courier Prime, uppercase, for numbered step titles and cue names.
- **Body:** Courier Prime; longer reading copy uses 16–17px with 1.5–1.65 line height. Step copy is limited to 53ch, studio copy to 60ch, and development copy to 65ch.
- **Navigation:** Barlow Condensed, uppercase and tracked. Reflowed navigation is 18px; small follow labels use 19px or 21px.
- **Tool labels:** Share, uppercase, gives small role-section labels a condensed but readable voice.
- **Annotations:** Kalam, uppercase with slight rotation, supplies the handwritten note layer.

**The Three Voices Rule.** Condensed type announces, typewritten copy explains, and handwriting annotates. Keep these roles distinct.

## Layout

The wide composition uses a two-page split, with a viewport-relative unit (1u = 100vw / 1672). Below it, paired columns continue the page grammar; lower editorial sections use generous gutters (max(6.65vw, 28px)) and text measures rather than card containers.

At a maximum width of 1279px, the absolute-positioned opening becomes normal-flow content. The official game logo and premise lead; the two role pages remain paired, follow actions sit side by side, and decorative margin material disappears. At 700px, navigation becomes an enhanced menu, follow actions stack, and the match and lower sections become single-column with 22px gutters. The role pages remain paired until 359px, where they also stack.

Use the observed 12–28px local spacing rhythm; narrow editorial sections use 48px vertical padding. Wide sections vary with their content rather than sharing a fabricated universal spacing scale.

## Elevation & Depth

The rendered interface has no UI elevation-shadow system. Local cream and black texture assets, page seams, fine rules, pencil drawings, and tape create physical character without floating surfaces. The wide page plates carry their own authored material marks; reflowed layouts use the local stock textures.

**The Flat Stock Rule.** Create separation with paper tone, rules, and tape, not elevated card shadows.

## Shapes

Controls and page divisions are square-edged. Thin rules structure lists and disclosures; the follow actions have an ink border (2px). Tape tabs retain slight opposing rotations, and pencil marks remain irregular. Rounded geometry belongs to the supplied marks and inline SVG icon drawings, not a general container radius scale.

## Components

### Follow actions

Two bordered, full-width social links carry orange and violet fills, inline SVG channel marks, and an arrow. Wide labels use Six Caps with a minimum of 24px; they retain their intentionally condensed/stroked lettering. Reflowed labels use Barlow Condensed on lighter fills. Hover increases brightness (1.18) over 0.2s. Focus uses the shared visible outline.

### Navigation

The black masthead pairs the supplied studio mark with uppercase, tracked links and orange dividers. Links have a minimum 44px hit area. At 700px and below, the enhanced native Menu button controls the navigation with aria-expanded; Escape closes it and returns focus. Without JavaScript, navigation stays available.

### Cue / counter-cue

A native button, styled as a dotted-underlined cue title, highlights its visible opposite-role response on hover, focus, or selection. Selection is exposed through aria-pressed and a polite status announcement. The linked state adds an underline and a thin rectangular mark, revealed over 0.34s with cubic-bezier(.16, 1, .3, 1). The content remains visible without interaction.

### Numbered steps

Native ordered lists become ruled production notes: square numbered blocks, bold typewritten titles, readable explanatory copy, and role-specific color reversal. Entries use separators rather than individual cards.

### Build-note disclosure and text links

Native details/summary sits between paper rules. Its bold summary has a minimum height of 56px, with a plus SVG turning 45 degrees when open. Supporting links use underlines and inline arrows, with a minimum 44px hit area; hover thickens the underline.

All keyboard focus uses a current-color outline (3px) offset by 5px. Reduced-motion preference disables transitions, animations, and smooth scrolling. Assets and fonts are local; decorative plates and annotations do not replace semantic text.

## Do's and Don'ts

### Do:

- Do preserve the cream/black split and orange/violet role distinction.
- Do use the supplied logos and locally served font and texture assets.
- Do keep narrow layouts in normal document flow and retain readable body copy.
- Do retain visible focus, native control semantics, and reduced-motion behavior.
- Do keep desktop follow labels at least 24px; the dark lettering on saturated desktop fills depends on large-text treatment.

### Don't:

- Don't replace the prompt-book material with a generic cinematic gaming hero.
- Don't introduce rounded card grids or floating shadow surfaces into this flat page system.
- Don't use handwritten notes for essential long-form copy or control labels.
- Don't hide mechanics behind the cue interaction; highlighting connects information already visible.
- Don't preserve desktop coordinates at the expense of responsive clarity or accessibility.
