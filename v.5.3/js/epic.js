/* =====================================================
   Markellos CMS v5.8 — Epic Story
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // === Δημιουργία Modal Epic Story ===
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

  /* ---------- SAN σε φυσική γλώσσα ---------- */
  function sanToText(san) {
    if (!san) return "";
    if (san === "O-O") return "King castles short";
    if (san === "O-O-O") return "King castles long";

    const pieceMap = { N: "Knight", B: "Bishop", R: "Rook", Q: "Queen", K: "King" };
    let move = san.replace(/[+#?!]/g, "");
    let piece = pieceMap[move[0]] ? pieceMap[move[0]] : "pawn";
    move = pieceMap[move[0]] ? move.slice(1) : move;

    const [_, square] = move.split("x");
    const action = move.includes("x") ? "takes" : "";
    return `${piece} ${action} ${square || move}`.trim();
  }

  function cleanAnchor(txt) {
    if (!txt) return "";
    return txt.replace(/^\d+\s*—\s*/, "");
  }

  function buildEpicSentence(locus, colorW, pieceAssocW, sanW, targetAssocW,
                             colorB, pieceAssocB, sanB, targetAssocB, anchor) {
    const templates = [
      `${locus} όπου βλέπει ${pieceAssocW}, που με την κίνηση ${sanW}, ${targetAssocW} ... . Λίγο μετά βλέπει ${pieceAssocB} να αντιδρά ..., ο οποίος με την κίνηση ${sanB}, ${targetAssocB}.`
    ];
    let sentence = templates[Math.floor(Math.random() * templates.length)];

    if (anchor) {
      const verbs = ["Και τότε μπροστά του εμφανίζεται", "Και τότε μπροστά του ξεπροβάλλει", "Και τότε από μακριά αναδύεται"];
      sentence += ` ${verbs[Math.floor(Math.random() * verbs.length)]} ${anchor}.`;
    }
    return sentence;
  }

  /* ---------- Δημιουργία Επικής Αφήγησης ---------- */
  function updateEpicText() {
    const tbody = document.querySelector(`#assocSection tbody`);
    if (!tbody) return;

    const rows = [...tbody.querySelectorAll("tr")];
    if (rows.length === 0) return;

    let stories = [];
    for (let i = 0; i < rows.length; i += 2) {
      const w = rows[i], b = rows[i + 1];
      if (!w || !b) break;

      const [_, sanW, locusW, anchorW, colorW, pieceAssocW, targetAssocW] =
        [...w.children].map(td => td.innerText.trim());
      const [__, sanB, locusB, anchorB, colorB, pieceAssocB, targetAssocB] =
        [...b.children].map(td => td.innerText.trim());

      const locus = locusW || locusB || "σκηνή";
      const anchor = cleanAnchor(anchorW || anchorB || "");

      stories.push(
        buildEpicSentence(
          locus,
          colorW, pieceAssocW, sanToText(sanW), targetAssocW,
          colorB, pieceAssocB, sanToText(sanB), targetAssocB, anchor
        )
      );
    }

    // === Ενοποιημένο Κείμενο ===
    const narrativeText = stories.join("\n\n");

    // === Game Info (ως πρόλογος) ===
    const chess = new Chess();
    chess.load_pgn(document.getElementById("pgnText").value, { sloppy: true });
    const headers = chess.header();

    const event = headers["Event"] || "";
    const date = headers["Date"] || "";
    const white = headers["White"] || "";
    const black = headers["Black"] || "";
    const result = headers["Result"] || "";

    const gameHeader = `${event}\n${white} εναντίον ${black}\n${date}`.trim();

    // === Τελική φράση ===
    let finalMsg = "";
    if (result === "1-0") {
      finalMsg = "…και με την τελευταία κίνηση, ο Λευκός κερδίζει.";
    } else if (result === "0-1") {
      finalMsg = "…και με την τελευταία κίνηση, ο Μαύρος κερδίζει.";
    } else if (result === "1/2-1/2") {
      finalMsg = "…και με την τελευταία κίνηση, οι αντίπαλοι συμφωνούν να λήξει η παρτίδα ισόπαλη.";
    }

    const fullText = [gameHeader, narrativeText, `${finalMsg} (${result})`.trim()]
      .filter(Boolean)
      .join("\n\n");

    document.getElementById("epicTextView").innerText = fullText;

    // === Copy Story (απλό, σταθερό, ενιαίο) ===
    const copyBtn = document.getElementById("copyEpicBtn");
    if (copyBtn) {
      copyBtn.replaceWith(copyBtn.cloneNode(true));
      const freshBtn = document.getElementById("copyEpicBtn");

      freshBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(fullText);
          freshBtn.innerText = "✅ Copied!";
        } catch (err) {
          console.error("Copy failed:", err);
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

  // === Κουμπί Show Epic Story ===
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





