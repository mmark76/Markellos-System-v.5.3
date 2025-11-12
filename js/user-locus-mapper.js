// user-locus-mapper.js
(() => {
  // IDs των 5 πινάκων (προσάρμοσέ τα αν διαφέρουν)
  const TABLE_IDS = ["sanTable", "assocTable", "paoTable", "pao99Table", "verseTable"];
  const LOCUS_COL = 3; // 4η στήλη (0-based)

  function updateLocusColumn(tableId, lociArray) {
    const table = document.getElementById(tableId);
    if (!table || !table.tBodies.length) return;
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);

    // Καθαρισμός ΜΟΝΟ της 4ης στήλης
    rows.forEach(row => {
      if (row.cells[LOCUS_COL]) row.cells[LOCUS_COL].textContent = "";
    });

    // Γέμισμα με νέα loci
    lociArray.forEach((label, i) => {
      let row = rows[i];
      if (!row) {
        row = tbody.insertRow();
        // εξασφαλίζουμε ότι υπάρχουν τουλάχιστον 4 κελιά
        while (row.cells.length <= LOCUS_COL) row.insertCell();
      }
      row.cells[LOCUS_COL].textContent = label;
    });

    console.log(`✅ Locus column updated in #${tableId} with ${lociArray.length} loci`);
  }

  // Δημόσια συνάρτηση για κλήση μετά την επιλογή user palace
  window.applyUserPalaceToTables = function(lociArray) {
    if (!Array.isArray(lociArray) || !lociArray.length) return;
    TABLE_IDS.forEach(id => updateLocusColumn(id, lociArray));
  };
})();

document.body.insertAdjacentHTML(
  "afterbegin",
  `<div style="text-align:center;color:#CFAF4A;margin:6px 0;font-size:0.9em;">
     ✅ Loaded ${lociArray.length} Mnemonic Loci from User Memory Palace
   </div>`
);
