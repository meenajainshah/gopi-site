# gopi-site

## Share card (`/card.html`)

A static, noindex page where Coach Gopi, a client or a local business makes an intro card and a ready message to send on WhatsApp or anywhere. It is not linked from the main menu.

It is generated from `card.config.json` (name, short name, tagline, photo, offer, credential, three messages, `recommended`). Colours, fonts and corner style come from the `:root` CSS variables in `index.html`.

```
node tools/build-card.mjs                      # writes card.html
npm install && npm run test:card               # builds variants and runs the browser tests
```

- `recommended` is `null` (no badge) or `{ "clients": N, "businesses": N }`. The badge only appears for real, non-zero counts.
- The build fails if the site colours do not meet WCAG AA contrast.
- The link is always the page's own folder plus `?ref=<slug>`; no domain is hard-coded. The sender's name is never stored.
- Libraries load from cdnjs: qrcode-generator 1.4.4 and html2canvas 1.4.1. If they fail, copy and WhatsApp still work.
