import React, { useState, useEffect } from 'react';
import { useAuth, useHistory, useQA, useDarkMode } from './hooks/useApi';
import { useStore } from './store/useStore';

// Screens
import HomeScreen from './screens/HomeScreen';
import AskScreen from './screens/AskScreen';
import AnswerScreen from './screens/AnswerScreen';
import HistoryScreen from './screens/HistoryScreen';
import PrayersScreen from './screens/PrayersScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthModal from './screens/AuthModal';

// Icons
function HomeIcon({ className, filled }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SearchIcon({ className, filled }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2a9 9 0 106.32 15.49l3.388 3.388a1 1 0 001.414-1.414l-3.388-3.388A9 9 0 0011 2zm0 2a7 7 0 110 14 7 7 0 010-14z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BookOpenIcon({ className, filled }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3.75a.75.75 0 00-.75.75v11.69l-2.22-2.22a.75.75 0 10-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l3.5-3.5a.75.75 0 00-1.06-1.06l-2.22 2.22V4.5a.75.75 0 00-.75-.75z" />
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function UserIcon({ className, filled }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function HistoryIcon({ className, filled }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 100-16 8 8 0 000 16zm1-8a1 1 0 10-2 0v4a1 1 0 102 0v-4zm-1-6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Tab configuration
const TABS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'ask', label: 'Ask', icon: SearchIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'prayers', label: 'Prayers', icon: BookOpenIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon }
];

// Bottom Tab Bar Component
function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 safe-bottom z-50">
      <div className="flex items-center justify-around px-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`touch-target flex flex-col items-center justify-center py-2 px-2 min-w-[56px] transition-colors ${
                isActive ? 'text-brand' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`}
                  filled={isActive}
                />
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'scale-105' : ''} transition-transform`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, signIn, signUp, signOut } = useAuth();
  const { history, addToHistory } = useHistory();
  const { askQuestion, loading: asking, error: askError, progress } = useQA();
  const { darkMode, set: setDarkMode } = useDarkMode();
  
  // Store hooks
  const initializeUser = useStore((state) => state.initializeUser);
  const setStoreUser = useStore((state) => state.setUser);
  const showSignInModal = useStore((state) => state.showSignInModal);
  const signInReason = useStore((state) => state.signInReason);
  const setShowSignInModal = useStore((state) => state.setShowSignInModal);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenParams, setScreenParams] = useState({});
  
  // Answer state
  const [lastQuestion, setLastQuestion] = useState('');
  const [lastAnswer, setLastAnswer] = useState(null);
  const [lastSource, setLastSource] = useState('both');
  
  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Keep the store's user in sync with the auth hook so the question-limit
  // logic knows whether someone is signed in (covers load, sign in/up, sign out).
  useEffect(() => {
    setStoreUser(user ? { email: user.email } : null);
  }, [user, setStoreUser]);

  // Initialize dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Handle navigation
  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentScreen(tabId);
    setScreenParams({});
  };
  
  // Handle asking a question
  const handleAsk = async (question, source) => {
    setLastQuestion(question);
    setLastSource(source);
    
    const answer = await askQuestion(question, source);
    
    if (answer) {
      setLastAnswer(answer);
      addToHistory(question, answer, source);
      navigate('answer');
    }
  };
  
  // Handle selecting a question from history
  const handleSelectQuestion = (item) => {
    setLastQuestion(item.question);
    setLastAnswer(typeof item.answer === 'string' ? { answer: item.answer } : item.answer);
    setLastSource(item.source);
    navigate('answer');
  };
  
  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigate={navigate} 
            onSelectQuestion={handleSelectQuestion}
          />
        );
        
      case 'ask':
        return (
          <AskScreen
            onNavigate={navigate}
            onAsk={handleAsk}
            initialQuestion={screenParams.preset || ''}
            initialSource={lastSource}
          />
        );
        
      case 'answer':
        return (
          <AnswerScreen
            onNavigate={navigate}
            question={lastQuestion}
            answer={lastAnswer}
            source={lastSource}
          />
        );
        
      case 'history':
        return (
          <HistoryScreen
            onNavigate={navigate}
            onSelectQuestion={handleSelectQuestion}
          />
        );
        
      case 'prayers':
        return <PrayersScreen />;

      case 'profile':
        return (
          <ProfileScreen
            onNavigate={navigate}
            onSignIn={() => setShowSignInModal(true)}
            onSignOut={() => {
              signOut();
              navigate('home');
            }}
          />
        );

      default:
        return <HomeScreen onNavigate={navigate} onSelectQuestion={handleSelectQuestion} />;
    }
  };

  // Check if we should show the tab bar
  const showTabBar = ['home', 'history', 'prayers', 'profile'].includes(currentScreen);
  
  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Main content */}
      <div className={showTabBar ? 'pb-20' : ''}>
        {renderScreen()}
      </div>
      
      {/* Bottom Tab Bar */}
      {showTabBar && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={showSignInModal}
        reason={signInReason}
        onClose={() => setShowSignInModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />
      
      {/* Loading overlay for question asking */}
      {asking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-brand font-medium">Searching...</span>
              <span className="text-brand text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-brand h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Searching through Scripture & Catechism...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
