import React, { useState } from 'react';

// Icons
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

const PREMIUM_FEATURES = [
  {
    icon: SparklesIcon,
    title: 'Unlimited Questions',
    description: 'Ask as many questions as you want, no daily limits'
  },
  {
    icon: BookOpenIcon,
    title: 'Full Catechism Access',
    description: 'Access all 2,865 paragraphs of the Catechism'
  },
  {
    icon: ClockIcon,
    title: 'Priority Responses',
    description: 'Get faster answers with priority processing'
  },
  {
    icon: HeartIcon,
    title: 'Save Favorites',
    description: 'Unlimited bookmarks for verses and prayers'
  },
  {
    icon: LockIcon,
    title: 'Ad-Free Experience',
    description: 'Enjoy GraceGuide without any advertisements'
  }
];

const PRICING_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    popular: false
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: '/year',
    popular: true,
    savings: 'Save 33%'
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$199.99',
    period: ' one-time',
    popular: false,
    savings: 'Best value'
  }
];

export default function PremiumScreen({ onNavigate }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });
      
      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      const data = await response.json();
      
      // Redirect to Stripe checkout or handle success
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Thank you for subscribing!');
        onNavigate('profile');
      }
    } catch (err) {
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 safe-top safe-left safe-right">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => onNavigate('profile')}
            className="touch-target p-2 -ml-2 rounded-full hover:bg-white/20 transition"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white ml-2">Premium</h1>
        </div>
        
        {/* Hero */}
        <div className="px-4 pb-8 pt-4 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CrownIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Go Premium</h2>
          <p className="text-yellow-100">
            Unlock the full power of GraceGuide
          </p>
        </div>
      </div>
      
      {/* Features */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-center">
            Premium Features
          </h3>
          <div className="space-y-4">
            {PREMIUM_FEATURES.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Pricing */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-center">
          Choose Your Plan
        </h3>
        <div className="space-y-3">
          {PRICING_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`touch-target w-full relative p-4 rounded-xl border-2 transition-all ${
                selectedPlan === plan.id
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </span>
              )}
              {plan.savings && !plan.popular && (
                <span className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {plan.savings}
                </span>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedPlan === plan.id && (
                      <CheckIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {plan.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-800 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* CTA */}
      <div className="px-4 mt-6 pb-8 safe-bottom">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="touch-target w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-yellow-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <CrownIcon className="w-5 h-5" />
              Subscribe Now
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Cancel anytime. Subscription automatically renews unless cancelled.
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <button 
            onClick={() => window.open('/privacy', '_blank')}
            className="hover:text-gray-600"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button 
            onClick={() => window.open('/terms', '_blank')}
            className="hover:text-gray-600"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
}
