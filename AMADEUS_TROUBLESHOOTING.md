# Amadeus API Troubleshooting Guide

## Current Issue: Server Error 38189

All Amadeus API calls are returning error code **38189** with message "An unknown error happened, please contact your administrator". This indicates an issue with the API credentials or Amadeus service.

## Steps to Fix

### 1. Verify Your Amadeus Credentials

1. Go to [Amadeus Developer Portal](https://developers.amadeus.com/my-apps)
2. Log in to your account
3. Navigate to **My Applications**
4. Check your application status:
   - ✅ **Active** - Application is working
   - ❌ **Suspended/Inactive** - You need to reactivate or create a new app

### 2. Check Credential Environment (Test vs Production)

Your current credentials are being used with the **test** environment. Verify:

1. In the Amadeus dashboard, check which environment your credentials belong to
2. Test credentials have limited functionality and rate limits
3. Make sure you're using credentials from the **Self-Service Test** environment

### 3. Regenerate API Credentials

If credentials are expired or invalid:

1. In your Amadeus application dashboard, click on your app
2. Find the **API Key** section
3. Click **Create new API Key** or **Regenerate**
4. Copy the new `Client ID` and `Client Secret`
5. Update your `.env` file:

```bash
AMADEUS_CLIENT_ID=your_new_client_id_here
AMADEUS_CLIENT_SECRET=your_new_client_secret_here
AMADEUS_HOSTNAME=test
```

6. Restart your development server:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 4. Test the Credentials

Run the debug script to verify:

```bash
node debug-amadeus.js
```

Expected output for working credentials:
```
✅ Success with 'CITY,AIRPORT'
Data: { ... location data ... }
```

### 5. Update Production Environment

If you're deploying to production (Vercel):

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Update:
   - `AMADEUS_CLIENT_ID`
   - `AMADEUS_CLIENT_SECRET`
   - `AMADEUS_HOSTNAME=test` (or `production` if using production credentials)
4. Redeploy your application

## Common Issues

### Issue: "Server Error" or "Internal Error"
**Cause**: Invalid or expired credentials
**Solution**: Regenerate credentials in Amadeus dashboard

### Issue: Rate Limit Exceeded
**Cause**: Too many API requests in test environment
**Solution**: Wait for rate limit reset or upgrade to production

### Issue: "Authentication failed"
**Cause**: Wrong credentials in .env file
**Solution**: Double-check credentials match exactly from dashboard

## Environment Configuration

The SDK is configured in `lib/amadeus.ts`:

```typescript
const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    hostname: (process.env.AMADEUS_HOSTNAME || 'test') as 'test' | 'production',
});
```

## API Documentation

- [Amadeus for Developers](https://developers.amadeus.com/)
- [API Reference](https://developers.amadeus.com/self-service)
- [Node SDK Documentation](https://github.com/amadeus4dev/amadeus-node)

## Next Steps

1. ⚠️ **PRIORITY**: Log in to Amadeus dashboard and verify your app status
2. Check if credentials need to be regenerated
3. Update `.env` file with valid credentials
4. Test using `node debug-amadeus.js`
5. Restart the development server

---

**Need Help?**
- [Amadeus Support](https://developers.amadeus.com/support)
- [Stack Overflow - Amadeus Tag](https://stackoverflow.com/questions/tagged/amadeus)
