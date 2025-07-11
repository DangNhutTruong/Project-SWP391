const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

// Get user's daily progress
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    // Add date filter options if provided in query params
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM daily_progress WHERE smoker_id = ?';
    const params = [userId];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY date DESC';
    
    const [rows] = await connection.execute(query, params);
    
    // Convert progress_data JSON strings to objects
    const processedRows = rows.map(row => {
      if (row.progress_data && typeof row.progress_data === 'string') {
        try {
          row.progress_data = JSON.parse(row.progress_data);
        } catch (e) {
          console.error('Error parsing progress_data JSON:', e);
        }
      }
      return row;
    });
    
    await connection.end();
    res.json(processedRows);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update daily progress
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Received progress update for user ${userId}:`, req.body);
    
    const { 
      tool_type, 
      days_clean, 
      money_saved, 
      cigarettes_avoided,
      vapes_avoided,
      health_score,
      progress_percentage,
      progress_data,
      notes 
    } = req.body;
    
    // Validate tool_type (must be one of the allowed ENUM values)
    const validToolTypes = ['quit_smoking_plan', 'cost_calculator', 'smoking_effects', 
                           'quit_vaping_plan', 'vaping_benefits', 'vaping_effects'];
    const safeToolType = validToolTypes.includes(tool_type) ? tool_type : 'quit_smoking_plan';
    
    // Set default health_score (must be between 1-100 due to constraint)
    const safeHealthScore = health_score !== null && health_score !== undefined 
      ? Math.min(Math.max(1, Math.floor(health_score)), 100) // Ensure between 1-100
      : 50; // Default value if not provided
    
    // Log data to be saved
    console.log('Saving the following data to daily_progress:');
    console.log('- smoker_id:', userId);
    console.log('- tool_type:', safeToolType);
    console.log('- days_clean:', days_clean);
    console.log('- money_saved:', money_saved);
    console.log('- cigarettes_avoided:', cigarettes_avoided);
    console.log('- health_score:', safeHealthScore);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Insert or update today's progress
    const today = new Date().toISOString().split('T')[0];
    console.log('- date:', today);
    
    try {
      // Check if the table exists
      const [tables] = await connection.execute(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'daily_progress'`, 
        [dbConfig.database]
      );
      
      if (tables.length === 0) {
        console.log('daily_progress table does not exist! Creating it now...');
        
        // Create the daily_progress table if it doesn't exist
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS daily_progress (
            id INT AUTO_INCREMENT PRIMARY KEY,
            smoker_id VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            tool_type VARCHAR(50),
            days_clean INT DEFAULT 0,
            money_saved DECIMAL(10,2) DEFAULT 0,
            cigarettes_avoided INT DEFAULT 0,
            vapes_avoided INT DEFAULT 0,
            health_score INT DEFAULT 0,
            progress_percentage INT DEFAULT 0,
            progress_data JSON,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY smoker_date (smoker_id, date)
          )
        `);
        console.log('Created daily_progress table successfully');
      }
      
      // Insert or update today's progress
      const [result] = await connection.execute(
        `INSERT INTO daily_progress 
         (smoker_id, date, tool_type, days_clean, money_saved, cigarettes_avoided, 
          vapes_avoided, health_score, progress_percentage, progress_data, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         tool_type = VALUES(tool_type),
         days_clean = VALUES(days_clean),
         money_saved = VALUES(money_saved),
         cigarettes_avoided = VALUES(cigarettes_avoided),
         vapes_avoided = VALUES(vapes_avoided),
         health_score = VALUES(health_score),
         progress_percentage = VALUES(progress_percentage),
         progress_data = VALUES(progress_data),
         notes = VALUES(notes)`,
        [userId, today, safeToolType, days_clean, money_saved, cigarettes_avoided,
         vapes_avoided || 0, safeHealthScore, progress_percentage || 0, 
         JSON.stringify(progress_data), notes]
      );
      
      console.log('Data saved successfully to daily_progress!', result);
      
      // Verify data was saved by reading it back
      const [verification] = await connection.execute(
        'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
        [userId, today]
      );
      
      console.log('Verification - Data in database:', verification);
      
      await connection.end();
      res.json({ success: true, id: result.insertId });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Check if error is about missing table
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        console.log('Table does not exist, trying to create it');
        res.status(500).json({ error: 'Database schema issue - trying to fix' });
      } else {
        res.status(500).json({ error: `Database error: ${dbError.message}` });
      }
      await connection.end();
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get progress stats for dashboard
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    // Get basic stats
    const [rows] = await connection.execute(
      `SELECT 
         MAX(days_clean) as max_days_clean,
         SUM(money_saved) as total_money_saved,
         SUM(cigarettes_avoided) as total_cigarettes_avoided,
         AVG(health_score) as avg_health_score,
         COUNT(*) as total_checkins,
         MAX(date) as last_checkin_date
       FROM daily_progress 
       WHERE smoker_id = ?`,
      [userId]
    );
    
    // Calculate streak (consecutive days with days_clean > 0)
    const [streakRows] = await connection.execute(
      `SELECT date, days_clean 
       FROM daily_progress 
       WHERE smoker_id = ? 
       ORDER BY date DESC`,
      [userId]
    );
    
    let currentStreak = 0;
    if (streakRows.length > 0) {
      // Check if the most recent record is from today or yesterday
      const lastDate = new Date(streakRows[0].date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isFromTodayOrYesterday = 
        lastDate.toISOString().split('T')[0] === today.toISOString().split('T')[0] ||
        lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
      
      if (isFromTodayOrYesterday) {
        // Count streak days
        for (const record of streakRows) {
          if (record.days_clean > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    
    // Add streak to stats
    const stats = rows[0] || {};
    stats.current_streak = currentStreak;
    
    await connection.end();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
