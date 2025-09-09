import React, { useState, useEffect } from 'react';

export default function VerseOfTheDay({ isVisible = true }) {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerseOfDay();
  }, []);

  const fetchVerseOfDay = async () => {
    try {
      const response = await fetch('/verse-of-the-day');
      if (!response.ok) {
        throw new Error('Failed to fetch verse');
      }
      const data = await response.json();
      setVerse(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load verse of the day');
      setLoading(false);
    }
  };

  if (!isVisible || loading || error || !verse) {
    return null;
  }

  return (
    <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto mt-4 mb-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-blue-100 dark:border-gray-600 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-white">
            Verse of the Day
          </h3>
        </div>

        <div className="text-center">
          <p className="text-base md:text-lg text-gray-800 dark:text-gray-100 italic leading-relaxed mb-4">
            "{verse.verse_text}"
          </p>
          <p className="text-sm md:text-base text-blue-700 dark:text-blue-300 font-medium">
            — {verse.verse_reference}
          </p>
        </div>
      </div>
    </div>
  );
}

