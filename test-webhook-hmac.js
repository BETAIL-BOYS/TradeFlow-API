/**
 * test-webhook-hmac.js
 * 
 * Test suite for HMAC signature verification on webhook endpoints.
 * 
 * Run with: node test-webhook-hmac.js
 * 
 * Prerequisites:
 * - Server running on localhost:3000
 * - WEBHOOK_SECRET environment variable set
 * - ADMIN_API_KEY environment variable set for JWT
 */

const http = require('http');
const crypto = require('crypto');

// Configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your_webhook_secret_key_change_me';
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const WEBHOOK_PATH = '/api/v1/webhook/soroban';

// Sample event payload
const eventPayload = {
  eventId: 'evt_123456789',
  type: 'swap',
  contractId: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4',
  timestamp: new Date().toISOString(),
  data: {
    pool: 'POOL_ABC123',
    amountIn: '1000',
    amountOut: '950',
    trader: 'TRADER_XYZ789'
  }
};

/**
 * Generate HMAC-SHA256 signature for a payload
 * @param {string} payload - Raw request body as string
 * @param {string} secret - WEBHOOK_SECRET key
 * @returns {string} - Hex-encoded HMAC signature
 */
function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Make HTTP request with HMAC signature verification
 * @param {Object} options - Request configuration
 * @returns {Promise} - Resolves with response data
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          parsedBody: (() => {
            try {
              return JSON.parse(data);
            } catch {
              return null;
            }
          })()
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Test Case 1: Valid signature - Should succeed (200)
 */
async function testValidSignature() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Valid HMAC Signature');
  console.log('='.repeat(60));

  const payload = JSON.stringify(eventPayload);
  const signature = generateSignature(payload, WEBHOOK_SECRET);

  console.log(`✓ Generated signature: ${signature.substring(0, 16)}...`);
  console.log(`✓ Payload size: ${payload.length} bytes`);

  const requestOptions = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
      'Authorization': 'Bearer valid-jwt-token',
      'Content-Length': Buffer.byteLength(payload)
    },
    body: payload
  };

  try {
    const response = await makeRequest(requestOptions);
    console.log(`\n✓ Status: ${response.statusCode}`);
    console.log(`✓ Response: ${JSON.stringify(response.parsedBody, null, 2)}`);

    if (response.statusCode === 200) {
      console.log('\n✅ TEST PASSED: Valid signature accepted');
    } else {
      console.log('\n❌ TEST FAILED: Expected 200, got ' + response.statusCode);
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

/**
 * Test Case 2: Invalid signature - Should fail (401)
 */
async function testInvalidSignature() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Invalid HMAC Signature');
  console.log('='.repeat(60));

  const payload = JSON.stringify(eventPayload);
  const invalidSignature = 'invalid_signature_1234567890abcdef1234567890abcdef1234567890ab';

  console.log(`✓ Using invalid signature: ${invalidSignature}`);
  console.log(`✓ Payload size: ${payload.length} bytes`);

  const requestOptions = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': invalidSignature,
      'Authorization': 'Bearer valid-jwt-token',
      'Content-Length': Buffer.byteLength(payload)
    },
    body: payload
  };

  try {
    const response = await makeRequest(requestOptions);
    console.log(`\n✓ Status: ${response.statusCode}`);
    console.log(`✓ Response: ${JSON.stringify(response.parsedBody, null, 2)}`);

    if (response.statusCode === 401) {
      console.log('\n✅ TEST PASSED: Invalid signature rejected with 401');
    } else {
      console.log('\n⚠️  TEST WARNING: Expected 401, got ' + response.statusCode);
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

/**
 * Test Case 3: Missing X-Signature header - Should fail (400)
 */
async function testMissingSignatureHeader() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Missing X-Signature Header');
  console.log('='.repeat(60));

  const payload = JSON.stringify(eventPayload);

  console.log(`✓ Omitting X-Signature header in request`);
  console.log(`✓ Payload size: ${payload.length} bytes`);

  const requestOptions = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer valid-jwt-token',
      'Content-Length': Buffer.byteLength(payload)
    },
    body: payload
  };

  try {
    const response = await makeRequest(requestOptions);
    console.log(`\n✓ Status: ${response.statusCode}`);
    console.log(`✓ Response: ${JSON.stringify(response.parsedBody, null, 2)}`);

    if (response.statusCode === 400 || response.statusCode === 401) {
      console.log('\n✅ TEST PASSED: Missing header rejected with 400/401');
    } else {
      console.log('\n⚠️  TEST WARNING: Expected 400/401, got ' + response.statusCode);
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

/**
 * Test Case 4: Tampered payload - Should fail (401)
 */
async function testTamperedPayload() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Tampered Payload (Signature Mismatch)');
  console.log('='.repeat(60));

  const originalPayload = JSON.stringify(eventPayload);
  const signature = generateSignature(originalPayload, WEBHOOK_SECRET);

  // Tamper with the payload
  const tamperedEvent = { ...eventPayload, data: { ...eventPayload.data, amountOut: '500' } };
  const tamperedPayload = JSON.stringify(tamperedEvent);

  console.log(`✓ Original amount: ${eventPayload.data.amountOut}`);
  console.log(`✓ Tampered amount: ${tamperedEvent.data.amountOut}`);
  console.log(`✓ Using signature from original payload`);
  console.log(`✓ Original payload size: ${originalPayload.length} bytes`);
  console.log(`✓ Tampered payload size: ${tamperedPayload.length} bytes`);

  const requestOptions = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
      'Authorization': 'Bearer valid-jwt-token',
      'Content-Length': Buffer.byteLength(tamperedPayload)
    },
    body: tamperedPayload
  };

  try {
    const response = await makeRequest(requestOptions);
    console.log(`\n✓ Status: ${response.statusCode}`);
    console.log(`✓ Response: ${JSON.stringify(response.parsedBody, null, 2)}`);

    if (response.statusCode === 401) {
      console.log('\n✅ TEST PASSED: Tampered payload detected and rejected');
    } else {
      console.log('\n⚠️  TEST WARNING: Expected 401, got ' + response.statusCode);
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         WEBHOOK HMAC SIGNATURE VERIFICATION TESTS          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nServer: http://${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Endpoint: ${WEBHOOK_PATH}`);
  console.log(`WEBHOOK_SECRET: ${WEBHOOK_SECRET.substring(0, 10)}...`);

  await testValidSignature();
  await testInvalidSignature();
  await testMissingSignatureHeader();
  await testTamperedPayload();

  console.log('\n' + '='.repeat(60));
  console.log('Test suite completed!');
  console.log('='.repeat(60));
  console.log('\nNOTE: Tests expect the server to be running with proper JWT');
  console.log('authentication. Adjust Authorization header as needed.\n');
}

// Run tests
runAllTests().catch(console.error);
