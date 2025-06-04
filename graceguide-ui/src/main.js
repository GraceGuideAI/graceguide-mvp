const askBtn   = document.getElementById("ask");
const askLabel = document.getElementById("askLabel");
const spinner  = document.getElementById("spinner");
const qBox     = document.getElementById("question");
const sourceSlider = document.getElementById("sourceSlider");
const card     = document.getElementById("answerCard");
const output   = document.getElementById("output");
const srcList  = document.getElementById("sourceList");
const historyList = document.getElementById("historyList");
const historyToggle = document.getElementById("historyToggle");
const historySidebar = document.getElementById("history");

const emailModal   = document.getElementById("emailModal");
const joinNowBtn   = document.getElementById("joinNow");
const maybeLaterBtn = document.getElementById("maybeLater");
const emailInput   = document.getElementById("emailInput");
const consentCheckbox = document.getElementById("consentCheckbox");

let mode = "both";
sourceSlider.addEventListener("input", () => {
  const val = parseInt(sourceSlider.value, 10);
  mode = val === 0 ? "both" : val === 1 ? "bible" : "catechism";
});

let askCount = parseInt(localStorage.getItem("askCount") || "0", 10);
if (askCount < 7) sessionStorage.removeItem("modalShown");

function showModal() {
  emailModal.classList.remove("hidden");
}

function hideModal() {
  emailModal.classList.add("hidden");
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("qaHistory") || "[]");
  historyList.innerHTML = "";
  history.forEach(({ q, a }) => {
    const li = document.createElement("li");
    li.className = "history-item";
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = q;
    const aEl = document.createElement("p");
    aEl.className = "mt-2";
    aEl.textContent = a;
    details.appendChild(summary);
    details.appendChild(aEl);
    li.appendChild(details);
    historyList.appendChild(li);
  });
}

renderHistory();

async function ask() {
  const q = qBox.value.trim();
  if (!q) return;

  // UI → loading state
  askBtn.disabled = true;
  askLabel.classList.add("hidden");
  spinner.classList.remove("hidden");
  card.classList.add("hidden");


  try {
    const res = await fetch("/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, mode })
    });
    if (!res.ok) throw new Error(await res.text());
    const { answer, sources } = await res.json();

    // Render answer
    output.textContent = answer.trim();
    // Render sources
    srcList.innerHTML = "";
    sources.forEach(txt => {
      const li = document.createElement("li");
      li.textContent = txt;
      srcList.appendChild(li);
    });

    card.classList.remove("hidden");

    // Update history sidebar
    const history = JSON.parse(localStorage.getItem("qaHistory") || "[]");
    history.unshift({ q, a: answer.trim() });
    history.splice(10);
    localStorage.setItem("qaHistory", JSON.stringify(history));
    renderHistory();

    // Track successful questions
    askCount += 1;
    localStorage.setItem("askCount", askCount);
    if (askCount === 7 && !sessionStorage.getItem("modalShown")) {
      sessionStorage.setItem("modalShown", "true");
      showModal();
    }
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

joinNowBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email || !consentCheckbox.checked) {
    alert("Please provide an email and consent.");
    return;
  }
  try {
    const res = await fetch("/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error(await res.text());
    hideModal();
  } catch (err) {
    alert("Subscription failed: " + err.message);
  }
});

maybeLaterBtn.addEventListener("click", hideModal);

function openHistory() {
  historySidebar.classList.remove("-translate-x-full");
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", onEsc);
}

function closeHistory() {
  historySidebar.classList.add("-translate-x-full");
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", onEsc);
}

function onClickOutside(e) {
  if (!historySidebar.contains(e.target) && !historyToggle.contains(e.target)) {
    closeHistory();
  }
}

function onEsc(e) {
  if (e.key === "Escape") closeHistory();
}

historyToggle.addEventListener("click", () => {
  if (historySidebar.classList.contains("-translate-x-full")) {
    openHistory();
  } else {
    closeHistory();
  }
});
