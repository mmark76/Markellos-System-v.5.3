// Αποθηκεύουμε ενεργή βιβλιοθήκη
function setActiveLibrary(type, path) {
  localStorage.setItem("activeLibrary", JSON.stringify({ type, path }));
}

// Παίρνουμε ενεργή βιβλιοθήκη
function getActiveLibrary() {
  const data = localStorage.getItem("activeLibrary");
  return data ? JSON.parse(data) : null;
}

// Popup επιλογής βιβλιοθήκης
function openLibrarySelector(libraries) {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";

  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "380px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Select Active Mnemonic System</span>`;
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

  // Default System
  const def = document.createElement("button");
  def.className = "epic-btn";
  def.textContent = "Default System";
  def.onclick = () => {
    setActiveLibrary("default", null);
    backdrop.remove();
  };
  body.appendChild(def);

  // User Libraries
  libraries.forEach(lib => {
    const btn = document.createElement("button");
    btn.className = "epic-btn";
    btn.textContent = lib.name;
    btn.onclick = () => {
      setActiveLibrary(lib.type, lib.path);
      backdrop.remove();
    };
    body.appendChild(btn);
  });

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

// Κλήση όταν φορτώνεται παρτίδα
async function chooseLibraryOnGameLoad() {
  const libraries = [];

  // Αν βρήκαμε αποθηκευμένες βιβλιοθήκες (user JSON)
  const stored = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
  stored.forEach(lib => libraries.push(lib));

  openLibrarySelector(libraries);
}

function loadUserLibrariesIntoUI() {
  const sel = document.getElementById("userLibrarySelect");
  if (!sel) return;

  sel.innerHTML = `<option value="">— none —</option>`;

  const saved = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
  for (const lib of saved) {
    const opt = document.createElement("option");
    opt.value = lib.path;
    opt.textContent = `${lib.name} (${lib.type})`;
    sel.appendChild(opt);
  }
}

// όταν διαλέγεται βιβλιοθήκη -> την φορτώνουμε
document.getElementById("userLibrarySelect")?.addEventListener("change", async (e) => {
  const path = e.target.value;
  if (!path) return;

  const resp = await fetch(path);
  const json = await resp.json();

  // το βάζουμε προσωρινά στο libs.User
  libs.User = libs.User || {};
  if (json.white && json.black) libs.User.Characters = json;
  else if (json.palaces) libs.User.MemoryPalace = json;
  else if (json["00"] || json["01"]) libs.User.PAO_00_99 = json;
  else libs.User.Squares = json;

  chooseLibraryOnGameLoad(); // ανανέωση εφαρμογής
});
