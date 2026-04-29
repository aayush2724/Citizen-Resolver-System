# Citizen-Resolver-System(CRS)

A Full-Stack civic issue reporting platform featuring a modern **Bento-grid UI** and a robust **Node.js + MySQL** backend. Citizens can submit issues, track progress, and receive notifications, while admins can manage assignments, labour, and departments.

## 🚀 Key Features

- **Modern Bento UI**: Premium dark-themed dashboard with glassmorphism and bento-grid layouts.
- **Full-Stack Integration**: Real-time data persistence using a Node/Express backend and MySQL database.
- **Secure Authentication**: JWT-based login/signup with hashed passwords (bcrypt).
- **Comprehensive Reporting**: Issue submission with image support, status tracking, and priority levels.
- **Admin Control Center**: Manage areas, departments, labour personnel, and issue assignments.
- **Automated Notifications**: System-generated alerts for issue updates and status changes.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Lucide React (Icons)
- JWT Authentication Flow

**Backend:**
- Node.js (ES Modules)
- Express.js
- MySQL (mysql2/promise)
- JSON Web Tokens (jsonwebtoken)
- Password Hashing (bcrypt)

## 📂 Project Structure

```text
.
├── backend/                # Express server and DB scripts
│   ├── src/                # SaaS-level modular architecture
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic (auth, issues, state)
│   │   ├── middlewares/    # Custom Express middlewares
│   │   ├── routes/         # API endpoint definitions
│   │   └── app.js          # Express app configuration
│   ├── server.js           # API entry point
│   ├── init_db.js          # DB initialization script
│   ├── schema.sql          # MySQL database schema
│   └── .env                # Backend configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── services/api.js # Backend communication layer
│   │   ├── components/     # UI Components (Shell, IssueCard, etc.)
│   │   └── App.jsx         # Main application logic
└── README.md
```

## ⚙️ Installation & Setup

### 1. Database Setup
Ensure you have MySQL installed and running.
1. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=citizen_resolver
   JWT_SECRET=your_random_secret_string
   ```
2. Initialize the database schema and dummy data:
   ```bash
   cd backend
   npm install
   node init_db.js
   ```

### 2. Start the Backend
```bash
node server.js
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Demo Accounts

- **Citizen**: `aarav@example.com` (Password: `password`)
- **Admin**: `admin@helpline.local` (Password: `password`)

## 📝 API Endpoints

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/signup` - Register new citizen
- `GET /api/state` - Fetch global portal state (Admin/Citizen)
- `POST /api/issues` - Submit a new report
- `PATCH /api/issues/:id` - Update issue status/assignment
- `POST /api/entities/:type` - Manage master data (areas, departments, labour)
- `PATCH /api/notifications/:id/read` - Mark notification as read
