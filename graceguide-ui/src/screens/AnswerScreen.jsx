import React, { useState, useRef } from 'react';

// Icons
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function ShareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684-5.042m2.684 5.042a3 3 0 00-2.684-5.042M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function CopyIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

export default function AnswerScreen({ onNavigate, question, answer, source }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const answerRef = useRef(null);
  
  // Parse sources from answer
  const sources = answer?.sources || [];
  const answerText = answer?.answer || answer || 'No answer available';
  
  const handleShare = async (platform) => {
    const shareText = `Q: ${question}\n\nA: ${answerText}\n\n— Shared from GraceGuide`;
    
    switch(platform) {
      case 'copy':
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.substring(0, 280))}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'GraceGuide Q&A',
            text: shareText,
            url: window.location.href
          });
        }
        break;
    }
    setShowShareMenu(false);
  };
  
  const generateShareImage = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✝️ GraceGuide', canvas.width / 2, 120);
    
    // Question section
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Question:', canvas.width / 2, 280);
    
    ctx.font = '32px Inter, sans-serif';
    ctx.fillStyle = 'white';
    const questionLines = wrapText(ctx, question, canvas.width - 120, 36);
    let y = 340;
    questionLines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, y);
      y += 44;
    });
    
    // Answer section
    y += 40;
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Answer:', canvas.width / 2, y);
    
    y += 60;
    ctx.font = '28px Inter, sans-serif';
    ctx.fillStyle = 'white';
    const answerLines = wrapText(ctx, answerText, canvas.width - 120, 36);
    answerLines.slice(0, 25).forEach(line => { // Limit lines
      ctx.fillText(line, canvas.width / 2, y);
      y += 36;
    });
    
    // Footer
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Learn more at GraceGuide.app', canvas.width / 2, canvas.height - 80);
    
    // Download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graceguide-qa.png';
      a.click();
      URL.revokeObjectURL(url);
    });
    
    setShowShareMenu(false);
  };
  
  const wrapText = (ctx, text, maxWidth, lineHeight) => {
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
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20" ref={answerRef}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 safe-top safe-left safe-right sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => onNavigate('home')}
            className="touch-target p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Answer</h1>
          <button
            onClick={() => setShowShareMenu(true)}
            className="touch-target p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ShareIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-4">
        {/* Question card */}
        <div className="bg-brand/10 dark:bg-brand/20 rounded-xl p-4 mb-4">
          <p className="text-xs font-medium text-brand uppercase tracking-wide mb-1">Question</p>
          <p className="text-gray-800 dark:text-white font-medium">{question}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 capitalize">
              {source}
            </span>
          </div>
        </div>
        
        {/* Answer card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 animate-fadeIn">
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {answerText}
          </p>
        </div>
        
        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Sources
            </h3>
            <div className="space-y-2">
              {sources.map((src, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">{src}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('ask')}
            className="touch-target bg-white dark:bg-gray-800 rounded-xl py-3 font-medium text-gray-700 dark:text-gray-200 shadow-sm active:scale-95 transition"
          >
            Ask Another
          </button>
          <button
            onClick={() => setShowShareMenu(true)}
            className="touch-target bg-brand text-white rounded-xl py-3 font-medium shadow-lg shadow-brand/30 active:scale-95 transition"
          >
            Share Answer
          </button>
        </div>
      </div>
      
      {/* Share Menu Modal */}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setShowShareMenu(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm animate-slideUp overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">Share</h3>
              <button 
                onClick={() => setShowShareMenu(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="touch-target w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <ShareIcon className="w-5 h-5 text-brand" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Share via...</span>
                </button>
              )}
              
              <button
                onClick={() => handleShare('copy')}
                className="touch-target w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <CopyIcon className="w-5 h-5 text-brand" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </span>
              </button>
              
              <button
                onClick={generateShareImage}
                className="touch-target w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <DownloadIcon className="w-5 h-5 text-brand" />
                <span className="font-medium text-gray-700 dark:text-gray-200">Save as image</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleShare('x')}
                  className="touch-target py-3 bg-black text-white rounded-xl font-medium"
                >
                  Share on X
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="touch-target py-3 bg-blue-600 text-white rounded-xl font-medium"
                >
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
