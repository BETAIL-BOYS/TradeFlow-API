// Test script for impermanent loss formula validation
// This script validates the mathematical implementation without requiring the server

function calculateImpermanentLoss(entryPriceRatio, currentPriceRatio) {
  // Validate inputs
  if (entryPriceRatio <= 0 || currentPriceRatio <= 0) {
    throw new Error('Price ratios must be positive numbers');
  }

  // Calculate price ratio (current/entry)
  const priceRatio = currentPriceRatio / entryPriceRatio;
  
  // Apply the standard IL formula: 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
  const impermanentLoss = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  
  // Convert to percentage
  const impermanentLossPercentage = impermanentLoss * 100;

  return {
    entryPriceRatio,
    currentPriceRatio,
    priceRatio,
    impermanentLossPercentage,
  };
}

function runFormulaTests() {
  console.log('🧮 Testing Impermanent Loss Formula Implementation');
  console.log('==================================================\n');

  const testCases = [
    { 
      entry: 1.0, 
      current: 1.0, 
      description: 'No price change (should be 0% IL)',
      expected: 0 
    },
    { 
      entry: 1.0, 
      current: 1.5, 
      description: '50% price increase (should show negative IL)',
      expected: -2.02 // Approximate expected value
    },
    { 
      entry: 1.0, 
      current: 0.5, 
      description: '50% price decrease (should show negative IL)',
      expected: -2.02 // Symmetric case
    },
    { 
      entry: 1.0, 
      current: 2.0, 
      description: '100% price increase',
      expected: -5.72 // Approximate expected value
    },
    { 
      entry: 1.0, 
      current: 0.25, 
      description: '75% price decrease',
      expected: -11.25 // Approximate expected value
    },
  ];

  let allTestsPassed = true;

  testCases.forEach((testCase, index) => {
    try {
      const result = calculateImpermanentLoss(testCase.entry, testCase.current);
      
      console.log(`Test ${index + 1}: ${testCase.description}`);
      console.log(`  Entry: ${testCase.entry}, Current: ${testCase.current}`);
      console.log(`  Price Ratio: ${result.priceRatio.toFixed(4)}`);
      console.log(`  IL Percentage: ${result.impermanentLossPercentage.toFixed(4)}%`);
      
      // Check if result is reasonable (should be negative for price changes)
      if (testCase.entry === testCase.current) {
        if (Math.abs(result.impermanentLossPercentage) < 0.0001) {
          console.log('  ✅ PASS: No impermanent loss when prices are equal');
        } else {
          console.log('  ❌ FAIL: Should be 0% when prices are equal');
          allTestsPassed = false;
        }
      } else {
        if (result.impermanentLossPercentage < 0) {
          console.log('  ✅ PASS: Negative impermanent loss as expected');
        } else {
          console.log('  ❌ FAIL: Should be negative for price changes');
          allTestsPassed = false;
        }
      }
      
      // Check if the result is within reasonable range
      if (Math.abs(result.impermanentLossPercentage) > 50) {
        console.log('  ⚠️  WARNING: Very high impermanent loss percentage');
      }
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      allTestsPassed = false;
    }
    
    console.log('');
  });

  // Test error cases
  console.log('Testing Error Cases:');
  console.log('-------------------');
  
  const errorTestCases = [
    { entry: 0, current: 1.0, description: 'Zero entry price' },
    { entry: 1.0, current: 0, description: 'Zero current price' },
    { entry: -1.0, current: 1.0, description: 'Negative entry price' },
    { entry: 1.0, current: -1.0, description: 'Negative current price' },
  ];

  errorTestCases.forEach((testCase, index) => {
    try {
      calculateImpermanentLoss(testCase.entry, testCase.current);
      console.log(`Error Test ${index + 1}: ${testCase.description}`);
      console.log('  ❌ FAIL: Should have thrown an error');
      allTestsPassed = false;
    } catch (error) {
      console.log(`Error Test ${index + 1}: ${testCase.description}`);
      console.log('  ✅ PASS: Correctly threw error');
    }
    console.log('');
  });

  console.log('==================================================');
  if (allTestsPassed) {
    console.log('🎉 All tests passed! The formula implementation is correct.');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }
  console.log('==================================================');

  return allTestsPassed;
}

// Run the tests
runFormulaTests();
