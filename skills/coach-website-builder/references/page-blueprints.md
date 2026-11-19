# Page blueprints

Each page has: SEO title (50 to 60 characters, keyword first, brand last), meta description (120 to 160, a reason to click), one h1, an intro paragraph with the primary keyword, sections in heading order (h2 then h3), internal links, one primary call to action, and a footer.

## Home
- h1: the positioning line. A second line can carry the keyword ("Helping people and communities move forward").
- Intro (what, for whom, where). Portrait with real alt text. Three facts the owner can prove.
- Service cards, one per service page, each linking to it.
- "Why [name]": proof list from the brief. Community or story paragraph.
- Optional social proof (embedded posts) once the owner has approved each one.
- Final call to action band.
- Schema: Person (or LocalBusiness if there is a public address), WebSite.

## Service page (one per service)
1. h1 with the service and place. Short intro naming who it is for.
2. Levels or options (cards): beginner, intermediate, advanced; or packages.
3. What is included (bullets). How it works (steps).
4. Fees table with commitment terms. A note on minimums and add-ons.
5. Free resource if relevant, with its disclaimer.
6. FAQ: 4 to 6 real questions, answers in plain words. Add FAQ schema only for genuine questions.
7. "More from [name]": links to the other service pages.
8. Primary call to action and a form or a link to Contact with the service preselected (`/contact/?service=key`).
- Schema: Service (provider is the Person), FAQPage if FAQ is real.

## Service page for organisations (companies, events)
Same as above, plus: who you work with, programmes, how a programme works (discover, design, launch, engage, review), "why this person" proof, and an enquiry form with the fields an organiser needs (organisation, contact person, size or date, location, support required, stage). Do not publish case-study numbers until the owner confirms the period, method and permission. State clearly what stays the responsibility of other providers.

## About
- h1: about [name]. Portrait. Story in three short blocks: credentials, journey, community. Keep dates and roles exactly as the owner gave them.
- Credentials list. Philosophy in two or three sentences. Links to services.
- Schema: Person and ProfilePage.

## Contact
- Short intro, WhatsApp button, social links, a general form with a service dropdown that reads `?service=`.
- Never show the owner's personal email address unless they ask. Show the form instead.

## Privacy policy
State: who is responsible, what the forms collect, how enquiries reach the owner (which form service), who else sees a visit (messaging apps, embeds, fonts, host), cookies and analytics (say honestly if none), retention, the visitor's choices and a contact route, children, security, changes with a date. Update it whenever analytics, a new form service or new embeds are added.

## Terms and disclaimer
State: about the site, health and fitness disclaimer (see `claims-and-compliance.md`), what the free resource is and is not, services and fees as published, how organisation work is scoped in writing, accuracy of site content, third-party links, intellectual property, limits of responsibility, governing law (confirm with the owner), contact.

## Free resource page or section
Make the useful part visible on the page (a table, a checklist) so it can rank and earn links. Add the disclaimer next to it. Track a `free_plan_download` event on the link or button.
