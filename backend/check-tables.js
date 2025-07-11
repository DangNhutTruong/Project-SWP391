const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkTables() {
  try {
    console.log('Connecting to database...');
    console.log('Database config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');
    
    // Check if daily_progress table exists
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'daily_progress'`, 
      [dbConfig.database]
    );
    
    console.log('Tables query result:', tables);
    
    if (tables.length === 0) {
      console.log('daily_progress table does not exist! Creating it now...');
      
      // Create the table
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
    } else {
      console.log('daily_progress table already exists');
    }
    
    // Check table structure
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM daily_progress`
    );
    console.log('Table columns:', columns.map(col => `${col.Field} (${col.Type})`));
    
    // Count records
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as count FROM daily_progress`
    );
    console.log('Record count:', countResult[0].count);
    
    // Check latest records
    if (countResult[0].count > 0) {
      const [records] = await connection.execute(
        `SELECT * FROM daily_progress ORDER BY created_at DESC LIMIT 5`
      );
      console.log('Latest records:', records);
    }
    
    // Test insertion
    console.log('Trying a test insertion...');
    const userId = 'test_user';
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [result] = await connection.execute(
        `INSERT INTO daily_progress 
         (smoker_id, date, tool_type, days_clean, money_saved, cigarettes_avoided, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         tool_type = VALUES(tool_type),
         days_clean = VALUES(days_clean),
         money_saved = VALUES(money_saved),
         cigarettes_avoided = VALUES(cigarettes_avoided),
         notes = VALUES(notes)`,
        [userId, today, 'test', 1, 10000, 5, 'Test insertion']
      );
      
      console.log('Test insertion result:', result);
      
      // Verify the test insertion
      const [verification] = await connection.execute(
        'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
        [userId, today]
      );
      
      console.log('Verification - Test data in database:', verification);
    } catch (insertError) {
      console.error('Test insertion error:', insertError);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
