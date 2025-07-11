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

async function modifyTable() {
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
    
    // Check if daily_progress table exists and its structure
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM daily_progress`
    );
    console.log('Current table columns:', columns.map(col => `${col.Field} (${col.Type})`));
    
    // Modify smoker_id column to VARCHAR
    console.log('Modifying smoker_id column to VARCHAR(50)...');
    try {
      await connection.execute(`
        ALTER TABLE daily_progress MODIFY COLUMN smoker_id VARCHAR(50) NOT NULL
      `);
      console.log('Modified smoker_id column successfully');
    } catch (alterError) {
      console.error('Error modifying column:', alterError);
    }
    
    // Verify the changes
    const [updatedColumns] = await connection.execute(
      `SHOW COLUMNS FROM daily_progress`
    );
    console.log('Updated table columns:', updatedColumns.map(col => `${col.Field} (${col.Type})`));
    
    // Test insertion with string ID
    console.log('Trying a test insertion with string ID...');
    const userId = 'test_user_123';
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
        [userId, today, 'test', 1, 10000, 5, 'Test insertion after schema change']
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
    
    // Test insertion with numeric ID
    console.log('Trying a test insertion with numeric ID...');
    const numericUserId = 123;
    
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
        [numericUserId, today, 'test', 1, 20000, 10, 'Test insertion with numeric ID']
      );
      
      console.log('Test insertion result (numeric ID):', result);
      
      // Verify the test insertion
      const [verification] = await connection.execute(
        'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
        [numericUserId, today]
      );
      
      console.log('Verification - Numeric ID data in database:', verification);
    } catch (insertError) {
      console.error('Test insertion error (numeric ID):', insertError);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error modifying table:', error);
  }
}

modifyTable();
