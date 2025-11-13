/* ================================
   Markellos CMA v3.3 — Core Script
   ================================ */

let libs = null;
let gameMoves = [];
let selectedLang = 'en';

/* ---------- Global Locus Mode ---------- */
let locusMode = 'half';

document.addEventListener('DOMContentLoaded', () => {
  const locusSelect = document.getElementById('locusMode');
  if (locusSelect) {
    locusSelect.value = locusMode;
    locusSelect.addEventListener('change', e => {
      locusMode = e.target.value;
      
       window.locusMode = locusMode;
      if (gameMoves && gameMoves.length) {
        fillSanTable(gameMoves);
        fillAssociationsTable(gameMoves);
      }
    });
  }
});

/* ---------- UI helpers ---------- */
function sideGR(side){ return side==='White' ? 'White' : 'Black'; }
const PIECE_GREEK = {P:'Στρατιώτης', N:'Ίππος', B:'Αξιωματικός', R:'Πύργος', Q:'Βασίλισσα', K:'Βασιλιάς'};
function pieceGreek(letter){ return PIECE_GREEK[letter] || letter; }
function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

/* ---------- mappings ---------- */
const PIECE_TO_P = {P:1, N:2, B:3, R:4, Q:5, K:6};
const FILE_TO_NUM = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8};

/* ---------- Libraries accessors ---------- */
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

/* ---------- Locus ---------- */
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

// --- Χειροκίνητα Anchors ---
let manualAnchors = {}; 

function anchorForMove(index) {
  return manualAnchors[index] ? '⚓' : '';
}

function anchorForMovePair(n) {
  return anchorForMove(n);
}

/* ---------- PGN parsing ---------- */
function parsePGN(pgn){

// 🧹 Καθαρισμός meta δεδομένων κινητήρων (π.χ. [%evp ...], [%clk ...], [%emt ...])
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

/* ---------- SAN TABLE (ενημερωμένο) ---------- */
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

/* ---------- Ενεργοποίηση χειροκίνητων anchors (σε όλους τους πίνακες) ---------- */
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

/* ------- ASSOCIATIONS TABLE (labels move with pieces) ------ */
function fillAssociationsTable(moves){
  const body = document.getElementById('assocBody'); 
  if(!body) return;
  body.innerHTML='';

  // Libraries
  const userChars = libs?.User?.Characters;

  let getPieceName;

  if (userChars) {
    getPieceName = (square, piece) => {
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

    // --- Castling
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

    // --- En passant
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

/* ---------- PAO 0–9 TABLE ---------- */
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

/* ---------- PAO 00–99 TABLE ---------- */
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

/* ---------- VERSE TABLE ---------- */
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

/* ---------- Render All ---------- */
function renderAll(){
  fillSanTable(gameMoves);
  fillAssociationsTable(gameMoves);
  fillPaoTable_0_9(gameMoves);
  fillPaoTable_00_99(gameMoves);
  fillVerseTable(gameMoves);
}

/* ---------- CSV Export ---------- */
function downloadTableAsCSV(sectionId, filename){
  const section = document.getElementById(sectionId);
  if(!section){ alert('Δεν βρέθηκε ο πίνακας.'); return; }
  const table = section.querySelector('table');
  if(!table){ alert('Δεν βρέθηκε table.'); return; }
  let csv=[];
  for(const row of table.querySelectorAll('tr')){
  const cells=[...row.children].map(td=>{
  const raw=td.innerText.replace(/\r?\n/g,' ').trim();
  return `"${raw.replace(/"/g,'""')}"`;
 });
  if(cells.length) csv.push(cells.join(','));
 }
  const blob=new Blob([csv.join('\n')],{type:'text/csv;charset=utf-8;'});
  saveAs(blob, filename||'table.csv');
}

/* ---------- Table switcher ---------- */
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

/* ---------- Libraries viewer ---------- */
const LIBRARIES_BAR_ENABLED = false;

function buildLibrariesBar(){
  if (!LIBRARIES_BAR_ENABLED) {
    const sec = document.getElementById('libraries');
    if (sec) sec.style.display = 'none';
    return;
  }
  
}

/* ---------- Init ---------- */
async function loadLibraries(){
  const res = await fetch('../json/libraries_v.3.3.json');
  libs = await res.json();
  console.log("LIBS KEYS:", Object.keys(libs));
  console.log("Temporal:", libs.Temporal);
  console.log("Characters:", libs.Characters);
}

/* ---------- Καθαρισμός PGN πριν εισαχθεί στο textarea ---------- */
function cleanPGN(pgn){
  return String(pgn || '')
    // αφαιρεί blocks τύπου {[%evp ...]}, {[%clk ...]}, {[%emt ...]}
    .replace(/\{\[%.*?\]\}/gs, '')
    // αφαιρεί σκέτα [%...]
    .replace(/\[%.*?\]/gs, '')
    // αφαιρεί περιγραφικά σχόλια {...}
    .replace(/\{[^}]*\}/gs, '')
    // καθαρίζει πολλαπλά κενά και άχρηστα line breaks
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ---------- PGN σύνδεση & γεγονότα (ενημερωμένο) ---------- */
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
        chooseLibraryOnGameLoad();
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
      chooseLibraryOnGameLoad();
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

/* ---------- Init (ενιαίο) ---------- */
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

  await loadLibraries();
  loadUserLibrariesIntoUI();

  if (LIBRARIES_BAR_ENABLED) buildLibrariesBar();
  else {
    const sec = document.getElementById('libraries');
    if (sec) sec.style.display = 'none';
  }

  wirePGN();
  wireTableSelect();

  // Refresh του PAO 00–99 όταν αλλάζει συλλογή
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

  // Κλειδώνουμε τα dropdowns
  lockDropdown('sanLocusSelect','LibraryT1');
  lockDropdown('sanAnchorSelect','LibraryT2');
  lockDropdown('assocLocusSelect','LibraryT1');
  lockDropdown('assocAnchorSelect','LibraryT2');
  lockDropdown('assocCharactersSelect','LibraryC2');
  lockDropdown('assocTargetsSelect','LibraryS1');
  lockDropdown('paoLocusSelect','LibraryT1');
  lockDropdown('paoAnchorSelect','LibraryT2');
  lockDropdown('paoCodesSelect','LibraryP1');
  lockDropdown('pao99LocusSelect','LibraryT1');
  lockDropdown('pao99AnchorSelect','LibraryT2');
  lockDropdown('verseLocusSelect','LibraryT1');
  lockDropdown('verseAnchorSelect','LibraryT2');
  lockDropdown('verseLibrarySelect','LibraryV1');

  // Export dropdowns (CSV/TXT/JSON/PDF)
  document.querySelectorAll('.download-select').forEach(sel=>{
    sel.addEventListener('change', ()=>{
      if(sel.value){
        exportTable(sel.dataset.table, sel.value);
        sel.value = ''; // reset επιλογής
      }
    });
  });
});

/* ---------- Fixed dropdown locker ---------- */
function lockDropdown(id, value){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML = `<option>${value}</option>`;
  el.value=value; el.disabled=true;
}

/* ---------- Download (CSV, TXT, JSON, PDF) ---------- */
function exportTable(sectionId, format){
  const section = document.getElementById(sectionId);
  if(!section){ alert('Δεν βρέθηκε ο πίνακας.'); return; }
  const table = section.querySelector('table');
  if(!table){ alert('Δεν βρέθηκε table.'); return; }

  let rows = [];
  for(const row of table.querySelectorAll('tr')){
    const cells=[...row.children].map(td=>td.innerText.replace(/\r?\n/g,' ').trim());
    if(cells.length) rows.push(cells);
  }

  let blob;
  if(format==='csv'){
    let csv = rows.map(r=>r.map(x=>`"${x.replace(/"/g,'""')}"`).join(',')).join('\n');
    blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  }else if(format==='txt'){
    let txt = rows.map(r=>r.join('\t')).join('\n');
    blob = new Blob([txt],{type:'text/plain;charset=utf-8;'});
  }else if(format==='json'){
    blob = new Blob([JSON.stringify(rows)],{type:'application/json;charset=utf-8;'});
  }else if(format === 'pdf'){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ putOnlyUsedFonts: true });

    // δηλώνουμε τη γραμματοσειρά ΠΡΩΤΑ
    doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // επικεφαλίδες & σειρές
    const headers = [...table.querySelectorAll('thead th')].map(th => th.innerText);
    const data = rows.slice(1);

    // κείμενο τίτλου
    doc.text("Chess Mnemonic System Export", 14, 15);

    // πίνακας με Roboto
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 25,
      styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8 }
    });

    doc.save(`${sectionId}.pdf`);
    return;
  }else{
    return;
  }
  saveAs(blob, `${sectionId}.${format}`);
}

// === Universal Hide/Unhide Columns for All Tables ===
document.addEventListener("DOMContentLoaded", () => {

// Επιλέγει όλους τους πίνακες (εκτός αν θέλεις να εξαιρέσεις κάποιους)
  document.querySelectorAll("table").forEach((table, tableIndex) => {

// Δημιουργεί toolbar για κάθε πίνακα
    const toolbar = document.createElement("div");
    toolbar.className = "table-toolbar";
    toolbar.style.marginBottom = "8px";

// Βρίσκει όλες τις κεφαλίδες στηλών (th)
    const headers = table.querySelectorAll("th");
    headers.forEach((th, idx) => {
      const colName = th.textContent.trim() || `Στήλη ${idx + 1}`;
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.dataset.colIndex = idx;

      cb.addEventListener("change", () => {
        const show = cb.checked;
        table.querySelectorAll("tr").forEach(row => {
          const cell = row.children[idx];
          if (cell) cell.style.display = show ? "" : "none";
        });
      });

      label.appendChild(cb);
      label.append(" " + colName);
      toolbar.appendChild(label);
    });

// Εισάγει το toolbar ακριβώς πριν από κάθε πίνακα
    table.parentNode.insertBefore(toolbar, table);
  });
});

/* ---------- User Libraries Loader (placeholder) ---------- */
function loadUserLibrariesIntoUI() {
  // Διαβάζουμε τι έχει αποθηκευτεί (αν υπάρχει)
  const saved = JSON.parse(localStorage.getItem("savedLibraries") || "[]");

  // Αν δεν υπάρχουν custom βιβλιοθήκες, σταματάμε εδώ.
  if (!saved.length) {
    console.log("No user libraries found — using default libraries only.");
    return;
  }

  // Προς το παρόν απλά ενημερώνουμε ότι υπάρχουν.
  // Αργότερα εδώ θα μπει UI επιλογής.
  console.log("✅ Loaded user libraries list:", saved);
}
