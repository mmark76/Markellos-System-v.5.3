// epic-ui-init.js — attach parchment classes & button styles (safe)
(function(){
  function init() {
    const ta = document.getElementById("epicText");
    const view = document.getElementById("epicTextView");
    if (ta) ta.classList.add("parchment","edge");
    if (view) view.classList.add("parchment","edge");

    // add button classes if buttons exist (non-destructive)
    document.querySelectorAll("#openEpicBtnTop, #openEpicBtnBottom").forEach(b => b.classList.add("btn","btn-primary"));
    const copy = document.getElementById("copyEpicBtn");
    const play = document.getElementById("playEpicBtn");
    if (copy) copy.classList.add("btn","btn-primary");
    if (play) play.classList.add("btn","btn-secondary");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
