import React, { useState, useEffect } from 'react';
import VerseOfTheDay from './VerseOfTheDay';

const SOURCES = [
  { label: 'Blend', value: 'both' },
  { label: 'Bible', value: 'bible' },
  { label: 'CCC', value: 'catechism' },
];

function TraditionalMoonIcon() {
  // White crescent moon inside a blue rounded square, matching the reference image
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#7B9DE7"/>
      <circle cx="16" cy="16" r="10" fill="white"/>
      <circle cx="21" cy="13" r="8" fill="#7B9DE7"/>
    </svg>
  );
}

function ThickHamburgerIcon() {
  return (
    <svg width="32" height="32" fill="none" viewBox="0 0 32 32" stroke="white">
      <rect y="7" width="32" height="4" rx="2" fill="white"/>
      <rect y="14" width="32" height="4" rx="2" fill="white"/>
      <rect y="21" width="32" height="4" rx="2" fill="white"/>
    </svg>
  );
}

function MobileHeader({ darkMode, setDarkMode, onMenu, user, onSignOut }) {
  return (
    <header className="flex flex-col md:block" style={{ background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' }}>
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Top row with hamburger, logo, and actions */}
        <div className="flex items-center justify-between px-3 py-2">
          <button
            className="p-2 rounded focus:outline-none bg-blue-900/30"
            onClick={onMenu}
            aria-label="Open history"
          >
            <ThickHamburgerIcon />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl font-bold">+</span>
            <span className="text-white text-xl font-bold">GraceGuideAI</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-full flex items-center justify-center"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setDarkMode(!darkMode)}
            >
              <TraditionalMoonIcon />
            </button>
            <button
              className="px-3 py-1.5 rounded-full flex items-center justify-center font-semibold text-white text-xs shadow-lg border border-blue-200 hover:bg-blue-700 transition-all"
              style={{ background: '#7B9DE7', boxShadow: '0 2px 8px #7B9DE733' }}
              onClick={onSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Tagline and user info row */}
        <div className="pb-2 px-3">
          <span className="text-yellow-300 text-xs font-medium text-center block">Catholic answers powered by Scripture & Catechism</span>
          <span className="text-white text-xs text-center block mt-0.5">{user?.email}</span>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block relative px-4 py-3">
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded focus:outline-none bg-blue-900/30"
          onClick={onMenu}
          aria-label="Open history"
        >
          <ThickHamburgerIcon />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl font-bold">+</span>
            <span className="text-white text-2xl font-bold">GraceGuideAI</span>
          </div>
          <span className="text-yellow-300 text-sm font-medium -mt-1">Catholic answers powered by Scripture & Catechism</span>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            className="p-1 rounded-full flex items-center justify-center"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setDarkMode(!darkMode)}
          >
            <TraditionalMoonIcon />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">{user?.email}</span>
            <button
              className="px-4 py-2 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg border-2 border-blue-200 hover:bg-blue-700 transition-all"
              style={{ background: '#7B9DE7', boxShadow: '0 2px 8px #7B9DE733' }}
              onClick={onSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SourceSlider({ value, onChange }) {
  // 0: Blend, 1: Bible, 2: CCC
  const idx = SOURCES.findIndex(s => s.value === value);
  return (
    <div className="flex flex-col items-center w-32">
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={idx}
        onChange={e => onChange(SOURCES[+e.target.value].value)}
        className="w-32 accent-blue-800"
        style={{ accentColor: '#1e3c72' }}
      />
      <div className="relative w-32 flex justify-between mt-1" style={{ position: 'relative' }}>
        {SOURCES.map((s, i) => (
          <span
            key={s.value}
            className="text-xs font-medium text-gray-600 absolute"
            style={{ left: `${(i/(SOURCES.length-1))*100}%`, transform: 'translateX(-50%)', minWidth: 32, textAlign: 'center' }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignedInDashboard({ user, onSignOut }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('both');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('qaHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('qaHistory', JSON.stringify(history));
  }, [history]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          mode: source
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
      
      // Add to history
      const newItem = {
        id: Date.now(),
        question: question.trim(),
        answer: data.answer,
        source: source,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
    } catch (err) {
      setError('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const shareQuestion = (platform) => {
    if (!selectedQuestion) return;
    
    const text = `Q: ${selectedQuestion.question}\n\nA: ${selectedQuestion.answer}\n\n- GraceGuideAI`;
    
    switch(platform) {
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll copy to clipboard
        navigator.clipboard.writeText(text);
        alert('Text copied to clipboard! You can paste it in Instagram.');
        break;
      case 'save':
        // Create a canvas and save as image
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add logo/title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GraceGuideAI', canvas.width / 2, 150);
        
        // Add question
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#fbbf24';
        const questionLines = wrapText(ctx, `Q: ${selectedQuestion.question}`, canvas.width - 100);
        let y = 300;
        questionLines.forEach(line => {
          ctx.fillText(line, canvas.width / 2, y);
          y += 50;
        });
        
        // Add answer
        ctx.font = '32px Arial';
        ctx.fillStyle = 'white';
        const answerLines = wrapText(ctx, `A: ${selectedQuestion.answer}`, canvas.width - 100);
        y += 50;
        answerLines.forEach(line => {
          ctx.fillText(line, canvas.width / 2, y);
          y += 40;
        });
        
        // Add footer
        ctx.font = '28px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Learn more at GraceGuideAI.com', canvas.width / 2, canvas.height - 100);
        
        // Download
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'graceguide-qa.png';
          a.click();
          URL.revokeObjectURL(url);
        });
        break;
    }
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <MobileHeader
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenu={() => setShowHistory(!showHistory)}
        user={user}
        onSignOut={onSignOut}
      />

      {/* History Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform z-40 ${
        showHistory ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {history.length === 0 ? (
            <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No questions yet</p>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedQuestion(item)}
                className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
              >
                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">{item.question}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.timestamp).toLocaleDateString()} • {item.source}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
              <main className="flex flex-col items-center px-4 md:px-8 pt-4 md:pt-12 w-full">
          <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl flex flex-col items-center mx-auto">
            <label className="block text-base sm:text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100 mb-2 md:mb-4 text-center w-full">Ask your question</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 text-base sm:text-lg md:text-xl mb-2 md:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white text-left resize-none"
              rows={4}
            placeholder="e.g. What does the Catechism say about forgiveness?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="flex items-center justify-between w-full mt-2 mb-4 gap-2">
            <div className="flex-shrink-0">
              <SourceSlider value={source} onChange={setSource} />
            </div>
            <div className="flex-shrink-0">
              <button
                className="bg-blue-900 text-white px-6 sm:px-8 md:px-12 py-2 md:py-3 rounded-lg font-semibold text-base sm:text-lg md:text-xl shadow hover:bg-blue-800 transition disabled:opacity-50"
                onClick={handleAsk}
                disabled={!question.trim() || loading}
              >
                {loading ? 'Asking...' : 'Ask'}
              </button>
            </div>
          </div>

          {/* Verse of the Day - shows when no answer is displayed */}
          <VerseOfTheDay isVisible={!answer} />

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-6 md:mt-8 p-4 md:p-6 border rounded-lg bg-blue-50 dark:bg-gray-800 text-left w-full">
              <div className="font-semibold mb-2 md:mb-3 text-lg md:text-xl text-blue-900 dark:text-white">Answer:</div>
              <div className="mb-2 md:mb-4 text-base md:text-lg text-blue-900 dark:text-blue-100 whitespace-pre-wrap">{answer}</div>
            </div>
          )}
          
          {/* Verse of the Day - shows below answer when answer is displayed */}
          {answer && <VerseOfTheDay isVisible={true} />}
        </div>
      </main>

      {/* Question Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedQuestion(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Question Details</h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Question</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedQuestion.question}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Answer</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedQuestion.answer}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>{new Date(selectedQuestion.timestamp).toLocaleString()}</span>
                <span className="capitalize">Source: {selectedQuestion.source}</span>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Share this Q&A</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => shareQuestion('x')}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    X
                  </button>
                  <button
                    onClick={() => shareQuestion('facebook')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => shareQuestion('instagram')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    Instagram Story
                  </button>
                  <button
                    onClick={() => shareQuestion('save')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Save Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
