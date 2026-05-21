import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../../../data/civicresolve.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function flattenParams(params) {
  if (!Array.isArray(params)) return params == null ? [] : [params];
  return params;
}

const pool = {
  async query(sql, params = []) {
    try {
      const trimmed = sql.trim();

      // Handle MySQL bulk insert: INSERT ... VALUES ? with [[row1], [row2]]
      if (/VALUES\s+\?/i.test(trimmed) && Array.isArray(params[0]) && Array.isArray(params[0][0])) {
        const rows = params[0];
        if (rows.length === 0) return [{ insertId: null, affectedRows: 0 }, []];
        const placeholders = rows.map(row => `(${row.map(() => "?").join(", ")})`).join(", ");
        const newSql = trimmed.replace(/VALUES\s+\?/i, `VALUES ${placeholders}`);
        const flatParams = rows.flat();
        const stmt = db.prepare(newSql);
        const result = stmt.run(...flatParams);
        return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }, []];
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
        return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }, []];
      }
    } catch (err) {
      // Translate SQLite unique constraint errors to match MySQL error codes
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
