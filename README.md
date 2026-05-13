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
- Real-time messaging between citizens and admins

## Tech Stack

| Layer | Technology |
|---|---|
| Client | React 19, Vite, Tailwind CSS v3, Lucide React |
| Server | Node.js, Express 5, MySQL (mysql2/promise) |
| Auth | bcrypt, jsonwebtoken |
| Dev tooling | nodemon, concurrently |

## Repository Layout

```text
.
├── client/                   # React + Vite frontend
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/       # IssueCard, IssueModal, Shell, …
│   │   ├── data/             # mockData.js
│   │   ├── services/         # api.js (fetch wrapper)
│   │   ├── utils/            # image.js, status.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js        # Proxies /api → localhost:5000
│
├── server/                   # Express REST API (SaaS modular architecture)
│   ├── db/
│   │   └── schema.sql
│   ├── logs/
│   │   └── debug_issue.json
│   ├── scripts/
│   │   ├── init_db.js        # DB initializer / seeder
│   │   └── scratch/          # local one-off debug scripts
│   ├── src/
│   │   ├── modules/          # Domain-driven feature modules
│   │   │   ├── auth/         # Authentication module (login, signup)
│   │   │   ├── issues/       # Issues module (create, update)
│   │   │   ├── entities/     # Master data (areas, departments, labour)
│   │   │   ├── state/        # Portal state aggregator
│   │   │   ├── notifications/# Notifications (mark read)
│   │   │   ├── messages/     # Chat messaging
│   │   │   └── bug-reports/  # User feedback
│   │   ├── shared/           # Shared utilities & middleware
│   │   │   ├── config/       # db.js (MySQL pool)
│   │   │   └── middlewares/  # auth, error handling
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Entry point
│   ├── .env                  # ← copy from .env.example (not committed)
│   └── .env.example
│
├── docs/
│   ├── FEATURE_TESTING_GUIDE.md
│   └── IMPLEMENTATION_SUMMARY.md
├── package.json              # Root orchestrator (concurrently)
└── README.md
```

## Documentation

- [Feature Testing Guide](docs/FEATURE_TESTING_GUIDE.md)
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)
- [Backend Architecture (SaaS Modular)](docs/BACKEND_ARCHITECTURE.md)

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

## Setup

### 1. Install all dependencies

```bash
npm run install:all
```

This installs root devDeps (`concurrently`) plus all packages for `server/` and `client/`.

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` with your MySQL credentials and a JWT secret:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=citizen_resolver
JWT_SECRET=your_random_secret_string
```

### 3. Initialize the database

```bash
npm run init:db
```

This creates the `citizen_resolver` database, runs the schema, and seeds demo accounts.

## Run the Application

Start both the API server and the Vite dev server with a single command:

```bash
npm run dev
```

| Service | URL |
|---|---|
| Client (Vite) | http://127.0.0.1:5173 |
| Server (Express) | http://localhost:5000 |

To run them individually:

```bash
npm run dev --prefix server   # API only
npm run dev --prefix client   # Vite only
```

## Build (Production)

```bash
npm run build --prefix client
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@helpline.local | password |
| Citizen | aarav@example.com | password |

## Core API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/signup | Register |
| GET | /api/state | Full portal state (auth-gated) |
| POST | /api/issues | Create issue |
| PATCH | /api/issues/:id | Update issue (admin) |
| POST | /api/entities/:type | Add area / department / labour |
| PATCH | /api/notifications/:id/read | Mark notification read |
| GET | /api/messages/:issueId | Get chat messages |
| POST | /api/messages/:issueId | Send chat message |

## Manual End-to-End Test Flow

1. Sign up a new citizen account.
2. Log in as that citizen and create a new issue.
3. Log in as admin and open the Dashboard.
4. Assign a department/labour, update the status, and add a note.
5. Log back in as the citizen and confirm:
   - Status has changed
   - Assignment note appears in the modal
   - Notification appears in the feed
   - Issue image is shown (uploaded URL or relevant fallback)

## Troubleshooting

- **`ENOENT: could not read package.json` at repo root** — Use `npm run install:all` from the repo root, or `npm --prefix server install` / `npm --prefix client install` individually.
- **Server cannot connect to DB** — Check `server/.env` credentials. Ensure MySQL is running and the DB user has `CREATE`/`USE` privileges on `citizen_resolver`.
- **UI shows no data after login** — Confirm the server is running on port 5000 and check browser DevTools → Network → `/api/state`.
