/* ===========================================================
   Markellos CMA v3.3 — Unified Core (cms.bundle.js)
   Libraries Loader + Active Library Engine + Renderer + User Libs + Palace Mapper
   =========================================================== */

/* ---------- Global State ---------- */
let libs = null;
let gameMoves = [];
let selectedLang = 'en';
let locusMode = 'half';
let manualAnchors = {};

/* ===========================================================
   1. UI HELPERS & CONSTANTS
   =========================================================== */

function sideGR(side){ return side==='White' ? 'White' : 'Black'; }

const PIECE_GREEK = {
  P:'Στρατιώτης', N:'Ίππος', B:'Αξιωματικός',
  R:'Πύργος', Q:'Βασίλισσα', K:'Βασιλιάς'
};
function pieceGreek(letter){ return PIECE_GREEK[letter] || letter; }

function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

const PIECE_TO_P = {P:1, N:2, B:3, R:4, Q:5, K:6};
const FILE_TO_NUM = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8};

/* ===========================================================
   2. ACTIVE LIBRARY ENGINE
   =========================================================== */

function setActiveLibrary(type, path) {
  localStorage.setItem("activeLibrary", JSON.stringify({ type, path }));
  console.log(`📘 Active library set → ${type || "default"} (${path || "none"})`);
}
function getActiveLibrary() {
  const data = localStorage.getItem("activeLibrary");
  return data ? JSON.parse(data) : null;
}

/* ===========================================================
   3. LIBRARIES ACCESSORS (DEFAULT + USER OVERRIDES ΟΠΟΥ ΥΠΑΡΧΟΥΝ)
   =========================================================== */

function t1Label(idx){
  const node = libs?.Temporal?.LibraryT1?.[String(idx)];
  if(!node) return '';
  return (node.locus_en || node[selectedLang] || node.el || '');
}
function t2Label(idx){
  const node = libs?.Temporal?.LibraryT2?.[String(idx)];
  if(!node) return '';
  return (node.locus_en || node[selectedLang] || node.el || '');
}
function s1Square(square){
  const node = libs?.Spatial?.LibraryS1?.[square];
  if(!node) return '';
  return (node[selectedLang] || node.el || node.en || '');
}
function p1PAO(d) {
  const P = String(d.P);
  const A = String(d.F);
  const O = String(d.R);
  const lib = libs?.["PAO 0-9"]?.Library_p1;
  if (!lib) return { person: '', action: '', object: '' };
  const lang = selectedLang || 'el';
  const person = lib?.persons?.[P]?.[lang] || lib?.persons?.[P]?.el || '';
  const action = lib?.actions?.[A]?.[lang] || lib?.actions?.[A]?.el || '';
  const object = lib?.objects?.[O]?.[lang] || lib?.objects?.[O]?.el || '';
  return { person, action, object };
}
function p2p3Get(idx2, collection){
  const lib = libs?.["PAO 00-99"]?.[collection];
  if(!lib) return {person:'',action:'',object:''};
  const node = lib?.[idx2];
  if(!node) return {person:'',action:'',object:''};
  return {person: node.person||'', action: node.action||'', object: node.object||''};
}
function v1Verse(pieceLetter, file, rank, side, moveNo){
  const V = libs?.Verses?.LibraryV1;
  if(!V) return {piece:'',file:'',rank:'',closing:''};
  const piece = V.Pieces?.[pieceLetter]?.[selectedLang] || V.Pieces?.[pieceLetter]?.el || '';
  const fileTxt = V.Files?.[file]?.[selectedLang] || V.Files?.[file]?.el || '';
  const rankTxt = V.Ranks?.[String(rank)]?.[selectedLang] || V.Ranks?.[String(rank)]?.el || '';
  const closings = (side==='White' ? V.Closings?.White : V.Closings?.Black) || [];
  const idx = ((moveNo-1) % Math.max(1, closings.length));
  const closing = closings[idx]?.[selectedLang] || closings[idx]?.el || '';
  return {piece, file:fileTxt, rank:rankTxt, closing};
}

/* ===========================================================
   4. LOCUS MODE + MANUAL ANCHORS
   =========================================================== */

function locusForMove(m) {
  const total = 80;
  if (locusMode === 'full') {
    const idx = ((m.movePair - 1) % total) + 1;
    const label = t1Label(idx);
    return label || '';
  } else {
    const idx = (m.index % total) + 1;
    const label = t1Label(idx);
    return label || '';
  }
}
function anchorForMove(index) {
  return manualAnchors[index] ? '⚓' : '';
}
function anchorForMovePair(n) {
  return anchorForMove(n);
}

/* ===========================================================
   5. PGN PARSING & CLEANING
   =========================================================== */

function cleanPGN(pgn){
  return String(pgn || '')
    .replace(/\{\[%.*?\]\}/gs, '')
    .replace(/\[%.*?\]/gs, '')
    .replace(/\{[^}]*\}/gs, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parsePGN(pgn){
  pgn = String(pgn || '').replace(/\r\n/g, '\n');
  pgn = pgn.replace(/\{\[%[\s\S]*?\]\}/g, '');
  pgn = pgn.replace(/\[%[\s\S]*?\]/g, '');
  pgn = pgn.replace(/\{[^}]*\}/g, '');
  pgn = pgn
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(\]\n)(?!\n)/g, '$1\n')
    .trim();

  const chess = new Chess();
  chess.load_pgn(pgn, { sloppy: true });
  const hist = chess.history({ verbose:true });
  const tmp = new Chess();
  let out=[];
  hist.forEach((mv,i)=>{
    tmp.move(mv);
    const fen = tmp.fen();
    const side = (i%2===0)?'White':'Black';
    const moveNumber = Math.floor(i/2)+1;
    const moveNumDisplay = (side==='White')?`${moveNumber}.`:`${moveNumber}...`;
    const pieceLetter = mv.piece ? mv.piece.toUpperCase() : (mv.san[0]?.toUpperCase()||'P');
    out.push({
      index:i, moveNumber, moveNumDisplay, movePair:moveNumber,
      side, san:mv.san, piece:pieceLetter, from:mv.from, to:mv.to, fen,
      flags: mv.flags || '', promotion: mv.promotion || null
    });
  });
  return out;
}

/* ===========================================================
   6. TABLE RENDERERS
   =========================================================== */

function fillSanTable(moves){
  const body = document.getElementById('sanBody'); 
  if(!body) return;
  body.innerHTML='';

  moves.forEach(m=>{
    const locus = locusForMove(m);
    const anchor = anchorForMove(m.index);
    const pieceDisplay = `${m.piece} — ${pieceGreek(m.piece)}`;
    const tr = document.createElement('tr');
    tr.dataset.index = m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td style="text-align:center;">${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(pieceDisplay)}</td>`+
      `<td>${escapeHtml(m.to)}</td>`+
      `<td>${escapeHtml(m.fen)}</td>`;
    body.appendChild(tr);
  });
}

function enableManualAnchors() {
  document.querySelectorAll('#sanBody, #assocBody, #paoBody, #pao99Body, #verseBody')
    .forEach(table => {
      table.querySelectorAll('tr').forEach(tr => {
        const moveIndex = tr.dataset.index;
        tr.onclick = () => {
          if (manualAnchors[moveIndex]) {
            delete manualAnchors[moveIndex];
          } else {
            manualAnchors[moveIndex] = true;
          }
          renderAll();
          enableManualAnchors();
        };
      });
    });
}

function fillAssociationsTable(moves){
  const body = document.getElementById('assocBody'); 
  if(!body) return;
  body.innerHTML='';

  const userChars = libs?.User?.Characters;
  let getPieceName;

  if (userChars) {
    getPieceName = (square, piece) => {
      // δοκιμάζουμε όλα τα πιθανά keys
      return userChars?.white?.pawn?.[square]?.name ||
             userChars?.white?.knight?.[square]?.name ||
             userChars?.white?.bishop?.[square]?.name ||
             userChars?.white?.rook?.[square]?.name ||
             userChars?.white?.queen?.[square]?.name ||
             userChars?.white?.king?.[square]?.name ||

             userChars?.black?.pawn?.[square]?.name ||
             userChars?.black?.knight?.[square]?.name ||
             userChars?.black?.bishop?.[square]?.name ||
             userChars?.black?.rook?.[square]?.name ||
             userChars?.black?.queen?.[square]?.name ||
             userChars?.black?.king?.[square]?.name ||

             pieceGreek(piece);
    };
  } else {
    const C2 = libs?.Characters?.LibraryC2 || {};
    const C3 = libs?.Characters?.LibraryC3 || {};
    getPieceName = (square, piece) =>
      C3[piece + square + "_name"] ||
      C2[piece + square] ||
      pieceGreek(piece);
  }

  const Ltarget1 = libs?.Spatial?.LibraryS1 || {};
  const Ltarget2 = libs?.Spatial?.LibraryS2 || {};

  const assocBySquare = Object.create(null);
  const getAssocFor = (pieceLetter, fromSq) =>
    getPieceName(pieceLetter + (fromSq || "")) ||
    getPieceName(fromSq || "") ||
    getPieceName(pieceLetter) ||
    pieceGreek(pieceLetter);

  moves.forEach(m=>{
    const locus  = locusForMove(m);
    const anchor = anchorForMove(m.index);

    let pieceAssoc = assocBySquare[m.from] || getPieceName(m.from, m.piece);
    if(m.from) delete assocBySquare[m.from];

    const sanClean = (m.san||'').replace(/[+#?!]+/g,'');
    if(sanClean.startsWith('O-O')){
      const long  = sanClean.startsWith('O-O-O');
      const white = (m.side==='White');
      const rookFrom = white ? (long ? 'a1':'h1') : (long ? 'a8':'h8');
      const rookTo   = white ? (long ? 'd1':'f1') : (long ? 'd8':'f8');
      if(assocBySquare[rookFrom]){
        assocBySquare[rookTo] = assocBySquare[rookFrom];
        delete assocBySquare[rookFrom];
      }else{
        assocBySquare[rookTo] = getAssocFor('R', rookFrom);
      }
    }

    if((m.flags||'').includes('e') && /^[a-h][1-8]$/.test(m.to)){
      const toFile = m.to[0], toRank = parseInt(m.to[1],10);
      const capRank = (m.side==='White') ? (toRank-1) : (toRank+1);
      const capSq = `${toFile}${capRank}`;
      if(assocBySquare[capSq]) delete assocBySquare[capSq];
    }

    assocBySquare[m.to] = pieceAssoc;

    const node = (selectedLang === 'el' ? Ltarget2[m.to] : Ltarget1[m.to]) || null;
    const targetAssoc = node?.['Target Square Association'] || m.to;

    const tr = document.createElement('tr');
    tr.dataset.index = m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(m.to)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(pieceAssoc)}</td>`+
      `<td>${escapeHtml(targetAssoc)}</td>`;
    body.appendChild(tr);
  });
}

/* ----- PAO 0–9 ----- */

function toPFR(m){
  const P = PIECE_TO_P[m.piece] || 0;
  const F = FILE_TO_NUM[m.to?.[0]] || 0;
  const R = Number(m.to?.[1]||0);
  return {P,F,R};
}
function formatPFR(pfr){ return `${pfr.P}${pfr.F}${pfr.R}`; }

function fillPaoTable_0_9(moves){
  const body = document.getElementById('paoBody'); if(!body) return;
  body.innerHTML='';
  moves.forEach(m=>{
    const locus = locusForMove(m);
    const anchor = anchorForMove(m.index);
    const pfr = toPFR(m);
    const code = formatPFR(pfr);
    const {person,action,object} = p1PAO(pfr);
    const tr=document.createElement('tr'); tr.dataset.index=m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(`${code} (${m.san})`)}</td>`+
      `<td>${escapeHtml(`Κωδικός: ${code}`)}<br>`+
        `${escapeHtml('P: '+person)} | ${escapeHtml('A: '+action)} | ${escapeHtml('O: '+object)}</td>`;
    body.appendChild(tr);
  });
}

/* ----- PAO 00–99 ----- */

function weave6Digits(pfrW, pfrB){
  const a = `${pfrW.P}${pfrW.F}`;
  const b = `${pfrW.R}${pfrB.P}`;
  const c = `${pfrB.F}${pfrB.R}`;
  return {a,b,c,all:`${a}${b}${c}`};
}
function twoDigit(str){ return String(str).padStart(2,'0'); }

function fillPaoTable_00_99(moves){
  const body = document.getElementById('pao99Body'); if(!body) return;
  const collSel = document.getElementById('pao99CollectionSelect');
  const collection = (collSel && collSel.value) ? collSel.value : 'LibraryDefaultP1';
  body.innerHTML='';
  for(let i=0;i<moves.length;i+=2){
    const wm=moves[i], bm=moves[i+1]; if(!wm||!bm) break;
    const movePair=wm.movePair;
    const locus = locusForMove(wm);
    const anchor = anchorForMove(wm.index);
    const parts = weave6Digits(toPFR(wm), toPFR(bm));
    const P = p2p3Get(twoDigit(parts.a), collection).person;
    const A = p2p3Get(twoDigit(parts.b), collection).action;
    const O = p2p3Get(twoDigit(parts.c), collection).object;
    const tr=document.createElement('tr'); tr.dataset.index=wm.index;
    tr.innerHTML =
      `<td>${escapeHtml(`${movePair}.`)}</td>`+
      `<td>${escapeHtml(`${wm.san}  ${bm.san}`)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml('Πλήρης κίνηση')}</td>`+
      `<td>${escapeHtml(parts.all)}</td>`+
      `<td>${escapeHtml(`Person: ${P}`)}<br>`+
          `${escapeHtml(`Action: ${A}`)}<br>`+
          `${escapeHtml(`Object: ${O}`)}</td>`;
    body.appendChild(tr);
  }
}

/* ----- VERSE TABLE ----- */

function fillVerseTable(moves){
  const body = document.getElementById('verseBody'); if(!body) return;
  body.innerHTML='';
  moves.forEach(m=>{
    const locus = locusForMove(m);
    const anchor = anchorForMove(m.index);
    const file = m.to?.[0]; const rank = Number(m.to?.[1]||0);
    const v = v1Verse(m.piece, file, rank, m.side, m.moveNumber);
    const tr=document.createElement('tr'); tr.dataset.index=m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(`Piece: ${v.piece}`)}<br>`+
          `${escapeHtml(`File: ${v.file}`)}<br>`+
          `${escapeHtml(`Rank: ${v.rank}`)}<br>`+
          `${escapeHtml(`Closing: ${v.closing}`)}</td>`;
    body.appendChild(tr);
  });
}

/* ----- Render All ----- */

function renderAll(){
  fillSanTable(gameMoves);
  fillAssociationsTable(gameMoves);
  fillPaoTable_0_9(gameMoves);
  fillPaoTable_00_99(gameMoves);
  fillVerseTable(gameMoves);
}

/* ===========================================================
   7. TABLE SWITCHER
   =========================================================== */

function showOnlySection(idToShow){
  const ids=['sanSection','assocSection','paoSection','pao99Section','verseSection'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display = (id===idToShow)?'block':'none';
  });
}
function wireTableSelect(){
  const sel=document.getElementById('tableSelect');
  if(!sel) return;
  showOnlySection(sel.value || 'sanSection');
  sel.addEventListener('change', ()=> showOnlySection(sel.value));
}

/* ===========================================================
   8. LIBRARIES LOADER (DEFAULT)
   =========================================================== */

async function loadLibraries(){
  const res = await fetch('json/libraries_v.3.3.json');
  libs = await res.json();
  console.log("LIBS KEYS:", Object.keys(libs));
}

/* ===========================================================
   9. USER LIBRARIES UI (DROPDOWN, STATUS)
   =========================================================== */

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

function updateUserLibraryStatus(text) {
  function write() {
    const status = document.getElementById("userLibraryStatus");
    if (!status) return setTimeout(write, 100);
    status.innerHTML = text;
  }
  write();
}

/* ===========================================================
   10. USER LIBRARY MODALS & IMPORT (from user-libraries.js)
   =========================================================== */

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

function createBackdrop() {
  const b = document.createElement("div");
  b.className = "ul-backdrop";
  return b;
}

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

function openMemoryPalaceModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "600px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Memory Palace (Route)</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "ul-modal-body";

  const pal = data.palaces?.[0] || { name: "", description: "", locations: [] };

  const nameInp = document.createElement("input");
  nameInp.className = "ul-input";
  nameInp.placeholder = "Palace name";
  nameInp.value = pal.name || "";
  nameInp.oninput = () => (pal.name = nameInp.value);

  const descInp = document.createElement("textarea");
  descInp.className = "ul-input";
  descInp.placeholder = "Description (optional)";
  descInp.style.minHeight = "60px";
  descInp.value = pal.description || "";
  descInp.oninput = () => (pal.description = descInp.value);

  const list = document.createElement("div");
  list.style.maxHeight = "360px";
  list.style.overflowY = "auto";
  list.style.border = "1px solid #333";
  list.style.padding = "8px";
  list.style.borderRadius = "8px";
  list.style.background = "#111";

  if (!Array.isArray(pal.locations) || pal.locations.length === 0) {
    pal.locations = Array.from({ length: 100 }, (_, i) => ({
      id: `L${i + 1}`,
      label: "",
      image: "",
      notes: ""
    }));
  }

  pal.locations.forEach((loc) => {
    const row = document.createElement("div");
    row.className = "ul-square-row";

    const idTag = document.createElement("div");
    idTag.className = "ul-square-label";
    idTag.textContent = loc.id;

    const label = document.createElement("input");
    label.className = "ul-input";
    label.placeholder = `Label for ${loc.id}`;
    label.value = loc.label || "";
    label.oninput = () => (loc.label = label.value);

    row.append(idTag, label);
    list.appendChild(row);
  });

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.marginTop = "10px";

  const useNowBtn = document.createElement("button");
  useNowBtn.className = "epic-btn";
  useNowBtn.textContent = "⚡ Use Now (apply to tables)";
  useNowBtn.onclick = () => {
    const labels = pal.locations.map(l => l.label || "");
    window.applyUserPalaceToTables?.(labels, pal.name || "User Palace");
    alert("✅ Applied to tables.");
  };

  const saveBtn = document.createElement("button");
  saveBtn.className = "epic-btn";
  saveBtn.textContent = "💾 Save JSON";
  saveBtn.onclick = () => {
    const out = JSON.stringify({ palaces: [pal] }, null, 2);
    const blob = new Blob([out], { type: "application/json" });
    saveAs(blob, "user_memory_palaces.json");
    alert("✅ Saved! Κάνε upload και μετά Import.");
  };

  actions.append(useNowBtn, saveBtn);

  body.appendChild(nameInp);
  body.appendChild(descInp);
  body.appendChild(list);
  body.appendChild(actions);

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openCharactersModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "720px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Characters (Pieces + Pawns)</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "ul-modal-body";

  const container = document.createElement("div");
  container.style.maxHeight = "420px";
  container.style.overflowY = "auto";
  container.style.border = "1px solid #333";
  container.style.borderRadius = "8px";
  container.style.padding = "8px";
  container.style.background = "#111";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(2, 1fr)";
  container.style.gap = "8px";

  function section(title, obj) {
    const box = document.createElement("div");
    box.style.border = "1px solid #444";
    box.style.borderRadius = "8px";
    box.style.padding = "8px";

    const h = document.createElement("div");
    h.style.fontWeight = "bold";
    h.style.marginBottom = "6px";
    h.textContent = title;
    box.appendChild(h);

    Object.keys(obj).forEach(square => {
      const row = document.createElement("div");
      row.className = "ul-square-row";

      const tag = document.createElement("div");
      tag.className = "ul-square-label";
      tag.textContent = square;

      const name = document.createElement("input");
      name.className = "ul-input";
      name.placeholder = "Name";
      name.value = obj[square].name || "";
      name.oninput = () => (obj[square].name = name.value);

      row.append(tag, name);
      box.appendChild(row);
    });

    return box;
  }

  const white = data.white || {};
  const whiteWrap = document.createElement("div");
  whiteWrap.style.gridColumn = "1 / -1";
  whiteWrap.style.marginBottom = "4px";
  whiteWrap.innerHTML = `<div style="font-weight:bold;color:#CFAF4A;">White</div>`;
  container.appendChild(whiteWrap);

  ["pawn", "knight", "bishop", "rook", "queen", "king"].forEach(p => {
    if (white[p]) container.appendChild(section(`White ${p}`, white[p]));
  });

  const black = data.black || {};
  const blackWrap = document.createElement("div");
  blackWrap.style.gridColumn = "1 / -1";
  blackWrap.style.marginTop = "8px";
  blackWrap.innerHTML = `<div style="font-weight:bold;color:#CFAF4A;">Black</div>`;
  container.appendChild(blackWrap);

  ["pawn", "knight", "bishop", "rook", "queen", "king"].forEach(p => {
    if (black[p]) container.appendChild(section(`Black ${p}`, black[p]));
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "epic-btn";
  saveBtn.style.marginTop = "10px";
  saveBtn.textContent = "💾 Save JSON";
  saveBtn.onclick = () => {
    const out = JSON.stringify(data, null, 2);
    const blob = new Blob([out], { type: "application/json" });
    saveAs(blob, "user_characters.json");
    alert("✅ Saved! Κάνε upload και μετά Import.");
  };

  body.appendChild(container);
  body.appendChild(saveBtn);

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openPAOModal(data) {
  const backdrop = createBackdrop();
  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "720px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>PAO 00–99</span>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "ul-close-btn";
  closeBtn.textContent = "✖";
  closeBtn.onclick = () => backdrop.remove();
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "ul-modal-body";

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(2, 1fr)";
  grid.style.gap = "8px";
  grid.style.maxHeight = "420px";
  grid.style.overflowY = "auto";
  grid.style.border = "1px solid #333";
  grid.style.borderRadius = "8px";
  grid.style.padding = "8px";
  grid.style.background = "#111";

  Object.keys(data).sort().forEach(code => {
    const cell = document.createElement("div");
    cell.style.border = "1px solid #444";
    cell.style.borderRadius = "8px";
    cell.style.padding = "8px";

    const title = document.createElement("div");
    title.style.fontWeight = "bold";
    title.style.marginBottom = "4px";
    title.textContent = code;
    cell.appendChild(title);

    const p = document.createElement("input");
    p.className = "ul-input";
    p.placeholder = "Person";
    p.value = data[code].person || "";
    p.oninput = () => (data[code].person = p.value);

    const a = document.createElement("input");
    a.className = "ul-input";
    a.placeholder = "Action";
    a.value = data[code].action || "";
    a.oninput = () => (data[code].action = a.value);

    const o = document.createElement("input");
    o.className = "ul-input";
    o.placeholder = "Object";
    o.value = data[code].object || "";
    o.oninput = () => (data[code].object = o.value);

    cell.append(p, a, o);
    grid.appendChild(cell);
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "epic-btn";
  saveBtn.style.marginTop = "10px";
  saveBtn.textContent = "💾 Save JSON";
  saveBtn.onclick = () => {
    const out = JSON.stringify(data, null, 2);
    const blob = new Blob([out], { type: "application/json" });
    saveAs(blob, "user_pao_00_99.json");
    alert("✅ Saved! Κάνε upload και μετά Import.");
  };

  body.appendChild(grid);
  body.appendChild(saveBtn);

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* ----- Import Button logic ----- */

function wireImportLibraryButton() {
  const importBtn = document.getElementById("importLibraryBtn");
  if (!importBtn) return;

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

          libs = libs || {};
          libs.User = libs.User || {};

          if (json.palaces) {
            libs.User.MemoryPalaces = json;
            const p = json.palaces[0];
            if (p?.locations?.length) {
              const loci = p.locations.map(l => l.label || "");
              window.applyUserPalaceToTables?.(loci, p.name || name);
            }
            updateUserLibraryStatus(
              `🏛️ <b>${p.name || name}</b> — ${p.locations.length} loci loaded 
               <span style="opacity:0.6;">(${new Date().toLocaleTimeString()})</span>`
            );
            alert("🏛️ User Memory Palace loaded!");
          }
          else if (json.white && json.black) {
            libs.User.Characters = json;
            updateUserLibraryStatus(
              `♟️ <b>User Characters</b> loaded 
               <span style="opacity:0.6;">(${new Date().toLocaleTimeString()})</span>`
            );
            alert("♟️ User Characters loaded!");
          }
          else if (json["00"] || json["01"]) {
            libs.User.PAO_00_99 = json;
            updateUserLibraryStatus(
              `🔢 <b>PAO 00–99</b> loaded 
               <span style="opacity:0.6;">(${new Date().toLocaleTimeString()})</span>`
            );
            alert("🔢 User PAO 00–99 loaded!");
          }
          else if (json.a1 || json.a2) {
            libs.User.Squares = json;
            const count = Object.keys(json).length;
            updateUserLibraryStatus(
              `🗺️ <b>Squares Map</b> — ${count} squares loaded 
               <span style="opacity:0.6;">(${new Date().toLocaleTimeString()})</span>`
            );
            alert("🗺️ User Squares loaded!");
          }
          else {
            alert("⚠️ Unknown JSON format.");
            return;
          }

          console.log("📘 Loaded library:", json);

        } catch (err) {
          alert("❌ Invalid JSON file");
        }
      };

      reader.readAsText(file);
    };

    picker.click();
  });
}

/* ----- Create Library Button ----- */

function wireCreateLibraryButton() {
  const createBtn = document.getElementById("createLibraryBtn");
  if (!createBtn) return;

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

/* ===========================================================
   11. LIBRARY SWITCHER (MODAL + DROPDOWN CHANGE)
   =========================================================== */

function openLibrarySelector() {
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

  const def = document.createElement("button");
  def.className = "epic-btn";
  def.textContent = "Default System";
  def.onclick = () => {
    setActiveLibrary("default", null);
    alert("✅ Default system activated!");
    backdrop.remove();
  };
  body.appendChild(def);

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

/* dropdown: userLibrarySelect change → load JSON and apply to libs.User */

function wireUserLibraryDropdown() {
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
      libs = libs || {};
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

      openLibrarySelector(); // αν θέλεις, μπορείς να το αφαιρέσεις
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
}

/* ===========================================================
   12. MEMORY PALACE → TABLE MAPPER (FIXED: WAITS FOR TABLES)
   =========================================================== */

(() => {
  const TABLE_IDS = ["sanBody", "assocBody", "paoBody", "pao99Body", "verseBody"];
  const LOCUS_COL = 3;

  function updateLocusColumn(tableId, lociArray) {
    const table = document.getElementById(tableId);
    if (!table || !table.tBodies.length) return;

    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    if (!rows.length) return;

    rows.forEach(row => {
      if (row.cells[LOCUS_COL]) row.cells[LOCUS_COL].textContent = "";
    });

    lociArray.forEach((label, i) => {
      const row = rows[i];
      if (row && row.cells[LOCUS_COL]) {
        row.cells[LOCUS_COL].textContent = label;
      }
    });

    console.log(`✅ Locus column updated in #${tableId} with ${lociArray.length} loci`);
  }

  function showPalaceInfo(palaceName, count) {
    let info = document.getElementById("activePalaceInfo");
    if (!info) {
      info = document.createElement("div");
      info.id = "activePalaceInfo";
      info.style.cssText = `
        color:#CFAF4A;
        margin-top:6px;
        font-size:0.9em;
        font-family:Georgia, 'Times New Roman', serif;
      `;
      const container = document.getElementById("userLibraryStatus");
      if (container) container.appendChild(info);
    }
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    info.innerHTML = `🏛️ <b>${palaceName}</b> — ${count} loci loaded 
                      <span style="color:#888;">(${now})</span>`;
  }

  function waitForTables(callback, lociArray, palaceName) {
    const allExist = TABLE_IDS.every(id => document.getElementById(id));
    if (allExist) {
      TABLE_IDS.forEach(id => updateLocusColumn(id, lociArray));
      showPalaceInfo(palaceName, lociArray.length);
    } else {
      setTimeout(() => waitForTables(callback, lociArray, palaceName), 100);
    }
  }

  window.applyUserPalaceToTables = function(lociArray, palaceName = "Unnamed") {
    if (!Array.isArray(lociArray) || !lociArray.length) return;
    waitForTables(updateLocusColumn, lociArray, palaceName);
  };
})();

/* ===========================================================
   13. PGN WIRING & INIT
   =========================================================== */

function wirePGN(){
  const ta = document.getElementById('pgnText');
  const fileInput = document.getElementById('pgnFileInput');
  const parseBtn = document.getElementById('parsePgnBtn');
  const clearBtn = document.getElementById('clearBtn');

  if(fileInput){
    fileInput.addEventListener('change', ev=>{
      const f = ev.target.files?.[0]; 
      if(!f) return;
      const r = new FileReader();
      r.onload = ()=>{ 
        const cleaned = cleanPGN(r.result);
        if(ta) ta.value = cleaned; 
        gameMoves = parsePGN(cleaned);
        manualAnchors = {};
        renderAll();
        enableManualAnchors();
      };
      r.readAsText(f);
    });
  }

  if(parseBtn){
    parseBtn.addEventListener('click', ()=>{
      const pgn = ta ? cleanPGN(ta.value) : '';
      gameMoves = parsePGN(pgn);
      manualAnchors = {};
      renderAll();
      enableManualAnchors();
    });
  }

  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      if(ta) ta.value='';
      if(fileInput) fileInput.value='';
      gameMoves=[]; 
      manualAnchors = {};
      renderAll();
    });
  }
}

/* ---------- Dropdown locker ---------- */

function lockDropdown(id, value){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML = `<option>${value}</option>`;
  el.value=value; el.disabled=true;
}

/* ---------- Export (CSV/TXT/JSON/PDF) stays as στο δικό σου script ---------- */
/* ... εδώ μπορείς να κρατήσεις τον exportTable / download logic ακριβώς όπως το έχεις ... */

/* ===========================================================
   14. DEMO GAMES MODULE — Morphy / Anderssen / Capablanca
   =========================================================== */

/* ---- PGN DATA ---- */

const demoMorphyPGN = `[Event "Paris Opera"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 
6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 
11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 
15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`;

const demoImmortalPGN = `[Event "Immortal Game"]
[Site "London ENG"]
[Date "1851.06.21"]
[Round "?"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 
6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 
11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 
16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Qxa1+ 19.Ke2 Bxg1 
20.e5 Na6 21.Nxg7+ Kd8 22.Qf6+ Nxf6 23.Be7# 1-0`;

const demoCapaPGN = `[Event "Simul Exhibition"]
[Site "USA"]
[Date "1918.??.??"]
[Round "?"]
[White "José Raúl Capablanca"]
[Black "?"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 
5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 
9.h3 Nb8 10.d4 Nbd7 11.c4 Bb7 12.Nc3 b4 
13.Nd5 Nxd5 14.exd5 exd4 15.Nxd4 Bf6 
16.Be3 Nc5 17.Bc2 g6 18.Qd2 Re8 19.Bf4 Rxe1+ 
20.Rxe1 Qd7 21.Bg5 Be5 22.f4 Bg7 23.f5 Re8 
24.f6 Bh8 25.Re7 Qd8 26.Ne6 1-0`;

/* ---- MODAL ---- */

function openDemoGamesModal() {
  const backdrop = document.createElement("div");
  backdrop.className = "ul-backdrop";

  const modal = document.createElement("div");
  modal.className = "ul-modal";
  modal.style.maxWidth = "420px";

  const header = document.createElement("div");
  header.className = "ul-modal-header";
  header.innerHTML = `<span>Demo Games</span>`;

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

  function addGame(label, pgn) {
    const btn = document.createElement("button");
    btn.className = "epic-btn";
    btn.textContent = label;
    btn.onclick = () => {
      const ta = document.getElementById("pgnText");
      ta.value = pgn;
      gameMoves = parsePGN(pgn);
      manualAnchors = {};
      renderAll();
      enableManualAnchors();
      backdrop.remove();
    };
    body.appendChild(btn);
  }

  addGame("🎭 Morphy – Opera Game (1858)", demoMorphyPGN);
  addGame("♜ Anderssen – Immortal Game (1851)", demoImmortalPGN);
  addGame("♚ Capablanca – Simul Mini", demoCapaPGN);

  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* ---- WIRE BUTTON ---- */

document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.getElementById("demoGamesBtn");
  if (demoBtn) {
    demoBtn.addEventListener("click", openDemoGamesModal);
  }
});

/* ===========================================================
   15. μοναδικό DOMContentLoaded
   =========================================================== */

document.addEventListener('DOMContentLoaded', async ()=>{

  // Γλώσσα
  const langSel = document.getElementById('langSelect');
  if(langSel){
    selectedLang = (langSel.value || 'en');
    langSel.addEventListener('change', ()=>{
      selectedLang = langSel.value || 'en';
      renderAll();
    });
  }

  // Locus mode
  const locusSelect = document.getElementById('locusMode');
  if (locusSelect) {
    locusSelect.value = locusMode;
    locusSelect.addEventListener('change', e => {
      locusMode = e.target.value;
      window.locusMode = locusMode;
      if (gameMoves && gameMoves.length) {
        renderAll();
        enableManualAnchors();
      }
    });
  }

  await loadLibraries();
  loadUserLibrariesIntoUI();

  wirePGN();
  wireTableSelect();
  wireCreateLibraryButton();
  wireImportLibraryButton();
  wireUserLibraryDropdown();

  const openBtn = document.getElementById("openLibrarySelectorBtn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      openLibrarySelector();
    });
  }

  const pao99Sel = document.getElementById('pao99CollectionSelect');
  if(pao99Sel){
    pao99Sel.addEventListener('change', ()=>{
      renderAll();
      const tableSel = document.getElementById('tableSelect');
      if(tableSel){
        showOnlySection(tableSel.value || 'sanSection');
      }
    });
  }

  const ta = document.getElementById('pgnText');
  if(ta && ta.value.trim()){
    gameMoves = parsePGN(ta.value);
  }
  renderAll();
  enableManualAnchors();

  const fenBtn=document.getElementById('openFenBuilderBtn');
  if(fenBtn){
    fenBtn.addEventListener('click', ()=> window.open('https://lichess.org/editor','_blank'));
  }

  /* ===========================================================
     DOWNLOAD TEMPLATES BUTTON
     =========================================================== */

  const tplBtn = document.getElementById("downloadTemplatesBtn");
  if (tplBtn) {
    tplBtn.addEventListener("click", async () => {

      const templates = [
        { filename: "template_characters.json", path: "user_libraries/user_characters_template.json" },
        { filename: "template_memory_palaces.json", path: "user_libraries/user_memory_palaces_template.json" },
        { filename: "template_pao_00_99.json", path: "user_libraries/user_pao_00_99_template.json" },
        { filename: "template_squares.json", path: "user_libraries/user_squares_template.json" }
      ];

      for (const tpl of templates) {
        const resp = await fetch(tpl.path);
        const json = await resp.json();
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = tpl.filename;
        a.click();
      }

      alert("📥 All template files have been downloaded!");
    });
  }
});

