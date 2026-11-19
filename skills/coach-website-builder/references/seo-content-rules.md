# SEO and content rules

## Titles and descriptions
- Title: 50 to 60 characters. Primary keyword near the front, brand at the end ("Running Coach Ahmedabad | Beginner to Ultra | Coach Gopi"). Unique on every page.
- Description: 120 to 160 characters. Say what the page offers and why to click. Include the keyword once, naturally. Unique on every page. No quotes or line breaks.
- Open Graph and Twitter tags on every indexable page: title, description, url, image (1200 x 630, under 300 KB), image alt.

## Headings and copy
- Exactly one h1 per page, containing the primary keyword. Then h2 sections, with h3 only inside an h2. Never skip levels for styling.
- Put the primary keyword in the first 100 words. Use related phrases and plain language; never repeat the keyword mechanically.
- 300 or more words on service and about pages. Short paragraphs. Bullets for lists. Lead with what the reader gets.
- Write for the person first. Say who it is for, what happens, what it costs, what to do next.
- Avoid claims you cannot support: "best", "guaranteed", ranked positions, invented numbers.

## URLs
Lowercase, hyphens, readable: `/running-coach-ahmedabad/`. Keep a trailing slash consistently. If an address changes, add a 301 redirect and update links.

## Internal links
- Every page is linked from the menu or from another page. No orphan pages.
- Use descriptive anchor text ("running coaching fees"), not "click here".
- Add a "More from [name]" block on each service page and links inside the body copy where natural.
- Each page ends with one clear action.

## Images
Real photos with accurate alt text (describe what is visible). Width and height attributes. Compress. Lazy-load below the fold. A decorative image gets an empty alt on purpose.

## Structured data (JSON-LD)
Only what is true: Person (name, job title, sameAs profiles, city), WebSite, Service per service page, ProfilePage on About, FAQPage only for genuine FAQ, LocalBusiness only with a real public address. Validate that it parses.

## Technical files
- `sitemap.xml` listing every indexable page with the live address. Leave noindex pages out.
- `robots.txt` allowing crawling and pointing to the sitemap.
- `llms.txt` at the root: a short description of the business, a list of pages with one line each, key facts such as fees and credentials (only true ones).
- Favicon set (ico, svg, 180 px touch icon, manifest), `theme-color`, `lang` on `<html>`, viewport meta, canonical on each page.
- One address wins: choose `www` or the bare domain, redirect the other to it, and use it in canonicals, share tags, the sitemap and the cards.

## Local SEO
Consistent name, address (or service area) and phone everywhere. Create and verify a Google Business Profile (owner action). Mention the city naturally in titles, h1s and copy. Ask satisfied clients for reviews on the profile, never write them.

## Backlinks (off-site, needs people)
Quality over quantity: local directories, clubs and community groups, event websites the owner took part in, partner and supplier pages, guest posts, podcasts, local press. Track each link and the date.

## Analytics and monitoring
Search Console (verify, submit the sitemap, watch coverage and queries), analytics with the conversion events from the strategy, and a monthly re-run of `seo_audit.mjs`.

## What the analyser checks
Title and description length and uniqueness, one h1, heading order, canonical, share tags, JSON-LD validity, favicon, `lang`, viewport, alt text, image sizes, broken internal links and anchors, new-tab links without `noopener`, thin content, sitemap and robots, `llms.txt`, orphan pages, and keyword placement from `keywords.json`. A high score means fewer fixable on-page problems. It is not a ranking prediction.
