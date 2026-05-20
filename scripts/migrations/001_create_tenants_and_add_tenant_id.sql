-- Create tenants table and add tenant_id to core tables

CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  plan VARCHAR(80) DEFAULT 'free',
  billing_customer_id VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add tenant_id columns (nullable for initial rollout)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id BIGINT NULL;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id BIGINT NULL;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS tenant_id BIGINT NULL;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS tenant_id BIGINT NULL;

-- Optional: create indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_issues_tenant ON issues(tenant_id);

-- Add foreign key constraint to tenants (optional)
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE issues ADD CONSTRAINT IF NOT EXISTS fk_issues_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE departments ADD CONSTRAINT IF NOT EXISTS fk_depts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE areas ADD CONSTRAINT IF NOT EXISTS fk_areas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
