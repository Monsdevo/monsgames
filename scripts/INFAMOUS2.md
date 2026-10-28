# Maintaining the inFAMOUS 2 iOS technical dossier

The page lives at `/infamous2-ios` within the existing static site. GitHub Pages serves the committed `infamous2-ios/index.html`; the local/Sites build uses the same generated file.

## Content

Edit `scripts/infamous2-content.mjs`, then run `npm run build` and commit the generated `infamous2-ios/index.html` along with the source changes. The `captures` array assigns images to technical sections; `updates` controls the development log, newest first. Updates may include an optional verified ISO `date` (`YYYY-MM-DD`). Omit dates if unknown. No client-side request to GitHub is required.

For other copy or structural changes, edit `scripts/templates/infamous2-ios.html`, then build. Do not edit the generated index directly. Page-specific CSS and progressive enhancement are in `infamous2-ios/style.css` and `page.js`.

## Screenshots

For each capture, add three files in `assets/infamous2-ios`:

- `name.png`: the original full-resolution capture; only requested by the lightbox or an original-image link.
- `name.webp`: a 1600×900 preview.
- `name-small.webp`: an 800×450 preview for mobile and half-width images.

Set `file: "name"`, accurate `alt`, `title` and `section` in the captures array. Valid sections are `STATUS`, `RUNTIME`, `METAL` and `PERFORMANCE`. Images sit beside the related text and stay at or below340px on desktop. Titles are used only for accessible link names and the full-size dialog; they are never visible photo captions. Additional images can share a section. The lightbox discovers captures from the rendered links, so no JavaScript list needs updating. Without JavaScript, links still open original PNGs.

Existing previews remove device black bars and the top-right menu overlay with `crop=1936:1089:284:48`, then scale to the sizes above. The performance-HUD preview uses `crop=1936:1089:284:30` to preserve the complete top row of the overlay. Do not reuse these crop coordinates for a differently sized capture without checking it. Preserve real game rendering and the performance HUD; original PNG pixels remain unchanged. The initial originals are 2556×1179. If that changes, update the dialog's width/height hints in the template.

Keep source provenance using the project's Impeccable `embed-prompt.mjs` helper. PNG provenance is embedded; WebP uses `.json` sidecars, excluded from public deployment by both builds. Current image source: `Monsdevo/infamous2-ios`, commit `49b20bf52a878709de6707f94f0debef6cc9fd49`, `media/`.

## Verification

Run `npm run build`, `npm test`, then the browser check with a local dev server. `scripts/verify-infamous.mjs` uses the existing machine's Playwright runtime, like `scripts/verify-browser.mjs`. Set `SITE_URL` if the server is not at `http://127.0.0.1:4175`. `PORT` selects the dev-server port (default 4174).

Keep all factual details aligned with the public README, including measurements, platform integration, settings/CSV, reference/experimental paths, memory/stack changes, profiling, current optimization work and every next step. Current gameplay is around6FPS; no sustained high-framerate claim, public build, full-campaign validation or implemented touch controls. No video at this stage. Preserve the closed-source and unofficial-project disclosures. Use factual section titles and explanations, not slogans or repeated photo labels.
