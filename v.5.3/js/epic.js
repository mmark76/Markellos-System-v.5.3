/* =========================
   Markellos CMS v5.3 — Epic Narrative (Heroic Epic with White+Black pair scenes)
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // ➤ Δημιουργία Epic Narrative section
  const epicSection = document.createElement("section");
  epicSection.id = "epicSection";
  epicSection.innerHTML = `
    <h2>Epic Narrative</h2>
    <div class="table-toolbar">
      <button id="openEpicBtn">Show Epic history</button>
    </div>
    <div class="table-wrapper">
      <textarea id="epicText" rows="28" style="width:100%;font-size:15px;line-height:1.6;"></textarea>
      <br>
      <select id="epicDownloadSelect" class="download-select">
        <option value="">Download as…</option>
        <option value="txt">TXT</option>
      </select>
    </div>
  `;

  // ➤ Modal για αφήγηση
  const modal = document.createElement("div");
  modal.className = "epic-modal";
  modal.id = "epicModal";
  modal.innerHTML = `
    <div class="epic-modal-content">
      <span class="epic-close" id="epicCloseBtn">&times;</span>
      <div id="epicTextView" class="epic-text"></div>
    </div>
  `;

  const verseSection = document.getElementById("verseSection");
  const container = verseSection || document.querySelector(".layout-container");
  container.after(epicSection);
  document.body.appendChild(modal);

  /* ---------- Βοηθητική για Associations ---------- */
  function buildEpicSentence(locus, colorW, pieceAssocW, sanW, targetAssocW,
                             colorB, pieceAssocB, sanB, targetAssocB, anchor) {
    const templates = [
      `${locus} όπου ο λευκός στρατός με ${pieceAssocW}, και την κίνηση ${sanW}, φτάνει ${targetAssocW}, και τότε ο μαύρος στρατός με ${pieceAssocB} αντιδρά, με την κίνηση ${sanB} και μπαίνει ${targetAssocB}.`,
      `${locus} όπου ο λευκός στρατός με ${pieceAssocW}, και την κίνηση ${sanW}, μπαίνει ${targetAssocW}, ενώ ο μαύρος στρατός με ${pieceAssocB} απαντά, με την κίνηση ${sanB}, και εισέρχεται ${targetAssocB}.`,
      `${locus} όπου ο λευκός στρατός με ${pieceAssocW}, και την κίνηση ${sanW}, εισέρχεται ${targetAssocW}, αλλά ο μαύρος στρατός με ${pieceAssocB} αντάποκρίνεται, με την κίνηση ${sanB} και αφήνει τα ίχνη του ${targetAssocB}.`,
      `${locus} όπου ο λευκός στρατός με ${pieceAssocW}, και την κίνηση ${sanW}, κινείται ${targetAssocW}, αλλά ο μαύρος στρατός με ${pieceAssocB} αντιδρά, με την κίνηση ${sanB}, και μπαίνει ${targetAssocB}.`
    ];
    let sentence = templates[Math.floor(Math.random() * templates.length)];

    if (anchor) {
      const verbs = [
        "Και τότε ξεπροβάλλει",
        "Και τότε εμφανίζεται",
        "Και τότε φανερώνεται",
      ];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      sentence += ` ${verb} ${anchor}.`;
    }

    return sentence;
  }

  /* ---------- Δημιουργία Επικής Αφήγησης ---------- */
  function updateEpicText() {
    const choice = document.getElementById("tableSelect")?.value || "sanSection";
    const tbody = document.querySelector(`#${choice} tbody`);
    if (!tbody) return;

    const rows = [...tbody.querySelectorAll("tr")];
    if (rows.length === 0) return;

    let stories = [];

    if (choice === "assocSection") {
      // 🔹 Associations → δένουμε ζευγάρια κινήσεων
      for (let i = 0; i < rows.length; i += 2) {
        const w = rows[i], b = rows[i + 1];
        if (!w || !b) break;

        const [numW, sanW, locusW, anchorW, colorW, pieceAssocW, targetAssocW] =
          [...w.children].map(td => td.innerText.trim());
        const [numB, sanB, locusB, anchorB, colorB, pieceAssocB, targetAssocB] =
          [...b.children].map(td => td.innerText.trim());

        const locus = locusW || locusB || "σκηνή";
        const anchor = anchorW || anchorB || "";

        let sentence = buildEpicSentence(
          locus, colorW, pieceAssocW, sanW, targetAssocW,
          colorB, pieceAssocB, sanB, targetAssocB, anchor
        );

        stories.push(sentence);
      }
    } else if (choice === "sanSection") {
      stories = rows.map(row => {
        const [num, san, locus, anchor, color, piece, target] =
          [...row.children].map(td => td.innerText.trim());
        return `${locus || 'σκηνή'}, εκεί όπου δεσπόζει το ${target}, ο ${color} ${piece} εκτελεί την κίνηση ${san}. ${anchor ? 'Και τότε φανερώνεται ' + anchor + '.' : ''}`;
      });
    } else if (choice === "paoSection") {
      stories = rows.map(row => {
        const [num, san, locus, anchor, color, code, pao] =
          [...row.children].map(td => td.innerText.trim());
        return `${locus || 'πεδίο'}, ο ${color} προχωρά με την κίνηση ${san}. Ο κωδικός ${code} ξεκλειδώνει εικόνα: ${pao}. ${anchor ? 'Και τότε ξεπροβάλλει ' + anchor + '.' : ''}`;
      });
    } else if (choice === "pao99Section") {
      stories = rows.map(row => {
        const [num, san, locus, anchor, color, code, pao] =
          [...row.children].map(td => td.innerText.trim());
        return `${locus || 'σκηνή'}, η πλήρης κίνηση ${num} (${san}) γεννά τον κωδικό ${code}, που μετουσιώνεται σε ${pao}. ${anchor ? 'Και τότε φανερώνεται ' + anchor + '.' : ''}`;
      });
    } else if (choice === "verseSection") {
      stories = rows.map(row => {
        const [num, san, locus, anchor, color, verse] =
          [...row.children].map(td => td.innerText.trim());
        return `${locus || 'σκηνή'}, ο ${color} εκτελεί ${san}, κι απόηχος συνοδεύεται από στίχο: «${verse}». ${anchor ? 'Και τότε εμφανίζεται ' + anchor + '.' : ''}`;
      });
    }

    const text = stories.join("\n\n");
    const ta = document.getElementById("epicText");
    const view = document.getElementById("epicTextView");
    if (ta) ta.value = text;
    if (view) view.textContent = text;
  }

  /* ---------- Hook στο renderAll ---------- */
  const oldRenderAll = window.renderAll;
  if (typeof oldRenderAll === "function") {
    window.renderAll = function () {
      oldRenderAll();
      updateEpicText();
    };
  }

  /* ---------- Ανανέωση σε αλλαγές ---------- */
  document.getElementById("tableSelect")?.addEventListener("change", updateEpicText);
  document.getElementById("pao99CollectionSelect")?.addEventListener("change", updateEpicText);

  /* ---------- Κατεβάσματα ---------- */
  document.getElementById("epicDownloadSelect").addEventListener("change", e => {
    const format = e.target.value;
    const text = document.getElementById("epicText").value;
    if (!text) return;
    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "epic_narrative.txt");
    } else if (format === "pdf") {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const lines = doc.splitTextToSize(text, 180);
      doc.setFont("Roboto-Regular", "normal");
      doc.setFontSize(12);
      doc.text(lines, 15, 20);
      doc.save("epic_narrative.pdf");
    }
    e.target.value = "";
  });

  /* ---------- Modal open/close ---------- */
  document.getElementById("openEpicBtn").addEventListener("click", () => {
    updateEpicText();
    document.getElementById("epicModal").style.display = "block";
  });
  document.getElementById("epicCloseBtn").addEventListener("click", () => {
    document.getElementById("epicModal").style.display = "none";
  });
  window.addEventListener("click", e => {
    if (e.target?.id === "epicModal") {
      document.getElementById("epicModal").style.display = "none";
    }
  });
});




















