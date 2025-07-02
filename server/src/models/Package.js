import { pool } from '../config/database.js';

/**
 * Tạo bảng package nếu chưa tồn tại
 */
export const ensurePackageTable = async () => {
  try {
    // Tạo bảng package nếu chưa tồn tại
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS package (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        package_id INT NOT NULL,
        feature_name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (package_id) REFERENCES package(id),
        UNIQUE KEY unique_package_feature (package_id, feature_name)
      )
    `);
    
    console.log('✅ Packages tables created or already exist');
    
    // Kiểm tra xem đã có dữ liệu trong bảng package chưa
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM package');
    
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
      INSERT INTO package (name, description, price, period, popular) VALUES
      ('Free', 'Bắt đầu miễn phí', 0, 'tháng', FALSE),
      ('Premium', 'Hỗ trợ toàn diện', 99000, 'tháng', TRUE),
      ('Pro', 'Hỗ trợ toàn diện', 999000, 'năm', FALSE)
    `);
    
    // Lấy ID của các gói vừa thêm
    const [freePackage] = await pool.execute('SELECT id FROM package WHERE name = ? LIMIT 1', ['Free']);
    const [premiumPackage] = await pool.execute('SELECT id FROM package WHERE name = ? LIMIT 1', ['Premium']);
    const [proPackage] = await pool.execute('SELECT id FROM package WHERE name = ? LIMIT 1', ['Pro']);
    
    const freeId = freePackage[0].id;
    const premiumId = premiumPackage[0].id;
    const proId = proPackage[0].id;
    
    // Thêm tính năng cho gói free
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      (?, 'Theo dõi cai thuốc', TRUE),
      (?, 'Lập kế hoạch cá nhân', TRUE),
      (?, 'Huy hiệu & cộng đồng', FALSE),
      (?, 'Chat huấn luyện viên', FALSE),
      (?, 'Video call tư vấn', FALSE)
    `, [freeId, freeId, freeId, freeId, freeId]);
    
    // Thêm tính năng cho gói premium
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      (?, 'Theo dõi cai thuốc', TRUE),
      (?, 'Lập kế hoạch cá nhân', TRUE),
      (?, 'Huy hiệu & cộng đồng', TRUE),
      (?, 'Chat huấn luyện viên', TRUE),
      (?, 'Video call tư vấn', TRUE)
    `, [premiumId, premiumId, premiumId, premiumId, premiumId]);
    
    // Thêm tính năng cho gói pro
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      (?, 'Theo dõi cai thuốc', TRUE),
      (?, 'Lập kế hoạch cá nhân', TRUE),
      (?, 'Huy hiệu & cộng đồng', TRUE),
      (?, 'Chat huấn luyện viên', TRUE),
      (?, 'Video call tư vấn', TRUE)
    `, [proId, proId, proId, proId, proId]);
    
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
    // Sử dụng điều kiện phù hợp với cách lưu trữ boolean trong MySQL
    const [packages] = await pool.execute(`
      SELECT * FROM package WHERE active = 1 OR active IS NULL ORDER BY price ASC
    `);
    
    console.log('Found packages:', packages.map(p => p.name));
    
    // Lấy tính năng cho từng gói
    for (const pkg of packages) {
      try {
        const [features] = await pool.execute(`
          SELECT feature_name, enabled FROM package_features WHERE package_id = ? ORDER BY id ASC
        `, [pkg.id]);
        
        console.log(`Package ${pkg.name} (ID: ${pkg.id}) - Raw features:`, features);
        
        // Chuyển đổi Boolean để đảm bảo hoạt động đúng
        pkg.features = features.filter(f => f.enabled == 1).map(f => f.feature_name);
        pkg.disabledFeatures = features.filter(f => f.enabled == 0).map(f => f.feature_name);
        
        console.log(`Package ${pkg.name} - Features:`, pkg.features);
        console.log(`Package ${pkg.name} - Disabled features:`, pkg.disabledFeatures);
      } catch (featureError) {
        console.error(`Error getting features for package ${pkg.id}:`, featureError);
        pkg.features = [];
        pkg.disabledFeatures = [];
      }
    }
    
    return packages;
  } catch (error) {
    console.error('❌ Error getting all packages:', error);
    throw new Error('Failed to retrieve packages: ' + error.message);
  }
};

/**
 * Lấy chi tiết một gói cụ thể theo ID
 */
export const getPackageById = async (packageId) => {
  try {
    const [packages] = await pool.execute(`
      SELECT * FROM package WHERE id = ? AND (active = 1 OR active IS NULL)
    `, [packageId]);
    
    if (packages.length === 0) {
      return null;
    }
    
    const package_data = packages[0];
    
    // Lấy tính năng cho gói
    const [features] = await pool.execute(`
      SELECT feature_name, enabled FROM package_features WHERE package_id = ? ORDER BY id ASC
    `, [packageId]);
    
    // Chuyển đổi Boolean để đảm bảo hoạt động đúng
    package_data.features = features.filter(f => f.enabled == 1).map(f => f.feature_name);
    package_data.disabledFeatures = features.filter(f => f.enabled == 0).map(f => f.feature_name);
    
    return package_data;
  } catch (error) {
    console.error(`❌ Error getting package ${packageId}:`, error);
    throw new Error(`Failed to retrieve package ${packageId}: ${error.message}`);
  }
};

export default {
  ensurePackageTable,
  getAllPackages,
  getPackageById
};
