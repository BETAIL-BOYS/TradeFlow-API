# Webhook Signature Generation - Quick Reference

## 🔐 For Webhook Senders (Indexer/Event Publisher)

### JavaScript / Node.js

```javascript
const crypto = require('crypto');
const https = require('https');

// 1. Prepare event data
const event = {
  eventId: 'evt_' + Date.now(),
  type: 'swap',
  pool: 'POOL_ABC',
  amountIn: '1000',
  amountOut: '950'
};

// 2. Convert to JSON string (CRITICAL: use consistent formatting)
const payload = JSON.stringify(event);

// 3. Generate HMAC-SHA256 signature
const webhookSecret = process.env.WEBHOOK_SECRET;
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

// 4. Send webhook with signature
const options = {
  hostname: 'api.tradeflow.com',
  port: 443,
  path: '/api/v1/webhook/soroban',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,           // ← Required header
    'Authorization': `Bearer ${process.env.JWT_TOKEN}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
});

req.write(payload);
req.end();
```

### Python

```python
import json
import hmac
import hashlib
import requests
import os
from datetime import datetime

# 1. Prepare event data
event = {
    'eventId': f'evt_{int(datetime.now().timestamp() * 1000)}',
    'type': 'swap',
    'pool': 'POOL_ABC',
    'amountIn': '1000',
    'amountOut': '950'
}

# 2. Convert to JSON string
payload = json.dumps(event)

# 3. Generate HMAC-SHA256 signature
webhook_secret = os.getenv('WEBHOOK_SECRET').encode()
signature = hmac.new(
    webhook_secret,
    payload.encode(),
    hashlib.sha256
).hexdigest()

# 4. Send webhook
headers = {
    'Content-Type': 'application/json',
    'X-Signature': signature,          # ← Required header
    'Authorization': f'Bearer {os.getenv("JWT_TOKEN")}'
}

response = requests.post(
    'https://api.tradeflow.com/api/v1/webhook/soroban',
    data=payload,
    headers=headers
)

print(f'Status: {response.status_code}')
```

### Bash / cURL

```bash
#!/bin/bash

# 1. Set event data
PAYLOAD='{"eventId":"evt_123","type":"swap","pool":"POOL_ABC"}'

# 2. Set webhook secret
WEBHOOK_SECRET="${WEBHOOK_SECRET:-your_secret_here}"

# 3. Generate HMAC-SHA256 signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hex -mac HMAC -macopt key:$WEBHOOK_SECRET | awk '{print $NF}')

# 4. Send webhook
curl -X POST https://api.tradeflow.com/api/v1/webhook/soroban \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "$PAYLOAD"
```

## 🔍 Verification Checklist

Before sending webhooks:

- [ ] **Payload**: Is it valid JSON?
  ```javascript
  JSON.parse(payload); // Should not throw
  ```

- [ ] **Formatting**: Using `JSON.stringify(data)` without extra whitespace?
  ```javascript
  // ✅ CORRECT
  const payload = JSON.stringify(data);
  
  // ❌ WRONG (adds extra spaces)
  const payload = JSON.stringify(data, null, 2);
  ```

- [ ] **Secret**: Is WEBHOOK_SECRET correctly set?
  ```bash
  echo $WEBHOOK_SECRET
  ```

- [ ] **Signature**: Is it in hex format (64 characters)?
  ```javascript
  console.log(signature.length); // Should be 64
  console.log(/^[a-f0-9]{64}$/.test(signature)); // Should be true
  ```

- [ ] **Header**: Is it exactly `X-Signature` (case-insensitive)?
  ```javascript
  // Both work due to HTTP header normalization
  'X-Signature': signature
  'x-signature': signature
  ```

## 📊 Request Structure

```
POST /api/v1/webhook/soroban HTTP/1.1
Host: api.tradeflow.com
Content-Type: application/json
X-Signature: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z... (64 chars)
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Length: 145

{"eventId":"evt_1234","type":"swap","pool":"POOL_ABC","amountIn":"1000"}
```

## ⚠️ Common Mistakes

### ❌ WRONG: Adding whitespace to JSON

```javascript
// This will fail! Signature won't match
JSON.stringify(data, null, 2)
// Results in:
// {
//   "key": "value"
// }
```

**Fix**: Use compact JSON
```javascript
// ✅ Correct
JSON.stringify(data)
// Results in:
// {"key":"value"}
```

### ❌ WRONG: Using different secret than server

```javascript
// Server has: WEBHOOK_SECRET="my-secret-key"
// Client has: webhookSecret="my-different-secret"  ← WRONG!
```

**Fix**: Ensure both use exact same secret
```bash
# Server
export WEBHOOK_SECRET="my-secret-key"

# Client
export WEBHOOK_SECRET="my-secret-key"  # ← MUST match
```

### ❌ WRONG: Modifying payload after signing

```javascript
const payload = JSON.stringify(event);
const signature = generateSignature(payload);

event.timestamp = Date.now();  // ❌ Wrong! Payload changed
sendWebhook(event, signature); // Signature won't match
```

**Fix**: Sign after finalization
```javascript
const event = {
  eventId: 'evt_123',
  timestamp: new Date().toISOString(),  // ← Include before signing
  data: { /* ... */ }
};

const payload = JSON.stringify(event);
const signature = generateSignature(payload);
sendWebhook(payload, signature);  // ✅ Correct
```

### ❌ WRONG: Incorrect hash algorithm

```javascript
// ❌ Wrong algorithm
const signature = crypto.createHash('sha256') // Missing HMAC!
  .update(payload)
  .digest('hex');
```

**Fix**: Use HMAC, not just Hash
```javascript
// ✅ Correct
const signature = crypto.createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
```

## 🧪 Test Your Implementation

### Test 1: Signature Generation

```javascript
// This should generate the same signature every time
const payload = '{"test":"data"}';
const secret = 'test_secret';

const sig1 = crypto.createHmac('sha256', secret).update(payload).digest('hex');
const sig2 = crypto.createHmac('sha256', secret).update(payload).digest('hex');

console.assert(sig1 === sig2, 'Signatures should match!');
```

### Test 2: Signature Validation

```bash
# Generate signature
PAYLOAD='{"test":"data"}'
SECRET="test_secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hex -mac HMAC -macopt key:$SECRET | awk '{print $NF}')

# Verify it's a valid hex string
echo $SIGNATURE | grep -E '^[a-f0-9]{64}$' && echo "Valid signature format"
```

### Test 3: Send to Server

```bash
# Start dev server: npm run start:dev
# Then run:

SERVICE_URL="http://localhost:3000"
ENDPOINT="/api/v1/webhook/soroban"
PAYLOAD='{"eventId":"test_evt","type":"test"}'
SECRET="your_webhook_secret_key_change_me"
JWT_TOKEN="your_jwt_token"

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hex -mac HMAC -macopt key:$SECRET | awk '{print $NF}')

curl -X POST "$SERVICE_URL$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "$PAYLOAD" \
  -v
```

Expected response: `200 OK`
```json
{
  "status": "success",
  "receivedAt": "2024-03-30T10:30:00.000Z"
}
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Generate a secure secret (do this once)
openssl rand -hex 32
# output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z...

# Add to production .env
echo "WEBHOOK_SECRET=a1b2c3d4..." >> .env.production
```

### Monitoring

Monitor these log messages:

```
✅ Success
- Status: 200
- Message: "Event processed successfully"

❌ Failures to investigate
- 401 "Invalid webhook signature" → Check secret matches
- 400 "Missing X-Signature header" → Add header
- 400 "Request body is empty" → Include JSON payload
```

### Rate Limiting

The server enforces:
- **50 requests per minute** per IP
- Rate limit headers included in response:
  ```
  X-RateLimit-Limit: 50
  X-RateLimit-Remaining: 49
  X-RateLimit-Reset: 1711875060
  ```

## 📚 Additional Resources

- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [RFC 2104 - HMAC](https://tools.ietf.org/html/rfc2104)
- [openssl dgst man page](https://www.openssl.org/docs/man1.1.1/man1/dgst.html)
- [OWASP Webhook Security](https://owasp.org/www-project-web-security-testing-guide/)

## 💬 Support

- See `WEBHOOK_HMAC_SIGNATURE.md` for detailed documentation
- See `WEBHOOK_IMPLEMENTATION_SUMMARY.md` for architecture overview
- Run `test-webhook-hmac.js` to test server implementation
