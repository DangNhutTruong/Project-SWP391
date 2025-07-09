# 🌍 Environment Configuration for Appointment System

## Backend (.env file in /server directory)

```env
# Database Configuration (Railway MySQL)
DATABASE_URL=mysql://root:password@host:port/database
# OR individual parameters:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nosmoke_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOGIN_RATE_LIMIT_MAX=5

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads

# CORS Settings
CORS_ORIGIN=http://localhost:5175
```

## Frontend (.env file in root directory)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=NoSmoke
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_RATINGS=true
VITE_ENABLE_NOTIFICATIONS=true

# Environment
VITE_NODE_ENV=development
```

## 🚀 Quick Setup Commands

### 1. Install Dependencies

```bash
# Root (Frontend)
npm install

# Backend
cd server
npm install
```

### 2. Environment Setup

```bash
# Copy example env files
cp .env.example .env
cd server
cp .env.example .env
```

### 3. Database Setup

```bash
# Fix database indexes (if needed)
node fix-database-indexes.js

# Or recreate messages table
cd server
node src/scripts/create-messages-table-recreate.js
```

### 4. Start Services

```bash
# Terminal 1: Start Backend
cd server
npm start

# Terminal 2: Start Frontend
npm run dev
```

### 5. Verify Integration

```bash
# Run integration tests
node integration-test.js
```

## 📊 Database Tables Required

### 1. users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('user', 'coach', 'admin') DEFAULT 'user',
  avatar_url VARCHAR(255),
  phone VARCHAR(20),
  membership ENUM('free', 'premium', 'pro') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. appointments
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  coach_id INT NOT NULL,
  appointment_time DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coach_id) REFERENCES users(id)
);
```

### 3. messages
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  sender_type ENUM('user', 'coach') NOT NULL,
  text TEXT NOT NULL,
  read_by_coach BOOLEAN DEFAULT FALSE,
  read_by_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);
```

### 4. coach_availability
```sql
CREATE TABLE coach_availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coach_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔧 Common Issues & Solutions

### 1. MySQL Index Errors
**Problem**: `CREATE INDEX IF NOT EXISTS` not supported
**Solution**: Run `node fix-database-indexes.js`

### 2. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: Check CORS_ORIGIN in backend .env

### 3. Authentication Issues
**Problem**: JWT token not working
**Solution**: Check JWT_SECRET in backend .env

### 4. Database Connection
**Problem**: Can't connect to database
**Solution**: Verify DATABASE_URL or individual DB_ parameters

### 5. Frontend API Calls
**Problem**: API calls failing
**Solution**: Check VITE_API_BASE_URL and proxy config

## 📱 Usage URLs

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **API Docs**: See appointment-api-guide.md

## 🎯 Test User Accounts

Create test accounts for testing:

```sql
-- Test User
INSERT INTO users (username, email, password, full_name, role, membership) 
VALUES ('testuser', 'user@test.com', '$2b$10$hash...', 'Test User', 'user', 'premium');

-- Test Coach
INSERT INTO users (username, email, password, full_name, role) 
VALUES ('testcoach', 'coach@test.com', '$2b$10$hash...', 'Test Coach', 'coach');
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_super_secure_production_secret
CORS_ORIGIN=https://your-domain.com
```

### Build Commands
```bash
# Frontend build
npm run build

# Start production server
cd server
npm start
```

---

**🎉 Your appointment system is ready to use!**
