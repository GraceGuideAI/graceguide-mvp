import React from 'react';
import ReactDOM from 'react-dom/client';

export async function ask(question, mode) {
  const res = await fetch('/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
import Home from './pages/Home.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
