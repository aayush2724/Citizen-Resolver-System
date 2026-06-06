import jwt from "jsonwebtoken";

export const AUTH_ERRORS = {
  NO_TOKEN: "Access token required",
  INVALID_TOKEN: "Invalid or expired token",
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: AUTH_ERRORS.NO_TOKEN });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("FATAL: JWT_SECRET is not configured");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ error: AUTH_ERRORS.INVALID_TOKEN });
    req.user = user;
    if (user && user.tenant_id) {
      req.tenant = { id: user.tenant_id };
    } else if (req.get('x-tenant-id')) {
      req.tenant = { id: req.get('x-tenant-id') };
    } else {
      req.tenant = null;
    }
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Allows requests from logged-in users and guests (sets req.user if token present)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return next();
  const secret = process.env.JWT_SECRET;
  if (!secret) return next();
  jwt.verify(token, secret, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};
