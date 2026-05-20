import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    // Attach tenant context from token if available
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
  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, user) => {
    if (!err) req.user = user;
    next();
  });
};
