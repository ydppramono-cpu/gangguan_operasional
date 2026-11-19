const { chromium } = require('playwright'); const fs = require('fs');
const L = process.env.LIBS_DIR || require('path').resolve(__dirname, 'node_modules') + '/';
const MAP = [[/echarts@[\d.]+\/dist\/echarts\.min\.js/, L + 'echarts/dist/echarts.min.js'], [/tabulator-tables@[\d.]+\/dist\/js\/tabulator\.min\.js/, L + 'tabulator-tables/dist/js/tabulator.min.js'],
  [/tabulator-tables@[\d.]+\/dist\/css\/tabulator\.min\.css/, L + 'tabulator-tables/dist/css/tabulator.min.css'], [/alpinejs@[\d.]+\/dist\/cdn\.min\.js/, L + 'alpinejs/dist/cdn.min.js']];
const routes = (process.argv[2] || 'ringkasan,tren,perlintasan,wilayah,sarana,eksposur,gapeka,telusuri,cari,unduh,metodologi').split(',');
const widths = (process.env.W || '1440,400').split(',').map(Number);
(async () => {
  const b = await chromium.launch(); process.chdir(__dirname); fs.mkdirSync('shots', { recursive: true }); const rep = {};
  for (const w of widths) for (const r of routes) {
    const ctx = await b.newContext({ viewport: { width: w, height: w > 800 ? 900 : 860 } }); const p = await ctx.newPage(); const errs = [];
    await p.route('**/*', rt => { const u = rt.request().url(); for (const [re, f] of MAP) if (re.test(u)) return rt.fulfill({ path: f }); if (/^https?:/.test(u)) return rt.fulfill({ status: 404, body: '' }); return rt.continue(); });
    p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); if (m.type()==='warning' && /Alpine/.test(m.text())) errs.push('warn: ' + m.text().slice(0, 200)); });
    const [page, tab] = r.split(':');
    await p.goto('file://' + __dirname + '/app.html?page=' + page + (tab ? '&tab=' + tab : ''), { waitUntil: 'load' });
    await p.waitForTimeout(Number(process.env.WAIT || 4500));
    const info = await p.evaluate(() => {
      const de = document.documentElement, out = { hscroll: de.scrollWidth > innerWidth + 1, sw: de.scrollWidth };
      // elemen yang keluar dari viewport secara horizontal (selain di dalam kontainer scroll)
      const bad = []; document.querySelectorAll('main *').forEach(el => { const rc = el.getBoundingClientRect(); if (rc.width && rc.right > innerWidth + 2 && getComputedStyle(el).position !== 'fixed') { let q = el.parentElement, sc = false; while (q) { const s = getComputedStyle(q); if (/auto|scroll|hidden/.test(s.overflowX)) { sc = true; break; } q = q.parentElement; } if (!sc) bad.push((el.className && el.className.baseVal === undefined ? el.className : el.tagName).toString().slice(0, 40)); } });
      out.overflow = [...new Set(bad)].slice(0, 8);
      out.title = (document.querySelector('h1,.page-title') || {}).textContent;
      out.txt = (document.querySelector('main') || document.body).innerText.length;
      out.nan = ((document.querySelector('main') || document.body).innerText.match(/NaN|undefined|\[object|Infinity|null\b/g) || []).slice(0, 5);
      return out;
    });
    rep[w + ' ' + r] = { errs, ...info };
    await p.screenshot({ path: `shots/${r.replace(':', '_')}-${w}.png`, fullPage: true });
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(rep, null, 1));
})();
