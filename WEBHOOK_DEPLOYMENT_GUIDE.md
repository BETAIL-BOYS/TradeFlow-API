# HMAC Webhook Security - Deployment Guide

## 🎯 Overview

This guide walks through deploying the HMAC signature verification for webhook payloads (Issue #172) to production.

## 📋 Pre-Deployment Checklist

### Environment Setup

- [ ] **Generate WEBHOOK_SECRET**
  ```bash
  # Generate a cryptographically secure 32-byte secret
  openssl rand -hex 32
  
  # Output example:
  # a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z...
  ```

- [ ] **Store in .env**
  ```bash
  export WEBHOOK_SECRET="your_generated_secret_here"
  ```

- [ ] **Backup existing database** (safety first)
  ```bash
  pg_dump tradeflow > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

### Code Validation

- [ ] **Run TypeScript compiler**
  ```bash
  npm run build
  # No errors should appear
  ```

- [ ] **Run local tests**
  ```bash
  # Terminal 1: Start dev server
  npm run start:dev
  
  # Terminal 2: Run webhook tests
  WEBHOOK_SECRET="test_key_32chars_long_or_longer" node test-webhook-hmac.js
  
  # Expected output: 4 tests passing
  ```

- [ ] **Verify environment validation**
  ```bash
  # Test 1: Server starts with WEBHOOK_SECRET
  WEBHOOK_SECRET="test_key" npm run start:dev
  # Should start successfully
  
  # Test 2: Server fails without WEBHOOK_SECRET
  unset WEBHOOK_SECRET && npm run start:dev
  # Should fail with: "CRITICAL: Missing required environment variable: WEBHOOK_SECRET"
  ```

- [ ] **Check Swagger documentation**
  ```bash
  # Open http://localhost:3000/api
  # Find POST /api/v1/webhook/soroban
  # Verify X-Signature header is shown as required
  ```

## 🚀 Deployment Process

### Step 1: Update Production .env

```bash
# SSH into production server
ssh deploy@api.tradeflow.com

# Edit .env file
nano .env

# Add the WEBHOOK_SECRET (generated above)
# WEBHOOK_SECRET=your_generated_secret_here

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 2: Pull New Code

```bash
cd /app/tradeflow-api

# Fetch latest changes
git fetch origin

# Checkout new version
git checkout origin/main

# Or cherry-pick if not merging full main
git cherry-pick <commit-hash>
```

### Step 3: Install Dependencies (if needed)

```bash
npm ci --production
# or
npm install
```

### Step 4: Build TypeScript

```bash
npm run build

# Check for errors
# Should complete with: "✓ Built successfully"
```

### Step 5: Run Database Migrations (if any)

```bash
# Check for pending migrations
npm run db:status

# If needed:
npm run db:migrate
```

### Step 6: Restart API Service

```bash
# Using systemd
sudo systemctl restart tradeflow-api

# Or using PM2
pm2 restart tradeflow-api

# Or manually if running in foreground
# Ctrl+C to stop current process
npm run start:prod
```

### Step 7: Verify Deployment

```bash
# Check API is running
curl -s http://localhost:3000/health | jq .

# Check logs for errors
tail -f logs/api.log

# Look for:
# ✓ "Application is running on: http://localhost:3000"
# ✓ No "WEBHOOK_SECRET" errors
```

## 🔄 Indexer Service Update

### For the Event Indexer/Publisher

The indexer service must be updated to send signed webhooks:

```javascript
// services/eventIndexer.js (example)

const crypto = require('crypto');
const https = require('https');

async function sendWebhookEvent(event) {
  // 1. Serialize event to JSON
  const payload = JSON.stringify(event);
  
  // 2. Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  // 3. Send to API with signature
  const options = {
    hostname: process.env.API_HOST,
    port: 443,
    path: '/api/v1/webhook/soroban',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Authorization': `Bearer ${process.env.JWT_TOKEN}`,
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Webhook failed: ${res.statusCode} ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
```

## 🔐 Secret Management

### Secure Secret Distribution

```bash
# Option 1: Environment Variables (Recommended for containerized apps)
export WEBHOOK_SECRET="secret_value"

# Option 2: .env file (Recommended for development)
echo "WEBHOOK_SECRET=secret_value" >> .env
chmod 600 .env

# Option 3: Secrets Manager (Recommended for production)
# AWS Secrets Manager
aws secretsmanager create-secret --name tradeflow/webhook_secret --secret-string "secret_value"

# Kubernetes Secrets
kubectl create secret generic webhook-secret --from-literal=WEBHOOK_SECRET=secret_value

# Vault
vault kv put secret/tradeflow/webhook WEBHOOK_SECRET="secret_value"
```

### Access Control

```bash
# Limit .env file access
chmod 600 /path/to/.env
chown app:app /path/to/.env

# Never commit secrets to git
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

## 📊 Monitoring Post-Deployment

### Webhook Success Metrics

```javascript
// Key metrics to monitor
- webhooks_total: Total webhook requests received
- webhooks_signatures_valid: Valid signatures
- webhooks_signatures_invalid: Invalid signatures (401)
- webhooks_missing_headers: Missing X-Signature header (400)
- webhooks_processing_time: Time to process webhook
```

### Log Monitoring

Watch for these log patterns:

```
✅ Success:
LOG: [WEBHOOK] Signature verified for event_id=evt_123
LOG: [WEBHOOK] Processing swap event from pool POOL_ABC

❌ Failures:
ERROR: [WEBHOOK] Invalid webhook signature - signature mismatch
ERROR: [WEBHOOK] Missing X-Signature header - request rejected
ERROR: [WEBHOOK] Request body is empty
```

### Alerting Rules

Configure alerts for:

```
1. Spike in 401 responses (possible attacker)
   Alert: More than 10 invalid signatures per minute

2. Spike in 400 responses (possible configuration issue)
   Alert: Missing header errors from specific IP

3. API startup failures (misconfiguration)
   Alert: Cannot start without WEBHOOK_SECRET

4. Webhook processing slowdown
   Alert: Average webhook response time > 1000ms
```

## 🔄 Rollback Procedure

In case of issues:

```bash
# Option 1: Revert to previous commit
git revert <commit-hash>
npm run build
sudo systemctl restart tradeflow-api

# Option 2: Restore from backup
# Stop the API
sudo systemctl stop tradeflow-api

# Restore database backup
psql tradeflow < backup_20240330_120000.sql

# Restore previous code
git checkout <previous-commit>
npm run build

# Restart API
sudo systemctl start tradeflow-api

# Option 3: Temporarily disable webhook verification (emergency only)
# Unset WEBHOOK_SECRET to trigger API failure (forces manual fix)
# OR comment out @UseGuards decorator and redeploy
```

## ✅ Post-Deployment Verification

### Immediate (First 5 minutes)

- [ ] API is running: `curl http://localhost:3000/health`
- [ ] No startup errors about WEBHOOK_SECRET
- [ ] Swagger docs accessible: http://localhost:3000/api
- [ ] X-Signature header visible in webhook endpoint docs

### Short-term (First hour)

- [ ] Test webhook with valid signature succeeds (200)
  ```bash
  PAYLOAD='{"test":"data"}'
  SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hex -mac HMAC -macopt key:$WEBHOOK_SECRET | awk '{print $NF}')
  curl -X POST http://localhost:3000/api/v1/webhook/soroban \
    -H "X-Signature: $SIG" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "$PAYLOAD"
  ```

- [ ] Test webhook with invalid signature fails (401)
  ```bash
  curl -X POST http://localhost:3000/api/v1/webhook/soroban \
    -H "X-Signature: invalid_signature_1234567890abcdef" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d '{"test":"data"}'
  # Should return 401 Unauthorized
  ```

- [ ] No unusual error logs in API logs

### Medium-term (First day)

- [ ] Indexer successfully sends signed webhooks
- [ ] Webhook events are processed correctly
- [ ] Monitor for any signature mismatch errors
- [ ] Database shows incoming events

### Long-term (Ongoing)

- [ ] Monitor webhook success ratio (should be >99.9%)
- [ ] Alert on signature failures
- [ ] Document secret rotation procedure
- [ ] Schedule regular security audits

## 📞 Troubleshooting

### Issue: "401 Invalid webhook signature"

**Solution 1: Verify WEBHOOK_SECRET matches**
```bash
# Server secret
echo $WEBHOOK_SECRET

# Indexer secret (must be identical)
# Check indexer environment or configuration
```

**Solution 2: Check JSON formatting**
```bash
# Both sides must use compact JSON (no whitespace)
# ✓ Correct: JSON.stringify(data)
# ✗ Wrong: JSON.stringify(data, null, 2)
```

**Solution 3: Verify signature algorithm**
```bash
# Must use HMAC-SHA256
# ✓ Correct: crypto.createHmac('sha256', secret)
# ✗ Wrong: crypto.createHash('sha256') // Missing HMAC
```

### Issue: "400 Missing X-Signature header"

**Solution:** Add X-Signature header to request
```bash
# With cURL
curl -H "X-Signature: your_signature" ...

# With Node.js
headers: {
  'X-Signature': signature,  // ← Add this
  'Authorization': jwtToken
}
```

### Issue: API won't start - "Missing required environment variable: WEBHOOK_SECRET"

**Solution:** Set WEBHOOK_SECRET before starting
```bash
export WEBHOOK_SECRET="your_secret_value"
npm run start:prod
```

### Issue: Signature mismatches for valid webhooks

**Solution:** Ensure consistent JSON serialization
```bash
# Debug: Log signature details
console.log('Payload:', payload);
console.log('Payload length:', payload.length);
console.log('Signature:', signature);

# Compare with server debug logs
# Webhook handler can log received raw body for comparison
```

## 📚 Documentation References

- [WEBHOOK_HMAC_SIGNATURE.md](./WEBHOOK_HMAC_SIGNATURE.md) - Complete technical documentation
- [WEBHOOK_SIGNATURE_QUICK_REFERENCE.md](./WEBHOOK_SIGNATURE_QUICK_REFERENCE.md) - Quick reference for developers
- [WEBHOOK_IMPLEMENTATION_SUMMARY.md](./WEBHOOK_IMPLEMENTATION_SUMMARY.md) - Architecture overview
- [WEBHOOK_VERIFICATION_CHECKLIST.md](./WEBHOOK_VERIFICATION_CHECKLIST.md) - Implementation verification

## 🎉 Deployment Complete

After following this guide, your webhook endpoint is now secured with HMAC-SHA256 signature verification. All webhook requests must include a valid X-Signature header, preventing unauthorized payload spoofing.

### Key Takeaways

✅ WEBHOOK_SECRET is required (API won't start without it)  
✅ X-Signature header must be present on all webhooks  
✅ Signature is HMAC-SHA256 of the raw JSON body  
✅ Invalid signatures return 401 instantly  
✅ Constant-time comparison prevents timing attacks  

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Review WEBHOOK_HMAC_SIGNATURE.md for detailed documentation
3. Run test-webhook-hmac.js to verify setup
4. Check API logs for specific error messages
