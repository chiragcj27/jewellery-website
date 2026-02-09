# Admin Portal Deployment Guide

## Issue: Admin Portal Not Working on Deployment

### Root Cause
The admin portal was failing in production because it relies on the `NEXT_PUBLIC_API_URL` environment variable, which defaults to `http://localhost:4000` if not set. In deployment, this causes all API calls to fail since they're trying to connect to localhost instead of the production API.

### Solution
Set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform (Vercel, Netlify, etc.) to point to your production API URL.

## Required Environment Variables

### `NEXT_PUBLIC_API_URL` (REQUIRED)
- **Description**: The base URL of your API server
- **Local Development**: `http://localhost:4000`
- **Production**: Your deployed API URL (e.g., `https://api.yourdomain.com`)
- **Note**: Must start with `NEXT_PUBLIC_` prefix for Next.js to expose it to the browser

## Deployment Steps

### For Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your production API URL (e.g., `https://api.yourdomain.com`)
   - **Environment**: Production (and Preview if needed)
4. Redeploy your application

### For Netlify:
1. Go to Site settings → Environment variables
2. Add a new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your production API URL
   - **Scopes**: Production (and Deploy previews if needed)
3. Trigger a new deployment

### For Other Platforms:
Set the `NEXT_PUBLIC_API_URL` environment variable in your platform's environment configuration before building/deploying.

## Code Changes Made

1. **Centralized API Client**: All API calls now go through `lib/api.ts` which uses `NEXT_PUBLIC_API_URL`
2. **Removed Duplicate API URLs**: Removed hardcoded API URLs from `settings/page.tsx` and `banners/page.tsx`
3. **Added Missing API Methods**: Added `siteSettings` and `banners` methods to the centralized API client
4. **Updated Documentation**: Enhanced `.env.example` with deployment instructions

## Verification

After deployment, verify the admin portal is working by:
1. Opening the admin portal URL
2. Checking the browser console for any API errors
3. Testing a simple action like viewing categories or products
4. If you see errors about `localhost:4000`, the environment variable is not set correctly

## Troubleshooting

### Issue: Still seeing localhost:4000 in errors
- **Solution**: Ensure `NEXT_PUBLIC_API_URL` is set in your deployment platform's environment variables
- **Note**: You may need to rebuild/redeploy after adding the variable

### Issue: CORS errors
- **Solution**: Ensure your API server has CORS configured to allow requests from your admin portal domain

### Issue: API calls failing
- **Solution**: 
  1. Verify your API is deployed and accessible
  2. Check that `NEXT_PUBLIC_API_URL` matches your actual API URL
  3. Ensure there are no trailing slashes in the URL
  4. Check browser console for specific error messages
