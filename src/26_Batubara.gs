/**
 * 26_Batubara.gs — data ruang kerja Batubara (Papan skenario GAPEKA).
 * Parameter prasarana, siklus rangkaian, WTT dan dinasan awak dari salinan baca Database_KA_Batubara_Sumsel_v3.2
 * (27_SeedBatubara.gs, dibangkitkan tools/batubara/build_bb_seed.py). Jadwal KA memakai GAPEKA aplikasi (apiGapeka).
 * DB Batubara tidak ditulis; tab REAL_GANGGUAN tidak dibaca (gangguan memakai Gangguan_Induk aplikasi ini).
 */

/**
 * Parameter Papan skenario GAPEKA. Tanpa masukan dari browser.
 * @return {{ok: boolean, gz: string}}
 */
function apiBatubara() {
  return guard_(function () {
    if (typeof SEED_BB_GZ === 'undefined' || !SEED_BB_GZ) throw new Error('Data Batubara tidak tersedia.');
    return { ok: true, gz: SEED_BB_GZ };
  });
}
