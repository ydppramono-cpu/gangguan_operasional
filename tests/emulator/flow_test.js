// Uji alur umum → rinci: Ringkasan → temuan → Telusuri (tersaring) → Kejadian → Profil → Kembali; Wilayah → profil wilayah; Sarana → kartu unit.
const { chromium } = require('playwright'); const fs = require('fs'); const L = process.env.LIBS_DIR || require('path').resolve(__dirname, 'node_modules') + '/';
const MAP = [[/echarts@/, L + 'echarts/dist/echarts.min.js'], [/tabulator-tables@[\d.]+\/dist\/js/, L + 'tabulator-tables/dist/js/tabulator.min.js'], [/tabulator-tables@[\d.]+\/dist\/css/, L + 'tabulator-tables/dist/css/tabulator.min.css'], [/alpinejs@/, L + 'alpinejs/dist/cdn.min.js']];
const OUT = process.env.FLOW_DIR || __dirname + '/shots/alur'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const W = Number(process.env.W || 1440);
  const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: Number(process.env.DSF || 1) }); const errs = [], log = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', rt => { const u = rt.request().url(); for (const [re, f] of MAP) if (re.test(u)) return rt.fulfill({ path: f }); if (/^https?:/.test(u)) return rt.fulfill({ status: 404, body: '' }); return rt.continue(); });
  const st = () => p.evaluate(() => ({ route: Alpine.store('app').route, params: JSON.stringify(Alpine.store('app').params || {}), h1: document.querySelector('.page-title').textContent.trim() }));
  async function step(name, fn, expect) {
    try { await fn(); await p.waitForTimeout(1800); } catch (e) { errs.push(name + ': ' + e.message.split('\n')[0]); }
    const s = await st(); const ok = !expect || expect(s); log.push({ langkah: name, ...s, ok }); if (!ok) errs.push(name + ': rute ' + s.route);
    await p.screenshot({ path: `${OUT}/${String(log.length).padStart(2, '0')}-${name}.png`, fullPage: false });
  }
  await p.goto('file://' + __dirname + '/app.html?page=ringkasan'); await p.waitForTimeout(4500);
  await step('ringkasan', async () => {}, s => s.route === 'ringkasan');
  await step('temuan-ke-telusuri', () => p.locator('a:has-text("Lihat"), button:has-text("Lihat")').filter({ hasText: /kejadian/ }).first().click(), s => s.route === 'telusuri');
  await step('baris-ke-kejadian', () => p.locator('.tabulator-row').first().click(), s => s.route === 'kejadian');
  await step('kejadian-ke-profil-lokasi', () => p.locator('dl dd button.link-btn').nth(1).click(), s => s.route === 'profil' || s.route === 'telusuri');
  await step('kembali-ke-kejadian', () => p.click('.back-btn'), s => s.route === 'kejadian');
  await step('kejadian-ke-profil-wilayah', () => p.locator('dl dd button.link-btn').first().click(), s => s.route === 'profil' && /wilayah/.test(s.params));
  await step('wilayah', () => p.evaluate(() => Alpine.store('app').go('wilayah')), s => s.route === 'wilayah');
  await step('wilayah-ke-profil-lokasi', () => p.locator('main table.tbl tbody button.link-btn.plain').first().click(), s => s.route === 'profil' || s.route === 'telusuri');
  await step('cari-umum', () => p.evaluate(() => Alpine.store('app').go('cari')), s => s.route === 'cari');
  await step('cari-ke-ka', () => p.locator('main .card:has(h3:text("Kereta api")) tr.click').first().click(), s => s.route === 'profil' && /"ka"/.test(s.params));
  await step('sarana', () => p.evaluate(() => Alpine.store('app').go('sarana')), s => s.route === 'sarana');
  await step('sarana-daftar-unit', () => p.click('button:has-text("Daftar unit"), [role=tab]:has-text("Daftar unit")'), s => s.route === 'sarana');
  await step('unit-ke-kartu', () => p.locator('main .tabulator-row').first().click(), s => /sarana|profil/.test(s.route));
  console.log(JSON.stringify(log, null, 1)); console.log(errs.length ? 'GAGAL ' + JSON.stringify(errs) : 'LULUS');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
