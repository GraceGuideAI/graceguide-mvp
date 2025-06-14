import { describe, it, expect, beforeEach, vi } from 'vitest';
let ui;

beforeEach(async () => {
  const ids = [
    'ask','askLabel','spinner','question','sourceSlider','answerCard','output',
    'sourceList','historyList','historyToggle','history','qaContainer','themeToggle',
    'emailModal','modalContent','emailInput','joinNow','joinLabel','joinSpinner',
    'maybeLater','closeModal','shareModal','shareContent','sharePreview','downloadShare',
    'downloadLabel','xShare','instaShare','emailShare','closeShare'
  ];
  document.body.innerHTML = ids.map(id => {
    if (id === 'emailInput') return `<input id="${id}">`;
    if (id === 'sharePreview') return `<img id="${id}">`;
    return `<div id="${id}"></div>`;
  }).join('');
  window.matchMedia = () => ({matches:false, addEventListener: () => {}, removeEventListener: () => {}});
  global.fetch = () => Promise.resolve({ ok: true, json: () => ({}) });
  vi.useFakeTimers();
  ui = await import('../main.js');
});

describe('modals', () => {
  it('shows and hides email modal', () => {
    const modal = document.getElementById('emailModal');
    ui.showModal();
    expect(modal.classList.contains('hidden')).toBe(false);
    ui.hideModal();
    expect(modal.classList.contains('opacity-0')).toBe(true);
  });

});
