// Membaca semua seed .gs (tanpa menjalankan Apps Script) dan menulis isinya sebagai JSON untuk export_csv.py.
// Pemakaian: node tools/csv/dump_seeds.js <folder_keluar>
const fs = require('fs'), vm = require('vm'), path = require('path'), zlib = require('zlib');
const SRC = path.resolve(__dirname, '../../src'), OUT = process.argv[2];
const ctx = {}; vm.createContext(ctx);
['10_Seed.gs', '11_SeedJadwal.gs', '12_SeedRujukan.gs', '14_SeedResor.gs', '17_SeedDuksar.gs', '18_SeedPeta.gs', '19_SeedGapeka26.gs', '20_SeedGapeka25.gs']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f }));
const hdr = fs.readFileSync(path.join(SRC, '09_Ref.gs'), 'utf8');
const H = n => JSON.parse(hdr.match(new RegExp('var ' + n + ' = (\\[[^\\]]*\\]);'))[1].replace(/'/g, '"'));
const gz = s => JSON.parse(zlib.gunzipSync(Buffer.from(s, 'base64')).toString('utf8'));
const out = {
  jpl: { header: H('M_JPL_HEADER'), rows: ctx.SEED_JPL }, ops: { header: H('M_OPS_HEADER'), rows: ctx.SEED_PTDO }, depo: { header: H('M_DEPO_HEADER'), rows: ctx.SEED_DEPO_KA },
  rujukan: { header: ctx.M_RUJUKAN_HEADER, rows: ctx.SEED_RUJUKAN }, koreksi: { header: ctx.M_KOREKSI_HEADER, rows: ctx.SEED_KOREKSI },
  resor: ctx.SEED_RESOR, duksar25: ctx.SEED_DUKSAR, peta: ctx.SEED_PETA, g25: gz(ctx.SEED_GAPEKA25_GZ), g26: gz(ctx.SEED_GAPEKA26_GZ)
};
fs.writeFileSync(path.join(OUT, 'seeds.json'), JSON.stringify(out));
console.log('seeds.json', Object.keys(out).join(', '));
