# TaskFlow — Full Stack Task Management System

A complete, production-ready Task Management System built with **Node.js + TypeScript** on the backend and **Next.js + TypeScript** on the frontend. Users can register, log in, and fully manage their personal tasks with filtering, searching, and pagination.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | `https://your-app.vercel.app` |
| Backend API | `https://your-app.onrender.com` |
| Health Check | `https://your-app.onrender.com/health` |

> Replace these URLs with your actual deployment URLs after deploying.

---

## Screenshots

### Login Page
> _Add your login page screenshot here_
> Tip: Press `Windows + Shift + S` to take a screenshot, save it in a `/screenshots` folder, then add it like this:
```
![Login Page](./screenshots/login.png)
```

### Register Page
```
![Register Page](./screenshots/register.png)
```

### Task Dashboard
```
![Dashboard](./screenshots/dashboard.png)
```

### Create / Edit Task Modal
```
![Task Modal](./screenshots/task-modal.png)
```

### Database Schema (Neon PostgreSQL)
```
![Database](./screenshots/database.png)
```

> **How to add screenshots:**
> 1. Create a `screenshots/` folder inside your frontend repo
> 2. Take screenshots of each page
> 3. Save them in that folder
> 4. Replace the placeholder text above with the actual image links
> 5. Push to GitHub — they will show up in the README automatically

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
- [Deployment](#deployment)
- [How Authentication Works](#how-authentication-works)

---

## Features

### Authentication
- User registration with name, email, and password
- Secure login with JWT access tokens (15 min expiry)
- Refresh token rotation (7 day expiry) — stay logged in automatically
- Password hashing with bcrypt (12 salt rounds)
- Secure logout that invalidates the refresh token

### Task Management
- Create, read, update, and delete personal tasks
- Toggle task status between Pending, In Progress, and Completed
- Filter tasks by status
- Search tasks by title
- Pagination with configurable page size
- Tasks are private — each user only sees their own tasks

### Frontend
- Fully responsive — works on desktop and mobile
- Toast notifications for all actions (create, update, delete)
- Loading skeletons while data is fetching
- Form validation with clear error messages
- Auto token refresh — users never get unexpectedly logged out
- Empty states and error states handled gracefully

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and routing |
| TypeScript | Type safety throughout |
| Prisma ORM | Database queries and migrations |
| PostgreSQL (Neon) | Data storage |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Zod | Request validation |
| express-async-errors | Clean async error handling |
| helmet | Security headers |
| cors | Cross-origin request handling |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Axios | HTTP client with interceptors |
| React Hook Form | Form state management |
| Zod | Client-side form validation |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |

### DevOps
| Service | Purpose |
|---|---|
| GitHub | Source control |
| Vercel | Frontend hosting (free) |
| Render | Backend hosting (free) |
| Neon | PostgreSQL database (free) |
| UptimeRobot | Keep backend awake (free) |

---

## Project Architecture

```
User (Browser / Mobile)
        │
        ▼
┌─────────────────┐
│   Vercel        │  Next.js frontend
│   Port 3000     │  Login, Register, Dashboard
└────────┬────────┘
         │ HTTPS REST API calls
         ▼
┌─────────────────┐
│   Render        │  Node.js + Express backend
│   Port 4000     │  Auth routes, Task routes
│                 │  JWT middleware, Zod validation
└────────┬────────┘
         │ Prisma ORM queries
         ▼
┌─────────────────┐
│   Neon          │  PostgreSQL database
│   PostgreSQL    │  Users, Tasks, RefreshTokens
└─────────────────┘
```

### Authentication Flow
```
1. User registers / logs in
        │
        ▼
2. Server validates with Zod
        │
        ▼
3. Password checked with bcrypt
        │
        ▼
4. Server issues:
   - Access Token  (JWT, 15 minutes)
   - Refresh Token (JWT, 7 days, stored in DB)
        │
        ▼
5. Frontend stores both tokens in localStorage
        │
        ▼
6. Every API request attaches Access Token in header:
   Authorization: Bearer <accessToken>
        │
        ▼
7. When Access Token expires (401 response):
   - Axios interceptor automatically calls POST /auth/refresh
   - Gets new Access Token silently
   - Retries the original request
   - User never notices
```

---

## Folder Structure

### Backend — `task-manager-backend/`

```
task-manager-backend/
├── prisma/
│   ├── schema.prisma          # Database models (User, Task, RefreshToken)
│   └── migrations/            # Auto-generated migration files
├── src/
│   ├── config/
│   │   └── env.ts             # Central environment variable config
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification middleware
│   │   └── validate.middleware.ts  # Zod request validation middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Register, login, refresh, logout handlers
│   │   │   ├── auth.routes.ts      # Auth route definitions
│   │   │   ├── auth.schema.ts      # Zod schemas for auth inputs
│   │   │   └── auth.service.ts     # Auth business logic
│   │   └── tasks/
│   │       ├── tasks.controller.ts # CRUD + toggle handlers
│   │       ├── tasks.routes.ts     # Task route definitions
│   │       ├── tasks.schema.ts     # Zod schemas for task inputs
│   │       └── tasks.service.ts    # Task business logic
│   ├── utils/
│   │   ├── jwt.ts             # Token generation and verification
│   │   └── response.ts        # Standardised API response helpers
│   └── app.ts                 # Express app entry point
├── .env                       # Environment variables (never commit this)
├── .gitignore
├── package.json
└── tsconfig.json
```

### Frontend — `task-manager-frontend/`

```
task-manager-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page
│   │   │   └── register/
│   │   │       └── page.tsx         # Register page
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       └── page.tsx         # Main task dashboard
│   │   ├── layout.tsx               # Root layout with toast provider
│   │   └── page.tsx                 # Redirects to /login
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx        # Login form with validation
│   │   │   └── RegisterForm.tsx     # Register form with confirm password
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx         # Single task card with actions
│   │   │   ├── TaskFilters.tsx      # Search bar + status filter tabs
│   │   │   ├── TaskForm.tsx         # Create / edit task form
│   │   │   ├── TaskList.tsx         # Task list with skeletons + empty state
│   │   │   └── TaskModal.tsx        # Modal wrapper for TaskForm
│   │   └── ui/
│   │       ├── Button.tsx           # Reusable button with variants
│   │       ├── Input.tsx            # Reusable input with label + error
│   │       └── Modal.tsx            # Base modal (Escape key, backdrop click)
│   ├── lib/
│   │   ├── api.ts                   # Axios instance with token interceptors
│   │   ├── auth.ts                  # Token storage helpers (localStorage)
│   │   ├── utils.ts                 # cn() class merging utility
│   │   └── hooks/
│   │       ├── useAuth.ts           # Login, register, logout logic
│   │       └── useTasks.ts          # All task CRUD operations + state
│   └── types/
│       └── index.ts                 # Shared TypeScript interfaces
├── .env.local                       # Frontend environment variables
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

### Users table
| Column | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key, auto generated |
| email | String | Unique, used for login |
| name | String | Display name |
| passwordHash | String | bcrypt hashed password |
| createdAt | DateTime | Auto set on creation |
| updatedAt | DateTime | Auto updated |

### Tasks table
| Column | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key, auto generated |
| title | String | Task title (required) |
| description | String? | Optional description |
| status | Enum | PENDING, IN_PROGRESS, COMPLETED |
| dueDate | DateTime? | Optional due date |
| userId | String | Foreign key → Users.id |
| createdAt | DateTime | Auto set on creation |
| updatedAt | DateTime | Auto updated |

### RefreshTokens table
| Column | Type | Description |
|---|---|---|
| id | String (cuid) | Primary key |
| token | String | Unique JWT refresh token |
| userId | String | Foreign key → Users.id |
| expiresAt | DateTime | Token expiry date |
| createdAt | DateTime | Auto set on creation |

### Relationships
```
User ──┬──< Task          (one user has many tasks)
       └──< RefreshToken  (one user has many refresh tokens)
```

---

## API Endpoints

### Base URL
```
Local:      http://localhost:4000
Production: https://your-app.onrender.com
```

### Auth Routes — `/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create new account |
| POST | `/auth/login` | No | Login and get tokens |
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
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
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
```

#### POST `/auth/refresh`
```json
// Request body
{
  "refreshToken": "eyJhbGci..."
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Task Routes — `/tasks`

> All task routes require `Authorization: Bearer <accessToken>` header

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks (paginated, filterable) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/:id` | Get a single task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/toggle` | Toggle task status |

#### GET `/tasks` — Query Parameters
| Param | Type | Example | Description |
|---|---|---|---|
| page | number | `?page=1` | Page number (default: 1) |
| limit | number | `?limit=10` | Items per page (default: 10, max: 50) |
| status | string | `?status=PENDING` | Filter by status |
| search | string | `?search=groceries` | Search in title |

```json
// Response 200
{
  "success": true,
  "data": [ ...tasks ],
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
  "data": {
    "id": "clx...",
    "title": "Buy groceries",
    "status": "PENDING",
    "userId": "clx..."
  }
}
```

---

## Local Setup Guide

### Prerequisites

Make sure you have these installed:

```bash
node --version    # v18 or higher
npm --version     # v9 or higher
git --version     # any recent version
```

Also needed:
- A [Neon](https://neon.tech) account (free) for PostgreSQL
- Or install PostgreSQL locally

---

### Step 1 — Clone both repositories

```bash
# Clone backend
git clone https://github.com/YOUR-USERNAME/task-manager-backend.git
cd task-manager-backend

# Clone frontend (open a new terminal)
git clone https://github.com/YOUR-USERNAME/task-manager-frontend.git
cd task-manager-frontend
```

---

### Step 2 — Backend setup

```bash
cd task-manager-backend

# Install all dependencies
npm install

# Create your environment file
cp .env.example .env
```

Now open `.env` and fill in your values (see Environment Variables section below).

```bash
# Generate the Prisma client and create database tables
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

You should see:
```
Server running on port 4000 in development mode
```

Test it: open `http://localhost:4000/health` in your browser — you should see `{ "status": "ok" }`.

---

### Step 3 — Frontend setup

```bash
cd task-manager-frontend

# Install all dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Open `.env.local` and fill in the backend URL.

```bash
# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser — the app should load.

---

### Step 4 — Test the full flow

1. Go to `http://localhost:3000/register`
2. Create an account
3. You will be redirected to the dashboard
4. Create, edit, toggle, and delete tasks
5. Sign out and sign back in — your tasks should still be there

---

## Environment Variables

### Backend — `.env`

```env
# Database
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"

# Server
PORT=4000
NODE_ENV=development

# JWT — generate secure random strings for these
JWT_ACCESS_SECRET="paste-a-long-random-string-here"
JWT_REFRESH_SECRET="paste-a-different-long-random-string-here"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — your frontend URL
CLIENT_URL="http://localhost:3000"
```

To generate secure JWT secrets, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run it twice — use one output for `JWT_ACCESS_SECRET` and a different one for `JWT_REFRESH_SECRET`.

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

For production, change this to your Render backend URL:
```env
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

---

## Deployment

### Database — Neon (free PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project named `task-manager`
3. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```
4. Use this as your `DATABASE_URL` in both local `.env` and Render

---

### Backend — Render (free)

1. Sign up at [render.com](https://render.com) with GitHub
2. Click **New +** → **Web Service**
3. Connect your `task-manager-backend` GitHub repo
4. Fill in the settings:

| Setting | Value |
|---|---|
| Name | task-manager-backend |
| Region | Singapore (or closest to you) |
| Branch | main |
| Build Command | `npm install && npm run build && npx prisma migrate deploy` |
| Start Command | `node dist/app.js` |
| Instance Type | **Free** |

5. Add all environment variables from the backend `.env` section above
6. Set `CLIENT_URL` to your Vercel URL (update this after frontend deploys)
7. Click **Create Web Service**
8. Wait 3-5 minutes — you get a URL like `https://task-manager-backend.onrender.com`

> **Note:** The free tier sleeps after 15 minutes of inactivity. First request after sleeping takes ~30 seconds. Use [UptimeRobot](https://uptimerobot.com) (free) to ping `/health` every 5 minutes to keep it awake.

---

### Frontend — Vercel (free)

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Click **Add New Project**
3. Import your `task-manager-frontend` repo
4. Add environment variable:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-app.onrender.com` |

5. Click **Deploy**
6. You get a URL like `https://task-manager-frontend.vercel.app`
7. Go back to Render → update `CLIENT_URL` to this Vercel URL
8. Render will auto-redeploy with the updated value

---

### Keep backend awake — UptimeRobot (free)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Click **Add New Monitor**
3. Set:
   - Monitor Type: **HTTP(s)**
   - Friendly Name: Task Manager Backend
   - URL: `https://your-app.onrender.com/health`
   - Monitoring Interval: **5 minutes**
4. Click **Create Monitor**

Your backend will now stay awake permanently.

---

### Auto-deploy on code changes

Both Vercel and Render watch your GitHub repos. Every time you push to the `main` branch, they automatically redeploy within 1-2 minutes:

```bash
# Make your changes, then:
git add .
git commit -m "describe your change"
git push
# Both frontend and backend redeploy automatically
```

---

## How Authentication Works

### Why two tokens?

A single long-lived token is risky — if someone steals it, they have access forever. Instead we use two tokens:

- **Access Token** — short-lived (15 min). Used for every API request. If stolen, expires quickly.
- **Refresh Token** — long-lived (7 days). Only used to get a new Access Token. Stored in the database so it can be revoked (logout).

### Token refresh flow

```
1. User logs in → gets Access Token (15min) + Refresh Token (7days)
2. Frontend stores both in localStorage
3. Every request attaches Access Token to Authorization header
4. After 15 minutes, Access Token expires
5. Next request gets 401 response
6. Axios interceptor catches the 401 automatically
7. Interceptor calls POST /auth/refresh with the Refresh Token
8. Server verifies Refresh Token, issues NEW Access Token + NEW Refresh Token
9. Old Refresh Token is deleted from database (rotation)
10. Original failed request is retried with the new Access Token
11. User never sees any interruption
```

### Concurrent request handling

If 5 requests fire at the same time and all get 401:
- Only the **first** one triggers a refresh
- The other 4 are queued and wait
- Once the refresh succeeds, all 4 retry with the new token
- No duplicate refresh calls

---

## Common Issues and Fixes

| Issue | Cause | Fix |
|---|---|---|
| `ECONNRESET` during npm install | Unstable network | Run `npm config set fetch-retries 5` then retry |
| `Cannot connect to database` | Wrong DATABASE_URL | Check the connection string in `.env` |
| `401 on all requests` | Wrong API URL in frontend | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| `CORS error` in browser | CLIENT_URL mismatch | Update `CLIENT_URL` in backend to match frontend URL exactly |
| `prisma migrate failed` on Render | Missing DATABASE_URL | Add it in Render environment variables |
| Backend sleeps (30s delay) | Render free tier | Set up UptimeRobot to ping `/health` every 5 minutes |
| Mobile can't reach localhost | localhost is device-specific | Use your PC's local IP like `192.168.1.x` |

---

## Scripts Reference

### Backend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server (after build)
```

### Frontend
```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Prisma
```bash
npx prisma migrate dev --name <name>   # Create and run a new migration
npx prisma migrate deploy              # Apply migrations in production
npx prisma studio                      # Open visual database browser
npx prisma generate                    # Regenerate Prisma client
```

---

## Project Author

Built as a Full-Stack Software Engineering Assessment.

- **Track:** Full-Stack (Backend + Web Frontend)
- **Backend:** Node.js + TypeScript + Prisma + PostgreSQL
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS

---

## License

This project is for assessment and educational purposes.