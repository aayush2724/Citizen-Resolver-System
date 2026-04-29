SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
  city VARCHAR(100),
  block VARCHAR(100),
  area_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  CONSTRAINT fk_user_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS areas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  zone VARCHAR(80),
  is_active BOOLEAN DEFAULT TRUE
);

SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE IF NOT EXISTS departments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  lead_user_id BIGINT,
  FOREIGN KEY (lead_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS labour (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  department_id BIGINT NOT NULL,
  availability_status ENUM('Available', 'On Task', 'Inactive') DEFAULT 'Available',
  INDEX idx_labour_department (department_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS issues (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  citizen_id BIGINT NOT NULL,
  area_id BIGINT NOT NULL,
  department_id BIGINT,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  status ENUM('Pending', 'Assigned', 'In Progress', 'Resolved') DEFAULT 'Pending',
  priority ENUM('Normal', 'High', 'Urgent') DEFAULT 'Normal',
  sla_hours INT DEFAULT 72,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_issues_status (status),
  INDEX idx_issues_area_status (area_id, status),
  INDEX idx_issues_department (department_id),
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS issue_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  issue_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  labour_id BIGINT,
  assigned_by BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  INDEX idx_assignments_issue (issue_id),
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (labour_id) REFERENCES labour(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  issue_id BIGINT NOT NULL UNIQUE,
  citizen_id BIGINT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  issue_id BIGINT,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (user_id, read_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Insert dummy data
INSERT IGNORE INTO areas (name, zone) VALUES ('Stage 1', 'Zone A'), ('Stage 2', 'Zone A'), ('Central Ward', 'Zone B');

INSERT IGNORE INTO departments (name) VALUES 
('Roads'), 
('Sanitation'), 
('Water Supply'), 
('Street Lights'), 
('Drainage'),
('Public Parks');

INSERT IGNORE INTO labour (name, phone, department_id, availability_status) VALUES 
('Ramesh Kumar', '9876543210', 2, 'Available'),
('Imran Ali', '9876543211', 4, 'On Task'),
('Sonal Patil', '9876543212', 1, 'Available'),
('Deepak Das', '9876543213', 5, 'On Task'),
('Maya Singh', '9876543214', 3, 'Available');

INSERT IGNORE INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@helpline.local', '$2b$10$JlCAjLFBLlnS/KAtflYzEO6fhboV9NAQhhHawYr0jICRKIe/hUKC6', 'admin'); -- password: password
INSERT IGNORE INTO users (name, email, password_hash, role, area_id) VALUES ('Aarav Sharma', 'aarav@example.com', '$2b$10$EP/D2.K.OtkK.oP1iI/0.e8sB0LhX1JjN2W5S2l2b1q7Y0/q3U/yW', 'citizen', 1); -- password: password
