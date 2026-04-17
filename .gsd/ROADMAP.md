# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Functional Node.js backend running on PostgreSQL.
- [ ] JWT authentication across frontend/backend.
- [ ] Full Issue ticket lifecycle management.
- [ ] Email notifications based on status updates.

## Phases

### Phase 1: Foundation & Database Setup
**Status**: ⬜ Not Started
**Objective**: Scaffold the Node.js Express server and establish the PostgreSQL database schema through an ORM.
**Requirements**: REQ-01, REQ-02, REQ-04

### Phase 2: Authentication & Authorization Flow
**Status**: ⬜ Not Started
**Objective**: Secure the API using JWTs, create user accounts with encrypted passwords, and handle role-based logic (Citizen, Admin, Labour).
**Requirements**: REQ-03

### Phase 3: Core Issue Management & Email Integration
**Status**: ⬜ Not Started
**Objective**: Build CRUD API for Issues, align it with areas/blocks, and hook up email dispatchers whenever an issue status is altered. 
**Requirements**: REQ-05, REQ-06

### Phase 4: Frontend Integration & Polish
**Status**: ⬜ Not Started
**Objective**: Replace `services/api.js` on the React frontend to make legitimate API calls to our Express backend. Test E2E flows.
**Requirements**: REQ-07
