/* ===========================================================
   CMS v3.4 — SAN to Text js (with Loci support + MODAL UI)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- SAN → English text (βασική λογική, όπως πριν) ---------- */
  function sanToText(san) {
    if (!san) return "";
    if (san === "O-O") return "King Castles Short Side";
    if (san === "O-O-O") return "King Castles Long Side";

    const map = { N:"Knight", B:"Bishop", R:"Rook", Q:"Queen", K:"King" };
    let move = san.replace(/[+#?!]/g, "");
    let piece = map[move[0]] ? map[move[0]] : "Pawn";
    move = map[move[0]] ? move.slice(1) : move;

    const parts = move.split("x");
    const square = parts[parts.length - 1];
    const action = move.includes("x") ? "takes" : "moves to";

    return `${piece} ${action} ${square}`;
  }

  /* ============================================================
     SAN → Text MODAL (όπως το Epic modal, άλλα με SAN χρώματα)
     ============================================================ */

  // --- Δημιουργία modal DOM ---
  const sanModal = document.createElement("div");
  sanModal.id = "sanTextModal";
  sanModal.className = "san-modal-overlay";
  sanModal.innerHTML = `
    <div class="san-modal-content">
      <span class="san-close" id="sanTextCloseBtn">&times;</span>

      <div class="san-toolbar" id="sanTextToolbar">
        <button id="sanModeFullBtn">Full-move</button>
        <button id="sanModeHalfBtn" class="mode-active">Half-move</button>
        <button id="sanCopyBtn" class="primary">Copy</button>
        <button id="sanLociBtn">Loci: OFF</button>
      </div>

      <pre id="sanTextOut" class="san-text"></pre>
    </div>
  `;
  document.body.appendChild(sanModal);

// --- SAN-specific CSS (ίδια δομή με Epic modal, άλλα με SAN χρώματα) ---
const sanStyle = document.createElement("style");
sanStyle.textContent = `

#sanTextModal * {
    all: revert !important;
    box-sizing: border-box !important;
}

/* === RE-APPLY SAN styles μετά το reset === */

/* Overlay */
#sanTextModal.san-modal-overlay {
  display: none;
  position: fixed;
  z-index: 1050;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.5);
}

/* Modal box */
#sanTextModal .san-modal-content {
  background: #e9f4ff;
  margin: 40px auto;
  padding: 16px;
  border-radius: 8px;
  max-width: 850px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  font-family: system-ui, sans-serif;
  font-size: 15px;
}

/* Close button */
#sanTextModal .san-close {
  align-self: flex-end;
  font-size: 24px;
  cursor: pointer;
  margin-bottom: 8px;
  line-height: 1;
}

/* Toolbar */
#sanTextToolbar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
#sanTextToolbar button {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #888;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}
#sanTextToolbar button.primary {
  border-color: #c00;
  color: #c00;
  font-weight: bold;
}
#sanTextToolbar button.mode-active {
  background: #dbe9ff;
  border-color: #3a6edc;
}

/* Text area */
#sanTextOut.san-text {
  white-space: pre-wrap;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 6px;
  background: #ffffffcf;
  font-size: 15px;
  color: #000 !important;
  max-height: calc(90vh - 120px);
  overflow: auto;
  backdrop-filter: blur(2px);
}

/* Responsive */
@media (max-width: 768px) {
  #sanTextModal .san-modal-content {
    margin: 20px auto;
    padding: 12px;
  }
  #sanTextOut.san-text {
    max-height: calc(90vh - 110px);
  }
}
@media (max-width: 600px) {
  #sanTextModal .san-modal-content {
    margin: 10px auto;
    padding: 10px;
    width: 95%;
  }
  #sanTextOut.san-text {
    font-size: 16px;
  }
}

`;
document.head.appendChild(sanStyle);

  // --- State για modal λογική (mode / loci / payload) ---
  let sanMode = "half";
  let sanLociOn = false;
  let sanPayload = null;   // header + moves

  const sanOutEl   = document.getElementById("sanTextOut");
  const sanHalfBtn = document.getElementById("sanModeHalfBtn");
  const sanFullBtn = document.getElementById("sanModeFullBtn");
  const sanCopyBtn = document.getElementById("sanCopyBtn");
  const sanLociBtn = document.getElementById("sanLociBtn");
  const sanCloseBtn = document.getElementById("sanTextCloseBtn");

  /* --- Φτιάχνουμε payload (header + moves) όπως πριν --- */
  function buildSanPayload() {
    // PGN header
    const chess = new Chess();
    const pgnEl = document.getElementById("pgnText");
    if (pgnEl && pgnEl.value.trim()) {
      chess.load_pgn(pgnEl.value, { sloppy: true });
    }
    const H = chess.header();
    const event  = H["Event"]  || "";
    const date   = H["Date"]   || "";
    const white  = H["White"]  || "";
    const black  = H["Black"]  || "";
    const result = H["Result"] || "";

    let formatted = date;
    if (date.includes(".")) {
      const [y, m, d] = date.split(".");
      const js = new Date(`${y}-${m}-${d}`);
      if (!isNaN(js.getTime())) {
        formatted = js.toLocaleDateString("en-GB", {
          day:"numeric", month:"long", year:"numeric"
        });
      }
    }

    // Moves from gameMoves (όπως πριν)
    const moves = Array.isArray(gameMoves)
      ? gameMoves.map(m => ({
          san: m.san,
          side: m.side || ""
        }))
      : [];

    return {
      header: { event, white, black, date: formatted, result },
      moves
    };
  }

  /* --- Loci από sanBody (ίδιο concept, χωρίς window.opener πλέον) --- */
  function buildLociArrayFromTable() {
    const loci = [];
    try {
      const sanBody = document.getElementById("sanBody");
      if (!sanBody) return loci;
      const rows = sanBody.querySelectorAll("tr");
      rows.forEach(row => {
        const cells = row.children;
        const locusCell = cells && cells[3]; // 4η στήλη
        loci.push(locusCell ? locusCell.textContent.trim() : "");
      });
    } catch (e) {}
    return loci;
  }

  function sanToTextInner(s) {
    if (!s) return "";
    if (s === "O-O") return "King Castles Short Side";
    if (s === "O-O-O") return "King Castles Long Side";
    const map = { N:"Knight", B:"Bishop", R:"Rook", Q:"Queen", K:"King" };
    let move = s.replace(/[+#?!]/g, "");
    let piece = map[move[0]] ? map[move[0]] : "Pawn";
    move = map[move[0]] ? move.slice(1) : move;
    const parts = move.split("x");
    const sq = parts[parts.length - 1];
    const act = move.includes("x") ? "takes" : "moves to";
    return piece + " " + act + " " + sq;
  }

  function resultText(res) {
    if (res === "1-0") return "\n\nWhite wins.";
    if (res === "0-1") return "\n\nBlack wins.";
    if (res === "1/2-1/2") return "\n\nThe game is draw.";
    return "";
  }

  /* --- Χτίσιμο κειμένου (ίδιο με το popup script) --- */
  function buildSanText() {
    if (!sanPayload) return "";
    const h = sanPayload.header;
    const headerLine =
      (`"` + (h.event || "") + `"` + "\n " +
       (h.white || "") + " vs " + (h.black || "") + " \n " +
       (h.date || "")).trim();

    const moves = sanPayload.moves || [];
    const out = [];
    const lociArray = sanLociOn ? buildLociArrayFromTable() : [];

    if (sanMode === "half") {
      for (let i = 0; i < moves.length; i++) {
        const side = moves[i].side === "White" ? "White" : "Black";
        const locus = sanLociOn ? (lociArray[i] || "") : "";
        const prefix = locus ? "[" + locus + "] " : "";
        out.push(
          prefix +
          "Half-move " + (i + 1) + " (" + side + "): " +
          sanToTextInner(moves[i].san) + "."
        );
      }
    } else {
      for (let i = 0; i < moves.length; i += 2) {
        const full = (i / 2) + 1;
        const locusW = sanLociOn ? (lociArray[i]   || "") : "";
        const locusB = sanLociOn ? (lociArray[i+1] || "") : "";

        let block = "Move " + full + ".\n";
        if (moves[i]) {
          const prefixW = locusW ? "[" + locusW + "] " : "";
          block += "  " + prefixW + "White: " + sanToTextInner(moves[i].san) + ".\n";
        }
        if (moves[i+1]) {
          const prefixB = locusB ? "[" + locusB + "] " : "";
          block += "  " + prefixB + "Black: " + sanToTextInner(moves[i+1].san) + ".\n";
        }
        out.push(block.trim());
      }
    }

    return headerLine + "\n\n" + out.join("\n\n") + resultText(sanPayload.header.result);
  }

  function renderSanText() {
    if (!sanOutEl) return;
    sanOutEl.textContent = buildSanText();
  }

  /* --- Άνοιγμα modal (αντί για popup) --- */
  function openSanToTextModal() {
    if (!Array.isArray(gameMoves) || gameMoves.length === 0) {
      alert("Load a game first (Demo Games or Parse PGN).");
      return;
    }
    sanPayload = buildSanPayload();
    sanMode = "half";
    sanLociOn = false;

    if (sanHalfBtn && sanFullBtn && sanLociBtn) {
      sanHalfBtn.classList.add("mode-active");
      sanFullBtn.classList.remove("mode-active");
      sanLociBtn.textContent = "Loci: OFF";
    }

    renderSanText();
    sanModal.style.display = "block";
  }

  /* --- Event handlers για τα κουμπιά του modal --- */

  if (sanHalfBtn && sanFullBtn) {
    sanHalfBtn.onclick = () => {
      sanMode = "half";
      sanHalfBtn.classList.add("mode-active");
      sanFullBtn.classList.remove("mode-active");
      renderSanText();
    };
    sanFullBtn.onclick = () => {
      sanMode = "full";
      sanFullBtn.classList.add("mode-active");
      sanHalfBtn.classList.remove("mode-active");
      renderSanText();
    };
  }

  if (sanLociBtn) {
    sanLociBtn.onclick = () => {
      sanLociOn = !sanLociOn;
      sanLociBtn.textContent = sanLociOn ? "Loci: ON" : "Loci: OFF";
      renderSanText();
    };
  }

  if (sanCopyBtn) {
    sanCopyBtn.onclick = async () => {
      const txt = buildSanText();
      try {
        await navigator.clipboard.writeText(txt);
        sanCopyBtn.textContent = "Copied!";
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = txt; document.body.appendChild(ta);
        ta.select(); document.execCommand("copy");
        document.body.removeChild(ta);
        sanCopyBtn.textContent = "Copied (fallback)";
      }
      setTimeout(() => sanCopyBtn.textContent = "Copy", 1200);
    };
  }

  if (sanCloseBtn) {
    sanCloseBtn.onclick = () => {
      sanModal.style.display = "none";
    };
  }

  window.addEventListener("click", (ev) => {
    if (ev.target === sanModal) {
      sanModal.style.display = "none";
    }
  });

  /* ============================================================
     Insert button NEXT to Demo Games (Demo Style) — όπως πριν
     ============================================================ */

  const demoBtn = document.getElementById("demoGamesBtn");
  let sanBtn = null;

  if (demoBtn && demoBtn.parentNode) {
    sanBtn = document.createElement("button");
    sanBtn.id = "openSanToTextBtn";
    sanBtn.innerHTML = "SAN → Text";

    /* -- EXACT Demo Games Style -- */
    sanBtn.style.background = "white";
    sanBtn.style.color = "blue";
    sanBtn.style.border = "1px solid red";
    sanBtn.style.padding = "5px 12px";
    sanBtn.style.borderRadius = "4px";
    sanBtn.style.marginLeft = "10px";
    sanBtn.style.cursor = "pointer";
    sanBtn.style.fontSize = "12px";
    sanBtn.style.fontWeight = "bold";
    sanBtn.style.verticalAlign = "middle";
    sanBtn.style.transition = "background .18s";

    sanBtn.onmouseenter = ()=> sanBtn.style.background="#ffeaea";
    sanBtn.onmouseleave = ()=> sanBtn.style.background="white";

    sanBtn.disabled = true;
    sanBtn.style.opacity="0.5";
    sanBtn.style.cursor="not-allowed";

    demoBtn.parentNode.insertBefore(sanBtn, demoBtn.nextSibling);
    sanBtn.onclick = openSanToTextModal;
  }

  /* ============================================================
     Auto-enable when SAN table fills — όπως πριν
     ============================================================ */

  function enableSanButtonIfReady() {
    const sanBody = document.getElementById("sanBody");
    if (!sanBody || !sanBtn) return;

    const hasRows = sanBody.children.length > 0;

    sanBtn.disabled = !hasRows;
    sanBtn.style.opacity = hasRows ? "1" : "0.5";
    sanBtn.style.cursor  = hasRows ? "pointer" : "not-allowed";
  }

  const orig = window.renderAll;
  window.renderAll = function() {
    orig.apply(this, arguments);
    enableSanButtonIfReady();
  };

  setTimeout(enableSanButtonIfReady, 200);

});


