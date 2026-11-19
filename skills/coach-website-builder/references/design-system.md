# Design system and build

## Principles
- The site looks like the owner, not like a template. Choose a palette, two or three typefaces and a corner style that suit the subject, then keep to them.
- Build from tokens. Never type a hex value or font name into a page.
- Borders, not shadows, unless the brand calls for shadows. One action colour. A second colour for labels and chips.
- Mobile first at 375 px. Gutters of at least 16 px. Rows stack to one column. Tables and long code scroll inside their own box.
- Focus rings are visible (3 px outline). Respect reduced motion.

## Tokens (define once, light and dark)
Colour: `bg`, `surface`, `ink`, `muted`, `line`, `accent`, `accent-ink`, `accent-tint`, a secondary hue and its tint. Type: display, body, mono families and a scale (hero, section title, card title, lede, body, small, label). Spacing: 8, 12, 16, 20, 24, 32, 48, 72. Radius: tag, button and field, card, band, pill, round. Layout: max width, breakpoints (phone 560, tablet 860 to 900).

## Contrast (WCAG AA)
- Text 4.5:1 (3:1 for large text 24 px or bold 19 px). Controls, focus rings and meaningful borders 3:1.
- Check every pair a note names (for example text on the page background and on cards) in both themes. Small accent text goes on the surface colour, not the page background, if it is under 4.5:1 there.
- Form inputs use a mid-contrast border (the muted colour), not the faint divider colour.
- The card builder fails the build if its colours miss AA.

## Components
Button (primary and ghost), eyebrow label, chip, facts bar (three real facts), service or level card, format card (where and how), data table (fees, paces, schedules), FAQ item (`details`), form field with hint, closing call-to-action band, portrait, menu (wraps into tappable buttons on phones, never a hidden sideways strip), footer with legal links. Write a short usage note for each.

## Build approach
- One build script holds the content and renders every page with a shared head, menu and footer (see `assets/example-coach-gopi/build-site.mjs`). Rebuilding rewrites every page, so titles, links and footers never drift.
- Shared files: `assets/site.css` (tokens and components), `assets/site.js` (forms and events), fonts from Google Fonts with preconnect, images with width and height.
- Third-party embeds (for example Instagram) need containment: give the embed grid `position:relative; overflow:hidden` and never force `width:100%` on the embedded frame, or it can widen the page.
- Add a favicon set, a 1200 x 630 share image and theme colour.

## Publishing the system
Keep tokens in `design-system/tokens.json` with a short README (tone, visual rules, how to build a new page) so later pages and other tools reuse them. If the user wants a browsable copy, make it with the Design System artifact type.
