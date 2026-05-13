# Backend Architecture – SaaS Modular Design

The backend follows a **SaaS-ready, domain-driven modular architecture** for scalability and maintainability.

## Core Principles

- **Modules by Domain**: Each feature domain (auth, issues, notifications) is self-contained
- **Shared Utilities**: Common config, middleware, and helpers live in `shared/`
- **Separation of Concerns**: Each module handles its own routes, controllers, and business logic
- **Independent Scaling**: Modules can be extracted to microservices without refactoring main app

## Directory Structure

```
server/src/
├── modules/                    # Feature domains (domain-driven)
│   ├── auth/
│   │   ├── auth.controller.js  # Login, signup handlers
│   │   └── auth.routes.js      # POST /api/auth/login, POST /api/auth/signup
│   │
│   ├── issues/
│   │   ├── issues.controller.js  # Create, update issue handlers
│   │   └── issues.routes.js      # POST/PATCH /api/issues
│   │
│   ├── entities/
│   │   ├── entities.controller.js  # Master data operations
│   │   └── entities.routes.js      # POST /api/entities (areas, departments, labour)
│   │
│   ├── state/
│   │   ├── state.controller.js  # Portal state aggregator
│   │   └── state.routes.js      # GET /api/state
│   │
│   ├── notifications/
│   │   ├── notifications.controller.js  # Notification handlers
│   │   └── notifications.routes.js      # PATCH /api/notifications/:id/read
│   │
│   ├── messages/
│   │   ├── messages.controller.js  # Chat message handlers
│   │   └── messages.routes.js      # GET/POST /api/messages/:issueId
│   │
│   └── bug-reports/
│       ├── bug-reports.controller.js  # User feedback handlers
│       └── bug-reports.routes.js      # POST/GET /api/bug-reports
│
├── shared/                         # Shared infrastructure
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   │
│   └── middlewares/
│       ├── auth.middleware.js    # JWT verification, role checking
│       └── error.middleware.js   # Global error handler
│
├── app.js                          # Express app setup + route registration
└── server.js                       # Entry point (listen on PORT)
```

## Module Anatomy

Each module follows this pattern:

```
modules/auth/
├── auth.controller.js      # Business logic handlers
└── auth.routes.js          # Route definitions
```

**Example: auth.routes.js**
```javascript
import express from "express";
import { login, signup } from "./auth.controller.js";

const router = express.Router();
router.post("/login", login);
router.post("/signup", signup);

export default router;
```

**Example: auth.controller.js**
```javascript
import pool from "../../shared/config/db.js";  // Shared db pool

export const login = async (req, res, next) => {
  // Handler logic
};
```

## Shared Utilities

### Database (`shared/config/db.js`)
- MySQL connection pool (10 connections, persistent)
- Imported by all modules as: `import pool from "../../shared/config/db.js"`

### Authentication Middleware (`shared/middlewares/auth.middleware.js`)
- `authenticateToken`: Verifies JWT, requires login
- `requireAdmin`: Checks user role is 'admin'
- `optionalAuth`: Allows logged-in or guest requests

## How to Add a New Module

1. Create folder: `server/src/modules/feature-name/`
2. Add `feature-name.controller.js` with handler functions
3. Add `feature-name.routes.js` with route definitions
4. Import and register in `app.js`:
   ```javascript
   import featureRoutes from "./modules/feature-name/feature-name.routes.js";
   app.use("/api/feature", featureRoutes);
   ```

## How to Extend a Module

- **Add a handler**: Add function to `module.controller.js`, export it
- **Add a route**: Add route to `module.routes.js`, import handler
- **Use database**: Import `pool` from `shared/config/db.js` and query

## Error Handling

All errors flow through the global error handler in `shared/middlewares/error.middleware.js`:
- Controllers call `next(err)` to pass errors
- Global handler catches and returns appropriate HTTP responses

## Scaling to Microservices

If a module grows beyond single-service scope:

1. **Extract**: Move `modules/feature/` to its own service repo
2. **API Gateway**: Point client requests through API gateway
3. **Database**: Each service owns its schema or shares via events

Example:
```
Old: client → api:5000/api/notifications
New: client → api-gateway → notifications-service:5001
```

Each module is independent and self-contained by design, so extraction is straightforward.
