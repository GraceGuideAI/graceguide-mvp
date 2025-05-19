const askBtn   = document.getElementById("ask");
const askLabel = document.getElementById("askLabel");
const spinner  = document.getElementById("spinner");
const qBox     = document.getElementById("question");
const card     = document.getElementById("answerCard");
const output   = document.getElementById("output");
const srcList  = document.getElementById("sourceList");

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
      body: JSON.stringify({ question: q })
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
