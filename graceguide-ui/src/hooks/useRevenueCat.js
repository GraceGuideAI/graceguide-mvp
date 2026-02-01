/**
 * RevenueCat Web SDK Integration Hook
 * Provides subscription management for premium features:
 * - Unlimited questions
 * - No ads
 * 
 * Uses RevenueCat's Web SDK for web-based subscriptions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logEvent } from '../api.js';

// RevenueCat configuration
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;
const REVENUECAT_ENTITLEMENT_ID = import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || 'premium';

// Store for RevenueCat SDK (loaded dynamically)
let revenueCatPromise = null;

/**
 * Dynamically load RevenueCat Web SDK
 */
async function loadRevenueCatSDK() {
  if (revenueCatPromise) return revenueCatPromise;
  
  revenueCatPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.RevenueCat) {
      resolve(window.RevenueCat);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.revenuecat.com/v1/revenuecat.js';
    script.async = true;
    script.onload = () => resolve(window.RevenueCat);
    script.onerror = () => reject(new Error('Failed to load RevenueCat SDK'));
    document.head.appendChild(script);
  });
  
  return revenueCatPromise;
}

/**
 * Generate or retrieve anonymous user ID for RevenueCat
 */
function getAnonymousUserId() {
  let userId = localStorage.getItem('rc_user_id');
  if (!userId) {
    userId = `rc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('rc_user_id', userId);
  }
  return userId;
}

/**
 * Update user ID to match authenticated user
 */
export async function identifyRevenueCatUser(email) {
  try {
    const RevenueCat = await loadRevenueCatSDK();
    const sdk = RevenueCat.configure(REVENUECAT_API_KEY, email);
    await sdk.login(email);
    return true;
  } catch (err) {
    console.warn('RevenueCat identification failed:', err);
    return false;
  }
}

/**
 * Main hook for RevenueCat subscription management
 * @param {Object} options
 * @param {string} options.userEmail - Authenticated user's email (optional)
 * @returns {Object} Subscription state and methods
 */
export function useRevenueCat(options = {}) {
  const { userEmail } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [offerings, setOfferings] = useState(null);
  const [error, setError] = useState(null);
  const [currentPurchase, setCurrentPurchase] = useState(null);
  
  const sdkRef = useRef(null);
  
  // Initialize RevenueCat
  useEffect(() => {
    let mounted = true;
    
    async function init() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load SDK
        const RevenueCat = await loadRevenueCatSDK();
        
        // Configure with user ID
        const userId = userEmail || getAnonymousUserId();
        const sdk = RevenueCat.configure(REVENUECAT_API_KEY, userId);
        sdkRef.current = sdk;
        
        // Get customer info
        const info = await sdk.getCustomerInfo();
        if (!mounted) return;
        
        setCustomerInfo(info);
        
        // Load offerings
        const offeringsData = await sdk.getOfferings();
        if (!mounted) return;
        
        setOfferings(offeringsData);
        setIsInitialized(true);
        
        logEvent('revenuecat_initialized');
      } catch (err) {
        console.error('RevenueCat initialization failed:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [userEmail]);
  
  // Check if user has premium entitlement
  const isPremium = useCallback(() => {
    if (!customerInfo) return false;
    
    const entitlements = customerInfo.entitlements || {};
    const premium = entitlements[REVENUECAT_ENTITLEMENT_ID];
    
    return premium?.isActive === true;
  }, [customerInfo]);
  
  // Get subscription status details
  const getSubscriptionStatus = useCallback(() => {
    if (!customerInfo) {
      return { status: 'unknown', expiresDate: null };
    }
    
    const entitlements = customerInfo.entitlements || {};
    const premium = entitlements[REVENUECAT_ENTITLEMENT_ID];
    
    if (!premium) {
      return { status: 'inactive', expiresDate: null };
    }
    
    if (premium.isActive) {
      return {
        status: 'active',
        expiresDate: premium.expiresDate,
        willRenew: premium.willRenew,
        periodType: premium.periodType
      };
    }
    
    return {
      status: 'expired',
      expiresDate: premium.expiresDate,
      willRenew: false
    };
  }, [customerInfo]);
  
  // Purchase a package
  const purchasePackage = useCallback(async (packageToPurchase) => {
    if (!sdkRef.current) {
      throw new Error('RevenueCat not initialized');
    }
    
    try {
      setCurrentPurchase(packageToPurchase.identifier);
      setError(null);
      
      logEvent('purchase_started');
      
      const result = await sdkRef.current.purchasePackage(packageToPurchase);
      
      // Refresh customer info after purchase
      const info = await sdkRef.current.getCustomerInfo();
      setCustomerInfo(info);
      
      logEvent('purchase_completed');
      
      return {
        success: true,
        customerInfo: info,
        transaction: result.transaction
      };
    } catch (err) {
      console.error('Purchase failed:', err);
      logEvent('purchase_failed');
      
      // Check if user cancelled
      if (err.userCancelled) {
        return { success: false, cancelled: true, error: err.message };
      }
      
      throw err;
    } finally {
      setCurrentPurchase(null);
    }
  }, []);
  
  // Restore purchases (for existing subscribers)
  const restorePurchases = useCallback(async () => {
    if (!sdkRef.current) {
      throw new Error('RevenueCat not initialized');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      logEvent('restore_purchases_started');
      
      const info = await sdkRef.current.restorePurchases();
      setCustomerInfo(info);
      
      logEvent('restore_purchases_completed');
      
      return {
        success: true,
        customerInfo: info,
        hasActiveSubscription: isPremium()
      };
    } catch (err) {
      console.error('Restore purchases failed:', err);
      logEvent('restore_purchases_failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isPremium]);
  
  // Refresh customer info
  const refresh = useCallback(async () => {
    if (!sdkRef.current) return;
    
    try {
      setIsLoading(true);
      const info = await sdkRef.current.getCustomerInfo();
      setCustomerInfo(info);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Get monthly/annual packages if available
  const getAvailablePackages = useCallback(() => {
    if (!offerings?.current?.availablePackages) return [];
    
    return offerings.current.availablePackages.map(pkg => ({
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      price: pkg.product?.price,
      priceString: pkg.product?.priceString,
      currencyCode: pkg.product?.currencyCode,
      description: pkg.product?.description,
      title: pkg.product?.title,
      subscriptionPeriod: pkg.product?.subscriptionPeriod,
      freeTrialPeriod: pkg.product?.introPrice?.period
    }));
  }, [offerings]);
  
  return {
    // State
    isInitialized,
    isLoading,
    error,
    currentPurchase,
    
    // Premium status
    isPremium: isPremium(),
    subscriptionStatus: getSubscriptionStatus(),
    
    // Data
    offerings,
    customerInfo,
    availablePackages: getAvailablePackages(),
    
    // Actions
    purchasePackage,
    restorePurchases,
    refresh,
    
    // Config
    entitlementId: REVENUECAT_ENTITLEMENT_ID
  };
}

/**
 * Hook for premium feature gating
 * Returns helpers for checking premium access
 */
export function usePremiumFeatures() {
  const revenueCat = useRevenueCat();
  
  // Check if user can ask unlimited questions
  const canAskUnlimited = () => {
    return revenueCat.isPremium;
  };
  
  // Check if user should see ads
  const shouldShowAds = () => {
    return !revenueCat.isPremium;
  };
  
  // Get daily question limit for free users
  const getQuestionLimit = () => {
    return revenueCat.isPremium ? Infinity : 5;
  };
  
  // Check if user has reached their daily limit
  const hasReachedQuestionLimit = (questionsAskedToday) => {
    const limit = getQuestionLimit();
    if (limit === Infinity) return false;
    return questionsAskedToday >= limit;
  };
  
  return {
    ...revenueCat,
    canAskUnlimited,
    shouldShowAds,
    getQuestionLimit,
    hasReachedQuestionLimit
  };
}

export default useRevenueCat;
