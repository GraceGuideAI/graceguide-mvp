import React, { useState } from 'react';
import QuestionForm from '../components/QuestionForm.jsx';
import { ask } from '../main.jsx';

export async function handleAsk(question, mode) {
  return ask(question, mode);
}

export default function Home() {
  const [data, setData] = useState(null);

  async function onSubmit({ question, mode }) {
    try {
      const res = await handleAsk(question, mode);
      setData(res);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <QuestionForm onSubmit={onSubmit} />
      {data && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Answer</h2>
          <pre className="whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100">
            {data.answer.trim()}
          </pre>
          <h3 className="text-md font-semibold">Sources</h3>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-100">
            {data.sources.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
