// Run: npm install && npm run test:card   (needs Playwright's Chromium)
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const jsQR = require('jsqr'), { PNG } = require('pngjs');
const root = path.resolve(__dirname, '..');
const nm = (p) => fs.readFileSync(require.resolve(p, { paths: [root] }), 'utf8');
const QR_JS = nm('qrcode-generator/qrcode.js');
const H2C_JS = fs.readFileSync(path.join(path.dirname(require.resolve('html2canvas/package.json', { paths: [root] })), 'dist/html2canvas.min.js'), 'utf8');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'card-test-'));
function build(over, name) {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'card.config.json'), 'utf8'));
  Object.assign(cfg, over);
  cfg.photo = path.resolve(root, cfg.photo);
  if (cfg.brand && cfg.brand.cssSource) cfg.brand.cssSource = path.resolve(root, cfg.brand.cssSource);
  if (over.photo) cfg.photo = over.photo;
  const cfgPath = path.join(tmp, name + '.json'), out = path.join(tmp, name + '.html');
  fs.writeFileSync(cfgPath, JSON.stringify(cfg));
  execFileSync('node', [path.join(root, 'tools/build-card.mjs'), '--config', cfgPath, '--out', out], { stdio: 'pipe' });
  return 'file://' + out;
}

let failed = 0;
const check = (ok, label, extra) => { console.log((ok ? 'PASS ' : 'FAIL ') + label + (ok ? '' : '  -> ' + extra)); if (!ok) failed++; };

async function open(browser, url, { width = 1280, cdn = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await ctx.route('https://cdnjs.cloudflare.com/**', (r) => {
    if (!cdn) return r.abort();
    const u = r.request().url();
    return r.fulfill({ status: 200, contentType: 'application/javascript', body: u.includes('qrcode') ? QR_JS : H2C_JS });
  });
  const page = await ctx.newPage();
  page.errors = []; page.on('pageerror', (e) => page.errors.push(e.message));
  await page.goto(url);
  return page;
}
function decode(buf) {
  const png = PNG.sync.read(buf);
  // add a white quiet zone so the scanner finds the code
  const pad = 40, w = png.width + pad * 2, h = png.height + pad * 2, data = new Uint8ClampedArray(w * h * 4).fill(255);
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const s = (y * png.width + x) * 4, d = ((y + pad) * w + x + pad) * 4;
    for (let k = 0; k < 4; k++) data[d + k] = png.data[s + k];
  }
  const r = jsQR(data, w, h); return r && r.data;
}
const linkOf = (p) => p.evaluate(() => document.getElementById('card-link').textContent);

(async () => {
  const browser = await chromium.launch();
  const url = build({}, 'base');

  // --- client mode
  let p = await open(browser, url);
  await p.check('input[value=client]');
  await p.fill('#sender', 'Priya Shah');
  check((await p.textContent('#card-tag')) === 'Referred by Priya Shah', 'client tag reads "Referred by Priya Shah"');
  const link = await p.evaluate(() => document.getElementById('card-link').textContent);
  check(link.endsWith('?ref=priya-shah'), 'link ends ?ref=priya-shah', link);
  const qrPng = await p.locator('#qr').screenshot();
  const decoded = decode(qrPng);
  check(decoded && decoded.replace(/^https?:\/\//, '') === link, 'QR on the page decodes to the same link', decoded + ' vs ' + link);
  const wa = await p.getAttribute('#wa-send', 'href');
  check(wa.startsWith('https://wa.me/?text=') && decodeURIComponent(wa).includes('?ref=priya-shah') && decodeURIComponent(wa).includes('UESCA'), 'WhatsApp link carries message + link');
  check(!/priya/i.test(await p.evaluate(() => JSON.stringify(Object.assign({}, localStorage)) + document.cookie + location.href)), 'name is not stored (storage, cookies, page URL)');

  // --- saved picture: 1080 wide, QR scans from it
  await p.addInitScript(() => {});
  await p.evaluate(() => { navigator.canShare = undefined; });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#save')]);
  const file = path.join(tmp, 'dl.png'); await dl.saveAs(file);
  const png = PNG.sync.read(fs.readFileSync(file));
  check(png.width === 1080, 'saved PNG is 1080px wide', png.width);
  check(dl.suggestedFilename() === 'priya-shah-card.png', 'download is named priya-shah-card.png', dl.suggestedFilename());
  const full = decode(fs.readFileSync(file));
  check(full && full.replace(/^https?:\/\//, '') === link, 'QR scans from the saved PNG', String(full));
  fs.copyFileSync(file, path.join(tmp, 'sample-card.png'));
  await p.waitForFunction(() => /saved/i.test(document.getElementById('status').textContent), null, { timeout: 3000 }).catch(() => {});
  check(/saved/i.test(await p.textContent('#status')), 'status line confirms the save');
  // share sheet path
  await p.evaluate(() => { window.__shared = null; navigator.canShare = (d) => !!(d && d.files); navigator.share = (d) => { window.__shared = { n: d.files[0].name, t: d.text }; return Promise.resolve(); }; });
  await p.click('#save'); await p.waitForFunction(() => window.__shared);
  const sh = await p.evaluate(() => window.__shared);
  check(sh.n === 'priya-shah-card.png' && sh.t.includes('?ref=priya-shah'), 'phone share sheet gets the PNG and the message with link');
  // copy
  await p.click('#copy');
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  check(clip.includes('?ref=priya-shah') && /Coach Gopi/.test(clip), 'Copy message puts message + link on the clipboard');
  await p.waitForFunction(() => /copied/i.test(document.getElementById('status').textContent), null, { timeout: 2000 }).catch(() => {});
  check(/copied/i.test(await p.textContent('#status')), 'status line confirms the copy');
  check((await p.getAttribute('#status', 'role')) === 'status' && (await p.getAttribute('#status', 'aria-live')) === 'polite', 'status line is announced to screen readers');
  check(p.errors.length === 0, 'no script errors', p.errors.join(';'));

  // --- slug rules and empty name
  await p.fill('#sender', "Zoë  O'Neil & Sons — The Very Long Business Name Ltd");
  const l2 = await linkOf(p);
  const slug = l2.split('?ref=')[1];
  check(/^[a-z0-9-]{1,30}$/.test(slug) && !slug.endsWith('-') && !slug.startsWith('-'), 'slug is a-z 0-9 hyphen, max 30', slug);
  check(await p.evaluate(() => document.getElementById('sender').maxLength) === 40, 'name field max 40 chars');
  await p.fill('#sender', '');
  const l3 = await linkOf(p);
  check(!l3.includes('ref=') && (await p.textContent('#card-tag')).includes('Running coach'), 'empty name gives a plain link and the tagline');
  await p.fill('#sender', '!!!');
  check(!(await linkOf(p)).includes('ref='), 'name with no usable characters gives a plain link');
  await p.check('input[value=business]');
  check(await p.textContent('#sender-label') === 'Your business name', 'business mode asks for business name');
  check((await p.inputValue('#msg')).includes('Pass it on'), 'business message is pre-filled');
  await p.fill('#msg', 'My own words');
  await p.check('input[value=client]');
  check((await p.inputValue('#msg')) === 'My own words', 'edited message is kept when switching sender');
  await p.close();

  // --- practitioner
  p = await open(browser, url);
  check(await p.isHidden('#name-field'), 'practitioner mode has no name field');
  const lp = await linkOf(p);
  check(!lp.includes('ref=') && (await p.textContent('#card-tag')) === 'Running coach · Ahmedabad & Online', 'practitioner link has no ref, tag is the tagline', lp);
  check(!lp.includes('onrender') && !lp.includes('gopi-site'), 'link is built from the page location, domain is not hard-coded');
  check(await p.evaluate(() => !document.documentElement.innerHTML.includes('onrender.com')), 'no hard-coded domain in the page');
  check(await p.evaluate(() => document.querySelector('meta[name=robots]').content.includes('noindex')), 'page is noindex');
  check((await p.locator('#badge').count()) === 0, 'recommended = null: no badge');
  await p.close();

  // --- badge
  const bUrl = build({ recommended: { clients: 3, businesses: 1 } }, 'badge');
  p = await open(browser, bUrl);
  check((await p.textContent('#badge')) === 'Recommended by 3 clients and 1 local business', 'recommended {3,1}: badge shows', await p.locator('#badge').count());
  await p.close();
  const zUrl = build({ recommended: { clients: 0, businesses: 0 } }, 'zero');
  p = await open(browser, zUrl);
  check((await p.locator('#badge').count()) === 0, 'recommended {0,0}: badge stays hidden');
  await p.close();
  let bad = false; try { build({ recommended: { clients: 'many', businesses: 1 } }, 'bad'); } catch (e) { bad = true; }
  check(bad, 'build rejects a non-numeric recommended count');

  // --- config drives the card
  const alt = path.join(tmp, 'alt.jpg');
  fs.writeFileSync(alt, Buffer.from(fs.readFileSync(path.join(root, 'assets/card-photo.jpg')).map((b, i) => (i > 700 ? 255 - b : b))));
  const cUrl = build({ name: 'Dr. Asha Rao', shortName: 'Asha', tagline: 'Physiotherapist · Pune', photo: alt, credential: 'MPT certified',
    brand: { cssSource: path.join(root, 'index.html'), tokens: { accent: '#1B5E20', 'accent-ink': '#FFFFFF', ink: '#10201A', river: '#004D40', 'river-tint': '#E0F2F1' } } }, 'alt');
  p = await open(browser, cUrl);
  check((await p.textContent('.card-name')) === 'Dr. Asha Rao' && (await p.textContent('.chip')) === 'MPT certified', 'name and credential follow the config');
  check(await p.evaluate(() => getComputedStyle(document.querySelector('.wa')).backgroundColor) === 'rgb(27, 94, 32)', 'accent colour follows the config');
  const ph0 = await (async () => { const q = await open(browser, url); const v = await q.evaluate(() => getComputedStyle(document.querySelector('.photo')).backgroundImage); await q.close(); return v; })();
  check((await p.evaluate(() => getComputedStyle(document.querySelector('.photo')).backgroundImage)) !== ph0, 'photo follows the config');
  await p.close();
  let lowContrast = false; try { build({ brand: { cssSource: path.join(root, 'index.html'), tokens: { accent: '#FFEE99' } } }, 'lowc'); } catch (e) { lowContrast = /contrast/.test(String(e.stderr)); }
  check(lowContrast, 'build refuses colours that fail AA contrast');

  // --- 375px phone, no horizontal scroll, card fits
  p = await open(browser, url, { width: 375 });
  await p.check('input[value=client]'); await p.fill('#sender', 'Priya Shah');
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, card: document.getElementById('card').getBoundingClientRect().width, frame: document.getElementById('frame').clientWidth }));
  check(m.sw <= m.cw, 'no horizontal scroll at 375px', JSON.stringify(m));
  check(Math.abs(m.card - m.frame) <= 1, 'card is scaled to fit the screen at 375px', JSON.stringify(m));
  await p.screenshot({ path: path.join(tmp, 'mobile.png'), fullPage: true });
  const [dl2] = await Promise.all([p.waitForEvent('download'), (async () => { await p.evaluate(() => { navigator.canShare = undefined; }); await p.click('#save'); })()]);
  const f2 = path.join(tmp, 'dl-mobile.png'); await dl2.saveAs(f2);
  check(PNG.sync.read(fs.readFileSync(f2)).width === 1080, 'PNG is 1080px wide even when made on a 375px screen');
  await p.close();

  // --- CDN scripts fail: page still works
  p = await open(browser, url, { cdn: false });
  await p.check('input[value=client]'); await p.fill('#sender', 'Priya Shah');
  check((await p.textContent('#qr')).includes('QR code unavailable'), 'QR failure shows a friendly fallback');
  await p.click('#save');
  await p.waitForTimeout(150);
  check(/not available/i.test(await p.textContent('#status')), 'save-picture failure is explained');
  await p.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); document.execCommand = () => false; });
  await p.click('#copy');
  check(await p.isVisible('#fb-text'), 'copy falls back to selectable text');
  check((await p.getAttribute('#wa-send', 'href')).includes('priya-shah'), 'WhatsApp button still works');
  check(p.errors.length === 0, 'no script errors without the CDN', p.errors.join(';'));
  await p.close();

  await browser.close();
  console.log(`\nartifacts: ${tmp}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
