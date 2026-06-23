import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore, selectCanAskQuestion, selectRemainingQuestions } from '../store/useStore';
import ReactMarkdown from 'react-markdown';

// Icons
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function CrownIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function BotIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// Welcome message
const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'bot',
  text: "Hello! I'm GraceGuide, your Catholic AI assistant. I can answer questions about Scripture, Church teaching, prayers, and moral guidance. What would you like to know?",
  timestamp: new Date().toISOString(),
};

// Suggested questions
const SUGGESTED_QUESTIONS = [
  "What is the Trinity?",
  "How do I pray the Rosary?",
  "What does the Church teach about marriage?",
  "Can you explain transubstantiation?",
  "What are the seven sacraments?",
  "How do I go to confession?",
  "Why do Catholics pray to Mary?",
  "What happens after death?",
];

// Source options
const SOURCES = [
  { id: 'both', label: 'Both', icon: '📚', desc: 'Bible & Catechism' },
  { id: 'bible', label: 'Bible', icon: '📖', desc: 'Scripture only' },
  { id: 'catechism', label: 'Catechism', icon: '✝️', desc: 'CCC only' }
];

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

// Chat message bubble
function ChatBubble({ message, isUser }) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-brand text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
      }`}>
        {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-brand text-white rounded-tr-none' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
      }`}>
        {isUser ? (
          <p className="text-sm">{message.text}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AskScreen({ onNavigate, onAsk }) {
  const [input, setInput] = useState('');
  const [source, setSource] = useState('both');
  const [isTyping, setIsTyping] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Store hooks
  const messages = useStore((state) => state.messages);
  const addMessage = useStore((state) => state.addMessage);
  const clearMessages = useStore((state) => state.clearMessages);
  const incrementDailyQuestions = useStore((state) => state.incrementDailyQuestions);
  const setShowSignInModal = useStore((state) => state.setShowSignInModal);
  const initializeUser = useStore((state) => state.initializeUser);

  // Selectors
  const canAskQuestion = useStore(selectCanAskQuestion);
  const remainingQuestions = useStore(selectRemainingQuestions);
  const isSignedIn = useStore((state) => !!state.user);
  const signInReason = "You've used your 10 free questions for today. Sign in free for unlimited questions.";
  
  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    // Check daily limit (anonymous users only)
    if (!canAskQuestion) {
      setShowSignInModal(true, signInReason);
      return;
    }
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    setInput('');
    setIsTyping(true);
    
    // Increment daily questions
    incrementDailyQuestions();
    
    try {
      // Call API
      const response = await fetch('/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text, mode: source })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: data.answer || data.response || "I'm sorry, I couldn't process your question right now. Please try again later.",
        timestamp: new Date().toISOString(),
        citations: data.citations || data.sources || [],
      };
      
      addMessage(botMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: "I'm sorry, I couldn't process your question right now. Please check your connection and try again.",
        timestamp: new Date().toISOString(),
      };
      
      addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  }, [input, source, canAskQuestion, addMessage, incrementDailyQuestions, setShowSignInModal]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };
  
  const handleNewChat = () => {
    clearMessages();
  };
  
  // Combine welcome message with stored messages
  const allMessages = messages.length === 0 ? [WELCOME_MESSAGE] : messages;
  const showSuggestions = messages.length === 0;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 safe-top safe-left safe-right sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="touch-target p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Ask GraceGuide</h1>
              {!isSignedIn && (
                <p className="text-xs text-gray-500">
                  {remainingQuestions} free questions remaining today
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Source selector toggle */}
            <button
              onClick={() => setShowSourceSelector(!showSourceSelector)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {SOURCES.find(s => s.id === source)?.icon} {SOURCES.find(s => s.id === source)?.label}
            </button>
            
            {/* New chat button */}
            <button
              onClick={handleNewChat}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="New chat"
            >
              <SparklesIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Source selector dropdown */}
        {showSourceSelector && (
          <div className="px-4 pb-3 border-t dark:border-gray-700 pt-3">
            <p className="text-xs text-gray-500 mb-2">Search source:</p>
            <div className="flex gap-2">
              {SOURCES.map((src) => (
                <button
                  key={src.id}
                  onClick={() => {
                    setSource(src.id);
                    setShowSourceSelector(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    source === src.id
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">{src.icon}</span>
                  {src.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {allMessages.map((message) => (
          <ChatBubble 
            key={message.id} 
            message={message} 
            isUser={message.type === 'user'} 
          />
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <BotIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <TypingIndicator />
          </div>
        )}
        
        {/* Suggested questions */}
        {showSuggestions && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 safe-bottom safe-left safe-right">
        {!canAskQuestion ? (
          <div className="bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              You've used your 10 free questions for today. Sign in free to keep asking — it's unlimited.
            </p>
            <button
              onClick={() => setShowSignInModal(true, signInReason)}
              className="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition"
            >
              Sign in for unlimited
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a Catholic question..."
                className="w-full bg-transparent text-gray-800 dark:text-white placeholder-gray-400 resize-none focus:outline-none"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-brand text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark transition"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
