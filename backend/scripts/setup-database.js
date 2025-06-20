#!/usr/bin/env node

/**
 * Railway Database Setup Script
 * 
 * This script helps you setup your Railway MySQL database
 * by creating all necessary tables and sample data.
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
    title: (msg) => console.log(`${colors.bright}${colors.blue}🚀 ${msg}${colors.reset}`)
};

async function createConnection() {
    try {
        const dbConfig = process.env.DATABASE_URL || process.env.DB_URL
            ? {
                uri: process.env.DATABASE_URL || process.env.DB_URL,
                ssl: { rejectUnauthorized: false }
            }
            : {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                ssl: { rejectUnauthorized: false }
            };

        log.info('Connecting to Railway MySQL database...');
        const connection = await mysql.createConnection(dbConfig);
        log.success('Connected to database successfully!');
        return connection;
    } catch (error) {
        log.error(`Database connection failed: ${error.message}`);
        log.warning('Please check your .env file and Railway database credentials');
        process.exit(1);
    }
}

async function executeSQLFile(connection, filePath) {
    try {
        log.info(`Reading SQL file: ${filePath}`);
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        log.info(`Executing ${statements.length} SQL statements...`);

        let successCount = 0;
        for (const statement of statements) {
            try {
                await connection.execute(statement);
                successCount++;
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    log.warning(`Statement failed: ${error.message}`);
                }
            }
        }

        log.success(`Executed ${successCount} statements successfully`);
    } catch (error) {
        log.error(`Error executing SQL file: ${error.message}`);
        throw error;
    }
}

async function checkTablesExist(connection) {
    try {
        const [tables] = await connection.execute('SHOW TABLES');
        return tables.length > 0;
    } catch (error) {
        return false;
    }
}

async function createDefaultAdmin(connection) {
    try {
        log.info('Creating default admin user...');

        // Check if admin exists
        const [existing] = await connection.execute(
            'SELECT id FROM smoker WHERE email = ?',
            ['admin@nosmoke.com']
        );

        if (existing.length > 0) {
            log.warning('Admin user already exists');
            return;
        }

        // Create admin user
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash('admin123', 12);

        await connection.execute(`
            INSERT INTO smoker 
            (username, email, password_hash, full_name, membership_type, email_verified, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            'admin',
            'admin@nosmoke.com',
            hashedPassword,
            'System Administrator',
            'vip',
            true,
            true
        ]);

        log.success('Default admin user created!');
        log.info('Admin credentials:');
        log.info('  Email: admin@nosmoke.com');
        log.info('  Password: admin123');
        log.warning('Please change the admin password after first login!');

    } catch (error) {
        log.error(`Failed to create admin user: ${error.message}`);
    }
}

async function showDatabaseInfo(connection) {
    try {
        log.title('Database Information');

        // Get database name
        const [dbResult] = await connection.execute('SELECT DATABASE() as db_name');
        log.info(`Database: ${dbResult[0].db_name}`);

        // Count tables
        const [tables] = await connection.execute('SHOW TABLES');
        log.info(`Tables created: ${tables.length}`);

        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM smoker');
        log.info(`Users: ${userCount[0].count}`);

        // Count coaches
        const [coachCount] = await connection.execute('SELECT COUNT(*) as count FROM coach');
        log.info(`Coaches: ${coachCount[0].count}`);

        log.success('Database setup completed successfully!');

    } catch (error) {
        log.error(`Error getting database info: ${error.message}`);
    }
}

async function main() {
    log.title('NoSmoke Railway Database Setup');
    log.info('This script will setup your Railway MySQL database');

    const connection = await createConnection();

    try {
        // Check if tables already exist
        const tablesExist = await checkTablesExist(connection);
        if (tablesExist) {
            log.warning('Database tables already exist!');
            console.log('\nOptions:');
            console.log('1. Continue anyway (might show some errors)');
            console.log('2. Exit and manually check database');

            // For automation, we'll continue
            log.info('Continuing with setup...');
        }

        // Execute schema file
        const schemaPath = path.join(__dirname, 'railway_schema.sql');
        if (fs.existsSync(schemaPath)) {
            await executeSQLFile(connection, schemaPath);
        } else {
            log.error('Schema file not found: railway_schema.sql');
            process.exit(1);
        }

        // Create default admin
        await createDefaultAdmin(connection);

        // Show database info
        await showDatabaseInfo(connection);

        log.success('🎉 Database setup completed successfully!');
        log.info('You can now start your application with: npm run dev');

    } catch (error) {
        log.error(`Setup failed: ${error.message}`);
        process.exit(1);
    } finally {
        await connection.end();
        log.info('Database connection closed');
    }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        log.error(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

export default main;
