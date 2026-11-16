# Coach Gopi design system

Source of truth for the look of every Coach Gopi page. Published copy (with live previews): https://claude.ai/artifact/5YTSw98TLB4sXmvPs4bns3

- `README.md`: the brand book (tone, visual rules, imagery, how to build a page).
- `tokens.json`: colours (light and dark), type, spacing, radius, borders and layout sizes.
- `components/bundle.css`: shared component styles (`gd-*` classes) that use the token names as CSS variables.
- `components/<Name>/README.md` and `preview.html`: usage notes and a live preview for each component.
- `design-system.json`: index file used by the design system viewer.

The live site defines the same token names in the `:root` block of `/index.html`. When a colour or font changes, change it in `tokens.json` and in `index.html`, then rebuild the share cards (`node tools/build-card.mjs`) and the preview image (`node tools/build-og-image.cjs`).

These files are not served as part of the site pages; they are reference only.
