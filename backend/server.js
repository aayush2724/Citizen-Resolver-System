import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "citizen_resolver",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Ensure all API routes return valid JSON
const apiErrorHandler = (err, req, res, next) => {
  const errorMsg = `${new Date().toISOString()} - ${err.stack}\n`;
  try {
    fs.appendFileSync("error.log", errorMsg);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
};

// --- GET ENTIRE STATE (For frontend compatibility) ---
app.get("/api/state", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users",
    );

    // Improved issues query to avoid duplicates and handle data correctly
    const [issues] = await pool.query(`
      SELECT 
        i.id, i.title, i.description, i.image_url, i.status, i.priority, i.created_at, i.updated_at,
        u.name as citizenName,
        a.name as area,
        d.name as department,
        COALESCE((
          SELECT l.name 
          FROM issue_assignments ia 
          JOIN labour l ON ia.labour_id = l.id 
          WHERE ia.issue_id = i.id 
          ORDER BY ia.assigned_at DESC 
          LIMIT 1
        ), 'Unassigned') as assignedLabour,
        COALESCE((
          SELECT note 
          FROM issue_assignments 
          WHERE issue_id = i.id 
          ORDER BY assigned_at DESC 
          LIMIT 1
        ), 'Issue received. Waiting for admin review.') as note
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.id
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN departments d ON i.department_id = d.id
    `);

    const [areas] = await pool.query("SELECT * FROM areas");
    const [departments] = await pool.query("SELECT * FROM departments");
    const [labour] = await pool.query(`
      SELECT l.id, l.name, l.availability_status, d.name as department 
      FROM labour l 
      LEFT JOIN departments d ON l.department_id = d.id
    `);
    const [notifications] = req.user.role === "admin"
      ? await pool.query("SELECT * FROM notifications ORDER BY created_at DESC")
      : await pool.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);

    res.json({
      users,
      issues: issues.map((i) => ({
        ...i,
        id: `CHP-${i.id + 1000}`,
        originalId: i.id,
      })),
      areas,
      departments,
      labour,
      notifications: notifications.map((n) => ({
        ...n,
        read: !!n.read_at,
      })),
    });
  } catch (err) {
    console.error("Error in /api/state:", err);
    res.status(500).json({
      error: "Failed to load portal data. Please check backend logs.",
    });
  }
});

// --- AUTHENTICATION ROUTES ---
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(
      password || "password",
      user.password_hash,
    );
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" },
    );
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: "Mysore", // Default for frontend compat
      token,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const { name, email, password, city, block, area, role } = req.body;

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [
      area,
    ]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : null;

    const hash = await bcrypt.hash(password || "password", 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, area_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, hash, role || "citizen", areaId],
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: role || "citizen",
      area_id: areaId,
    };
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" },
    );
    res.json({ ...user, token });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists" });
    next(err);
  }
});

// --- ISSUES ROUTES ---
app.post("/api/issues", authenticateToken, async (req, res, next) => {
  try {
    const { title, description, imageUrl, priority, department, area } =
      req.body;

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [
      area,
    ]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : 1; // Fallback

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query(
        "SELECT id FROM departments WHERE name = ?",
        [department],
      );
      deptId = deptRows.length > 0 ? deptRows[0].id : null;
    }

    const [result] = await pool.query(
      "INSERT INTO issues (citizen_id, area_id, department_id, title, description, image_url, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, areaId, deptId, title, description, imageUrl, priority],
    );

    // Create notification
    await pool.query(
      "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
      [
        req.user.id,
        result.insertId,
        `CHP-${result.insertId + 1000} submitted`,
        "Your report has entered the admin review queue.",
      ],
    );

    res.json({ id: `CHP-${result.insertId + 1000}` });
  } catch (err) {
    next(err);
  }
});

app.patch("/api/issues/:id", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    let issueIdStr = req.params.id;
    let actualId = parseInt(issueIdStr.replace("CHP-", "")) - 1000;

    if (isNaN(actualId) || actualId < 1) {
      return res.status(400).json({ error: `Invalid issue ID: ${issueIdStr}` });
    }

    const { status, department, assignedLabour, note } = req.body;

    // --- Step 1: Resolve department name → department_id ---
    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query(
        "SELECT id FROM departments WHERE name = ?",
        [department],
      );
      if (deptRows.length > 0) {
        deptId = deptRows[0].id;
      }
    }

    // --- Step 2: Resolve assignedLabour name → labour_id ---
    // Filter by department_id if available for accuracy
    let labourId = null;
    if (assignedLabour) {
      const labourQuery = deptId
        ? "SELECT id FROM labour WHERE name = ? AND department_id = ?"
        : "SELECT id FROM labour WHERE name = ?";
      const labourParams = deptId ? [assignedLabour, deptId] : [assignedLabour];
      const [labourRows] = await pool.query(labourQuery, labourParams);
      if (labourRows.length > 0) {
        labourId = labourRows[0].id;
      }
    }

    // --- Step 3: UPDATE issues (status + department_id if resolved) ---
    if (deptId) {
      await pool.query(
        "UPDATE issues SET status = ?, department_id = ? WHERE id = ?",
        [status, deptId, actualId],
      );
    } else {
      await pool.query("UPDATE issues SET status = ? WHERE id = ?", [
        status,
        actualId,
      ]);
    }

    // --- Step 4: INSERT into issue_assignments if a labour worker was assigned ---
    // Both department_id and assigned_by are NOT NULL in schema — must be included
    if (labourId && deptId) {
      await pool.query(
        "INSERT INTO issue_assignments (issue_id, department_id, labour_id, assigned_by, note, assigned_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [actualId, deptId, labourId, req.user.id, note || null],
      );
    }

    // --- Step 5: Create notification for the citizen ---
    const [issueRows] = await pool.query(
      "SELECT citizen_id FROM issues WHERE id = ?",
      [actualId],
    );
    if (issueRows.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
        [
          issueRows[0].citizen_id,
          actualId,
          `CHP-${actualId + 1000} updated`,
          note || `Status changed to ${status}`,
        ],
      );
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- ENTITIES ROUTES ---
app.post("/api/entities/:type", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { type } = req.params;
    const data = req.body;

    if (type === "areas") {
      await pool.query("INSERT INTO areas (name, zone) VALUES (?, ?)", [
        data.name,
        data.zone || "Default",
      ]);
    } else if (type === "departments") {
      await pool.query("INSERT INTO departments (name) VALUES (?)", [
        data.name,
      ]);
    } else if (type === "labour") {
      const [deptRows] = await pool.query(
        "SELECT id FROM departments WHERE name = ?",
        [data.department],
      );
      const deptId = deptRows.length > 0 ? deptRows[0].id : 1;
      await pool.query(
        "INSERT INTO labour (name, department_id) VALUES (?, ?)",
        [data.name, deptId],
      );
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.patch(
  "/api/notifications/:id/read",
  authenticateToken,
  async (req, res, next) => {
    try {
      await pool.query(
        "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id],
      );
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

app.use(apiErrorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
