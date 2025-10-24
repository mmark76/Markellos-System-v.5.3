# README v.5.3 (διορθωμένο, πλήρες + Roboto integration)

> Δημιουργήθηκε με τη βοήθεια ΤΝ (ChatGPT). Ελέγξτε πριν από διανομή/δημοσίευση.

## Σκοπός
Εργαλείο αποτύπωσης, οργάνωσης και εξαγωγής μνημονικών συσχετίσεων για σκάκι (και συναφείς γνωστικές εργασίες). Υποστηρίζει εισαγωγή δεδομένων, κανόνες Locus/Anchor/Associations/PAO/Verses, προβολές σε πίνακες και μαζικές εξαγωγές.

---

## Γρήγορη εκκίνηση
1. Αποσυμπίεσε/τοποθέτησε όλα τα αρχεία στον ίδιο φάκελο.
2. Άνοιξε **`index.html`** σε σύγχρονο browser (Chrome/Edge/Firefox).
3. (Προαιρετικά) Τρέξε το **`start_server_v.5.3.bat`** σε Windows για τοπικό server.

**Σημείωση FEN Builder:** Το κουμπί «FEN Builder» ανοίγει **τον εξωτερικό ιστότοπο** `chess-api.online` σε νέο παράθυρο. Δεν απαιτούνται τοπικά αρχεία `fen-builder.html/js`.

---

## Δομή project
```
/ (ρίζα)
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── script.js
│   ├── epic.js
│   ├── epic-ui-init.js
│   └── fonts/
│       └── Roboto-Regular-normal.js     # για jsPDF (προαιρετικό)
├── fonts/
│   ├── Roboto-VariableFont_wdth,wght.ttf
│   ├── Roboto-Italic-VariableFont_wdth,wght.ttf
│   └── OFL.txt
├── libraries_v3.2.json
├── start_server_v.5.3.bat
└── README v.5.3.md
```

> **Σημαντικό:** Το `index.html` αναμένει τα CSS/JS **μέσα στους φακέλους** `css/` και `js/` αντίστοιχα.  
> Οι γραμματοσειρές Roboto μπορούν να βρίσκονται σε ξεχωριστό φάκελο `/fonts/`.

---

## Υλοποίηση & βασικές δυνατότητες
- **Διάταξη 3 στηλών**: Εισαγωγή/έλεγχος, κύριος καμβάς, βοηθητικές προβολές.
- **Σκούρο θέμα** με σύγχρονη τυπογραφία Roboto.
- **Sticky header** και **responsive tables**.
- **Google Translate widget** για γρήγορη μετάφραση.
- **Επιλογή ενεργού πίνακα** (Associations, PAO, Verses).
- **Κανόνες/Ροές**: Locus → Anchor → Association → PAO → Verse.
- **Libraries**: Φορτώνονται από `libraries_v3.2.json`.
- **PGN helpers** και utilities για ανάλυση κειμένων.
- **Μαζικές εξαγωγές**: CSV, TXT, JSON, PDF.
- **Epic Narrative View (v5.6)**: αφήγηση κινήσεων με φυσική γλώσσα.

---

## Νέα δυνατότητα: Ενσωμάτωση γραμματοσειρών Roboto

Η έκδοση 5.3 υποστηρίζει πλέον πλήρως τη χρήση **Roboto Variable Font** για ομοιόμορφη τυπογραφία σε περιβάλλον και PDF εξαγωγές.

### 1️⃣ Για εμφάνιση στην εφαρμογή
Προσθέστε στο `css/styles.css`:
```css
@font-face {
  font-family: 'Roboto';
  src: url('../fonts/Roboto-VariableFont_wdth,wght.ttf') format('truetype');
  font-weight: 100 900;
  font-stretch: 75% 125%;
}
body {
  font-family: 'Roboto', Arial, sans-serif;
}
```

### 2️⃣ Για χρήση στις PDF εξαγωγές
Το αρχείο `js/fonts/Roboto-Regular-normal.js` επιτρέπει τη χρήση της ίδιας γραμματοσειράς μέσα στα PDF (μέσω **jsPDF**).  
Αυτό φορτώνεται ήδη στο `index.html`:
```html
<script src="js/fonts/Roboto-Regular-normal.js"></script>
```
Αν δεν απαιτείται PDF εξαγωγή, το αρχείο μπορεί να αφαιρεθεί.

### 3️⃣ Άδεια και προέλευση
Η γραμματοσειρά **Roboto** διανέμεται υπό την άδεια **SIL Open Font License 1.1**.  
Το αρχείο `OFL.txt` πρέπει να διατηρείται στον φάκελο `/fonts/` για λόγους συμμόρφωσης.

---

## Φόρμες δεδομένων (ενδεικτικά πεδία)
- **Associations**: Locus, Anchor, Association, Note, Tags, Links.
- **PAO**: Person, Action, Object, Index, Note.
- **Verses**: Reference, Text, Notes, Links.
- **Temporal/Spatial/Characters**: όπως ορίζεται στο `script.js`.

---

## Εξαγωγές
- **CSV / TXT / JSON / PDF** — βασισμένες στα ορατά δεδομένα κάθε πίνακα.
- Οι PDF εξαγωγές υποστηρίζουν πλέον πλήρως **Roboto embedded font**.

---

## Συμβουλές
- Κράτα συνεπή **Tags**.
- Προτίμησε σύντομες περιγραφές σε Association/PAO/Verse.
- Διατήρησε ξεχωριστά backup των `libraries_v3.2.json`.

---

## Αλλαγές στην 5.3 (σύνοψη)
- Ενσωμάτωση **Roboto Variable Font** (UI + PDF).
- Σταθεροποίηση «Associations fix».
- Ενοποίηση εξαγωγών CSV/TXT/JSON/PDF.
- Διόρθωση paths και τεκμηρίωσης.
- Βελτίωση διεπαφής Epic Narrative.

---

## Άδεια & απόδοση
Προσωπικό project. Χρήση «ως έχει».  
Για αναφορές/παράγωγα: **Markellos Markides**.  
Η γραμματοσειρά Roboto © Google — διανέμεται υπό την **SIL Open Font License 1.1**.
