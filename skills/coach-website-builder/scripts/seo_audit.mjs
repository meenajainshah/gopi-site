#!/usr/bin/env node
// On-page SEO analyser for a built static site. No dependencies.
// Usage: node seo_audit.mjs --dir <site root> --site https://www.example.com [--keywords keywords.json] [--json] [--out report.md]
// keywords.json: { "/": "running coach ahmedabad", "/about/": "about coach gopi" }  (primary keyword per URL path; optional)
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d = '') => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const root = resolve(opt('dir', '.'));
const site = opt('site').replace(/\/$/, '');
const kwFile = opt('keywords');
const keywords = kwFile && existsSync(kwFile) ? JSON.parse(readFileSync(kwFile, 'utf8')) : {};
if (!site) { console.error('--site https://www.example.com is required (the live address, used to check canonical and og:url)'); process.exit(2); }

const SKIP = new Set(['node_modules', '.git', 'design-system', 'tests', 'tools', 'skills']);
function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (SKIP.has(n) || n.startsWith('.')) continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const files = walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const urlOf = (f) => { let u = '/' + relative(root, f).split(sep).join('/'); u = u.replace(/index\.html$/, ''); return u; };
const exists = (u) => { const p = u.split('#')[0].split('?')[0]; const cand = [join(root, p), join(root, p, 'index.html'), join(root, p + '.html')]; return cand.some((c) => existsSync(c) && statSync(c).isFile()); };

const attr = (tag, name) => { const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i')); return m ? (m[2] ?? m[3]) : ''; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = (h) => decode(h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const findings = []; // {url, level, rule, msg}
const add = (url, level, rule, msg) => findings.push({ url, level, rule, msg });
const pages = [];

for (const f of htmlFiles) {
  const url = urlOf(f);
  const html = readFileSync(f, 'utf8');
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [''])[0];
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (n) => { const t = metas.find((m) => attr(m, 'name').toLowerCase() === n); return t ? attr(t, 'content') : ''; };
  const og = (n) => { const t = metas.find((m) => attr(m, 'property').toLowerCase() === 'og:' + n); return t ? attr(t, 'content') : ''; };
  const title = decode(((head.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').trim());
  const desc = decode(meta('description'));
  const robots = meta('robots').toLowerCase();
  const noindex = /noindex/.test(robots);
  const canonical = (head.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [''])[0];
  const canonicalHref = attr(canonical, 'href');
  const h = [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ l: +m[1], t: text(m[2]) }));
  const h1s = h.filter((x) => x.l === 1);
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const links = [...body.matchAll(/<a\b[^>]*>/gi)].map((m) => m[0]);
  const words = text(body.replace(/<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>|<nav[\s\S]*?<\/nav>/gi, ' ')).split(' ').filter(Boolean).length;
  const ld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const legal = /privacy|terms|disclaimer/.test(url);

  const P = { url, title, desc, noindex, words, h1: h1s[0] ? h1s[0].t : '' };
  pages.push(P);

  // --- title (share-card and utility pages marked noindex are not judged on search snippets)
  if (!title) add(url, 'error', 'title', 'Missing <title>');
  else if (!noindex) {
    if (title.length < 30) add(url, 'warn', 'title-short', `Title is ${title.length} characters (aim for 50 to 60)`);
    if (title.length > 60) add(url, 'warn', 'title-long', `Title is ${title.length} characters, search results cut it off after about 60`);
  }
  // --- description
  if (noindex) { /* not judged */ }
  else if (!desc) add(url, 'error', 'description', 'Missing meta description');
  else if (desc.length < 90 || desc.length > 165) add(url, 'warn', 'description-length', `Meta description is ${desc.length} characters (aim for 120 to 160)`);
  // --- headings
  if (h1s.length !== 1) add(url, 'error', 'h1', `Page has ${h1s.length} h1 headings (needs exactly one)`);
  for (let i = 1; i < h.length; i++) if (h[i].l > h[i - 1].l + 1) { add(url, 'warn', 'heading-order', `Heading jumps from h${h[i - 1].l} to h${h[i].l} ("${h[i].t.slice(0, 40)}")`); break; }
  // --- technical head
  if (!/<html[^>]*\blang=/i.test(html)) add(url, 'error', 'lang', 'Missing lang attribute on <html>');
  if (!metas.some((m) => attr(m, 'name').toLowerCase() === 'viewport')) add(url, 'error', 'viewport', 'Missing viewport meta tag (mobile)');
  if (!noindex) {
    if (!canonicalHref) add(url, 'error', 'canonical', 'Missing canonical link');
    else if (canonicalHref.replace(/\/$/, '') !== (site + url).replace(/\/$/, '')) add(url, 'error', 'canonical-mismatch', `Canonical is ${canonicalHref}, expected ${site + url}`);
    for (const k of ['title', 'description', 'image']) if (!og(k)) add(url, 'warn', 'og-' + k, `Missing og:${k} (share preview)`);
    if (og('url') && og('url').replace(/\/$/, '') !== (site + url).replace(/\/$/, '')) add(url, 'warn', 'og-url', `og:url is ${og('url')}`);
    if (!/rel=["'](shortcut )?icon["']/i.test(head)) add(url, 'warn', 'favicon', 'No favicon link');
    if (!ld.length) add(url, 'info', 'structured-data', 'No JSON-LD structured data');
  } else if (!/noindex/.test(robots)) add(url, 'info', 'robots', 'noindex page');
  ld.forEach((j, i) => { try { JSON.parse(j); } catch { add(url, 'error', 'json-ld', `JSON-LD block ${i + 1} is not valid JSON`); } });
  // --- content
  if (!noindex && !legal && words < 250) add(url, 'warn', 'thin-content', `Only ${words} words of main content (aim for 300 or more on a service or about page)`);
  // --- images
  for (const im of imgs) {
    if (!/\balt=/i.test(im)) add(url, 'error', 'img-alt', `Image without alt text: ${attr(im, 'src').slice(0, 60)}`);
    else if (!attr(im, 'alt') && !/role=["']presentation["']/.test(im)) add(url, 'info', 'img-alt-empty', `Image with empty alt (fine only if purely decorative): ${attr(im, 'src').slice(0, 60)}`);
    if (!/\bwidth=/i.test(im) || !/\bheight=/i.test(im)) add(url, 'info', 'img-size', `Image has no width and height attributes (layout shift): ${attr(im, 'src').slice(0, 60)}`);
  }
  // --- links
  for (const a of links) {
    const href = attr(a, 'href');
    if (!href) { add(url, 'warn', 'link-empty', 'Link without href'); continue; }
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) {
      if (href.startsWith(site)) { const p = href.slice(site.length) || '/'; if (!exists(p)) add(url, 'error', 'broken-internal', `Broken internal link ${href}`); }
      if (/target=["']_blank["']/i.test(a) && !/rel=["'][^"']*noopener/i.test(a)) add(url, 'warn', 'noopener', `External link opens in a new tab without rel="noopener": ${href.slice(0, 60)}`);
      continue;
    }
    if (href.startsWith('#')) { if (href.length > 1 && !new RegExp(`id=["']${href.slice(1)}["']`).test(html)) add(url, 'warn', 'broken-anchor', `Anchor ${href} has no matching id`); continue; }
    const target = href.startsWith('/') ? href : '/' + relative(root, join(f, '..', href)).split(sep).join('/');
    if (!exists(target)) add(url, 'error', 'broken-internal', `Broken internal link ${href}`);
    else if (href.includes('#')) { const [p, id] = href.split('#'); const tf = [join(root, p), join(root, p, 'index.html')].find((c) => existsSync(c) && statSync(c).isFile()); if (tf && id && !new RegExp(`id=["']${id}["']`).test(readFileSync(tf, 'utf8'))) add(url, 'warn', 'broken-anchor', `Anchor ${href} has no matching id`); }
  }
  // --- keyword placement (optional)
  const kw = (keywords[url] || '').toLowerCase();
  if (kw) {
    const parts = kw.split(/\s+/);
    const has = (s) => parts.every((p) => s.toLowerCase().includes(p));
    if (!has(title)) add(url, 'warn', 'kw-title', `Primary keyword "${kw}" is not in the title`);
    if (!has(P.h1)) add(url, 'warn', 'kw-h1', `Primary keyword "${kw}" is not in the h1`);
    if (!has(desc)) add(url, 'info', 'kw-desc', `Primary keyword "${kw}" is not in the meta description`);
    const first = text(body).split(' ').slice(0, 120).join(' ');
    if (!has(first)) add(url, 'info', 'kw-intro', `Primary keyword "${kw}" is not in the first 120 words`);
  }
}

// --- site-level
const indexable = pages.filter((p) => !p.noindex);
const dup = (key, rule, label) => { const seen = {}; for (const p of indexable) { if (!p[key]) continue; (seen[p[key]] = seen[p[key]] || []).push(p.url); } for (const [v, us] of Object.entries(seen)) if (us.length > 1) add(us.join(', '), 'error', rule, `Duplicate ${label}: "${v.slice(0, 60)}"`); };
dup('title', 'duplicate-title', 'title'); dup('desc', 'duplicate-description', 'meta description');
const smPath = join(root, 'sitemap.xml');
if (!existsSync(smPath)) add('(site)', 'error', 'sitemap', 'No sitemap.xml');
else { const sm = readFileSync(smPath, 'utf8'); for (const p of indexable) if (!sm.includes(site + p.url)) add(p.url, 'warn', 'sitemap-missing', 'Indexable page is not in sitemap.xml'); for (const p of pages.filter((x) => x.noindex)) if (sm.includes(site + p.url)) add(p.url, 'warn', 'sitemap-noindex', 'noindex page is listed in sitemap.xml'); }
const rb = join(root, 'robots.txt');
if (!existsSync(rb)) add('(site)', 'error', 'robots', 'No robots.txt'); else if (!/Sitemap:/i.test(readFileSync(rb, 'utf8'))) add('(site)', 'warn', 'robots-sitemap', 'robots.txt does not point to the sitemap');
if (!existsSync(join(root, 'llms.txt'))) add('(site)', 'info', 'llms', 'No llms.txt (helps AI search tools understand the site)');
const incoming = {}; for (const f of htmlFiles) for (const m of readFileSync(f, 'utf8').matchAll(/<a\b[^>]*href=["'](\/[^"'#?]*)["']/gi)) incoming[m[1]] = (incoming[m[1]] || 0) + 1;
for (const p of indexable) if (p.url !== '/' && !incoming[p.url]) add(p.url, 'warn', 'orphan', 'No internal links point to this page');

// --- score
const errs = (u) => findings.filter((x) => x.url === u && x.level === 'error').length;
const warns = (u) => findings.filter((x) => x.url === u && x.level === 'warn').length;
for (const p of pages) p.score = Math.max(0, 100 - 12 * errs(p.url) - 3 * warns(p.url));
const siteLevel = findings.filter((x) => x.url === '(site)' || x.url.includes(','));
const avg = pages.length ? pages.reduce((a, p) => a + p.score, 0) / pages.length : 0;
const overall = Math.max(0, Math.round(avg - 5 * siteLevel.filter((x) => x.level === 'error').length - 2 * siteLevel.filter((x) => x.level === 'warn').length));
const counts = { error: findings.filter((x) => x.level === 'error').length, warn: findings.filter((x) => x.level === 'warn').length, info: findings.filter((x) => x.level === 'info').length };

if (flag('json')) { console.log(JSON.stringify({ overall, counts, pages, findings }, null, 2)); process.exit(counts.error ? 1 : 0); }
let md = `# On-page SEO report\n\nSite: ${site}  |  Pages analysed: ${pages.length}  |  Overall score: **${overall}/100**  |  Errors: ${counts.error}  Warnings: ${counts.warn}  Notes: ${counts.info}\n\n`;
md += `| Page | Score | Title (chars) | Description (chars) | Words |\n|---|---|---|---|---|\n`;
for (const p of pages) md += `| ${p.url}${p.noindex ? ' (noindex)' : ''} | ${p.score} | ${p.title.length} | ${p.desc.length} | ${p.words} |\n`;
md += `\n## Findings\n`;
for (const lvl of ['error', 'warn', 'info']) { const fs = findings.filter((x) => x.level === lvl); if (!fs.length) continue; md += `\n### ${{ error: 'Errors (fix first)', warn: 'Warnings', info: 'Notes' }[lvl]}\n`; for (const x of fs) md += `- \`${x.url}\` ${x.msg}\n`; }
md += `\nScore rule: each page starts at 100, minus 12 per error and 3 per warning. The site score is the page average minus site-wide issues. A score is a guide to fixable on-page problems. It does not predict rankings.\n`;
if (opt('out')) writeFileSync(opt('out'), md);
console.log(md);
process.exit(counts.error ? 1 : 0);
