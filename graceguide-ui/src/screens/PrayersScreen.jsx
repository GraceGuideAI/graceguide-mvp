import React, { useState, useMemo } from 'react';
import { prayers, prayerCategories } from '../data/prayers';
import { useStore } from '../store/useStore';

// Icons
function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function HeartIcon({ className, filled }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function CopyIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

function ShareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684-5.042m2.684 5.042a3 3 0 00-2.684-5.042M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FilterIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

export default function PrayersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Store hooks
  const favoritePrayers = useStore((state) => state.favoritePrayers);
  const toggleFavoritePrayer = useStore((state) => state.toggleFavoritePrayer);
  const isFavoritePrayer = useStore((state) => state.isFavoritePrayer);
  
  // Filter prayers
  const filteredPrayers = useMemo(() => {
    return prayers.filter(prayer => {
      const matchesCategory = selectedCategory === 'All' || prayer.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prayer.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorites = !showFavoritesOnly || favoritePrayers.includes(prayer.id);
      return matchesCategory && matchesSearch && matchesFavorites;
    });
  }, [selectedCategory, searchQuery, showFavoritesOnly, favoritePrayers]);
  
  // Group by category
  const groupedPrayers = useMemo(() => {
    if (selectedCategory !== 'All') {
      return { [selectedCategory]: filteredPrayers };
    }
    const groups = {};
    filteredPrayers.forEach(prayer => {
      if (!groups[prayer.category]) groups[prayer.category] = [];
      groups[prayer.category].push(prayer);
    });
    return groups;
  }, [filteredPrayers, selectedCategory]);
  
  // Favorite prayers list
  const favoritePrayersList = useMemo(() => {
    return prayers.filter(prayer => favoritePrayers.includes(prayer.id));
  }, [favoritePrayers]);
  
  const handleToggleFavorite = (prayerId, e) => {
    if (e) {
      e.stopPropagation();
    }
    toggleFavoritePrayer(prayerId);
  };
  
  const copyPrayer = async (prayer) => {
    const text = `${prayer.title}\n\n${prayer.content}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const sharePrayer = async (prayer) => {
    const text = `${prayer.title}\n\n${prayer.content}\n\n— From GraceGuide`;
    
    if (navigator.share) {
      navigator.share({
        title: prayer.title,
        text: text
      });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand to-brand-light safe-top safe-left safe-right">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Prayers</h1>
              <p className="text-blue-100 text-sm">Library of Catholic prayers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="px-4 -mt-3">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prayers..."
            className="w-full pl-12 pr-10 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <XIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Favorites toggle */}
      {favoritePrayers.length > 0 && (
        <div className="mt-4 px-4">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              showFavoritesOnly
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <HeartIcon className="w-4 h-4" filled={showFavoritesOnly} />
            {showFavoritesOnly ? 'Showing Favorites' : `Favorites (${favoritePrayers.length})`}
          </button>
        </div>
      )}
      
      {/* Category tabs */}
      {!showFavoritesOnly && (
        <div className="mt-4 px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {prayerCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`touch-target whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-brand text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Favorites quick access - horizontal scroll */}
      {!showFavoritesOnly && favoritePrayers.length > 0 && (
        <div className="mt-4 px-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Your Favorites
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {favoritePrayersList.map((prayer) => (
              <button
                key={prayer.id}
                onClick={() => setSelectedPrayer(prayer)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <HeartIcon className="w-4 h-4 text-red-500" filled={true} />
                {prayer.title}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Prayers list */}
      <div className="px-4 py-4 space-y-6">
        {filteredPrayers.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {showFavoritesOnly ? 'No favorite prayers yet' : 'No prayers found'}
            </p>
            {showFavoritesOnly && (
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className="mt-3 text-brand text-sm hover:underline"
              >
                Show all prayers
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedPrayers).map(([category, prayers]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {prayers.map((prayer) => (
                  <button
                    key={prayer.id}
                    onClick={() => setSelectedPrayer(prayer)}
                    className="touch-target w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-left active:scale-95 transition-transform"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {prayer.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {prayer.description}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(prayer.id, e)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
                      >
                        <HeartIcon 
                          className="w-5 h-5"
                          filled={isFavoritePrayer(prayer.id)}
                        />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Prayer Detail Modal */}
      {selectedPrayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setSelectedPrayer(null)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg max-h-[85vh] sm:rounded-2xl rounded-t-2xl overflow-hidden animate-slideUp flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div className="flex-1 min-w-0 mr-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {selectedPrayer.category}
                </span>
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                  {selectedPrayer.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleFavoritePrayer(selectedPrayer.id)}
                  className="touch-target p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <HeartIcon 
                    className={`w-5 h-5 ${
                      isFavoritePrayer(selectedPrayer.id) 
                        ? 'text-red-500' 
                        : 'text-gray-400'
                    }`}
                    filled={isFavoritePrayer(selectedPrayer.id)}
                  />
                </button>
                <button
                  onClick={() => setSelectedPrayer(null)}
                  className="touch-target p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <XIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scroll-momentum">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {selectedPrayer.description}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed font-serif">
                  {selectedPrayer.content}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 safe-bottom">
              <div className="flex gap-3">
                <button
                  onClick={() => copyPrayer(selectedPrayer)}
                  className="touch-target flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 shadow-sm"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => sharePrayer(selectedPrayer)}
                  className="touch-target flex-1 flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-medium shadow-lg shadow-brand/30"
                >
                  <ShareIcon className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
