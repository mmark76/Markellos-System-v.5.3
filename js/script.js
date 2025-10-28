/* ================================
   Markellos CMS v5.3 — Core Script
   ================================ */

let libs = null;
let gameMoves = [];
let selectedLang = 'el';

/* ---------- Global Locus Mode ---------- */
let locusMode = 'half'; // προεπιλογή: ανά ημικίνηση

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
function sideGR(side){ return side==='White' ? 'Λευκό' : 'Μαύρο'; }
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
  return (node[selectedLang] || node.el || node.en || '');
}
function t2Label(idx){
  const node = libs?.Temporal?.LibraryT2?.[String(idx)];
  if(!node) return '';
  return (node[selectedLang] || node.el || node.en || '');
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
  if (locusMode === 'full') {
    const label = t1Label(m.movePair);
    return label || '';
  } else {
    const label = t1Label(m.index + 1);
    return label || '';
  }
}

/* ---------- Manual Anchors ---------- */
let manualAnchors = {};  
function anchorForMove(index) { return manualAnchors[index] ? '⚓' : ''; }
function anchorForMovePair(n) { return anchorForMove(n); }

/* ---------- PGN parsing ---------- */
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

/* ---------- SAN TABLE ---------- */
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

/* ---------- Associations Table ---------- */
function fillAssociationsTable(moves){
  const body = document.getElementById('assocBody');
  if (!body) return;
  body.innerHTML = '';

  const Lpieces = libs?.Characters?.LibraryC2 || {};
  const Ltarget = libs?.Spatial?.LibraryS1 || {};
  const assocBySquare = Object.create(null);

  function getAssocFor(pieceLetter, fromSq) {
    return (
      Lpieces[`${pieceLetter}${fromSq||''}`] ||
      Lpieces[fromSq||''] ||
      Lpieces[pieceLetter] ||
      pieceGreek(pieceLetter) ||
      ''
    );
  }

  moves.forEach(m => {
    const locus = locusForMove(m);
    const anchor = anchorForMove(m.index);
    let pieceAssoc = assocBySquare[m.from] || getAssocFor(m.piece, m.from);
    if (m.from) delete assocBySquare[m.from];
    const sanClean = (m.san||'').replace(/[+#?!]+/g,'');
    if (sanClean.startsWith('O-O')) {
      const long = sanClean.startsWith('O-O-O');
      const white = (m.side === 'White');
      const rookFrom = white ? (long ? 'a1':'h1') : (long ? 'a8':'h8');
      const rookTo   = white ? (long ? 'd1':'f1') : (long ? 'd8':'f8');
      if (assocBySquare[rookFrom]) {
        assocBySquare[rookTo] = assocBySquare[rookFrom];
        delete assocBySquare[rookFrom];
      } else {
        assocBySquare[rookTo] = getAssocFor('R', rookFrom);
      }
    }
    if ((m.flags||'').includes('e') && /^[a-h][1-8]$/.test(m.to)) {
      const toFile = m.to[0];
      const toRank = parseInt(m.to[1],10);
      const capRank = (m.side === 'White') ? (toRank-1) : (toRank+1);
      const capSq = `${toFile}${capRank}`;
      if (assocBySquare[capSq]) delete assocBySquare[capSq];
    }
    assocBySquare[m.to] = pieceAssoc;
    const targetAssocRaw = Ltarget[m.to];
    const targetAssoc = targetAssocRaw
      ? (targetAssocRaw[selectedLang] || targetAssocRaw.el || targetAssocRaw.en || '')
      : '';
    const sentence = `${pieceAssoc} πηγαίνει στο ${m.to} (${targetAssoc}).`;
    const tr = document.createElement('tr');
    tr.dataset.index = m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td style="text-align:center;">${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(pieceAssoc)}</td>`+
      `<td>${escapeHtml(targetAssoc)}</td>`+
      `<td>${escapeHtml(sentence)}</td>`;
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
  const collection = (collSel && collSel.value) ? collSel.value : 'LibraryP1';
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

/* ---------- Load Libraries (διορθωμένη με bridge) ---------- */
async function loadLibraries(){
  try {
    const res = await fetch('libraries.json');
    libs = await res.json();

    // --- Προσαρμογή Spatial από m/f σε el/en ---
    if (libs?.Spatial?.LibraryS1) {
      for (let sq in libs.Spatial.LibraryS1) {
        let e = libs.Spatial.LibraryS1[sq];
        if (e.m && !e.el) e.el = e.m;
        if (e.f && !e.en) e.en = e.f;
      }
    }

    console.log("✅ Libraries loaded:", Object.keys(libs));
    if (libs) renderAll();
  } catch (err) {
    console.error("❌ Σφάλμα φόρτωσης βιβλιοθηκών:", err);
  }
}

/* ---------- Initialization ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  const langSel = document.getElementById('langSelect');
  if(langSel){
    selectedLang = (langSel.value || 'el');
    langSel.addEventListener('change', ()=>{
      selectedLang = langSel.value || 'el';
      renderAll();
    });
  }

  await loadLibraries();
  wirePGN();
  wireTableSelect();

  const ta = document.getElementById('pgnText');
  if(ta && ta.value.trim()){
    gameMoves = parsePGN(ta.value);
  }

  renderAll();
  enableManualAnchors();
});

function wirePGN() {
  const ta = document.getElementById('pgnText');
  if (!ta) return;
  ta.addEventListener('input', () => {
    gameMoves = parsePGN(ta.value);
    renderAll();
  });
}
