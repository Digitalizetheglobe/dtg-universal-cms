# PayU Payment Gateway - Troubleshooting Guide

## Common Issues and Solutions

### 1. "Too many Requests" Error

**Error Message**: "Sorry, we are unable to process your payment due to Too many Requests. Please try after 60 seconds."

**Causes:**
- Multiple invalid payment requests sent in quick succession
- Rate limiting from PayU's side (usually after multiple failed attempts)
- Invalid amount format or missing required fields causing request failures

**Solutions:**

1. **Wait 60 seconds** before making another payment request
2. **Verify Amount Format**:
   - Amount must be a valid positive number
   - Minimum amount: ₹1.00
   - Format: Should be sent as a number or string with max 2 decimal places
   - Example: `100` or `100.00` for ₹100

3. **Check Required Fields**:
   - ✅ `amount`: Valid positive number (≥ ₹1)
   - ✅ `firstname`: At least 2 characters, trimmed
   - ✅ `email`: Valid email format
   - ✅ `PAYU_KEY`: Valid merchant key
   - ✅ `PAYU_SALT`: Valid salt key

4. **Verify PayU Credentials**:
   ```bash
   # Check your .env file has correct credentials
   PAYU_KEY=your_live_merchant_key
   PAYU_SALT=your_live_salt_key
   PAYU_MODE=live
   ```

5. **Check Backend Logs**:
   - Look for "PayU Order Created" logs
   - Verify amount format in logs
   - Check for any validation errors

### 2. "Invalid amount" Error

**Causes:**
- Amount is zero or negative
- Amount format is invalid (contains special characters)
- Amount is less than minimum (₹1)

**Solutions:**

1. **Ensure Amount is Valid**:
   ```javascript
   // Frontend: Ensure amount is sent as number
   amount: parseFloat(donationData.sevaAmount)
   
   // Backend: Amount is automatically formatted to 2 decimal places
   // Example: 100 → "100.00", 99.5 → "99.50"
   ```

2. **Minimum Amount Check**:
   - PayU requires minimum ₹1
   - Amounts less than ₹1 will be rejected

3. **Check Amount in Request**:
   - Use browser DevTools Network tab
   - Verify the amount sent to `/create-payu-order` endpoint

### 3. Hash Verification Failed

**Causes:**
- Incorrect hash calculation
- PayU key or salt mismatch
- Special characters in fields breaking hash string

**Solutions:**

1. **Verify Hash String Format**:
   ```
   Format: key|txnid|amount|productinfo|firstname|email|||||||||||salt
   ```

2. **Check for Special Characters**:
   - Pipe characters (|) are automatically removed from `productinfo`
   - All fields are trimmed and sanitized

3. **Verify Credentials**:
   - Ensure you're using **LIVE** credentials for production
   - Test credentials won't work with live gateway URL

### 4. Payment Gateway Not Loading

**Causes:**
- Incorrect PayU URL
- Browser blocking redirect
- Popup blocker preventing form submission

**Solutions:**

1. **Verify PayU URL**:
   - Live: `https://secure.payu.in/_payment`
   - Test: `https://test.payu.in/_payment`
   - Check `PAYU_MODE` is set correctly

2. **Browser Settings**:
   - Disable popup blocker for your domain
   - Allow redirects to secure.payu.in

3. **Check Form Submission**:
   - Verify form is created and submitted in frontend
   - Check browser console for errors

### 5. Callback Not Working

**Error**: Payment successful but not redirected back to site

**Causes:**
- Callback URLs not accessible
- BASE_URL not set correctly
- CORS issues

**Solutions:**

1. **Verify BASE_URL**:
   ```env
   BASE_URL=https://api.yourdomain.com
   # Or your actual backend URL
   ```

2. **Test Callback URLs**:
   - Success: `{BASE_URL}/api/donations/payu-success`
   - Failure: `{BASE_URL}/api/donations/payu-failure`
   - Both should be publicly accessible

3. **Check CORS Configuration**:
   - Ensure frontend domain is allowed in CORS settings
   - Verify FRONTEND_URL is set correctly

## Rate Limiting Prevention

To avoid "Too many requests" errors:

1. **Implement Request Throttling**:
   - Add a delay between payment attempts
   - Prevent multiple simultaneous payment requests

2. **Validate Before Submitting**:
   - Validate all fields on frontend before API call
   - Only submit if all validations pass

3. **Handle Errors Gracefully**:
   - Show user-friendly error messages
   - Don't auto-retry failed requests immediately
   - Wait before allowing another attempt

4. **Monitor Logs**:
   - Check backend logs for validation errors
   - Identify patterns in failed requests
   - Fix issues before they cause rate limiting

## Testing Checklist

Before going live, verify:

- [ ] PayU credentials are LIVE (not test)
- [ ] `PAYU_MODE=live` is set
- [ ] `BASE_URL` points to production backend
- [ ] `FRONTEND_URL` points to production frontend
- [ ] Amount is formatted correctly (≥ ₹1)
- [ ] All required fields are present
- [ ] Callback URLs are accessible
- [ ] Hash calculation is correct
- [ ] Test with small amount first (₹10-₹50)

## Debug Mode

To enable debug logging (TEST MODE ONLY):

```env
PAYU_MODE=test
```

This will log hash strings and calculated hashes. **Never use test mode in production**.

## Contact PayU Support

If issues persist:

1. **PayU Dashboard**: https://dashboard.payu.in/
2. **PayU Support Email**: care@payu.in
3. **PayU Documentation**: https://docs.payu.in/

## Common Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Too many requests | Wait 60 seconds, verify amount format |
| Invalid amount | Ensure amount ≥ ₹1 and is a valid number |
| Hash failed | Verify PAYU_KEY and PAYU_SALT are correct |
| Gateway not loading | Check PAYU_MODE and disable popup blocker |
| Callback not working | Verify BASE_URL and callback URLs are accessible |

