import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password || "password", user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
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
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, city, block, area, role } = req.body;

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [area]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : null;

    const hash = await bcrypt.hash(password || "password", 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, area_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, hash, role || "citizen", areaId]
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
      { expiresIn: "7d" }
    );
    res.json({ ...user, token });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Email already exists" });
    next(err);
  }
};
