// ESLint (flat config) untuk Google Apps Script (.gs, V8) dan JavaScript di parsial HTML (HtmlService).
// GAS memakai satu ruang global untuk semua berkas .gs, dan semua <script> di halaman berbagi window —
// karena itu deklarasi tingkat atas dikumpulkan otomatis sebagai globals agar `no-undef` tetap menangkap salah ketik sungguhan.
const fs = require('fs');
const path = require('path');
const js = require('@eslint/js');
const html = require('eslint-plugin-html');
const globals = require('globals');

function topLevelNames(files, extraPatterns) {
  const names = {};
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const re of [/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm, /^(?:var|let|const)\s+([A-Za-z_$][\w$]*)/gm, ...extraPatterns]) {
      let m;
      while ((m = re.exec(s))) names[m[1]] = 'writable';
    }
  }
  return names;
}
const list = (dir, re) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)).map((f) => path.join(dir, f)) : []);
const gsFiles = [...list('src', /\.gs$/), ...list('platform', /\.gs$/)];
const htmlFiles = list('src', /\.html$/);

const GAS = Object.fromEntries(
  ['SpreadsheetApp', 'DriveApp', 'HtmlService', 'CacheService', 'PropertiesService', 'LockService', 'Utilities', 'Logger', 'ScriptApp',
    'Session', 'UrlFetchApp', 'ContentService', 'BigQuery', 'Drive', 'MailApp', 'GmailApp', 'CalendarApp', 'DocumentApp', 'SlidesApp', 'XmlService', 'Charts'
  ].map((n) => [n, 'readonly']));
const serverGlobals = topLevelNames(gsFiles, []);
const browserGlobals = {
  ...topLevelNames(htmlFiles, [/(?:root|window|globalThis)\.([A-Z][\w$]*)\s*=/g]),
  google: 'readonly', Alpine: 'readonly', echarts: 'readonly', Tabulator: 'readonly', ExcelJS: 'readonly', PptxGenJS: 'readonly',
  pptxgen: 'readonly', jspdf: 'readonly', jsPDF: 'readonly', html2canvas: 'readonly', XLSX: 'readonly', DecompressionStream: 'readonly'
};

const rules = {
  ...js.configs.recommended.rules,
  'no-unused-vars': ['warn', { vars: 'local', args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
  'no-redeclare': 'error',
  'no-implicit-globals': 'off',
  'no-empty': ['warn', { allowEmptyCatch: true }],
  'no-prototype-builtins': 'off',
  'no-useless-escape': 'warn',
  'no-cond-assign': ['error', 'except-parens'],
  eqeqeq: ['warn', 'smart'],
  'no-var': 'off'
};

module.exports = [
  { ignores: ['node_modules/**', 'dist/**', 'src/1[0-9]_Seed*.gs', 'src/2[0-9]_Seed*.gs', 'src/11_SeedJadwal.gs', 'src/13_AsetLaporan.gs', 'src/18_SeedPeta.gs', 'src/Ui.Logo.html'] },
  {
    files: ['src/**/*.gs', 'platform/**/*.gs'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'script', globals: { ...GAS, ...serverGlobals, console: 'readonly' } },
    rules: { ...rules, 'no-redeclare': ['error', { builtinGlobals: false }] }
  },
  {
    files: ['src/**/*.html'],
    plugins: { html },
    languageOptions: { ecmaVersion: 2020, sourceType: 'script', globals: { ...globals.browser, ...browserGlobals } },
    rules: { ...rules, 'no-redeclare': ['error', { builtinGlobals: false }] }
  },
  { files: ['eslint.config.js', 'tools/**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: globals.node }, rules }
];
