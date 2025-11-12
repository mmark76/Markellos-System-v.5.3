// ===========================================================
// library-switcher.js — v3.3.1
// Διαχείριση επιλογής και φόρτωσης βιβλιοθηκών (Default & User)
// Περιλαμβάνει σύνδεση User Memory Palace -> Mnemonic Locus Tables
// ===========================================================

// 🧩 Αποθήκευση ενεργής βιβλιοθήκης
function setActiveLibrary(type, path) {
  localStorage.setItem("activeLibrary", JSON.stringify({ type, path }));
}

// 🧩 Ανάκτηση ενεργής βιβλιοθήκης
function getActiveLibrary() {
  const data = localStorage.getItem("activeLibrary");
  return data ? JSON.parse(data) : null;
}

// 🪟 Popup επιλογής βιβλιοθήκης
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

  // User Libraries (saved στο localStorage)
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

// 🔄 Κλήση κατά τη φόρτωση παρτίδας ή επιλογής συστήματος
async function chooseLibraryOnGameLoad() {
  const libraries = [];

  // Αν υπάρχουν αποθηκευμένες βιβλιοθήκες χρήστη
  const stored = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
  stored.forEach(lib => libraries.push(lib));

  openLibrarySelector(libraries);
}

// 🔽 Εμφάνιση User Libraries στο dropdown της δεξιάς στήλης
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

// ===========================================================
// 🧠 Φόρτωση βιβλιοθήκης όταν επιλεγεί από τον χρήστη
// ===========================================================
document.getElementById("userLibrarySelect")?.addEventListener("change", async (e) => {
  const path = e.target.value;
  if (!path) return;

  try {
    const resp = await fetch(path);
    const json = await resp.json();

    // Δημιουργία/ενημέρωση αντικειμένου libs.User
    libs.User = libs.User || {};

    if (json.white && json.black) {
      libs.User.Characters = json;
      console.log("✅ Loaded User Characters Library");
    } 
    else if (json.palaces) {
      libs.User.MemoryPalaces = json; // ✅ ΠΛΗΘΥΝΤΙΚΟ
      console.log("✅ Loaded User Memory Palace Library");
    } 
    else if (json["00"] || json["01"]) {
      libs.User.PAO_00_99 = json;
      console.log("✅ Loaded User PAO 00–99 Library");
    } 
    else {
      libs.User.Squares = json;
      console.log("✅ Loaded User Squares Library");
    }

    // Ενημέρωση UI / ανανέωση εφαρμογής
    chooseLibraryOnGameLoad();

    // =======================================================
    // 📌 Αν η βιβλιοθήκη είναι τύπου Memory Palace → Ενημέρωση Locus
    // =======================================================
    if (json.palaces?.length) {
      const palace = json.palaces[0];
      if (palace?.locations?.length) {
        const loci = palace.locations.map(l => l.label);
        console.log(`🏛️ Active Memory Palace: ${palace.name || "Unnamed"} (${loci.length} loci)`);
		window.applyUserPalaceToTables?.(loci); // καλεί το user-locus-mapper.js
      }
    }
  } 
  catch (err) {
    console.error("❌ Error loading user library:", err);
  }
});
