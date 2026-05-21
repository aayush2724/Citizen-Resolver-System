import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, "../../data");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "civicresolve.db");

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = `
CREATE TABLE IF NOT EXISTS areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  zone TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK(role IN ('citizen', 'admin')),
  city TEXT,
  block TEXT,
  area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  lead_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS labour (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  availability_status TEXT DEFAULT 'Available' CHECK(availability_status IN ('Available', 'On Task', 'Inactive'))
);

CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Assigned', 'In Progress', 'Resolved')),
  priority TEXT DEFAULT 'Normal' CHECK(priority IN ('Normal', 'High', 'Urgent')),
  sla_hours INTEGER DEFAULT 72,
  lat REAL,
  lng REAL,
  ai_department TEXT,
  ai_confidence INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  labour_id INTEGER REFERENCES labour(id) ON DELETE SET NULL,
  assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  note TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER NOT NULL UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
  citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bug_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'general' CHECK(category IN ('bug', 'ui', 'performance', 'feature', 'general')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'reviewed', 'resolved')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(schema);
console.log("✅ Schema created successfully");

// Seed data
const insertArea = db.prepare("INSERT OR IGNORE INTO areas (name, zone) VALUES (?, ?)");
[["Stage 1", "Zone A"], ["Stage 2", "Zone A"], ["Central Ward", "Zone B"]].forEach(([name, zone]) =>
  insertArea.run(name, zone)
);

const insertDept = db.prepare("INSERT OR IGNORE INTO departments (name) VALUES (?)");
["Roads", "Sanitation", "Water Supply", "Street Lights", "Drainage", "Public Parks"].forEach(name =>
  insertDept.run(name)
);

const area1 = db.prepare("SELECT id FROM areas WHERE name = 'Stage 1'").get();

const insertLabour = db.prepare(
  "INSERT OR IGNORE INTO labour (name, phone, department_id, availability_status) VALUES (?, ?, ?, ?)"
);
const dept = (name) => db.prepare("SELECT id FROM departments WHERE name = ?").get(name);
[
  ["Ramesh Kumar", "9876543210", dept("Sanitation")?.id, "Available"],
  ["Imran Ali", "9876543211", dept("Street Lights")?.id, "On Task"],
  ["Sonal Patil", "9876543212", dept("Roads")?.id, "Available"],
  ["Deepak Das", "9876543213", dept("Drainage")?.id, "On Task"],
  ["Maya Singh", "9876543214", dept("Water Supply")?.id, "Available"],
].forEach(([name, phone, deptId, status]) => {
  if (deptId) insertLabour.run(name, phone, deptId, status);
});

// Seed admin + citizen users (password: "password")
const adminHash = bcrypt.hashSync("password", 10);
const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users (name, email, password_hash, role, area_id) VALUES (?, ?, ?, ?, ?)"
);
insertUser.run("Admin User", "admin@civicresolve.local", adminHash, "admin", null);
insertUser.run("Aarav Sharma", "aarav@example.com", adminHash, "citizen", area1?.id || null);

console.log("✅ Seed data inserted");
console.log("✅ CivicResolve database initialized at:", DB_PATH);
