# CivicResolve

A full-stack civic issue reporting platform. Citizens report local problems (roads, drainage, water supply, sanitation, street lights, public parks); admins track, assign, and resolve them with real-time updates.

## Architecture

**Monorepo** with two independent services:

| Layer | Location | Tech | Port |
|-------|----------|------|------|
| Frontend | `client/` | React 19 + Vite + Tailwind | 5000 |
| Backend | `server/` | Express 5 + Socket.IO | 3001 |
| Database | `data/civicresolve.db` | SQLite (better-sqlite3) | — |
| Uploads | `uploads/` | Multer disk storage | — |

The Vite dev server proxies `/api`, `/uploads`, and `/socket.io` to `http://127.0.0.1:3001`.

## Running the App

Two Replit workflows run automatically:
- **Start application** — `cd client && npm run dev` (port 5000, webview)
- **Backend** — `cd server && node src/server.js` (port 3001, console)

## Features

1. **Real-time WebSocket notifications** — Socket.IO: citizens get instant alerts when their issue is received; admins get alerts when new issues arrive
2. **AI issue classification** — keyword-based classifier (`server/src/shared/utils/aiClassifier.js`) suggests department + priority as the user types
3. **GPS location tagging** — browser Geolocation API; lat/lng stored on issue rows and sent to backend
4. **PWA / mobile support** — `manifest.json`, service worker (`sw.js`), mobile meta tags
5. **Image upload** — Multer endpoint at `POST /api/upload`; toggle between URL and file upload in the report form
6. **Analytics dashboard** — admin-only `/analytics` route with bar charts, donut charts, and KPI tiles pulled from `/api/analytics`

## Database

SQLite via a mysql2-compatible pool adapter at `server/src/shared/config/db.js`.

**Initialize or reset DB:**
```bash
cd server && node scripts/init_db.js
```

**Seed credentials:**
- Admin: `admin@civicresolve.local` / `password`
- Citizen: `aarav@example.com` / `password`

## Key Paths

```
client/src/App.jsx              — all frontend components (monolithic)
client/src/components/
  AnalyticsDashboard.jsx        — admin analytics page
client/src/services/api.js      — all API calls
server/src/server.js            — HTTP + Socket.IO server entry
server/src/app.js               — Express routes
server/src/shared/config/db.js  — SQLite pool adapter
server/src/shared/utils/aiClassifier.js — AI keyword classifier
server/src/modules/
  issues/                       — CRUD + socket emit + AI
  analytics/                    — aggregation queries
  upload/                       — Multer image upload
data/civicresolve.db            — SQLite database file
uploads/                        — uploaded images served at /uploads/*
```

## User Preferences

- Keep the monorepo structure (`client/` and `server/` in the workspace root)
- SQLite only (no MySQL/Postgres) — the pool adapter provides mysql2 API compatibility
- DB file lives at workspace root `data/civicresolve.db` (resolved via `__dirname` in db.js, not env var)
- Frontend port 5000 (webview), backend port 3001 (console)
