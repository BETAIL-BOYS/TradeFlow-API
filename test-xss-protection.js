/**
 * Test script to demonstrate XSS protection in TradeFlow API
 * 
 * This script tests both vulnerable and protected endpoints
 * 
 * To run this test:
 * 1. Install dependencies: npm install
 * 2. Start the server: npm run start:dev
 * 3. Run this test: node test-xss-protection.js
 */

const http = require('http');

// Test cases for XSS vulnerability
const testCases = [
  {
    name: 'Basic script tag',
    payload: '<script>alert("XSS")</script>',
    description: 'Simple script tag injection'
  },
  {
    name: 'IMG tag with onerror',
    payload: '<img src="x" onerror="alert(\'XSS\')">',
    description: 'IMG tag with onerror event'
  },
  {
    name: 'JavaScript protocol',
    payload: 'javascript:alert("XSS")',
    description: 'JavaScript protocol injection'
  },
  {
    name: 'SVG tag',
    payload: '<svg onload="alert(\'XSS\')">',
    description: 'SVG tag with onload event'
  },
  {
    name: 'HTML entity encoded',
    payload: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
    description: 'HTML entity encoded script'
  }
];

function makeRequest(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(null, res.statusCode, data);
    });
  });

  req.on('error', (err) => {
    callback(err, null, null);
  });

  req.end();
}

function runTests() {
  console.log('🔒 Testing XSS Protection in TradeFlow API\n');
  console.log('='.repeat(50));

  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
    console.log(`📄 Description: ${testCase.description}`);
    console.log(`🎯 Payload: ${testCase.payload}`);
    
    // Test vulnerable endpoint
    const vulnerablePath = `/api/v1/tokens/vulnerable?search=${encodeURIComponent(testCase.payload)}`;
    makeRequest(vulnerablePath, (err, statusCode, data) => {
      if (err) {
        console.log(`❌ Vulnerable endpoint failed: ${err.message}`);
        return;
      }
      
      console.log(`🔓 Vulnerable endpoint (${statusCode}):`);
      console.log(`   Response: ${data.substring(0, 100)}...`);
      
      // Check if payload is reflected without sanitization
      const isReflected = data.includes(testCase.payload);
      console.log(`   Payload reflected: ${isReflected ? '⚠️  YES (VULNERABLE)' : '✅ NO'}`);
    });

    // Test protected endpoint
    const protectedPath = `/api/v1/tokens?search=${encodeURIComponent(testCase.payload)}`;
    makeRequest(protectedPath, (err, statusCode, data) => {
      if (err) {
        console.log(`❌ Protected endpoint failed: ${err.message}`);
        return;
      }
      
      console.log(`🛡️  Protected endpoint (${statusCode}):`);
      console.log(`   Response: ${data.substring(0, 100)}...`);
      
      // Check if payload is sanitized
      const isSanitized = !data.includes('<script>') && !data.includes('javascript:');
      console.log(`   Payload sanitized: ${isSanitized ? '✅ YES' : '⚠️  NO'}`);
    });
  });

  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Summary:');
  console.log('✅ Protected endpoints should sanitize malicious input');
  console.log('⚠️  Vulnerable endpoints may reflect input directly');
  console.log('🔒 XSS middleware should prevent script execution');
}

// Instructions for manual testing
console.log('🚀 XSS Protection Test for TradeFlow API');
console.log('\n📋 Manual Testing Instructions:');
console.log('1. Start the server: npm run start:dev');
console.log('2. Open browser and test these URLs:');
console.log('');

testCases.forEach((testCase, index) => {
  const encodedPayload = encodeURIComponent(testCase.payload);
  console.log(`${index + 1}. ${testCase.name}:`);
  console.log(`   Vulnerable: http://localhost:3000/api/v1/tokens/vulnerable?search=${encodedPayload}`);
  console.log(`   Protected:  http://localhost:3000/api/v1/tokens?search=${encodedPayload}`);
  console.log('');
});

console.log('🔍 Expected Results:');
console.log('- Vulnerable endpoint: Should reflect the malicious payload');
console.log('- Protected endpoint: Should sanitize/remove dangerous characters');
console.log('- Browser console: Should NOT show any alert() executions');
console.log('\n⚠️  Note: The vulnerable endpoint is for testing purposes only!');
console.log('💡 Run: node test-xss-protection.js (after starting server)');

// Uncomment to run automated tests when Node.js is available
// runTests();
