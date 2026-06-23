import React, { useState } from 'react';
import { useAuth, useDarkMode } from '../hooks/useApi';

// Icons
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

function LogOutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function FileTextIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function HelpCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function ProfileScreen({ onNavigate, onSignIn, onSignOut }) {
  const { user } = useAuth();
  const { darkMode, toggle } = useDarkMode();
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('gg_notifications') || 'true');
  });
  const [dailyVerse, setDailyVerse] = useState(() => {
    return JSON.parse(localStorage.getItem('gg_daily_verse') || 'true');
  });

  const toggleSetting = (key, value, setter) => {
    setter(!value);
    localStorage.setItem(`gg_${key}`, JSON.stringify(!value));
  };

  const menuItems = [
    {
      icon: ShieldIcon,
      label: 'Privacy Policy',
      action: () => window.open('/privacy', '_blank')
    },
    {
      icon: FileTextIcon,
      label: 'Terms of Service',
      action: () => window.open('/terms', '_blank')
    },
    {
      icon: HelpCircleIcon,
      label: 'Help & Support',
      action: () => window.open('mailto:support@graceguide.app', '_blank')
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand to-brand-light safe-top safe-left safe-right">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-blue-100 text-sm">Manage your account and preferences</p>
        </div>
      </div>
      
      {/* User card */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand/10 dark:bg-brand/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-brand" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {user ? user.email : 'Guest'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? 'Signed in · unlimited questions' : 'Not signed in'}
              </p>
            </div>
          </div>

          {!user && (
            <button
              onClick={onSignIn}
              className="touch-target w-full mt-4 bg-brand text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand/30"
            >
              Sign in or create account
            </button>
          )}
        </div>
      </div>
      
      {/* Settings */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
          Settings
        </h3>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Dark mode */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <MoonIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">Dark Mode</span>
            </div>
            <button
              onClick={toggle}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                darkMode ? 'bg-brand' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">Notifications</span>
            </div>
            <button
              onClick={() => toggleSetting('notifications', notifications, setNotifications)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                notifications ? 'bg-brand' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Daily verse */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <MailIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <span className="font-medium text-gray-800 dark:text-white block">Daily Verse</span>
                <span className="text-xs text-gray-500">Show on home screen</span>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('daily_verse', dailyVerse, setDailyVerse)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                dailyVerse ? 'bg-brand' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  dailyVerse ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu items */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
          More
        </h3>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`touch-target w-full flex items-center justify-between p-4 ${
                idx !== menuItems.length - 1 ? 'border-b dark:border-gray-700' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.highlight 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <item.icon className={`w-5 h-5 ${item.color || 'text-gray-600'}`} />
                </div>
                <span className={`font-medium ${
                  item.highlight ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className={`text-sm ${
                    item.highlight ? 'text-yellow-500 font-medium' : 'text-gray-400'
                  }`}>
                    {item.value}
                  </span>
                )}
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Sign out */}
      {user && (
        <div className="px-4 mt-6">
          <button
            onClick={onSignOut}
            className="touch-target w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 font-medium"
          >
            <LogOutIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}
      
      {/* App info */}
      <div className="px-4 mt-8 text-center">
        <p className="text-xs text-gray-400">GraceGuide v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">© 2025 GraceGuide. All rights reserved.</p>
      </div>
    </div>
  );
}
