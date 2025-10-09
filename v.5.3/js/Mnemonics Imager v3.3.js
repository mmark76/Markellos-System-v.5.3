/* ======================================================
   Markellos CMS v5.3 — Mnemonics Imager v3.3
   Synthesizes mnemonic "images" (White→Locus→Black)
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const LIBRARIES_JSON_URL = "libraries_v3.3.json";

  // === Modal Setup (reuse Epic CSS) ===
  const modal = document.createElement("div");
  modal.className = "epic-modal";
  modal.id = "mnemonicImagerModal";
  modal.innerHTML = `
    <div class="epic-modal-content">
      <span class="epic-close" id="mnemonicImagerCloseBtn">&times;</span>
      <div class="epic-copy-toolbar" style="display:flex; gap:.6rem; align-items:center; flex-wrap:wrap;">
        <button id="createImagesBtn" class="btn btn-primary">🧠 Create Mnemonic Images</button>
        <button id="copyImagesBtn" class="btn btn-secondary">📋 Copy</button>
      </div>
      <div id="mnemonicImagerView" class="epic-text parchment edge" 
           style="white-space:pre-wrap; line-height:1.7; font-size:16px;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const openModal = () => (modal.style.display = "block");
  const closeModal = () => (modal.style.display = "none");
  document.getElementById("mnemonicImagerCloseBtn").onclick = closeModal;
  window.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  // === Button integration near assocSection ===
  const assocSection = document.getElementById("assocSection");
  if (assocSection) {
    const div = document.createElement("div");
    div.className = "table-toolbar";
    div.innerHTML = `<button id="openMnemonicImagerBtn" class="btn btn-primary">
        🧩 Show Mnemonic Imager</button>`;
    assocSection.parentNode.insertBefore(div, assocSection);
    document.getElementById("openMnemonicImagerBtn").onclick = openModal;
  }

  // === Load libraries ===
  let libs = null;
  async function loadLibs() {
    if (libs) return libs;
    const r = await fetch(LIBRARIES_JSON_URL);
    if (!r.ok) throw new Error(`Cannot load ${LIBRARIES_JSON_URL}`);
    libs = await r.json();
    console.log("✅ libraries_v3.3.json loaded", libs);
    return libs;
  }

  // === Helper lookups ===
  const fromC1 = key => libs?.Characters?.LibraryC1?.[key] || key;
  const fromS1 = key => libs?.Spatial?.LibraryS1?.[key]?.el || key;
  const fromT1 = idx => libs?.Temporal?.LibraryT1?.[String(idx)]?.el || `Locus ${idx}`;

  // === Core function: build scene text ===
  function buildScene({ pieceW, squareW, movePair, squareB, pieceB }) {
    const locus = fromT1(movePair); // locus by move-pair
    const elW = fromC1(pieceW);
    const elB = fromC1(pieceB);
    const locW = fromS1(squareW);
    const locB = fromS1(squareB);

    return `Στη σκηνή ${movePair} — ${locus}
ο ${elW} από ${locW}
συναντά, στο ${locB},
τον ${elB}.`;
  }

  // === Create Mnemonic Images ===
  async function createImages() {
    await loadLibs();

    const tbody = document.querySelector("#assocSection tbody");
    if (!tbody) {
      document.getElementById("mnemonicImagerView").innerText = 
        "❌ Δεν βρέθηκε πίνακας association (assocSection).";
      return;
    }

    const rows = [...tbody.querySelectorAll("tr")];
    if (rows.length === 0) {
      document.getElementById("mnemonicImagerView").innerText = 
        "❌ Ο πίνακας association είναι άδειος.";
      return;
    }

    const scenes = [];
    for (let i = 0; i < rows.length; i += 2) {
      const w = rows[i], b = rows[i + 1];
      if (!w || !b) continue;

      const [_, sanW, locusW, anchorW, colorW, pieceW, squareW] =
        [...w.children].map(td => td.innerText.trim());
      const [__, sanB, locusB, anchorB, colorB, pieceB, squareB] =
        [...b.children].map(td => td.innerText.trim());

      const movePair = Math.floor(i / 2) + 1;
      scenes.push(buildScene({
        pieceW: pieceW.split("—")[0].trim(),
        squareW, movePair, squareB, pieceB: pieceB.split("—")[0].trim()
      }));
    }

    const output = scenes.join("\n\n");
    document.getElementById("mnemonicImagerView").innerText = output;
  }

  // === Copy to clipboard ===
  async function copyImages() {
    const txt = document.getElementById("mnemonicImagerView").innerText;
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      document.getElementById("copyImagesBtn").innerText = "✅ Copied!";
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      document.getElementById("copyImagesBtn").innerText = "✅ Copied (fallback)";
    }
    setTimeout(() => (document.getElementById("copyImagesBtn").innerText = "📋 Copy"), 1500);
  }

  document.getElementById("createImagesBtn").onclick = createImages;
  document.getElementById("copyImagesBtn").onclick = copyImages;
});
