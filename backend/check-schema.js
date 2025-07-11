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

async function checkTableSchema() {
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
    
    // Get full table schema including constraints
    console.log('Getting full table schema for daily_progress:');
    const [createTable] = await connection.execute(
      `SHOW CREATE TABLE daily_progress`
    );
    
    console.log('Full table schema:');
    console.log(createTable[0]['Create Table']);
    
    // Get all constraints
    console.log('\nGetting all constraints:');
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'daily_progress'
    `, [dbConfig.database]);
    
    console.log('Table constraints:', constraints);
    
    // Try to check constraint details
    if (constraints.length > 0) {
      for (const constraint of constraints) {
        if (constraint.CONSTRAINT_TYPE === 'CHECK') {
          console.log(`\nExamining check constraint: ${constraint.CONSTRAINT_NAME}`);
          try {
            const [checkDetails] = await connection.execute(`
              SELECT CHECK_CLAUSE
              FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
              WHERE CONSTRAINT_SCHEMA = ? AND CONSTRAINT_NAME = ?
            `, [dbConfig.database, constraint.CONSTRAINT_NAME]);
            
            console.log('Check constraint details:', checkDetails);
          } catch (error) {
            console.error('Error getting check constraint details:', error.message);
          }
        }
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error checking table schema:', error);
  }
}

checkTableSchema();
