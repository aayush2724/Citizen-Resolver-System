# Citizen Helpline Portal Frontend

A React + Vite + Tailwind CSS frontend for a civic issue reporting platform. Citizens can submit issues, track progress, view public reports, and receive notifications. Admins can assign departments/labour, change status, manage master data, and review analytics.

This is frontend-only for now. Data is stored in `localStorage` through a mock API adapter so the app behaves like a real product before the Node/Express/MySQL backend is connected.

## Tech Stack

- React with Vite
- Tailwind CSS
- Local mock API layer
- Component-based UI
- Backend-ready data contracts for JWT auth, issue CRUD, assignments, notifications, and master data

## Folder Structure

```text
.
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── src
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components
    │   ├── IssueCard.jsx
    │   ├── IssueModal.jsx
    │   ├── Shell.jsx
    │   └── StatCard.jsx
    ├── data
    │   └── mockData.js
    ├── services
    │   └── api.js
    └── utils
        └── status.js
```

## Pages

- Home
- Login / Signup
- Report Issue
- My Issues
- Public Issues with filters
- Admin Dashboard

## Backend API Shape

The frontend currently calls `src/services/api.js`. Replace those methods with real HTTP calls later:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/issues`
- `POST /api/issues`
- `PATCH /api/issues/:id`
- `POST /api/issues/:id/assignments`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `GET /api/areas`
- `GET /api/departments`
- `GET /api/labour`
- `POST /api/areas`
- `POST /api/departments`
- `POST /api/labour`

## MySQL Schema Preview

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
  area_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  FOREIGN KEY (area_id) REFERENCES areas(id)
);

CREATE TABLE areas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  zone VARCHAR(80),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE departments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  lead_user_id BIGINT,
  FOREIGN KEY (lead_user_id) REFERENCES users(id)
);

CREATE TABLE labour (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  department_id BIGINT NOT NULL,
  availability_status ENUM('Available', 'On Task', 'Inactive') DEFAULT 'Available',
  INDEX idx_labour_department (department_id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE issues (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  citizen_id BIGINT NOT NULL,
  area_id BIGINT NOT NULL,
  department_id BIGINT,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  status ENUM('Pending', 'Assigned', 'In Progress', 'Resolved') DEFAULT 'Pending',
  priority ENUM('Normal', 'High', 'Urgent') DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_issues_status (status),
  INDEX idx_issues_area_status (area_id, status),
  INDEX idx_issues_department (department_id),
  FOREIGN KEY (citizen_id) REFERENCES users(id),
  FOREIGN KEY (area_id) REFERENCES areas(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE issue_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  issue_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  labour_id BIGINT,
  assigned_by BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assignments_issue (issue_id),
  FOREIGN KEY (issue_id) REFERENCES issues(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (labour_id) REFERENCES labour(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  issue_id BIGINT NOT NULL UNIQUE,
  citizen_id BIGINT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id),
  FOREIGN KEY (citizen_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  issue_id BIGINT,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (user_id, read_at),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (issue_id) REFERENCES issues(id)
);
```

## Setup

```bash
npm install
npm run dev
```

Then open the local Vite URL printed in the terminal.

## Demo Accounts

- Citizen: `aarav@example.com`
- Admin: `admin@helpline.local`

The login form accepts either demo address and switches the active user in local storage.
