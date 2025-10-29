# PayU Payment Gateway - Live Setup Guide

This guide explains how to configure PayU payment gateway for **production/live** environment.

## Environment Variables Required

Add the following environment variables to your `.env` file in the CMS-BE directory:

```env
# PayU Configuration
PAYU_KEY=your_live_payu_merchant_key
PAYU_SALT=your_live_payu_salt_key
PAYU_MODE=live

# Backend Base URL (for callback URLs)
BASE_URL=https://your-backend-domain.com

# Frontend URL (for redirects after payment)
FRONTEND_URL=https://your-frontend-domain.com
```

## Important Notes

### 1. PayU Credentials
- **PAYU_KEY**: Your live PayU merchant key (NOT the test key)
- **PAYU_SALT**: Your live PayU salt key (NOT the test salt)
- Get these from your PayU merchant dashboard: https://dashboard.payu.in/

### 2. PayU Mode
- Set `PAYU_MODE=live` for production (defaults to 'live' if not specified)
- Set `PAYU_MODE=test` only for testing with test credentials
- When `PAYU_MODE=live`, the gateway URL will be: `https://secure.payu.in/_payment`
- When `PAYU_MODE=test`, the gateway URL will be: `https://test.payu.in/_payment`

### 3. Base URL (Backend)
- **BASE_URL**: This is your backend server URL (where your API is hosted)
- This is used to construct callback URLs:
  - Success URL: `{BASE_URL}/api/donations/payu-success`
  - Failure URL: `{BASE_URL}/api/donations/payu-failure`
- Example: `https://api.harekrishnavidya.org` or `https://harekrishnavidya.org`

### 4. Frontend URL
- **FRONTEND_URL**: This is your frontend website URL (Next.js app)
- Used to redirect users back to the donation page after payment
- Example: `https://harekrishnavidya.org` or `https://www.harekrishnavidya.org`

## Example .env Configuration

```env
# Database
MONGO_URI=mongodb://your-mongo-connection-string

# Server
PORT=5000
NODE_ENV=production
BASE_URL=https://api.harekrishnavidya.org

# Frontend
FRONTEND_URL=https://harekrishnavidya.org

# PayU Live Configuration
PAYU_KEY=your_live_merchant_key_here
PAYU_SALT=your_live_salt_key_here
PAYU_MODE=live

# Razorpay (if using)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Other configurations...
```

## Verification Steps

1. **Verify PayU Credentials**:
   - Ensure you're using LIVE merchant key and salt (not test credentials)
   - Test credentials start with different prefixes - verify in PayU dashboard

2. **Verify Callback URLs**:
   - Success URL must be accessible: `{BASE_URL}/api/donations/payu-success`
   - Failure URL must be accessible: `{BASE_URL}/api/donations/payu-failure`
   - These URLs should be publicly accessible (not blocked by firewall)

3. **Verify Frontend URL**:
   - Test that the frontend donation page loads: `{FRONTEND_URL}/donate`

4. **Test Payment Flow**:
   - Make a small test donation
   - Complete payment on PayU gateway
   - Verify redirect to frontend works
   - Check donation is saved in database

## PayU Gateway URLs

- **Live/Production**: `https://secure.payu.in/_payment`
- **Test**: `https://test.payu.in/_payment`

## Security Considerations

1. **Never commit `.env` file** to version control
2. **Use HTTPS** for both BASE_URL and FRONTEND_URL in production
3. **Verify hash calculations** are working correctly (PayU uses SHA-512)
4. **Monitor logs** for failed payment verifications

## Troubleshooting

### Payment Gateway Not Loading
- Check if `PAYU_MODE=live` (should be 'live' for production)
- Verify PayU credentials are correct and active
- Check browser console for errors

### Callback Not Working
- Verify BASE_URL is correct and accessible
- Check if `/api/donations/payu-success` route is accessible
- Ensure CORS is properly configured for your frontend domain

### Redirect Not Working
- Verify FRONTEND_URL is correct
- Check if frontend donation page exists at `/donate`
- Test the URL manually in browser

## Support

If you encounter issues, check:
1. PayU Merchant Dashboard: https://dashboard.payu.in/
2. PayU Documentation: https://docs.payu.in/
3. Server logs for error messages

