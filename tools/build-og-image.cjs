// Makes assets/og-card.jpg (1200x630): the picture WhatsApp and other apps show when the site link is shared.
// Uses card.config.json and the site's own CSS variables. Run: node tools/build-og-image.cjs
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'card.config.json'), 'utf8'));
const site = fs.readFileSync(path.join(root, cfg.brand.cssSource), 'utf8');
const t = {};
for (const m of site.match(/:root\s*\{([^}]*)\}/)[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) t[m[1]] = m[2].trim();
const fonts = (site.match(/<link[^>]+href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/) || [])[1] || '';
const photo = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(root, cfg.photo)).toString('base64');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const host = new URL(cfg.siteUrl).host;
const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${fonts}"><style>
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:${t.ink};font-family:${t.body};color:${t.surface}}
.c{position:absolute;inset:28px;background:${t.surface};border-radius:18px;display:flex;align-items:center;gap:56px;padding:0 64px;color:${t.ink}}
.p{flex:none;width:340px;height:340px;border-radius:50%;border:6px solid ${t.ink};background:url(${photo}) center/cover}
.k{font:600 22px ${t.mono};letter-spacing:.1em;text-transform:uppercase;color:${t['river']}}
h1{font:800 132px/0.95 ${t.display};text-transform:uppercase;margin:14px 0 10px}
.o{font-size:32px;line-height:1.3;color:${t.muted};max-width:640px}
.chip{display:inline-block;margin-top:22px;font:600 22px ${t.mono};letter-spacing:.09em;text-transform:uppercase;padding:8px 16px;border-radius:6px;background:${t['river-tint']};color:${t.river}}
.u{position:absolute;left:0;right:0;bottom:0;background:${t.accent};color:${t['accent-ink']};font:600 28px ${t.mono};padding:16px 64px;border-radius:0 0 18px 18px;letter-spacing:.04em}
</style><div class="c"><div class="p"></div><div><div class="k">${esc(cfg.tagline)}</div><h1>${esc(cfg.name)}</h1><p class="o">${esc(cfg.offer)}</p><span class="chip">${esc(cfg.credential)}</span></div><div class="u">${esc(host)}</div></div>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html, { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  await p.screenshot({ path: path.join(root, 'assets/og-card.jpg'), type: 'jpeg', quality: 86 });
  await b.close();
  console.log('wrote assets/og-card.jpg', fs.statSync(path.join(root, 'assets/og-card.jpg')).size, 'bytes');
})();
