#!/usr/bin/env node
// Builds card.html (the share card page) from a site config. No dependencies.
// Usage: node tools/build-card.mjs [--config card.config.json] [--out card.html]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const configPath = resolve(opt('config', 'card.config.json'));
const modeArg = opt('mode', '');
const MODES = { intro: 'card.html', refer: 'refer.html' };
if (modeArg && !MODES[modeArg]) { console.error('build-card: --mode must be intro or refer'); process.exit(1); }
const base = dirname(configPath);
const cfg = JSON.parse(readFileSync(configPath, 'utf8'));

const fail = (m) => { console.error('build-card: ' + m); process.exit(1); };
for (const k of ['name', 'shortName', 'tagline', 'photo', 'offer', 'credential']) {
  if (!cfg[k] || typeof cfg[k] !== 'string') fail(`config.${k} is required`);
}
for (const k of ['practitioner', 'client', 'business']) {
  if (!cfg.messages || !cfg.messages[k]) fail(`config.messages.${k} is required`);
}

// ---- siteUrl: optional fixed address for the card link. Without it the card uses the page's own folder.
let siteUrl = '';
if (cfg.siteUrl) {
  try { const u = new URL(cfg.siteUrl); if (u.protocol !== 'https:' && u.protocol !== 'http:') throw 0; siteUrl = u.origin + u.pathname.replace(/\/?$/, '/'); }
  catch { fail('config.siteUrl must be a full http(s) URL, for example https://www.example.com/'); }
}

// ---- brand tokens: the site's own CSS variables, with optional overrides in config.brand
const brand = {};
const cssSource = cfg.brand && cfg.brand.cssSource;
let fontsHref = (cfg.brand && cfg.brand.fontsHref) || '';
if (cssSource) {
  const html = readFileSync(resolve(base, cssSource), 'utf8');
  const root = html.match(/:root\s*\{([^}]*)\}/);
  if (!root) fail(`no :root block in ${cssSource}`);
  for (const m of root[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) brand[m[1]] = m[2].trim();
  if (!fontsHref) { const f = html.match(/<link[^>]+href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/); if (f) fontsHref = f[1]; }
}
Object.assign(brand, (cfg.brand && cfg.brand.tokens) || {});
for (const k of ['bg', 'surface', 'ink', 'muted', 'line', 'accent', 'accent-ink', 'river', 'river-tint', 'display', 'body', 'mono']) {
  if (!brand[k]) fail(`brand token --${k} missing (not found in ${cssSource || 'config.brand.tokens'})`);
}
brand.radius = brand.radius || (cfg.brand && cfg.brand.radius) || '10px';
if (!/^https:\/\/fonts\.googleapis\.com\//.test(fontsHref) && fontsHref) fail('fontsHref must be a Google Fonts URL');

// ---- WCAG AA contrast check on the pairs the card uses
const lum = (hex) => {
  const h = hex.replace('#', ''); const v = (h.length === 3 ? h.split('').map((c) => c + c).join('') : h);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [['ink', 'surface'], ['muted', 'surface'], ['bg', 'ink'], ['accent-ink', 'accent'], ['river', 'river-tint'], ['river', 'surface'], ['ink', 'bg'], ['muted', 'bg']];
for (const [fg, bg] of pairs) {
  if (!/^#[0-9a-f]{3,6}$/i.test(brand[fg]) || !/^#[0-9a-f]{3,6}$/i.test(brand[bg])) fail(`colour --${fg}/--${bg} must be hex`);
  const r = ratio(brand[fg], brand[bg]);
  if (r < 4.5) fail(`contrast ${r.toFixed(2)}:1 for --${fg} on --${bg} is below AA 4.5:1`);
}

// ---- photo is inlined so the exported picture never depends on a network fetch
const photoBuf = readFileSync(resolve(base, cfg.photo));
const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[extname(cfg.photo).toLowerCase()];
if (!mime) fail('photo must be .jpg, .png or .webp');
const photoUri = `data:${mime};base64,${photoBuf.toString('base64')}`;

// ---- recommended badge: only with real, whole, non-negative counts that add up to something
let badge = '';
const rec = cfg.recommended;
if (rec !== null && rec !== undefined) {
  const ok = (n) => Number.isInteger(n) && n >= 0;
  if (typeof rec !== 'object' || !ok(rec.clients) || !ok(rec.businesses)) fail('recommended must be null or { clients: N, businesses: N } with whole numbers');
  const parts = [];
  if (rec.clients > 0) parts.push(`${rec.clients} ${rec.clients === 1 ? 'client' : 'clients'}`);
  if (rec.businesses > 0) parts.push(`${rec.businesses} local ${rec.businesses === 1 ? 'business' : 'businesses'}`);
  if (parts.length) badge = `Recommended by ${parts.join(' and ')}`;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dataFor = (mode) => ({ mode, siteUrl, name: cfg.name, shortName: cfg.shortName, tagline: cfg.tagline, messages: cfg.messages });
const dataJsonFor = (mode) => JSON.stringify(dataFor(mode)).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, '');

const tpl = readFileSync(new URL('./card.template.html', import.meta.url), 'utf8');
const buildOne = (mode, outPath) => {
const vars = {
  TITLE: esc(mode === 'intro' ? `Intro card | ${cfg.name}` : `Refer ${cfg.name}`),
  HEADING: esc(mode === 'intro' ? `Share ${cfg.name}` : `Recommend ${cfg.name}`),
  LEAD: mode === 'intro' ? 'Your intro card and a ready message. Send it on WhatsApp or anywhere.' : esc(`Know someone who wants to run? Make a card with your name on it and send it to them.`),
  WHO: mode === 'intro' ? '' : '<fieldset>\n    <legend>Who is recommending?</legend>\n    <div class="who" style="grid-template-columns:repeat(2,1fr)">\n      <label><input type="radio" name="who" value="client" checked><span>I am a client</span></label>\n      <label><input type="radio" name="who" value="business"><span>I am a local business</span></label>\n    </div>\n  </fieldset>',
  NAME_HIDDEN: mode === 'intro' ? ' hidden' : '',
  FONTS: fontsHref ? `<link rel="stylesheet" href="${esc(fontsHref)}">` : '',
  TOKENS: Object.entries(brand).map(([k, v]) => `--${k}:${v};`).join('') ,
  NAME: esc(cfg.name), TAGLINE: esc(cfg.tagline), CREDENTIAL: esc(cfg.credential), OFFER: esc(cfg.offer),
  PHOTO: photoUri, PHOTO_ALT: esc(`${cfg.name}`),
  BADGE: badge ? `<p class="badge" id="badge">${esc(badge)}</p>` : '',
  DATA: dataJsonFor(mode),
  SCRIPT: readFileSync(new URL('./card.client.js', import.meta.url), 'utf8'),
};
const out = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => { if (!(k in vars)) fail(`template var ${k} unknown`); return vars[k]; });
writeFileSync(outPath, out);
console.log(`build-card: wrote ${outPath} (${(out.length / 1024).toFixed(1)} KB)${badge ? ', badge: ' + badge : ', no badge'}`);
};
if (modeArg) buildOne(modeArg, resolve(opt('out', MODES[modeArg])));
else for (const m of Object.keys(MODES)) buildOne(m, resolve(opt('outdir', '.'), MODES[m]));
