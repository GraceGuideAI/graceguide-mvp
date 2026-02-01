# GraceGuide Mobile MVP

A mobile-first React PWA for Catholic Q&A powered by Scripture and the Catechism.

## Features

- **7 Screens:** Home, Ask, Answer, History, Prayers, Profile, Premium
- **Mobile-first design:** 375px base, 44px touch targets
- **PWA Support:** Offline capable with service worker
- **Dark Mode:** Full dark mode support
- **Bottom Tab Navigation:** Native app feel
- **Safe Area Support:** Works on notched devices

## Screens

1. **Home** - Daily verse, quick ask shortcuts, recent history
2. **Ask** - Question input with source toggle (Bible/Catechism/Both)
3. **Answer** - Citation cards with Scripture/Catechism refs, share button
4. **History** - Past Q&A with search and delete functionality
5. **Prayers** - Library of 20+ Catholic prayers with categories
6. **Profile** - User settings, subscription status, preferences
7. **Premium** - Paywall screen with subscription plans

## Technical Stack

- React 18
- Vite 6
- Tailwind CSS (via CDN)
- Custom React hooks for API integration
- LocalStorage for persistence

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## PWA Features

- Web App Manifest
- Service Worker for offline support
- Add to Home Screen support
- Push notification ready

## API Endpoints

- `POST /qa` - Ask a question
- `GET /verse-of-the-day` - Get daily verse
- `POST /auth/signin` - Sign in
- `POST /auth/signup` - Sign up
- `POST /subscribe` - Subscribe to premium

## File Structure

```
src/
  App.jsx              # Main app with tab navigation
  main.jsx             # Entry point
  hooks/
    useApi.js          # Custom hooks (useQA, useHistory, etc.)
  screens/
    HomeScreen.jsx     # Home screen
    AskScreen.jsx      # Ask question screen
    AnswerScreen.jsx   # Answer display screen
    HistoryScreen.jsx  # History screen
    PrayersScreen.jsx  # Prayers library screen
    ProfileScreen.jsx  # User profile screen
    PremiumScreen.jsx  # Paywall screen
  data/
    prayers.js         # Prayer library data
public/
  manifest.json        # PWA manifest
  sw.js                # Service worker
```

## Mobile Optimizations

- Touch targets minimum 44px
- Safe area insets for notched devices
- Momentum scrolling
- No text size adjustment on orientation change
- Active states for touch feedback
- Viewport-fit=cover for edge-to-edge display
