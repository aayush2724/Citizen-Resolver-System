# Citizen Resolver System (CRS)

Citizen Resolver System is a full-stack civic issue reporting platform.
Citizens can sign up, report local problems, and track progress. Admins can
review, assign, and manage resolution workflows with notifications.

## Features

- JWT-based authentication (citizen and admin)
- Issue reporting with priority, department, location, and optional image URL
- Admin assignment flow (department, labour, status updates, notes)
- Citizen notification feed for report and status updates
- Public issue board with filtering
- Master data management (areas, departments, labour)

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Lucide React
- Backend: Node.js, Express, MySQL (mysql2/promise), bcrypt, jsonwebtoken

## Repository Layout

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.js
│   ├── server.js
│   ├── init_db.js
│   ├── schema.sql
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── vite.config.js
├── FEATURE_TESTING_GUIDE.md
├── IMPLEMENTATION_SUMMARY.md
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

## Setup

1. Install dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

2. Configure backend environment in backend/.env

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=citizen_resolver
JWT_SECRET=your_random_secret_string
```

3. Initialize database schema and seed data

```bash
cd backend
node init_db.js
```

## Run the Application

Backend:

```bash
npm --prefix backend start
```

Frontend (Vite dev server):

```bash
npm --prefix frontend run dev
```

Frontend URL: http://127.0.0.1:5173
Backend URL: http://localhost:5000

## Build

```bash
npm --prefix frontend run build
```

## Demo Accounts

- Citizen: aarav@example.com / password
- Admin: admin@helpline.local / password

## Core API Endpoints

- POST /api/auth/login
- POST /api/auth/signup
- GET /api/state
- POST /api/issues
- PATCH /api/issues/:id
- POST /api/entities/:type
- PATCH /api/notifications/:id/read

## Manual End-to-End Test Flow

1. Sign up a new citizen account.
2. Log in as that citizen.
3. Create a new issue (with or without image URL).
4. Log in as admin.
5. Open Dashboard, assign department/labour, and update status.
6. Log back in as citizen and confirm:
    - status changed
    - assignment note appears
    - notification appears
    - issue image is shown (uploaded URL or relevant fallback)

## Notes and Current Behavior

- Issue IDs are rendered as CHP-1001 style identifiers.
- Areas added from Admin Manage Data are persisted in the database and visible in public filters.
- City/block/area selection options in signup/report forms are currently driven by frontend mock location data.

## Troubleshooting

- Error: ENOENT Could not read package.json at repository root
   - This repository has separate backend and frontend packages.
   - Use npm --prefix backend ... and npm --prefix frontend ... commands.

- Backend cannot connect to DB
   - Check backend/.env credentials.
   - Ensure MySQL is running and DB user has permission to create/use citizen_resolver.

- UI shows no data after login
   - Confirm backend is running on port 5000.
   - Check browser devtools network calls to /api/state.
