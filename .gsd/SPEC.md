# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
To build a highly reliable, responsive, and scalable backend system for the Citizen Resolver System that powers a unified platform for citizens to report local issues, for administrators to manage them, and for laborers to resolve them, bridging the gap between community members and local authorities.

## Goals
1. Establish a robust Node.js/Express REST API that perfectly interfaces with the existing React frontend.
2. Implement a complete PostgreSQL database structure mirroring geographic locations (Cities, Blocks, Areas) and users (Citizens, Admins, Labourers).
3. Introduce real-time automated email notifications for crucial issue status updates.

## Non-Goals (Out of Scope)
- Mobile application development (React Native/Flutter).
- Heavy machine learning for automated issue categorization in v1.0.
- SMS notifications (sticking to email only for v1.0).

## Users
- **Citizens**: To submit help requests/issues, track their statuses, and receive email notifications.
- **Administrators**: To review incoming issues, dispatch laborers, and update statuses.
- **Laborers**: Dispatched personnel to resolve physical issues in their assigned areas.

## Constraints
- **Technical constraints**: Must integrate smoothly with the existing Vite/React frontend and replace the current simulated `localStorage` mock API.
- **Timeline constraints**: Efficient rollout emphasizing core entities before expanding features.

## Success Criteria
- [ ] End-to-end user authentication and role-based access control works.
- [ ] CRUD operations for Issues map directly to the database.
- [ ] Automated emails dispatch reliably based on ticket status changes.
