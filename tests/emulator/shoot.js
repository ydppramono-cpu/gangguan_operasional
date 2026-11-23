const { chromium } = require('playwright'); const fs = require('fs');
const L = process.env.LIBS_DIR || require('path').resolve(__dirname, 'node_modules') + '/';
const MAP = [[/echarts@[\d.]+\/dist\/echarts\.min\.js/, L + 'echarts/dist/echarts.min.js'], [/tabulator-tables@[\d.]+\/dist\/js\/tabulator\.min\.js/, L + 'tabulator-tables/dist/js/tabulator.min.js'],
  [/tabulator-tables@[\d.]+\/dist\/css\/tabulator\.min\.css/, L + 'tabulator-tables/dist/css/tabulator.min.css'], [/alpinejs@[\d.]+\/dist\/cdn\.min\.js/, L + 'alpinejs/dist/cdn.min.js']];
const routes = (process.argv[2] || 'ringkasan,tren,perlintasan,wilayah,sarana,eksposur,telusuri,cari,unduh,metodologi').split(',');
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
    const cek = () => p.evaluate(() => {
      const de = document.documentElement, out = { hscroll: de.scrollWidth > innerWidth + 1, sw: de.scrollWidth };
      // elemen yang keluar dari viewport secara horizontal (selain di dalam kontainer scroll)
      const bad = []; document.querySelectorAll('main *').forEach(el => { const rc = el.getBoundingClientRect(); if (rc.width && rc.right > innerWidth + 2 && getComputedStyle(el).position !== 'fixed') { let q = el.parentElement, sc = false; while (q) { const s = getComputedStyle(q); if (/auto|scroll|hidden/.test(s.overflowX)) { sc = true; break; } q = q.parentElement; } if (!sc) bad.push((el.className && el.className.baseVal === undefined ? el.className : el.tagName).toString().slice(0, 40)); } });
      out.overflow = [...new Set(bad)].slice(0, 8);
      out.title = (document.querySelector('h1,.page-title') || {}).textContent;
      out.txt = (document.querySelector('main') || document.body).innerText.length;
      out.nan = ((document.querySelector('main') || document.body).innerText.match(/NaN|undefined|\[object|Infinity|null\b/g) || []).slice(0, 5);
      // ---- Pemeriksa kerapian (v3.19): pola ketidakrapian yang pernah dilaporkan pemilik ----
      const vis = el => { const rc = el.getBoundingClientRect(); return rc.width > 0 && rc.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
      const root = document.querySelector('main') || document.body, T = root.innerText;
      const K = out.kerapian = [];
      const kata = T.match(/belum ada data|belum terkelas|data belum lengkap|frekuensi tak diketahui|Nomor tidak ada di GAPEKA/gi);
      if (kata && !/page=metodologi/.test(location.search)) K.push('teks kosong/label sisa: ' + [...new Set(kata.map(x => x.toLowerCase()))].join(', '));
      document.querySelectorAll('.tabs').forEach(t => { if (vis(t) && t.scrollHeight > t.clientHeight + 1) K.push('tab bergulir vertikal (panah atas/bawah)'); });
      const bh = new Set([...document.querySelectorAll('.badge.k')].filter(vis).map(e => Math.round(e.getBoundingClientRect().height)));
      if (bh.size > 1) K.push('tinggi label kelas berbeda: ' + [...bh].join('/') + ' px');
      const bw = [...document.querySelectorAll('.badge.k')].filter(vis).map(e => Math.round(e.getBoundingClientRect().width));
      if (bw.length && Math.max(...bw) - Math.min(...bw) > 40) K.push('lebar label kelas tidak seragam: ' + Math.min(...bw) + '–' + Math.max(...bw) + ' px');
      document.querySelectorAll('dl.kv > dd').forEach(dd => { if (vis(dd) && /^\s*(–|-|belum ada data.*|tidak tersedia.*)?\s*$/i.test(dd.textContent)) K.push('baris profil kosong tampil: ' + ((dd.previousElementSibling || {}).textContent || '?')); });
      document.querySelectorAll('.grid').forEach(g => {
        if (!vis(g)) return; const rows = {};
        [...g.children].filter(vis).forEach(c => { const rc = c.getBoundingClientRect(); (rows[Math.round(rc.top)] = rows[Math.round(rc.top)] || []).push(rc.height); });
        Object.values(rows).forEach(h => { if (h.length > 1 && Math.max(...h) - Math.min(...h) > 3) K.push('bento tidak rata (' + h.map(Math.round).join('/') + ' px)'); });
      });
      document.querySelectorAll('.card').forEach(c => { if (vis(c) && c.scrollWidth > c.clientWidth + 4 && getComputedStyle(c).overflowX === 'visible') K.push('isi kartu melebar: ' + ((c.querySelector('h3') || {}).textContent || '').slice(0, 40)); });
      out.kerapian = [...new Set(K)].slice(0, 12);
      return out;
    });
    const info = await cek();
    if (process.env.TABS !== '0') {
      const nTab = await p.evaluate(() => [...document.querySelectorAll('.tabs')].filter(t => t.offsetParent).map(t => t.querySelectorAll('button').length)[0] || 0);
      for (let ti = 1; ti < nTab; ti++) {
        const lbl = await p.evaluate(i => { const t = [...document.querySelectorAll('.tabs')].filter(t => t.offsetParent)[0]; const bt = t && t.querySelectorAll('button')[i]; if (!bt) return ''; bt.click(); return bt.textContent.trim(); }, ti);
        if (!lbl) continue; await p.waitForTimeout(Number(process.env.WAIT_TAB || 1500));
        const x = await cek(); (x.kerapian || []).forEach(k => info.kerapian.push('[' + lbl + '] ' + k)); x.nan.forEach(k => info.nan.push('[' + lbl + '] ' + k));
        if (w > 800) await p.screenshot({ path: `shots/${r.replace(':', '_')}-${w}-t${ti}.png`, fullPage: true });
      }
      if (nTab > 1) await p.evaluate(() => { const t = [...document.querySelectorAll('.tabs')].filter(t => t.offsetParent)[0]; t && t.querySelector('button').click(); });
      await p.waitForTimeout(600);
    }
    rep[w + ' ' + r] = { errs, ...info };
    await p.screenshot({ path: `shots/${r.replace(':', '_')}-${w}.png`, fullPage: true });
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(rep, null, 1));
  const nK = Object.values(rep).reduce((n, x) => n + (x.kerapian || []).length, 0), nE = Object.values(rep).reduce((n, x) => n + x.errs.length, 0);
  console.log('RINGKAS: galat konsol ' + nE + ' · temuan kerapian ' + nK);
  if (process.env.STRICT && (nE || nK)) process.exit(1);
})();
