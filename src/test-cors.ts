import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { corsConfig } from './cors.config';

// Define a simple controller for testing
@Controller('test-cors')
class TestCorsController {
  @Get()
  getHello(): string {
    return 'CORS Test';
  }
}

// Define a module that only includes the test controller
@Module({
  controllers: [TestCorsController],
})
class TestCorsModule {}

async function runCorsTests() {
  console.log('Starting CORS tests with isolated module...');
  
  // Create app using the isolated module (no database dependency)
  const app = await NestFactory.create(TestCorsModule);
  app.enableCors(corsConfig);
  await app.listen(3001);
  const url = 'http://localhost:3001/test-cors';

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // Test 1: Allowed Origin (Localhost)
    console.log('\n--- Test 1: Allowed Origin (Localhost) ---');
    const res1 = await fetch(url, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:3000' }
    });
    assert(res1.status === 200, 'Status should be 200');
    assert(res1.headers.get('access-control-allow-origin') === 'http://localhost:3000', 'Should allow http://localhost:3000');
    assert(res1.headers.get('access-control-allow-credentials') === 'true', 'Should allow credentials');

    // Test 2: Allowed Origin (Production)
    console.log('\n--- Test 2: Allowed Origin (Production) ---');
    const res2 = await fetch(url, {
      method: 'GET',
      headers: { 'Origin': 'https://tradeflow-web.vercel.app' }
    });
    assert(res2.headers.get('access-control-allow-origin') === 'https://tradeflow-web.vercel.app', 'Should allow production origin');

    // Test 3: Blocked Origin
    console.log('\n--- Test 3: Blocked Origin ---');
    const res3 = await fetch(url, {
      method: 'GET',
      headers: { 'Origin': 'http://evil.com' }
    });
    // When origin is not allowed, NestJS/cors usually doesn't send the ACAO header
    assert(res3.headers.get('access-control-allow-origin') === null, 'Should NOT send ACAO header for blocked origin');

    // Test 4: Preflight for Allowed Method
    console.log('\n--- Test 4: Preflight Allowed Method (PUT) ---');
    const res4 = await fetch(url, {
      method: 'OPTIONS',
      headers: { 
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'PUT'
      }
    });
    assert(res4.status === 204, 'Preflight status should be 204');
    assert(res4.headers.get('access-control-allow-methods').includes('PUT'), 'Should allow PUT method');

    // Test 5: Preflight for Blocked Method (DELETE)
    console.log('\n--- Test 5: Preflight Blocked Method (DELETE) ---');
    const res5 = await fetch(url, {
      method: 'OPTIONS',
      headers: { 
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'DELETE'
      }
    });
    // Default CORS behavior might still return 204 but NOT list DELETE in allowed methods
    const allowedMethods = res5.headers.get('access-control-allow-methods') || '';
    assert(!allowedMethods.includes('DELETE'), 'Should NOT allow DELETE method');

  } catch (error) {
    console.error('Test execution failed:', error);
    failed++;
  } finally {
    await app.close();
    console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  }
}

runCorsTests();
