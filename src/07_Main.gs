/**
 * 07_Main.gs — titik masuk web app dan perangkai berkas HTML modular.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Gangguan Operasional · KAI')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Dipakai di HTML: <?!= include('Css.Tokens'); ?> — dievaluasi sebagai template agar include bisa bertingkat. */
function include(name) {
  // Dipanggil template server; bila dipanggil browser, hanya nama parsial baku yang diterima (daftar pola tertutup).
  if (!/^(?:Index|(?:Css|Ui|Js|View|Part)\.[A-Za-z0-9]+)$/.test(String(name))) throw new Error('Parsial tidak dikenal.');
  return HtmlService.createTemplateFromFile(name).evaluate().getContent();
}
