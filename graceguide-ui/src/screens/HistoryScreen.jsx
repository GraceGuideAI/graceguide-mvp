import React, { useState, useMemo } from 'react';
import { useHistory } from '../hooks/useApi';

// Icons
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function BookIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function HistoryScreen({ onNavigate, onSelectQuestion }) {
  const { history, clearHistory, deleteItem } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Filter history based on search
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(item => 
      item.question.toLowerCase().includes(query) ||
      (item.answer?.answer || item.answer || '').toLowerCase().includes(query)
    );
  }, [history, searchQuery]);
  
  // Group by date
  const groupedHistory = useMemo(() => {
    const groups = {};
    filteredHistory.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }, [filteredHistory]);
  
  const handleDelete = (id) => {
    deleteItem(id);
    setItemToDelete(null);
  };
  
  const getSourceIcon = (source) => {
    switch(source) {
      case 'bible': return '📖';
      case 'catechism': return '✝️';
      default: return '📚';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 safe-top safe-left safe-right sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => onNavigate('home')}
            className="touch-target p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">History</h1>
          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="touch-target p-2 -mr-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <TrashIcon className="w-5 h-5 text-red-500" />
            </button>
          )}
          {history.length === 0 && <div className="w-10" />}
        </div>
        
        {/* Search bar */}
        {history.length > 0 && (
          <div className="px-4 pb-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <XIcon className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 py-4 pb-24">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No history yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your questions and answers will appear here
            </p>
            <button
              onClick={() => onNavigate('ask')}
              className="touch-target mt-6 px-6 py-3 bg-brand text-white rounded-xl font-medium"
            >
              Ask a Question
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No results found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 sticky top-[120px] bg-gray-50 dark:bg-gray-900 py-1">
                  {date}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => onSelectQuestion(item)}
                        className="touch-target w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getSourceIcon(item.source)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white line-clamp-2">
                              {item.question}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {typeof item.answer === 'string' 
                                ? item.answer 
                                : item.answer?.answer || 'No answer'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 capitalize">
                                {item.source}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                      <div className="flex border-t dark:border-gray-700">
                        <button
                          onClick={() => onSelectQuestion(item)}
                          className="touch-target flex-1 py-3 text-sm font-medium text-brand hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          View Answer
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="touch-target px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition border-l dark:border-gray-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Clear All Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setShowClearConfirm(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 animate-fadeIn">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertIcon className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">
              Clear all history?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete all {history.length} questions from your history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="touch-target flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="touch-target flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Item Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setItemToDelete(null)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">
              Delete this question?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 line-clamp-2">
              "{itemToDelete.question}"
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="touch-target flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(itemToDelete.id)}
                className="touch-target flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
