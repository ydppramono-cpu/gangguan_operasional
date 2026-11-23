/**
 * 00_Config.gs — semua angka, ID, dan aturan yang boleh diubah tanpa menyentuh logika.
 * Ubah di sini, lalu jalankan `syncNow()` dari editor agar snapshot dihitung ulang.
 */
var CONFIG = {
  APP_NAME: 'Dashboard Gangguan Operasional',
  APP_VERSION: '3.18.0',
  SCHEMA: 15,                 // naik bila bentuk snapshot berubah → pemicu membangun ulang otomatis

  // Sumber data (ID spreadsheet). Bisa ditimpa lewat Script Properties dengan nama yang sama.
  SOURCE_SPREADSHEET_ID: '1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM',
  SOURCE_SHEET: 'Gangguan_Induk',
  GAPEKA_SPREADSHEET_ID: '15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI',
  GAPEKA_SHEETS: { ka: 'LIST KA', stasiun: 'LIST STASIUN', petak: 'LIST PETAK JALAN' },
  SARANA_SPREADSHEET_ID: '115j4MRjEKeUkKULyGGhF2pQ4l_OSGhnyBYmZE-pqSc0',
  // Master tambahan (dibuat otomatis saat sinkron pertama bila kosong): M_JPL, M_JADWAL.
  EXTRA_SPREADSHEET_ID: '',
  EXTRA_SHEETS: { jpl: 'M_JPL', jadwal: 'M_JADWAL', ops: 'M_STASIUN_OPS', depo: 'M_DEPO_KA', ruj: 'M_RUJUKAN', koreksi: 'M_KOREKSI' },

  // Versi aturan. Naikkan bila aturan klasifikasi diubah; tercetak di setiap ekspor.
  RULE_VERSION: 'K5-2026.11',
  COMPONENT_RULE_VERSION: 'KOMP-2',

  // Ambang yang dipakai laporan bulanan.
  THRESHOLD_HEAVY_MIN: 120,   // scorecard "kejadian >= 120 menit"
  THRESHOLD_TOP_MIN: 234,     // Top 3 "kejadian >= 234 menit"
  SMALL_BASE: 30,             // di bawah ini delta diberi label "basis kecil"
  AGE_WARN_YEARS: 30,         // sarana berusia > 30 tahun diberi peringatan
  JPL_MATCH_KM: 0.5,          // kejadian dikaitkan ke JPL bila petak sama dan selisih KM <= 0,5 km

  // Eksposur indikatif (laporan Agustus/September 2026). BELUM divalidasi Finance.
  RATE_PER_HOUR: { PENUMPANG: 12534652, BARANG: 64178958 },

  // Sinkronisasi: pemicu memeriksa perubahan tiap N menit (akun gmail.com: total pemicu 90 menit/hari).
  SYNC_EVERY_MINUTES: 15,

  CACHE_PREFIX: 'KAI3:'
};

/** Nama kolom Gangguan_Induk yang dibaca (dicari berdasarkan judul, bukan posisi). */
var SOURCE_COLUMNS = {
  kode: 'Kode laporan', tanggal: 'Tanggal kejadian', hari: 'Hari', bulan: 'Bulan', tahun: 'Tahun',
  kategori: 'Kategori gangguan', sub: 'Subgangguan', jenisSarana: 'Jenis sarana', noSarana: 'Nomor sarana',
  wilayah: 'Wilayah kejadian', depo: 'Depo induk', judul: 'Judul gangguan', jam: 'Jam mulai',
  stasiun: 'Stasiun', petak: 'Petak jalan', km: 'Kilometer', ket: 'Keterangan kejadian',
  ka: 'Nomor kereta api terkait', menit: 'Total Andil Kelka (menit)', sumber: 'Sumber data',
  kunci: 'Kunci asal', kualitas: 'Status kualitas', penyebab: 'Penyebab terlapor', tindak: 'Tindak lanjut terlapor'
};
/** Kolom opsional (tidak wajib ada). */
var SOURCE_COLUMNS_OPT = { tanggalKejadian: 'Tanggal kejadian' };

/**
 * Aturan 4 kelas K5-2026.11 — SAMA dengan pipeline laporan Claude (standar_pelaporan_gangguan, keputusan 3 & 5 Nov 2026).
 * Urutan: (1) Kategori gangguan; (2) awalan Subgangguan; (3) sisanya Operasional.
 * Kategori & Subgangguan kosong → kelas diturunkan (v3.19, keputusan 24 Nov 2026): pola teks tegas (Domain.classifyTextSrc),
 * bila tidak ada → kelas terdekat menurut kemiripan kata (Domain.classNearest). Selalu bertanda * dan berketerangan keyakinan.
 */
var CLASS_BY_KATEGORI = { 'alam': 'alam', 'sarana': 'sarana', 'jalan & jembatan': 'prasarana', 'sintelis': 'prasarana', 'prasarana': 'prasarana', 'laa': 'prasarana' };
var CLASS_RULES = [
  { kelas: 'operasional', sub: /^pengendalian\b/i,
    catatan: 'Pengendalian WKP (termasuk yang melebihi waktu) = Operasional.' },
  { kelas: 'alam', sub: /^(alam\s*-|pohon tumbang|banjir|longsor|gempa)/i },
  { kelas: 'sarana', sub: /^(lokomotif|kereta|gerbong|pembangkit|krd|krl|kci|gangguan tenaga lemah|gangguan roda gerbong)\b/i,
    catatan: 'Awalan KCI (pintu/engine/genset KRL) = Sarana.' },
  { kelas: 'prasarana', sub: /^(jalan rel|jembatan|persinyalan|wesel|laa|komunikasi|gangguan rel patah|gangguan goyangan keras)/i,
    catatan: '"Jalan Rel/Jembatan – waktu perawatan melebihi waktu" = Prasarana.' }
  // Sisanya: operasional (default).
];

var CLASS_META = {
  operasional: { label: 'Operasional, pelayanan & keamanan', short: 'Operasional', color: '#0F766E' },
  sarana: { label: 'Sarana', short: 'Sarana', color: '#275BC0' },
  alam: { label: 'Alam', short: 'Alam', color: '#B45309' },
  prasarana: { label: 'Prasarana', short: 'Prasarana', color: '#64748B' },
  belum: { label: 'Belum terkelas (kategori kosong, teks tidak tegas)', short: 'Belum terkelas', color: '#9AA3B2' }
};

/** Jenis kejadian perlintasan sebidang (urutan = prioritas pencocokan ke Subgangguan). */
var CROSSING_RULES = [
  { id: 'temper', label: 'Tertemper kendaraan & sepeda motor', re: /tertemper kendaraan/i },
  { id: 'mogok', label: 'Kendaraan mogok di perlintasan', re: /kendaraan mogok di perlintasan/i },
  { id: 'palang', label: 'Palang perlintasan tertabrak', re: /palang pintu perlintasan/i },
  { id: 'pejabat', label: 'Rombongan pejabat melintas', re: /pejabat/i },
  { id: 'ramai', label: 'Perlintasan ramai kendaraan', re: /perlintasan ramai/i }
];
/** Temperan yang bukan perlintasan (dipisah, sesuai laporan). */
var TEMPER_OTHER_RE = /tertemper (orang|hewan)|tertemper peralatan|tertemper material/i;

/** Kelompok komponen sarana dari teks Subgangguan (kata kunci, versi KOMP-2 — diselaraskan dengan laporan Okt 2026):
 *  governor (termasuk governor kompresor) = mesin; generator, control valve & master controller = kelistrikan & kontrol;
 *  "per" hanya sebagai kata utuh (bukan "wiper"/"boper"); suling lokomotif masuk "Lainnya". */
var COMPONENT_RULES = [
  { id: 'tenaga', label: 'Tenaga lemah (gejala)', re: /tenaga lemah|tenaga hilang/i },
  { id: 'dingin', label: 'Pendinginan', re: /radiator|kipas|pendingin|suhu air|cooling/i },
  { id: 'mesin', label: 'Mesin & bahan bakar', re: /fuel pump|bahan bakar|turbo|pelumas|diesel|engine|mesin|governor|injektor|oli/i },
  { id: 'listrik', label: 'Kelistrikan & kontrol', re: /elektrik|listrik|komputer|ground power|ground control|micro ?master|kontrol|controller|control valve|generator|siv|aki|baterai|setk|kabel/i },
  { id: 'rem', label: 'Rem & pneumatik', re: /rem|pengereman|angin|kompresor|automatic brake|pipa/i },
  { id: 'roda', label: 'Roda, bogie & perangkai', re: /roda|\bas\b|aspot|bogie|perangkai|coupler|alat perangkai|safety hanger|\bper\b|pegas/i },
  { id: 'traksi', label: 'Traksi & transmisi', re: /traksi|pembalik arah|transmisi|gearbox/i },
  { id: 'fasilitas', label: 'Pintu, AC & fasilitas', re: /pintu|\bac\b|toilet|lampu|fasilitas/i },
  { id: 'keselamatan', label: 'Keselamatan & perangkat', re: /deadman|speedometer|radio|locotrack|kaca|wiper/i }
];

/** Jenis sarana dari catalog_profile Referensi Sarana (SAP). */
var FLEET_KIND = {
  CPLK01: 'Lokomotif', CPKR01: 'Kereta', CPGB01: 'Gerbong', CPKL01: 'KRL', CPKD01: 'KRD', CPKDE01: 'KRDE',
  CPKH01: 'Kereta khusus', CPKLRT01: 'LRT', MPJR01: 'Mesin perawatan jalan rel', KAUKUR01: 'Kereta ukur'
  // BYFAS / BANGDIS = fasilitas & gedung → bukan sarana, tidak dihitung di armada.
};

var MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var MONTH_KEYS = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, jun: 6, jul: 7, agu: 8, ags: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };

/** Ambil nilai konfigurasi; Script Properties menimpa nilai bawaan. */
function cfg_(key) {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(key);
    if (v !== null && v !== '') return v;
  } catch (e) { /* di luar GAS (uji) */ }
  return CONFIG[key];
}
