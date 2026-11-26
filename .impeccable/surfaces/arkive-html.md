---
version: 1
slug: "arkive-html"
primary_target: "arkive.html"
related_targets: ["assets/arkive/landing.css", "assets/arkive/landing.js"]
---

# ARKIVE landing page

Mode: Persuade. Help prospective iPhone users understand what ARKIVE can do offline after setup and find it on the App Store when the listing goes live.

## Direction

**The Monolith** is the pinned direction for this page, drawn from the app’s `DESIGN.md`. Use a black canvas, warm off-white ink, graphite rules, and one full-width light section. Lead with “Knowledge Without a Signal.” beside the actual notched mark. Set type in the app’s SF Pro through the system stack, with tight display headings and a small monospaced status line. Keep the two-column feature sections readable as a single column on phones.

Qualify offline chat with model setup, and Vision with a compatible Gemma 4 model and matching projector. Describe document import, offline search, category selection, and source references using the app’s shipped capabilities. Keep the app’s private product and design documents scoped to the app project and out of the published site.

## Assets and behavior

- `assets/arkive/chat.webp` and `assets/arkive/models.webp` are genuine captures from an earlier build, exported from the app project’s `.impeccable/review/phone-chat.png` and `.impeccable/review/phone-models.png` respectively.
- `assets/arkive/monolith.webp` and `assets/arkive/social.jpg` derive from the app’s `Arkive/Assets.xcassets/AppIcon.appiconset/Monolith.png`.
- `assets/arkive/app-store-badge.svg` is the official English badge from Apple Marketing Tools. Keep `arkive-app-store-url` blank while the listing is pending. A valid App Store listing URL enables both the badge and footer link in place of the coming-soon state.
- Reveal the status line once, with a brief spectral glow per token that settles to muted ink. Reduced motion and JavaScript-free views show the complete, static line.

## Delivery and review

- Production target is [monsgames.net/arkive](https://monsgames.net/arkive), served by GitHub Pages from `Monsdevo/monsgames` `main`. Keep links to `/arkive-support` and `/arkive-privacypolicy`.
- Finish review verdict **ship**. App Store activation is pending the live listing.
