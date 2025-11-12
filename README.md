# Chess Mnemonic Application and Epic Chess Stories Creator — v.3.3
*(Updated Unified Documentation — English & Greek)*  

---

## ENGLISH VERSION  

### 1. Overview  

The **Chess-Mnemonic-Application-and-Epic-Chess-Stories-Creator-v.3.3** is an advanced mnemonic and cognitive framework built as a modular **web-based system**.  
It integrates temporal, spatial, and associative layers of memory through structured visual and linguistic cues.  

It serves as both a **learning environment** and a **cognitive architecture**, enabling users to organize and retrieve complex information efficiently — combining **memory palaces**, **PAO encoding**, and **semantic linking**.

---

### 2. System Architecture  

| Layer              | Component                        | Description |
| ------------------ | -------------------------------- | ------------ |
| **Interface**      | `index.html`                     | Main UI entry point; initializes logic and data. |
| **Styling**        | `/css/`                          | Contains `styles.css`, `epic.css`, `epic-ui.css`, `user-libraries.css`. |
| **Logic**          | `/js/`                           | Contains all functional scripts controlling flow, interactivity, and visualization. |
| **Knowledge Base** | `/data/` + `libraries_v.3.3.json` | JSON-based data libraries (mnemonic, PAO, palaces, characters). |

---

### 3. Data Flow  

1. `index.html` initializes the interface and loads scripts.  
2. `epic-ui-init.js` configures the UI and connects DOM elements.  
3. `epic.js` manages the core logic, linking JSON libraries to mnemonic visuals.  
4. `user-libraries.js` and `library-switcher.js` handle dynamic library selection, import/export, and user templates.  
5. `script.js` manages runtime behavior, event handling, and data rendering.  

---

### 4. Library System  

#### 4.1 Structure  

| Category | Example Libraries | Purpose |
|-----------|------------------|----------|
| **Temporal** | `LibraryT1`, `LibraryT2` | Sequential recall |
| **Spatial** | `LibraryS1`, `LibraryS2` | Physical loci and structures |
| **Characters** | `LibraryC1`, `LibraryC2`, `LibraryC3` | Associative entities |
| **PAO** | `Library_p1`, `LibraryP1`–`LibraryP5` | Person–Action–Object encoding |
| **Verses** | `LibraryV1` | Rhythmic linguistic reinforcement |
| **Foundations** | `LibraryF1` | Conceptual grounding and logic |

---

### 5. User Data Templates  

Located in the `/data/` directory:

```
/data/
├── user_characters_template.json
├── user_memory_palaces_template.json
├── user_pao_00_99_template.json
└── user_squares_template.json
```

Each template provides editable structures for personalized mnemonic systems stored locally via `localStorage`.

---

### 6. Styling Layer  

- `styles.css` – overall layout, dark theme, responsive grid  
- `epic-ui.css` – parchment UI and typography  
- `epic.css` – epic narrative modal styling  
- `user-libraries.css` – user library management and modals  

---

### 7. Script Modules  

| Script | Role |
|--------|------|
| `epic-ui-init.js` | UI initialization |
| `epic.js` | Core logic & data linkage |
| `script.js` | Runtime and event control |
| `library-switcher.js` | Library loading and switching |
| `user-libraries.js` | User library management |
| `Roboto-Regular-normal.js` | Font embedding support |

---

### 8. Philosophical Foundation  

The **Markellos System** rests on the idea that memory is **spatial, rhythmic, and semantic**.  
Each layer forms a coordinate of awareness:  
- *Spatial* gives context.  
- *Temporal* gives sequence.  
- *Characters and PAO* provide emotion and narrative depth.  

Together, they create an **internal cognitive architecture** — a system for structured recall and synthesis.

---

### 9. Live Versions  

- 🎯 **Main Application:**  
  [https://mmark76.github.io/Chess-Mnemonic-Application-and-Epic-Chess-Stories-Creator-v.3.3/index.html](https://mmark76.github.io/Chess-Mnemonic-Application-and-Epic-Chess-Stories-Creator-v.3.3/index.html)

- 🧠 **Flashcards Trainer:**  
  [https://mmark76.github.io/flashcards/index.html](https://mmark76.github.io/flashcards/index.html)

- 📚 **Documentation Blog:**  
  [https://markellos-chess-mnemonic-system.blogspot.com/](https://markellos-chess-mnemonic-system.blogspot.com/)

---

### 10. Changelog v.3.3.1  

- Updated project folder name  
- Added `/data/` user templates section  
- Added `library-switcher.js` & `user-libraries.js`  
- Revised structure for GitHub Pages deployment  
- Added live URLs for main app and flashcards  
- Clarified bilingual documentation alignment  

---

© 2025 Markellos. All rights reserved.  

---

## ΕΛΛΗΝΙΚΗ ΕΚΔΟΣΗ  

### 1. Επισκόπηση  

Η **Chess-Mnemonic-Application-and-Epic-Chess-Stories-Creator-v.3.3.1** αποτελεί ένα προηγμένο **γνωστικό και μνημονικό σύστημα**, σχεδιασμένο ως **διαδικτυακή εφαρμογή**.  
Ενοποιεί τα χρονικά, χωρικά και συνειρμικά επίπεδα μνήμης μέσα από δομημένα οπτικά και γλωσσικά ερεθίσματα.  

Συνδυάζει **τεχνικές παλατιών μνήμης**, **κωδικοποίηση PAO (Person–Action–Object)** και **σημασιολογική σύνδεση**, λειτουργώντας ως εργαλείο εκπαίδευσης και γνωστικής αρχιτεκτονικής.

---

### 2. Αρχιτεκτονική Συστήματος  

| Επίπεδο | Στοιχείο | Περιγραφή |
|----------|-----------|------------|
| **Διεπαφή** | `index.html` | Κύριο σημείο εκκίνησης UI |
| **Εμφάνιση** | `/css/` | Περιλαμβάνει `styles.css`, `epic.css`, `epic-ui.css`, `user-libraries.css` |
| **Λογική** | `/js/` | Διαχειρίζεται τη ροή, την αλληλεπίδραση και την απεικόνιση |
| **Βάση γνώσης** | `/data/` + `libraries_v.3.3.json` | Ιεραρχικά οργανωμένες JSON βιβλιοθήκες μνήμης |

---

### 3. Σύστημα Βιβλιοθηκών  

Οι βιβλιοθήκες καλύπτουν:  
- **Χρονικό επίπεδο (Temporal)**  
- **Χωρικό επίπεδο (Spatial)**  
- **Χαρακτήρες (Characters)**  
- **PAO (00–99)**  
- **Έμμετρα & Ρυθμικά μοτίβα (Verses)**  
- **Θεμελιώδεις έννοιες (Foundations)**  

---

### 4. Πρότυπα Χρήστη (`/data/`)  

```
user_characters_template.json
user_memory_palaces_template.json
user_pao_00_99_template.json
user_squares_template.json
```
Περιλαμβάνουν παραμετροποιήσιμες δομές για προσωπικά δεδομένα μνήμης, αποθηκευόμενες τοπικά (localStorage).

---

### 5. Ενότητες CSS & JS  

- **CSS:** οπτική συνοχή, καθαρή τυπογραφία, σκούρο θέμα, responsive διάταξη.  
- **JS:** modular λογική, δυναμική φόρτωση βιβλιοθηκών, modal αφήγησης (“Epic Story”), λειτουργίες export (CSV, TXT, PDF, JSON).

---

### 6. Ζωντανές Εκδόσεις  

- 🎯 [Κύρια Εφαρμογή](https://mmark76.github.io/Chess-Mnemonic-Application-and-Epic-Chess-Stories-Creator-v.3.3/index.html)  
- 🧠 [Flashcards Trainer](https://mmark76.github.io/flashcards/index.html)  
- 📚 [Blog Τεκμηρίωσης](https://markellos-chess-mnemonic-system.blogspot.com/)

---

### 7. Αλλαγές v.3.3.1  

- Νέο όνομα φακέλου root  
- Προσθήκη φακέλου `/data/` με templates  
- Προσθήκη αρχείων `library-switcher.js` & `user-libraries.js`  
- Νέα ενότητα “Live Versions”  
- Βελτιώσεις μορφοποίησης και πληρότητας τεκμηρίωσης  

---

© 2025 Μάρκελλος. Με επιφύλαξη παντός δικαιώματος.  
