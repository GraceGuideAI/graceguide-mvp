const askBtn   = document.getElementById("ask");
const askLabel = document.getElementById("askLabel");
const spinner  = document.getElementById("spinner");
const qBox     = document.getElementById("question");
const srcBtns  = document.querySelectorAll(".src-btn");
let   mode     = "both";
const card     = document.getElementById("answerCard");
const output   = document.getElementById("output");
const srcList  = document.getElementById("sourceList");
const recent   = document.getElementById("recentList");
const shareBtn = document.getElementById("share");
const goodBtn  = document.getElementById("good");
const badBtn   = document.getElementById("bad");
let lastQ = "";
let lastA = "";

srcBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    srcBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.sourceMode;
  });
});
// activate default button
document.querySelector('[data-source-mode="both"]').classList.add("active");

async function ask() {
  const q = qBox.value.trim();
  if (!q) return;

  // UI → loading state
  askBtn.disabled = true;
  askLabel.classList.add("hidden");
  spinner.classList.remove("hidden");
  card.classList.add("hidden");

  const currentMode = mode;

  try {
    const res = await fetch("/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, mode: currentMode })
    });
    if (!res.ok) throw new Error(await res.text());
    const { answer, sources } = await res.json();

    // Render answer
    output.textContent = answer.trim();
    lastQ = q;
    lastA = answer.trim();
    const li = document.createElement("li");
    li.textContent = q;
    recent.prepend(li);
    // Render sources
    srcList.innerHTML = "";
    sources.forEach(txt => {
      const li = document.createElement("li");
      li.textContent = txt;
      srcList.appendChild(li);
    });

    card.classList.remove("hidden");
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    spinner.classList.add("hidden");
    askLabel.classList.remove("hidden");
    askBtn.disabled = false;
  }
}

askBtn.addEventListener("click", ask);
qBox.addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
});

shareBtn.addEventListener("click", () => {
  if (!lastA) return;
  if (navigator.share) {
    navigator.share({ text: lastA });
  } else {
    navigator.clipboard.writeText(lastA);
    alert("Answer copied to clipboard");
  }
});

function sendFeedback(val) {
  if (!lastQ || !lastA) return;
  fetch("/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: lastQ, answer: lastA, positive: val > 0 })
  });
}

goodBtn.addEventListener("click", () => sendFeedback(1));
badBtn.addEventListener("click", () => sendFeedback(-1));
