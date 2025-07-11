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

async function testInsert() {
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
    
    // Get tool_type allowed values
    const [toolTypeInfo] = await connection.execute(
      `SHOW COLUMNS FROM daily_progress WHERE Field = 'tool_type'`
    );
    console.log('Tool type definition:', toolTypeInfo);
    
    if (toolTypeInfo.length > 0) {
      const enumValues = toolTypeInfo[0].Type;
      console.log('Allowed values for tool_type:', enumValues);
    }
    
    // Test insertion with correct tool_type
    console.log('Trying a test insertion with valid tool_type...');
    const userId = 'test_user_123';
    const today = new Date().toISOString().split('T')[0];
    const validToolType = 'quit_smoking_plan';
    
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
        [userId, today, validToolType, 1, 10000, 5, 'Test insertion with valid tool_type']
      );
      
      console.log('Test insertion result:', result);
      
      // Verify the test insertion
      const [verification] = await connection.execute(
        'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
        [userId, today]
      );
      
      console.log('Verification - Data in database:', verification);
    } catch (insertError) {
      console.error('Test insertion error:', insertError);
    }
    
    // Test insertion with numeric ID
    console.log('Trying a test insertion with numeric ID as string...');
    const numericUserId = "123";
    
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
        [numericUserId, today, validToolType, 1, 20000, 10, 'Test insertion with numeric ID as string']
      );
      
      console.log('Test insertion result (numeric ID as string):', result);
      
      // Verify the test insertion
      const [verification] = await connection.execute(
        'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
        [numericUserId, today]
      );
      
      console.log('Verification - Numeric ID data in database:', verification);
      
      // Count all records
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as count FROM daily_progress`
      );
      console.log('Total record count:', countResult[0].count);
      
      // List all records
      const [allRecords] = await connection.execute(
        `SELECT * FROM daily_progress ORDER BY date DESC LIMIT 10`
      );
      console.log('All records:', allRecords);
    } catch (insertError) {
      console.error('Test insertion error (numeric ID):', insertError);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testInsert();
