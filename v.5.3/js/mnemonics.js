/* ================================
   Markellos CMS v5.3 — Mnemonics v3.3 Viewer
   Uses same CSS classes as Epic modal (epic-*)
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ---- CONFIG ----
  const LIBRARIES_JSON_URL = "libraries_v3.3.json"; // ίδιο directory με το js

  // ---- SECTION / CONTAINER ----
  const mnemonicSection = document.createElement("section");
  mnemonicSection.id = "mnemonicSection";
  const verseSection = document.getElementById("verseSection");
  const container = verseSection || document.querySelector(".layout-container");
  (container || document.body).after(mnemonicSection);

  // ---- MODAL (ίδιο CSS με Epic) ----
  const modal = document.createElement("div");
  modal.className = "epic-modal";              // reuse epic CSS
  modal.id = "mnemonicModal";
  modal.innerHTML = `
    <div class="epic-modal-content">
      <span class="epic-close" id="mnemonicCloseBtn">&times;</span>

      <div class="epic-copy-toolbar" style="gap:.5rem; display:flex; flex-wrap:wrap; align-items:center">
        <label for="mnLibrarySelect"><strong>Library:</strong></label>
        <select id="mnLibrarySelect" class="btn">
          <option value="T1">Temporal • T1 (64 loci)</option>
          <option value="T2">Temporal • T2 (10 concepts)</option>
          <option value="S1">Spatial • S1 (a1–g8)</option>
          <option value="C1">Characters • C1 (pieces)</option>
        </select>

        <input id="mnSearch" type="search" placeholder="Φίλτρο…" style="padding:.4rem .6rem; min-width:180px" />

        <button id="copyMnBtn" class="btn btn-primary">📋 Copy mnemonics</button>
      </div>

      <div id="mnemonicTextView" class="epic-text" style="white-space:pre-wrap; line-height:1.5"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // ---- STATE ----
  let libs = null;  // θα κρατά ολόκληρο το JSON
  let currentViewKey = "T1"; // default
  let lastRenderedText = ""; // για copy

  // ---- HELPERS ----
  const orderSquares = (a, b) => {
    // a1..g8 -> κατά file (a..g) μετά rank (1..8)
    const fileOrder = "abcdefgh";
    const fa = fileOrder.indexOf(a[0]);
    const fb = fileOrder.indexOf(b[0]);
    if (fa !== fb) return fa - fb;
    return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
  };

  const renderLibrary = (key, filter = "") => {
    if (!libs) return;
    currentViewKey = key;

    let items = [];
    let title = "";
    if (key === "T1") {
      const map = libs?.Temporal?.LibraryT1 || {};
      title = "Temporal • LibraryT1";
      items = Object.keys(map)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(k => ({ k, el: map[k].el, en: map[k].en }));
    } else if (key === "T2") {
      const map = libs?.Temporal?.LibraryT2 || {};
      title = "Temporal • LibraryT2";
      items = Object.keys(map)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(k => ({ k, el: map[k].el, en: map[k].en }));
    } else if (key === "S1") {
      const map = libs?.Spatial?.LibraryS1 || {};
      title = "Spatial • LibraryS1";
      items = Object.keys(map)
        .sort(orderSquares)
        .map(k => ({ k, el: map[k].el, en: map[k].en }));
    } else if (key === "C1") {
      const map = libs?.Characters?.LibraryC1 || {};
      title = "Characters • LibraryC1";
      items = Object.keys(map)
        .sort() // αλφαβητικά από τα codes (Pa2, Nb1, …)
        .map(k => ({ k, el: map[k] })); // εδώ υπάρχει μόνο ελληνικό string
    }

    // Φίλτρο
    const q = (filter || "").trim().toLowerCase();
    if (q) {
      items = items.filter(it =>
        (it.k + " " + (it.el || "") + " " + (it.en || "")).toLowerCase().includes(q)
      );
    }

    // Απόδοση ως κείμενο + λίγο HTML για αναγνωσιμότητα
    const lines = [];
    let html = `<h3 style="margin:.2rem 0 1rem 0">${title}${q ? ` — φίλτρο: “${filter}”` : ""}</h3><ul style="padding-left:1.2rem">`;
    for (const it of items) {
      if (key === "C1") {
        const line = `${it.k}: ${it.el}`;
        lines.push(line);
        html += `<li><strong>${it.k}</strong>: ${it.el}</li>`;
      } else {
        const line = `${it.k}. ${it.el}${it.en ? " (" + it.en + ")" : ""}`;
        lines.push(line);
        html += `<li><strong>${it.k}</strong>. ${it.el}${it.en ? ` <em>(${it.en})</em>` : ""}</li>`;
      }
    }
    html += "</ul>";

    lastRenderedText = lines.join("\n");
    document.getElementById("mnemonicTextView").innerHTML = html;
  };

  const ensureLoadedAndRender = async () => {
    if (!libs) {
      try {
        const resp = await fetch(LIBRARIES_JSON_URL, { cache: "no-store" });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        libs = await resp.json();
      } catch (err) {
        document.getElementById("mnemonicTextView").innerHTML =
          `<div style="color:#b00"><strong>Σφάλμα φόρτωσης βιβλιοθήκης:</strong> ${String(err)}</div>`;
        return;
      }
    }
    const sel = document.getElementById("mnLibrarySelect");
    renderLibrary(sel?.value || currentViewKey, document.getElementById("mnSearch")?.value || "");
  };

  // ---- OPEN/CLOSE ----
  function openMnemonicModal() {
    ensureLoadedAndRender();
    modal.style.display = "block";
  }
  document.getElementById("mnemonicCloseBtn").addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });

  // ---- BUTTON (ίδια λογική εμφάνισης με Epic/assocSection) ----
  const assocSection = document.getElementById("assocSection");
  let assocBtnDiv = null;
  const createButton = () => {
    assocBtnDiv = document.createElement("div");
    assocBtnDiv.className = "table-toolbar";
    assocBtnDiv.innerHTML = `<button id="openMnemonicBtnTop" class="btn btn-primary">Show Mnemonic Images v3.3</button>`;
    assocBtnDiv.style.display = "none";
    (assocSection?.parentNode || mnemonicSection).insertBefore(assocBtnDiv, assocSection || mnemonicSection);
    document.getElementById("openMnemonicBtnTop").addEventListener("click", openMnemonicModal);
  };
  createButton();

  const tableSelect = document.getElementById("tableSelect");
  if (tableSelect && assocBtnDiv) {
    // Εμφάνισε το κουμπί μόνο όταν είναι επιλεγμένο το assocSection
    const toggle = () => (assocBtnDiv.style.display = tableSelect.value === "assocSection" ? "block" : "none");
    tableSelect.addEventListener("change", toggle);
    toggle();
  } else {
    // Αν δεν υπάρχει tableSelect/assocSection, δείξε το κουμπί από προεπιλογή
    assocBtnDiv.style.display = "block";
  }

  // ---- EVENTS: select / search / copy ----
  document.getElementById("mnLibrarySelect").addEventListener("change", () => ensureLoadedAndRender());
  document.getElementById("mnSearch").addEventListener("input", () => ensureLoadedAndRender());

  document.getElementById("copyMnBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(lastRenderedText || "");
      document.getElementById("copyMnBtn").innerText = "✅ Copied!";
    } catch {
      const ta = document.createElement("textarea");
      ta.value = lastRenderedText || "";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      document.getElementById("copyMnBtn").innerText = "✅ Copied (fallback)!";
    } finally {
      setTimeout(() => (document.getElementById("copyMnBtn").innerText = "📋 Copy mnemonics"), 1500);
    }
  });
});
window.addEventListener("load", () => {
  const tableSelect = document.getElementById("tableSelect");
  if (tableSelect) {
    tableSelect.addEventListener("change", () => {
      if (tableSelect.value === "assocSection") {
        document.getElementById("openMnemonicBtnTop").style.display = "block";
      }
    });
  }
});
