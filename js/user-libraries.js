// Φόρτωση σκελετού Squares
async function loadSquaresTemplate() {
  const resp = await fetch("user_libraries/user_squares_template.json");
  return await resp.json();
}

function registerLibraryForSelection(name, type, path) {
  const saved = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
  saved.push({ name, type, path });
  localStorage.setItem("savedLibraries", JSON.stringify(saved));
}

function createBackdrop() {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";
  return backdrop;
}

function openSquaresModal(data) {
  const backdrop = createBackdrop();

  const modal = document.createElement("div");
  modal.className = "ul-modal";

  // Header
  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Squares Library</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
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

    const uploadBtn = document.createElement("button");
    uploadBtn.className = "ul-upload-btn";
    uploadBtn.textContent = "Upload";
    uploadBtn.onclick = async () => {
      const filePicker = document.createElement("input");
      filePicker.type = "file";
      filePicker.accept = ".png,.jpg,.jpeg,.webp";
      filePicker.onchange = () => {
        const file = filePicker.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          data[square].image = reader.result;
        };
        reader.readAsDataURL(file);
      };
      filePicker.click();
    };

    const notes = document.createElement("input");
    notes.className = "ul-input-notes";
    notes.value = data[square].notes || "";

    // Update data on typing
    keyword.oninput = () => data[square].keyword = keyword.value;
    notes.oninput = () => data[square].notes = notes.value;

    row.append(label, keyword, uploadBtn, notes);
    body.appendChild(row);
  }

  modal.appendChild(body);

  // Footer
  const footer = document.createElement("div");
  footer.className = "ul-modal-footer";

  const exportBtn = document.createElement("button");
  exportBtn.className = "ul-export-btn";
  exportBtn.textContent = "Export JSON";
  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const a = document.createElement('a');
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

// Συνδέουμε το κουμπί στο UI
document.getElementById("createLibraryBtn").addEventListener("click", () => {
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
      callback();
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

async function loadCharactersTemplate() {
  const resp = await fetch("user_libraries/user_characters_template.json");
  return await resp.json();
}

function openCharactersModal(data) {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";

  const modal = document.createElement("div");
  modal.className = "ul-modal";

  // Header
  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Characters Library</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "ul-modal-body";

  function renderGroup(title, group) {
    const titleEl = document.createElement("div");
    titleEl.style.margin = "12px 0 6px 0";
    titleEl.style.color = "#bbb";
    titleEl.style.fontWeight = "bold";
    titleEl.textContent = title;
    body.appendChild(titleEl);

    for (const square in group) {
      const row = document.createElement("div");
      row.className = "ul-square-row";

      const label = document.createElement("div");
      label.className = "ul-square-label";
      label.textContent = square;

      const nameInput = document.createElement("input");
      nameInput.className = "ul-input";
      nameInput.placeholder = "name";
      nameInput.value = group[square].name || "";
      nameInput.oninput = () => group[square].name = nameInput.value;

      const notesInput = document.createElement("input");
      notesInput.className = "ul-input-notes";
      notesInput.placeholder = "notes";
      notesInput.value = group[square].notes || "";
      notesInput.oninput = () => group[square].notes = notesInput.value;

      row.append(label, nameInput, notesInput);
      body.appendChild(row);
    }
  }

  // White pieces
  body.appendChild(document.createElement("hr"));
  renderGroup("White Pawns", data.white.pawn);
  renderGroup("White Knights", data.white.knight);
  renderGroup("White Bishops", data.white.bishop);
  renderGroup("White Rooks", data.white.rook);
  renderGroup("White Queen", data.white.queen);
  renderGroup("White King", data.white.king);

  // Black pieces
  body.appendChild(document.createElement("hr"));
  renderGroup("Black Pawns", data.black.pawn);
  renderGroup("Black Knights", data.black.knight);
  renderGroup("Black Bishops", data.black.bishop);
  renderGroup("Black Rooks", data.black.rook);
  renderGroup("Black Queen", data.black.queen);
  renderGroup("Black King", data.black.king);

  modal.appendChild(body);

  // Footer
  const footer = document.createElement("div");
  footer.className = "ul-modal-footer";

  const exportBtn = document.createElement("button");
  exportBtn.className = "ul-export-btn";
  exportBtn.textContent = "Export JSON";
  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "user_characters.json";
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

async function loadMemoryPalacesTemplate() {
  const resp = await fetch("user_libraries/user_memory_palaces_template.json");
  return await resp.json();
}

function openMemoryPalaceModal(data) {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";

  const modal = document.createElement("div");
  modal.className = "ul-modal";

  const palace = data.palaces[0]; // one palace for now

  // Header
  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Memory Palace (100 loci)</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "ul-modal-body";

  // Palace title field
  const nameInput = document.createElement("input");
  nameInput.className = "ul-input-notes";
  nameInput.placeholder = "Palace Name";
  nameInput.style.marginBottom = "10px";
  nameInput.value = palace.name || "";
  nameInput.oninput = () => palace.name = nameInput.value;
  body.appendChild(nameInput);

  // Palace desc field
  const descInput = document.createElement("input");
  descInput.className = "ul-input-notes";
  descInput.placeholder = "Palace Description";
  descInput.style.marginBottom = "20px";
  descInput.value = palace.description || "";
  descInput.oninput = () => palace.description = descInput.value;
  body.appendChild(descInput);

  // LOCI (A - single list)
  for (const loc of palace.locations) {
    const row = document.createElement("div");
    row.className = "ul-square-row";

    const label = document.createElement("div");
    label.className = "ul-square-label";
    label.textContent = loc.id;

    const textInput = document.createElement("input");
    textInput.className = "ul-input";
    textInput.placeholder = "label";
    textInput.value = loc.label || "";
    textInput.oninput = () => loc.label = textInput.value;

    const uploadBtn = document.createElement("button");
    uploadBtn.className = "ul-upload-btn";
    uploadBtn.textContent = "Upload";
    uploadBtn.onclick = () => {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = ".png,.jpg,.jpeg,.webp";
      picker.onchange = () => {
        const file = picker.files[0];
        const reader = new FileReader();
        reader.onload = () => loc.image = reader.result;
        reader.readAsDataURL(file);
      };
      picker.click();
    };

    const notesInput = document.createElement("input");
    notesInput.className = "ul-input-notes";
    notesInput.placeholder = "notes";
    notesInput.value = loc.notes || "";
    notesInput.oninput = () => loc.notes = notesInput.value;

    row.append(label, textInput, uploadBtn, notesInput);
    body.appendChild(row);
  }

  modal.appendChild(body);

  // Footer
  const footer = document.createElement("div");
  footer.className = "ul-modal-footer";

  const exportBtn = document.createElement("button");
  exportBtn.className = "ul-export-btn";
  exportBtn.textContent = "Export JSON";
  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "user_memory_palace.json";
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

async function loadPAOTemplate() {
  const resp = await fetch("user_libraries/user_pao_00_99_template.json");
  return await resp.json();
}

function openPAOModal(data) {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";

  const modal = document.createElement("div");
  modal.className = "ul-modal";

  // Header
  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>PAO System (00 - 99)</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "ul-modal-body";

  for (const code in data) {
    const row = document.createElement("div");
    row.className = "ul-square-row";

    const label = document.createElement("div");
    label.className = "ul-square-label";
    label.textContent = code;

    const person = document.createElement("input");
    person.className = "ul-input";
    person.placeholder = "person";
    person.value = data[code].person || "";
    person.oninput = () => data[code].person = person.value;

    const action = document.createElement("input");
    action.className = "ul-input";
    action.placeholder = "action";
    action.value = data[code].action || "";
    action.oninput = () => data[code].action = action.value;

    const object = document.createElement("input");
    object.className = "ul-input";
    object.placeholder = "object";
    object.value = data[code].object || "";
    object.oninput = () => data[code].object = object.value;

    const uploadBtn = document.createElement("button");
    uploadBtn.className = "ul-upload-btn";
    uploadBtn.textContent = "Upload";
    uploadBtn.onclick = () => {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = ".png,.jpg,.jpeg,.webp";
      picker.onchange = () => {
        const file = picker.files[0];
        const reader = new FileReader();
        reader.onload = () => data[code].image = reader.result;
        reader.readAsDataURL(file);
      };
      picker.click();
    };

    const notes = document.createElement("input");
    notes.className = "ul-input-notes";
    notes.placeholder = "notes";
    notes.value = data[code].notes || "";
    notes.oninput = () => data[code].notes = notes.value;

    row.append(label, person, action, object, uploadBtn, notes);
    body.appendChild(row);
  }

  modal.appendChild(body);

// Footer
const footer = document.createElement("div");
footer.className = "ul-modal-footer";

const exportBtn = document.createElement("button");
exportBtn.className = "ul-export-btn";
exportBtn.textContent = "Export JSON";
exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "user_pao_00_99.json";  // ✅ σωστή ονομασία
  a.click();

  registerLibraryForSelection("My PAO 00-99", "pao", "user_pao_00_99.json");
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

// === Import Pre-made Library ===
document.getElementById("importLibraryBtn").addEventListener("click", () => {
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = ".json";
  picker.onchange = async () => {
    const file = picker.files[0];
    const text = await file.text();
    const json = JSON.parse(text);

    const name = prompt("Όνομα βιβλιοθήκης;", file.name.replace(".json",""));
    if (!name) return;

    const path = URL.createObjectURL(new Blob([text], {type:"application/json"}));

    registerLibraryForSelection(name, "custom", path);
    loadUserLibrariesIntoUI();
    alert("✅ Η βιβλιοθήκη προστέθηκε!");
  };
  picker.click();
});

function excelToJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    callback(json);
  };
  reader.readAsArrayBuffer(file);
}

/* === Import PAO 00–99 === */
document.getElementById("importPAOExcelBtn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls";
  input.onchange = () => excelToJSON(input.files[0], rows => {
    // A1 Format: Number | Person | Action | Object
    let result = {};
    rows.forEach(r => {
      const num = r[0];
      if (!/^\d\d$/.test(num)) return;
      result[num] = { person: r[1] || "", action: r[2] || "", object: r[3] || "" };
    });

    const jsonText = JSON.stringify(result, null, 2);
    const name = prompt("Όνομα βιβλιοθήκης PAO:", "My PAO 00-99");
    const blob = new Blob([jsonText], {type: "application/json"});
    const path = URL.createObjectURL(blob);

    registerLibraryForSelection(name, "pao_00_99", path);
    loadUserLibrariesIntoUI();
    alert("✅ PAO 00–99 imported!");
  });
};

/* === Import Memory Palace (Fixed Safe Binding) === */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("importPalaceExcelBtn");
  if (!btn) return; // αν δεν υπάρχει κουμπί, δεν κάνει τίποτα

  btn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = () => excelToJSON(input.files[0], rows => {
      // B1 Format: Locus# | Name | Description
      let palace = { palaces: [] };
      rows.forEach(r => {
        const num = r[0];
        if (!Number.isInteger(num)) return;
        palace.palaces.push({
          index: num,
          name: r[1] || "",
          description: r[2] || ""
        });
      });

      const jsonText = JSON.stringify(palace, null, 2);
      const name = prompt("Όνομα Memory Palace:", "My Palace");
      const blob = new Blob([jsonText], {type: "application/json"});
      const path = URL.createObjectURL(blob);

      registerLibraryForSelection(name, "memory_palace", path);
      loadUserLibrariesIntoUI();
      alert("✅ Memory Palace imported!");
    });
  };
});

// === Safe event binding fix ===
document.addEventListener("DOMContentLoaded", () => {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };

  // Παράδειγμα: δένουμε όσα κουμπιά υπάρχουν στη σελίδα
  bind("importPalaceExcelBtn", () => {
    console.log("📘 Import Memory Palace clicked");
  });

  bind("createLibraryBtn", () => {
    console.log("📗 Create Library clicked");
  });

  bind("importLibraryBtn", () => {
    console.log("📙 Import Library clicked");
  });

  bind("openLibrarySelectorBtn", () => {
    console.log("📒 Select Library clicked");
  });
});
