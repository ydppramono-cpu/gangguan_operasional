/**
 * test_akses.js — setiap fungsi tingkat atas tanpa akhiran "_" di src/*.gs dapat dipanggil browser (google.script.run).
 * Uji ini memastikan tidak ada yang terlewat:
 *   - fungsi API (daftar API di bawah) boleh dipanggil anonim dan mengembalikan { ok } tanpa melempar;
 *   - fungsi lain (editor/admin) harus MENOLAK pemanggil anonim sebelum menyentuh apa pun.
 * Fungsi publik baru wajib masuk salah satu daftar; bila tidak, uji gagal.
 */
const assert = require('assert'), fs = require('fs'), path = require('path');
const { run } = require('../emulator/emu.js');
const SRC = path.resolve(__dirname, '../../src');
const API = ['doGet', 'include', 'apiBootstrap', 'apiNarratives', 'apiRef', 'apiGapeka26', 'apiGapeka', 'apiStatus', 'apiReportAssets', 'apiKaOps', 'apiBatubara', 'apiBatubaraPart', 'apiRhiSarana'];
const ADMIN = ['setupOtomatis', 'syncNow', 'installTrigger', 'showStatus', 'bersihkanSisaV2', 'ujiKondisiBq', 'syncBatubaraNow', 'syncRhiSaranaNow', 'diagnostikNow', 'jplOsmNow'];
const pub = [];
fs.readdirSync(SRC).filter(f => f.endsWith('.gs')).forEach(f => {
  for (const m of fs.readFileSync(path.join(SRC, f), 'utf8').matchAll(/^function ([A-Za-z0-9]+)\s*\(/gm)) if (!m[1].endsWith('_')) pub.push(m[1]);
});
const lain = pub.filter(n => API.indexOf(n) < 0 && ADMIN.indexOf(n) < 0);
assert.deepStrictEqual(lain, [], 'fungsi publik belum diklasifikasikan (API atau ADMIN): ' + lain.join(', '));
// anonim → admin ditolak
run('runSync_(true, "uji-akses")');
ADMIN.forEach(n => assert.throws(() => run(n + '()'), /pemilik skrip/, n + ' tidak menolak pemanggil anonim'));
// pemilik → diizinkan
process.env.EMU_USER = 'pemilik@contoh.id'; run('showStatus()'); assert.strictEqual(run('(function(){ syncNow(); return getStatus_().ok; })()'), true, 'syncNow pemilik gagal'); delete process.env.EMU_USER;
// anonim → API tidak melempar & memberi ok
['apiBootstrap', 'apiStatus', 'apiReportAssets'].forEach(n => assert.strictEqual(run(n + '().ok'), true, n));
assert.strictEqual(run('apiGapeka("1999").ok'), false); assert.strictEqual(run('apiGapeka("2025").ok'), true);
assert.strictEqual(run('apiNarratives("versi-lama").stale'), true);
assert.strictEqual(run('apiBatubaraPart("../x").ok'), false, 'apiBatubaraPart menerima nama tak dikenal'); assert.strictEqual(run('apiBatubaraPart("core").ok'), true);
// include: pola tertutup
assert.throws(() => run('include("../../etc")'), /tidak dikenal/);
assert.throws(() => run('include("Code")'), /tidak dikenal/);
console.log('LULUS — ' + pub.length + ' fungsi publik: ' + API.length + ' API terbuka, ' + ADMIN.length + ' fungsi editor menolak pemanggil anonim.');
