import { pool } from '../config/database.js';

/**
 * Tạo bảng packages nếu chưa tồn tại
 */
export const ensurePackagesTable = async () => {
  try {
    // Tạo bảng packages nếu chưa tồn tại
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS packages (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        price INT NOT NULL,
        period ENUM('tháng', 'năm') NOT NULL,
        popular BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tạo bảng package_features để lưu trữ tính năng của từng gói
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS package_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id VARCHAR(50) NOT NULL,
        feature_name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (package_id) REFERENCES packages(id),
        UNIQUE KEY unique_package_feature (package_id, feature_name)
      )
    `);
    
    console.log('✅ Packages tables created or already exist');
    
    // Kiểm tra xem đã có dữ liệu trong bảng packages chưa
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM packages');
    
    // Nếu chưa có dữ liệu, thêm dữ liệu mặc định
    if (rows[0].count === 0) {
      await insertDefaultPackages();
    }
  } catch (error) {
    console.error('❌ Error creating packages tables:', error);
    throw error;
  }
};

/**
 * Thêm các gói membership mặc định
 */
const insertDefaultPackages = async () => {
  try {
    // Thêm 3 gói mặc định: free, premium, pro
    await pool.execute(`
      INSERT INTO packages (id, name, description, price, period, popular) VALUES
      ('free', 'Free', 'Bắt đầu miễn phí', 0, 'tháng', FALSE),
      ('premium', 'Premium', 'Hỗ trợ toàn diện', 99000, 'tháng', TRUE),
      ('pro', 'Pro', 'Hỗ trợ toàn diện', 999000, 'năm', FALSE)
    `);
    
    // Thêm tính năng cho gói free
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      ('free', 'Theo dõi cai thuốc', TRUE),
      ('free', 'Lập kế hoạch cá nhân', TRUE),
      ('free', 'Huy hiệu & cộng đồng', FALSE),
      ('free', 'Chat huấn luyện viên', FALSE),
      ('free', 'Video call tư vấn', FALSE)
    `);
    
    // Thêm tính năng cho gói premium
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      ('premium', 'Theo dõi cai thuốc', TRUE),
      ('premium', 'Lập kế hoạch cá nhân', TRUE),
      ('premium', 'Huy hiệu & cộng đồng', TRUE),
      ('premium', 'Chat huấn luyện viên', TRUE),
      ('premium', 'Video call tư vấn', TRUE)
    `);
    
    // Thêm tính năng cho gói pro
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      ('pro', 'Theo dõi cai thuốc', TRUE),
      ('pro', 'Lập kế hoạch cá nhân', TRUE),
      ('pro', 'Huy hiệu & cộng đồng', TRUE),
      ('pro', 'Chat huấn luyện viên', TRUE),
      ('pro', 'Video call tư vấn', TRUE)
    `);
    
    console.log('✅ Default packages inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting default packages:', error);
    throw error;
  }
};

/**
 * Lấy tất cả các gói
 */
export const getAllPackages = async () => {
  try {
    const [packages] = await pool.execute(`
      SELECT * FROM packages WHERE active = TRUE ORDER BY price ASC
    `);
    
    // Lấy tính năng cho từng gói
    for (const pkg of packages) {
      const [features] = await pool.execute(`
        SELECT feature_name, enabled FROM package_features WHERE package_id = ? ORDER BY id ASC
      `, [pkg.id]);
      
      pkg.features = features.filter(f => f.enabled).map(f => f.feature_name);
      pkg.disabledFeatures = features.filter(f => !f.enabled).map(f => f.feature_name);
    }
    
    return packages;
  } catch (error) {
    console.error('❌ Error getting all packages:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một gói cụ thể theo ID
 */
export const getPackageById = async (packageId) => {
  try {
    const [packages] = await pool.execute(`
      SELECT * FROM packages WHERE id = ? AND active = TRUE
    `, [packageId]);
    
    if (packages.length === 0) {
      return null;
    }
    
    const package_data = packages[0];
    
    // Lấy tính năng cho gói
    const [features] = await pool.execute(`
      SELECT feature_name, enabled FROM package_features WHERE package_id = ? ORDER BY id ASC
    `, [packageId]);
    
    package_data.features = features.filter(f => f.enabled).map(f => f.feature_name);
    package_data.disabledFeatures = features.filter(f => !f.enabled).map(f => f.feature_name);
    
    return package_data;
  } catch (error) {
    console.error(`❌ Error getting package ${packageId}:`, error);
    throw error;
  }
};

export default {
  ensurePackagesTable,
  getAllPackages,
  getPackageById
};
