// ===========================================================
// user-locus-mapper.js — v3.3 (Fixed UI Placement)
// Συνδέει User Memory Palace με τη στήλη “Mnemonic Locus”
// και εμφανίζει οπτικό μήνυμα επιτυχίας ΜΟΝΟ κάτω από τα κουμπιά.
// ===========================================================

(() => {
  const TABLE_IDS = ["sanTable", "assocTable", "paoTable", "pao99Table", "verseTable"];
  const LOCUS_COL = 3; // 4η στήλη (0-based)

  // ---------------------------------------------------------
  // Ενημέρωση συγκεκριμένης στήλης (μόνο Mnemonic Locus)
  // ---------------------------------------------------------
  function updateLocusColumn(tableId, lociArray) {
    const table = document.getElementById(tableId);
    if (!table || !table.tBodies.length) return;

    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    if (!rows.length) return;

    rows.forEach(row => {
      if (row.cells[LOCUS_COL]) row.cells[LOCUS_COL].textContent = "";
    });

    lociArray.forEach((label, i) => {
      const row = rows[i];
      if (row && row.cells[LOCUS_COL]) {
        row.cells[LOCUS_COL].textContent = label;
      }
    });

    console.log(`✅ Locus column updated in #${tableId} with ${lociArray.length} loci`);
  }

  // ---------------------------------------------------------
  // Δημόσια συνάρτηση που καλείται μετά την επιλογή User Palace
  // ---------------------------------------------------------
  window.applyUserPalaceToTables = function(lociArray, palaceName = "Unnamed") {
    if (!Array.isArray(lociArray) || !lociArray.length) return;

    setTimeout(() => {
      TABLE_IDS.forEach(id => updateLocusColumn(id, lociArray));
      showPalaceInfo(palaceName, lociArray.length);
    }, 500);
  };

  // ---------------------------------------------------------
  // Οπτική επιβεβαίωση στο UI (ποτέ στην κορυφή σελίδας)
  // ---------------------------------------------------------
  function showPalaceInfo(palaceName, count) {
    let info = document.getElementById("activePalaceInfo");

    // Αν δεν υπάρχει, δημιουργείται μέσα στο userLibraryStatus
    if (!info) {
      info = document.createElement("div");
      info.id = "activePalaceInfo";
      info.style.cssText = `
        color:#CFAF4A;
        margin-top:6px;
        font-size:0.9em;
        font-family:Georgia, 'Times New Roman', serif;
      `;

      const container = document.getElementById("userLibraryStatus");
      if (container) container.appendChild(info);
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    info.innerHTML = `🏛️ <b>${palaceName}</b> — ${count} loci loaded 
                      <span style="color:#888;">(${now})</span>`;
  }
})();
