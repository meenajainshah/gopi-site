# Testing, launch and sign-off

## 1. Offline tests (run before every merge)
Use the example tests as a template (`assets/example-coach-gopi/site.test.cjs`, `card.test.cjs`):
- Every page: 200, unique 40 to 60 character title, unique description, canonical on the live domain, one h1, valid JSON-LD, alt text on every image, favicon links, footer legal links.
- Mobile: no sideways scroll at 375 px, whole menu on screen with comfortable tap targets.
- Links: every internal link and anchor resolves.
- Forms: required-field errors, posts to the endpoint, success message, WhatsApp fallback, `?service=` preselect.
- Files: sitemap lists every indexable page and excludes noindex pages, robots points to the sitemap, `llms.txt` lists every page.
- Claims: a test that fails if an unconfirmed figure or name appears on any page.

## 2. SEO analysis
`node scripts/seo_audit.mjs --dir . --site <live address> --keywords keywords.json --out seo-report.md`. Fix every error and real warning. Keep the report.

## 3. Live test (after deploy)
Run the same checks against the real address with a headless browser. Compare a few pages byte for byte with the host's own address to prove the custom domain serves the same site. Check: titles, menu on a phone width, favicon, `llms.txt`, `sitemap.xml`, share image, cards (live link, QR, 1080 px picture), forms (with the owner's knowledge).
Things that often only show live:
- Third-party embeds widening the page. Test with the embed script loaded.
- A bare domain forwarding to the host address instead of the main address. Fix at the host or DNS.
- Cached old pages. Hard-refresh, then compare with the host address.
If the live site cannot be reached, say so in the sign-off and ask the owner to check on a phone with a short checklist.

## 4. Sign-off note
Write it only after the tests above. Format:

> **Signed off by Claude.** Date. Scope: code, automated checks (counts), SEO analyser score, deploy status on the host.
> **Verified live by me:** list exactly what.
> **Not verified by me:** list exactly what (for example, third-party embeds displaying, email arrival, the custom domain if unreachable).
> **Open items for people:** backlinks, Business Profile, Search Console, analytics, legal review, real logo, anything on the confirmation list.

Do not sign off if a test failed or a required check could not be run without saying so plainly.

## 5. After launch
Submit the sitemap in Search Console, verify the Business Profile, add analytics (update the privacy policy), re-run the analyser monthly, add new pages through the build script, and re-run the share-card and preview builds when the name, photo or offer changes.
