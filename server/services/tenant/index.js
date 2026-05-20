import express from 'express';
const router = express.Router();

// Placeholder in-memory store (replace with DB integration)
const tenants = [];

router.get('/:id', (req, res) => {
  const t = tenants.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

router.post('/', (req, res) => {
  const id = `t_${Date.now()}`;
  const item = { id, ...req.body };
  tenants.push(item);
  res.status(201).json(item);
});

export default router;
