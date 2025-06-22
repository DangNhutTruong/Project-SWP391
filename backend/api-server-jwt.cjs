console.log('🚀 Khởi động Backend API Server với MySQL và JWT...');

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-super-secret-jwt-key-for-quit-smoking-app-2025';

// Middleware
app.use(cors());
app.use(express.json());

console.log('✅ Setup middleware thành công');

// MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'SmokingCessationDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test MySQL connection
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL kết nối thành công!');
  } catch (error) {
    console.error('❌ MySQL kết nối thất bại:', error.message);
  }
})();

// JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token, quyền truy cập bị từ chối'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// ====== ROOT ROUTES ======

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Quit Smoking Backend API với JWT',
    version: '1.0.0',
    endpoints: [
      'GET / - API info',
      'GET /health - Health check',
      'POST /api/auth/register - Đăng ký',
      'POST /api/auth/login - Đăng nhập',
      'GET /api/users - Danh sách người dùng',
      'GET /api/users/:id - Chi tiết người dùng',
      'GET /api/plans - Danh sách kế hoạch',
      'POST /api/plans - Tạo kế hoạch mới',
      'GET /api/appointments - Danh sách cuộc hẹn',
      'POST /api/appointments - Tạo cuộc hẹn',
      'GET /api/progress/:userId - Tiến trình người dùng',
      'POST /api/progress - Cập nhật tiến trình'
    ]
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server và database hoạt động tốt!',
      database: 'MySQL connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// ====== AUTH ROUTES ======

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;
    
    // Check if user exists
    const [existingUsers] = await pool.query('SELECT Email FROM User WHERE Email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Get Smoker role ID
    const [roles] = await pool.query('SELECT RoleID FROM Role WHERE RoleName = "Smoker"');
    const roleId = roles[0]?.RoleID || 3;
    
    // Insert user
    const [result] = await pool.query(`
      INSERT INTO User (Name, Email, Password, Age, Gender, Phone, RoleID, Membership, IsActive, RegisterDate) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'free', 1, NOW())
    `, [name, email, hashedPassword, age || null, gender || null, phone || null, roleId]);
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký',
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const [users] = await pool.query(`
      SELECT u.UserID, u.Name, u.Email, u.Password, u.Membership, r.RoleName
      FROM User u
      JOIN Role r ON u.RoleID = r.RoleID
      WHERE u.Email = ? AND u.IsActive = 1
    `, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    
    const user = users[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.UserID, 
        email: user.Email, 
        role: user.RoleName,
        membership: user.Membership 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update last login
    await pool.query('UPDATE User SET LastLogin = NOW() WHERE UserID = ?', [user.UserID]);
    
    // Remove password from response
    delete user.Password;
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token: token,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    });
  }
});

// ====== USER ROUTES ======

// Get all users (protected)
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.UserID, u.Name, u.Email, u.Age, u.Gender, u.Phone, 
             u.RegisterDate, u.Membership, u.IsActive, r.RoleName 
      FROM User u
      JOIN Role r ON u.RoleID = r.RoleID
      WHERE u.IsActive = 1
      ORDER BY u.RegisterDate DESC
    `);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách người dùng',
      error: error.message
    });
  }
});

// Get user by ID (protected)
app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(`
      SELECT u.UserID, u.Name, u.Email, u.Age, u.Gender, u.Phone, 
             u.Address, u.RegisterDate, u.Membership, r.RoleName 
      FROM User u
      JOIN Role r ON u.RoleID = r.RoleID
      WHERE u.UserID = ? AND u.IsActive = 1
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng',
      error: error.message
    });
  }
});

// ====== QUIT PLAN ROUTES ======

// Get all quit plans
app.get('/api/plans', async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT qp.QuitPlanID, qp.PlanName, qp.Description, qp.Duration, qp.Difficulty,
             qp.CreatedDate, u.Name as CreatorName
      FROM QuitPlan qp
      LEFT JOIN User u ON qp.UserID = u.UserID
      ORDER BY qp.CreatedDate DESC
    `);
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách kế hoạch',
      error: error.message
    });
  }
});

// Create new quit plan (protected)
app.post('/api/plans', verifyToken, async (req, res) => {
  try {
    const { planName, description, duration, difficulty } = req.body;
    const userId = req.user.userId;
    
    const [result] = await pool.query(`
      INSERT INTO QuitPlan (UserID, PlanName, Description, Duration, Difficulty, CreatedDate)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [userId, planName, description, duration, difficulty]);
    
    res.status(201).json({
      success: true,
      message: 'Tạo kế hoạch thành công',
      planId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo kế hoạch',
      error: error.message
    });
  }
});

// ====== APPOINTMENT ROUTES ======

// Get appointments (protected)
app.get('/api/appointments', verifyToken, async (req, res) => {
  try {
    const [appointments] = await pool.query(`
      SELECT a.AppointmentID, a.AppointmentDate, a.Notes, a.Status,
             u.Name as UserName, c.Name as CoachName
      FROM Appointment a
      JOIN User u ON a.UserID = u.UserID
      JOIN User c ON a.CoachID = c.UserID
      ORDER BY a.AppointmentDate DESC
    `);
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách cuộc hẹn',
      error: error.message
    });
  }
});

// Create appointment (protected)
app.post('/api/appointments', verifyToken, async (req, res) => {
  try {
    const { coachId, appointmentDate, notes } = req.body;
    const userId = req.user.userId;
    
    const [result] = await pool.query(`
      INSERT INTO Appointment (UserID, CoachID, AppointmentDate, Notes, Status)
      VALUES (?, ?, ?, ?, 'scheduled')
    `, [userId, coachId, appointmentDate, notes]);
    
    res.status(201).json({
      success: true,
      message: 'Tạo cuộc hẹn thành công',
      appointmentId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo cuộc hẹn',
      error: error.message
    });
  }
});

// ====== PROGRESS ROUTES ======

// Get user progress (protected)
app.get('/api/progress/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [progress] = await pool.query(`
      SELECT p.ProgressID, p.Date, p.DaysSmokeFree, p.MoneySaved, 
             p.CigarettesAvoided, p.MoodRating, p.Notes
      FROM Progress p
      WHERE p.UserID = ?
      ORDER BY p.Date DESC
      LIMIT 30
    `, [userId]);
    
    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy tiến trình',
      error: error.message
    });
  }
});

// Add progress entry (protected)
app.post('/api/progress', verifyToken, async (req, res) => {
  try {
    const { daysSmokeFree, moneySaved, cigarettesAvoided, moodRating, notes } = req.body;
    const userId = req.user.userId;
    
    const [result] = await pool.query(`
      INSERT INTO Progress (UserID, Date, DaysSmokeFree, MoneySaved, CigarettesAvoided, MoodRating, Notes)
      VALUES (?, NOW(), ?, ?, ?, ?, ?)
    `, [userId, daysSmokeFree, moneySaved, cigarettesAvoided, moodRating, notes]);
    
    res.status(201).json({
      success: true,
      message: 'Cập nhật tiến trình thành công',
      progressId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật tiến trình',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Backend API Server với JWT đang chạy!
📍 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/health
🔐 Auth: http://localhost:${PORT}/api/auth/login
👥 Users: http://localhost:${PORT}/api/users
📋 Plans: http://localhost:${PORT}/api/plans
📅 Appointments: http://localhost:${PORT}/api/appointments
📈 Progress: http://localhost:${PORT}/api/progress/:userId
  `);
});
