const historyList = document.getElementById('historyList');
const historyToggles = document.querySelectorAll('#historyToggle');
const historySidebar = document.getElementById('history');
const qaContainer = document.getElementById('qaContainer');
const lgQuery = window.matchMedia('(min-width: 1024px)');

export function renderHistory() {
  const history = JSON.parse(localStorage.getItem('qaHistory') || '[]');
  historyList.innerHTML = '';
  history.forEach(({ q, a }) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.className = 'flex justify-between items-center';
    const span = document.createElement('span');
    span.className = 'question-text';
    span.textContent = q;
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn ml-2 text-brand flex-shrink-0';
    shareBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>`;
    shareBtn.addEventListener('click', e => {
      e.stopPropagation();
      const event = new CustomEvent('share', { detail: { q, a } });
      document.dispatchEvent(event);
    });
    summary.appendChild(span);
    summary.appendChild(shareBtn);
    const qa = document.createElement('div');
    qa.className = 'qa';
    const qEl = document.createElement('p');
    qEl.className = 'text-sm';
    qEl.innerHTML = `<span class="font-semibold">Question:</span> ${q}`;
    const aEl = document.createElement('p');
    aEl.className = 'mt-2 text-sm';
    aEl.innerHTML = `<span class="font-semibold">Answer:</span> ${a}`;
    qa.appendChild(qEl);
    qa.appendChild(aEl);
    details.appendChild(summary);
    details.appendChild(qa);
    li.appendChild(details);
    historyList.appendChild(li);
  });
}

export function saveHistory(q, a) {
  const history = JSON.parse(localStorage.getItem('qaHistory') || '[]');
  history.unshift({ q, a });
  history.splice(10);
  localStorage.setItem('qaHistory', JSON.stringify(history));
}

export function openHistory() {
  historySidebar.classList.remove('-translate-x-full');
  if (lgQuery.matches) {
    qaContainer.classList.add('ml-72');
  }
}

export function closeHistory() {
  historySidebar.classList.add('-translate-x-full');
  qaContainer.classList.remove('ml-72');
}

export function initHistory() {
  lgQuery.addEventListener('change', () => {
    if (!lgQuery.matches) {
      qaContainer.classList.remove('ml-72');
    } else if (!historySidebar.classList.contains('-translate-x-full')) {
      qaContainer.classList.add('ml-72');
    }
  });

  document.addEventListener('click', e => {
    if (!historySidebar.contains(e.target) &&
        ![...historyToggles].some(btn => btn.contains(e.target))) {
      closeHistory();
    }
  });

  historyToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      if (historySidebar.classList.contains('-translate-x-full')) {
        openHistory();
      } else {
        closeHistory();
      }
    });
  });
}
