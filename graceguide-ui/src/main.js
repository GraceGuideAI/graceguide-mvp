<<<<<< codex/split-src/main.js-into-modules
import {
  askBtn,
  askLabel,
  spinner,
  qBox,
  sourceSlider,
  card,
  output,
  srcList,
  joinNowBtn,
  joinLabel,
  joinSpinner,
  maybeLaterBtn,
  emailInput,
  closeModalBtn,
  initTheme,
  showModal,
  hideModal,
  shareQA,
  initShareHandlers
} from './ui.js';
import { logEvent, fetchQA, subscribe } from './api.js';
import { renderHistory, saveHistory, initHistory } from './history.js';

let mode = 'both';
sourceSlider.addEventListener('input', () => {
=======
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

import { fetchLiturgicalDay } from "./liturgical.js";

const litBanner = document.getElementById("litBanner");
const litModal = document.getElementById("litModal");
const litContent = document.getElementById("litContent");
const litBody = document.getElementById("litBody");
const litClose = document.getElementById("litClose");

litBanner.addEventListener("click", () => {
  litModal.classList.remove("hidden");
  requestAnimationFrame(() => litModal.classList.add("opacity-100"));
});

litClose.addEventListener("click", () => {
  litModal.classList.remove("opacity-100");
  setTimeout(() => litModal.classList.add("hidden"), 300);
});

downloadLabel.textContent = "Download";

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
>>>>>> main
  const val = parseInt(sourceSlider.value, 10);
  mode = val === 0 ? 'both' : val === 1 ? 'bible' : 'catechism';
});

initTheme();
initHistory();
initShareHandlers();
renderHistory();

let askCount = parseInt(localStorage.getItem('askCount') || '0', 10);
let maybeLaterUntil = parseInt(localStorage.getItem('maybeLaterUntil') || '0', 10);
if (askCount < 5 || askCount < maybeLaterUntil) sessionStorage.removeItem('modalShown');

async function ask() {
  const q = qBox.value.trim();
  if (!q) return;

  askBtn.disabled = true;
<<<<<< codex/split-src/main.js-into-modules
  askLabel.classList.add('hidden');
  spinner.classList.remove('hidden');
  card.classList.add('hidden');
=======
  askLabel.classList.add("hidden");
  spinner.classList.remove("hidden");
  card.classList.add("hidden");
  litBanner.classList.add("hidden");

>>>>>> main

  try {
    const { answer, sources } = await fetchQA(q, mode);

    output.textContent = answer.trim();
    srcList.innerHTML = '';
    sources.forEach(txt => {
      const li = document.createElement('li');
      li.textContent = txt;
      srcList.appendChild(li);
    });

    card.classList.remove('hidden');

    saveHistory(q, answer.trim());
    renderHistory();

    askCount += 1;
    localStorage.setItem('askCount', askCount);
    const subscribed = localStorage.getItem('subscribed');
    maybeLaterUntil = parseInt(localStorage.getItem('maybeLaterUntil') || '0', 10);
    const shouldShow = !subscribed &&
                       askCount >= 5 &&
                       askCount >= maybeLaterUntil &&
                       !sessionStorage.getItem('modalShown');
    if (shouldShow) {
      sessionStorage.setItem('modalShown', 'true');
      showModal();
    }
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    spinner.classList.add('hidden');
    askLabel.classList.remove('hidden');
    askBtn.disabled = false;
    litBanner.classList.remove("hidden");
  }
}

askBtn.addEventListener('click', ask);
qBox.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask();
});

document.addEventListener('share', e => {
  const { q, a } = e.detail;
  shareQA(q, a);
});

joinNowBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  if (!email) {
    alert('Please enter a valid email address.');
    emailInput.focus();
    return;
  }

  joinNowBtn.disabled = true;
  joinLabel.classList.add('hidden');
  joinSpinner.classList.remove('hidden');

  try {
    await subscribe(email);
    localStorage.setItem('subscribed', 'true');
    hideModal();
    logEvent('email_success');
  } catch (err) {
    console.error('Subscription failed', err);
    alert('Subscription failed: ' + err.message);
    logEvent('email_failure');
  } finally {
    joinSpinner.classList.add('hidden');
    joinLabel.classList.remove('hidden');
    joinNowBtn.disabled = false;
  }
});

maybeLaterBtn.addEventListener('click', () => {
  maybeLaterUntil = askCount + 10;
  localStorage.setItem('maybeLaterUntil', maybeLaterUntil);
  hideModal();
  logEvent('maybe_later');
});

closeModalBtn.addEventListener('click', () => {
  hideModal();
  logEvent('modal_close');
});

fetchLiturgicalDay();
