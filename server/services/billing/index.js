import express from 'express';
const router = express.Router();

// Placeholder endpoints for billing integration (e.g., Stripe webhooks)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Handle billing events here (verify signature, update tenant billing status)
  console.log('billing webhook received');
  // TODO: verify provider signature and process events
  res.status(204).send();
});

export default router;
