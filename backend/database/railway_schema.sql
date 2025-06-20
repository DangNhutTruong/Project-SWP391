-- NoSmoke Database Schema for Railway MySQL
-- Run this script in DBeaver connected to your Railway database

-- Set timezone and charset
SET time_zone = '+00:00';
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- Core Tables
-- =============================================

-- Users table (smokers)
CREATE TABLE IF NOT EXISTS smoker (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    membership_type ENUM('free', 'premium', 'vip') DEFAULT 'free',
    avatar_url VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_membership (membership_type),
    INDEX idx_email_verified (email_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Smoking status tracking
CREATE TABLE IF NOT EXISTS smokingstatus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    total_days_quit INT DEFAULT 0,
    total_cigarettes_avoided INT DEFAULT 0,
    money_saved DECIMAL(10, 2) DEFAULT 0.00,
    current_status ENUM('smoking', 'quitting', 'quit') DEFAULT 'smoking',
    health_score INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_status (current_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Email Verification Tables
-- =============================================

-- Pending registrations (before email verification)
CREATE TABLE IF NOT EXISTS pending_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification codes
CREATE TABLE IF NOT EXISTS email_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_email (email),
    INDEX idx_code (verification_code),
    INDEX idx_expired (expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Coaches and Appointments
-- =============================================

-- Coaches table
CREATE TABLE IF NOT EXISTS coach (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    specialization TEXT,
    bio TEXT,
    avatar_url VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    experience_years INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_rating (rating),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    coach_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    duration INT DEFAULT 60, -- minutes
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    type ENUM('consultation', 'follow_up', 'emergency') DEFAULT 'consultation',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES coach(id) ON DELETE CASCADE,
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_coach_id (coach_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Plans and Progress
-- =============================================

-- Quit smoking plans
CREATE TABLE IF NOT EXISTS quitsmokingplan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    target_cigarettes_per_day INT DEFAULT 0,
    current_cigarettes_per_day INT NOT NULL,
    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
    strategies JSON, -- Store array of strategies
    milestones JSON, -- Store milestone data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily progress tracking
CREATE TABLE IF NOT EXISTS progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    plan_id INT,
    date DATE NOT NULL,
    cigarettes_smoked INT DEFAULT 0,
    target_cigarettes INT DEFAULT 0,
    mood ENUM('very_bad', 'bad', 'neutral', 'good', 'very_good'),
    cravings_intensity INT DEFAULT 0, -- 1-10 scale
    notes TEXT,
    symptoms JSON, -- Store withdrawal symptoms
    activities JSON, -- Store activities done instead of smoking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES quitsmokingplan(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_date (smoker_id, date),
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Community and Achievements
-- =============================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    badge_color VARCHAR(7), -- hex color
    criteria JSON, -- Criteria to unlock achievement
    points INT DEFAULT 0,
    category ENUM('streak', 'savings', 'health', 'community', 'milestone') DEFAULT 'milestone',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (smoker_id, achievement_id),
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_achievement_id (achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Community posts
CREATE TABLE IF NOT EXISTS community_post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('success_story', 'tip', 'question', 'motivation', 'general') DEFAULT 'general',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_category (category),
    INDEX idx_created (created_at),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT, -- Can be coach or admin
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    category VARCHAR(50),
    tags JSON,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    views_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_author (author_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Package and Subscription
-- =============================================

-- Membership packages
CREATE TABLE IF NOT EXISTS package (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL, -- Duration in days
    features JSON, -- Store feature list
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Feedback and Reviews
-- =============================================

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    smoker_id INT NOT NULL,
    coach_id INT,
    appointment_id INT,
    type ENUM('coach_review', 'app_feedback', 'appointment_feedback') DEFAULT 'app_feedback',
    rating INT, -- 1-5 stars
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (smoker_id) REFERENCES smoker(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES coach(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE,
    INDEX idx_smoker_id (smoker_id),
    INDEX idx_coach_id (coach_id),
    INDEX idx_type (type),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Sample Data for Testing
-- =============================================

-- Insert sample coaches
INSERT INTO coach (name, email, specialization, bio, experience_years, rating, total_reviews) VALUES
('Dr. Nguyễn Văn A', 'coach1@nosmoke.com', 'Tâm lý học, Cai nghiện thuốc lá', 'Chuyên gia tâm lý với 10 năm kinh nghiệm giúp người cai thuốc lá', 10, 4.8, 150),
('BS. Trần Thị B', 'coach2@nosmoke.com', 'Y học gia đình, Phòng chống tệ nạn xã hội', 'Bác sĩ gia đình chuyên về tư vấn sức khỏe và cai nghiện', 8, 4.9, 200),
('ThS. Lê Minh C', 'coach3@nosmoke.com', 'Dinh dưỡng, Lối sống lành mạnh', 'Chuyên gia dinh dưỡng giúp xây dựng lối sống khỏe mạnh', 6, 4.7, 80)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample achievements
INSERT INTO achievement (name, description, icon, badge_color, category, points) VALUES
('Ngày đầu tiên', 'Hoàn thành ngày đầu tiên không hút thuốc', '🎯', '#4CAF50', 'streak', 10),
('Tuần lễ đầu tiên', 'Hoàn thành 7 ngày không hút thuốc', '📅', '#2196F3', 'streak', 50),
('Tháng đầu tiên', 'Hoàn thành 30 ngày không hút thuốc', '🏆', '#FF9800', 'streak', 200),
('Tiết kiệm 100k', 'Tiết kiệm được 100,000 VNĐ từ việc bỏ thuốc', '💰', '#9C27B0', 'savings', 30),
('Chia sẻ đầu tiên', 'Chia sẻ câu chuyện đầu tiên với cộng đồng', '📝', '#607D8B', 'community', 20)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample packages
INSERT INTO package (name, description, price, duration_days, features) VALUES
('Gói Cơ Bản', 'Truy cập các tính năng cơ bản của ứng dụng', 0.00, 0, '["Theo dõi tiến độ", "Tính toán tiết kiệm", "Cộng đồng cơ bản"]'),
('Gói Premium', 'Truy cập đầy đủ tính năng và tư vấn chuyên gia', 299000.00, 30, '["Tất cả tính năng cơ bản", "Tư vấn với coach", "Kế hoạch cá nhân hóa", "Hỗ trợ 24/7"]'),
('Gói VIP', 'Gói dịch vụ cao cấp với mentor cá nhân', 599000.00, 30, '["Tất cả tính năng Premium", "Mentor cá nhân", "Buổi tư vấn 1-1", "Báo cáo chi tiết", "Ưu tiên hỗ trợ"]')
ON DUPLICATE KEY UPDATE name=VALUES(name);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Views for easier data access
-- =============================================

-- User summary view
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    s.id,
    s.username,
    s.email,
    s.full_name,
    s.membership_type,
    s.email_verified,
    s.created_at,
    ss.current_streak_days,
    ss.longest_streak_days,
    ss.total_days_quit,
    ss.money_saved,
    ss.current_status,
    COUNT(ua.id) as total_achievements
FROM smoker s
LEFT JOIN smokingstatus ss ON s.id = ss.smoker_id
LEFT JOIN user_achievement ua ON s.id = ua.smoker_id
WHERE s.is_active = TRUE
GROUP BY s.id;

-- Success completion
SELECT 'Database schema created successfully! ✅' as status;
