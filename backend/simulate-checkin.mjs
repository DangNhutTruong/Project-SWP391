// Import node-fetch correctly for newer versions
import fetch from 'node-fetch';

async function simulateUserCheckin() {
  try {
    console.log('Simulating a user clicking "Lưu checkin hôm nay" button with health_score...');
    
    const userId = 999; // Test user ID
    const apiUrl = 'http://localhost:5000';
    
    // Simulate data that would be sent from the frontend
    const todayData = {
      date: new Date().toISOString().split('T')[0],
      targetCigarettes: 10,
      actualCigarettes: 5,
      notes: 'Simulated user checkin with health score'
    };
    
    // Calculate data as done in the frontend
    const cigarettesAvoided = Math.max(0, todayData.targetCigarettes - todayData.actualCigarettes);
    const packPrice = 50000;
    const cigarettesPerPack = 20;
    const moneySaved = cigarettesAvoided * (packPrice / cigarettesPerPack);
    const healthScore = Math.max(1, Math.min(100, 
      todayData.actualCigarettes === 0 ? 100 : 
      Math.floor(100 - (todayData.actualCigarettes / todayData.targetCigarettes) * 100)
    ));
    
    // Prepare data to send
    const dataToSend = {
      tool_type: 'quit_smoking_plan',
      days_clean: todayData.actualCigarettes === 0 ? 1 : 0,
      money_saved: moneySaved,
      cigarettes_avoided: cigarettesAvoided,
      health_score: healthScore,
      progress_data: todayData,
      notes: todayData.notes || 'Daily check-in'
    };
    
    console.log(`Sending data to API: ${apiUrl}/api/progress/${userId}`);
    console.log('Data being sent:', JSON.stringify(dataToSend, null, 2));
    
    // Make the API call
    const response = await fetch(`${apiUrl}/api/progress/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', response.status, errorText);
      throw new Error(`Failed to save data: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Data saved to database:', result);
    
    // Verify data was saved
    console.log('Verifying data was saved...');
    const verifyResponse = await fetch(`${apiUrl}/api/progress/${userId}`);
    
    if (!verifyResponse.ok) {
      console.error('Failed to verify data:', verifyResponse.status);
    } else {
      const progressData = await verifyResponse.json();
      console.log(`✅ Found ${progressData.length} records for user ${userId}:`);
      console.log(JSON.stringify(progressData, null, 2));
    }
  } catch (error) {
    console.error('Simulation error:', error);
  }
}

simulateUserCheckin();
