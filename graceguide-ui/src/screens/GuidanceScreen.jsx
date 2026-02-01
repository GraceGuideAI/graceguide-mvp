import React, { useState } from 'react';
import { useStore, selectIsPremium } from '../store/useStore';
import ReactMarkdown from 'react-markdown';

// Icons
function CompassIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function MedicalIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function AcademicIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

// Guidance categories
const GUIDANCE_CATEGORIES = [
  { id: 'relationships', icon: HeartIcon, label: 'Relationships', description: 'Dating, marriage, family', color: 'bg-rose-100 text-rose-600' },
  { id: 'work', icon: BriefcaseIcon, label: 'Work', description: 'Ethics, career decisions', color: 'bg-blue-100 text-blue-600' },
  { id: 'finance', icon: CashIcon, label: 'Finance', description: 'Stewardship, charity', color: 'bg-green-100 text-green-600' },
  { id: 'health', icon: MedicalIcon, label: 'Health', description: 'Medical ethics, suffering', color: 'bg-red-100 text-red-600' },
  { id: 'education', icon: AcademicIcon, label: 'Education', description: 'Learning, truth-seeking', color: 'bg-purple-100 text-purple-600' },
  { id: 'community', icon: UsersIcon, label: 'Community', description: 'Social issues, politics', color: 'bg-orange-100 text-orange-600' },
];

// Sample response for demo
const SAMPLE_RESPONSE = {
  guidance: `Based on Catholic teaching, this situation calls for careful discernment of several moral principles:

**Primary Considerations:**
1. The dignity of the human person must be respected
2. Truthfulness and honesty are paramount
3. The common good should be considered

**Relevant Church Teaching:**
The Catechism teaches that we must act with prudence, seeking the good and choosing the right means to achieve it (CCC 1806). In your situation, this means weighing the potential harm against the potential good.

**Recommendation:**
Pray for wisdom, consult with a spiritual director if possible, and act with charity toward all involved.`,
  principles: ['Human Dignity', 'Truthfulness', 'Common Good', 'Prudence'],
  citations: [
    { type: 'catechism', reference: 'CCC 1806', text: 'Prudence is the virtue that disposes practical reason to discern our true good in every circumstance...' },
    { type: 'scripture', reference: 'James 1:5', text: 'If any of you lacks wisdom, let him ask God, who gives generously...' },
  ],
};

// Premium features list
const PREMIUM_FEATURES = [
  'Personalized moral analysis',
  'Catechism references',
  'Scripture citations',
  'Practical recommendations',
  'Confidential & private',
];

export default function GuidanceScreen({ onNavigate }) {
  const [situation, setSituation] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const isPremium = useStore(selectIsPremium);
  
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = GUIDANCE_CATEGORIES.find(c => c.id === categoryId);
    setContext(`Category: ${category?.label || categoryId}`);
  };
  
  const handleSubmit = async () => {
    if (!situation.trim()) return;
    
    if (!isPremium) {
      onNavigate('premium');
      return;
    }
    
    setIsLoading(true);
    try {
      // In production, this would call the API
      // const result = await api.requestMoralGuidance(situation, context);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResponse(SAMPLE_RESPONSE);
    } catch (error) {
      console.error('Failed to get guidance:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setResponse(null);
    setSituation('');
    setContext('');
    setSelectedCategory(null);
  };
  
  // Premium gate
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand to-brand-light safe-top safe-left safe-right">
          <div className="px-4 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 -ml-2 rounded-full hover:bg-white/20 transition"
              >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CompassIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Moral Guidance</h1>
                <p className="text-blue-100 text-sm">Premium feature</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium overlay */}
        <div className="px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CrownIcon className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Premium Feature
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get personalized moral guidance grounded in Catholic teaching, Scripture, and the Catechism.
            </p>
            
            {/* Features list */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                What's included:
              </p>
              <ul className="space-y-2">
                {PREMIUM_FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => onNavigate('premium')}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand to-brand-light safe-top safe-left safe-right">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 -ml-2 rounded-full hover:bg-white/20 transition"
            >
              <ArrowLeftIcon className="w-6 h-6 text-white" />
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CompassIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Moral Guidance</h1>
              <p className="text-blue-100 text-sm">Guided by Catholic teaching</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-6">
        {!response ? (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Describe your situation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your moral dilemma or question, and receive guidance based on Catholic teaching
              </p>
            </div>
            
            {/* Categories */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select a category (optional):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GUIDANCE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`p-3 rounded-xl text-left transition ${
                        isSelected
                          ? 'bg-brand text-white'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                        isSelected ? 'bg-white/20' : cat.color
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : ''}`} />
                      </div>
                      <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                        {cat.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {cat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Input fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your situation *
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="What moral question or dilemma are you facing?"
                  className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand/50 border border-gray-200 dark:border-gray-700"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional context (optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any relevant details that might help..."
                  className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand/50 border border-gray-200 dark:border-gray-700"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!situation.trim() || isLoading}
              className="w-full py-4 bg-brand text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Seeking Guidance...
                </>
              ) : (
                <>
                  <CompassIcon className="w-5 h-5" />
                  Get Guidance
                </>
              )}
            </button>
            
            {/* Disclaimer */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              *This guidance is for informational purposes and should not replace consultation with a priest or spiritual director for serious matters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Response header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                <CompassIcon className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Guidance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Based on Catholic teaching</p>
              </div>
            </div>
            
            {/* Guidance content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{response.guidance}</ReactMarkdown>
              </div>
            </div>
            
            {/* Principles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Key Principles
              </h3>
              <div className="flex flex-wrap gap-2">
                {response.principles.map((principle) => (
                  <span
                    key={principle}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
                  >
                    {principle}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Citations */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Sources
              </h3>
              <div className="space-y-3">
                {response.citations.map((citation, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-brand"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-brand text-white text-xs rounded">
                        {citation.type}
                      </span>
                      <span className="font-semibold text-brand">
                        {citation.reference}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "{citation.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* New request button */}
            <button
              onClick={handleReset}
              className="w-full py-3 border-2 border-brand text-brand rounded-xl font-semibold hover:bg-brand/5 transition"
            >
              Ask Another Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
