const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database config (lấy từ biến môi trường)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

// Create or update quit smoking plan
router.post('/smoking-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const planData = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if user already has a plan
    const [existingPlans] = await connection.execute(
      'SELECT * FROM daily_progress WHERE smoker_id = ? AND tool_type = "quit_smoking_plan" ORDER BY date DESC LIMIT 1',
      [userId]
    );
    
    const today = new Date().toISOString().split('T')[0];
    let result;
    
    if (existingPlans.length > 0) {
      // Update existing plan
      [result] = await connection.execute(
        `UPDATE daily_progress SET 
         progress_data = ?, 
         days_clean = ?, 
         cigarettes_avoided = ?, 
         money_saved = ?,
         updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          JSON.stringify(planData),
          planData.daysQuit || 0,
          planData.cigarettesAvoided || 0,
          planData.moneySaved || 0,
          existingPlans[0].id
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Plan updated successfully',
        id: existingPlans[0].id
      });
    } else {
      // Create new plan
      [result] = await connection.execute(
        `INSERT INTO daily_progress 
         (smoker_id, date, tool_type, days_clean, cigarettes_avoided, money_saved, progress_data) 
         VALUES (?, ?, 'quit_smoking_plan', ?, ?, ?, ?)`,
        [
          userId,
          today,
          planData.daysQuit || 0,
          planData.cigarettesAvoided || 0,
          planData.moneySaved || 0,
          JSON.stringify(planData)
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Plan created successfully',
        id: result.insertId
      });
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error saving smoking plan:', error);
    res.status(500).json({ error: 'Failed to save quit smoking plan' });
  }
});

// Get quit smoking plan for a user
router.get('/smoking-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM daily_progress WHERE smoker_id = ? AND tool_type = "quit_smoking_plan" ORDER BY date DESC LIMIT 1',
      [userId]
    );
    
    await connection.end();
    
    if (rows.length === 0) {
      res.json(null);
      return;
    }
    
    // Parse progress_data if it exists
    if (rows[0].progress_data) {
      try {
        rows[0].progress_data = JSON.parse(rows[0].progress_data);
      } catch (e) {
        console.error('Error parsing progress_data:', e);
      }
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting smoking plan:', error);
    res.status(500).json({ error: 'Failed to get quit smoking plan' });
  }
});

// Calculate cost savings
router.post('/cost-calculator', async (req, res) => {
  try {
    const { cigarettesPerDay, costPerPack, quitDate, userId } = req.body;
    
    if (!cigarettesPerDay || !costPerPack || !quitDate) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const today = new Date();
    const quit = new Date(quitDate);
    
    if (quit > today) {
      res.json({
        daysUntilQuit: Math.ceil((quit - today) / (1000 * 60 * 60 * 24)),
        isQuitDay: false
      });
      return;
    }
    
    const daysQuit = Math.floor((today - quit) / (1000 * 60 * 60 * 24));
    const cigarettesAvoided = daysQuit * parseInt(cigarettesPerDay);
    const packsAvoided = cigarettesAvoided / 20; // 20 cigarettes per pack
    const moneySaved = packsAvoided * parseFloat(costPerPack);
    
    const result = {
      daysQuit,
      cigarettesAvoided,
      moneySaved: Math.round(moneySaved * 100) / 100,
      isQuitDay: true,
      healthBenefits: getHealthBenefits(daysQuit)
    };
    
    // Update user's progress in database if userId provided
    if (userId) {
      try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
          `UPDATE daily_progress 
           SET days_clean = ?, cigarettes_avoided = ?, money_saved = ? 
           WHERE smoker_id = ? AND tool_type = 'quit_smoking_plan'`,
          [daysQuit, cigarettesAvoided, moneySaved, userId]
        );
        await connection.end();
      } catch (dbError) {
        console.error('Error updating progress in DB:', dbError);
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
});

// Get smoking effects timeline based on days clean
router.get('/smoking-effects/:daysClean', async (req, res) => {
  try {
    const { daysClean } = req.params;
    const effects = getHealthBenefits(parseInt(daysClean) || 0);
    res.json({ daysClean, effects });
  } catch (error) {
    console.error('Error getting smoking effects:', error);
    res.status(500).json({ error: 'Failed to get smoking effects' });
  }
});

// Helper function to get health benefits based on days quit
function getHealthBenefits(days) {
  const benefits = [];
  
  if (days >= 0.08) benefits.push({
    title: '20 phút',
    description: 'Huyết áp và nhịp tim trở lại bình thường'
  });
  
  if (days >= 0.5) benefits.push({
    title: '12 giờ',
    description: 'Nồng độ carbon monoxide trong máu trở về mức bình thường'
  });
  
  if (days >= 1) benefits.push({
    title: '24 giờ',
    description: 'Giảm nguy cơ đau tim'
  });
  
  if (days >= 2) benefits.push({
    title: '48 giờ',
    description: 'Vị giác và khứu giác bắt đầu cải thiện'
  });
  
  if (days >= 3) benefits.push({
    title: '72 giờ',
    description: 'Các đường dẫn khí trong phổi bắt đầu thư giãn, mức năng lượng tăng lên'
  });
  
  if (days >= 14) benefits.push({
    title: '2 tuần đến 3 tháng',
    description: 'Tuần hoàn và chức năng phổi được cải thiện'
  });
  
  if (days >= 30) benefits.push({
    title: '1 tháng',
    description: 'Giảm ho và khó thở, phổi hoạt động tốt hơn'
  });
  
  if (days >= 90) benefits.push({
    title: '3 tháng',
    description: 'Chức năng phổi tăng lên đến 30%'
  });
  
  if (days >= 270) benefits.push({
    title: '9 tháng',
    description: 'Giảm nhiễm trùng phổi và triệu chứng hô hấp'
  });
  
  if (days >= 365) benefits.push({
    title: '1 năm',
    description: 'Nguy cơ bệnh tim giảm 50% so với người hút thuốc'
  });
  
  if (days >= 1825) benefits.push({
    title: '5 năm',
    description: 'Nguy cơ đột quỵ giảm xuống bằng người không hút thuốc'
  });
  
  if (days >= 3650) benefits.push({
    title: '10 năm',
    description: 'Nguy cơ ung thư phổi giảm 50%, nguy cơ ung thư miệng và họng giảm'
  });
  
  if (days >= 5475) benefits.push({
    title: '15 năm',
    description: 'Nguy cơ bệnh tim giảm xuống bằng người không hút thuốc'
  });
  
  return benefits;
}

module.exports = router;
