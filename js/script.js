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
  pgn = String(pgn || '').replace(/\r\n/g, '\n')
    .replace(/\{\[%[\s\S]*?\]\}/g, '')
    .replace(/\[%[\s\S]*?\]/g, '')
    .replace(/\{[^}]*\}/g, '')
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

/* ---------- Fill Tables ---------- */
function fillSanTable(moves){ ... }  // (όπως ήδη έχεις)
function fillAssociationsTable(moves){ ... }
function fillPaoTable_0_9(moves){ ... }
function fillPaoTable_00_99(moves){ ... }
function fillVerseTable(moves){ ... }

function renderAll(){
  fillSanTable(gameMoves);
  fillAssociationsTable(gameMoves);
  fillPaoTable_0_9(gameMoves);
  fillPaoTable_00_99(gameMoves);
  fillVerseTable(gameMoves);
}

/* ---------- Load Libraries ---------- */
async function loadLibraries(){
  const res = await fetch('libraries.json');
  libs = await res.json();
  console.log("LIBS KEYS:", Object.keys(libs));
  console.log("Temporal:", libs.Temporal);
  console.log("Characters:", libs.Characters);

  // ✅ FIX: renderAll after libraries load
  if (libs) renderAll();
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
  if(ta && ta.value.trim()){ gameMoves = parsePGN(ta.value); }

  renderAll();
  enableManualAnchors();
});
