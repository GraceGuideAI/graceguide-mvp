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
const tweetShare = document.getElementById("tweetShare");
const instaShare = document.getElementById("instaShare");
const emailShare = document.getElementById("emailShare");
const closeShare = document.getElementById("closeShare");

// Car image generator inputs
const carYear   = document.getElementById("carYear");
const carMake   = document.getElementById("carMake");
const carModel  = document.getElementById("carModel");
const carTrim   = document.getElementById("carTrim");
const carColor  = document.getElementById("carColor");
const carWheels = document.getElementById("carWheels");
const generateImageBtn = document.getElementById("generateImage");
const imageResult = document.getElementById("imageResult");

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
  wrapper.className = 'share-card bg-white text-gray-800 p-4 rounded-md border w-[350px] md:w-[600px] font-serif space-y-2';
  const header = document.createElement('div');
  header.className = 'bg-brand text-white text-center font-semibold py-2 rounded-md';
  header.textContent = 'GraceGuideAI';
  const qEl = document.createElement('p');
  qEl.innerHTML = '<strong>Q:</strong> ' + q;
  const aEl = document.createElement('p');
  aEl.innerHTML = '<strong>A:</strong> ' + a;
  wrapper.appendChild(header);
  wrapper.appendChild(qEl);
  wrapper.appendChild(aEl);
  document.body.appendChild(wrapper);
  const canvas = await html2canvas(wrapper);
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
    span.textContent = q;
    const shareBtn = document.createElement("button");
    shareBtn.className = "share-btn ml-2 text-brand";
    shareBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>`;
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

tweetShare.addEventListener("click", async () => {
  if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
    await navigator.share({ files: [shareFile], text: "GraceGuideAI Q&A" });
  } else {
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("GraceGuideAI Q&A");
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

generateImageBtn.addEventListener("click", () => {
  const year = carYear.value.trim();
  const make = carMake.value.trim();
  const model = carModel.value.trim();
  const trim = carTrim.value.trim();
  const color = carColor.value.trim();
  const wheels = carWheels.value.trim();
  const prompt = `Render a full side-profile of a ${year} Porsche ${make} ${model} ${trim} painted in ${color} with ${wheels} wheels. Place the car perfectly centered on a pure white background, no text, no logos, no watermarks, no other objects. Apply this visual style: 3-D cute cartoon illustration, isometric yet true side-profile, rounded shapes, thin dark linework, soft pastel base colors with vivid accents, subtle top-left lighting, smooth matte surfaces, playful simplified 3-D vibe`;
  const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt);
  imageResult.innerHTML = "";
  const img = document.createElement("img");
  img.alt = "Generated car";
  img.className = "max-w-full";
  img.src = url;
  imageResult.appendChild(img);
});
