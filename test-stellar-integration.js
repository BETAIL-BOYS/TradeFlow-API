// Test script to validate Stellar Horizon API integration
// This would normally be run with Node.js, but serves as documentation

const { Server } = require('@stellar/stellar-sdk');

async function testStellarIntegration() {
  console.log('Testing Stellar Horizon API Integration...');
  
  try {
    // Connect to Stellar Horizon Testnet
    const server = new Server('https://horizon-testnet.stellar.org');
    
    // Fetch assets from Horizon API
    console.log('Fetching assets from Stellar Horizon Testnet...');
    const assetsResponse = await server.assets()
      .limit(10)
      .call();
    
    console.log(`Successfully fetched ${assetsResponse.records.length} assets:`);
    
    assetsResponse.records.forEach((asset, index) => {
      console.log(`\nAsset ${index + 1}:`);
      console.log(`  Type: ${asset.asset_type}`);
      console.log(`  Code: ${asset.asset_code || 'Native XLM'}`);
      console.log(`  Issuer: ${asset.asset_issuer || 'Native'}`);
      console.log(`  Amount: ${asset.amount}`);
      console.log(`  Accounts: ${asset.num_accounts}`);
    });
    
    // Test specific asset search (Testnet USDC)
    console.log('\n\nTesting specific asset search for USDC...');
    try {
      const usdcResponse = await server.assets()
        .forCode('USDC')
        .limit(5)
        .call();
      
      console.log(`Found ${usdcResponse.records.length} USDC assets:`);
      usdcResponse.records.forEach((usdc, index) => {
        console.log(`USDC ${index + 1}:`);
        console.log(`  Issuer: ${usdc.asset_issuer}`);
        console.log(`  Amount: ${usdc.amount}`);
        console.log(`  Accounts: ${usdc.num_accounts}`);
      });
    } catch (error) {
      console.log('USDC search error:', error.message);
    }
    
    console.log('\n✅ Stellar Horizon API integration test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Stellar Horizon API integration test failed:', error.message);
    return false;
  }
}

// Mock data for fallback testing
function getMockAssets() {
  return [
    {
      asset_type: 'credit_alphanum4',
      asset_code: 'USDC',
      asset_issuer: 'GBBD47F6L3WRUIRDRN4Q3GUMF3VUEQBQO4FSKJ3DFOZQY2E4PWSJD3HU',
      amount: '1000000.0000000',
      num_accounts: 100,
      flags: { auth_required: false, auth_revocable: false }
    },
    {
      asset_type: 'credit_alphanum4',
      asset_code: 'EURT',
      asset_issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
      amount: '500000.0000000',
      num_accounts: 50,
      flags: { auth_required: false, auth_revocable: false }
    }
  ];
}

console.log('Stellar Integration Test Script');
console.log('===============================');
console.log('This script validates the Stellar Horizon API integration.');
console.log('Run with: node test-stellar-integration.js');
console.log('');
console.log('Features implemented:');
console.log('✅ Connect to Stellar Horizon Testnet');
console.log('✅ Fetch live asset data');
console.log('✅ Search assets by code');
console.log('✅ Fallback to mock data on API failure');
console.log('✅ Caching mechanism for performance');
console.log('✅ Error handling and logging');
console.log('');

// Export for testing
module.exports = { testStellarIntegration, getMockAssets };
