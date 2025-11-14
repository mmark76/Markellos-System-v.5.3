let pao = {};
let keys = [];
let currentKey = null;
let showingAnswer = false;
window.lastData = null;

function setStatus(msg, isError=false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = isError ? "#ffb3b3" : "#a8f0c6";
}

function normalizeData(data) {
  const path = document.getElementById("librarySelect").value.split("/");
  let obj = data;
  for (let key of path) {
    if (obj && obj[key]) obj = obj[key];
    else return null;
  }

  // PAO 0–9
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

  // PAO 00–99
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

  return obj;
}

function loadPAOObject(obj) {
  pao = obj || {};
  keys = Object.keys(pao).sort((a,b)=>Number(a)-Number(b));
  if (!keys.length) throw new Error("No data in JSON file.");
  setStatus(`Loaded ${keys.length} cards.`);
  nextCard();
}

function renderEntry(key, entry) {
  if (!entry) return "—";
  if (entry.person && entry.action && entry.object) {
    const lociEntries = window.lastData?.Temporal?.LibraryT1 || {};
    const lociKeys = Object.keys(lociEntries);
    const randomLoci = lociEntries[lociKeys[Math.floor(Math.random()*lociKeys.length)]];
    const lociValue = randomLoci?.el || randomLoci?.en || "";
    const loci = "Random Locus: " + lociValue;
    const left = `Person: ${entry.person}\nAction: ${entry.action}\nObject: ${entry.object}`;
    document.getElementById("back-code").textContent = `Κωδικός: ${key}`;
    document.getElementById("back-left").textContent = left;
    document.getElementById("back-loci").textContent = loci;
    document.getElementById("back-right").textContent = "";
    return "";
  }
  if (entry.el && entry.en) return `${entry.el}\n${entry.en}`;
  if (typeof entry === "string") return entry;
  return JSON.stringify(entry,null,2);
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
  if (!keys.length) return;
  document.getElementById("back").style.display = "block";
  showingAnswer = true;
}

// ✅ Ενημερωμένο για online φόρτωση από GitHub Pages
async function autoFetch() {
  try {
    setStatus("Automatic loading…");
    const res = await fetch("../json/libraries_v.3.3.json?ts=" + Date.now(), { cache:"no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    window.lastData = data;
    const normalized = normalizeData(data);
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
      loadPAOObject(normalized);
    } catch(e){ setStatus("Non valid JSON.", true); }
  };
  reader.readAsText(file,"utf-8");
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





