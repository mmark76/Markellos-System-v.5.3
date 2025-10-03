/* =========================
   Markellos CMS v5.6 — The Epic Story 
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // ➤ Δημιουργία Epic Narrative section (άδειο)
  const epicSection = document.createElement("section");
  epicSection.id = "epicSection";
  epicSection.innerHTML = ``;
  const verseSection = document.getElementById("verseSection");
  const container = verseSection || document.querySelector(".layout-container");
  container.after(epicSection);

  // ➤ Modal για αφήγηση
  const modal = document.createElement("div");
  modal.className = "epic-modal";
  modal.id = "epicModal";
  modal.innerHTML = `
    <div class="epic-modal-content">
      <span class="epic-close" id="epicCloseBtn">&times;</span>

      <!-- 🔹 Στοιχεία Παρτίδας -->
      <div id="gameInfo" class="epic-game-info">
        <h3>Παρτίδα</h3>
      </div>

      <!-- 🔹 Κουμπί Copy -->
      <div class="epic-copy-toolbar">
        <button id="copyEpicBtn" class="btn btn-primary">📋 Copy Story</button>
      </div>

      <!-- 🔹 Κείμενο Αφήγησης -->
      <div id="epicTextView" class="epic-text"></div>

      <!-- 🔹 Τελικό Μήνυμα -->
      <div id="gameConclusion" class="epic-conclusion" style="margin-top:15px;font-weight:bold;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  /* ---------- SAN σε φυσική γλώσσα (μόνο για το έπος) ---------- */
  function sanToText(san) {
    if (!san) return "";

    const pieceMap = { N: "Knight", B: "Bishop", R: "Rook", Q: "Queen", K: "King" };
    let move = san.replace(/[+#?!]/g, ""); // βγάζει +, #, ?!, κτλ
    let piece = "";
    let action = "";
    let square = "";

    // Αν ξεκινά με γράμμα κομματιού
    if (pieceMap[move[0]]) {
      piece = pieceMap[move[0]];
      move = move.slice(1);
    } else {
      piece = "pawn";
    }

    // Αν έχει capture
    if (move.includes("x")) {
      action = "takes";
      square = move.split("x")[1];
    } else {
      action = "to";
      square = move;
    }

    return `${piece} ${action} ${square}`;
  }

  /* ---------- Καθάρισμα Anchor μόνο για το Έπος ---------- */
  function cleanAnchor(txt) {
    if (!txt) return "";
    return txt.replace(/^\d+\s*—\s*/, ""); // βγάζει "7 — " μπροστά
  }

  /* ---------- Βοηθητική για Associations ---------- */
  function buildEpicSentence(locus, colorW, pieceAssocW, sanW, targetAssocW,
                             colorB, pieceAssocB, sanB, targetAssocB, anchor) {
    const templates = [
      `${locus} όπου βλέπει το λευκό στρατό με ${pieceAssocW}, και την κίνηση ${sanW}, και να ${targetAssocW}, ... και το μαύρο στρατό με ${pieceAssocB} να αντιδρά, με την κίνηση ${sanB}, και να ${targetAssocB}.`
    ];
    let sentence = templates[Math.floor(Math.random() * templates.length)];

    if (anchor) {
      const verbs = ["Και τότε ξεπροβάλλει", "Και τότε εμφανίζεται", "Και τότε φανερώνεται"];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      sentence += ` ${verb} ${anchor}.`;
    }

    return sentence;
  }

  /* ---------- Δημιουργία Επικής Αφήγησης ---------- */
  function updateEpicText() {
    const choice = "assocSection"; // ✅ πάντα Associations
    const tbody = document.querySelector(`#${choice} tbody`);
    if (!tbody) return;

    const rows = [...tbody.querySelectorAll("tr")];
    if (rows.length === 0) return;

    let stories = [];

    for (let i = 0; i < rows.length; i += 2) {
      const w = rows[i], b = rows[i + 1];
      if (!w || !b) break;

      const [numW, sanW, locusW, anchorW, colorW, pieceAssocW, targetAssocW] =
        [...w.children].map(td => td.innerText.trim());
      const [numB, sanB, locusB, anchorB, colorB, pieceAssocB, targetAssocB] =
        [...b.children].map(td => td.innerText.trim());

      const locus = locusW || locusB || "σκηνή";
      const anchor = cleanAnchor(anchorW || anchorB || ""); // ✨ καθάρισμα εδώ

      let sentence = buildEpicSentence(
        locus,
        colorW, pieceAssocW, sanToText(sanW), targetAssocW,
        colorB, pieceAssocB, sanToText(sanB), targetAssocB, anchor
      );

      stories.push(sentence);
    }

    const narrativeText = stories.join("\n\n");

    // ➤ Στο modal
    document.getElementById("epicTextView").innerText = narrativeText;

    // ➤ Ενημέρωση στοιχείων παρτίδας με ΟΛΑ τα headers
    const chess = new Chess();
    chess.load_pgn(document.getElementById("pgnText").value, { sloppy: true });
    const headers = chess.header();

    const gameInfoDiv = document.getElementById("gameInfo");
    gameInfoDiv.innerHTML = "<h3>Παρτίδα</h3>";

    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        const p = document.createElement("p");
        p.innerText = `${key}: ${headers[key]}`;
        gameInfoDiv.appendChild(p);
      }
    }

    // ➤ Τελικό μήνυμα
    let finalMsg = "";
    if (headers.Result === "1-0") {
      finalMsg = "Και με την τελευταία κίνηση, ο Λευκός κερδίζει.";
    } else if (headers.Result === "0-1") {
      finalMsg = "Και με την τελευταία κίνηση, ο Μαύρος κερδίζει.";
    } else if (headers.Result === "1/2-1/2") {
      finalMsg = "Η παρτίδα έληξε ισόπαλη.";
    }
    document.getElementById("gameConclusion").innerText = finalMsg;
  }

  // ➤ Κοινή συνάρτηση για άνοιγμα modal
  function openEpicModal() {
    updateEpicText();
    modal.style.display = "block";
  }

  // ➤ Κουμπί Show Epic Story (πάνω από Association, αρχικά κρυφό)
  const assocSection = document.getElementById("assocSection");
  let assocBtnDiv = null;
  if (assocSection) {
    assocBtnDiv = document.createElement("div");
    assocBtnDiv.className = "table-toolbar";
    assocBtnDiv.innerHTML = `<button id="openEpicBtnTop" class="btn btn-primary">Show Epic Story</button>`;
    assocBtnDiv.style.display = "none"; // κρυφό στην αρχή
    assocSection.parentNode.insertBefore(assocBtnDiv, assocSection);

    document.getElementById("openEpicBtnTop").addEventListener("click", openEpicModal);
  }

  // ➤ Toggle κουμπιού ανάλογα με το dropdown
  const tableSelect = document.getElementById("tableSelect");
  if (tableSelect && assocBtnDiv) {
    tableSelect.addEventListener("change", (e) => {
      if (e.target.value === "assocSection") {
        assocBtnDiv.style.display = "block";  // δείξε κουμπί
      } else {
        assocBtnDiv.style.display = "none";   // κρύψε κουμπί
      }
    });
  }

  // ➤ Κλείσιμο modal
  document.getElementById("epicCloseBtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // ➤ Copy Epic Story button
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "copyEpicBtn") {
      const storyText = document.getElementById("epicTextView").innerText;
      navigator.clipboard.writeText(storyText).then(() => {
        e.target.innerText = "✅ Copied!";
        setTimeout(() => {
          e.target.innerText = "📋 Copy Story";
        }, 1500);
      });
    }
  });
});
