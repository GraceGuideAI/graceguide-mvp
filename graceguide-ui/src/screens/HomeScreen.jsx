import React, { useEffect, useState } from 'react';
import { useVerseOfDay, useHistory } from '../hooks/useApi';

// Icons
function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function BookOpenIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function HomeScreen({ onNavigate, onSelectQuestion }) {
  const { verse, loading: verseLoading, fetchVerse } = useVerseOfDay();
  const { history } = useHistory();
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    fetchVerse();
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [fetchVerse]);
  
  const recentHistory = history.slice(0, 5);
  
  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand to-brand-light safe-top safe-left safe-right">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">{greeting}</p>
              <h1 className="text-2xl font-bold text-white">GraceGuide</h1>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-yellow-300" />
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-1">Catholic answers powered by Scripture & Catechism</p>
        </div>
      </div>
      
      {/* Daily Verse Card */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <BookOpenIcon className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Verse of the Day</h2>
          </div>
          
          {verseLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : verse ? (
            <>
              <p className="text-gray-700 dark:text-gray-200 italic leading-relaxed text-base">
                "{verse.verse_text}"
              </p>
              <p className="text-brand font-medium mt-3 text-sm">
                — {verse.verse_reference}
              </p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Unable to load verse</p>
          )}
        </div>
      </div>
      
      {/* Quick Ask Section */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-brand" />
          Quick Ask
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('ask', { preset: 'What does the Church teach about confession?' })}
            className="touch-target bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left active:scale-95 transition-transform"
          >
            <span className="text-2xl mb-2 block">🙏</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Confession</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sacrament of reconciliation</p>
          </button>
          
          <button
            onClick={() => onNavigate('ask', { preset: 'What is the Eucharist?' })}
            className="touch-target bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left active:scale-95 transition-transform"
          >
            <span className="text-2xl mb-2 block">🍞</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Eucharist</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Body and Blood of Christ</p>
          </button>
          
          <button
            onClick={() => onNavigate('ask', { preset: 'How do I pray the Rosary?' })}
            className="touch-target bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left active:scale-95 transition-transform"
          >
            <span className="text-2xl mb-2 block">📿</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Rosary</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Marian devotion</p>
          </button>
          
          <button
            onClick={() => onNavigate('ask', { preset: 'What are the Ten Commandments?' })}
            className="touch-target bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left active:scale-95 transition-transform"
          >
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Commandments</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">God\'s law for us</p>
          </button>
        </div>
        
        <button
          onClick={() => onNavigate('ask')}
          className="touch-target w-full mt-3 bg-brand text-white rounded-xl py-4 font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-5 h-5" />
          Ask Your Own Question
        </button>
      </div>
      
      {/* Recent History */}
      {recentHistory.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-brand" />
              Recent Questions
            </h3>
            <button 
              onClick={() => onNavigate('history')}
              className="text-sm text-brand font-medium"
            >
              See All
            </button>
          </div>
          
          <div className="space-y-2">
            {recentHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectQuestion(item)}
                className="touch-target w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left active:scale-95 transition-transform"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2">
                  {item.question}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.source}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state if no history */}
      {recentHistory.length === 0 && (
        <div className="px-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
            <SparklesIcon className="w-8 h-8 text-brand mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Start asking questions to see your history here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
