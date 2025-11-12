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
