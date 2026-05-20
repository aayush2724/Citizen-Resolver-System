import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

// Minimal auth endpoint that issues a tenant-scoped JWT for dev/testing.
// WARNING: This is for local/dev convenience only. Replace with real auth.
router.post('/token', (req, res) => {
  const { user_id = 'dev_user', role = 'citizen', tenant_id = null } = req.body || {};
  const payload = { sub: user_id, role, tenant_id };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret', { expiresIn: '7d' });
  res.json({ token, tenant_id });
});

export default router;
