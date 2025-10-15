/* ================================
   Markellos CMS v5.3 — Epic Story 
   ================================= */

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
    if (san === "O-O") return "ροκέ μικρό";
    if (san === "O-O-O") return "ροκέ μεγάλο";

    const pieceMap = { N: "Ίππος", B: "Αξιωματικός", R: "Πύργος", Q: "Βασίλισσα", K: "Βασιλιάς" };
    let move = san.replace(/[+#?!]/g, "");
    let piece = pieceMap[move[0]] ? pieceMap[move[0]] : "στρατιώτης";
    move = pieceMap[move[0]] ? move.slice(1) : move;

    const [_, square] = move.split("x");
    const action = move.includes("x") ? "αιχμαλωτίζει στο" : "πηγαίνει στο";
    return `${piece} ${action} ${square || move}`.trim();
  }

  function cleanAnchor(txt) {
    if (!txt) return "";
    return txt.replace(/^\d+\s*—\s*/, "");
  }

  function buildEpicSentence(locus, colorW, pieceAssocW, sanW, targetAssocW,
                             colorB, pieceAssocB, sanB, targetAssocB, anchor) {
    const verbsW = ["εμφανίζεται", "ξεπροβάλλει", "φαίνεται", "αποκαλύπτεται"];
    const verbsB = ["αντικρούει", "ορμά", "σηκώνεται", "αντανακλά"];
    const links = ["Και σαν απάντηση", "Και σαν ανταπάντηση", "Και σαν αντίδραση", "Και σαν αντίλαλος"];

    const vW = verbsW[Math.floor(Math.random() * verbsW.length)];
    const vB = verbsB[Math.floor(Math.random() * verbsB.length)];
    const link = links[Math.floor(Math.random() * links.length)];

    let sentence = `${locus} ${vW} ${pieceAssocW}, και με την κίνηση ${sanW}, ${targetAssocW}. ${link}, ${pieceAssocB} ${vB}, και με την κίνηση ${sanB}, ${targetAssocB}.`;
    if (anchor) sentence += ` Και τότε ξάφνου μπροστά τους παρουσιάζεται ${anchor}.`;
    return sentence;
  }

  /* ---------- Δημιουργία Επικής Αφήγησης ---------- */
  function updateEpicText() {
    const tbody = document.querySelector(`#assocSection tbody`);
    if (!tbody) return;

    const rows = [...tbody.querySelectorAll("tr")];
    if (rows.length === 0) return;

    const isHalf = (window.locusMode === "half");
    let stories = [];

    if (isHalf) {
      // === Ημικίνηση: κάθε γραμμή ανεξάρτητη ===
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const [_, san, anchor, locus, color, pieceAssoc, targetAssoc] =
          [...r.children].map(td => td.innerText.trim());
        if (!locus) continue;

        const anchorTxt = cleanAnchor(anchor);
        const sanText = sanToText(san);
        const phrase = `${anchorTxt ? anchorTxt + " — " : ""}${locus}: ο ${color} ${pieceAssoc} ${sanText}, στο ${targetAssoc}.`;
        stories.push(phrase);
      }

    } else {
      // === Πλήρης Κίνηση: Λευκός + Μαύρος ===
      for (let i = 0; i < rows.length; i += 2) {
        const w = rows[i], b = rows[i + 1];
        if (!w || !b) break;

        const [_, sanW, anchorW, locusW, colorW, pieceAssocW, targetAssocW] =
          [...w.children].map(td => td.innerText.trim());
        const [__, sanB, anchorB, locusB, colorB, pieceAssocB, targetAssocB] =
          [...b.children].map(td => td.innerText.trim());

        const locus = locusW || locusB || "σκηνή";
        const anchor = cleanAnchor(anchorW || anchorB || "");
        const sW = sanToText(sanW);
        const sB = sanToText(sanB);

        stories.push(buildEpicSentence(locus, colorW, pieceAssocW, sW, targetAssocW,
                                       colorB, pieceAssocB, sB, targetAssocB, anchor));
      }
    }

    // === Ενοποιημένο Κείμενο ===
    const narrativeText = stories.join("\n\n");

    // === Game Info ===
    const chess = new Chess();
    chess.load_pgn(document.getElementById("pgnText").value, { sloppy: true });
    const headers = chess.header();

    const event = (headers["Event"] || "").trim();
    const date = headers["Date"] || "";
    const white = headers["White"] || "";
    const black = headers["Black"] || "";
    const result = headers["Result"] || "";

    const [y, m, d] = date.split(".");
    const formattedDate = new Date(`${y}-${m}-${d}`).toLocaleDateString("el-GR", {
      day: "numeric", month: "long", year: "numeric"
    });
    const gameHeader = `${event}\n${white} vs ${black}\n${formattedDate}`.trim();

    let finalMsg = "";
    if (result === "1-0") finalMsg = "…και με την τελευταία κίνηση, ο Λευκός κερδίζει.";
    else if (result === "0-1") finalMsg = "…και με την τελευταία κίνηση, ο Μαύρος κερδίζει.";
    else if (result === "1/2-1/2") finalMsg = "…και η παρτίδα λήγει ισόπαλη.";

    const fullText = [gameHeader, narrativeText, finalMsg.trim()].filter(Boolean).join("\n\n");
    document.getElementById("epicTextView").innerText = fullText;

    // === Αντιγραφή ===
    const copyBtn = document.getElementById("copyEpicBtn");
    if (copyBtn) {
      copyBtn.replaceWith(copyBtn.cloneNode(true));
      const freshBtn = document.getElementById("copyEpicBtn");
      freshBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(fullText);
          freshBtn.innerText = "✅ Copied!";
        } catch (err) {
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
