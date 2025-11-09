/* ================================================
   Markellos CMS v5.3 — Epic Story (Half-Move Only)
   ================================================ */

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
  document.getElementById("epicTextView").classList.add("parchment","edge");

  /* ---------- Helpers ---------- */
  function sanToText(san) {
    if (!san) return "";
    if (san === "O-O") return "King Castles Short Side";
    if (san === "O-O-O") return "King Castles Long Side";

    const pieceMap = { N: "Knight", B: "Bishop", R: "Rook", Q: "Queen", K: "King" };
    let move = san.replace(/[+#?!]/g, "");
    let piece = pieceMap[move[0]] ? pieceMap[move[0]] : "Pawn";
    move = pieceMap[move[0]] ? move.slice(1) : move;

    const [_, square] = move.split("x");
    const action = move.includes("x") ? "take" : "moves to";
    return `${piece} ${action} ${square || move}`.trim();
  }

  function cleanAnchor(txt) {
    if (!txt) return "";
    return txt.replace(/^\d+\s*—\s*/, "");
  }

  function getSquare(san) {
    if (!san) return "";
    const match = san.match(/([a-h][1-8])$/);
    return match ? match[1] : "";
}
   
  /* ---------- Epic Story Generator ---------- */
  function updateEpicText() {
    const tbody = document.querySelector(`#assocSection tbody`);
    if (!tbody) return;

    const rows = [...tbody.querySelectorAll("tr")];
    if (!rows.length) return;

    let stories = [];

// === Half-move only: one scene per half-move ===
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  
// εδώ αλλάζουμε τα ονόματα των μεταβλητών
  const [_, san, anchor, en, text, color, pieceAssoc, storyText] =
    [...r.children].map(td => td.innerText.trim());

  // text αντί για targetSquare
  const square = text || getSquare(san);
  
  // en αντί για locus / locus_en
  if (!en) continue;
  const anchorTxt = cleanAnchor(anchor);
  const sanText = sanToText(san);

  const openings = [
    "Then, the action unfolds",
    "A little later, the action continues",
    "After a while, the scene shifts",
  ];

  const verbs = [
    "appears",
    "emerges",
    "can be seen"
  ];

  const opening = i === 0 ? "A trumpet sounds, and the battle begins" : openings[i % openings.length];
  const action = verbs[i % verbs.length];

  let sceneNumber = i + 1;
  const t1Header = `Half-move ${sceneNumber}. ${sanText}.\n`;
  let phrase = `${t1Header}- ${opening} in the area of ${square}, and ${en} ${action}. Then, ${pieceAssoc}, ${storyText}.`;
  if (anchorTxt) phrase = `${anchorTxt} ${phrase}`;

  stories.push(phrase.trim());
}

// === Combine Text ===
const narrativeText = stories.join("\n\n");

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

const prologue = `♟. "The old man calmly takes in his hands the large book of historic chess battles and says to the young chess player...\n\n Today we shall study a very interesting battle. He opens the cover, turns a few pages, and begins to read...\n\n ... it was late in the afternoon when the two Generals shook hands, and after the signal was given, the battle began..."`;

let finalMsg = "";
if (result === "1-0") finalMsg = "\n … and after the final move, the Black General understood that the battle was lost. He lowered his head slowly and, offering his hand to his opponent with dignity, accepted defeat. The old man closes the thick book. The game becomes memory, yet forever engraved in history.";
else if (result === "0-1") finalMsg = "\n … and after the final move, the White General understood that the battle was lost. He lowered his head slowly and, offering his hand to his opponent with dignity, accepted defeat. The old man closes the thick book. The game becomes memory, yet forever engraved in history.";
else if (result === "1/2-1/2") finalMsg = "\n … and after the final move, the two Generals understood that neither could claim victory. They shook hands, and the battle ended in a draw. The Elder closes the thick book. The game becomes memory, yet forever engraved in history.";

const fullText = [gameHeader, prologue, narrativeText, finalMsg.trim()]
  .filter(Boolean)
  .join("\n\n");

const textView = document.getElementById("epicTextView");

// Μετατροπή σε παραγράφους
    const htmlText = fullText
      .split(/\n{2,}/)
      .map(p => `<p>${p.replace(/\n/g, " ")}</p>`)
      .join("");

    // Εμφάνιση μορφοποιημένου κειμένου
    textView.innerText = fullText;

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



