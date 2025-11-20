/* ===========================================================
   CMS v3.4 — SAN to Text js (with Loci support + MODAL UI)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- SAN → English text ---------- */
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
     MODAL DOM
  ============================================================ */

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
        <p class="tts-hint">Listen to the game with a TTS Tool (i.e. Read Aloud MSWord etc.)</p>
      </div>

      <pre id="sanTextOut" class="san-text"></pre>
    </div>
  `;
  document.body.appendChild(sanModal);

  /* ============================================================
     100% ISOLATED SAN MODAL CSS
  ============================================================ */

  const sanStyle = document.createElement("style");
  sanStyle.textContent = `

/* --- isolation ONLY on modal-content + pre (safe) --- */
#sanTextModal .san-modal-content,
#sanTextOut.san-text {
    all: revert;
    box-sizing: border-box !important;
}

/* --- Overlay --- */
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

/* --- Modal box --- */
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

/* --- Close button --- */
#sanTextModal .san-close {
  align-self: flex-end;
  font-size: 24px;
  cursor: pointer;
  margin-bottom: 8px;
  line-height: 1;
}

/* --- Toolbar --- */
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
  color: #000 !important;   /* ← ΑΥΤΟ μόνο χρειάζεται */
}

#sanTextToolbar button.primary {
  border-color: #c00;
  color: #c00 !important;
  font-weight: bold;
}

#sanTextToolbar button.mode-active {
  background: #dbe9ff;
  border-color: #3a6edc;
  color: #000 !important;
}

/* --- Text area --- */
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

/* --- Responsive --- */
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

.tts-hint {
  color: #000;
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

  `;
  document.head.appendChild(sanStyle);

  /* ============================================================
     LOGIC / STATE
  ============================================================ */

  let sanMode = "half";
  let sanLociOn = false;
  let sanPayload = null;

  const sanOutEl   = document.getElementById("sanTextOut");
  const sanHalfBtn = document.getElementById("sanModeHalfBtn");
  const sanFullBtn = document.getElementById("sanModeFullBtn");
  const sanCopyBtn = document.getElementById("sanCopyBtn");
  const sanLociBtn = document.getElementById("sanLociBtn");
  const sanCloseBtn = document.getElementById("sanTextCloseBtn");

  /* --- Build payload --- */
  function buildSanPayload() {
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

    const moves = Array.isArray(gameMoves)
      ? gameMoves.map(m => ({ san: m.san, side: m.side || "" }))
      : [];

    return {
      header: { event, white, black, date: formatted, result },
      moves
    };
  }

  function buildLociArrayFromTable() {
    const loci = [];
    try {
      const sanBody = document.getElementById("sanBody");
      if (!sanBody) return loci;
      const rows = sanBody.querySelectorAll("tr");
      rows.forEach(row => {
        const cells = row.children;
        const locusCell = cells && cells[3];
        loci.push(locusCell ? locusCell.textContent.trim() : "");
      });
    } catch(e) {}
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

  /* ============== HALF MODE ===========================*/
  if (sanMode === "half") {
    for (let i = 0; i < moves.length; i++) {
      const side = moves[i].side === "White" ? "White" : "Black";
      const locus = sanLociOn ? (lociArray[i] || "") : "";

      const prefix = locus
        ? `<span style="color:#b30000; font-weight:bold;">[${locus}]</span> `
        : "";

      out.push(
        `${prefix}Half-move ${i+1} (${side}): ${sanToTextInner(moves[i].san)}.`
      );
    }
  }

/*===================== FULL MODE ====================== */
else {
  for (let i = 0; i < moves.length; i += 2) {
    const full = (i/2) + 1;

    // ίδιο Loci για White και Black
    const locus = sanLociOn ? (lociArray[i/2] || "") : "";

    let block = `Move ${full}.\n`;

    if (moves[i]) {
      block += `  ${
        locus ? `<span style="color:#b30000; font-weight:bold;">[${locus}]</span> \n` : ""
      }  White: ${sanToTextInner(moves[i].san)}.\n`;
    }

if (moves[i+1]) {
  block += `  Black: ${sanToTextInner(moves[i+1].san)}.\n`;
}

    out.push(block.trim());
  }
}

    return headerLine + "\n\n" + out.join("\n\n") + resultText(h.result);
  }

function renderSanText() {
    sanOutEl.innerHTML = buildSanText();
}

  function openSanToTextModal() {
    if (!Array.isArray(gameMoves) || gameMoves.length === 0) {
      alert("Load a game first (Demo Games or Parse PGN).");
      return;
    }

    sanPayload = buildSanPayload();
    sanMode = "half";
    sanLociOn = false;

    sanHalfBtn.classList.add("mode-active");
    sanFullBtn.classList.remove("mode-active");
    sanLociBtn.textContent = "Loci: OFF";

    renderSanText();
    sanModal.style.display = "block";
  }

  /* ===================== Controls ===========================*/
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

  sanLociBtn.onclick = () => {
    sanLociOn = !sanLociOn;
    sanLociBtn.textContent = sanLociOn ? "Loci: ON" : "Loci: OFF";
    renderSanText();
  };

  sanCopyBtn.onclick = async () => {
    const txt = buildSanText();
    try {
      await navigator.clipboard.writeText(txt);
      sanCopyBtn.textContent = "Copied!";
    } catch(e) {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      sanCopyBtn.textContent = "Copied (fallback)";
    }
    setTimeout(() => sanCopyBtn.textContent = "Copy", 1200);
  };

  sanCloseBtn.onclick = () => {
    sanModal.style.display = "none";
  };

  window.addEventListener("click", (ev) => {
    if (ev.target === sanModal) sanModal.style.display = "none";
  });

  /* ============================================================
     Insert SAN→Text Button
  ============================================================ */

  const demoBtn = document.getElementById("demoGamesBtn");
  let sanBtn = null;

  if (demoBtn && demoBtn.parentNode) {
    sanBtn = document.createElement("button");
    sanBtn.id = "openSanToTextBtn";
    sanBtn.innerHTML = "SAN → Text";

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

    sanBtn.onmouseenter = () => sanBtn.style.background = "#ffeaea";
    sanBtn.onmouseleave = () => sanBtn.style.background = "white";

    sanBtn.disabled = true;
    sanBtn.style.opacity = "0.5";
    sanBtn.style.cursor = "not-allowed";

    demoBtn.parentNode.insertBefore(sanBtn, demoBtn.nextSibling);
    sanBtn.onclick = openSanToTextModal;
  }

  /* Auto-enable button */
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









