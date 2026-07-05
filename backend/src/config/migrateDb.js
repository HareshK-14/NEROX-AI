const migrateDb = async (pool) => {
  console.log('🔄 Checking database tables and running migrations...');
  let conn;
  try {
    conn = await pool.getConnection();

    // Step 1: Modify role enum on users table
    try {
      await conn.query("ALTER TABLE users MODIFY COLUMN role ENUM('student','placement_officer','admin') NOT NULL DEFAULT 'student'");
      console.log('✅ users.role enum updated');
    } catch(e) { 
      // If table users doesn't exist yet, it's fine, we will create it next
    }

    // Step 2: base users table (in case it does not exist)
    await conn.query(`CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('student','placement_officer','admin') NOT NULL DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Step 3: student_profiles (in case it does not exist)
    await conn.query(`CREATE TABLE IF NOT EXISTS student_profiles (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      name VARCHAR(200) NOT NULL,
      department VARCHAR(100),
      year INT,
      roll_number VARCHAR(50),
      phone VARCHAR(20),
      placement_points INT DEFAULT 0,
      streak_days INT DEFAULT 0,
      last_login DATE,
      avatar_url TEXT,
      bio TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 4: placement_analytics
    await conn.query(`CREATE TABLE IF NOT EXISTS placement_analytics (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      coding_score INT DEFAULT 0,
      sql_score INT DEFAULT 0,
      communication_score INT DEFAULT 0,
      resume_score INT DEFAULT 0,
      aptitude_score INT DEFAULT 0,
      projects_score INT DEFAULT 0,
      overall_score INT DEFAULT 0,
      placement_readiness INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 5: daily_missions
    await conn.query(`CREATE TABLE IF NOT EXISTS daily_missions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      mission_date DATE NOT NULL,
      missions JSON,
      completed_missions JSON,
      points_earned INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 6: placement_officers
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

    // Step 7: companies
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

    // Step 8: placement_drives
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

    // Step 9: notifications
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

    // Step 10: notification_reads
    await conn.query(`CREATE TABLE IF NOT EXISTS notification_reads (
      id VARCHAR(36) PRIMARY KEY,
      notification_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_read (notification_id, user_id),
      FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 11: activity_logs
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

    // Step 12: admin_settings
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

    // Step 13: skills table (needed for profiles)
    await conn.query(`CREATE TABLE IF NOT EXISTS skills (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      skill_name VARCHAR(100) NOT NULL,
      proficiency ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 14: quiz_results
    await conn.query(`CREATE TABLE IF NOT EXISTS quiz_results (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      topic VARCHAR(200) NOT NULL,
      score INT NOT NULL,
      total_questions INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 15: coding_tests
    await conn.query(`CREATE TABLE IF NOT EXISTS coding_tests (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      test_title VARCHAR(200),
      score INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Step 16: resumes
    await conn.query(`CREATE TABLE IF NOT EXISTS resumes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      resume_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    console.log('✅ Database migration ran successfully on startup!');
  } catch (err) {
    console.error('❌ Database migration failed on startup:', err.message);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = migrateDb;
