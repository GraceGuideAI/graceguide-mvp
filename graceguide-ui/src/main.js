const askBtn   = document.getElementById("ask");
const askLabel = document.getElementById("askLabel");
const spinner  = document.getElementById("spinner");
const qBox     = document.getElementById("question");
const sourceSlider = document.getElementById("sourceSlider");
const card     = document.getElementById("answerCard");
const output   = document.getElementById("output");
const srcList  = document.getElementById("sourceList");
const historyList = document.getElementById("historyList");
const historyToggles = document.querySelectorAll("#historyToggle");
const historySidebar = document.getElementById("history");
const qaContainer = document.getElementById("qaContainer");
const themeToggle = document.getElementById("themeToggle");

const root = document.documentElement;
if (localStorage.theme === "dark") root.classList.add("dark");
themeToggle.addEventListener("click", () => {
  const enabled = root.classList.toggle("dark");
  localStorage.theme = enabled ? "dark" : "light";
});

const emailModal   = document.getElementById("emailModal");
const joinNowBtn   = document.getElementById("joinNow");
const joinLabel = document.getElementById("joinLabel");
const joinSpinner = document.getElementById("joinSpinner");
const maybeLaterBtn = document.getElementById("maybeLater");
const emailInput   = document.getElementById("emailInput");
const closeModalBtn = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");
const shareModal   = document.getElementById("shareModal");
const shareContent = document.getElementById("shareContent");
const sharePreview = document.getElementById("sharePreview");
const downloadShare = document.getElementById("downloadShare");
const downloadLabel = document.getElementById("downloadLabel");
const xShare = document.getElementById("xShare");
const instaShare = document.getElementById("instaShare");
const emailShare = document.getElementById("emailShare");
const closeShare = document.getElementById("closeShare");

if (/Mobi/i.test(navigator.userAgent)) {
  downloadLabel.textContent = "Save to Photos";
} else {
  downloadLabel.textContent = "Save Image";
}

async function logEvent(event) {
  try {
    await fetch("/log_event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event })
    });
  } catch (_) {}
}

let mode = "both";
sourceSlider.addEventListener("input", () => {
  const val = parseInt(sourceSlider.value, 10);
  mode = val === 0 ? "both" : val === 1 ? "bible" : "catechism";
});

let askCount = parseInt(localStorage.getItem("askCount") || "0", 10);
let maybeLaterUntil = parseInt(localStorage.getItem("maybeLaterUntil") || "0", 10);
if (askCount < 5 || askCount < maybeLaterUntil) sessionStorage.removeItem("modalShown");

function showModal() {
  console.log("Showing email modal");
  emailModal.classList.remove("hidden");
  emailModal.classList.remove("opacity-0");
  modalContent.classList.remove("opacity-0", "scale-90");
  requestAnimationFrame(() => {
    emailModal.classList.add("opacity-100");
    modalContent.classList.add("opacity-100", "scale-100");
  });
  logEvent("modal_shown");
  emailInput.focus();
}

function hideModal() {
  emailModal.classList.remove("opacity-100");
  emailModal.classList.add("opacity-0");
  modalContent.classList.remove("opacity-100", "scale-100");
  modalContent.classList.add("opacity-0", "scale-90");
  setTimeout(() => {
    emailModal.classList.add("hidden");
  }, 300);
}

function showShareModal() {
  shareModal.classList.remove("hidden");
  shareModal.classList.remove("opacity-0");
  shareContent.classList.remove("opacity-0", "scale-90");
  requestAnimationFrame(() => {
    shareModal.classList.add("opacity-100");
    shareContent.classList.add("opacity-100", "scale-100");
  });
}

function hideShareModal() {
  shareModal.classList.remove("opacity-100");
  shareModal.classList.add("opacity-0");
  shareContent.classList.remove("opacity-100", "scale-100");
  shareContent.classList.add("opacity-0", "scale-90");
  setTimeout(() => {
    shareModal.classList.add("hidden");
  }, 300);
}

function dataURLToFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

async function generateShareImage(q, a) {
  const wrapper = document.createElement('div');
  wrapper.className =
    'share-card flex flex-col justify-between text-white rounded-lg overflow-hidden bg-gradient-to-br from-blue-900 to-blue-600 p-8 font-serif';
  wrapper.style.width = '540px';
  wrapper.style.height = '960px';

  const header = document.createElement('div');
  header.className = 'text-3xl font-bold text-center mb-4';
  header.textContent = 'GraceGuideAI';

  const qaWrap = document.createElement('div');
  qaWrap.className = 'flex-1 flex flex-col justify-center gap-4 text-xl';
  const qEl = document.createElement('p');
  qEl.innerHTML = '<span class="font-semibold">Q:</span> ' + q;
  const aEl = document.createElement('p');
  aEl.innerHTML = '<span class="font-semibold">A:</span> ' + a;
  qaWrap.appendChild(qEl);
  qaWrap.appendChild(aEl);

  const footer = document.createElement('div');
  footer.className = 'text-center text-sm opacity-80 mt-4';
  footer.textContent = 'graceguide.ai';

  wrapper.appendChild(header);
  wrapper.appendChild(qaWrap);
  wrapper.appendChild(footer);

  document.body.appendChild(wrapper);
  const canvas = await html2canvas(wrapper, { scale: 2 });
  wrapper.remove();
  return canvas.toDataURL('image/png');
}

let shareFile;

async function shareQA(q, a) {
  const dataUrl = await generateShareImage(q, a);
  shareFile = dataURLToFile(dataUrl, 'graceguide.png');
  sharePreview.src = dataUrl;
  downloadShare.href = dataUrl;
  showShareModal();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("qaHistory") || "[]");
  historyList.innerHTML = "";
  history.forEach(({ q, a }) => {
    const li = document.createElement("li");
    li.className = "history-item";
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.className = "flex justify-between items-center";
    const span = document.createElement("span");
    span.className = "question-text";
    span.textContent = q;
    const shareBtn = document.createElement("button");
    shareBtn.className = "share-btn ml-2 text-brand flex-shrink-0";
    shareBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>`;
    shareBtn.addEventListener("click", e => { e.stopPropagation(); shareQA(q, a); });
    summary.appendChild(span);
    summary.appendChild(shareBtn);
    const qa = document.createElement("div");
    qa.className = "qa";
    const qEl = document.createElement("p");
    qEl.className = "text-sm";
    qEl.innerHTML = `<span class="font-semibold">Question:</span> ${q}`;
    const aEl = document.createElement("p");
    aEl.className = "mt-2 text-sm";
    aEl.innerHTML = `<span class="font-semibold">Answer:</span> ${a}`;
    qa.appendChild(qEl);
    qa.appendChild(aEl);
    details.appendChild(summary);
    details.appendChild(qa);
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
    const subscribed = localStorage.getItem("subscribed");
    maybeLaterUntil = parseInt(localStorage.getItem("maybeLaterUntil") || "0", 10);
    const shouldShow = !subscribed &&
                       askCount >= 5 &&
                       askCount >= maybeLaterUntil &&
                       !sessionStorage.getItem("modalShown");
    if (shouldShow) {
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
  if (!email) {
    alert("Please enter a valid email address.");
    emailInput.focus();
    return;
  }

  joinNowBtn.disabled = true;
  joinLabel.classList.add("hidden");
  joinSpinner.classList.remove("hidden");

  try {
    const res = await fetch("/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error(await res.text());

    localStorage.setItem("subscribed", "true");
    hideModal();
    logEvent("email_success");
  } catch (err) {
    console.error("Subscription failed", err);
    alert("Subscription failed: " + err.message);
    logEvent("email_failure");
  } finally {
    joinSpinner.classList.add("hidden");
    joinLabel.classList.remove("hidden");
    joinNowBtn.disabled = false;
  }
});

maybeLaterBtn.addEventListener("click", () => {
  maybeLaterUntil = askCount + 10;
  localStorage.setItem("maybeLaterUntil", maybeLaterUntil);
  hideModal();
  logEvent("maybe_later");
});

closeModalBtn.addEventListener("click", () => {
  hideModal();
  logEvent("modal_close");
});

const lgQuery = window.matchMedia("(min-width: 1024px)");

function openHistory() {
  historySidebar.classList.remove("-translate-x-full");
  if (lgQuery.matches) {
    qaContainer.classList.add("ml-72");
  }
}

function closeHistory() {
  historySidebar.classList.add("-translate-x-full");
  qaContainer.classList.remove("ml-72");
}

lgQuery.addEventListener("change", () => {
  if (!lgQuery.matches) {
    qaContainer.classList.remove("ml-72");
  } else if (!historySidebar.classList.contains("-translate-x-full")) {
    qaContainer.classList.add("ml-72");
  }
});

function onClickOutside(e) {
  if (!historySidebar.contains(e.target) &&
      ![...historyToggles].some(btn => btn.contains(e.target))) {
    closeHistory();
  }
}

document.addEventListener("click", onClickOutside);

historyToggles.forEach(btn => {
  btn.addEventListener("click", () => {
    if (historySidebar.classList.contains("-translate-x-full")) {
      openHistory();
    } else {
      closeHistory();
    }
  });
});

closeShare.addEventListener("click", hideShareModal);

xShare.addEventListener("click", async () => {
  if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
    await navigator.share({ files: [shareFile], text: "GraceGuideAI Q&A" });
  } else {
    const url = "https://x.com/intent/tweet?text=" + encodeURIComponent("GraceGuideAI Q&A");
    window.open(url, "_blank");
  }
});

instaShare.addEventListener("click", async () => {
  if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
    await navigator.share({ files: [shareFile], text: "GraceGuideAI Q&A" });
  } else {
    alert("Your browser does not support direct image sharing. Please download the image and share manually.");
  }
});

emailShare.addEventListener("click", async () => {
  if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
    await navigator.share({ files: [shareFile], title: "GraceGuideAI Q&A" });
  } else {
    window.location.href = "mailto:?subject=GraceGuideAI%20Q%26A";
  }
});

downloadShare.addEventListener("click", async e => {
  if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
    e.preventDefault();
    downloadShare.removeAttribute("download");
    try {
      await navigator.share({ files: [shareFile] });
    } catch (_) {}
  }
});
