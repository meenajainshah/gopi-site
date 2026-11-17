// Run: npm run test:site (needs Playwright's Chromium and http-server)
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const PORT = 8123, BASE = `http://127.0.0.1:${PORT}`;
const PAGES = ['/', '/about-coach-gopi/', '/running-coach-ahmedabad/', '/nutrition-diet-coach-ahmedabad/', '/corporate-wellness-ahmedabad/', '/running-event-management-consultant-ahmedabad/', '/contact/'];
let failed = 0;
const check = (ok, label, extra) => { console.log((ok ? 'PASS ' : 'FAIL ') + label + (ok ? '' : '  -> ' + extra)); if (!ok) failed++; };

(async () => {
  const server = spawn('http-server', [root, '-p', String(PORT), '-s', '-c-1'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  const browser = await chromium.launch();
  const titles = new Set(), descs = new Set();
  const seen = new Set(), toCheck = new Set();

  for (const width of [1280, 375]) {
    for (const url of PAGES) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      await ctx.route(/fonts\.(googleapis|gstatic)\.com|instagram\.com/, (r) => r.abort());
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      p.on('requestfailed', (r) => { if (!/fonts\.|instagram\.com/.test(r.url())) errs.push('failed ' + r.url()); });
      p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(r.status() + ' ' + r.url()); });
      await p.goto(BASE + url);
      const m = await p.evaluate(() => ({
        h1: document.querySelectorAll('h1').length, title: document.title, desc: (document.querySelector('meta[name=description]') || {}).content || '',
        canon: (document.querySelector('link[rel=canonical]') || {}).href || '', og: !!document.querySelector('meta[property="og:image"]'),
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        cur: (document.querySelector('nav a[aria-current=page]') || {}).textContent || '',
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { JSON.parse(s.textContent); return true; } catch (e) { return false; } }),
        ig: [...document.querySelectorAll('blockquote.instagram-media')].map((b) => b.getAttribute('data-instgrm-permalink')),
        links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
        imgsNoAlt: [...document.querySelectorAll('img:not([alt])')].length,
        text: document.body.innerText,
      }));
      if (width === 1280) {
        check(m.h1 === 1, `${url} has exactly one h1`, m.h1);
        check(m.title.length > 10 && !titles.has(m.title), `${url} has a unique title`, m.title); titles.add(m.title);
        check(m.desc.length > 50 && !descs.has(m.desc), `${url} has a unique meta description`, m.desc); descs.add(m.desc);
        check(m.canon === 'https://www.coach-gopi.com' + url, `${url} canonical is the live domain`, m.canon);
        check(m.og && m.ld.length > 0 && m.ld.every(Boolean), `${url} has og tags and valid JSON-LD`);
        check(m.cur !== '', `${url} marks the current nav item`, m.cur);
        check(m.imgsNoAlt === 0, `${url} images all have alt`);
        check(!/radiscan|20% in employee|15% in employee/i.test(m.text), `${url} carries no unconfirmed Radiscan figures`);
        if (url === '/') check(m.ig.length === 3 && m.ig.every((u) => /^https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]{11}\/$/.test(u)), 'home embeds the three shared Instagram posts with clean links', JSON.stringify(m.ig));
        else check(m.ig.length === 0, `${url} has no Instagram embeds`, m.ig.length);
        m.links.forEach((l) => toCheck.add(l));
      } else {
        check(m.sw <= m.cw, `${url} has no horizontal scroll at 375px`, `${m.sw} vs ${m.cw}`);
        const nav = await p.evaluate(() => [...document.querySelectorAll('.top nav a')].map((a) => { const r = a.getBoundingClientRect(); return r.left >= 0 && r.right <= document.documentElement.clientWidth && r.height >= 36; }));
        check(nav.length === 7 && nav.every(Boolean), `${url} shows all 7 menu items on screen at 375px`, JSON.stringify(nav));
        if (url === '/' || url === '/running-coach-ahmedabad/') await p.screenshot({ path: path.join('/tmp', `shot-${url.replace(/\W/g, '') || 'home'}.png`), fullPage: true });
      }
      check(errs.length === 0, `${url} @${width} loads without errors`, errs.join(' | '));
      await ctx.close();
    }
  }

  // internal links all resolve (page + anchors)
  const ctx = await browser.newContext(); await ctx.route(/fonts\./, (r) => r.abort());
  for (const l of toCheck) {
    const [u, hash] = l.split('#'); const r = await ctx.request.get(BASE + u);
    let ok = r.status() === 200;
    if (ok && hash) ok = (await r.text()).includes(`id="${hash}"`);
    check(ok, `internal link ${l} resolves`, r.status());
  }

  // forms email the enquiry
  for (const [url, fills, kind] of [['/contact/?service=nutrition', { '#ct-name': 'Test User', '#ct-contact': 'test@example.com' }, 'general'],
    ['/corporate-wellness-ahmedabad/', { '#cw-person': 'Test HR', '#cw-phone': '9999999999', '#cw-company': 'Test Co' }, 'corporate wellness'],
    ['/running-event-management-consultant-ahmedabad/', { '#ev-person': 'Test Org', '#ev-contact': 'org@example.com' }, 'event management']]) {
    const c2 = await browser.newContext(); await c2.route(/fonts\./, (r) => r.abort()); let posted = null;
    await c2.route('https://formsubmit.co/**', (r) => { posted = JSON.parse(r.request().postData()); r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' }); });
    const p = await c2.newPage(); await p.goto(BASE + url);
    if (url.startsWith('/contact')) check((await p.inputValue('#ct-service')) === 'Nutrition and diet coaching', 'contact form preselects the service from ?service=');
    await p.click('form[data-enquiry] button[type=submit]');
    check(/please fill in/i.test(await p.textContent('.form-status')), `${url} asks for the required fields`);
    for (const [sel, v] of Object.entries(fills)) await p.fill(sel, v);
    await p.click('form[data-enquiry] button[type=submit]');
    await p.waitForFunction(() => /emailed/i.test(document.querySelector('.form-status').textContent), null, { timeout: 4000 }).catch(() => {});
    check(posted && /enquiry from/.test(posted._subject) && posted._subject.includes(Object.values(fills)[0]), `${url} form posts the enquiry to FormSubmit`, JSON.stringify(posted));
    check(/emailed/i.test(await p.textContent('.form-status')), `${url} form confirms the email`);
    await c2.close();
  }
  // failure falls back to WhatsApp
  const c3 = await browser.newContext(); await c3.route(/fonts\./, (r) => r.abort()); await c3.route('https://formsubmit.co/**', (r) => r.abort());
  const p3 = await c3.newPage(); await p3.goto(BASE + '/contact/'); await p3.fill('#ct-name', 'Test'); await p3.fill('#ct-contact', 'a@b.co'); await p3.click('button[type=submit]');
  await p3.waitForSelector('.form-status a', { timeout: 4000 }).catch(() => {});
  check(((await p3.getAttribute('.form-status a', 'href').catch(() => '')) || '').startsWith('https://wa.me/919879298039?text='), 'failed email falls back to a WhatsApp link');

  // sitemap and robots
  const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  check(PAGES.every((u) => sm.includes('https://www.coach-gopi.com' + u)) && !/card\.html|refer\.html/.test(sm), 'sitemap lists all pages and not the share cards');
  check(/Sitemap: https:\/\/www\.coach-gopi\.com\/sitemap\.xml/.test(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8')), 'robots.txt points to the sitemap');

  await browser.close(); server.kill();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
