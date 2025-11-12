// ===========================================================
// library-switcher.js — v3.3
// Επιλογή, φόρτωση και inline διαγραφή User Libraries
// Συμβατό με user-locus-mapper.js (ενημέρωση loci στους πίνακες)
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

// ===========================================================
// 🪟 Popup επιλογής βιβλιοθήκης (με δυνατότητα διαγραφής πολλών χωρίς κλείσιμο)
// ===========================================================
function openLibrarySelector(libraries) {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";

  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "420px";

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
  body.style.gap = "8px";
  body.style.maxHeight = "400px";
  body.style.overflowY = "auto";

  // 🔹 Default System
  const def = document.createElement("button");
  def.className = "epic-btn";
  def.textContent = "Default System";
  def.onclick = () => {
    setActiveLibrary("default", null);
    console.log("✅ Default system activated");
  };
  body.appendChild(def);

  // 🔹 User Libraries (από το localStorage)
  const renderUserLibraries = () => {
    body.querySelectorAll(".lib-row").forEach(r => r.remove());
    const saved = JSON.parse(localStorage.getItem("savedLibraries") || "[]");

    saved.forEach((lib, idx) => {
      const row = document.createElement("div");
      row.className = "lib-row";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.gap = "8px";

      // Κουμπί επιλογής βιβλιοθήκης
      const btn = document.createElement("button");
      btn.className = "epic-btn";
      btn.textContent = lib.name || "Unnamed Library";
      btn.style.flex = "1";
      btn.onclick = () => {
        setActiveLibrary(lib.type, lib.path);
        console.log(`✅ Activated library: ${lib.name}`);
      };

      // ✖ Διαγραφή (μπλε)
      const del = document.createElement("button");
      del.textContent = "✖";
      del.title = "Delete from local history";
      del.style.cssText = `
        background:none;
        border:none;
        color:#339CFF;
        font-size:1.1em;
        font-weight:bold;
        cursor:pointer;
        padding:0 8px;
        transition: color 0.2s ease;
      `;
      del.onmouseover = () => (del.style.color = "#66BFFF");
      del.onmouseout = () => (del.style.color = "#339CFF");

      del.onclick = (ev) => {
        ev.stopPropagation(); // Μην ενεργοποιήσει επιλογή
        if (confirm(`Delete library "${lib.name}" from local history?`)) {
          saved.splice(idx, 1);
          localStorage.setItem("savedLibraries", JSON.stringify(saved));

          // Αν είναι η ενεργή, καθαρίζεται κι αυτή
          const active = getActiveLibrary();
          if (active && active.path === lib.path) {
            localStorage.removeItem("activeLibrary");
          }

          console.log(`🗑️ Library "${lib.name}" deleted from history.`);
          renderUserLibraries(); // ανανέωση λίστας χωρίς να κλείσει
          loadUserLibrariesIntoUI(); // ανανέωση dropdown
        }
      };

      row.appendChild(btn);
      row.appendChild(del);
      body.appendChild(row);
    });
  };

  renderUserLibraries();

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

// ===========================================================
// 🔄 Κλήση κατά τη φόρτωση παρτίδας ή επιλογής συστήματος
// ===========================================================
async function chooseLibraryOnGameLoad() {
  const libraries = [];

  // Αν υπάρχουν αποθηκευμένες βιβλιοθήκες χρήστη
  const stored = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
  stored.forEach(lib => libraries.push(lib));

  openLibrarySelector(libraries);
}

// ===========================================================
// 🔽 Εμφάνιση User Libraries στο dropdown
// ===========================================================
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
// 🧠 Φόρτωση βιβλιοθήκης όταν επιλεγεί από dropdown
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
      libs.User.MemoryPalaces = json;
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

    // Ενημέρωση UI
    chooseLibraryOnGameLoad();

    // Αν είναι Memory Palace → ενημέρωση loci
    if (json.palaces?.length) {
      const palace = json.palaces[0];
      if (palace?.locations?.length) {
        const loci = palace.locations.map(l => l.label);
        window.applyUserPalaceToTables?.(loci, palace.name);
      }
    }
  } 
  catch (err) {
    console.error("❌ Error loading user library:", err);
  }
});
