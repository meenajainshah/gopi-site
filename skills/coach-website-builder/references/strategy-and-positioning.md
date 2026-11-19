# Strategy and positioning

## 1. Positioning statement
Fill in one sentence the whole site can serve:

> I help **[specific audience]** in **[place or online]** achieve **[specific outcome]** through **[how, in plain words]**, backed by **[proof]**.

Rules:
- Pick one headline offer. Other services support it (a "main programme" and "also available").
- Use the audience's words, not industry words. Check the first thing they would type into Google.
- Proof comes only from the brief: credentials, years, real numbers.

## 2. Page set
Start with the smallest set that covers the services and trust:

| Page | Job | Primary keyword pattern |
|---|---|---|
| Home | Say who you help and route people to the right service | `[service] [place]` |
| One page per service | Rank for that service and convert | `[service] [place]` |
| About | Build trust: credentials, story, community | `[name] [role]` |
| Contact | Enquiry form, WhatsApp, profiles | brand |
| Privacy, Terms | Required for forms and health or fitness claims | none |
| Free resource (optional) | A downloadable or on-page plan that earns trust and links | `[goal] plan` |
| Blog or stories (later) | Answers to real questions; success stories with permission | long tail |

Give every service its own page. One page per search intent. Never stack five services on one page and expect to rank for all of them.

## 3. Keyword map
One primary keyword per page, plus two or three supporting phrases. Keep it in a small JSON file the analyser reads:

```json
{ "/": "running coach ahmedabad", "/nutrition-diet-coach-ahmedabad/": "nutrition diet coach ahmedabad" }
```

Method: list what a client would search ("[service] [city]", "[service] online", "[goal] plan", "how to [outcome]"), check each against the pages above, and put each phrase on exactly one page. Do not stuff. The phrase belongs in the title, the h1, the first paragraph and the URL, written naturally.

## 4. Calls to action and conversion events
- One primary action sitewide (for example "Enquire Now"). Repeat it in the header and at the end of each service page.
- Secondary actions per page: free resource, WhatsApp, book a consultation.
- Name an event for each: `free_plan_download`, `[service]_enquiry`, `whatsapp_click`, `enquire_now`. These go to `dataLayer` and `gtag` if they exist.

## 5. Trust checklist
Photo of the owner, credentials with issuing body, real numbers, named community roles, FAQ that answers real objections, a clear disclaimer where health or money is involved, privacy and terms linked in the footer, contact route that works.

## 6. Off-site plan (needs people)
Google Business Profile (the owner must create and verify it), backlinks from local directories, clubs, events and partner sites, Search Console and sitemap submission, analytics. List these as next steps with owners. Do not claim they are done.
