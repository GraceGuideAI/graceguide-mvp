import React, { useState } from 'react';
import { SignInModal, SignUpModal } from './AuthModals';

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

function MobileHeader({ darkMode, setDarkMode, onMenu, onSignIn }) {
  return (
    <header className="flex flex-col" style={{ background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' }}>
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
            onClick={onSignIn}
          >
            Sign In/Sign Up
          </button>
        </div>
      </div>
      
      {/* Tagline row */}
      <div className="pb-2 px-3">
        <span className="text-yellow-300 text-xs font-medium text-center block">Catholic answers powered by Scripture & Catechism</span>
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

function HistorySidebar({ open, onClose, history, onSelectQuestion }) {
  return (
    <>
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      </div>
      <aside className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg p-4 flex flex-col z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-lg text-blue-900">History</span>
          <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700 transition">&times;</button>
        </div>
        <ul className="flex-1 overflow-y-auto space-y-2">
          {history.length === 0 ? (
            <li className="text-xs text-gray-400 text-center mt-8">No questions yet</li>
          ) : (
            history.map((item, idx) => (
              <li 
                key={idx} 
                className="bg-blue-50 rounded p-3 text-sm cursor-pointer hover:bg-blue-100 transition-all transform hover:scale-105"
                onClick={() => onSelectQuestion(item)}
              >
                <div className="font-medium text-blue-900 line-clamp-2">{item.question}</div>
                <div className="text-xs text-blue-700 mt-1 line-clamp-2 opacity-75">{item.answer?.answer}</div>
              </li>
            ))
          )}
        </ul>
      </aside>
    </>
  );
}

function QuestionModal({ item, onClose }) {
  if (!item) return null;
  const [showShareOptions, setShowShareOptions] = useState(false);

  const generateShareImage = async () => {
    // Create a canvas with the Q&A
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add content
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GraceGuideAI', canvas.width / 2, 200);
    
    // Question
    ctx.font = '36px Arial';
    ctx.fillText('Question:', canvas.width / 2, 400);
    ctx.font = '32px Arial';
    wrapText(ctx, item.question, canvas.width / 2, 500, 900, 40);
    
    // Answer
    ctx.font = '36px Arial';
    ctx.fillText('Answer:', canvas.width / 2, 900);
    ctx.font = '32px Arial';
    wrapText(ctx, item.answer.answer, canvas.width / 2, 1000, 900, 40);
    
    return canvas.toDataURL('image/png');
  };

  const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY);
  };

  const handleShare = async (platform) => {
    const shareText = `Q: ${item.question}\n\nA: ${item.answer.answer}`;
    
    switch(platform) {
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'instagram':
        alert('To share on Instagram Story, save the image and upload it from your Instagram app');
        handleSaveImage();
        break;
      case 'save':
        handleSaveImage();
        break;
    }
    setShowShareOptions(false);
  };

  const handleSaveImage = async () => {
    const dataUrl = await generateShareImage();
    const link = document.createElement('a');
    link.download = 'graceguide-qa.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="Share"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684-5.042m2.684 5.042a3 3 0 00-2.684-5.042M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showShareOptions && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-2 w-48">
                <button onClick={() => handleShare('x')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Share to X</button>
                <button onClick={() => handleShare('facebook')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Share to Facebook</button>
                <button onClick={() => handleShare('instagram')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Instagram Story</button>
                <button onClick={() => handleShare('save')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">Save Image</button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 pt-12">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Question:</h4>
            <p className="text-gray-900">{item.question}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Answer:</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{item.answer.answer}</p>
          </div>
          {item.answer.sources && item.answer.sources.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Sources:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {item.answer.sources.map((src, idx) => (
                  <li key={idx}>{src}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GuestDashboard({ onSignIn }) {
  const [darkMode, setDarkMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [source, setSource] = useState('both');
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  React.useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch('/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, mode: source })
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setAnswer(data);
      setHistory([{ question, answer: data }, ...history]);
      setQuestion("");
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <MobileHeader
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onMenu={() => setSidebarOpen(true)}
        onSignIn={() => setShowSignIn(true)}
      />
      <HistorySidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        history={history}
        onSelectQuestion={(item) => {
          setSelectedQuestion(item);
          setSidebarOpen(false);
        }}
      />
      <QuestionModal 
        item={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
      />
      <SignInModal 
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSuccess={(data) => {
          setShowSignIn(false);
          onSignIn(data);
        }}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />
      <SignUpModal 
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSuccess={(data) => {
          setShowSignUp(false);
          onSignIn(data);
        }}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
      <main className="flex flex-col items-center px-4 md:px-8 pt-4 md:pt-12 w-full">
        <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl flex flex-col items-center mx-auto">
          <label className="block text-base sm:text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100 mb-2 md:mb-4 text-center w-full">Ask your question</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 text-base sm:text-lg md:text-xl mb-2 md:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white text-left resize-none"
            rows={4}
            placeholder="e.g. What does the Catechism say about forgiveness?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
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
          {answer && (
            <div className="mt-6 md:mt-8 p-4 md:p-6 border rounded-lg bg-blue-50 dark:bg-gray-800 text-left w-full">
              <div className="font-semibold mb-2 md:mb-3 text-lg md:text-xl text-blue-900 dark:text-white">Answer:</div>
              <div className="mb-2 md:mb-4 text-base md:text-lg text-blue-900 dark:text-blue-100 whitespace-pre-wrap">{answer.answer}</div>
              {answer.sources && answer.sources.length > 0 && (
                <div className="mt-3 md:mt-4 text-xs md:text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-semibold mb-1">Sources:</div>
                  <ul className="list-disc pl-5">
                    {answer.sources.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-600 text-sm w-full text-center">{error}</div>
          )}
        </div>
      </main>
    </div>
  );
}
