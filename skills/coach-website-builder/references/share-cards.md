# Share cards and link previews

Two static pages, noindex, not in the menu, generated from one config by `scripts/build-card.mjs`.

- **Intro card (`/card.html`)**: the owner's own card. No questions. Their message, a plain link, WhatsApp button, copy button, save-as-picture button.
- **Referral card (`/refer.html`)**: clients and local businesses recommend the owner. They pick client or local business, type an optional name (max 40 characters), and get a card that says "Referred by <name>", a link ending `?ref=<slug>`, a QR code and a recommending message.

## Run
From the site root: `node <skill>/scripts/build-card.mjs` (writes `card.html` and `refer.html`; add `--config`, `--mode intro|refer`, `--out` as needed) and `node <skill>/scripts/build-og-image.cjs` (writes `assets/og-card.jpg`; needs Playwright). Copy `assets/example-coach-gopi/card.config.json` as the config.

## Config (`card.config.json`)
name, short name, tagline, `siteUrl` (the live address, so links never show a preview or file address), photo (square crop), offer line, one credential, three messages (practitioner, client, business), `recommended` (null, or real counts; the badge stays hidden otherwise), and brand colours and fonts read from the site's CSS tokens.

## Rules
- The name lives only in the link and on the card. Never store it.
- Slug: lowercase a to z, 0 to 9, hyphens, 30 characters maximum. Empty name means a plain link.
- The card is designed at 540 px and exported at 2x, so the saved picture is 1080 px wide and the QR still scans.
- The build fails if colours miss AA contrast.
- If the QR or picture library fails to load, copy and WhatsApp still work.
- Counts, ratings and names are never invented.

## Link preview (so a shared link shows a card)
Messaging apps build the preview from Open Graph tags on the page behind the link. Add `og:title`, `og:description`, `og:image` (1200 x 630 JPEG under 300 KB) and `twitter:card` to the home page. Make the image with `scripts/build-og-image.cjs`. The preview is the same for every `?ref=` link. Apps cache previews, so a fresh link may show the card sooner.

## Tests (see `assets/example-coach-gopi/card.test.cjs`)
Referred-by tag and `?ref=` link, QR decodes to the same link, intro has no question or name field, badge hidden when `recommended` is null, saved picture is 1080 px wide and its QR scans, 375 px has no sideways scroll, colours and photo follow the config, the page works if the libraries fail to load.
