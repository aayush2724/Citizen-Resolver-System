# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- MySQL 8+ (if not using Docker)

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret for signing JWTs | `your_random_secret_here` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `secure_password` |
| `MYSQL_PASSWORD` | MySQL user password | `secure_password` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:80` |
| `ALLOW_PUBLIC_ADMIN_SIGNUP` | Allow public admin signup | `false` |
| `ADMIN_SIGNUP_CODE` | Code required for admin signup | _(none)_ |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

## Docker Deployment

```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with your values

# 2. Build and start
docker-compose up -d

# 3. Check services
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api
- MySQL: localhost:3306

## Local Development

```bash
# Install all dependencies
npm run install:all

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with your values

# Initialize database (requires MySQL running)
npm run init:db

# Start development servers
npm run dev
```

## Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ random bytes)
- [ ] Disable `ALLOW_PUBLIC_ADMIN_SIGNUP`
- [ ] Set `CORS_ORIGIN` to your domain
- [ ] Use HTTPS (nginx/caddy in front)
- [ ] Set `NODE_ENV=production`
- [ ] Backup database volume regularly

## Health Check

The backend provides `/api/health` endpoint for monitoring.