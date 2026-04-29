import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET, // no fallback — will throw at startup if missing
    { expiresIn: "7d" },
  );

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      // Same message for missing user vs wrong password — avoids user enumeration
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // FIX: removed `|| "password"` fallback — was allowing login with no password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, city, block, area } = req.body;

    // Basic validation
    if (!name?.trim())
      return res.status(400).json({ error: "Full name is required" });
    if (!email?.trim())
      return res.status(400).json({ error: "Email is required" });
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // FIX: role is always forced to 'citizen' — users cannot self-assign admin
    const role = "citizen";

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [
      area,
    ]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : null;

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, area_id) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hash, role, areaId],
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      area_id: areaId,
    };

    const token = signToken(user);
    res.status(201).json({ ...user, token });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }
    next(err);
  }
};
