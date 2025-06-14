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
  askLabel.classList.add('hidden');
  spinner.classList.remove('hidden');
  card.classList.add('hidden');

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
