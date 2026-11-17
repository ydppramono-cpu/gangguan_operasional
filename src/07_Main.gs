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
  return HtmlService.createTemplateFromFile(name).evaluate().getContent();
}
