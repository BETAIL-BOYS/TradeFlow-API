const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:3000'
  }
};

function checkCors(origin, expectedStatus, expectedAllowOrigin) {
  return new Promise((resolve, reject) => {
    const reqOptions = { ...options, headers: { 'Origin': origin } };
    const req = http.request(reqOptions, (res) => {
      const allowOrigin = res.headers['access-control-allow-origin'];
      console.log(`Origin: ${origin}, Status: ${res.statusCode}, Access-Control-Allow-Origin: ${allowOrigin}`);
      
      if (expectedAllowOrigin) {
        if (allowOrigin === expectedAllowOrigin) {
          resolve(true);
        } else {
          reject(new Error(`Expected ${expectedAllowOrigin}, got ${allowOrigin}`));
        }
      } else {
        if (!allowOrigin) {
          resolve(true);
        } else {
          reject(new Error(`Expected no Access-Control-Allow-Origin, got ${allowOrigin}`));
        }
      }
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing Allowed Origin 1: http://localhost:3000');
    await checkCors('http://localhost:3000', 200, 'http://localhost:3000');
    
    console.log('Testing Allowed Origin 2: https://tradeflow-web.vercel.app');
    await checkCors('https://tradeflow-web.vercel.app', 200, 'https://tradeflow-web.vercel.app');

    console.log('Testing Disallowed Origin: http://evil.com');
    await checkCors('http://evil.com', 200, undefined); // Should not return the header

    console.log('All CORS tests passed!');
  } catch (error) {
    console.error('CORS Test Failed:', error.message);
    process.exit(1);
  }
}

// Give server a moment to start if needed, but this script assumes it's running.
// If run via a command that starts server then runs this, we need a wait.
runTests();
