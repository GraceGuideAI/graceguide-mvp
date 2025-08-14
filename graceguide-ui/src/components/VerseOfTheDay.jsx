import React, { useState, useEffect } from 'react';

// Helper function to parse and format the reflection text
function formatReflectionText(text) {
  if (!text) return [];
  
  // Remove numbered list markers and split into sections
  const sections = text
    .replace(/\d+\.\s*\*\*([^:]+):\*\*/g, '|SECTION|$1:')
    .split('|SECTION|')
    .filter(s => s.trim());
  
  return sections.map(section => {
    const colonIndex = section.indexOf(':');
    if (colonIndex === -1) return { title: '', content: section.trim() };
    
    const title = section.substring(0, colonIndex).trim();
    const content = section.substring(colonIndex + 1).trim();
    
    return { title, content };
  });
}

export default function VerseOfTheDay({ isVisible = true }) {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

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
      <div className="relative perspective-1000 min-h-[28rem] md:min-h-[32rem]">
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front of Card - Verse */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 md:p-6 shadow-lg border border-blue-100 dark:border-gray-600 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-white">
                  Verse of the Day
                </h3>
              </div>

              {/* Verse Text */}
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-base md:text-lg text-gray-800 dark:text-gray-100 italic leading-relaxed text-center mb-4">
                  "{verse.verse_text}"
                </p>
                <p className="text-sm md:text-base text-blue-700 dark:text-blue-300 font-medium text-center">
                  — {verse.verse_reference}
                </p>
              </div>

              {/* Tap to see reflection button */}
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Tap to see reflection
                </button>
              </div>
            </div>
          </div>

          {/* Back of Card - Reflection */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-800 dark:to-purple-700 rounded-xl p-4 md:p-6 shadow-lg border border-purple-100 dark:border-purple-600 h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm md:text-base font-semibold text-purple-900 dark:text-white">
                    Catholic Reflection
                  </h3>
                </div>
                <button
                  onClick={() => setIsFlipped(false)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                  aria-label="Back to verse"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </div>

              {/* Reflection Content - No scroll, fully visible */}
              <div className="flex-1 flex flex-col">
                {/* Verse text at top - more compact */}
                <div className="mb-3 p-2 bg-purple-100/40 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-700 dark:text-purple-200 italic text-center">
                    "{verse.verse_text}"
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-300 font-medium text-center mt-1">
                    — {verse.verse_reference}
                  </p>
                </div>
                
                {/* Formatted reflection sections */}
                <div className="flex-1 space-y-2">
                  {(() => {
                    const sections = formatReflectionText(verse.explanation);
                    
                    // If no sections parsed, show as single paragraph
                    if (sections.length === 0 || (sections.length === 1 && !sections[0].title)) {
                      return (
                        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {verse.explanation}
                        </p>
                      );
                    }
                    
                    // Show formatted sections
                    return sections.map((section, index) => (
                      <div key={index} className="">
                        {section.title && (
                          <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                            {section.title}
                          </h4>
                        )}
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Catechism references - more compact */}
                {verse.catechism_references && verse.catechism_references.length > 0 && (
                  <div className="mt-3 bg-purple-100/60 dark:bg-purple-900/40 p-2 rounded-lg">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      <span className="font-medium">Catechism: </span>
                      {verse.catechism_references.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 