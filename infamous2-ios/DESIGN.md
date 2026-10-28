---
name: inFAMOUS 2 on iOS — Technical Dossier
description: A complete illustrated technical account with New Marais street tones and blue/red electrical accents.
colors:
  ground: "#101413"
  surface: "#191e1c"
  ink: "#e0e1d9"
  muted: "#afb6af"
  quiet: "#909c94"
  rule: "#3b4540"
  karma-blue: "#5790c1"
  karma-red: "#c4353c"
  link: "#8acfff"
  red-text: "#f68b8f"
  link-hover: "#c8e9ff"
typography:
  display:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "66px"
    fontWeight: 400
    lineHeight: 1.07
    letterSpacing: "-.025em"
  headline:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.015em"
  body:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "TASA Orbiter, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.6
rounded:
  square: "0px"
spacing:
  gutter: "clamp(24px, 3.6vw, 48px)"
  gutter-mobile: "24px"
  gutter-narrow: "20px"
  document-gap: "58px"
  section-gap: "43px"
  illustration-gap: "30px"
components:
  text-link:
    textColor: "{colors.link}"
  text-link-hover:
    textColor: "{colors.link-hover}"
  contents-link:
    textColor: "#aeb9b0"
    height: "43px"
    padding: "7px 0 7px 12px"
  contents-link-current:
    textColor: "{colors.link}"
    backgroundColor: "#5790c108"
  table-heading:
    backgroundColor: "#222b26"
    textColor: "#d8e2d9"
    padding: "13px 16px"
  icon-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    width: "44px"
    height: "44px"
  icon-button-hover:
    backgroundColor: "{colors.link}"
    textColor: "{colors.ground}"
---

# Design System: inFAMOUS 2 on iOS — Technical Dossier

## Overview

**Creative North Star: "The Illustrated Technical File"**

A compact, complete project document carries the native-port explanation, verified capabilities, experiments, measurements and limitations. Soot and muted green-gray evoke gloomy New Marais streets; restrained blue/red electrical lines keep the game's identity present around calm reading text. The user selected this illustrated technical dossier after rejecting the cinematic marketing presentation.

This system governs `/infamous2-ios`, its stylesheet and enhancement script, and the corresponding content/template sources. The shared Mons Games mark and TASA Orbiter reading face connect it to the site. The homepage and Bad Haunts keep their separate systems in [the root design document](../DESIGN.md). The Read-mode surface contract lives in [the surface brief](../.impeccable/surfaces/infamous2-ios-index-html.md).

**Key Characteristics:**

- Compact game identity, factual headings, readable prose and ruled evidence tables establish a technical document.
- Small and medium original repository screenshots sit beside the relevant explanation and open at full size.
- A persistent contents rail supports long-form reading; narrow screens use a native disclosure.
- Blue/red electrical geometry and a faint grayscale screenshot provide atmosphere without competing with the text.

## Colors

The frontmatter records the shipped CSS colors: green-black street tones, weathered pale text and restrained karma accents.

### Primary

- **Karma Blue:** The cool electrical line, numeral edge, list markers and selected contents border use the sampled blue. Links and visible focus use the lighter link color for clear reading against the dark canvas.
- **Reading Blue:** Underlined prose links, next-step numbers and viewer control hover states use the lighter link tone. Hover lightens text links further.

### Secondary

- **Karma Red:** The second electrical line, opposite numeral edge and short limitations-heading rule use the sampled red. Written copy carries all technical state and validation meaning. The red-text custom property is declared but not assigned to a visible component.

### Neutral

- **Street Ground and Surface:** Green-black ground carries the document and existing coal grain; green-gray masthead and table fields provide tonal separation.
- **Weathered Ink:** Pale main text and muted supporting copy preserve hierarchy. Quiet is a declared secondary token; current components mostly use contextual gray values.
- **Structural Rule:** Fine green-gray rules separate sections, fact rows, tables, log entries and footer.

The karma tokens are representative median samples from the blue/red electricity regions of [reference artwork](https://getwallpapers.com/wallpaper/full/9/8/7/772703-cool-infamous-wallpaper-1920x1080.jpg), retained locally at `.impeccable/infamous2/revision/karma-reference.jpg`. They are sampled design tones, not official canonical HEX standards. The blue/good and red/evil association is supported by [PlayStation's official inFAMOUS 2 announcement](https://blog.playstation.com/archive/2011/05/17/infamous-2-pal-release-date-confirmed-8th-10th-june/). The external artwork is reference only and does not ship on the page.

**The Written Evidence Rule.** Explain verified, pending and unvalidated work in words; electrical colors never substitute for technical status.

## Typography

**Display Font:** Local Anton with Arial Narrow and sans-serif fallbacks. **Body Font:** Local TASA Orbiter with Arial and sans-serif fallbacks. Both fonts are preloaded and use `font-display: swap`; TASA supports weights 400–700.

Anton supplies the compact game identity with a slight upward skew. TASA carries the edition title, headings, reading copy, tables, navigation and viewer controls.

- **Display:** Desktop identity follows the display token. The initial “in” is smaller (.77em); the numeral stays at the word's scale with opposing blue/red shadows. At 720px and below the identity is 58px; at 360px and below it is 52px.
- **Edition:** The TASA “Native iOS port” line is 21px, weight 500, reducing to 20px on mobile.
- **Headline:** Section headings follow the headline token, reducing to 25px/1.3 at 720px and below.
- **Title:** Technical subheadings follow the title token, reducing to 17px on mobile. Next-step and log headings are smaller contextual variants.
- **Body:** Reading copy follows the body token, with paragraphs and lists capped at 76ch. Mobile uses 15px/1.85. The masthead summary uses 15px/1.75, reducing to 14px/1.8 on mobile.
- **Label:** Contents links and fact rows use compact text. Tables use 14px/1.7 on desktop and 12px/1.7 on mobile. Table captions identify evidence; screenshots have no visible captions. Viewer counts use tabular figures.

**The Reading Voice Rule.** Reserve Anton for the game identity; keep explanatory hierarchy in compact TASA text.

## Layout

The site header places the small Mons Games identity left and portfolio/repository links right. A compact document masthead pairs identity, summary and prototype context with a 316px fact column. A grayscale repository screenshot sits faintly behind its right side (13% opacity); a thin two-color electrical rule marks the lower edge.

The main container is capped at 1320px including fluid gutters. Desktop uses a 190px sticky contents rail, a 58px gap and a flexible article capped at 976px. The rail sits 28px below the viewport top. Sections use top rules, 28px top padding and 43px separation; the first starts immediately. Illustrated sections pair prose with a smaller media column separated by 30px. Screenshots are capped at 340px wide with 16:9 previews and full-resolution originals. Minimum supported viewport width is 320px.

- **At 1320px and below:** Footer gains the content gutter.
- **At 1100px and below:** Rail becomes 166px, document gap 35px and masthead fact column 275px; illustration/measurement spacing tightens.
- **At 960px and below:** Contents returns to document flow above the article. The expanded native disclosure uses two navigation columns. JavaScript closes it by default at this size and opens it above this breakpoint. Illustrations can still sit beside prose.
- **At 720px and below:** Gutter is 24px; masthead, illustrations, measurements and log entries stack. The grayscale masthead image spans the field at 7% opacity. The redundant Portfolio text link hides while the linked Mons Games identity remains. Contents becomes a full-width, single-column disclosure. Screenshots sit under associated text, capped at 420px and available width. Section gaps reduce to 34px. Comparison tables use fixed 26% / 42% / 32% columns with wrapping text; the wrapper retains overflow handling for content resilience.
- **At 360px and below:** Gutter becomes 20px; identity and fact columns tighten further.

The reading sequence is project, status, runtime integration, Metal work, profiling, renderer work, performance/limitations, next steps, development log and repository/attribution. The HTML has one h1, section h2s and meaningful h3s. A skip link targets main; landmarks, table captions and scoped headers expose structure.

## Elevation & Depth

The reading surface is flat. Existing coal grain, the faint grayscale masthead image, dark tonal fields and fine rules provide atmosphere and separation. Only the native full-size image dialog uses a modal shadow (`0 24px 80px #0009`) and nearly opaque green-black backdrop (`#060a08f5`).

The electrical line is static. Disclosure-chevron and screenshot-outline feedback lasts .2s with `cubic-bezier(.16,1,.3,1)`. Anchor navigation scrolls smoothly; reduced motion disables smooth scrolling and removes transitions and animations.

## Shapes

Square screenshot frames, dialog controls, ruled tables and straight section edges keep the document precise. A small skew belongs only to the game word. Thin angular blue/red electricity supplies the masthead signature. The document has no ornamental corner labels, photo metadata badges or rounded image cards.

## Components

### Masthead identity and facts

The supplied Mons mark is a small pale mask paired with stacked MONS/GAMES lettering. Header links retain at least 44px target height. Project facts use a definition list with ruled label/value rows. Prototype wording, device and measured performance sit directly under the summary.

### Contents disclosure

Native `details`/`summary` contains section links. The enhanced desktop rail opens by default; compact layouts close by default. Visitors can toggle it in either layout. Links use a thin left rule, then light-blue text, karma-blue border and faint wash for hover, focus and `aria-current="location"`. IntersectionObserver marks the current section when supported. Without JavaScript the native disclosure and anchors remain usable.

### Prose, tables and lists

Open paragraphs, compact headings and strong text carry the explanation. Ruled tables have subdued green header fields, visible captions and semantic row/column headers. Measurement definition rows split labels/descriptions on desktop and stack on mobile. Bullets use blue markers; numbered next steps remain in document flow. The limitations heading has a short red rule. Log entries pair factual heading/state text with a description, then stack on mobile.

### Inline captures and inspection

Four repository screenshots illustrate status, runtime integration, Metal rendering and performance. Preview figures contain original-image links with descriptive alternative text and accessible names. They have no visible photo captions, indices, tags, corners or hover icons. A thin frame changes to karma blue on hover; the image does not zoom or brighten. Names and counts appear in the inspection dialog to support navigation.

JavaScript enhances direct-image links into a labeled native dialog. Previous/next buttons and left/right keys cycle images; close, Escape and outside-click dismissal return focus to the opener. Modified clicks keep native link behavior. A polite status region reports loading/failure; “Open original” remains available. Originals use `object-fit: contain`. Without JavaScript or dialog support, links open the original PNG directly.

### Focus and viewer controls

Global keyboard focus uses a 3px light-blue outline offset by 5px; screenshot links use a 4px offset. Viewer buttons are square 44px controls with thin green-gray borders; hover fills them light blue with ground-colored icons. Below 720px their width becomes 40px while height remains 44px. The dialog contracts without removing the original-image action.

### Footer

A ruled compact footer supplies author/home, privacy and back-to-top links and wraps on narrow screens. No forms, filter chips or download controls are part of this system.

## Do's and Don'ts

### Do:

- Do maintain a complete illustrated technical document with factual headings, readable explanations and explicit validation boundaries.
- Do keep screenshots small or medium, beside relevant desktop prose and directly after it on narrow screens, with full-size originals available.
- Do retain the blue/red electrical signature and gloomy green-gray street atmosphere with restrained static treatment.
- Do use native disclosure and dialog semantics, descriptive image alternatives, visible focus and reduced-motion behavior.
- Do keep this system scoped to inFAMOUS; preserve the homepage and Bad Haunts worlds.

### Don't:

- Don't restore marketing slogans, a cinematic poster hero, oversized image sections or giant performance typography.
- Don't add visible photo captions, corner labels, repeated provenance tags, synthetic game imagery, external reference artwork or video.
- Don't present sampled karma colors as official canonical HEX standards or use color alone to communicate validation state.
- Don't present short experimental comparisons or screenshot HUD readings as sustained whole-game performance claims.
- Don't add source/build download promises or imply unvalidated controls, campaign coverage or long-session stability are complete.
