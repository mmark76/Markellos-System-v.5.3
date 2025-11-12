// ===========================================================
// user-libraries.js — v3.3.1 (Safe DOM-Ready Edition)
// Δημιουργία, Εξαγωγή και Φόρτωση User Libraries (Palace, Characters, Squares, PAO)
// ===========================================================

// 🔹 Helper: Load templates from /user_libraries
async function loadSquaresTemplate() {
  const resp = await fetch("user_libraries/user_squares_template.json");
  return await resp.json();
}
async function loadCharactersTemplate() {
  const resp = await fetch("user_libraries/user_characters_template.json");
  return await resp.json();
}
async function loadMemoryPalacesTemplate() {
  const resp = await fetch("user_libraries/user_memory_palaces_template.json");
  return await resp.json();
}
async function loadPAOTemplate() {
  const resp = await fetch("user_libraries/user_pao_00_99_template.json");
  return await resp.json();
}

// 🔹 Register library for later selection
function registerLibraryForSelection(name, type, path) {
  const saved = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
  saved.push({ name, type, path });
  localStorage.setItem("savedLibraries", JSON.stringify(saved));
  console.log(`✅ Registered: ${name} (${type})`);
}

// 🔹 Backdrop factory
function createBackdrop() {
  const b = document.createElement("div");
  b.className = "ul-backdrop";
  return b;
}

// ===========================================================
// MAIN DOM READY WRAPPER
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {

  // ========================
  // CREATE LIBRARY BUTTON
  // ========================
  const createBtn = document.getElementById("createLibraryBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const backdrop = createBackdrop();
      const modal = document.createElement("div");
      modal.className = "ul-modal";
      modal.style.maxWidth = "350px";

      const header = document.createElement("div");
      header.className = "ul-modal-header";
      header.innerHTML = `<span>Create Library</span>`;
      const closeBtn = document.createElement("button");
      closeBtn.className = "ul-close-btn";
      closeBtn.textContent = "✖";
      closeBtn.onclick = () => backdrop.remove();
      header.appendChild(closeBtn);
      modal.appendChild(header);

      const body = document.createElement("div");
      body.className = "ul-modal-body";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "10px";

      function option(label, callback) {
        const btn = document.createElement("button");
        btn.className = "epic-btn";
        btn.textContent = label;
        btn.onclick = async () => {
          await callback();
          backdrop.remove();
        };
        body.appendChild(btn);
      }

      option("1 - Memory Palace (Route)", async () => {
        const data = await loadMemoryPalacesTemplate();
        openMemoryPalaceModal(data);
      });

      option("2 - Characters (Pieces + Pawns)", async () => {
        const data = await loadCharactersTemplate();
        openCharactersModal(data);
      });

      option("3 - Squares (Board Map)", async () => {
        const data = await loadSquaresTemplate();
        openSquaresModal(data);
      });

      option("4 - PAO 00–99 (Numeric System)", async () => {
        const data = await loadPAOTemplate();
        openPAOModal(data);
      });

      modal.appendChild(body);
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
    });
  }

  // ========================
  // IMPORT LIBRARY BUTTON
  // ========================
  const importBtn = document.getElementById("importLibraryBtn");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = ".json";
      picker.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const json = JSON.parse(ev.target.result);
            const name = file.name.replace(".json", "");
            registerLibraryForSelection(name, "custom", `user_libraries/${file.name}`);
            alert(`✅ Imported: ${name}`);
            console.log("📘 Imported user library:", json);
          } catch (err) {
            alert("❌ Invalid JSON file");
          }
        };
        reader.readAsText(file);
      };
      picker.click();
    });
  }
});

// ===========================================================
// === Existing Modal Functions (unchanged) ===
// ===========================================================

function openSquaresModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Squares Library</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "ul-modal-body";

  for (const square in data) {
    const row = document.createElement("div");
    row.className = "ul-square-row";

    const label = document.createElement("div");
    label.className = "ul-square-label";
    label.textContent = square;

    const keyword = document.createElement("input");
    keyword.className = "ul-input";
    keyword.value = data[square].keyword || "";
    keyword.oninput = () => data[square].keyword = keyword.value;

    const uploadBtn = document.createElement("button");
    uploadBtn.className = "ul-upload-btn";
    uploadBtn.textContent = "Upload";
    uploadBtn.onclick = async () => {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = ".png,.jpg,.jpeg,.webp";
      picker.onchange = () => {
        const file = picker.files[0];
        const reader = new FileReader();
        reader.onload = () => data[square].image = reader.result;
        reader.readAsDataURL(file);
      };
      picker.click();
    };

    const notes = document.createElement("input");
    notes.className = "ul-input-notes";
    notes.value = data[square].notes || "";
    notes.oninput = () => data[square].notes = notes.value;

    row.append(label, keyword, uploadBtn, notes);
    body.appendChild(row);
  }

  modal.appendChild(body);

  const footer = document.createElement("div");
  footer.className = "ul-modal-footer";
  const exportBtn = document.createElement("button");
  exportBtn.className = "ul-export-btn";
  exportBtn.textContent = "Export JSON";
  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "user_squares.json";
    a.click();
  };
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "ul-cancel-btn";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => backdrop.remove();
  footer.append(exportBtn, cancelBtn);
  modal.appendChild(footer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* ====== ADD: Memory Palace / Characters / PAO 00–99 modals ====== */

function openMemoryPalaceModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "600px";

  // header
  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Memory Palace (Route)</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // body
  const body = document.createElement("div");
  body.className = "ul-modal-body";
  const pal = data.palaces?.[0] || { name: "", description: "", locations: [] };

  // name + description
  const nameInp = document.createElement("input");
  nameInp.className = "ul-input";
  nameInp.placeholder = "Palace name";
  nameInp.value = pal.name || "";
  nameInp.oninput = () => (pal.name = nameInp.value);

  const descInp = document.createElement("textarea");
  descInp.className = "ul-input";
  descInp.placeholder = "Description (optional)";
  descInp.style.minHeight = "60px";
  descInp.value = pal.description || "";
  descInp.oninput = () => (pal.description = descInp.value);

  // loci editor
  const list = document.createElement("div");
  list.style.maxHeight = "360px";
  list.style.overflowY = "auto";
  list.style.border = "1px solid #333";
  list.style.padding = "8px";
  list.style.borderRadius = "8px";
  list.style.background = "#111";

  if (!Array.isArray(pal.locations) || pal.locations.length === 0) {
    // fallback: 100 κενά loci αν το template είναι άδειο
    pal.locations = Array.from({ length: 100 }, (_, i) => ({
      id: `L${i + 1}`,
      label: "",
      image: "",
      notes: ""
    }));
  }

  pal.locations.forEach((loc, i) => {
    const row = document.createElement("div");
    row.className = "ul-square-row";
    row.style.alignItems = "center";

    const idTag = document.createElement("div");
    idTag.className = "ul-square-label";
    idTag.textContent = loc.id || `L${i + 1}`;

    const label = document.createElement("input");
    label.className = "ul-input";
    label.placeholder = `Label for ${loc.id}`;
    label.value = loc.label || "";
    label.oninput = () => (loc.label = label.value);

    row.append(idTag, label);
    list.appendChild(row);
  });

  // actions
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.marginTop = "10px";

  const useNowBtn = document.createElement("button");
  useNowBtn.className = "epic-btn";
  useNowBtn.textContent = "⚡ Use Now (apply to tables)";
  useNowBtn.onclick = () => {
    const labels = pal.locations.map(l => l.label || "");
    if (typeof window.applyUserPalaceToTables === "function") {
      window.applyUserPalaceToTables(labels, pal.name || "User Palace");
      alert("✅ Applied to tables.");
    } else {
      alert("ℹ️ applyUserPalaceToTables() δεν βρέθηκε σε αυτή τη σελίδα.");
    }
  };

  const saveBtn = document.createElement("button");
  saveBtn.className = "epic-btn";
  saveBtn.textContent = "💾 Save JSON";
  saveBtn.onclick = () => {
    const out = JSON.stringify({ palaces: [pal] }, null, 2);
    const blob = new Blob([out], { type: "application/json" });
    saveAs(blob, "user_memory_palaces.json");
    alert("✅ Saved! Κάνε upload στο /user_libraries/ και μετά Import.");
  };

  actions.append(useNowBtn, saveBtn);

  body.appendChild(nameInp);
  body.appendChild(descInp);
  body.appendChild(list);
  body.appendChild(actions);

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openCharactersModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "720px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Characters (Pieces + Pawns)</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "ul-modal-body";

  const container = document.createElement("div");
  container.style.maxHeight = "420px";
  container.style.overflowY = "auto";
  container.style.border = "1px solid #333";
  container.style.borderRadius = "8px";
  container.style.padding = "8px";
  container.style.background = "#111";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(2, 1fr)";
  container.style.gap = "8px";

  function section(title, obj) {
    const box = document.createElement("div");
    box.style.border = "1px solid #444";
    box.style.borderRadius = "8px";
    box.style.padding = "8px";
    const h = document.createElement("div");
    h.style.fontWeight = "bold";
    h.style.marginBottom = "6px";
    h.textContent = title;
    box.appendChild(h);

    Object.keys(obj).forEach(square => {
      const row = document.createElement("div");
      row.className = "ul-square-row";
      row.style.alignItems = "center";

      const tag = document.createElement("div");
      tag.className = "ul-square-label";
      tag.textContent = square;

      const name = document.createElement("input");
      name.className = "ul-input";
      name.placeholder = "Name";
      name.value = obj[square].name || "";
      name.oninput = () => (obj[square].name = name.value);

      row.append(tag, name);
      box.appendChild(row);
    });

    return box;
  }

  // White
  const white = data.white || {};
  const whiteWrap = document.createElement("div");
  whiteWrap.style.gridColumn = "1 / -1";
  whiteWrap.style.marginBottom = "4px";
  whiteWrap.innerHTML = `<div style="font-weight:bold;color:#CFAF4A;">White</div>`;
  container.appendChild(whiteWrap);
  ["pawn", "knight", "bishop", "rook", "queen", "king"].forEach(p => {
    if (white[p]) container.appendChild(section(`White ${p}`, white[p]));
  });

  // Black
  const black = data.black || {};
  const blackWrap = document.createElement("div");
  blackWrap.style.gridColumn = "1 / -1";
  blackWrap.style.marginTop = "8px";
  blackWrap.innerHTML = `<div style="font-weight:bold;color:#CFAF4A;">Black</div>`;
  container.appendChild(blackWrap);
  ["pawn", "knight", "bishop", "rook", "queen", "king"].forEach(p => {
    if (black[p]) container.appendChild(section(`Black ${p}`, black[p]));
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "epic-btn";
  saveBtn.style.marginTop = "10px";
  saveBtn.textContent = "💾 Save JSON";
  saveBtn.onclick = () => {
    const out = JSON.stringify(data, null, 2);
    const blob = new Blob([out], { type: "application/json" });
    saveAs(blob, "user_characters.json");
    alert("✅ Saved! Κάνε upload στο /user_libraries/ και μετά Import.");
  };

  body.appendChild(container);
  body.appendChild(saveBtn);
  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openPAOModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "720px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>PAO 00–99</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "ul-modal-body";

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(2, 1fr)";
  grid.style.gap = "8px";
  grid.style.maxHeight = "420px";
  grid.style.overflowY = "auto";
  grid.style.border = "1px solid #333";
  grid.style.borderRadius = "8px";
  grid.style.padding = "8px";
  grid.style.background = "#111";

  Object.keys(data).sort().forEach(code => {
    const cell = document.createElement("div");
    cell.style.border = "1px solid #444";
    cell.style.borderRadius = "8px";
    cell.style.padding = "8px";

    const title = document.createElement("div");
    title.style.fontWeight = "bold";
    title.style.marginBottom = "4px";
    title.textContent = code;
    cell.appendChild(title);

    const p = document.createElement("input");
    p.className = "ul-input";
    p.placeholder = "Person";
    p.value = data[code].person || "";
    p.oninput = () => (data[code].person = p.value);

    const a = document.createElement("input");
    a.className = "ul-input";
    a.placeholder = "Action";
    a.value = data[code].action || "";
    a.oninput = () => (data[code].action = a.value);

    const o = document.createElement("input");
    o.className = "ul-input";
    o.placeholder = "Object";
    o.value = data[code].object || "";
    o.oninput = () => (data[code].object = o.value);

    cell.append(p, a, o);
    grid.appendChild(cell);
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "epic-btn";
  saveBtn.style.marginTop = "10px";
  saveBtn.textContent = "💾 Save JSON";
  saveBtn.onclick = () => {
    const out = JSON.stringify(data, null, 2);
    const blob = new Blob([out], { type: "application/json" });
    saveAs(blob, "user_pao_00_99.json");
    alert("✅ Saved! Κάνε upload στο /user_libraries/ και μετά Import.");
  };

  body.appendChild(grid);
  body.appendChild(saveBtn);
  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}
/* ====== END ADD ====== */
