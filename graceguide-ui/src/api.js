/**
 * GraceGuide Mobile API Client
 * Provides fetch wrappers for backend endpoints with error handling,
 * authentication, and RevenueCat subscription integration.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to get auth headers if user is logged in
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * QA (Question Answering)
 * POST /qa
 * @param {string} question - The user's question
 * @param {string} mode - 'both' | 'bible' | 'catechism'
 * @returns {Promise<{answer: string, sources: string[]}>}
 */
export async function askQuestion(question, mode = 'both') {
  const response = await fetch(`${API_BASE_URL}/qa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ question, mode })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to get answer');
  }

  return response.json();
}

/**
 * Subscribe (Email capture)
 * POST /subscribe
 * @param {string} email - User's email address
 * @returns {Promise<{status: 'ok' | 'already_subscribed'}>}
 */
export async function subscribeEmail(email) {
  const response = await fetch(`${API_BASE_URL}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Subscription failed');
  }

  return response.json();
}

/**
 * Log Event (Analytics)
 * POST /log_event
 * @param {string} event - Event name to log
 * @returns {Promise<{status: 'ok'}>}
 */
export async function logEvent(event) {
  try {
    const response = await fetch(`${API_BASE_URL}/log_event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ event })
    });

    if (!response.ok) {
      console.warn('Failed to log event:', event);
    }

    return { status: 'ok' };
  } catch (err) {
    // Silently fail - analytics should never break the app
    console.warn('Analytics error:', err);
    return { status: 'ok' };
  }
}

/**
 * Get Metrics (Admin only)
 * GET /metrics
 * @param {string} adminPassword - Admin password for basic auth
 * @returns {Promise<Record<string, number>>}
 */
export async function getMetrics(adminPassword) {
  const credentials = btoa(`admin:${adminPassword}`);
  
  const response = await fetch(`${API_BASE_URL}/metrics`, {
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid admin credentials');
    }
    const error = await response.text();
    throw new Error(error || 'Failed to fetch metrics');
  }

  return response.json();
}

/**
 * Authentication - Sign Up
 * POST /auth/signup
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, email: string}>}
 */
export async function signUp(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Sign up failed');
  }

  const data = await response.json();
  
  // Store auth data
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userEmail', data.email);
  
  return data;
}

/**
 * Authentication - Sign In
 * POST /auth/signin
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, email: string}>}
 */
export async function signIn(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Invalid credentials');
  }

  const data = await response.json();
  
  // Store auth data
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userEmail', data.email);
  
  return data;
}

/**
 * Get Verse of the Day
 * GET /verse-of-the-day
 * @returns {Promise<{verse_text: string, verse_reference: string}>}
 */
export async function getVerseOfTheDay() {
  const response = await fetch(`${API_BASE_URL}/verse-of-the-day`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch verse');
  }
  
  return response.json();
}

/**
 * Clear local auth data
 */
export function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Export all functions as a namespace for convenience
export const api = {
  askQuestion,
  subscribeEmail,
  logEvent,
  getMetrics,
  signUp,
  signIn,
  getVerseOfTheDay,
  clearAuth,
  isAuthenticated
};

export default api;
