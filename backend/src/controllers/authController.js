import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import emailService from '../services/emailService.js';

// Auto-create tables if they don't exist (for Railway deployment)
const ensureTablesExist = async () => {
    try {
        // Create pending_registrations table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS pending_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
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

        // Create email_verifications table  
        await pool.execute(`
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
        `);        // Create smoker table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS smoker (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                date_of_birth DATE,
                gender ENUM('male', 'female', 'other'),
                cigarettes_per_day INT DEFAULT 10,
                cost_per_pack DECIMAL(10,2) DEFAULT 25000.00,
                cigarettes_per_pack INT DEFAULT 20,
                membership_type ENUM('free', 'premium') DEFAULT 'free',
                membership_expires_at DATETIME NULL,
                quit_date DATE,
                email_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_username (username)
            )
        `);
        // Add missing columns if they don't exist (for existing databases)
        try {
            await pool.execute(`
                ALTER TABLE smoker 
                ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
            `);
        } catch (error) {
            // Ignore column exists errors
        }

        try {
            await pool.execute(`
                ALTER TABLE smoker 
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
            `);
        } catch (error) {
            // Ignore column exists errors            }
        }

        // Create smokingstatus table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS smokingstatus (
                id INT AUTO_INCREMENT PRIMARY KEY,
                smoker_id INT NOT NULL,
                current_streak_days INT DEFAULT 0,
                longest_streak_days INT DEFAULT 0,
                total_days_quit INT DEFAULT 0,
                total_cigarettes_avoided INT DEFAULT 0,
                money_saved DECIMAL(10,2) DEFAULT 0.00,
                current_status ENUM('smoking', 'quitting', 'quit') DEFAULT 'smoking',
                health_score INT DEFAULT 0,
                last_smoke_date DATE NULL,
                quit_attempts INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
                UNIQUE KEY unique_smoker (smoker_id)
            )
        `); console.log('✅ Database tables ensured');
    } catch (error) {
        console.error('❌ Error ensuring tables exist:', error);
    }
};

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
};

// Format user data for response (remove sensitive info)
const formatUserResponse = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        membershipType: user.membership_type,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};

// Register User - Step 1: Send verification code
export const register = async (req, res) => {
    try {
        // Ensure required tables exist (for Railway deployment)
        await ensureTablesExist();
        const {
            username,
            email,
            password,
            fullName,
            phone,
            dateOfBirth,
            gender,
            cigarettesPerDay,
            costPerPack,
            cigarettesPerPack
        } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM smoker WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return sendError(res, 'User with this email or username already exists', 409);
        }

        // Check if user already exists in pending registrations
        const [pendingUsers] = await pool.execute(
            'SELECT id FROM pending_registrations WHERE email = ? OR username = ?',
            [email, username]
        );        // Generate verification code and expiry time
        const verificationCode = emailService.generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        if (pendingUsers.length > 0) {
            // Update existing pending registration
            await pool.execute(
                `UPDATE pending_registrations 
                 SET username = ?, password_hash = ?, full_name = ?, phone = ?, 
                     date_of_birth = ?, gender = ?, verification_code = ?, expires_at = ?, created_at = NOW()
                 WHERE email = ?`,
                [username, await bcrypt.hash(password, 12), fullName, phone || null,
                    dateOfBirth || null, gender || null, verificationCode, expiresAt, email]
            );
        } else {
            // Create new pending registration
            const hashedPassword = await bcrypt.hash(password, 12);
            await pool.execute(
                `INSERT INTO pending_registrations 
                 (username, email, password_hash, full_name, phone, date_of_birth, gender, verification_code, expires_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, fullName, phone || null,
                    dateOfBirth || null, gender || null, verificationCode, expiresAt]
            );
        }        // Try to send verification email (don't fail registration if email fails)
        try {
            await emailService.sendVerificationEmail(email, fullName, verificationCode);
            console.log(`📧 Email sent to ${email}`);
        } catch (emailError) {
            console.log(`⚠️  Development mode - Code: ${verificationCode}`);
        }

        sendSuccess(res, 'Verification code sent to your email. Please check your inbox.', {
            email: email,
            message: 'Please enter the 6-digit code sent to your email',
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined // Only show in dev mode
        }, 200);

    } catch (error) {
        console.error('Register error:', error);
        sendError(res, 'Registration failed. Please try again.', 500);
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const [users] = await pool.execute(
            `SELECT id, username, email, password_hash, full_name, phone, date_of_birth, 
                    gender, membership_type, avatar_url, is_active, created_at, updated_at 
             FROM smoker 
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return sendError(res, 'Account is deactivated. Please contact support.', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return sendError(res, 'Invalid email or password', 401);
        }

        // Get smoking status
        const [statusResult] = await pool.execute(
            `SELECT current_streak_days, longest_streak_days, total_days_quit, 
                    total_cigarettes_avoided, money_saved, current_status, health_score 
             FROM smokingstatus 
             WHERE smoker_id = ?`,
            [user.id]
        );

        const smokingStatus = statusResult[0] || {};

        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Update last login
        await pool.execute(
            'UPDATE smoker SET updated_at = NOW() WHERE id = ?',
            [user.id]
        );

        sendSuccess(res, 'Login successful', {
            user: {
                ...formatUserResponse(user),
                smokingStatus: {
                    currentStreakDays: smokingStatus.current_streak_days || 0,
                    longestStreakDays: smokingStatus.longest_streak_days || 0,
                    totalDaysQuit: smokingStatus.total_days_quit || 0,
                    totalCigarettesAvoided: smokingStatus.total_cigarettes_avoided || 0,
                    moneySaved: smokingStatus.money_saved || 0,
                    currentStatus: smokingStatus.current_status || 'smoking',
                    healthScore: smokingStatus.health_score || 0
                }
            },
            token,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 'Login failed. Please try again.', 500);
    }
};

// Get User Profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user with smoking status
        const [result] = await pool.execute(
            `SELECT 
                s.id, s.username, s.email, s.full_name, s.phone, s.date_of_birth, 
                s.gender, s.membership_type, s.avatar_url, s.created_at, s.updated_at,
                ss.current_streak_days, ss.longest_streak_days, ss.total_days_quit, 
                ss.total_cigarettes_avoided, ss.money_saved, ss.current_status, ss.health_score
             FROM smoker s
             LEFT JOIN smokingstatus ss ON s.id = ss.smoker_id
             WHERE s.id = ? AND s.is_active = true`,
            [userId]
        );

        if (result.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        const user = result[0];

        sendSuccess(res, 'Profile retrieved successfully', {
            user: {
                ...formatUserResponse(user),
                smokingStatus: {
                    currentStreakDays: user.current_streak_days || 0,
                    longestStreakDays: user.longest_streak_days || 0,
                    totalDaysQuit: user.total_days_quit || 0,
                    totalCigarettesAvoided: user.total_cigarettes_avoided || 0,
                    moneySaved: user.money_saved || 0,
                    currentStatus: user.current_status || 'smoking',
                    healthScore: user.health_score || 0
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        sendError(res, 'Failed to retrieve profile', 500);
    }
};

// Update Profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, dateOfBirth, gender, avatarUrl } = req.body;

        // Update user profile
        await pool.execute(
            `UPDATE smoker 
             SET full_name = ?, phone = ?, date_of_birth = ?, gender = ?, avatar_url = ?, updated_at = NOW() 
             WHERE id = ?`,
            [fullName, phone || null, dateOfBirth || null, gender || null, avatarUrl || null, userId]
        );

        // Get updated user data
        const [users] = await pool.execute(
            `SELECT id, username, email, full_name, phone, date_of_birth, gender, 
                    membership_type, avatar_url, created_at, updated_at 
             FROM smoker 
             WHERE id = ?`,
            [userId]
        );

        const user = users[0];

        sendSuccess(res, 'Profile updated successfully', {
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Update profile error:', error);
        sendError(res, 'Failed to update profile', 500);
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Get current password hash
        const [users] = await pool.execute(
            'SELECT password_hash FROM smoker WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isCurrentPasswordValid) {
            return sendError(res, 'Current password is incorrect', 401);
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.execute(
            'UPDATE smoker SET password_hash = ?, updated_at = NOW() WHERE id = ?',
            [hashedNewPassword, userId]
        );

        sendSuccess(res, 'Password changed successfully');

    } catch (error) {
        console.error('Change password error:', error);
        sendError(res, 'Failed to change password', 500);
    }
};

// Logout (Can be used for token blacklisting in the future)
export const logout = async (req, res) => {
    try {
        // In a production app, you might want to:
        // 1. Blacklist the token
        // 2. Clear refresh tokens from database
        // 3. Log the logout event

        sendSuccess(res, 'Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        sendError(res, 'Logout failed', 500);
    }
};

// Refresh Token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return sendError(res, 'Refresh token is required', 401);
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return sendError(res, 'Invalid refresh token', 401);
        }

        // Check if user still exists
        const [users] = await pool.execute(
            'SELECT id FROM smoker WHERE id = ? AND is_active = true',
            [decoded.userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 401);
        }

        const newToken = generateToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        sendSuccess(res, 'Token refreshed successfully', {
            token: newToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return sendError(res, 'Invalid or expired refresh token', 401);
        }
        console.error('Refresh token error:', error);
        sendError(res, 'Failed to refresh token', 500);
    }
};

// Verify Email and Complete Registration
export const verifyEmail = async (req, res) => {
    try {
        // Ensure required tables exist (for Railway deployment)
        await ensureTablesExist();

        const { email, verificationCode } = req.body; console.log(`� Email verification request: ${email}`);

        // Kiểm tra trực tiếp trong database để debug
        const [verificationRecords] = await pool.execute(
            'SELECT * FROM email_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 5',
            [email]
        );

        if (verificationRecords.length > 0) {
            console.log(`📊 Found ${verificationRecords.length} verification records`);
            const latestRecord = verificationRecords[0];
            const isExpired = new Date(latestRecord.expires_at) < new Date();
            const isCodeMatch = latestRecord.verification_code === verificationCode;

            console.log(`🔍 Latest code: ${latestRecord.verification_code} | Input: ${verificationCode} | Match: ${isCodeMatch ? '✅' : '❌'}`);
            console.log(`⏰ Expires: ${new Date(latestRecord.expires_at).toLocaleTimeString()} | Expired: ${isExpired ? '❌' : '✅'}`);
        } else {
            console.log(`❌ No verification records found for ${email}`);
        } try {
            // Verify the code
            const isValidCode = await emailService.verifyCode(email, verificationCode);
            if (!isValidCode) {
                console.log(`❌ Invalid verification code for ${email}`);
                return sendError(res, 'Mã xác thực không hợp lệ hoặc đã hết hạn', 400);
            }

            console.log(`✅ Code verified successfully for ${email}`);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError.message);
            return sendError(res, 'Lỗi khi xác thực mã. Vui lòng thử lại.', 400);
        }

        // Get pending registration data
        const [pendingUsers] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ?',
            [email]
        ); if (pendingUsers.length === 0) {
            console.log(`❌ No pending registration found for ${email}`);
            return sendError(res, 'Không tìm thấy đăng ký chờ xác nhận với email này', 404);
        }

        console.log(`✅ Creating user account for ${email}`);
        const pendingUser = pendingUsers[0];

        // Start transaction to create actual user
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {            // Insert new user into smoker table
            const [result] = await connection.execute(
                `INSERT INTO smoker (username, email, password_hash, full_name, phone, date_of_birth, gender, membership_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'free')`,
                [pendingUser.username, pendingUser.email, pendingUser.password_hash,
                pendingUser.full_name, pendingUser.phone, pendingUser.date_of_birth,
                pendingUser.gender]
            );

            const userId = result.insertId;

            // Create smoking status record
            await connection.execute(
                'INSERT INTO smokingstatus (smoker_id) VALUES (?)',
                [userId]
            );

            // Delete from pending registrations
            await connection.execute(
                'DELETE FROM pending_registrations WHERE email = ?',
                [email]
            );            // Commit transaction
            await connection.commit();

            // Delete verification code
            await emailService.deleteVerificationCode(email);

            // Get created user (without password)
            const [users] = await pool.execute(
                `SELECT id, username, email, full_name, phone, date_of_birth, gender, 
                        membership_type, avatar_url, created_at, updated_at 
                 FROM smoker 
                 WHERE id = ?`,
                [userId]
            );

            const user = users[0];
            const token = generateToken(userId);
            const refreshToken = generateRefreshToken(userId);            // Send welcome email
            try {
                await emailService.sendWelcomeEmail(email, pendingUser.full_name);
                console.log(`🎉 Account created successfully for ${pendingUser.username}`);
            } catch (emailError) {
                console.log(`🎉 Account created for ${pendingUser.username} (welcome email failed)`);
            }

            sendSuccess(res, 'Email verified successfully! Account created.', {
                user: formatUserResponse(user),
                token,
                refreshToken
            }, 201);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Email verification failed:', error.message);
        // Cải thiện thông báo lỗi với thông tin chi tiết hơn
        const errorMessage =
            error.code === 'ER_DUP_ENTRY' ? 'Email hoặc tên đăng nhập đã tồn tại.' :
                error.message || 'Xác thực email thất bại. Vui lòng thử lại.';

        sendError(res, errorMessage, 500);
    }
};

// Resend Verification Code
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if pending registration exists
        const [pendingUsers] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ?',
            [email]
        );

        if (pendingUsers.length === 0) {
            return sendError(res, 'No pending registration found for this email', 404);
        }

        const pendingUser = pendingUsers[0];        // Generate and send new verification code
        const verificationCode = emailService.generateVerificationCode();
        await emailService.sendVerificationEmail(email, pendingUser.full_name, verificationCode);

        sendSuccess(res, 'New verification code sent to your email', {
            email: email
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        sendError(res, 'Failed to resend verification code', 500);
    }
};

ensureTablesExist();
