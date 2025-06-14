export async function logEvent(event) {
  try {
    await fetch('/log_event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event })
    });
  } catch (_) {}
}

export async function fetchQA(question, mode) {
  const res = await fetch('/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function subscribe(email) {
  const res = await fetch('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error(await res.text());
}
