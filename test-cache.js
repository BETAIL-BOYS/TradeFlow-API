const axios = require('axios');

// Test the token endpoint caching
async function testTokenCache() {
  const baseURL = 'http://localhost:3000';
  
  console.log('Testing Token Cache Implementation...\n');
  
  try {
    // First request - should fetch from database/cache miss
    console.log('1. First request (cache miss):');
    const start1 = Date.now();
    const response1 = await axios.get(`${baseURL}/tokens?search=BT`);
    const end1 = Date.now();
    console.log(`   Response time: ${end1 - start1}ms`);
    console.log(`   Cached: ${response1.data.cached}`);
    console.log(`   Results: ${JSON.stringify(response1.data.results)}\n`);
    
    // Second request - should use cache
    console.log('2. Second request (cache hit):');
    const start2 = Date.now();
    const response2 = await axios.get(`${baseURL}/tokens?search=BT`);
    const end2 = Date.now();
    console.log(`   Response time: ${end2 - start2}ms`);
    console.log(`   Cached: ${response2.data.cached}`);
    console.log(`   Results: ${JSON.stringify(response2.data.results)}\n`);
    
    // Third request with different search - should still use cache
    console.log('3. Third request (different search, cache hit):');
    const start3 = Date.now();
    const response3 = await axios.get(`${baseURL}/tokens?search=ET`);
    const end3 = Date.now();
    console.log(`   Response time: ${end3 - start3}ms`);
    console.log(`   Cached: ${response3.data.cached}`);
    console.log(`   Results: ${JSON.stringify(response3.data.results)}\n`);
    
    console.log('Cache test completed successfully!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('Server is not running. Please start the server first with: npm run start:dev');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testTokenCache();
