// ===========================================================
// library-switcher.js — v3.3.1 (Safe Fetch Edition)
// Επιλογή, φόρτωση και inline διαγραφή User Libraries (Pages-compatible)
// ===========================================================

// 🧩 Αποθήκευση ενεργής βιβλιοθήκης
function setActiveLibrary(type, path) {
  localStorage.setItem("activeLibrary", JSON.stringify({ type, path }));
  console.log(`📘 Active library set → ${type || "default"} (${path || "none"})`);
}

// 🧩 Ανάκτηση ενεργής βιβλιοθήκης
function getActiveLibrary() {
  const data = localStorage.getItem("activeLibrary");
  return data ? JSON.parse(data) : null;
}

// ===========================================================
// 🪟 Popup επιλογής βιβλιοθήκης (με διαγραφή πολλών χωρίς κλείσιμο)
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
   alert("✅ Default system activated!");
   document.querySelector(".ul-backdrop")?.remove(); // ✅ κλείνει και το modal
  };
  body.appendChild(def);

  // 🔹 User Libraries
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

      const btn = document.createElement("button");
      btn.className = "epic-btn";
      btn.textContent = lib.name || "Unnamed Library";
      btn.style.flex = "1";

      btn.onclick = () => {
        if (lib.path.startsWith("blob:")) {
          alert("⚠️ Blob URLs δεν υποστηρίζονται στο GitHub Pages.\nΦόρτωσε βιβλιοθήκη από τον φάκελο /user_libraries/.");
          return;
        }
        setActiveLibrary(lib.type, lib.path);
        alert(`✅ Activated: ${lib.name}`);
      };

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
        ev.stopPropagation();
        if (confirm(`Delete library "${lib.name}" from local history?`)) {
          saved.splice(idx, 1);
          localStorage.setItem("savedLibraries", JSON.stringify(saved));
          const active = getActiveLibrary();
          if (active && active.path === lib.path) {
            localStorage.removeItem("activeLibrary");
          }
          console.log(`🗑️ Library "${lib.name}" deleted from history.`);
          renderUserLibraries();
          loadUserLibrariesIntoUI();
        }
      };

      row.append(btn, del);
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
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("userLibrarySelect");
  if (!sel) return;

  sel.addEventListener("change", async (e) => {
    const path = e.target.value;
    if (!path) return;

    try {
      if (path.startsWith("blob:")) {
        alert("⚠️ Blob URLs δεν υποστηρίζονται στο GitHub Pages.\nΠαρακαλώ φόρτωσε βιβλιοθήκη από /user_libraries/.");
        return;
      }

      const resp = await fetch(path);
      const json = await resp.json();
      libs.User = libs.User || {};

      if (json.white && json.black) {
        libs.User.Characters = json;
        console.log("✅ Loaded User Characters Library");
      } else if (json.palaces) {
        libs.User.MemoryPalaces = json;
        console.log("✅ Loaded User Memory Palace Library");
      } else if (json["00"] || json["01"]) {
        libs.User.PAO_00_99 = json;
        console.log("✅ Loaded User PAO 00–99 Library");
      } else if (json.a1 || json.a2) {
        libs.User.Squares = json;
        console.log("✅ Loaded User Squares Library");
      } else {
        console.warn("⚠️ Unknown library type:", json);
      }

      chooseLibraryOnGameLoad();

      if (json.palaces?.length) {
        const palace = json.palaces[0];
        if (palace?.locations?.length) {
          const loci = palace.locations.map(l => l.label);
          window.applyUserPalaceToTables?.(loci, palace.name);
        }
      }
    } catch (err) {
      console.error("❌ Error loading user library:", err);
      alert("❌ Failed to load the selected library. Check file path or network.");
    }
  });
});

// ===========================================================
// 🎯 Ενεργοποίηση κουμπιού "Select Library" στο UI (safe)
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openLibrarySelectorBtn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      chooseLibraryOnGameLoad();
    });
  }
});

