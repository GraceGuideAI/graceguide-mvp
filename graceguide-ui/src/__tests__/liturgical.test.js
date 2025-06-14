import {fetchLiturgicalDay} from '../liturgical.js';
import {vi, test, expect, beforeEach} from 'vitest';
import '@testing-library/dom';

// Setup DOM elements
beforeEach(() => {
  document.body.innerHTML = `
    <div id="litBanner" class="hidden"></div>
    <div id="litModal" class="hidden"><div id="litContent"><pre id="litBody"></pre><button id="litClose"></button></div></div>`;
});

test('fetchLiturgicalDay populates banner', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ celebrations: [{title: 'Test Feast'}] })
  });

  await fetchLiturgicalDay();
  expect(global.fetch).toHaveBeenCalledWith('/liturgical-day');
  const banner = document.getElementById('litBanner');
  expect(banner.textContent).toBe('Test Feast');
  expect(banner.classList.contains('hidden')).toBe(false);
});
