/**
 * PremiumGate Component
 * Demonstrates premium feature gating with RevenueCat integration
 * Shows upgrade prompts and handles subscription status
 */

import React, { useState, useEffect } from 'react';
import { usePremiumFeatures } from '../hooks/useRevenueCat.js';

export default function PremiumGate({ 
  children, 
  feature = 'default',
  fallback = null 
}) {
  const {
    isPremium,
    isLoading,
    error,
    canAskUnlimited,
    shouldShowAds,
    getQuestionLimit,
    availablePackages,
    purchasePackage,
    restorePurchases,
    subscriptionStatus
  } = usePremiumFeatures();

  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  // Feature-specific checks
  const hasAccess = () => {
    switch (feature) {
      case 'unlimited_questions':
        return canAskUnlimited();
      case 'no_ads':
        return !shouldShowAds();
      case 'default':
      default:
        return isPremium;
    }
  };

  // Handle purchase
  const handlePurchase = async (pkg) => {
    setPurchaseInProgress(true);
    setPurchaseError(null);
    
    try {
      const result = await purchasePackage(pkg);
      if (result.cancelled) {
        setPurchaseError('Purchase cancelled');
      }
    } catch (err) {
      setPurchaseError(err.message);
    } finally {
      setPurchaseInProgress(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    setPurchaseInProgress(true);
    setPurchaseError(null);
    
    try {
      await restorePurchases();
    } catch (err) {
      setPurchaseError(err.message);
    } finally {
      setPurchaseInProgress(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="premium-loading p-4 text-center">
        <div className="animate-pulse text-gray-500">
          Loading subscription status...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="premium-error p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">
          Error loading subscription: {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // User has access - render content
  if (hasAccess()) {
    return (
      <div className="premium-content">
        {children}
      </div>
    );
  }

  // User doesn't have access - show upgrade prompt
  return (
    <div className="premium-gate p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upgrade to Premium
        </h3>
        
        <p className="text-gray-600 mb-4">
          {feature === 'unlimited_questions' 
            ? "You've reached your daily question limit. Upgrade for unlimited questions!"
            : "Unlock premium features to enhance your experience."}
        </p>

        {/* Subscription Status */}
        {subscriptionStatus.status === 'expired' && (
          <p className="text-amber-600 text-sm mb-4">
            Your previous subscription expired on {new Date(subscriptionStatus.expiresDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Available Packages */}
      {availablePackages.length > 0 ? (
        <div className="space-y-3 mb-6">
          {availablePackages.map((pkg) => (
            <button
              key={pkg.identifier}
              onClick={() => handlePurchase(pkg)}
              disabled={purchaseInProgress}
              className="w-full p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {pkg.title || pkg.packageType}
                  </div>
                  {pkg.description && (
                    <div className="text-sm text-gray-500">{pkg.description}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{pkg.priceString}</div>
                  {pkg.subscriptionPeriod && (
                    <div className="text-xs text-gray-500">
                      per {pkg.subscriptionPeriod.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
              {pkg.freeTrialPeriod && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  🎁 {pkg.freeTrialPeriod} free trial
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mb-6">
          No subscription options available. Please try again later.
        </div>
      )}

      {/* Purchase Error */}
      {purchaseError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {purchaseError}
        </div>
      )}

      {/* Restore Purchases */}
      <div className="text-center">
        <button
          onClick={handleRestore}
          disabled={purchaseInProgress}
          className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
        >
          Restore previous purchases
        </button>
      </div>

      {/* Feature List */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Premium includes:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited questions
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Ad-free experience
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Priority support
          </li>
        </ul>
      </div>

      {/* Custom Fallback */}
      {fallback && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          {fallback}
        </div>
      )}
    </div>
  );
}

/**
 * QuestionCounter Component
 * Shows remaining questions for free users
 */
export function QuestionCounter({ questionsAskedToday = 0 }) {
  const { getQuestionLimit, isPremium } = usePremiumFeatures();
  
  if (isPremium) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Unlimited questions
      </div>
    );
  }

  const limit = getQuestionLimit();
  const remaining = Math.max(0, limit - questionsAskedToday);
  const percentage = (remaining / limit) * 100;

  return (
    <div className="question-counter">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Daily questions remaining</span>
        <span className={`font-medium ${remaining === 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {remaining}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${
            percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {remaining === 0 && (
        <p className="text-xs text-red-600 mt-1">
          You've reached your daily limit. Upgrade for unlimited questions!
        </p>
      )}
    </div>
  );
}

/**
 * AdPlaceholder Component
 * Shows ad space for free users (hidden for premium)
 */
export function AdPlaceholder() {
  const { shouldShowAds } = usePremiumFeatures();
  
  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="ad-placeholder p-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Advertisement</p>
      <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
        <span className="text-gray-400 text-sm">Ad Space</span>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Upgrade to remove ads
      </p>
    </div>
  );
}
