import { useState } from 'react';

export default function QuestionForm({ onSubmit }) {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('both');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit({ question: question.trim(), mode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Ask your question
      </label>
      <textarea
        rows={4}
        className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-brand focus:ring-brand/20 resize-y dark:bg-gray-700 dark:text-white dark:border-gray-600"
        placeholder="e.g. What does the Catechism say about forgiveness?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2">
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={mode === 'both' ? 0 : mode === 'bible' ? 1 : 2}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setMode(val === 0 ? 'both' : val === 1 ? 'bible' : 'catechism');
            }}
            className="slider"
          />
          <div className="flex justify-between text-xs text-gray-600 w-36">
            <span>Blend</span>
            <span>Bible</span>
            <span>CCC</span>
          </div>
        </div>
        <button
          type="submit"
          className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!question.trim()}
        >
          Ask
        </button>
      </div>
    </form>
  );
}
