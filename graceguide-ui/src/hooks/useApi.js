import { useState, useCallback } from 'react';

export function useQA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const askQuestion = useCallback(async (question, mode = 'both') => {
    if (!question.trim()) return null;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    // Progress simulation for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);
    
    try {
      const response = await fetch('/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), mode })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      
      return data;
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to get answer');
      return null;
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }
  }, []);
  
  return { askQuestion, loading, error, progress };
}

export function useVerseOfDay() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchVerse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/verse-of-the-day');
      if (!response.ok) throw new Error('Failed to fetch verse');
      const data = await response.json();
      setVerse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { verse, loading, error, fetchVerse };
}

export function useHistory() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('gg_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const addToHistory = useCallback((question, answer, source) => {
    const newItem = {
      id: Date.now(),
      question: question.trim(),
      answer,
      source,
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 100); // Keep last 100
      localStorage.setItem('gg_history', JSON.stringify(updated));
      return updated;
    });
    
    return newItem;
  }, []);
  
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('gg_history');
  }, []);
  
  const deleteItem = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('gg_history', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  return { history, addToHistory, clearHistory, deleteItem };
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('gg_token');
    const email = localStorage.getItem('gg_email');
    return token && email ? { email, token } : null;
  });
  
  const signIn = useCallback(async (email, password) => {
    const res = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Sign in failed');
    
    localStorage.setItem('gg_token', data.token);
    localStorage.setItem('gg_email', email);
    setUser({ email, token: data.token });
    return data;
  }, []);
  
  const signUp = useCallback(async (email, password) => {
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Sign up failed');
    
    localStorage.setItem('gg_token', data.token);
    localStorage.setItem('gg_email', email);
    setUser({ email, token: data.token });
    return data;
  }, []);
  
  const signOut = useCallback(() => {
    localStorage.removeItem('gg_token');
    localStorage.removeItem('gg_email');
    setUser(null);
  }, []);
  
  return { user, signIn, signUp, signOut };
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('gg_darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const toggle = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('gg_darkMode', JSON.stringify(newValue));
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  }, []);
  
  const set = useCallback((value) => {
    localStorage.setItem('gg_darkMode', JSON.stringify(value));
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setDarkMode(value);
  }, []);
  
  return { darkMode, toggle, set };
}
