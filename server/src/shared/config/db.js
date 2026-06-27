import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../../../data/civicresolve.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const tableCount = db.prepare("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='users'").get();
if (tableCount.cnt === 0) {
  db.exec(`
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
      city TEXT, block TEXT,
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
      name TEXT NOT NULL, phone TEXT,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      availability_status TEXT DEFAULT 'Available' CHECK(availability_status IN ('Available', 'On Task', 'Inactive'))
    );
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      title TEXT NOT NULL, description TEXT NOT NULL, image_url TEXT,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Assigned','In Progress','Resolved','Completed','Rejected')),
      priority TEXT DEFAULT 'Normal' CHECK(priority IN ('Normal','High','Urgent')),
      sla_hours INTEGER DEFAULT 72, lat REAL, lng REAL,
      ai_department TEXT, ai_confidence INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS issue_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      labour_id INTEGER REFERENCES labour(id) ON DELETE SET NULL,
      assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP, note TEXT
    );
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
      citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
      title TEXT NOT NULL, body TEXT NOT NULL,
      read_at DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS bug_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      category TEXT DEFAULT 'general' CHECK(category IN ('bug','ui','performance','feature','general')),
      subject TEXT NOT NULL, description TEXT NOT NULL,
      contact_email TEXT, status TEXT DEFAULT 'open' CHECK(status IN ('open','reviewed','resolved')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS issue_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL, old_value TEXT, new_value TEXT, note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const insertArea = db.prepare("INSERT OR IGNORE INTO areas (name, zone) VALUES (?, ?)");
  [["Stage 1","Zone A"],["Stage 2","Zone A"],["Central Ward","Zone B"]].forEach(([n,z]) => insertArea.run(n,z));

  const insertDept = db.prepare("INSERT OR IGNORE INTO departments (name) VALUES (?)");
  ["Roads","Sanitation","Water Supply","Street Lights","Drainage","Public Parks"].forEach(n => insertDept.run(n));

  const d = (name) => db.prepare("SELECT id FROM departments WHERE name = ?").get(name);
  const insertLabour = db.prepare("INSERT OR IGNORE INTO labour (name, phone, department_id, availability_status) VALUES (?,?,?,?)");
  [["Ramesh Kumar","9876543210",d("Sanitation")?.id,"Available"],["Imran Ali","9876543211",d("Street Lights")?.id,"On Task"],["Sonal Patil","9876543212",d("Roads")?.id,"Available"],["Deepak Das","9876543213",d("Drainage")?.id,"On Task"],["Maya Singh","9876543214",d("Water Supply")?.id,"Available"]].forEach(([n,p,di,s]) => { if(di) insertLabour.run(n,p,di,s); });

  const area1 = db.prepare("SELECT id FROM areas WHERE name = 'Stage 1'").get();
  const adminHash = bcrypt.hashSync("password", 10);
  const insertUser = db.prepare("INSERT OR IGNORE INTO users (name, email, password_hash, role, area_id) VALUES (?,?,?,?,?)");
  insertUser.run("Admin User", "admin@civicresolve.local", adminHash, "admin", null);
  insertUser.run("Aarav Sharma", "aarav@example.com", adminHash, "citizen", area1?.id || null);

  console.log("✅ Database initialized with schema and seed data");
}

function flattenParams(params) {
  if (!Array.isArray(params)) return params == null ? [] : [params];
  return params;
}

const pool = {
  async query(sql, params = []) {
    try {
      const trimmed = sql.trim();

      if (/VALUES\s+\?/i.test(trimmed) && Array.isArray(params[0]) && Array.isArray(params[0][0])) {
        const rows = params[0];
        if (rows.length === 0) return [{ insertId: null, affectedRows: 0 }, []];
        const placeholders = rows.map(row => `(${row.map(() => "?").join(", ")})`).join(", ");
        const newSql = trimmed.replace(/VALUES\s+\?/i, `VALUES ${placeholders}`);
        const flatParams = rows.flat();
        const stmt = db.prepare(newSql);
        const result = stmt.run(...flatParams);
        return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }, []];
      }

      const flat = flattenParams(params);
      const upper = trimmed.toUpperCase();

      if (upper.startsWith("SELECT") || upper.startsWith("PRAGMA") || upper.startsWith("WITH")) {
        const stmt = db.prepare(trimmed);
        const rows = stmt.all(...flat);
        return [rows, []];
      } else {
        const stmt = db.prepare(trimmed);
        const result = stmt.run(...flat);
        return [{ insertId: Number(result.lastInsertRowid), affectedRows: result.changes }, []];
      }
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE" || (err.message && err.message.includes("UNIQUE constraint failed"))) {
        err.code = "ER_DUP_ENTRY";
        err.sqlMessage = err.message;
      }
      throw err;
    }
  },
};

export default pool;
export { db };
