CREATE DATABASE IF NOT EXISTS nerox_ai;
USE nerox_ai;

-- ─── USERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── STUDENT PROFILES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  year INT,
  roll_number VARCHAR(50),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  bio TEXT,
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  placement_points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_login DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── SKILLS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  proficiency ENUM('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
  category VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── RESUMES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  parsed_text TEXT,
  ai_score INT DEFAULT 0,
  feedback TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CODING TESTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_tests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  test_type VARCHAR(100),
  language VARCHAR(50),
  difficulty VARCHAR(20),
  questions JSON,
  answers JSON,
  score INT,
  total_marks INT,
  percentage DECIMAL(5,2),
  feedback TEXT,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── APTITUDE / COMPANY TESTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aptitude_tests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  company VARCHAR(100),
  test_type ENUM('full','aptitude','coding','sql','technical','hr') DEFAULT 'full',
  sections JSON,
  answers JSON,
  score INT DEFAULT 0,
  total_marks INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  weak_areas JSON,
  suggestions JSON,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── QUIZ RESULTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subject VARCHAR(100),
  quiz_type VARCHAR(50),
  questions JSON,
  answers JSON,
  score INT,
  total_marks INT,
  percentage DECIMAL(5,2),
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── GD RESULTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gd_results (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  topic TEXT NOT NULL,
  student_response TEXT,
  communication_score INT DEFAULT 0,
  grammar_score INT DEFAULT 0,
  confidence_score INT DEFAULT 0,
  relevance_score INT DEFAULT 0,
  vocabulary_score INT DEFAULT 0,
  critical_thinking_score INT DEFAULT 0,
  overall_score INT DEFAULT 0,
  feedback TEXT,
  model_answer TEXT,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CODING EVALUATIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_evaluations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  language VARCHAR(50),
  original_code TEXT,
  quality_score INT DEFAULT 0,
  correctness_score INT DEFAULT 0,
  efficiency_score INT DEFAULT 0,
  style_score INT DEFAULT 0,
  time_complexity VARCHAR(50),
  space_complexity VARCHAR(50),
  optimized_code TEXT,
  issues_found JSON,
  practice_suggestions JSON,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── PLACEMENT ANALYTICS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS placement_analytics (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  coding_score INT DEFAULT 0,
  sql_score INT DEFAULT 0,
  communication_score INT DEFAULT 0,
  resume_score INT DEFAULT 0,
  aptitude_score INT DEFAULT 0,
  projects_score INT DEFAULT 0,
  gd_score INT DEFAULT 0,
  overall_score INT DEFAULT 0,
  placement_readiness INT DEFAULT 0,
  tests_taken INT DEFAULT 0,
  gd_sessions INT DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── COMPANY DETAILS CACHE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_details (
  id VARCHAR(36) PRIMARY KEY,
  company_name VARCHAR(255) UNIQUE NOT NULL,
  profile_data JSON,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── CAREER ROADMAPS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  goal VARCHAR(255),
  current_level VARCHAR(50) DEFAULT 'beginner',
  plan_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── SKILL GAP ANALYSES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_gap (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  target_role VARCHAR(255),
  gap_data JSON,
  estimated_weeks INT DEFAULT 0,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CHAT HISTORY ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  agent_name VARCHAR(100),
  module VARCHAR(100),
  user_message TEXT,
  ai_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── DAILY MISSIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_missions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  mission_date DATE NOT NULL,
  missions JSON,
  completed_missions JSON DEFAULT (JSON_ARRAY()),
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, mission_date)
);

-- ─── LEARNING PROGRESS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  module VARCHAR(100),
  topic VARCHAR(255),
  status ENUM('started','in_progress','completed') DEFAULT 'started',
  score INT,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  title VARCHAR(255),
  message TEXT,
  type ENUM('info','warning','success','event') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── PLACEMENT POINTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS placement_points (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  points INT DEFAULT 0,
  activity VARCHAR(255),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
