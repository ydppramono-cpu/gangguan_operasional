// Uji switch GAPEKA global: bawaan = versi berlaku, ganti ke versi lain membangun ulang referensi; label jadwal di profil KA ikut.
const { chromium } = require('playwright'); const L = process.env.LIBS_DIR || require('path').resolve(__dirname, 'node_modules') + '/';
const MAP = [[/echarts@/, L + 'echarts/dist/echarts.min.js'], [/tabulator-tables@[\d.]+\/dist\/js/, L + 'tabulator-tables/dist/js/tabulator.min.js'], [/tabulator-tables@[\d.]+\/dist\/css/, L + 'tabulator-tables/dist/css/tabulator.min.css'], [/alpinejs@/, L + 'alpinejs/dist/cdn.min.js']];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', rt => { const u = rt.request().url(); for (const [re, f] of MAP) if (re.test(u)) return rt.fulfill({ path: f }); if (/^https?:/.test(u)) return rt.fulfill({ status: 404, body: '' }); return rt.continue(); });
  await p.goto('file://' + __dirname + '/app.html?page=ringkasan'); await p.waitForTimeout(4000);
  const st = () => p.evaluate(() => ({ g: Alpine.store('app').gapeka, ref: KAI.data.ref && KAI.data.ref.gapeka, tt: KAI.data.ref && KAI.data.ref.ttList.length, busy: Alpine.store('app').gapekaBusy }));
  const a = await st();
  await p.click('.gapeka-sw button:has-text("2026")'); await p.waitForTimeout(2500);
  const c = await st();
  const lbl = () => p.evaluate(() => KAI.gapeka.label(Alpine.store('app').gapeka) + ' · ' + (Alpine.store('app').R && KAI.data.ref ? KAI.data.ref.gapeka : ''));
  const h = await lbl();
  await p.screenshot({ path: __dirname + '/shots/switch-2026.png' });
  await p.click('.gapeka-sw button:has-text("2025")'); await p.waitForTimeout(2500);
  const h2 = await lbl(); const d = await st();
  const ok = a.g === a.ref && c.g === '2026' && c.ref === '2026' && c.tt > 2000 && /2026/.test(h) && /2025/.test(h2) && d.ref === '2025' && !errs.length;
  console.log(JSON.stringify({ awal: a, sesudah2026: c, judul2026: h, judul2025: h2, kembali: d, galat: errs }), ok ? 'LULUS' : 'GAGAL');
  await b.close(); process.exit(ok ? 0 : 1);
})();
