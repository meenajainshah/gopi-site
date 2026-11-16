# gopi-site

## Share cards

Two static, noindex pages, not linked from the main menu. Both are generated from `card.config.json` (name, short name, tagline, photo, offer, credential, three messages, `recommended`). Colours, fonts and corner style come from the `:root` CSS variables in `index.html`.

- `/card.html` is **Gopi's intro card**. No questions and no name: it shows his card and his own message, ready to send on WhatsApp or anywhere.
- `/refer.html` is the **refer card**. Gopi sends its link to clients and local businesses. They pick "I am a client" or "I am a local business", add their name (optional), and get a card that says "Referred by <name>" with a message to send on.

```
node tools/build-card.mjs                      # writes card.html and refer.html
npm install && npm run test:card               # builds variants and runs the browser tests
```

- `recommended` is `null` (no badge) or `{ "clients": N, "businesses": N }`. The badge only appears for real, non-zero counts.
- The build fails if the site colours do not meet WCAG AA contrast.
- The link is the live site address from `siteUrl` in the config (now https://www.coach-gopi.com/) plus `?ref=<slug>` on the refer card. Without `siteUrl` it falls back to the page's own folder. The sender's name is never stored.
- Libraries load from cdnjs: qrcode-generator 1.4.4 and html2canvas 1.4.1. If they fail, copy and WhatsApp still work.

## Link preview

When the site link is shared as text (for example on WhatsApp), apps show a preview card from the Open Graph tags in `index.html`, using `assets/og-card.jpg`. Regenerate the image after changing the name, photo or offer: `node tools/build-og-image.cjs`. Apps cache previews, so a changed image can take a while to appear. The preview is the same for every `?ref=` link.

## Pages

The site has seven pages built from the content in `tools/build-site.mjs`: Home, Running Coach, Nutrition & Diet, Corporate Wellness, Events & Race Management, About Coach Gopi and Contact. Each has its own title, description, canonical URL, share preview tags and structured data. Styles are in `assets/site.css` and the enquiry forms in `assets/site.js`.

```
node tools/build-site.mjs          # rebuilds every page, sitemap.xml and robots.txt
npm run test:site                  # checks titles, links, mobile layout and the enquiry forms
```

- Enquiry forms (Contact, Corporate Wellness, Events) email Gopi through FormSubmit, with a WhatsApp fallback if the email fails.
- Buttons and forms push simple events (for example `free_plan_download`, `running_coaching_enquiry`, `whatsapp_click`) to `window.dataLayer` and `gtag` if either exists. No analytics script is installed yet.
- Not published, because the content document asks for confirmation first: the Radiscan attendance and productivity figures.
