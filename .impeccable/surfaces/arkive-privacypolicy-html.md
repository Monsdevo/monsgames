---
version: 1
slug: "arkive-privacypolicy-html"
primary_target: "arkive-privacypolicy.html"
related_targets: ["scripts/content/ARKIVE-Privacy-Policy.md"]
---

# ARKIVE privacy policy

Mode: Read. This surface is an explicit, user-pinned exception to the personal portfolio in PRODUCT.md and DESIGN.md. Its visual authority is **ARKIVE Monolith**, scoped only to this policy page. It does not change the homepage, Bad Haunts, or inFAMOUS systems.

Audience: ARKIVE iPhone app users seeking clear privacy information in English or Turkish. Job: find the relevant language, read the supplied policy, and reach the privacy contact. Preserve the approved text from `scripts/content/ARKIVE-Privacy-Policy.md`, including publisher Bartu Yılmaz, effective date 2026-11-24, and `bartylmaz@gmail.com`. English comes first, then Turkish; do not paraphrase or add legal claims during visual maintenance.

## Overview

**Creative North Star: "ARKIVE Monolith"**

A quiet, dark reading document with strong headings and a small notched book-like SVG mark. The single column, visible language links, and plain rules make a long bilingual policy easy to scan. The user supplied this direction; no portfolio typography, cobalt accent, promotional composition, or additional visual exploration is required.

## Colors

- Background: `#0A0A0A`.
- Main text and foreground mark: `#F5F5F2`.
- Metadata, hover text, and secondary mark face: `#969696`.
- Header and language-section rules: `#303030`.

## Typography

Use the system stack `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; no font downloads. Body is 17px with 1.75 line height. The ARKIVE wordmark is 20px/1.2 at weight 750 with .12em tracking. Policy titles are 40px/1.15 at weight 750; section headings are 22px/1.35 at weight 700. Metadata is 15px/1.8. At 480px and below, titles become 32px and section headings 20px.

## Layout

Keep all text left aligned in one centered column capped at 70ch. Horizontal gutters are 24px, becoming 20px at 480px and below. The header contains the small mark and ARKIVE name, then top-level English and Türkçe anchors targeting `#english` and `#turkce`. Both language sections remain in document flow and carry their own `lang` and labelled headings. Metadata precedes the policy paragraphs in each section.

## Elevation & Depth

Flat background and thin rules only. No cards, shadows, gradients, motion, or decorative surface treatments.

## Shapes

Square corners throughout. Preserve the small inline notched SVG mark at 26 × 46px; it is decorative and hidden from assistive technology.

## Components

Language links use wrapping flex layout and 44px minimum targets. Links remain underlined, wrap long addresses, and provide a visible 2px keyboard outline. Privacy contact links use `mailto:bartylmaz@gmail.com`. No scripts, analytics, external assets, or automated language switching are part of this surface.

## Do's and Don'ts

- Keep both supplied policies complete, in English-then-Turkish order.
- Preserve readable narrow layouts, native anchors, keyboard focus, and the supplied contact details.
- Do not import the portfolio's TASA Orbiter, light palette, cobalt, cards, or interactive effects.
- Do not add scripts, analytics, motion, cards, shadows, gradients, or external font/image requests.

## Delivery and review

Production target: [monsgames.net/arkive-privacypolicy](https://monsgames.net/arkive-privacypolicy). The source is the root `.html` file; GitHub Pages serves its clean URL, with the corresponding worker route included in delivery. The canonical URL is the clean path.

Review disposition: **ship**, based on the implementation review's full-page [1440px desktop](../review/arkive-desktop.png) and [390px mobile](../review/arkive-mobile.png) screenshots, supplied-policy text equality, no-script and external-request checks, and no-overflow checks at 320px, 390px, and 1440px. This disposition describes the reviewed artifact; production deployment is a separate verification.

The preexisting root DESIGN.md / `.impeccable/design.json` documentation has stale portfolio details. That unrelated drift is reported only; this scoped policy task does not repair or replace either file.
