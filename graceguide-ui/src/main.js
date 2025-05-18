const askBtn    = document.getElementById('ask');
const questionEl = document.getElementById('question');
const outputEl   = document.getElementById('output');

askBtn.addEventListener('click', async () => {
  const question = questionEl.value.trim();
  if (!question) return;

  outputEl.textContent = 'Loading…';

  try {
    const res = await fetch('/qa', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { answer, sources } = await res.json();

    outputEl.textContent =
      answer +
      '\n\nSources:\n' +
      sources.map(s => '- ' + s).join('\n');
  } catch (err) {
    outputEl.textContent = 'Error: ' + err.message;
  }
});
