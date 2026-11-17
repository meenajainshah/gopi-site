#!/usr/bin/env node
// Builds the Coach Gopi pages from the content in this file. Run: node tools/build-site.mjs
// Shared styles: assets/site.css (tokens match design-system/tokens.json). Shared script: assets/site.js.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const SITE = 'https://www.coach-gopi.com';
const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap';
const IG = 'https://www.instagram.com/runningcoach.gopi/';
const LI = 'https://www.linkedin.com/in/gopinath1996/';
const WA = '919879298039';
const OG_IMAGE = `${SITE}/assets/og-card.jpg`;

const NAV = [
  ['/', 'Home'], ['/running-coach-ahmedabad/', 'Running Coach'], ['/nutrition-diet-coach-ahmedabad/', 'Nutrition & Diet'],
  ['/corporate-wellness-ahmedabad/', 'Corporate Wellness'], ['/running-event-management-consultant-ahmedabad/', 'Events & Race Management'],
  ['/about-coach-gopi/', 'About Coach Gopi'], ['/contact/', 'Contact'],
];
const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');
const attr = (s) => String(s).replace(/"/g, '&quot;');

const person = {
  '@type': 'Person', '@id': `${SITE}/#gopi`, name: 'Coach Gopi', alternateName: 'Gopi D', url: `${SITE}/`,
  jobTitle: 'UESCA Certified Running Coach and Certified Nutrition & Diet Coach',
  address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
  sameAs: [IG, LI],
};
const service = (name, url, description) => ({ '@type': 'Service', name, url: `${SITE}${url}`, description, provider: { '@id': `${SITE}/#gopi` }, areaServed: { '@type': 'City', name: 'Ahmedabad' } });

function layout({ url, current, title, desc, h1Block, body, ld = [], extraHead = '' }) {
  const nav = NAV.map(([h, t]) => `<a href="${h}"${h === current ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('\n      ');
  const graph = { '@context': 'https://schema.org', '@graph': ld };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${attr(esc(desc))}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Coach Gopi">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:title" content="${attr(esc(title))}">
<meta property="og:description" content="${attr(esc(desc))}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Coach Gopi, UESCA certified running coach in Ahmedabad">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
${extraHead}</head>
<body>
<div class="wrap">
  <header class="top">
    <a class="brand" href="/">Coach <span>Gopi</span></a>
    <nav aria-label="Main">
      ${nav}
    </nav>
  </header>
  <main id="top">
${h1Block}
${body}
  </main>
  <footer>
    <span>Coach Gopi | Running Coach • Corporate Wellness Coach • Nutrition &amp; Diet Coach • Running Event Consultant | Ahmedabad, Gujarat, India</span>
    <span class="fnav">${NAV.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('')}</span>
    <span><a href="${IG}" target="_blank" rel="noopener">Instagram</a> · <a href="${LI}" target="_blank" rel="noopener">LinkedIn</a></span>
    <span style="font-size:13px">Website designed by <a href="https://iviewlabs.com/" target="_blank" rel="noopener">iviewlabs</a></span>
  </footer>
</div>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

const sec = (id, eyebrow, title, intro, inner, cls = '') => `
    <section id="${id}"${cls ? ` class="${cls}"` : ''}>
      <div class="sec-head">
        ${eyebrow && eyebrow.toLowerCase() !== title.toLowerCase() ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
        <h2>${esc(title)}</h2>
        ${intro ? `<p>${esc(intro)}</p>` : ''}
      </div>
${inner}
    </section>`;
const pageHero = (eyebrow, h1, sub, lede) => `    <div class="page-hero">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1>${esc(h1)}${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</h1>
      <p class="lede">${esc(lede)}</p>
    </div>`;
const cta = (href, label, track, ghost) => `<a class="btn${ghost ? ' ghost' : ''}" href="${href}"${track ? ` data-track="${track}"` : ''}>${esc(label)}</a>`;
const list = (items) => `<ul class="checks">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const table = (head, rows, cls = '') => `<div class="log-wrap ${cls}"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i > 0 && /^₹/.test(c) ? ' class="n"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const card = (tag, title, text, goal, go, main) => `<article class="svc${main ? ' main' : ''}"><span class="tag">${esc(tag)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${goal ? `<p class="goal">${esc(goal)}</p>` : ''}${go ? `<div class="go">${go}</div>` : ''}</article>`;
const faq = (items) => `<div class="faq">${items.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const finalBand = (h, p, buttons) => `
    <section><div class="final"><h2>${esc(h)}</h2><p>${esc(p)}</p><div class="cta-row" style="justify-content:center;margin-top:6px">${buttons}</div></div></section>`;

const field = (id, name, label, { type = 'text', req = false, ph = '', ac = '' } = {}) => `<div><label for="${id}">${esc(label)}${req ? '' : ''}</label><input id="${id}" name="${name}" type="${type}"${req ? ' required' : ''}${ph ? ` placeholder="${attr(ph)}"` : ''}${ac ? ` autocomplete="${ac}"` : ''}></div>`;
const area = (id, name, label, ph = '') => `<label for="${id}">${esc(label)}</label><textarea id="${id}" name="${name}" rows="4"${ph ? ` placeholder="${attr(ph)}"` : ''}></textarea>`;
const select = (id, name, label, opts) => `<div><label for="${id}">${esc(label)}</label><select id="${id}" name="${name}">${opts.map((o) => { const [t, k] = Array.isArray(o) ? o : [o, '']; return `<option${k ? ` data-key="${k}"` : ''}>${esc(t)}</option>`; }).join('')}</select></div>`;
const form = (kind, event, inner, button) => `<form class="enq" data-enquiry="${kind}" data-event="${event}" novalidate>
        <input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        ${inner}
        <button class="btn" type="submit">${esc(button)}</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>`;

// Instagram posts shared in Gopi's client profile (Drive). Embedded with Instagram's own embed code; links without tracking parameters.
const IG_POSTS = [
  'https://www.instagram.com/p/DfXcXtEzzzF/',
  'https://www.instagram.com/p/Dd8wTlEBIx7/',
  'https://www.instagram.com/p/Ddi5IILFfC5/',
];
const igEmbed = (urls) => `<div class="ig-grid">${urls.map((u) => `<blockquote class="instagram-media" data-instgrm-permalink="${u}" data-instgrm-version="14"><a href="${u}" target="_blank" rel="noopener">View this post on Instagram</a></blockquote>`).join('')}</div>
      <p class="fee-note">Posts open from <a href="${IG}" target="_blank" rel="noopener">@runningcoach.gopi</a> on Instagram.</p>
      <script async src="https://www.instagram.com/embed.js"></script>`;

const pages = [];

/* ------------------------------------------------------------------ HOME */
const homeDesc = 'Explore running coaching, nutrition guidance, corporate wellness and race event consulting with Coach Gopi in Ahmedabad. From beginner running plans to event coordination.';
pages.push({
  file: 'index.html', url: '/', current: '/',
  title: 'Running Coach, Corporate Wellness & Race Event Consultant Ahmedabad | Coach Gopi', desc: homeDesc,
  ld: [person, { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Coach Gopi', publisher: { '@id': `${SITE}/#gopi` } },
    service('Running coaching', '/running-coach-ahmedabad/', 'Online and supervised running coaching for 5K to ultra distances.'),
    service('Nutrition and diet coaching', '/nutrition-diet-coach-ahmedabad/', 'Personalised nutrition guidance and weight-management support.'),
    service('Corporate wellness programmes', '/corporate-wellness-ahmedabad/', 'Step challenges, walking and running campaigns and department fitness competitions.'),
    service('Running event management and race direction', '/running-event-management-consultant-ahmedabad/', 'Event coordination, technical guidance, timing-team coordination and race-day support.')],
  h1Block: `    <div class="hero">
      <div>
        <div class="byline" style="display:flex;align-items:center;gap:12px;font-weight:600;font-size:15px"><img class="avatar" src="/assets/gopi-portrait.jpg" alt="" width="52" height="52"><span>Gopi · UESCA certified · Ahmedabad &amp; online</span></div>
        <p class="eyebrow">Running · Wellness · Nutrition · Events</p>
        <h1>Running. Wellness. Nutrition. Events.<span class="sub">Helping people and communities move forward.</span></h1>
        <p class="lede">Helping individuals run better, organisations become healthier, communities grow stronger, and running events deliver better experiences.</p>
        <ul class="facts" aria-label="Experience">
          <li><b>UESCA</b><span>Certified running coach</span></li>
          <li><b>2016</b><span>Training runners since</span></li>
          <li><b>200+</b><span>Members in the RRG community I mentor with</span></li>
        </ul>
        <div class="cta-row">
          ${cta('#services', 'Explore My Services')}
          ${cta('/running-coach-ahmedabad/#free-plan', 'Get the Free 12-Week Beginner-to-10K Plan', 'free_plan_download', true)}
        </div>
      </div>
      <img class="portrait" src="/assets/gopi-portrait.jpg" alt="Coach Gopi running on a tree-lined road in Ahmedabad" width="600" height="800" fetchpriority="high">
    </div>`,
  body: [
    `<section><div class="prose"><p>Whether you want to start running, prepare for your next race, improve your nutrition, create a more active workplace, or organise a running event, I bring together practical coaching, corporate experience, community leadership, and event coordination knowledge.</p><p>I am Gopi, a UESCA Certified Running Coach and Certified Nutrition &amp; Diet Coach. I have been training runners since 2016 and bring more than 20 years of corporate IT sales experience. Today, I focus full-time on running coaching, nutrition, wellness initiatives, and running-event support.</p></div></section>`,
    sec('services', 'Services', 'Four ways I can help', '', `<div class="grid g4">
        ${card('Running', 'Running Coaching', 'From your first run to your next personal best, explore structured training for 5K, 10K, Half Marathon, Full Marathon and ultra-distance goals. Online coaching is available, along with supervised group training at Riverfront, Ahmedabad.', '', '<a href="/running-coach-ahmedabad/">Explore Running Plans</a>', true)}
        ${card('Nutrition', 'Nutrition & Diet Coaching', 'Build practical, sustainable eating habits with personalised nutrition guidance and weight-management support. Nutrition coaching can complement running training or be discussed as a standalone service.', '', '<a href="/nutrition-diet-coach-ahmedabad/">Explore Nutrition Coaching</a>')}
        ${card('Corporate', 'Corporate Wellness', 'Bring employees together through step-count campaigns, walking and running challenges, fitness activities, and department-versus-department competitions. Programmes can be tailored to your workforce.', '', '<a href="/corporate-wellness-ahmedabad/">Build a Workplace Wellness Programme</a>')}
        ${card('Events', 'Events & Race Management', 'Planning a road race, timed trial, promo run or community fitness event? I can support event coordination, technical guidance, timing-team coordination, event promotion and race-day execution as a technical consultant or race director, depending on the event scope.', '', '<a href="/running-event-management-consultant-ahmedabad/">Discuss Your Event</a>')}
      </div>`),
    sec('why', 'Why Coach Gopi', 'Experience you can check', '', `<div class="two"><div>${list([
      'UESCA Certified Running Coach and Certified Nutrition & Diet Coach.',
      'Training runners since 2016.',
      '20 Half Marathon pacing assignments at 2:30 pace; 6 10K pacing assignments at 70-minute pace; one sub-5-hour Full Marathon pacing assignment.',
      'Mentor with Riverfront Runners Group (RRG), an Ahmedabad fitness community of 200+ members.',
      "Former President of ADR; started a chapter and grew it into the organisation's largest group.",
      'More than 20 years of experience in IT sales and corporate environments.',
      'Experience supporting running events, community promo runs and timed running events.'])}</div>
      <div class="prose"><h3>Community at the heart of what I do</h3><p>Through Riverfront Runners Group (RRG), I help support a welcoming fitness community in Ahmedabad. RRG brings people together through running, cycling, boot camp, strength and agility activities, and swimming-related guidance. Its community spirit is built around running together, training together, growing together, and staying together.</p><p><a href="/about-coach-gopi/">More about Coach Gopi</a></p></div></div>`),
    sec('instagram', 'On Instagram', 'Runners and results', 'Recent posts from my Instagram.', igEmbed(IG_POSTS)),
    finalBand('Find the right starting point', 'Choose a free beginner running resource, explore personalised coaching, enquire about a corporate wellness programme, or discuss technical and coordination support for your next running event.', `${cta('/contact/', 'Tell Me What You Are Planning')}<a class="btn ghost" href="${IG}" target="_blank" rel="noopener">Instagram @runningcoach.gopi</a>`),
  ].join('\n'),
});

/* ----------------------------------------------------------------- ABOUT */
pages.push({
  file: 'about-coach-gopi/index.html', url: '/about-coach-gopi/', current: '/about-coach-gopi/',
  title: 'About Coach Gopi | Running, Wellness, Nutrition & Race Events Ahmedabad',
  desc: 'Meet Gopi: UESCA Certified Running Coach, Nutrition & Diet Coach, RRG mentor, former ADR President and running event professional with corporate leadership experience.',
  ld: [person, { '@type': 'ProfilePage', url: `${SITE}/about-coach-gopi/`, mainEntity: { '@id': `${SITE}/#gopi` } }],
  h1Block: pageHero('About', 'About Coach Gopi', 'Building healthier people, stronger communities and better events.', 'I am Gopi D, a UESCA Certified Running Coach and Certified Nutrition & Diet Coach, based in Ahmedabad.'),
  body: [
    `<section><div class="two"><img class="portrait" src="/assets/gopi-portrait.jpg" alt="Coach Gopi running on a tree-lined road in Ahmedabad" width="600" height="800" loading="lazy"><div class="prose"><p>I have been training runners since 2016. After more than 20 years in IT sales, I transitioned out of my full-time corporate career to focus on running coaching, nutrition, wellness, and running-event support.</p><p>My work brings together four areas: helping individuals become stronger runners, supporting healthier everyday habits through nutrition, helping organisations build active workplace cultures, and supporting the planning and delivery of running events.</p>
    <h3>Running and coaching journey</h3><p>I coach runners preparing for 10K races, Half Marathons, Full Marathons, high-altitude events, and ultra-distance challenges. My approach combines personalised training plans, training-data review, running-form feedback, strength and mobility guidance, race preparation, and ongoing support.</p><p>My pacing experience includes 20 Half Marathon assignments at a 2:30 pace, six 10K assignments at a 70-minute pace, and a sub-5-hour Full Marathon pacing assignment at Vadodara International Marathon in January 2020.</p></div></div></section>`,
    sec('rrg', 'Community', 'Riverfront Runners Group: community, mentorship and movement', '', `<div class="prose"><p>A significant part of my journey is my role as a mentor with Riverfront Runners Group (RRG), an Ahmedabad-based community of more than 200 members. RRG is built around the belief that fitness is more enjoyable and sustainable when people support one another.</p><p>RRG activities extend beyond running and include morning jogs, long-distance runs, race training, group runs, cycling, road and trail rides, boot camp activities focused on strength, agility, conditioning and injury prevention, and swimming training guidance.</p><p><strong>Run Together. Train Together. Grow Together. Stay Together.</strong></p></div>`),
    sec('adr', 'Leadership', 'Leadership with ADR', '', `<div class="prose"><p>I also served as President of ADR (July 2022 to June 2023). During my association, I started a chapter, ADR CK, during 2016 and grew it into the organisation's largest group. I trained and mentored many runners through this community experience, developing a practical understanding of how to encourage participation, build belonging, and help people progress together.</p></div>`),
    sec('corporate', 'Corporate', 'Corporate experience and workplace wellness', '', `<div class="prose"><p>Before moving into full-time coaching, I spent more than 20 years in IT sales, including leadership responsibilities. That experience helps me understand business environments, team dynamics, employee engagement, and the realities of busy working lives.</p><p>I now apply that understanding to corporate wellness programmes, including group step challenges, walking and running campaigns, fitness activities, and department-level competitions. <a href="/corporate-wellness-ahmedabad/">See corporate wellness programmes</a>.</p></div>`),
    sec('events', 'Events', 'Running event involvement', '', `<div class="prose"><p>My event-related experience includes involvement with ADR Night Ultra 4.0, Shantigram ADR 10 km Time Trial, RRG promo runs associated with AU Jaipur Marathon and Udaipur Marathon, and the Mehsana Marathon promo run. Depending on the event's requirements, I can support organisers as a technical consultant or race director, with services spanning event coordination, technical guidance, timing-team coordination, event promotion, and race-day operations. <a href="/running-event-management-consultant-ahmedabad/">See event services</a>.</p></div>`),
    sec('credentials', 'Credentials', 'Credentials and philosophy', '', `<div class="two">${list(['UESCA Certified Running Coach.', 'Certified Nutrition & Diet Coach.', 'Running coach since 2016.', 'Former President, ADR.', 'Mentor, Riverfront Runners Group, Ahmedabad.', 'Race-pacing experience across 10K, Half Marathon and Full Marathon.', 'Experience in running-event coordination and community race promotion.'])}<div class="prose"><p>Fitness is not reserved for athletes. A beginner should feel as welcome as an experienced marathon runner. A community event should make participation accessible and memorable. My aim is to make fitness, running, nutrition, and event experiences approachable, well-organised, and sustainable.</p><p><strong>Build healthier people. Stronger communities. Better events.</strong></p></div></div>`),
    finalBand('Work with Coach Gopi', 'Running coaching, nutrition, workplace wellness or a running event: tell me what you are planning.', `${cta('/running-coach-ahmedabad/', 'Explore Running Coaching')}${cta('/corporate-wellness-ahmedabad/', 'Corporate Wellness', '', true)}${cta('/running-event-management-consultant-ahmedabad/', 'Events & Race Management', '', true)}${cta('/contact/', 'Contact Coach Gopi', '', true)}`),
  ].join('\n'),
});

/* --------------------------------------------------------------- RUNNING */
const freePlan = [
  ['Week 1', 'Run 1 min, walk 2 min, repeat 8 times', 'Same as weekday'], ['Week 2', 'Run 2 min, walk 2 min, repeat 6 times', 'Same as weekday'],
  ['Week 3', 'Run 3 min, walk 2 min, repeat 5 times', 'Repeat 6 times'], ['Week 4', 'Run 5 min, walk 2 min, repeat 4 times', 'Repeat 5 times'],
  ['Week 5', 'Run 8 min, walk 2 min, repeat 3 times', 'Repeat 4 times'], ['Week 6', 'Run 10 min, walk 1 min, repeat 3 times', 'Repeat 4 times'],
  ['Week 7', 'Run 20 minutes without stopping', 'Run 25 minutes'], ['Week 8', 'Run 25 minutes', 'Run 30 minutes'],
  ['Week 9', 'Run 30 minutes', 'About 5 km, at an easy pace'], ['Week 10', 'Run 30 minutes', 'About 6 km'],
  ['Week 11', 'Run 35 minutes', 'About 8 km'], ['Week 12', 'Easy 30 minute run', 'Your first 10 km, walk breaks allowed'],
];
const runFaq = [
  ['Can a complete beginner use the free plan?', 'Yes. The free 12-week beginner-to-10K plan is a general starting resource for people building towards their first 10K. Follow it progressively and adapt or stop if you experience unusual pain or symptoms.'],
  ['Do you coach runners outside Ahmedabad?', 'Yes. Online coaching is available for runners beyond Ahmedabad. Training plans and feedback are delivered remotely.'],
  ['Do you coach Half Marathon and Full Marathon runners?', "Yes. Coaching is available for 10K, Half Marathon, Full Marathon, and ultra-distance goals, subject to an assessment of the runner's experience, current fitness, and race timeline."],
  ['Is nutrition included?', "Nutrition and diet coaching is available as an add-on. The scope and plan are discussed according to the runner's goals."],
];
pages.push({
  file: 'running-coach-ahmedabad/index.html', url: '/running-coach-ahmedabad/', current: '/running-coach-ahmedabad/',
  title: 'Running Coach Ahmedabad | Beginner to Marathon & Ultra Training | Gopi',
  desc: 'Get running plans for beginners, intermediate and experienced runners. Coach Gopi offers online coaching and supervised Riverfront sessions for 5K to ultra goals.',
  ld: [person, service('Running coaching', '/running-coach-ahmedabad/', 'Online and supervised running coaching for 5K to ultra distances.'),
    { '@type': 'FAQPage', mainEntity: runFaq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
  h1Block: pageHero('Running coaching', 'Running Coaching for Every Level', 'Beginner to advanced.', 'From your first running steps to your next personal best, your training should match your experience, current fitness, and goals. I offer structured running guidance for beginners, intermediate runners, and experienced athletes, with options for online coaching and supervised training in Ahmedabad.'),
  body: [
    `<section><div class="grid g3">
      ${card('Beginner', 'Build a strong foundation', 'New to running or returning after a break? Start gradually, develop consistency, and build the confidence to complete your first 5K or 10K. Includes progressive walk-run development, recovery guidance and practical advice to build a consistent routine.', 'Free 12-week beginner-to-10K training plan.', '<a href="#free-plan" data-track="free_plan_download">Get the Free Beginner-to-10K Plan</a>')}
      ${card('Intermediate', 'Improve pace and endurance', 'Already running consistently? Work towards a faster 10K, your first Half Marathon, or a new personal best. Training may include easy runs, progressive workouts, tempo or threshold sessions, speed work, long runs, and recovery days, selected according to your current training background.', '', '<a href="/contact/?service=running">Enquire About Personalised Coaching</a>', true)}
      ${card('Experienced & Advanced', 'Prepare for bigger goals', 'For runners targeting Half Marathon performance, Full Marathon completion or improvement, high-altitude races, and ultra-distance events. Plans are tailored to training history, current fitness, race profile, terrain, and available preparation time. Coaching experience includes preparation for Ladakh Full Marathon, a 60 km Goa Ultra, and a current 100 km Border Ultra build-up.', '', '<a href="/contact/?service=running">Discuss Your Race Goal</a>')}
    </div></section>`,
    sec('distances', 'Distances', 'Distances and training focus', '', table(['Distance', 'Training focus'], [
      ['5K and 10K', 'Running consistency, aerobic foundation, speed development, and pacing'],
      ['Half Marathon', 'Aerobic endurance, threshold development, long runs, and race strategy'],
      ['Full Marathon', 'Progressive endurance, long-run development, fuelling practice, and race-specific preparation'],
      ['Ultra and high-altitude', 'Time on feet, terrain-specific preparation, pacing, fuelling practice, and recovery']])),
    sec('included', 'Online coaching', 'What is included in online coaching?', '', list([
      'Personalised weekly training plans based on your goals and current fitness.', 'Run-data review and structured feedback.', 'Video-based gait and posture review.',
      'Running-form, foot-landing, and breathing guidance.', 'Strength, agility, core, and mobility workout guidance.', 'Accountability and ongoing coaching support.'])),
    sec('fees', 'Fees', 'Coaching fees', 'Minimum commitment: 3 months. Monthly fees are lower when you commit for longer.', `
      <h3 class="tbl-title">Online coaching</h3>${table(['Commitment', 'Monthly fee'], [['Quarterly sign up, 3 months', '₹2,750/month'], ['Half-yearly sign up, 6 months', '₹2,625/month'], ['Annual sign up, 12 months', '₹2,500/month']], 'prices')}
      <h3 class="tbl-title">Physical coaching: Riverfront, Ahmedabad</h3><p class="fee-note" style="margin:0 0 14px">Supervised group coaching includes eight sessions per month, typically Tuesdays and Thursdays from 6:00 AM to 7:15 AM at Riverfront, Ahmedabad. Sessions include live coaching, technique correction, gait and posture feedback, and performance adjustments.</p>${table(['Commitment', 'Monthly fee'], [['Quarterly sign up, 3 months', '₹4,800/month'], ['Half-yearly sign up, 6 months', '₹4,650/month'], ['Annual sign up, 12 months', '₹4,500/month']], 'prices')}
      <h3 class="tbl-title">Nutrition coaching: add-on to running coaching</h3>${table(['Commitment', 'Monthly fee'], [['Quarterly sign up, 3 months', '₹1,750/month'], ['Half-yearly sign up, 6 months', '₹1,600/month'], ['Annual sign up, 12 months', '₹1,500/month']], 'prices')}
      <p class="fee-note">These are add-on rates when combined with running coaching. Nutrition and diet coaching can be added for personalised diet guidance, weight-management support, and practical fuelling and recovery habits. See the <a href="/nutrition-diet-coach-ahmedabad/">Nutrition &amp; Diet page</a> for more details.</p>`),
    sec('free-plan', 'Free beginner plan', 'Your first 10 km in 12 weeks', 'Three sessions a week: two on weekdays and one at the weekend. Run at an easy pace where you can still speak in short sentences. No payment and no coaching registration needed.', `${table(['Week', 'Two weekday sessions', 'Weekend session'], freePlan)}
      <p class="callout" style="margin-top:18px"><strong>Please note:</strong> this is a general self-guided resource, not an individually assessed training prescription. Anyone with a medical condition, injury, or concerns about starting exercise should seek appropriate professional advice. Adapt or stop if you experience unusual pain or symptoms.</p>
      <div class="cta-row" style="margin-top:18px">${cta('/contact/?service=running', 'Enquire About Online Coaching', 'running_coaching_enquiry')}${cta('/contact/?service=running', 'Enquire About Riverfront Training', 'running_coaching_enquiry', true)}</div>`),
    sec('faq', 'Questions', 'Frequently asked questions', '', faq(runFaq)),
    finalBand('Ready for your next run?', 'Tell me where you are with running and what you want to finish. I will help you pick the right starting point.', `${cta('/contact/?service=running', 'Enquire About Online Coaching', 'running_coaching_enquiry')}${cta('/nutrition-diet-coach-ahmedabad/', 'Nutrition & Diet', '', true)}`),
  ].join('\n'),
});

/* ------------------------------------------------------------- NUTRITION */
pages.push({
  file: 'nutrition-diet-coach-ahmedabad/index.html', url: '/nutrition-diet-coach-ahmedabad/', current: '/nutrition-diet-coach-ahmedabad/',
  title: 'Nutrition & Diet Coach Ahmedabad | Personalised Diet & Weight Support',
  desc: 'Get practical nutrition guidance, personalised diet planning and weight-management support from Coach Gopi, a Certified Nutrition & Diet Coach in Ahmedabad and online.',
  ld: [person, service('Nutrition and diet coaching', '/nutrition-diet-coach-ahmedabad/', 'Personalised nutrition guidance and weight-management support.')],
  h1Block: pageHero('Nutrition & diet', 'Practical Nutrition Coaching for a Healthier, Stronger You', 'Eat better. Feel better. Build healthier habits.', 'Good health is shaped by more than exercise alone. Everyday food choices, routines, hydration, recovery, and consistency all matter. As a Certified Nutrition & Diet Coach, I offer practical nutrition guidance and personalised diet planning designed around your goals, food preferences, activity, and lifestyle.'),
  body: [
    `<section><div class="prose"><p>The aim is not a short-term restrictive diet. It is to help you develop realistic habits that you can maintain.</p></div></section>`,
    sec('who', 'Who can benefit', 'Who can benefit?', '', list(['People looking for structured weight-management support.', 'Busy working professionals seeking more consistent eating habits.', 'People beginning a fitness or running journey.', 'Recreational runners and endurance athletes seeking practical nutrition guidance.', 'Individuals who want to improve everyday food choices and routines.'])),
    sec('services', 'Services', 'Nutrition coaching services', '', `<div class="grid g2">
      ${card('Weight', 'Weight-management support', 'Work towards your weight goals with practical food choices, portion awareness, habit-building, and progress reviews. Plans should be realistic for your daily routine and preferences.')}
      ${card('Everyday', 'Everyday nutrition', 'Build balanced, sustainable eating habits that fit work, family, activity, and personal food preferences. Focus on consistency rather than quick fixes.')}
      ${card('Runners', 'Nutrition guidance for runners', 'Understand practical pre-run and post-run food choices, hydration, fuelling during endurance preparation, and recovery-focused nutrition habits.', '', '<a href="/running-coach-ahmedabad/">See running coaching</a>')}
      ${card('Plans', 'Personalised diet planning', 'Diet guidance is shaped around your stated goals, routine, preferences, and activity. Recommendations are reviewed and adjusted as appropriate.')}
    </div>`),
    sec('process', 'Process', 'How the process works', '', `<ol class="steps5"><li><b>Understand</b>Your goals, routine, food preferences, and current habits.</li><li><b>Discuss</b>A practical nutrition approach that fits your lifestyle.</li><li><b>Create</b>A personalised diet-guidance plan within the scope of the service.</li><li><b>Review</b>Progress, with practical adjustments.</li><li><b>Sustain</b>Habits that are realistic to maintain over time.</li></ol>`),
    sec('fees', 'Fees', 'Standalone nutrition / diet plan fees', '', table(['Commitment', 'Monthly fee'], [['Quarterly sign up, 3 months', '₹2,750/month'], ['Half-yearly sign up, 6 months', '₹2,600/month'], ['Annual sign up, 12 months', '₹2,500/month']], 'prices') + `<p class="fee-note">Nutrition is also available as a lower-priced add-on to running coaching: see <a href="/running-coach-ahmedabad/#fees">running coaching fees</a>.</p>`),
    sec('approach', 'Approach', 'A practical, sustainable approach', '', `<div class="prose"><p>No single diet suits everyone. Food choices should take account of individual needs, preferences, culture, routine, activity, and health context.</p></div><p class="callout" style="margin-top:16px;max-width:44em"><strong>Medical conditions:</strong> where a medical condition or therapeutic diet is involved, work with an appropriately qualified healthcare professional or registered dietitian.</p>`),
    finalBand('Start with a conversation', 'Tell me your goals and your routine, and I will suggest a practical starting point.', `${cta('/contact/?service=nutrition', 'Enquire About Nutrition Coaching', 'nutrition_enquiry')}${cta('/running-coach-ahmedabad/', 'Running Coaching', '', true)}`),
  ].join('\n'),
});

/* ------------------------------------------------------------- CORPORATE */
pages.push({
  file: 'corporate-wellness-ahmedabad/index.html', url: '/corporate-wellness-ahmedabad/', current: '/corporate-wellness-ahmedabad/',
  title: 'Corporate Wellness Programmes Ahmedabad | Employee Fitness Challenges',
  desc: 'Engage employees with corporate step challenges, walking and running campaigns, department fitness competitions and workplace wellness programmes by Coach Gopi.',
  ld: [person, service('Corporate wellness programmes', '/corporate-wellness-ahmedabad/', 'Step challenges, walking and running campaigns and department fitness competitions.')],
  h1Block: pageHero('Corporate wellness', 'Corporate Wellness Programmes That Get Employees Moving', 'Healthier employees. More connected teams. A more active workplace.', 'Employee wellness works best when it is practical, inclusive, engaging, and consistent. I work with SMEs and corporate teams to design group fitness and wellness challenges that encourage employees to move more, build healthier habits, and connect with colleagues.'),
  body: [
    `<section><div class="prose"><p>Programmes can be tailored to company size, departments, work patterns, fitness levels, and engagement objectives. Activities can be delivered as monthly campaigns, short-term challenges, or a structured annual wellness calendar.</p></div></section>`,
    sec('who', 'Who we work with', 'Who we work with', '', list(['Small and medium-sized businesses (SMEs).', 'Corporate HR and People & Culture teams.', 'Business owners and founders.', 'Organisations looking to introduce or refresh employee wellness activities.', 'Teams seeking interdepartmental engagement through movement and fitness.'])),
    sec('programmes', 'Programmes', 'Corporate wellness programmes', '', `<div class="grid g3">
      ${card('Steps', 'Corporate step challenge', 'Encourage employees to build daily movement habits through individual and team step goals, weekly leaderboards, team recognition, and monthly results.')}
      ${card('Walk and run', 'Walking and running challenges', 'Offer inclusive walking and running activities for employees with different starting fitness levels. Options may include beginner walk-run participation, distance goals, group sessions, and preparation challenges.')}
      ${card('Teams', 'Department-versus-department challenges', 'Create friendly competition between departments such as Sales, HR, Finance, Operations, and Technology. Track agreed team activities and celebrate participation, consistency, and collective progress.')}
      ${card('Monthly', 'Monthly wellness challenges', 'Keep engagement fresh with themed campaigns such as a step challenge, active commute week, walking and running month, mobility challenge, or team endurance challenge.')}
      ${card('Sessions', 'Group fitness and running sessions', "Arrange guided group activities such as walking, running, beginner fitness, running technique, strength, and mobility sessions. Session design depends on the organisation's location, facilities, schedule, and participant needs.")}
    </div>`),
    sec('how', 'How a programme works', 'How a programme works', '', `<ol class="steps5"><li><b>Discover</b>Discuss workforce size, objectives, work patterns, current activities, and practical constraints.</li><li><b>Design</b>Agree the challenge format, duration, participation rules, measurement approach, and recognition plan.</li><li><b>Launch</b>Provide clear communications and encourage employees and departments to participate.</li><li><b>Engage</b>Share progress updates, leaderboards, reminders, and team milestones.</li><li><b>Review</b>Report agreed participation and activity measures, recognise achievements, and recommend next steps.</li></ol>`),
    sec('why', 'Why Coach Gopi', 'Why Coach Gopi for corporate wellness?', '', list(['More than 20 years of experience in IT sales and corporate environments.', 'UESCA Certified Running Coach and Certified Nutrition & Diet Coach.', 'Experience coaching and mentoring runners since 2016.', 'Mentor with Riverfront Runners Group, an Ahmedabad fitness community of 200+ members.', 'Former President of ADR, with experience starting and growing a chapter into the organisation\'s largest group.', 'Experience designing activities that welcome beginners as well as experienced fitness participants.'])),
    sec('enquire', 'Enquire', 'Start a workplace wellness conversation', 'Whether you are an SME planning your first employee step challenge or a larger organisation looking for a monthly wellness calendar, I can help shape a programme around your workforce.', form('corporate wellness', 'corporate_wellness_enquiry', `<div class="f2">${field('cw-company', 'company', 'Company name')}${field('cw-person', 'contact_person', 'Contact person', { req: true, ac: 'name' })}${field('cw-email', 'email', 'Work email', { type: 'email', ac: 'email' })}${field('cw-phone', 'contact', 'Phone or WhatsApp', { req: true, ac: 'tel' })}${field('cw-city', 'city', 'City')}${field('cw-size', 'employees', 'Approximate employee count')}${select('cw-prog', 'programme', 'Preferred programme', ['Not sure yet', 'Corporate step challenge', 'Walking and running challenge', 'Department-versus-department challenge', 'Monthly wellness challenges', 'Group fitness and running sessions'])}${field('cw-start', 'start_month', 'Desired start month')}</div>${area('cw-msg', 'message', 'Message', 'Tell me about your workforce and what you would like to achieve')}`, 'Request a Corporate Wellness Consultation')),
  ].join('\n'),
});

/* ---------------------------------------------------------------- EVENTS */
pages.push({
  file: 'running-event-management-consultant-ahmedabad/index.html', url: '/running-event-management-consultant-ahmedabad/', current: '/running-event-management-consultant-ahmedabad/',
  title: 'Running Event Consultant & Race Director Ahmedabad | Coach Gopi',
  desc: 'Plan better running events with Coach Gopi. Event coordination, technical guidance, timing-team coordination, race-day operations and event promotion in Ahmedabad and Gujarat.',
  ld: [person, service('Running event management and race direction', '/running-event-management-consultant-ahmedabad/', 'Event coordination, technical guidance, timing-team coordination and race-day support.')],
  h1Block: pageHero('Events & race management', 'Running Event Management, Technical Consulting & Race Direction', 'Well-planned events create memorable experiences.', 'For runners, organisers, sponsors, and communities. With experience in running communities, race pacing, event coordination, and promotional runs, I can support running-event organisers as a Technical Consultant or Race Director, depending on the event\'s requirements and agreed scope.'),
  body: [
    `<section><div class="prose"><p>Whether you are planning a community 10K, a timed trial, a marathon promotional run, a night ultra, or a larger road-running event, I can help bring structure to planning, coordination, technical preparation, event communication, and race-day execution.</p></div></section>`,
    sec('services', 'Event services', 'Event services', '', `<div class="grid g2">
      ${card('1', 'Event coordination', 'Support the planning and coordination of event activities, timelines, people, and operational requirements. Help keep organisers, volunteers, vendors, venue teams, and other stakeholders aligned.', '', list(['Pre-event planning and coordination meetings.', 'Event timelines, task tracking, and operational checklists.', 'Coordination with volunteers, vendors, venue and support teams.', 'Participant-flow and race-day activity coordination.']))}
      ${card('2', 'Technical guidance and race planning', "Practical technical guidance for the running-event format and participant experience, aligned with the organiser's objectives, course conditions, event scale, and applicable requirements.", '', list(['Input on event format, race categories, and participant experience.', 'Course and route-planning considerations with the organiser and relevant authorities.', 'Start and finish-area planning, race flow, and key operational touchpoints.', 'Race-day readiness reviews and issue-escalation planning.']))}
      ${card('3', 'Timing-team coordination', 'Coordinate with the appointed timing provider or timing team to support accurate, well-organised timing operations and a smooth participant experience.', '', list(['Pre-event coordination with the timing provider.', 'Review of race categories, bib and timing requirements, and participant data handover.', 'Coordination of timing checkpoints and start/finish processes, as applicable.', 'Race-day communication and issue escalation between organisers and the timing team.']) + '<p class="fee-note">Timing equipment, chip systems, official result validation, and timing-provider deliverables remain the responsibility of the appointed specialist provider unless separately contracted.</p>')}
      ${card('4', 'Event promotion and participant engagement', 'Help build awareness and participation through community networks, running-group outreach, promotional runs, and event communication support.', '', list(['Promotion through running communities and relevant networks.', 'Promo-run planning and coordination.', 'Participant communication and event information support.', 'Community engagement and awareness-building activities.']))}
      ${card('5', 'Race-day coordination and race director support', 'Depending on the agreed role, provide race-day leadership or operational support to help teams work to the event plan, respond to issues, and maintain clear communication.', '', list(['Race-day briefing and coordination with assigned teams.', 'Monitoring key operational milestones.', 'Coordination between organisers, volunteers, timing teams, and other service providers.', 'Issue escalation and operational decision support within the agreed authority.']))}
    </div>`),
    sec('experience', 'Experience', 'Event experience and involvement', 'My event-related experience includes involvement with:', list(['ADR Night Ultra 4.0.', 'Shantigram ADR 10 km Time Trial (TT).', 'Riverfront Runners Group (RRG) promo run associated with AU Jaipur Marathon.', 'RRG promo run associated with Udaipur Marathon.', 'Mehsana Marathon promo run.'])),
    sec('roles', 'Roles', 'How I can work with your organisation', '', `<div class="grid g2">
      ${card('Role', 'Technical Consultant', 'Defined technical input, planning reviews, coordination advice, and readiness recommendations.')}
      ${card('Role', 'Race Director', 'Event leadership and race-day oversight within an agreed scope, authority structure, and written responsibilities.')}
      ${card('Role', 'Event Coordination Support', 'Planning timelines, stakeholder coordination, volunteer and vendor coordination, and operational follow-through.')}
      ${card('Role', 'Promotion & Community Engagement', 'Promo-run coordination, running-community outreach, and participant engagement support.')}
    </div>`),
    sec('approach', 'Approach', 'A structured approach', '', `<ol class="steps5"><li><b>Understand the event</b>Format, distance, expected participation, venue, timeline, objectives, and organiser requirements.</li><li><b>Define responsibilities</b>Agree the role, decision authority, deliverables, fees, reporting lines, and scope in writing.</li><li><b>Plan</b>Prepare a coordination plan, event timeline, operational checklist, communication flow, and risk and escalation process.</li><li><b>Coordinate</b>Align organisers, vendors, volunteers, timing providers, venue contacts, and promotion teams.</li><li><b>Deliver and review</b>Support race-day execution within the agreed role and conduct a post-event review with lessons learned.</li></ol>`),
    sec('who', 'Who can engage me', 'Who can engage me?', '', list(['Marathon and road-race organisers.', 'Running clubs and fitness communities.', 'Schools, colleges, and universities planning running events.', 'Corporate teams organising fitness events or employee runs.', 'Brands and event agencies planning promotional runs or community fitness activations.'])),
    sec('enquire', 'Enquire', "Let's plan your next running event", "If you are organising a running event and need technical guidance, event coordination, timing-team coordination, community promotion, or race-day leadership, let's discuss the event format and the support you need.", form('event management', 'event_management_enquiry', `<div class="f2">${field('ev-org', 'organisation', 'Organisation / event name')}${field('ev-person', 'contact_person', 'Contact person', { req: true, ac: 'name' })}${field('ev-date', 'event_date', 'Event date or proposed period')}${field('ev-loc', 'location', 'Location')}${select('ev-type', 'event_type', 'Event type', ['Road race or marathon', 'Community 10K or time trial', 'Promotional run', 'Night or ultra event', 'Corporate or employee run', 'Other'])}${field('ev-count', 'participants', 'Expected participant count')}${select('ev-need', 'support_required', 'Support required', ['Event coordination', 'Technical guidance and race planning', 'Timing-team coordination', 'Event promotion', 'Race director support', 'Not sure yet'])}${select('ev-stage', 'planning_stage', 'Current planning stage', ['Early idea', 'Planning started', 'Date and venue fixed', 'Close to race day'])}</div>${field('ev-contact', 'contact', 'Phone, WhatsApp or email', { req: true })}${area('ev-msg', 'message', 'Message', 'Tell me about the event and what support you need')}`, 'Request an Event Consultation')),
  ].join('\n'),
});

/* --------------------------------------------------------------- CONTACT */
pages.push({
  file: 'contact/index.html', url: '/contact/', current: '/contact/',
  title: 'Contact Coach Gopi | Running Coach in Ahmedabad',
  desc: 'Contact Coach Gopi about running coaching, nutrition and diet coaching, corporate wellness or running event management in Ahmedabad and online.',
  ld: [person],
  h1Block: pageHero('Contact', 'Contact Coach Gopi', '', 'Tell me what you are planning. Your enquiry is emailed straight to me and I will reply myself.'),
  body: [
    `<section><div class="two"><div class="prose"><p>Choose the service you are asking about and share a little about your goal. For a workplace programme or a running event, the forms on the <a href="/corporate-wellness-ahmedabad/#enquire">corporate wellness</a> and <a href="/running-event-management-consultant-ahmedabad/#enquire">events</a> pages ask for a few more details.</p>
    <ul class="contact-links"><li><a class="btn" href="https://wa.me/${WA}" target="_blank" rel="noopener" data-track="whatsapp_click">Message on WhatsApp</a></li><li><a href="${IG}" target="_blank" rel="noopener">Instagram @runningcoach.gopi</a></li><li><a href="${LI}" target="_blank" rel="noopener">LinkedIn: gopinath1996</a></li></ul></div>
    ${form('general', 'enquiry', `${field('ct-name', 'name', 'Your name', { req: true, ac: 'name' })}${field('ct-contact', 'contact', 'Your email or phone number', { req: true, ph: 'So Gopi can reply to you' })}${select('ct-service', 'service', 'What is this about?', [['Running coaching', 'running'], ['Nutrition and diet coaching', 'nutrition'], ['Corporate wellness', 'corporate'], ['Events and race management', 'events'], ['Something else', 'other']])}${area('ct-msg', 'message', 'Your message', 'Your goal, a race date, a question')}`, 'Send enquiry to Gopi')}</div></section>`,
  ].join('\n'),
});

for (const p of pages) {
  const html = layout({ ...p, body: p.body });
  const out = resolve(root, p.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('wrote', p.file, (html.length / 1024).toFixed(1) + ' KB');
}
const urls = pages.map((p) => `  <url><loc>${SITE}${p.url}</loc></url>`).join('\n');
writeFileSync(resolve(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(resolve(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('wrote sitemap.xml and robots.txt');
