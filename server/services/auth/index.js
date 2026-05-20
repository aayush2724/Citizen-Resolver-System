import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

// Minimal auth endpoint that issues a tenant-scoped JWT for dev/testing.
// WARNING: This is for local/dev convenience only. Replace with real auth.
router.post('/token', (req, res) => {
  const { user_id = 'dev_user', role = 'citizen', tenant_id = null } = req.body || {};
  const payload = { sub: user_id, role, tenant_id };
  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret) {
    console.warn('WARNING: JWT_SECRET is not set. Issuing tokens with an insecure default. Set JWT_SECRET in environment for production.');
  }
  const token = jwt.sign(payload, jwtSecret || 'dev-insecure-secret', { expiresIn: '7d' });
  res.json({ token, tenant_id });
});

export default router;
