// GraceGuide State Management with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const FREE_DAILY_LIMIT = 5;

// Generate anonymous ID
const generateAnonymousId = () => {
  return 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Check if we need to reset daily questions
const shouldResetDailyQuestions = (lastReset) => {
  if (!lastReset) return true;
  const last = new Date(lastReset);
  const now = new Date();
  return last.getDate() !== now.getDate() || 
         last.getMonth() !== now.getMonth() || 
         last.getFullYear() !== now.getFullYear();
};

export const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      anonymousId: null,
      
      // Daily question limits
      dailyQuestionsUsed: 0,
      lastQuestionReset: null,
      
      // Chat sessions
      sessions: [],
      currentSessionId: null,
      messages: [],
      
      // Prayers
      favoritePrayers: [],
      
      // UI state
      isLoading: false,
      isOffline: false,
      currentRoute: 'home',
      
      // Premium modal
      showPremiumModal: false,
      
      // Initialize user
      initializeUser: () => {
        const state = get();
        if (!state.anonymousId) {
          const newId = generateAnonymousId();
          set({ anonymousId: newId });
        }
        
        // Check if we need to reset daily questions
        if (shouldResetDailyQuestions(state.lastQuestionReset)) {
          set({ 
            dailyQuestionsUsed: 0, 
            lastQuestionReset: new Date().toISOString() 
          });
        }
      },
      
      // User actions
      setUser: (user) => set({ user }),
      
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
      
      incrementDailyQuestions: () => {
        const { user, dailyQuestionsUsed } = get();
        if (!user?.isPremium) {
          set({ dailyQuestionsUsed: dailyQuestionsUsed + 1 });
        }
      },
      
      resetDailyQuestions: () => {
        set({ 
          dailyQuestionsUsed: 0, 
          lastQuestionReset: new Date().toISOString() 
        });
      },
      
      // Chat actions
      addMessage: (message) => {
        set((state) => ({ 
          messages: [...state.messages, message] 
        }));
      },
      
      clearMessages: () => set({ messages: [] }),
      
      createSession: () => {
        const sessionId = 'session_' + Date.now();
        const newSession = {
          id: sessionId,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          messages: []
        }));
        return sessionId;
      },
      
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
      
      clearSessions: () => set({ sessions: [], currentSessionId: null, messages: [] }),
      
      // Prayer actions
      toggleFavoritePrayer: (prayerId) => {
        set((state) => {
          const isFavorite = state.favoritePrayers.includes(prayerId);
          if (isFavorite) {
            return { 
              favoritePrayers: state.favoritePrayers.filter((id) => id !== prayerId) 
            };
          } else {
            return { 
              favoritePrayers: [...state.favoritePrayers, prayerId] 
            };
          }
        });
      },
      
      isFavoritePrayer: (prayerId) => {
        return get().favoritePrayers.includes(prayerId);
      },
      
      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setOffline: (isOffline) => set({ isOffline }),
      setCurrentRoute: (currentRoute) => set({ currentRoute }),
      
      // Premium modal
      setShowPremiumModal: (show) => set({ showPremiumModal: show }),
    }),
    {
      name: 'graceguide-storage',
      partialize: (state) => ({
        user: state.user,
        anonymousId: state.anonymousId,
        dailyQuestionsUsed: state.dailyQuestionsUsed,
        lastQuestionReset: state.lastQuestionReset,
        sessions: state.sessions,
        favoritePrayers: state.favoritePrayers,
      }),
    }
  )
);

// Selectors
export const selectCanAskQuestion = (state) => {
  if (!state.user) return true; // Allow anonymous users
  if (state.user.isPremium) return true;
  return state.dailyQuestionsUsed < FREE_DAILY_LIMIT;
};

export const selectRemainingQuestions = (state) => {
  if (!state.user) return FREE_DAILY_LIMIT;
  if (state.user.isPremium) return Infinity;
  return Math.max(0, FREE_DAILY_LIMIT - state.dailyQuestionsUsed);
};

export const selectIsPremium = (state) => {
  return state.user?.isPremium || false;
};
