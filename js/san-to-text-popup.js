/* ============================================================
   Markellos CMS v3.3 — SAN to Text (Middle Panel, Demo Style)
   Centered popup, light-blue background, half/full move modes,
   and final result ("White wins", "Black wins", "The game is draw")
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

  /* ---------- Popup (centered, with numbering modes & result) ---------- */
  function openSanToTextPopup() {
    if (!Array.isArray(gameMoves) || gameMoves.length === 0) {
      alert("Load a game first (Demo Games or Parse PGN).");
      return;
    }

    /* --- Extract PGN header info --- */
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

    /* --- Moves payload --- */
    const payload = {
      header: { event, white, black, date: formatted, result },
      moves: gameMoves.map(m => ({
        san: m.san,
        side: m.side || ""
      }))
    };

    const payloadJson = JSON.stringify(payload).replace(/</g, "\\u003c");

    /* --- Center the popup --- */
    const popupWidth = 850;
    const popupHeight = 600;

    const dualLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualTop  = window.screenTop  !== undefined ? window.screenTop  : window.screenY;
    const W = window.innerWidth  || document.documentElement.clientWidth;
    const Ht = window.innerHeight || document.documentElement.clientHeight;

    const left = dualLeft + (W - popupWidth) / 2;
    const top  = dualTop  + (Ht - popupHeight) / 2;

    const win = window.open(
      "",
      "sanToTextPopup",
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (!win) {
      alert("Popup blocked. Allow popups.");
      return;
    }

    try { win.moveTo(left, top); } catch(e){}

    /* --- POPUP CONTENT --- */
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SAN to Text</title>

        <style>
          body {
            font-family: system-ui, sans-serif;
            padding: 16px;
            margin: 0;
            background: #e9f4ff;   /* light blue */
          }
          .toolbar {
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }
          button {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid #888;
            background: #fff;
            cursor: pointer;
            font-size: 13px;
          }
          button.primary {
            border-color: #c00;
            color: #c00;
            font-weight: bold;
          }
          button.mode-active {
            background: #dbe9ff;
            border-color: #3a6edc;
          }
          pre {
            white-space: pre-wrap;
            border: 1px solid #ccc;
            padding: 12px;
            border-radius: 6px;
            background: #ffffffcf;
            backdrop-filter: blur(2px);
            max-height: calc(100vh - 90px);
            overflow: auto;
            box-sizing: border-box;
          }
        </style>
      </head>

      <body>
        <div class="toolbar">
          <button id="modeHalfBtn" class="mode-active">Number: 1 half-move</button>
          <button id="modeFullBtn">Number: 2 full-move</button>
          <button id="copyBtn" class="primary">Copy</button>
        </div>

        <pre id="out"></pre>

        <script>
          const payload = ${payloadJson};

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
            if (res === "1-0") return "\\n\\nWhite wins.";
            if (res === "0-1") return "\\n\\nBlack wins.";
            if (res === "1/2-1/2") return "\\n\\nThe game is draw.";
            return "";
          }

          function buildText(mode) {
            const h = payload.header;
            const headerLine =
              ('"' + (h.event||'') + '"\\n ' +
               (h.white||'') + ' vs ' + (h.black||'') + ' \\n ' +
               (h.date||'')).trim();

            const moves = payload.moves;
            const out = [];

            if (mode === "half") {
              for (let i=0;i<moves.length;i++){
                out.push("Half-move " + (i+1) + ". " + sanToTextInner(moves[i].san) + ".");
              }
            } else {
              for (let i=0;i<moves.length;i+=2){
                const full = (i/2)+1;
                let block = "Move " + full + ".\\n";
                if (moves[i])   block += "  White: " + sanToTextInner(moves[i].san) + ".\\n";
                if (moves[i+1]) block += "  Black: " + sanToTextInner(moves[i+1].san) + ".\\n";
                out.push(block.trim());
              }
            }

            return headerLine + "\\n\\n" + out.join("\\n\\n") + resultText(payload.header.result);
          }

          let mode="half";
          const outEl = document.getElementById("out");
          const halfBtn = document.getElementById("modeHalfBtn");
          const fullBtn = document.getElementById("modeFullBtn");
          const copyBtn = document.getElementById("copyBtn");

          function render(){ outEl.textContent = buildText(mode); }

          halfBtn.onclick = () => {
            mode="half";
            halfBtn.classList.add("mode-active");
            fullBtn.classList.remove("mode-active");
            render();
          };
          fullBtn.onclick = () => {
            mode="full";
            fullBtn.classList.add("mode-active");
            halfBtn.classList.remove("mode-active");
            render();
          };

          copyBtn.onclick = async () => {
            const txt = buildText(mode);
            try {
              await navigator.clipboard.writeText(txt);
              copyBtn.textContent="Copied!";
            } catch(e){
              const ta=document.createElement("textarea");
              ta.value=txt; document.body.appendChild(ta);
              ta.select(); document.execCommand("copy");
              document.body.removeChild(ta);
              copyBtn.textContent="Copied (fallback)";
            }
            setTimeout(()=>copyBtn.textContent="Copy",1200);
          };

          render();
        <\/script>

      </body>
      </html>
    `);

    win.document.close();
  }

  /* ============================================================
     Insert button NEXT to Demo Games (Demo Style)
     ============================================================ */

  const demoBtn = document.getElementById("demoGamesBtn");
  let sanBtn = null;

  if (demoBtn && demoBtn.parentNode) {
    sanBtn = document.createElement("button");
    sanBtn.id = "openSanToTextBtn";
    sanBtn.innerHTML = "SAN → Text";

    /* -- EXACT Demo Games Style -- */
    sanBtn.style.background = "white";
    sanBtn.style.color = "red";
    sanBtn.style.border = "1px solid red";
    sanBtn.style.padding = "6px 12px";
    sanBtn.style.borderRadius = "4px";
    sanBtn.style.marginLeft = "10px";
    sanBtn.style.cursor = "pointer";
    sanBtn.style.fontSize = "14px";
    sanBtn.style.fontWeight = "bold";
    sanBtn.style.verticalAlign = "middle";
    sanBtn.style.transition = "background .18s";

    sanBtn.onmouseenter = ()=> sanBtn.style.background="#ffeaea";
    sanBtn.onmouseleave = ()=> sanBtn.style.background="white";

    sanBtn.disabled = true;
    sanBtn.style.opacity="0.5";
    sanBtn.style.cursor="not-allowed";

    demoBtn.parentNode.insertBefore(sanBtn, demoBtn.nextSibling);
    sanBtn.onclick = openSanToTextPopup;
  }

  /* ============================================================
     Auto-enable when SAN table fills
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

