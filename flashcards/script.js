let pao = {};
let keys = [];
let currentKey = null;
let showingAnswer = false;
window.lastData = null;

function isPlainObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

function setStatus(msg, isError=false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = isError ? "#ffb3b3" : "#a8f0c6";
}

function normalizeData(data) {
  const select = document.getElementById("librarySelect");
  const path = select && select.value ? select.value.split("/") : [];
  let obj = data;
  let traversed = true;

  for (let key of path) {
    if (obj && typeof obj === "object" && key in obj) {
      obj = obj[key];
    } else {
      traversed = false;
      break;
    }
  }

  // Αν βρήκαμε κανονικά το path (default libraries case)
  if (traversed) {

    // PAO 0–9 (persons/actions/objects arrays)
    if (obj.persons && obj.actions && obj.objects) {
      const combined = {};
      for (let i = 0; i <= 9; i++) {
        combined[i] = {
          person: obj.persons[i].el || obj.persons[i].en || obj.persons[i],
          action: obj.actions[i].el || obj.actions[i].en || obj.actions[i],
          object: obj.objects[i].el || obj.objects[i].en || obj.objects[i]
        };
      }
      return combined;
    }

    // PAO 00–99 (Persons/Actions/Objects maps)
    if (obj.Persons && obj.Actions && obj.Objects) {
      const combined = {};
      for (let k of Object.keys(obj.Persons)) {
        combined[k] = {
          person: obj.Persons[k].el || obj.Persons[k].en || obj.Persons[k],
          action: obj.Actions[k].el || obj.Actions[k].en || obj.Actions[k],
          object: obj.Objects[k].el || obj.Objects[k].en || obj.Objects[k]
        };
      }
      return combined;
    }

    // Οτιδήποτε άλλο default library
    return obj;
  }

  // =========================
  // Fallbacks για user templates
  // =========================

  // Memory Palaces template:
  // { palaces: [ { name, description, locations:[{id,label,image,notes},...] }, ... ] }
  if (data && Array.isArray(data.palaces)) {
    const combined = {};
    data.palaces.forEach((palace, pIndex) => {
      const palaceName = palace.name || `Palace ${pIndex + 1}`;
      const description = palace.description || "";
      (palace.locations || []).forEach(loc => {
        const key = `${palaceName} – ${loc.id || ""}`.trim();
        combined[key] = {
          palace: palaceName,
          description: description,
          id: loc.id || "",
          label: loc.label || "",
          image: loc.image || "",
          notes: loc.notes || ""
        };
      });
    });
    return combined;
  }

  // Characters template:
  // { white: { piece: {square:{name,notes},...}, ... }, black: {...} }
  if (data && isPlainObject(data.white || null)) {
    const combined = {};
    ["white","black"].forEach(color => {
      if (!data[color]) return;
      Object.keys(data[color]).forEach(piece => {
        const squares = data[color][piece];
        if (!isPlainObject(squares)) return;
        Object.keys(squares).forEach(square => {
          const entry = squares[square] || {};
          const key = `${color} ${piece} ${square}`;
          combined[key] = entry;
        });
      });
    });
    if (Object.keys(combined).length) return combined;
  }

  // Generic flat-map template (PAO 00–99 template, squares template κ.λπ.)
  // Σχήμα: { "00": {...}, "01": {...} } ή { "a1": {...}, "a2": {...} }
  if (isPlainObject(data)) {
    const keys = Object.keys(data);
    if (keys.length && isPlainObject(data[keys[0]])) {
      return data;
    }
  }

  // Δεν αναγνωρίστηκε η δομή
  return null;
}

function renderEntry(key, entry) {
  if (!entry) return "—";

  // 1) PAO (Person–Action–Object)
  if (entry.person && entry.action && entry.object) {
    const lociEntries = window.lastData?.Temporal?.LibraryT1 || {};
    const lociKeys = Object.keys(lociEntries);
    const randomLoci = lociEntries[lociKeys[Math.floor(Math.random()*lociKeys.length)]];
    const lociValue = randomLoci?.el || randomLoci?.en || "";
    const loci = "Random Locus: " + lociValue;

    const left = `Person: ${entry.person}\nAction: ${entry.action}\nObject: ${entry.object}`;

    document.getElementById("back-code").textContent = `Code: ${key}`;
    document.getElementById("back-left").textContent = left;
    document.getElementById("back-loci").textContent = loci;
    document.getElementById("back-right").textContent = "";
    return "";
  }

  // 2) Memory palace locations – δείχνουμε μόνο το label (π.χ. "Maska")
  if (entry.palace && typeof entry.label === "string") {
    document.getElementById("back-code").textContent = `Code: ${key}`;
    document.getElementById("back-left").textContent = entry.label || "";
    document.getElementById("back-loci").textContent = "";
    document.getElementById("back-right").textContent = "";
    return "";
  }

  // 3) Default libraries (el / en)
  if (entry.el && entry.en) return `${entry.el}\n${entry.en}`;

  // 4) Απλό string
  if (typeof entry === "string") return entry;

  // 5) Ό,τι άλλο μένει – JSON
  return JSON.stringify(entry, null, 2);
}

// function renderEntry(key, entry) {
// if (!entry) return "—";
// if (entry.person && entry.action && entry.object) {
// const lociEntries = window.lastData?.Temporal?.LibraryT1 || {};
// const lociKeys = Object.keys(lociEntries);
// const randomLoci = lociEntries[lociKeys[Math.floor(Math.random()*lociKeys.length)]];
// const lociValue = randomLoci?.el || randomLoci?.en || "";
// const loci = "Random Locus: " + lociValue;
// const left = `Person: ${entry.person}\nAction: ${entry.action}\nObject: ${entry.object}`;
// document.getElementById("back-code").textContent = `Κωδικός: ${key}`;
// document.getElementById("back-left").textContent = left;
// document.getElementById("back-loci").textContent = loci;
// document.getElementById("back-right").textContent = "";
// return "";
// }
//if (entry.el && entry.en) return `${entry.el}\n${entry.en}`;
//if (typeof entry === "string") return entry;
// return JSON.stringify(entry,null,2);
// } 

function loadPAOObject(obj) {
  pao = obj || {};
  keys = Object.keys(pao).sort((a,b)=>{
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
  if (!keys.length) throw new Error("No data in JSON file.");
  setStatus(`Loaded ${keys.length} cards.`);
  nextCard();
}

function nextCard() {
  if (!keys.length) { setStatus("No JSON file was loaded.", true); return; }
  showingAnswer = false;
  currentKey = keys[Math.floor(Math.random()*keys.length)];
  const entry = pao[currentKey];
  document.getElementById("front").textContent = `Code: ${currentKey}`;
  document.getElementById("back").style.display = "none";
  const result = renderEntry(currentKey, entry);
  if (result) {
    document.getElementById("back-code").textContent = `Code: ${currentKey}`;
    document.getElementById("back-left").textContent = result;
    document.getElementById("back-loci").textContent = "";
    document.getElementById("back-right").textContent = "";
  }
}

function showAnswer() {
  if (!keys.length || !currentKey) return;
  showingAnswer = true;
  document.getElementById("back").style.display = "block";
}

async function autoFetch() {
  try {
    setStatus("Automatic loading…");
    const res = await fetch("../json/libraries_v.3.3.json?ts=" + Date.now(), { cache:"no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    window.lastData = data;
    const normalized = normalizeData(data);
    if (!normalized) throw new Error("No library was found in JSON.");
    loadPAOObject(normalized);
  } catch (err) {
    console.warn("Failed to load automatically:", err.message);
    setStatus("Could not find file libraries_v.3.3.json. Choose JSON file.", true);
  }
}

function loadFromFile(file) {
  setStatus("Φόρτωση από αρχείο…");
  const reader = new FileReader();
  reader.onerror = () => setStatus("File read error.", true);
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      window.lastData = data;
      const normalized = normalizeData(data);
      if (!normalized) {
        setStatus("Non supported JSON structure.", true);
        return;
      }
      loadPAOObject(normalized);
    } catch(e){ setStatus("Non valid JSON.", true); }
  };
  reader.readAsText(file,"utf-8");
}

function refreshDefaults() {
  autoFetch();
  setStatus("Defaults refreshed.");
}

document.getElementById("file").addEventListener("change", e=>{
  const file = e.target.files?.[0];
  if (file) loadFromFile(file);
});

document.getElementById("btnNext").addEventListener("click", ()=>{
  if (showingAnswer) nextCard(); else showAnswer();
});
document.getElementById("btnShow").addEventListener("click", ()=>showAnswer());

window.addEventListener("keydown", e=>{
  if (e.code === "Space") {
    e.preventDefault();
    if (showingAnswer) nextCard(); else showAnswer();
  }
});

document.getElementById("librarySelect").addEventListener("change", ()=>{
  if (!window.lastData) { setStatus("No JSON was loaded yet.", true); return; }
  const normalized = normalizeData(window.lastData);
  if (normalized) loadPAOObject(normalized);
  else setStatus("No library was found.", true);
});

document.querySelectorAll(".lib-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if (!window.lastData) { document.getElementById("libraryText").value="No JSON file was loaded."; return; }
    const path = btn.dataset.lib.split("/");
    let obj = window.lastData;
    for (let key of path) { if (obj && obj[key]) obj=obj[key]; else obj=null; }
    document.getElementById("libraryText").value = obj ? JSON.stringify(obj,null,2) : "No data was found.";
  });
});

window.addEventListener("DOMContentLoaded", ()=>autoFetch());

document.getElementById("btnRefresh").addEventListener("click", refreshDefaults);


