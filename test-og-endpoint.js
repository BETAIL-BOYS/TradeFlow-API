// Test file for OG endpoint validation
// This file can be used to test the endpoint once the server is running

const axios = require('axios');

async function testOgEndpoint() {
  try {
    console.log('Testing OG endpoint...');
    
    // Test with a sample pool ID
    const poolId = 'pool1';
    const response = await axios.get(`http://localhost:3000/api/v1/og/pool/${poolId}`, {
      responseType: 'text'
    });
    
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Cache-Control:', response.headers['cache-control']);
    
    // Check if response starts with SVG
    if (response.data.startsWith('<?xml')) {
      console.log('✅ SVG generated successfully');
      console.log('SVG length:', response.data.length, 'characters');
    } else {
      console.log('❌ Invalid response format');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Test with different pool IDs
async function testMultiplePools() {
  const poolIds = ['pool1', 'pool2', 'nonexistent'];
  
  for (const poolId of poolIds) {
    console.log(`\n--- Testing pool: ${poolId} ---`);
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/og/pool/${poolId}`, {
        responseType: 'text'
      });
      console.log(`✅ Pool ${poolId}: Success`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`✅ Pool ${poolId}: Correctly returns 404`);
      } else {
        console.log(`❌ Pool ${poolId}: Unexpected error`);
      }
    }
  }
}

module.exports = { testOgEndpoint, testMultiplePools };

// Usage instructions:
// 1. Start the server: npm run start:dev
// 2. Run tests: node test-og-endpoint.js
