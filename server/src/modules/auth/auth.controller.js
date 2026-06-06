import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../shared/config/db.js";

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign(
    { id: user.id, role: user.role },
    secret,
    { expiresIn: "7d" },
  );
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Email/Phone and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [identifier, identifier],
    );
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "No account found with this email or phone" });
    }

    const user = rows[0];

    // FIX: removed `|| "password"` fallback — was allowing login with no password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = signToken(user);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      block: user.block,
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, city, block, area } = req.body;

    if (!name?.trim())
      return res.status(400).json({ error: "Full name is required" });
    if (!email?.trim() && !phone?.trim())
      return res.status(400).json({ error: "Email or Phone is required" });
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Restrict admin signup to those with a valid signup code (or allow in development)
    let role = req.body.role || "citizen";
    const isAdminSignup = role === "admin";

    if (isAdminSignup) {
      const allowPublicSignup = process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true";
      const adminSignupCode = process.env.ADMIN_SIGNUP_CODE;
      const providedCode = req.body.adminSignupCode || req.body.signupCode;

      const canSignupAdmin = allowPublicSignup ||
        (adminSignupCode && providedCode === adminSignupCode);

      if (!canSignupAdmin) {
        return res.status(403).json({ error: "Admin signup is restricted. Please contact your administrator." });
      }
    }

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [
      area,
    ]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : null;

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash, role, city, block, area_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name.trim(),
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        hash,
        role || "citizen",
        city,
        block,
        areaId,
      ],
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      role,
      city,
      block,
      area_id: areaId,
    };

    const token = signToken(user);
    res.status(201).json({ ...user, token });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const message = String(err.sqlMessage || err.message || "");
      if (message.includes("phone")) {
        return res
          .status(400)
          .json({ error: "An account with this phone number already exists" });
      }

      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }
    next(err);
  }
};
