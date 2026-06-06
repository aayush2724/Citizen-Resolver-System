# Phase 0: Baseline Audit Report

## Date: 2026-06-06

## Stack Verification

| Layer | Documented | Actual | Status |
|-------|------------|--------|--------|
| Client | React 19, Vite, Tailwind CSS | React 19, Vite 7, Tailwind CSS v3 | ✅ Match |
| Server | Express 5, MySQL | Express 5, MySQL (mysql2) | ✅ Match |
| Auth | JWT + bcrypt | JWT + bcrypt | ✅ Match |
| Realtime | Socket.IO mentioned | Not implemented | ❌ Missing |
| Upload | multer mentioned | Not implemented | ❌ Missing |
| DB | MySQL | MySQL | ✅ Match |

## Critical Blocking Issues Found & Fixed

### 1. JWT_SECRET Fallback Vulnerability ✅ FIXED
- **Issue**: Auth middleware used `"supersecret"` as fallback
- **Fix**: Now requires JWT_SECRET or returns 500 error

### 2. Admin Signup Unrestricted ✅ FIXED
- **Issue**: Anyone could register as admin
- **Fix**: Added `ADMIN_SIGNUP_CODE` and `ALLOW_PUBLIC_ADMIN_SIGNUP` env vars

### 3. Issues Deleted on Completion ✅ FIXED
- **Issue**: `DELETE FROM issues` executed when status = "Completed"
- **Fix**: Issues now preserved with status update only

### 4. Missing issue_messages Table ✅ FIXED
- **Issue**: Schema missing table used by messages controller
- **Fix**: Added to schema.sql

### 5. No Health Endpoint ✅ FIXED
- **Issue**: No `/api/health` endpoint existed
- **Fix**: Created `server/src/modules/health/health.routes.js`

### 6. No Security Headers ✅ FIXED
- **Issue**: Missing X-Frame-Options, X-Content-Type-Options, etc.
- **Fix**: Added security headers middleware in app.js

### 7. Docker-compose Env Var Mismatch ✅ FIXED
- **Issue**: Used `DATABASE_*` but server expects `DB_*`
- **Fix**: Updated to use correct `DB_*` variables

### 8. Nginx API Proxy Missing ✅ FIXED
- **Issue**: Frontend couldn't reach backend in production
- **Fix**: Added `/api/` proxy to nginx.conf

### 9. Vite Proxy Wrong Port ✅ FIXED
- **Issue**: Proxied to port 5000, server runs on 3001
- **Fix**: Updated to port 3001

### 10. Missing Mobile Navigation ❌ PENDING
- **Issue**: Header only shows desktop navigation
- **Status**: Moved to Phase 2

### 11. Message Authorization Missing ✅ FIXED
- **Issue**: Any authenticated user could read/send messages on any issue
- **Fix**: Added ownership/admin check in messages controller

## Naming Inconsistencies Identified

| Source | Name | Action |
|--------|------|--------|
| README, code | "Citizen Resolver System" | Keep as primary name |
| UI Header | "Citizen Resolver" | Acceptable short form |
| Issue IDs | "CHP-*" | Keep as branding |

## Schema Updates Required

- Added `Completed` status to issues table
- Added `gps_lat`, `gps_lng` columns to issues table
- Added `idx_issues_citizen` index
- Added `audit_logs` table
- Added `issue_messages` table

## Build Status

- Frontend: ✅ Builds successfully
- Backend: ✅ Syntax valid

## Next Steps

Proceeding to Phase 1: Design System Extraction
- Create reusable UI components
- Extract design tokens
- Add mobile navigation