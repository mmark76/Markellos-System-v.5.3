// =====================
// GLOBAL STATE
// =====================
let flashcards = [];
let currentIndex = 0;

// =====================
// UI UPDATE
// =====================
function updateFlashcard() {
    const codeEl = document.getElementById("code");
    const answerEl = document.getElementById("answer");

    if (flashcards.length === 0) {
        codeEl.textContent = "No flashcards loaded";
        answerEl.textContent = "";
        return;
    }

    const card = flashcards[currentIndex];
    codeEl.textContent = card.code;
    answerEl.textContent = card.answer;
}

// =====================
// NAVIGATION
// =====================
function nextCard() {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex + 1) % flashcards.length;
    updateFlashcard();
}

function prevCard() {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    updateFlashcard();
}

function toggleAnswer() {
    const answerEl = document.getElementById("answer");
    answerEl.style.display = (answerEl.style.display === "none") ? "block" : "none";
}

// =====================
// HELPER – Convert object to flashcard text
// =====================
function objectToMultilineText(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
}

// =====================
// DETECT TEMPLATE TYPE
// =====================
function detectTemplate(json) {

    if (Array.isArray(json)) return "default";  // already flashcards

    const sampleKey = Object.keys(json)[0];
    const sampleValue = json[sampleKey];

    if (typeof sampleValue !== "object") return "unknown";

    // PAO template
    if ("person" in sampleValue && "action" in sampleValue && "object" in sampleValue)
        return "pao";

    // characters template
    if ("piece" in sampleValue || "color" in sampleValue || "mnemonic" in sampleValue)
        return "characters";

    // squares template
    if ("mnemonic" in sampleValue && ("file" in sampleValue || "rank" in sampleValue))
        return "squares";

    // memory palaces template
    if ("locus" in sampleValue || "description" in sampleValue)
        return "palaces";

    return "unknown";
}

// =====================
// CONVERTERS FOR TEMPLATES
// =====================
function convertPAO(json) {
    const cards = [];
    for (const key of Object.keys(json)) {
        cards.push({
            code: key,
            answer: objectToMultilineText(json[key])
        });
    }
    return cards;
}

function convertTemplate(json) {
    const cards = [];
    for (const key of Object.keys(json)) {
        cards.push({
            code: key,
            answer: objectToMultilineText(json[key])
        });
    }
    return cards;
}

// =====================
// MAIN LOADER
// =====================
document.getElementById("jsonFile").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const json = JSON.parse(e.target.result);
            const type = detectTemplate(json);

            switch (type) {

                case "default":
                    flashcards = json;
                    break;

                case "pao":
                    flashcards = convertPAO(json);
                    break;

                case "characters":
                case "squares":
                case "palaces":
                    flashcards = convertTemplate(json);
                    break;

                default:
                    alert("Invalid or unsupported JSON format.");
                    return;
            }

            currentIndex = 0;
            document.getElementById("answer").style.display = "none";
            updateFlashcard();

        } catch (error) {
            alert("Error reading JSON file");
        }
    };

    reader.readAsText(file);
});
