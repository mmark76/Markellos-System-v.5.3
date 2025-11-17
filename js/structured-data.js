// Structured Data for Chess Mnemonic Application and Epic Chess Stories Creator v3.3
// This script only injects JSON-LD metadata for search engines.
// It does not modify any visible part of the page.

(function () {
  var structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Chess Mnemonic Application and Epic Chess Stories Creator",
    "alternateName": "Chess Mnemonic System v3.3",
    "version": "3.3",
    "description": "A specialized memory training tool for chess players that converts PGN/SAN into mnemonic tables, PAO sequences, Rhythm structures and memory palace loci.",
    "applicationCategory": "EducationalApplication",
    "softwareHelp": "https://markellos-chess-mnemonic-system.blogspot.com/",
    "operatingSystem": "Web",
    "url": "https://chessmnemonics.net/index.html",
    "featureList": [
      "PGN/SAN Parser",
      "Associations Table",
      "PAO 0–9 and PAO 00–99 Tables",
      "Rhythm Tables",
      "Memory Palace Mode",
      "Epic Story Generator",
      "Flashcards Training Module"
    ],
    "softwareAddOn": {
      "@type": "SoftwareApplication",
      "name": "Chess Mnemonics Flashcards Trainer",
      "url": "https://chessmnemonics.net/flashcards/"
    },
    "keywords": [
      "chess mnemonics",
      "memory palace",
      "pao system",
      "chess training",
      "chess notation",
      "epic story",
      "san to mnemonic",
      "memory techniques",
      "PGN visualization"
    ],
    "author": {
      "@type": "Person",
      "name": "Markellos Markides",
      "url": "https://markellos-chess-mnemonic-system.blogspot.com/"
    },
    "creator": {
      "@type": "Person",
      "name": "Markellos Markides"
    },
    "license": "© Markellos Markides 2025",
    "copyrightHolder": "Markellos Markides",
    "inLanguage": "en",
    "learningResourceType": "Mnemonic-based training",
    "publisher": {
      "@type": "Organization",
      "name": "Chess Mnemonics"
    }
  };

  try {
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  } catch (e) {
    // structured data only, δεν επηρεάζει τη λειτουργία της εφαρμογής
  }
})();
