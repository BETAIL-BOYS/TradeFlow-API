// Test script to verify the volume data generation logic
// This simulates the analytics service logic

function generateMockVolumeData() {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic volume data between $10,000 and $500,000
    const baseVolume = 250000;
    const variation = Math.random() * 200000 - 100000;
    const volumeUSD = Math.round(baseVolume + variation);
    
    data.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      volumeUSD,
    });
  }
  
  return data;
}

// Test the function
const volumeData = generateMockVolumeData();
console.log('Mock Volume Data:');
console.log(JSON.stringify(volumeData, null, 2));

// Verify the structure
console.log('\nVerification:');
console.log(`- Number of days: ${volumeData.length}`);
console.log(`- First date: ${volumeData[0].date}`);
console.log(`- Last date: ${volumeData[volumeData.length - 1].date}`);
console.log(`- Volume range: $${Math.min(...volumeData.map(d => d.volumeUSD)).toLocaleString()} - $${Math.max(...volumeData.map(d => d.volumeUSD)).toLocaleString()}`);
