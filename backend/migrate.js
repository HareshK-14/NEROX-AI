require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'nerox_ai',
    multipleStatements: true
  });

  console.log('Connected. Running RBAC migration...');

  // Step 1: Modify role enum
  try {
    await conn.query("ALTER TABLE users MODIFY COLUMN role ENUM('student','placement_officer','admin') NOT NULL DEFAULT 'student'");
    console.log('✅ users.role enum updated');
  } catch(e) { console.log('role enum already ok:', e.message); }

  // Step 2: placement_officers
  await conn.query(`CREATE TABLE IF NOT EXISTS placement_officers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100) DEFAULT 'Placement Officer',
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✅ placement_officers');

  // Step 3: companies
  await conn.query(`CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sector VARCHAR(100),
    logo_url TEXT,
    min_cgpa DECIMAL(3,2) DEFAULT 6.0,
    min_coding_score INT DEFAULT 50,
    required_skills JSON,
    package_lpa DECIMAL(6,2),
    drive_date DATE,
    status ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
    requirements_pdf TEXT,
    interview_pattern TEXT,
    coding_pattern TEXT,
    eligibility_criteria TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )`);
  console.log('✅ companies');

  // Step 4: placement_drives
  await conn.query(`CREATE TABLE IF NOT EXISTS placement_drives (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    drive_date DATE,
    venue VARCHAR(300),
    eligibility JSON,
    registered_count INT DEFAULT 0,
    status ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )`);
  console.log('✅ placement_drives');

  // Step 5: notifications
  await conn.query(`CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    sent_by VARCHAR(36),
    type ENUM('announcement','placement_drive','coding_contest','workshop','interview_schedule','general') DEFAULT 'general',
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    target_departments JSON,
    target_years JSON,
    priority ENUM('low','medium','high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
  )`);
  console.log('✅ notifications');

  // Step 6: notification_reads
  await conn.query(`CREATE TABLE IF NOT EXISTS notification_reads (
    id VARCHAR(36) PRIMARY KEY,
    notification_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_read (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✅ notification_reads');

  // Step 7: activity_logs
  await conn.query(`CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    role VARCHAR(50),
    action VARCHAR(200) NOT NULL,
    metadata JSON,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);
  console.log('✅ activity_logs');

  // Step 8: admin_settings
  await conn.query(`CREATE TABLE IF NOT EXISTS admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  await conn.query(`INSERT IGNORE INTO admin_settings (setting_key, setting_value) VALUES
    ('platform_name', 'NEROX AI'),
    ('allow_student_registration', 'true'),
    ('max_students_per_page', '25'),
    ('ai_enabled', 'true')`);
  console.log('✅ admin_settings');

  const [tables] = await conn.query('SHOW TABLES');
  console.log('\nAll tables in nerox_ai:');
  tables.forEach(t => console.log(' -', Object.values(t)[0]));
  await conn.end();
  console.log('\n✅ Migration complete!');
}
migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
