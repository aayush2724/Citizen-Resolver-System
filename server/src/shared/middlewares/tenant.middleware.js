// Tenant middleware: extract tenant id from JWT claim or `x-tenant-id` header and attach to req.tenant

module.exports = function tenantMiddleware(req, res, next) {
  // Prefer explicit header set by gateway: X-Tenant-ID
  const header = req.get('x-tenant-id');
  if (header) {
    req.tenant = { id: header };
    return next();
  }

  // Otherwise, if a JWT parsing middleware attached a `user` object with tenant claim
  if (req.user && req.user.tenant_id) {
    req.tenant = { id: req.user.tenant_id };
    return next();
  }

  // No tenant found — allow request but mark as unauthenticated tenant (handles public endpoints)
  req.tenant = null;
  next();
};
