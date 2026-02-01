# GraceGuide Mobile MVP - Deployment Guide

This guide covers deploying the GraceGuide backend with RevenueCat integration and mobile frontend.

## Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Mobile App    │──────▶│  FastAPI Backend │──────▶│    ChromaDB     │
│  (Vercel/Web)   │      │    (Render)      │      │  (Bible/CCC)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │   RevenueCat     │
                         │  (Subscriptions) │
                         └──────────────────┘
```

## Backend Deployment (Render)

### 1. Prerequisites
- Render account
- OpenAI API key
- (Optional) RevenueCat account for subscriptions
- (Optional) Mailchimp account for email marketing

### 2. Environment Variables

Set these in Render Dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings & QA |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `ADMIN_PASSWORD` | Yes | Password for metrics dashboard |
| `VERCEL_FRONTEND_URL` | No | Vercel frontend URL for CORS |
| `CORS_ORIGINS` | No | Additional allowed domains (comma-separated) |
| `REVENUECAT_WEBHOOK_SECRET` | No | Webhook secret from RevenueCat |
| `REVENUECAT_ENTITLEMENT_ID` | No | Premium entitlement ID (default: "premium") |
| `MAILCHIMP_API_KEY` | No | For email subscriptions |
| `MAILCHIMP_SERVER_PREFIX` | No | Mailchimp datacenter prefix |
| `MAILCHIMP_LIST_ID` | No | Mailchimp audience list ID |

### 3. Deployment Steps

1. **Push code to GitHub**
2. **Create new Web Service on Render:**
   - Connect your GitHub repo
   - Select "Python" environment
   - Build command: `./build.sh`
   - Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
3. **Add environment variables** in Render dashboard
4. **Deploy**

## Frontend Deployment (Vercel)

### 1. Environment Variables

Create `.env.local` in `graceguide-ui/`:

```bash
VITE_API_URL=https://your-backend.onrender.com
VITE_REVENUECAT_API_KEY=your-revenuecat-public-key
VITE_REVENUECAT_ENTITLEMENT_ID=premium
```

### 2. Deployment Steps

1. **Push code to GitHub**
2. **Import project in Vercel:**
   - Root directory: `graceguide-ui`
   - Framework preset: Vite
3. **Add environment variables**
4. **Deploy**
5. **Copy Vercel URL** and add to backend's `VERCEL_FRONTEND_URL` env var

## RevenueCat Setup

### 1. Configure RevenueCat Project

1. Create project at [RevenueCat Dashboard](https://app.revenuecat.com)
2. Add your app (Web platform)
3. Configure products/entitlements:
   - Create entitlement: `premium`
   - Add products: monthly, annual subscriptions

### 2. Set Up Webhooks

1. Go to Project Settings > Webhooks
2. Add webhook URL: `https://your-backend.onrender.com/webhooks/revenuecat`
3. Copy webhook secret to `REVENUECAT_WEBHOOK_SECRET`
4. Select events:
   - ✅ INITIAL_PURCHASE
   - ✅ RENEWAL
   - ✅ CANCELLATION
   - ✅ EXPIRATION
   - ✅ REFUND

### 3. Frontend Integration

The `useRevenueCat` hook handles:
- SDK initialization
- Purchase flow
- Subscription status checking
- Premium feature gates

```javascript
import { usePremiumFeatures } from './hooks/useRevenueCat.js';

function MyComponent() {
  const { 
    isPremium, 
    canAskUnlimited, 
    shouldShowAds,
    purchasePackage,
    availablePackages 
  } = usePremiumFeatures();
  
  // Use premium features...
}
```

## API Endpoints

### Core Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/qa` | POST | Optional | Ask a question |
| `/subscribe` | POST | No | Email signup |
| `/log_event` | POST | No | Analytics events |
| `/verse-of-the-day` | GET | No | Daily verse |
| `/auth/signup` | POST | No | Create account |
| `/auth/signin` | POST | No | Login |

### Admin Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/metrics` | GET | Basic Auth | Usage metrics |

### Webhook Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/webhooks/revenuecat` | POST | Signature | RevenueCat events |

### Health Check

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Service health |

## Premium Features

### Question Limits
- **Free users:** 5 questions per day
- **Premium users:** Unlimited questions

### Ads
- **Free users:** Ads shown
- **Premium users:** No ads

### Implementation

```javascript
// Check if user can ask more questions
const { hasReachedQuestionLimit, isPremium } = usePremiumFeatures();
const questionsToday = 3; // Track in your state

if (hasReachedQuestionLimit(questionsToday)) {
  // Show upgrade prompt
}
```

## Testing

### Test RevenueCat Integration

1. Use RevenueCat sandbox API key in development
2. Test purchase flow with test cards
3. Verify webhook delivery in RevenueCat dashboard

### Test CORS

```bash
curl -H "Origin: https://your-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -I https://your-backend.onrender.com/qa
```

## Troubleshooting

### CORS Errors
- Check `VERCEL_FRONTEND_URL` is set correctly
- Verify no trailing slashes
- Add additional domains to `CORS_ORIGINS` if needed

### RevenueCat Webhook Failures
- Verify `REVENUECAT_WEBHOOK_SECRET` matches RevenueCat dashboard
- Check webhook URL is publicly accessible
- Review Render logs for error messages

### ChromaDB Issues
- Ensure `veritas_ai_chroma_db` directory exists
- Re-run `build_db.py` if database is corrupted

## Security Checklist

- [ ] Change default `JWT_SECRET` in production
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Enable RevenueCat webhook signature verification
- [ ] Use HTTPS for all endpoints
- [ ] Store API keys in environment variables only
- [ ] Review CORS origins before deploying

## Migration Notes

When migrating from web-only to mobile:
1. Existing ChromaDB data is preserved
2. User accounts are compatible
3. Email subscribers remain in CSV/Mailchimp
4. Add RevenueCat for subscription management
5. Deploy mobile frontend to Vercel
