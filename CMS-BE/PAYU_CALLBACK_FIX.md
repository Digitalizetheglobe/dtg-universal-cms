# PayU Callback URL Fix - Cannot POST Error

## Issue
After payment completion, PayU sends a POST request to the callback URL but the server was returning:
```
Cannot POST /api/donations/payu-success
```

## Root Cause
The PayU success and failure routes were only configured as GET routes:
```javascript
router.get('/payu-success', payuSuccess);
router.get('/payu-failure', payuFailure);
```

But PayU actually sends **POST requests** to these callback URLs after payment completion.

## Solution Applied

### 1. Added POST Routes
Both GET and POST routes are now supported:
```javascript
// PayU sends POST requests to success/failure URLs, but also support GET for testing
router.post('/payu-success', payuSuccess);
router.get('/payu-success', payuSuccess);
router.post('/payu-failure', payuFailure);
router.get('/payu-failure', payuFailure);
```

### 2. Updated Controllers to Handle Both Methods
The controller functions now check the request method and read from the appropriate source:
```javascript
// PayU sends POST data, but also check query params for GET requests (testing/debugging)
const params = req.method === 'POST' ? req.body : req.query;
```

### 3. Added Request Body Parsing
The server already has `express.urlencoded()` middleware configured to parse POST form data from PayU.

### 4. Added Validation and Logging
- Added validation for required fields
- Added logging to debug what PayU sends
- Better error messages for missing data

## How PayU Callback Works

1. **User completes payment** on PayU gateway
2. **PayU sends POST request** to success URL: `{BASE_URL}/api/donations/payu-success`
3. **Backend receives POST data** with payment details:
   - `mihpayid`: Payment ID
   - `status`: Payment status
   - `txnid`: Transaction ID
   - `amount`: Amount paid
   - `hash`: Hash for verification
   - Other fields: `firstname`, `email`, `phone`, `productinfo`

4. **Backend verifies hash** to ensure data is authentic
5. **Backend saves donation** to database
6. **Backend redirects user** back to frontend with success message

## Testing

To test the callback URL manually:

### POST Request (How PayU sends it):
```bash
curl -X POST https://api.harekrishnavidya.org/api/donations/payu-success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "mihpayid=123456&status=success&txnid=TXN_123&amount=100&..."
```

### GET Request (For testing/debugging):
```bash
curl "https://api.harekrishnavidya.org/api/donations/payu-success?status=success&txnid=TXN_123&..."
```

## Verification

After deployment, check:

1. **Server logs** should show:
   ```
   PayU Success Callback Received: {
     method: 'POST',
     hasBody: true,
     ...
   }
   ```

2. **Backend should respond** with HTML redirect page instead of "Cannot POST" error

3. **Donation should be saved** in database with payment details

4. **User should be redirected** to frontend donation page with success message

## Important Notes

- PayU always sends POST requests with form-encoded data
- The `express.urlencoded()` middleware must be configured (already present in server.js)
- Both GET and POST routes are available for flexibility
- Hash verification is critical - always verify the hash PayU sends

## Files Modified

1. `routes/donationRoutes.js` - Added POST routes for success/failure
2. `controllers/donationController.js` - Updated to handle both GET and POST methods

## Next Steps

1. **Restart backend server** to load the new routes
2. **Test a payment** and verify callback works
3. **Check server logs** for any errors
4. **Verify donation** is saved in database after payment

