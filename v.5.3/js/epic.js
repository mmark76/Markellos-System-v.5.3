/* ================================
   Markellos CMS v5.3 — Epic Story (Half-Move Only)
   ================================= */

document.addEventListener("DOMContentLoaded", () => {

  // === Create Modal ===
  const epicSection = document.createElement("section");
  epicSection.id = "epicSection";
  const verseSection = document.getElementById("verseSection");
  const container = verseSection || document.querySelector(".layout-container");
  container.after(epicSection);

  const modal = document.createElement("div");
  modal.className = "epic-modal";
  modal.id = "epicModal";
  modal.innerHTML = `
    <div class="epic-modal-content">
      <span class="epic-close" id="epicCloseBtn">&times;</span>
      <div class="epic-copy-toolbar">
        <button id="copyEpicBtn" class="btn btn-primary">📋 Copy Story</button>
      </div>
      <div id="epicTextView" class="epic-text"></div>
    </div>
  `;
  document.body.appendChild(modal);

  /* ---------- Helpers ---------- */
  function sanToText(san) {
    if (!san) return "";
    if (san === "O-O") return "King Castle Short";
    if (san === "O-O-O") return "King Castle Long";

    const pieceMap = { N: "Knight", B: "Bishop", R: "Rook", Q: "Queen", K: "King" };
    let move = san.replace(/[+#?!]/g, "");
    let piece = pieceMap[move[0]] ? pieceMap[move[0]] : "pawn";
    move = pieceMap[move[0]] ? move.slice(1) : move;

    const [_, square] = move.split("x");
    const action = move.includes("x") ? "take" : " ";
    return `${piece} ${action} ${square || move}`.trim();
  }

  function cleanAnchor(txt) {
    if (!txt) return "";
    return txt.replace(/^\d+\s*—\s*/, "");
  }

  /* ---------- Epic Story Generator ---------- */
  function updateEpicText() {
    const tbody = document.querySelector(`#assocSection tbody`);
    if (!tbody) return;

    const rows = [...tbody.querySelectorAll("tr")];
    if (!rows.length) return;

    let stories = [];

    // === Half-move only: μία σκηνή ανά ημικίνηση ===
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const [_, san, anchor, locus, color, pieceAssoc, targetAssoc] =
        [...r.children].map(td => td.innerText.trim());
      if (!locus) continue;

      const anchorTxt = cleanAnchor(anchor);
      const sanText = sanToText(san);

const openings = [
  "Στη συνέχεια",
  "Έπειτα",
  "Κατόπιν",
  "Αμέσως μετά",
  "Λίγο αργότερα",
  "Την επόμενη στιγμή",
  "Μετά από λίγο",
  "Ξαφνικά"
];

const verbs = [
  "εμφανίζεται",
  "ξεπροβάλλει"
];

const opening = i === 0 ? "Η ιστορία μας ξεκινά όταν" : openings[i % openings.length];
const action = verbs[i % verbs.length];

// === let sceneNumber = i + 1; // αριθμός σκηνής
let phrase = `${opening}, ${pieceAssoc}, ${targetAssoc} και εκεί ${action} ${locus}.\n`; //===, με την κίνηση ${sanText} ===//
if (anchorTxt) phrase = `${anchorTxt}\n${phrase}`;

stories.push(phrase.trim());
}

    // === Combine Text ===
    const narrativeText = stories.join("\n\n\n");

    // === Game Info ===
    const chess = new Chess();
    chess.load_pgn(document.getElementById("pgnText").value, { sloppy: true });
    const headers = chess.header();

    const event = headers["Event"] || "";
    const date = headers["Date"] || "";
    const white = headers["White"] || "";
    const black = headers["Black"] || "";
    const result = headers["Result"] || "";

    const [y, m, d] = date.split(".");
    const formattedDate = new Date(`${y}-${m}-${d}`).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
    const gameHeader = `"${event}" \n ${white} vs ${black} \n ${formattedDate}`.trim();
    const prologue = `Ο Γέροντας παίρνει στα χέρια του με μεγάλη προσοχή ένα χοντρό βιβλίο και λέει στο μικρό σκακιστή ...\n Σήμερα θα μελετήσουμε τη μάχη ανάμεσα σε αυτούς τους δύο μεγάλους στρατηγούς, ... και ανοίγει το αρχαίο, πολύτιμο βιβλίο, μετροφυλλάει κάποιες σελίδες και ξεκινάει να διαβάζει...\n `;
    
    let finalMsg = "";
    if (result === "1-0") finalMsg = "\n … και μετά την τελευταία κίνηση, ο μαύρος Στρατηγός κατάλαβε πως η μάχη είχε κριθεί. Έσκυψε το κεφάλι του αργά, και δίνοντας το χέρι του στον αντίπαλο Στρατηγό, αποδέχτηκε με αξιοπρέπεια την ήττα ... και ο Γέροντας κλείνει το παλιό σκονισμένο βιβλίο ... και έτσι η παρτίδα έγινε ανάμνηση για πάντα στη μνήμη και γράφτηκε στην ιστορία.";
    else if (result === "0-1") finalMsg = "\n … και μετά την τελευταία κίνηση, ο λευκός Στρατηγός κατάλαβε πως η μάχη είχε κριθεί. Έσκυψε το κεφάλι του αργά, και δίνοντας το χέρι του στον αντίπαλο Στρατηγό, αποδέχτηκε με αξιοπρέπεια την ήττα ... και ο Γέροντας κλείνει το παλιό σκονισμένο βιβλίο ... και έτσι η παρτίδα έγινε ανάμνηση για πάντα στη μνήμη και γράφτηκε στην ιστορία.";
    else if (result === "1/2-1/2") finalMsg = "\n … και μετά την τελευταία κίνηση, οι δύο Στρατηγοί καταλαβαίνουν ότι κανείς δεν μπορεί να κερδίσει αυτή τη μάχη ... και έτσι δίνουν τα χέρια και η μάχη λήγει ισόπαλη ... και ο Γέροντας κλείνει το παλιό σκονισμένο βιβλίο ... και έτσι η παρτίδα έγινε ανάμνηση για πάντα στη μνήμη και γράφτηκε στην ιστορία.";

    const fullText = [gameHeader, prologue, narrativeText, finalMsg.trim()]  .filter(Boolean)  .join("\n\n");
    
     document.getElementById("epicTextView").innerText = fullText;

    // === Copy Button ===
    const copyBtn = document.getElementById("copyEpicBtn");
    if (copyBtn) {
      copyBtn.replaceWith(copyBtn.cloneNode(true));
      const freshBtn = document.getElementById("copyEpicBtn");
      freshBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(fullText);
          freshBtn.innerText = "✅ Copied!";
        } catch {
          const ta = document.createElement("textarea");
          ta.value = fullText;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          freshBtn.innerText = "✅ Copied (fallback)!";
        } finally {
          setTimeout(() => (freshBtn.innerText = "📋 Copy Story"), 1500);
        }
      });
    }
  }

  function openEpicModal() {
    updateEpicText();
    modal.style.display = "block";
  }

  // === Button & Modal Logic ===
  const assocSection = document.getElementById("assocSection");
  let assocBtnDiv = null;
  if (assocSection) {
    assocBtnDiv = document.createElement("div");
    assocBtnDiv.className = "table-toolbar";
    assocBtnDiv.innerHTML = `<button id="openEpicBtnTop" class="btn btn-primary">Show Epic Story</button>`;
    assocBtnDiv.style.display = "none";
    assocSection.parentNode.insertBefore(assocBtnDiv, assocSection);
    document.getElementById("openEpicBtnTop").addEventListener("click", openEpicModal);
  }

  const tableSelect = document.getElementById("tableSelect");
  if (tableSelect && assocBtnDiv) {
    tableSelect.addEventListener("change", (e) => {
      assocBtnDiv.style.display = e.target.value === "assocSection" ? "block" : "none";
    });
  }

  document.getElementById("epicCloseBtn").addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });
});

















































