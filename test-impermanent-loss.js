// Test script for impermanent loss endpoint
const http = require('http');

// Test cases for impermanent loss calculation
const testCases = [
  { entryPriceRatio: 1.0, currentPriceRatio: 1.0, description: 'No price change (0% IL)' },
  { entryPriceRatio: 1.0, currentPriceRatio: 1.5, description: '50% price increase' },
  { entryPriceRatio: 1.0, currentPriceRatio: 0.5, description: '50% price decrease' },
  { entryPriceRatio: 1.0, currentPriceRatio: 2.0, description: '100% price increase' },
  { entryPriceRatio: 1.0, currentPriceRatio: 0.25, description: '75% price decrease' },
];

function testImpermanentLossEndpoint(testCase) {
  return new Promise((resolve, reject) => {
    const query = `entryPriceRatio=${testCase.entryPriceRatio}&currentPriceRatio=${testCase.currentPriceRatio}`;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/analytics/impermanent-loss?${query}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`\n=== Test: ${testCase.description} ===`);
          console.log(`Request: GET /api/v1/analytics/impermanent-loss?${query}`);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', JSON.stringify(response, null, 2));
          
          // Validate the response structure
          if (response.success && response.data && typeof response.data.impermanentLossPercentage === 'number') {
            console.log('✅ Response structure is valid');
          } else {
            console.log('❌ Invalid response structure');
          }
          
          resolve(response);
        } catch (error) {
          console.error(`Error parsing response: ${error.message}`);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Impermanent Loss Endpoint');
  console.log('Make sure the server is running on http://localhost:3000');
  console.log('Start server with: npm run start:dev\n');

  for (const testCase of testCases) {
    try {
      await testImpermanentLossEndpoint(testCase);
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }
  }
  
  console.log('\n🏁 Testing completed');
}

// Manual formula verification
function verifyFormula(entryPriceRatio, currentPriceRatio) {
  const priceRatio = currentPriceRatio / entryPriceRatio;
  const impermanentLoss = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  const percentage = impermanentLoss * 100;
  
  console.log(`\n📊 Manual Formula Verification:`);
  console.log(`Entry Price Ratio: ${entryPriceRatio}`);
  console.log(`Current Price Ratio: ${currentPriceRatio}`);
  console.log(`Price Ratio: ${priceRatio.toFixed(4)}`);
  console.log(`IL Formula: 2 * sqrt(${priceRatio.toFixed(4)}) / (1 + ${priceRatio.toFixed(4)}) - 1`);
  console.log(`IL Result: ${(impermanentLoss * 100).toFixed(4)}%`);
  
  return percentage;
}

// Run manual verification for one test case
console.log('🔍 Manual Formula Verification:');
verifyFormula(1.0, 1.5);

// Run the tests
runTests().catch(console.error);
