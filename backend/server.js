const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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

// Test database connection
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway MySQL database');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('📊 Database test query successful');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Routes for Tools Section APIs
const toolsRoutes = require('./routes/tools');
const progressRoutes = require('./routes/progress');
const quitPlanRoutes = require('./routes/quit-plan');
const healthEffectsRoutes = require('./routes/health-effects');

app.use('/api/tools', toolsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quit-plan', quitPlanRoutes);
app.use('/api/health-effects', healthEffectsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Quit Smoking API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Try to kill any existing process on these ports (Windows only)
try {
  const { execSync } = require('child_process');
  console.log(`Attempting to free port ${PORT}...`);
  execSync(`powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
  execSync(`powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT + 1} -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
} catch (e) {
  console.log('Could not free ports automatically');
}

// Try to start server with port fallback
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  testConnection();
}).on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    console.log(`⚠️ Port ${PORT} is already in use, trying port ${newPort}`);
    app.listen(newPort, () => {
      console.log(`🚀 Server running on port ${newPort}`);
      console.log(`⚠️ Note: Please update your frontend API URLs to use port ${newPort}`);
      testConnection();
    }).on('error', (err) => {
      console.error(`Failed to start server on port ${newPort} as well:`, err.message);
      console.log('Please manually kill the processes using ports 5000 and 5001, then restart the server.');
    });
  } else {
    console.error('Server error:', e);
  }
});

module.exports = app;
