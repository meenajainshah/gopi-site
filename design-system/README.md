Build every Coach Gopi page from these tokens. Take colours, fonts and radii from `tokens.json`; never type a hex value or a font name into a page. The live site (`assets/site.css` in the `gopi-site` repository) already defines the same names as CSS variables in its `:root` block, so a new page that copies that block matches the site.

## Content fundamentals

- Write in plain, direct English as Gopi speaks to a runner: "I'll help you move forward", "Run your first race". First person singular for Gopi ("I"), second person for the runner ("you"). No emoji.
- Say what the runner gets and what it costs. Prices are in rupees with a thousands comma and a per-month label: "₹2,750 per month". Commitments are 3, 6 or 12 months.
- Use real numbers from the record and never round them up. Pacing history: 20 half marathons as the 2:30 pacer, 6 as the 70-minute 10 km pacer, 1 sub-5-hour full marathon (Vadodara, January 2020). Client stories use first names only where the client agreed.
- Credentials as the site states them: "UESCA Certified Running Coach", "Certified Nutrition & Diet Coach", "Former President, ADR". Place: "Ahmedabad & Online"; sessions are at the Riverfront.
- Never invent counts, ratings or testimonials. The "Recommended by" badge on a share card appears only when `recommended` in the card config holds real numbers.

## Visual foundations

- **Colour.** Warm grey-green page (`bg`), white cards (`surface`), near-black teal ink. One action colour: orange `accent`. Teal `river` is for labels and chips. Both themes are defined; dark follows the viewer's setting and an explicit `data-theme`.
- **Type.** Barlow Condensed (`display` family) in uppercase for headlines and names, Barlow (`body`) for text, IBM Plex Mono (`mono`) for eyebrows, tags, paces and links. Headlines are tight (line height 1). Set uppercase in CSS with `text-transform`; the type styles do not carry it.
- **Layout.** A race-day sheet: a big uppercase headline beside the portrait, log tables of paces and prices, and service and programme cards in a grid. The pace bib is kept as a component for pages that show a target time. Content is at most `wrap-max` wide with a 16px side gutter; sections have `space-72` above and below.
- **Borders, not shadows.** Separate things with `border-hairline` in `line`. Use `border-strong` in `ink` for the bib and share card. No shadows, no gradients.
- **Radius.** `radius-lg` on cards, `radius-sm` on buttons and fields, `radius-xs` on chips.
- **Focus.** A 3px solid `river` outline with a 3px offset on every focusable element. Do not remove it.
- **Legibility.** Small accent text goes on `surface`, not `bg` (4.2:1 there in light). Form inputs on the share pages use a `muted` border; the `line` border is too faint to mark a control. The accent tag on `accent-tint` is 3.8:1 in light, kept from the source for the 12px uppercase tag only.
- **Share cards** are designed at `card-width` (540px) and exported at 2x. Each carries the practitioner's name, tagline, one credential chip, one offer line, a link in the `accent` WhatsApp tile and a black-on-white QR code. They are generated from `card.config.json` by `tools/build-card.mjs`; do not draw one by hand.

## Imagery and icons

- There is no logo. Set the name "Coach Gopi" in `display`, uppercase; never draw a mark.
- The one photo is a square crop of Gopi running, shown in a circle with a `border-photo` ring in `ink`. Share cards and the preview image use that crop (`assets/card-photo.jpg` in the repository).
- The only icon in use is a WhatsApp-style chat bubble drawn as a 2px stroke in `currentColor`.

## Building a new page

1. Start from the `:root` block of `assets/site.css` (or `tokens.json`) so colours, fonts and radii are the site's own.
2. Compose with the components in this system: `Eyebrow` over a `section-title`, then a `DataTable`, `ProgrammeCard` ladder or `FormatCard` pair, ending in a `FinalCta`.
3. Keep one primary `Button` per screen. Everything else is ghost.
4. Check the page at 375px wide: no sideways scroll, and every row stacks to one column.
5. Mark new pages `noindex` unless Gopi wants them found, and link the live domain `https://www.coach-gopi.com/` (never the Render address).
