// user-libraries-history.js
// Συνδέει το Import / Load Library με το User Libraries dropdown.

(function () {
  // ----------------- helpers -----------------

  function detectLibraryType(json) {
    if (!json || typeof json !== "object") return null;

    if (Array.isArray(json.palaces)) return "MemoryPalace";
    if (json.white && json.black) return "Characters";
    if (json["00"] || json["01"]) return "PAO_00_99";
    if (json.a1 || json.a2) return "Squares";
    return null;
  }

  function saveLibraryToHistory(fileName, json) {
    const type = detectLibraryType(json);
    if (!type) return;

    const baseName = (fileName || "").replace(/\.json$/i, "") || "User Library";

    let libName = baseName;
    if (json && typeof json === "object") {
      if (json.name) libName = json.name;
      if (Array.isArray(json.palaces) && json.palaces[0]?.name) {
        libName = json.palaces[0].name;
      }
    }

    // Ο δρόμος που θα χρησιμοποιήσει το dropdown / selector.
    const path = "user_libraries/" + (fileName || "user-library.json");

    let saved;
    try {
      saved = JSON.parse(localStorage.getItem("savedLibraries") || "[]");
      if (!Array.isArray(saved)) saved = [];
    } catch {
      saved = [];
    }

    const entry = { name: libName, type, path };

    const idxByPath = saved.findIndex((l) => l.path === entry.path);
    if (idxByPath >= 0) {
      saved[idxByPath] = entry;
    } else {
      saved.push(entry);
    }

    localStorage.setItem("savedLibraries", JSON.stringify(saved));

    // Προαιρετικά: ορίζουμε αυτή τη βιβλιοθήκη ως ενεργή
    try {
      if (typeof window.setActiveLibrary === "function") {
        window.setActiveLibrary(type, path);
      }
    } catch (e) {
      console.warn("user-libraries-history: setActiveLibrary failed", e);
    }

    // Refresh dropdown αν υπάρχει
    try {
      if (typeof window.loadUserLibrariesIntoUI === "function") {
        window.loadUserLibrariesIntoUI();
      }
    } catch (e) {
      console.warn("user-libraries-history: loadUserLibrariesIntoUI failed", e);
    }

    console.log(
      `💾 Saved user library → name="${libName}", type="${type}", path="${path}"`
    );
  }

  // ----------------- FileReader hook -----------------

  function hookFileReaderForUserLibraries() {
    const proto = window.FileReader && window.FileReader.prototype;
    if (!proto || proto.__userLibHookInstalled) return;

    proto.__userLibHookInstalled = true;

    const originalReadAsText = proto.readAsText;
    if (!originalReadAsText) return;

    proto.readAsText = function (file) {
      try {
        if (file && file.name) {
          this.__cmsFileName = file.name;
        }

        if (!this.__userLibListenerAttached) {
          this.__userLibListenerAttached = true;

          this.addEventListener(
            "load",
            (ev) => {
              try {
                const text = ev.target.result;
                if (typeof text !== "string") return;

                let json;
                try {
                  json = JSON.parse(text);
                } catch {
                  // Όχι JSON (π.χ. PGN) → αγνόησε
                  return;
                }

                const fileName = this.__cmsFileName || "user-library.json";
                saveLibraryToHistory(fileName, json);
              } catch (err) {
                console.warn(
                  "user-libraries-history: error while processing FileReader load",
                  err
                );
              }
            },
            false
          );
        }
      } catch (err) {
        console.warn("user-libraries-history: readAsText hook error", err);
      }

      // Κλήση του αρχικού readAsText ώστε να δουλεύει κανονικά το υπόλοιπο app.
      return originalReadAsText.apply(this, arguments);
    };

    console.log("✅ user-libraries-history.js: FileReader hook installed");
  }

  // Εγκατάσταση hook
  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", hookFileReaderForUserLibraries);
    } else {
      hookFileReaderForUserLibraries();
    }
  }
})();
