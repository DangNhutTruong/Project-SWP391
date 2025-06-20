import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
    try {
        console.log('🔄 Connecting to Railway database...');

        const connection = await mysql.createConnection({
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        console.log('✅ Connected to Railway database');

        // Create pending_registrations table
        console.log('🔄 Creating pending_registrations table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pending_registrations (
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(50) NOT NULL UNIQUE,
              email VARCHAR(100) NOT NULL UNIQUE,
              password_hash VARCHAR(255) NOT NULL,
              full_name VARCHAR(100) NOT NULL,
              phone VARCHAR(20),
              date_of_birth DATE,
              gender ENUM('male', 'female', 'other'),
              verification_code VARCHAR(6) NOT NULL,
              expires_at DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_email (email),
              INDEX idx_username (username),
              INDEX idx_verification_code (verification_code),
              INDEX idx_expires_at (expires_at)
            )
        `);
        console.log('✅ pending_registrations table created');

        // Create email_verifications table
        console.log('🔄 Creating email_verifications table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS email_verifications (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(100) NOT NULL,
              verification_code VARCHAR(6) NOT NULL,
              expires_at DATETIME NOT NULL,
              is_used BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_email (email),
              INDEX idx_verification_code (verification_code),
              INDEX idx_expires_at (expires_at)
            )
        `);
        console.log('✅ email_verifications table created');

        // Add email_verified column to smoker table
        console.log('🔄 Adding email_verified column to smoker table...');
        try {
            await connection.execute(`
                ALTER TABLE smoker ADD COLUMN email_verified BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ email_verified column added to smoker table');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ email_verified column already exists in smoker table');
            } else {
                throw error;
            }
        }

        await connection.end();
        console.log('✅ Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('Error code:', error.code);
        process.exit(1);
    }
}

setupDatabase();
