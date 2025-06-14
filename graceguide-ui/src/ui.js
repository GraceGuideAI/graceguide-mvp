import { logEvent } from './api.js';

export const askBtn = document.getElementById('ask');
export const askLabel = document.getElementById('askLabel');
export const spinner = document.getElementById('spinner');
export const qBox = document.getElementById('question');
export const sourceSlider = document.getElementById('sourceSlider');
export const card = document.getElementById('answerCard');
export const output = document.getElementById('output');
export const srcList = document.getElementById('sourceList');
export const themeToggle = document.getElementById('themeToggle');

const root = document.documentElement;

export function initTheme() {
  if (localStorage.theme === 'dark') root.classList.add('dark');
  themeToggle.addEventListener('click', () => {
    const enabled = root.classList.toggle('dark');
    localStorage.theme = enabled ? 'dark' : 'light';
  });
}

// Modal elements
const emailModal = document.getElementById('emailModal');
export const joinNowBtn = document.getElementById('joinNow');
export const joinLabel = document.getElementById('joinLabel');
export const joinSpinner = document.getElementById('joinSpinner');
export const maybeLaterBtn = document.getElementById('maybeLater');
export const emailInput = document.getElementById('emailInput');
export const closeModalBtn = document.getElementById('closeModal');
const modalContent = document.getElementById('modalContent');

// Share elements
const shareModal = document.getElementById('shareModal');
const shareContent = document.getElementById('shareContent');
const sharePreview = document.getElementById('sharePreview');
export const downloadShare = document.getElementById('downloadShare');
const downloadLabel = document.getElementById('downloadLabel');
export const xShare = document.getElementById('xShare');
export const instaShare = document.getElementById('instaShare');
export const emailShare = document.getElementById('emailShare');
export const closeShare = document.getElementById('closeShare');

downloadLabel.textContent = 'Download';

export function showModal() {
  emailModal.classList.remove('hidden');
  emailModal.classList.remove('opacity-0');
  modalContent.classList.remove('opacity-0', 'scale-90');
  requestAnimationFrame(() => {
    emailModal.classList.add('opacity-100');
    modalContent.classList.add('opacity-100', 'scale-100');
  });
  logEvent('modal_shown');
  emailInput.focus();
}

export function hideModal() {
  emailModal.classList.remove('opacity-100');
  emailModal.classList.add('opacity-0');
  modalContent.classList.remove('opacity-100', 'scale-100');
  modalContent.classList.add('opacity-0', 'scale-90');
  setTimeout(() => {
    emailModal.classList.add('hidden');
  }, 300);
}

export function showShareModal() {
  shareModal.classList.remove('hidden');
  shareModal.classList.remove('opacity-0');
  shareContent.classList.remove('opacity-0', 'scale-90');
  requestAnimationFrame(() => {
    shareModal.classList.add('opacity-100');
    shareContent.classList.add('opacity-100', 'scale-100');
  });
}

export function hideShareModal() {
  shareModal.classList.remove('opacity-100');
  shareModal.classList.add('opacity-0');
  shareContent.classList.remove('opacity-100', 'scale-100');
  shareContent.classList.add('opacity-0', 'scale-90');
  setTimeout(() => {
    shareModal.classList.add('hidden');
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
  wrapper.style.cssText += 'position:fixed; left:-9999px; top:0; opacity:0;';

  const header = document.createElement('div');
  header.className = 'text-3xl font-bold text-center mb-4';
  header.textContent = 'GraceGuideAI';

  const qaWrap = document.createElement('div');
  qaWrap.className = 'flex-1 flex flex-col justify-center gap-4 text-xl';

  const qEl = document.createElement('p');
  const qLabel = document.createElement('span');
  qLabel.className = 'font-semibold';
  qLabel.textContent = 'Q:';
  qEl.appendChild(qLabel);
  qEl.appendChild(document.createTextNode(' ' + q));
  qEl.style.overflowWrap = 'anywhere';

  const aEl = document.createElement('p');
  const aLabel = document.createElement('span');
  aLabel.className = 'font-semibold';
  aLabel.textContent = 'A:';
  aEl.appendChild(aLabel);
  aEl.appendChild(document.createTextNode(' ' + a));
  aEl.style.overflowWrap = 'anywhere';

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

export async function shareQA(q, a) {
  const dataUrl = await generateShareImage(q, a);
  shareFile = dataURLToFile(dataUrl, 'graceguide.png');
  sharePreview.src = dataUrl;
  downloadShare.href = dataUrl;
  showShareModal();
}

export function initShareHandlers() {
  closeShare.addEventListener('click', hideShareModal);

  xShare.addEventListener('click', async () => {
    if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
      await navigator.share({ files: [shareFile], text: 'GraceGuideAI Q&A' });
    } else {
      const url = 'https://x.com/intent/tweet?text=' +
                  encodeURIComponent('GraceGuideAI Q&A');
      window.open(url, '_blank');
    }
  });

  instaShare.addEventListener('click', async () => {
    if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
      await navigator.share({ files: [shareFile], text: 'GraceGuideAI Q&A' });
    } else {
      alert('Your browser does not support direct image sharing. Please download the image and share manually.');
    }
  });

  emailShare.addEventListener('click', async () => {
    if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
      await navigator.share({ files: [shareFile], title: 'GraceGuideAI Q&A' });
    } else {
      window.location.href = 'mailto:?subject=GraceGuideAI%20Q%26A';
    }
  });

  downloadShare.addEventListener('click', async e => {
    if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
      e.preventDefault();
      try {
        await navigator.share({ files: [shareFile] });
      } catch (_) {}
    }
  });
}

