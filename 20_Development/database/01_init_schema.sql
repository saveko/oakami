-- Oakami OS V1 Database Schema Initialization
-- Based on DATABASE_FINAL.md specification

-- Organizations (User Tenants)
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (Managers, Admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'manager',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Platforms (Google, Facebook, TripAdvisor, etc)
CREATE TABLE platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  api_base_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Integrations (OAuth connections per org)
CREATE TABLE platform_integrations (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, platform_id)
);

-- Reviews (External reviews synced from platforms)
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  external_id VARCHAR(500),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  sentiment VARCHAR(50),
  tone VARCHAR(50),
  categories VARCHAR(500),
  priority VARCHAR(50),
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, platform_id, external_id)
);

-- AI Generated Replies
CREATE TABLE replies (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  review_id INTEGER NOT NULL REFERENCES reviews(id),
  generated_content TEXT,
  tone_adjustment VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager Approvals
CREATE TABLE approvals (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  reply_id INTEGER NOT NULL REFERENCES replies(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  approved BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_reviews_org ON reviews(org_id);
CREATE INDEX idx_reviews_platform ON reviews(platform_id);
CREATE INDEX idx_platform_integrations_org ON platform_integrations(org_id);
CREATE INDEX idx_replies_review ON replies(review_id);
CREATE INDEX idx_approvals_reply ON approvals(reply_id);
CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(created_at);
