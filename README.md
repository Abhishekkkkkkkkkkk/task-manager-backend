# TaskFlow — Backend API

A secure, production-ready REST API for the TaskFlow Task Management System. Built with **Node.js + TypeScript + Prisma + PostgreSQL**.

---

## Live API

```
Production: https://your-app.onrender.com
Health Check: https://your-app.onrender.com/health
```

> Replace with your actual Render URL after deploying.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Local Setup Guide](#local-setup-guide)
- [Environment Variables](#environment-variables)
- [Deployment on Render](#deployment-on-render)
- [How Authentication Works](#how-authentication-works)
- [Scripts Reference](#scripts-reference)

---

## Features

- User registration and login with JWT authentication
- Access Token (15 min) + Refresh Token (7 days) with automatic rotation
- Password hashing with bcrypt (12 salt rounds)
- Secure logout that invalidates the refresh token in the database
- Full task CRUD — Create, Read, Update, Delete
- Toggle task status (PENDING → COMPLETED → PENDING)
- Task list with pagination, status filtering, and title search
- Tasks are strictly private — users only see their own tasks
- Zod validation on every request body
- Standardised JSON response format across all endpoints
- Global error handling with proper HTTP status codes

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v18+ | JavaScript runtime |
| Express | v4 | HTTP server and routing |
| TypeScript | v5 | Type safety |
| Prisma | v5 | ORM and database migrations |
| PostgreSQL | v15 | Database (hosted on Neon) |
| jsonwebtoken | v9 | JWT generation and verification |
| bcryptjs | v2 | Password hashing |
| Zod | v3 | Request validation |
| express-async-errors | latest | Clean async error handling |
| helmet | v7 | Security HTTP headers |
| cors | v2 | Cross-origin request policy |
| dotenv | v16 | Environment variable loading |

---

## Project Architecture

```
Request → Express → Middleware → Controller → Service → Prisma → PostgreSQL
                        │
                   ┌────┴────────────┐
                   │                 │
             auth.middleware    validate.middleware
             (JWT verify)       (Zod schema check)
```

### Request lifecycle

```
1. Request arrives at Express
2. helmet() adds security headers
3. cors() checks origin is allowed
4. express.json() parses the body
5. Route matched (e.g. PATCH /tasks/:id)
6. authenticate middleware verifies JWT
7. validate middleware checks body with Zod
8. Controller receives clean, typed data
9. Service runs business logic
10. Prisma executes database query
11. Response sent back as JSON
```

---

## Folder Structure

```
task-manager-backend/
├── prisma/
│   ├── schema.prisma              # Database models
│   └── migrations/                # Auto-generated SQL migrations
│       └── 20240101_init/
│           └── migration.sql
├── src/
│   ├── config/
│   │   └── env.ts                 # Validates + exports all env variables
│   ├── lib/
│   │   └── prisma.ts              # Prisma client singleton instance
│   ├── middleware/
│   │   ├── auth.middleware.ts     # Verifies JWT access token on protected routes
│   │   └── validate.middleware.ts # Runs Zod schema against req.body / req.query
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts # Handles register, login, refresh, logout
│   │   │   ├── auth.routes.ts     # Defines /auth/* routes
│   │   │   ├── auth.schema.ts     # Zod schemas for auth inputs
│   │   │   └── auth.service.ts    # Auth business logic (hashing, token gen)
│   │   └── tasks/
│   │       ├── tasks.controller.ts # Handles all task CRUD + toggle
│   │       ├── tasks.routes.ts     # Defines /tasks/* routes
│   │       ├── tasks.schema.ts     # Zod schemas for task inputs + query params
│   │       └── tasks.service.ts    # Task business logic + Prisma queries
│   ├── utils/
│   │   ├── jwt.ts                 # generateAccessToken, generateRefreshToken, verify*
│   │   └── response.ts            # sendSuccess() and sendError() helpers
│   └── app.ts                     # Express setup, middleware, routes, error handler
├── .env                           # Local environment variables (never commit)
├── .env.example                   # Template showing required variables
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Database Schema

### Prisma Schema

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  passwordHash  String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  tasks         Task[]
  refreshTokens RefreshToken[]
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

### Tables

**Users**
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Auto generated primary key |
| email | String | Unique — used for login |
| name | String | Display name |
| passwordHash | String | bcrypt hash, never plain text |
| createdAt | DateTime | Auto set |
| updatedAt | DateTime | Auto updated |

**Tasks**
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Auto generated primary key |
| title | String | Required |
| description | String? | Optional |
| status | Enum | PENDING, IN_PROGRESS, COMPLETED |
| dueDate | DateTime? | Optional |
| userId | String | Foreign key → Users.id |
| createdAt | DateTime | Auto set |
| updatedAt | DateTime | Auto updated |

**RefreshTokens**
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Auto generated primary key |
| token | String | Unique JWT string |
| userId | String | Foreign key → Users.id |
| expiresAt | DateTime | 7 days from creation |
| createdAt | DateTime | Auto set |

### Relationships
```
User  ──<  Task           one user → many tasks
User  ──<  RefreshToken   one user → many refresh tokens
```
`onDelete: Cascade` — deleting a user automatically deletes all their tasks and tokens.

---

## API Endpoints

### Base URL
```
Local:      http://localhost:4000
Production: https://your-app.onrender.com
```

### Standard Response Format

Every response follows this shape:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { ... }   // only on paginated responses
}

// Error
{
  "success": false,
  "message": "Descriptive error message"
}
```

---

### Auth Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create new account |
| POST | `/auth/login` | No | Login and receive tokens |
| POST | `/auth/refresh` | No | Get new access token |
| POST | `/auth/logout` | No | Invalidate refresh token |

#### POST `/auth/register`

```json
// Request body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-04-05T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}

// Error 409 — email already exists
{
  "success": false,
  "message": "Email already in use"
}
```

#### POST `/auth/login`

```json
// Request body
{
  "email": "jane@example.com",
  "password": "password123"
}

// Response 200 — same shape as register

// Error 401 — wrong credentials
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### POST `/auth/refresh`

```json
// Request body
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

#### POST `/auth/logout`

```json
// Request body
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}

// Response 200
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

### Task Routes

> All task routes require: `Authorization: Bearer <accessToken>`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks (paginated) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/:id` | Get one task by ID |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/toggle` | Toggle task status |

#### GET `/tasks`

Query parameters:

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| status | string | — | Filter: PENDING, IN_PROGRESS, COMPLETED |
| search | string | — | Search in task title |

```
GET /tasks?page=1&limit=10&status=PENDING&search=groceries
Authorization: Bearer eyJhbGci...
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx789ghi",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "PENDING",
      "dueDate": "2026-04-10T00:00:00.000Z",
      "userId": "clx123abc",
      "createdAt": "2026-04-05T10:00:00.000Z",
      "updatedAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST `/tasks`

```json
// Request body
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "PENDING",
  "dueDate": "2026-04-10T00:00:00.000Z"
}

// Response 201
{
  "success": true,
  "data": { ...task }
}
```

#### PATCH `/tasks/:id`

```json
// Request body — all fields optional
{
  "title": "Buy groceries and fruits",
  "status": "IN_PROGRESS"
}

// Response 200
{
  "success": true,
  "data": { ...updatedTask }
}
```

#### PATCH `/tasks/:id/toggle`

No request body needed. Toggles:
- `PENDING` → `COMPLETED`
- `IN_PROGRESS` → `COMPLETED`
- `COMPLETED` → `PENDING`

```json
// Response 200
{
  "success": true,
  "data": { ...taskWithNewStatus }
}
```

#### DELETE `/tasks/:id`

```json
// Response 200
{
  "success": true,
  "data": { "message": "Task deleted successfully" }
}
```

---

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / validation failed |
| 401 | Unauthorized / invalid token |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already exists) |
| 500 | Internal server error |

---

## Local Setup Guide

### Step 1 — Prerequisites

```bash
node --version   # Must be v18 or higher
npm --version    # Must be v9 or higher
```

You also need a PostgreSQL database. Easiest option is [Neon](https://neon.tech) (free):
1. Sign up at neon.tech
2. Create a project
3. Copy the connection string

### Step 2 — Clone and install

```bash
git clone https://github.com/YOUR-USERNAME/task-manager-backend.git
cd task-manager-backend
npm install
```

### Step 3 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see Environment Variables section below).

### Step 4 — Set up the database

```bash
# Creates all tables in your PostgreSQL database
npx prisma migrate dev --name init

# Optional: open the visual database browser
npx prisma studio
```

### Step 5 — Start the server

```bash
npm run dev
```

You should see:
```
Server running on port 4000 in development mode
```

### Step 6 — Test it

Open in browser:
```
http://localhost:4000/health
```

Expected response:
```json
{ "status": "ok", "env": "development" }
```

Then test with Thunder Client (VS Code extension) or Postman:
- `POST http://localhost:4000/auth/register` with a JSON body
- `POST http://localhost:4000/auth/login`
- Copy the `accessToken` from the response
- `GET http://localhost:4000/tasks` with `Authorization: Bearer <token>` header

---

## Environment Variables

Create a `.env` file in the project root:

```env
# ── Database ──────────────────────────────────────────
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"

# ── Server ────────────────────────────────────────────
PORT=4000
NODE_ENV=development

# ── JWT Secrets ───────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run twice — use different values for each secret
JWT_ACCESS_SECRET="paste-a-long-random-string-here"
JWT_REFRESH_SECRET="paste-a-different-long-random-string-here"

# ── JWT Expiry ────────────────────────────────────────
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── CORS ──────────────────────────────────────────────
CLIENT_URL="http://localhost:3000"
```

### `.env.example` (commit this file — no real values)

```env
DATABASE_URL=""
PORT=4000
NODE_ENV=development
JWT_ACCESS_SECRET=""
JWT_REFRESH_SECRET=""
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL="http://localhost:3000"
```

---

## Deployment on Render

### Step 1 — Push to GitHub
```bash
git add .
git commit -m "ready for deployment"
git push
```

### Step 2 — Create a Web Service on Render
1. Go to [render.com](https://render.com) → sign up with GitHub
2. Click **New +** → **Web Service**
3. Select your `task-manager-backend` repository

### Step 3 — Configure the service

| Setting | Value |
|---|---|
| Name | task-manager-backend |
| Region | Singapore |
| Branch | main |
| Build Command | `npm install && npm run build && npx prisma migrate deploy` |
| Start Command | `node dist/app.js` |
| Instance Type | **Free** |

### Step 4 — Add environment variables

Add all variables from the `.env` section. Use your Neon connection string for `DATABASE_URL`. Set `NODE_ENV=production` and `CLIENT_URL` to your Vercel frontend URL.

### Step 5 — Deploy

Click **Create Web Service**. First deploy takes 3-5 minutes. You get a URL like:
```
https://task-manager-backend.onrender.com
```

### Step 6 — Keep it awake (free tier fix)

The free tier sleeps after 15 min of no traffic. Use [UptimeRobot](https://uptimerobot.com):
- Monitor Type: HTTP(s)
- URL: `https://your-app.onrender.com/health`
- Interval: 5 minutes

### Auto-redeploy

Every `git push` to `main` triggers an automatic redeploy on Render.

---

## How Authentication Works

### Two-token system

```
Login
  │
  ├── Access Token  (JWT, 15 min)  → sent with every API request
  └── Refresh Token (JWT, 7 days)  → stored in DB, used only to get new access token

Request flow:
  Frontend → Authorization: Bearer <accessToken> → Server validates → OK

When access token expires:
  Frontend gets 401 → axios interceptor calls POST /auth/refresh
  → Server issues new access token + new refresh token
  → Old refresh token deleted (rotation)
  → Original request retried automatically
```

### Refresh token rotation

Every time a refresh token is used, it is deleted and a brand new one is issued. This means:
- Stolen refresh tokens can only be used once
- After the legitimate user refreshes, the stolen token is invalid

### Password security

Passwords are never stored. Only the bcrypt hash (12 rounds) is stored. Even if the database is leaked, passwords cannot be recovered.

---

## Scripts Reference

```bash
# Development
npm run dev          # Start with hot reload (ts-node-dev)

# Production
npm run build        # Compile TypeScript → JavaScript (output: dist/)
npm start            # Run compiled JavaScript

# Database
npx prisma migrate dev --name <name>   # Create and apply a new migration
npx prisma migrate deploy              # Apply all pending migrations (production)
npx prisma studio                      # Open visual DB browser at localhost:5555
npx prisma generate                    # Regenerate Prisma client after schema change
npx prisma db push                     # Push schema without creating migration file
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `Missing environment variable: DATABASE_URL` | Add it to your `.env` file |
| `prisma migrate failed` | Check your DATABASE_URL is correct and DB is reachable |
| `Invalid or expired token` | Access token expired — frontend should auto-refresh |
| `CORS error` | Make sure `CLIENT_URL` in `.env` matches your frontend URL exactly |
| `Cannot find module dist/app.js` | Run `npm run build` first |
| Port already in use | Change `PORT` in `.env` or kill the process using that port |