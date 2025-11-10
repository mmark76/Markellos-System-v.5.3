// Φόρτωση σκελετού Squares
async function loadSquaresTemplate() {
  const resp = await fetch("user_libraries/user_squares_template.json");
  return await resp.json();
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
document.getElementById("createLibraryBtn").addEventListener("click", async () => {
  const data = await loadSquaresTemplate();
  openSquaresModal(data);
});
