# CivicResolve

CivicResolve is a full-stack civic issue reporting platform for citizens and city teams. Citizens can report local issues, track progress, receive notifications, and chat on issue threads. Admins can review reports, assign labour, update status, and monitor analytics.

Production frontend:
https://civicresolve-jet.vercel.app

Backend:
https://civicresolve-backend-rj8o.onrender.com

## Features

- Citizen and admin authentication with JWT
- Issue reporting with area, department, priority, GPS coordinates, and image evidence
- AI-assisted issue classification
- Admin dashboard for assignment, status updates, notes, and audit history
- Public issue board and citizen "My Issues" view
- Real-time notifications with Socket.IO
- Issue conversation threads
- Analytics dashboard for SLA, department, and timeline insights
- Bug report flow
- Single light theme UI

## Tech Stack

| Layer | Technology |
|---|---|
| Client | React 19, Vite, Tailwind CSS, Lucide React, GSAP |
| Server | Node.js, Express 5, Socket.IO |
| Database | SQLite via better-sqlite3 |
| Auth | bcrypt, jsonwebtoken |
| Deployment | Vercel frontend, Render backend |

## Repository Layout

```text
.
├── client/                  # React + Vite frontend
│   ├── public/images/       # Civic issue imagery
│   ├── src/components/      # UI and feature components
│   ├── src/services/api.js  # API wrapper
│   ├── src/App.jsx
│   └── src/main.jsx
├── server/                  # Express API
│   ├── src/modules/         # Auth, issues, state, notifications, analytics, etc.
│   ├── src/shared/          # DB config, middleware, utilities
│   ├── scripts/init_db.js
│   └── src/server.js
├── data/                    # Local SQLite database
├── uploads/                 # Uploaded issue images
├── vercel.json              # Frontend deploy and API rewrites
├── render.yaml              # Backend deploy config
└── package.json             # Root orchestration scripts
```

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Create the server environment file:

```bash
cp server/.env.example server/.env
```

Minimum useful values:

```env
PORT=3001
JWT_SECRET=replace_with_a_random_32_byte_secret
CORS_ORIGIN=http://localhost:5173
ALLOW_PUBLIC_ADMIN_SIGNUP=true
```

The app uses SQLite locally. The database file is created at `data/civicresolve.db` when the server starts.

## Run Locally

Start frontend and backend together:

```bash
npm run dev
```

Services:

| Service | URL |
|---|---|
| Client | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |

Run individually:

```bash
npm run dev --prefix client
npm run dev --prefix server
```

## Build

```bash
npm run build --prefix client
```

## Deploy

Frontend production deploy uses the linked Vercel project:

```bash
vercel deploy --prod
```

`vercel.json` builds `client/`, serves `client/dist`, and rewrites `/api`, `/uploads`, and `/socket.io` traffic to the Render backend.

Backend deployment is described by `render.yaml`. Ensure Render has production values for:

- `NODE_ENV=production`
- `JWT_SECRET`
- `CORS_ORIGIN=https://civicresolve-jet.vercel.app`
- `ALLOW_PUBLIC_ADMIN_SIGNUP` as appropriate

## Demo Accounts

Seeded local accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@civicresolve.local | password |
| Citizen | aarav@example.com | password |

## Core API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/signup` | Register |
| GET | `/api/state` | Full portal state |
| POST | `/api/issues` | Create issue |
| PATCH | `/api/issues/:id` | Update issue |
| POST | `/api/entities/:type` | Add area, department, or labour |
| PATCH | `/api/notifications/:id/read` | Mark notification read |
| GET | `/api/messages/:issueId` | Get issue messages |
| POST | `/api/messages/:issueId` | Send issue message |
| GET | `/api/analytics/*` | Analytics data |
| POST | `/api/upload` | Upload image |
| POST | `/api/bug-reports` | Submit bug report |

## Manual Test Flow

1. Sign up or log in as a citizen.
2. Submit a civic issue with location, department, priority, and optional image.
3. Log in as an admin.
4. Open the dashboard and assign labour or update issue status.
5. Return to the citizen account and confirm the notification, status update, and conversation history.

## Troubleshooting

- If `/api/state` fails, restart the backend and check the server logs. Startup migrations add missing SQLite columns such as `gps_lat` and `gps_lng`.
- If the frontend cannot reach the API locally, confirm the backend is running on `http://localhost:3001`.
- If login fails immediately, make sure `JWT_SECRET` is set in `server/.env`.
- If production API calls fail, check `vercel.json` rewrites and Render `CORS_ORIGIN`.
