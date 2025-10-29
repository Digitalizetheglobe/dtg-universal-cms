# ⚠️ CRITICAL: RESTART SERVER NOW

## You MUST restart your backend server for the changes to take effect!

The "Cannot POST" error is happening because **your server is still running the old code** without POST routes.

## Step-by-Step Restart Instructions

### Option 1: If Running Locally/Directly

1. **Find the terminal/command prompt** where your server is running
2. **Press `Ctrl + C`** to stop the server
3. **Restart it:**
   ```bash
   cd dtg-universal-cms/CMS-BE
   npm start
   ```

### Option 2: If Using PM2 (Production)

```bash
cd dtg-universal-cms/CMS-BE
pm2 restart all
# OR
pm2 restart server
# OR if you know the process name
pm2 restart cms-backend
```

### Option 3: If Using systemd (Linux Production)

```bash
sudo systemctl restart your-service-name
```

### Option 4: If Using Docker

```bash
docker-compose restart
# OR
docker restart container-name
```

## Verify Server Restarted

After restarting, check your server logs. You should see:
```
Server running on port 5000
Serving static files from ...
```

### Test the Route Manually

After restart, test if the POST route works:

```bash
curl -X POST http://localhost:5000/api/donations/payu-success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "status=success&txnid=TEST123&amount=100"
```

**Expected Result:** You should see HTML with "Payment Successful" message, NOT "Cannot POST" error.

### Test on Production

If your production URL is `https://api.harekrishnavidya.org`:

```bash
curl -X POST https://api.harekrishnavidya.org/api/donations/payu-success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "status=success&txnid=TEST123&amount=100"
```

## Check Server Logs

After restart, when PayU sends a callback, you should see:

```
[Route Debug] POST /payu-success - Route matched, forwarding to handler
=== PayU Success Route Hit ===
Request Method: POST
...
```

**If you DON'T see these logs**, the server didn't restart or there's another issue.

## Still Not Working?

### Check 1: Verify Routes Are Loaded
Look at server startup logs. You should see no errors about routes.

### Check 2: Test GET Request (Should Work)
```bash
curl https://api.harekrishnavidya.org/api/donations/payu-success?status=test
```

### Check 3: Check for Reverse Proxy
If you have nginx/Apache in front:
- Nginx might be blocking POST requests
- Check nginx configuration
- Ensure proxy_pass includes the full path

### Check 4: Firewall/Network
- Ensure port is open
- Check if POST requests are allowed
- Verify no security rules blocking requests

### Check 5: Node.js Process
```bash
# Check if Node.js is running
ps aux | grep node

# Check which files are actually loaded
pm2 show server  # if using PM2
```

## Quick Diagnosis

Run this command to test if your server responds:
```bash
curl -v -X POST https://api.harekrishnavidya.org/api/donations/payu-success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=1"
```

**Look for:**
- Status code should be 200 (not 404)
- Response should contain HTML or processing, not "Cannot POST"

## Still Seeing "Cannot POST"?

1. **Double-check server restarted** - Check process ID changed
2. **Check server logs** - Look for the debug message `[Route Debug]`
3. **Verify code is deployed** - Make sure your latest code is on the server
4. **Check for caching** - Clear any caches if applicable

---

**The routes ARE correct in the code. You just need to restart the server!**

