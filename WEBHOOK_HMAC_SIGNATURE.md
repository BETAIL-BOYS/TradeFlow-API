# HMAC Signature Verification for Webhooks

## Overview

The TradeFlow API now implements HMAC-SHA256 signature verification for webhook payloads. This prevents malicious actors from spoofing webhook events and ensures data integrity.

## Security Features

- **Cryptographic Signing**: Uses HMAC-SHA256 to generate signatures
- **Constant-Time Comparison**: Prevents timing attacks that could reveal information about the correct signature
- **Header Validation**: Requires `X-Signature` header in all webhook requests
- **Payload Integrity**: Detects any tampering with the request body

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
WEBHOOK_SECRET="your_long_random_secret_key_here"
```

**Guidelines for WEBHOOK_SECRET:**
- Minimum 32 characters recommended
- Use a cryptographically random value (e.g., generated with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Store securely in your infrastructure
- Rotate periodically
- Never commit to source control

### Generate a Secure Secret

```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Implementation

### Server-Side (Webhook Receiver - Already Implemented)

The webhook endpoint automatically validates signatures:

```typescript
@Post('soroban')
@UseGuards(HmacSignatureGuard)
async handleSorobanEvent(@Body() eventData: any) {
  // Only reached if signature verification passes
  console.log('Webhook received:', eventData);
  return { status: 'success' };
}
```

**Response Codes:**
- `200 OK`: Signature valid, event processed
- `400 Bad Request`: Missing X-Signature header or empty body
- `401 Unauthorized`: Invalid or mismatched signature

### Client-Side (Webhook Sender - Indexer)

When sending webhooks to the TradeFlow API, follow this pattern:

#### Node.js / JavaScript Example

```javascript
const crypto = require('crypto');
const https = require('https');

const WEBHOOK_URL = 'https://api.tradeflow.com/api/v1/webhook/soroban';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function generateWebhookSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

function sendWebhook(eventData, jwtToken) {
  // Convert payload to JSON string for consistent hashing
  const payload = JSON.stringify(eventData);
  
  // Generate HMAC signature
  const signature = generateWebhookSignature(payload, WEBHOOK_SECRET);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Length': Buffer.byteLength(payload)
    },
  };

  const req = https.request(WEBHOOK_URL, options, (res) => {
    let data = '';
    
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log(`Webhook response [${res.statusCode}]:`, data);
    });
  });

  req.on('error', error => {
    console.error('Webhook send error:', error);
  });

  req.write(payload);
  req.end();
}

// Usage
const swapEvent = {
  eventId: 'evt_' + Date.now(),
  type: 'swap',
  contractId: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4',
  timestamp: new Date().toISOString(),
  data: {
    pool: 'POOL_ABC',
    amountIn: '1000',
    amountOut: '950',
    trader: 'GBUQWP3BOUZX34ULNQG23RQ6F4BVWCIRUVOEAK663KSCTXYXO7KKXR7H'
  }
};

sendWebhook(swapEvent, process.env.JWT_TOKEN);
```

#### Python Example

```python
import json
import hmac
import hashlib
import requests

WEBHOOK_URL = 'https://api.tradeflow.com/api/v1/webhook/soroban'
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET')
JWT_TOKEN = os.getenv('JWT_TOKEN')

def generate_signature(payload, secret):
    """Generate HMAC-SHA256 signature"""
    return hmac.new(
        secret.encode(),
        payload.encode() if isinstance(payload, str) else payload,
        hashlib.sha256
    ).hexdigest()

def send_webhook(event_data):
    """Send webhook with HMAC signature"""
    payload = json.dumps(event_data)
    signature = generate_signature(payload, WEBHOOK_SECRET)
    
    headers = {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'Authorization': f'Bearer {JWT_TOKEN}'
    }
    
    response = requests.post(WEBHOOK_URL, data=payload, headers=headers)
    print(f'Webhook response [{response.status_code}]:', response.json())
    return response

# Usage
swap_event = {
    'eventId': f'evt_{int(time.time() * 1000)}',
    'type': 'swap',
    'contractId': 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4',
    'timestamp': datetime.now().isoformat(),
    'data': {
        'pool': 'POOL_ABC',
        'amountIn': '1000',
        'amountOut': '950',
        'trader': 'GBUQWP3BOUZX34ULNQG23RQ6F4BVWCIRUVOEAK663KSCTXYXO7KKXR7H'
    }
}

send_webhook(swap_event)
```

## Critical Implementation Notes

### 1. Use Raw Request Body for Hashing

Always hash the exact raw request body as a string, not the parsed JSON object:

❌ **WRONG:**
```javascript
const payload = JSON.stringify(eventData);
const signature = crypto.createHmac('sha256', secret)
  .update(JSON.stringify(eventData)) // Different formatting could result
  .digest('hex');
```

✅ **CORRECT:**
```javascript
const payload = JSON.stringify(eventData);
const signature = crypto.createHmac('sha256', secret)
  .update(payload) // Same exact bytes every time
  .digest('hex');
```

### 2. Consistent JSON Formatting

Ensure consistent JSON formatting when serializing:

```javascript
// Use this for predictable serialization:
JSON.stringify(eventData)

// Avoid methods that might introduce formatting variations:
JSON.stringify(eventData, null, 2) // Extra whitespace
eventData.toString()                // Object method
```

### 3. Character Encoding

Both sides must use UTF-8 encoding:

```javascript
// JavaScript defaults to UTF-8
const buffer = Buffer.from(payload, 'utf8');
const signature = crypto.createHmac('sha256', secret).update(buffer).digest('hex');
```

### 4. Timing Attack Mitigation

The server uses constant-time comparison:

```typescript
// DO NOT use simple string comparison:
if (computedSig === providedSig) { } // ❌ Vulnerable to timing attacks

// Server uses constant-time comparison:
private constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i); // Bitwise comparison
  }
  return result === 0;
}
```

## Testing

### Run Webhook Tests

```bash
# Start the development server
npm run start:dev

# In another terminal, run the test suite
WEBHOOK_SECRET="your_webhook_secret_key_change_me" node test-webhook-hmac.js
```

### Manual Testing with cURL

```bash
# Generate a signature
PAYLOAD='{"eventId":"evt_123","type":"swap","data":{"amountIn":"1000"}}'
SECRET="your_webhook_secret_key_change_me"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hex -mac HMAC -macopt key:$SECRET | awk '{print $NF}')

# Send webhook
curl -X POST http://localhost:3000/api/v1/webhook/soroban \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "$PAYLOAD"
```

### Test Cases

The test suite (`test-webhook-hmac.js`) validates:

1. ✅ **Valid Signature**: Correctly signed payload is accepted
2. ❌ **Invalid Signature**: Incorrect signature is rejected with 401
3. ❌ **Missing Header**: Request without X-Signature header is rejected
4. ❌ **Tampered Payload**: Modified payload with original signature is rejected

## Common Issues

### Issue: Signature Mismatch

**Problem**: Server returns 401 even with what seems like correct signature

**Causes & Solutions:**

1. **JSON Formatting Differences**
   ```javascript
   // ❌ Wrong - Extra spaces affect hash
   JSON.stringify(data, null, 2)
   
   // ✅ Correct - Compact JSON
   JSON.stringify(data)
   ```

2. **Encoding Mismatch**
   ```javascript
   // Ensure UTF-8
   const signature = crypto.createHmac('sha256', secret)
     .update(payload, 'utf8')
     .digest('hex');
   ```

3. **Secret Mismatch**
   - Verify WEBHOOK_SECRET matches exactly on both sides
   - Check for whitespace or encoding issues

### Issue: 400 Bad Request

**Problem**: "Missing X-Signature header" or "Request body is empty"

**Solutions:**
- Always include `X-Signature` header
- Ensure request body is not empty
- Check header name case (should be lowercase: `x-signature`)

## Webhook Best Practices

1. **Idempotency**: Use `eventId` to prevent duplicate processing
   ```javascript
   const eventId = event.eventId;
   const isProcessed = await db.isEventProcessed(eventId);
   if (isProcessed) return { status: 'already_processed' };
   ```

2. **Retry Logic**: Implement exponential backoff
   ```javascript
   const retryDelays = [1000, 2000, 4000, 8000, 16000]; // ms
   for (const delay of retryDelays) {
     try {
       // Send webhook
       break;
     } catch (error) {
       await new Promise(r => setTimeout(r, delay));
     }
   }
   ```

3. **Logging**: Log all webhook events for audit trail
   ```javascript
   console.log('[WEBHOOK]', {
     eventId: event.eventId,
     timestamp: event.timestamp,
     type: event.type,
     status: 'received'
   });
   ```

4. **Monitoring**: Alert on failed webhook deliveries
   ```javascript
   if (response.statusCode !== 200) {
     console.error('[WEBHOOK_ERROR]', {
       statusCode: response.statusCode,
       body: response.body
     });
     // Send alert to monitoring service
   }
   ```

## Security Recommendations

1. **Rotate Secrets Regularly**: Update WEBHOOK_SECRET every 90 days
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate Event IDs**: Prevent replay attacks with idempotency checks
4. **Rate Limiting**: Server enforces 50 requests/minute per IP
5. **Audit Logging**: Log all webhook processing for security review

## Debugging

Enable debug logging in webhook receiver:

```typescript
// In webhook.controller.ts
async handleSorobanEvent(@Body() eventData: any) {
  console.log('Raw payload size:', JSON.stringify(eventData).length);
  console.log('Event ID:', eventData.eventId);
  console.log('Event Type:', eventData.type);
  // ... rest of handler
}
```

For sender-side debugging:

```javascript
// Generate and log signature details
const payload = JSON.stringify(eventData);
const signature = generateSignature(payload, WEBHOOK_SECRET);

console.log('[WEBHOOK_DEBUG]', {
  payloadSize: payload.length,
  payloadHash: crypto.createHash('sha256').update(payload).digest('hex'),
  signature: signature.substring(0, 16) + '...',
  timestamp: new Date().toISOString()
});
```

## References

- [OWASP HMAC](https://owasp.org/www-community/attacks/Timing_attack)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [RFC 2104 - HMAC](https://tools.ietf.org/html/rfc2104)
- [Constant-Time Comparison](https://paragonie.com/blog/2015/08/you-wouldnt-base64-pictures-server)
