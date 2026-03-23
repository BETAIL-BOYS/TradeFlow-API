const http = require('http');

// Test data for different scenarios
const testCases = [
  { amountIn: 500, expected: '0.1%', description: 'Under 1000' },
  { amountIn: 15000, expected: '2.5%', description: 'Over 10000' },
  { amountIn: 5500, expected: '1.33%', description: 'Between 1000 and 10000' },
];

function testSwapEndpoint() {
  testCases.forEach((testCase, index) => {
    const postData = JSON.stringify({ amountIn: testCase.amountIn });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/swap/estimate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Test Case ${index + 1}: ${testCase.description}`);
        console.log(`Input: ${testCase.amountIn}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Response: ${data}`);
        console.log('---');
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
  });
}

// Test error case for invalid input
function testErrorCase() {
  const postData = JSON.stringify({ amountIn: -100 });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/swap/estimate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Error Case Test:');
      console.log(`Input: -100 (invalid)`);
      console.log(`Response Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      console.log('---');
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('Testing Swap Endpoint...');
console.log('Make sure the server is running on localhost:3000');
console.log('');

testSwapEndpoint();
testErrorCase();
