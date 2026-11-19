---
name: coach-website-builder
description: Build a complete, search-ready website and online presence for a solo coach, trainer, therapist, consultant or other practitioner. Covers positioning and strategy, page set and SEO content, a design system and mobile-first pages, enquiry forms that email the owner, shareable intro and referral cards, an on-page SEO analysis, testing and sign-off. Use when someone asks for a website, landing pages, SEO content, an SEO audit or enquiry forms for a coach or small service business, or wants to rebuild or improve one.
---

# Coach website builder

Build one all-in-one presence for a solo practitioner: strategy, SEO content, design, enquiry forms, share cards, on-page SEO analysis and a tested launch. This skill comes from the Coach Gopi site (a running coach in Ahmedabad). That site is in `assets/example-coach-gopi/` as a worked example. Copy its structure, not its words.

## Ground rules (never skip)

1. **No claims you cannot back.** Never invent client names, counts, ratings, results, awards, prices, dates or testimonials. Use only what the owner gave you. Anything unconfirmed goes on a short "needs confirmation" list and stays off the pages (for example, client results that name people, or figures a document says to confirm first).
2. **Legal and health pages are drafts.** Privacy, Terms and health disclaimers are written from what the site really does. Tell the owner they are not legal advice and list the choices that need confirming (governing law, refund policy, contact route).
3. **Outward actions need the owner's go-ahead.** Do not publish, merge, send a test email or change DNS without being asked. A test enquiry emails the owner; label it clearly and say so.
4. **Be honest about what you tested.** Report what you actually ran. If you could not reach the live site, say so. Never write "tested live" for something you did not test live.
5. **Mobile first.** Most visitors arrive on a phone. Every page must work at 375 px wide with no sideways scroll.

## Workflow

Work in these phases. Finish each before the next, and show the owner the result of phases 1 to 3 before building.

### 1. Intake
Collect what you need using `references/intake-questionnaire.md`. If the owner already shared documents (a profile, a content file, links), read them first and ask only for what is missing. Output: a one-page **brief** (who, where, services, prices, proof, goals, domain, contact routes).

### 2. Strategy and positioning
Follow `references/strategy-and-positioning.md`. Decide the one thing the owner wants to be known for, the audience, the page set, the main call to action and the conversion events to track. Output: **positioning statement, sitemap and keyword map** (one primary keyword per page).

### 3. Content with SEO
Write each page from `references/page-blueprints.md` and the rules in `references/seo-content-rules.md`: title 50 to 60 characters, description 120 to 160, one h1, headings in order, internal links, FAQ only for genuine questions, structured data only where true. Output: **page copy** with a title, description and h1 for every page. Keep a running **confirmation list** of anything unverified.

### 4. Design system and build
Follow `references/design-system.md`. Define colour, type, spacing and radius tokens once (light and dark, contrast checked), then build the components and pages from them. Use `assets/starter/site.css` and `assets/example-coach-gopi/build-site.mjs` as the starting point: pages are generated from one script so every page shares the head, menu and footer. Add a favicon (a simple monogram is fine until there is a logo), a share-preview image, `sitemap.xml`, `robots.txt` and `llms.txt`.

### 5. Enquiry forms
Follow `references/forms-and-leads.md`. Use `assets/starter/site.js`: forms email the owner, with a spam trap, required-field checks, a WhatsApp fallback if sending fails, and simple conversion events. Service pages that need more detail (companies, events) get their own form fields.

### 6. Share cards
Follow `references/share-cards.md`. Generate an intro card for the owner and a referral card that clients and local businesses can fill in, from one config, using `scripts/build-card.mjs`. Also make the share-preview image with `scripts/build-og-image.cjs` so a bare link shows a card in chat apps.

### 7. On-page SEO analysis
Run `node scripts/seo_audit.mjs --dir <site> --site <live address> --keywords keywords.json`. Fix every error and every warning that is real, re-run, and keep the final report. Read `references/seo-content-rules.md` to decide which warnings matter. Off-site items (backlinks, Google Business Profile, Search Console, analytics) are listed for the owner, not faked.

### 8. Test, launch and sign off
Follow `references/testing-and-signoff.md`: automated page tests (see the example tests), the analyser, then a live test on the real address once it is deployed. Write a short **sign-off** that lists exactly what was checked and what was not.

## Outputs to hand over
- The built site and its source script, with a short README on how to rebuild and test.
- The brief, sitemap, keyword map and confirmation list.
- The SEO report (before and after) and the sign-off.
- A short list of next steps that need people (backlinks, Business Profile, Search Console, real logo, owner review of legal pages).

## Files in this skill
- `references/`: the detailed guidance for each phase.
- `scripts/seo_audit.mjs`: dependency-free on-page SEO analyser for a built static site.
- `scripts/build-card.mjs`, `card.template.html`, `card.client.js`, `build-og-image.cjs`: intro and referral cards and the share-preview image, driven by a config file.
- `assets/starter/`: site stylesheet (tokens and components) and the form script.
- `assets/example-coach-gopi/`: the page builder, card config and tests from the Coach Gopi site.
