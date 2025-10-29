# Fix: "Cannot POST /api/donations/payu-success" Error

## Critical Steps to Fix

### Step 1: RESTART YOUR BACKEND SERVER ⚠️

**This is the most important step!** The changes to routes will NOT work until you restart the server.

**If using PM2:**
```bash
cd dtg-universal-cms/CMS-BE
pm2 restart all
# or
pm2 restart server
```

**If running directly:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd dtg-universal-cms/CMS-BE
npm start
# or if using nodemon
npm run dev
```

**If on production server:**
- SSH into your server
- Find the Node.js process: `ps aux | grep node`
- Restart it using your deployment method (PM2, systemd, etc.)

### Step 2: Verify Routes Are Loaded

After restart, check server logs. You should see the server starting.

### Step 3: Test the Route Manually

Test if the POST route works:

```bash
curl -X POST https://api.harekrishnavidya.org/api/donations/payu-success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "status=success&txnid=TEST123&amount=100"
```

If you see the PayU success page HTML instead of "Cannot POST", it's working!

### Step 4: Check Server Logs

When PayU sends the callback, check your server logs for:
```
=== PayU Success Route Hit ===
Request Method: POST
```

If you DON'T see this log, the route is still not being matched.

## Common Issues

### Issue 1: Server Not Restarted
- **Symptom**: Still seeing "Cannot POST" error
- **Fix**: RESTART THE SERVER (see Step 1)

### Issue 2: Route Ordering
- **Symptom**: Route defined but not matching
- **Fix**: PayU routes are now at the top, before catch-all routes

### Issue 3: Middleware Issue
- **Symptom**: Route matches but body is empty
- **Fix**: `express.urlencoded()` is already configured in server.js

### Issue 4: Proxy/Load Balancer
- **Symptom**: Routes work locally but not in production
- **Fix**: Check if nginx/proxy is rewriting URLs or blocking POST

### Issue 5: CORS Issues
- **Symptom**: PayU can't reach your server
- **Fix**: CORS is configured, but check firewall rules

## Debugging Commands

### Check if route is registered:
```bash
# View all registered routes (if you have route debugging enabled)
# Or check server logs when starting
```

### Test locally:
```bash
# From your local machine
curl -X POST http://localhost:5000/api/donations/payu-success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "status=success&txnid=TEST123&amount=100"
```

### Check server process:
```bash
# Check if server is running
ps aux | grep node

# Check server logs
pm2 logs
# or
tail -f logs/server.log
```

## Verification Checklist

- [ ] Backend server has been restarted
- [ ] Routes file has POST routes for payu-success and payu-failure
- [ ] Server logs show routes are registered
- [ ] Test POST request works manually
- [ ] PayU callback URL is correct: `{BASE_URL}/api/donations/payu-success`
- [ ] No proxy/nginx is blocking or rewriting POST requests

## If Still Not Working

1. **Check server logs** for any route matching attempts
2. **Verify the exact URL** PayU is calling (check PayU dashboard)
3. **Test with curl** to see if the route works manually
4. **Check if there's a reverse proxy** (nginx, Apache) that might be interfering
5. **Verify BASE_URL** in your .env file matches your actual domain

## Contact Points

- PayU sends callback to: `https://api.harekrishnavidya.org/api/donations/payu-success`
- Make sure this URL is accessible from the internet
- Check firewall rules allow POST requests to this endpoint

