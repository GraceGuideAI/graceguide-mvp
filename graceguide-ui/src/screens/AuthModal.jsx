import React, { useState } from 'react';

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

/**
 * Combined Sign In / Sign Up modal.
 * Routes through the useAuth hook (signIn/signUp) so tokens land under the
 * correct localStorage keys (gg_token/gg_email).
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {(email, password) => Promise} onSignIn
 * @param {(email, password) => Promise} onSignUp
 * @param {string} reason - optional context line shown under the title
 */
export default function AuthModal({ isOpen, onClose, onSignIn, onSignUp, reason }) {
  const [mode, setMode] = useState('signup'); // default to signup to capture emails
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isSignUp = mode === 'signup';

  const reset = () => {
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await onSignUp(email.trim().toLowerCase(), password);
      } else {
        await onSignIn(email.trim().toLowerCase(), password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <XIcon className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6">
          <div className="w-14 h-14 bg-brand/10 dark:bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-7 h-7 text-brand" />
          </div>

          <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-1">
            {isSignUp ? 'Create your free account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {reason || (isSignUp
              ? 'Sign up free for unlimited questions'
              : 'Sign in to continue')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition disabled:opacity-50"
            >
              {loading
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); reset(); }}
                className="text-brand hover:underline font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
