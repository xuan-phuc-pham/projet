# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack forum/discussion application with role-based access control (RBAC). Monorepo with a Node.js/Express backend, React/Vite frontend, and PostgreSQL database. The entire stack runs via Docker Compose.

## Commands

### Running the full stack
```bash
docker-compose up          # Start all services (frontend, backend, db, pgadmin)
docker-compose up --build  # Rebuild and start
docker-compose down        # Stop all services
```

### Backend (from `backend/`)
```bash
npm run dev                # Dev server with nodemon (port 3000)
npm start                  # Production server
```

### Frontend (from `frontend/`)
```bash
npm run dev                # Vite dev server (port 5173)
npm run build              # Production build
npm run lint               # ESLint
```

### Database (Sequelize CLI, from `backend/`)
```bash
npx sequelize-cli db:migrate        # Run all migrations
npx sequelize-cli db:migrate:undo   # Undo last migration
npx sequelize-cli db:seed:all       # Run all seeders
npx sequelize-cli db:seed:undo:all  # Undo all seeders
```

When running inside Docker, prefix with `docker-compose exec backend`:
```bash
docker-compose exec backend npx sequelize-cli db:migrate
docker-compose exec backend npx sequelize-cli db:seed:all
```

No automated test framework is configured. Manual API tests are documented in `test_backend.md` (curl commands).

## Architecture

### Backend (`backend/`)
- **Framework**: Express.js 5 (CommonJS modules)
- **ORM**: Sequelize 6 with PostgreSQL driver (`pg`)
- **Entry**: `src/index.js` → `src/app.js` (Express config, middleware, route mounting)
- **Config**: `src/config/index.js` exports `env`, `port`, `jwtSecret`, `jwtExpiresIn`, `frontendUrl`
- **Routes** (`src/routes/`): `auth.js`, `users.js`, `discussions.js`, `comments.js` (sub-router merged via `mergeParams`)
- **Middleware** (`src/middleware/`):
  - `authenticate.js` — JWT from cookie (`session_token`) or `Authorization: Bearer` header; validates against Sessions table; loads user with roles+permissions; also exports `optionalAuth`
  - `authorize.js` — `requirePermission(...perms)` (OR logic) and `hasPermission(req, name)` helper
  - `validate.js` — Custom rule-based body validator; also exports `validateId()` and `REACTION_TYPES`
  - `errorHandler.js` — Handles Sequelize validation/unique errors as 400
  - `notFound.js` — Catch-all 404
- **Services** (`src/services/auth.js`): JWT generation/verification, bcrypt hashing, session CRUD, user registration (with transaction), role caching
- **Utils** (`src/utils/sanitize.js`): HTML escaping for user content (title, content fields)
- **Controllers**: Directory exists but is empty — all logic lives directly in route handlers

### Frontend (`frontend/`)
- **Framework**: React 19 with Vite 7 (ES Modules)
- **API layer** (`src/api/client.js`): Custom fetch wrapper with `credentials: 'include'`; base URL from `VITE_BACKEND_URL` (defaults to `http://localhost:3000`)
- **Auth** (`src/context/AuthContext.jsx`): Provides `user`, `login`, `register`, `logout`, `hasPermission`; restores session via `GET /auth/me` on mount
- **Hook** (`src/hooks/useAuth.js`): `useAuth()` context accessor
- **Pages** (`src/pages/`): `LoginPage`, `RegisterPage`, `HomePage` (paginated discussions), `DiscussionPage` (full thread with comments/reactions)
- **Components** (`src/components/`): `Navbar`, `ProtectedRoute`, `DiscussionCard`, `DiscussionForm`, `CommentForm`, `ReactionBar`, `Pagination`
- **Styling**: Hand-written CSS with custom properties in `index.css`, component classes in `App.css`
- **Linting**: ESLint 9 flat config; `no-unused-vars` ignores `/^[A-Z_]/`

### Database Schema
PostgreSQL 15 with RBAC design:
- **Core tables**: Users, Roles, Permissions, Discussions, Comments, Sessions
- **Junction tables**: UserRoles (`u_id`/`r_id`), RolePermissions (`r_id`/`p_id`), ReactionDiscussions, ReactionComments
- **Known typo**: `ReactionDiscussions` uses `disscussion_id` (double 's') — consistent throughout models, migrations, and routes
- **Reaction types** (ENUM): `like`, `dislike`, `love`, `wow`, `haha`, `sad`, `angry`
- **Seeded roles**: Admin, Moderator, User, Guest, Banned
- **Seeded users**: `admin_alice`/`admin123`, `mod_bob`/`mod123`, `user_charlie`/`user123`, `user_diana`/`user123`, `banned_eve`/`banned123`
- **Migrations** are numbered 1–9, then 91 (Sessions)

### Docker Services
| Service    | Port | Description               |
|------------|------|---------------------------|
| frontend   | 5173 | React dev server          |
| backend    | 3000 | Express API server        |
| db         | 5432 | PostgreSQL 15             |
| pgadmin    | 5050 | Database admin UI (admin@admin.com / root) |

## Key Conventions

### API Response Shape
- Success: `{ success: true, data: { ... } }`
- Error: `{ success: false, error: "message" }`
- Paginated: `{ success: true, data: { items: [], pagination: { page, limit, total, pages } } }`

### Permission Naming
Format: `resource.action.scope` — e.g., `discussion.create`, `comment.edit.own`, `user.ban.any`. The `.own` vs `.any` distinction is enforced in route handlers by checking resource ownership after middleware passes.

### Sequelize Patterns
- Models use factory pattern: `(sequelize, DataTypes) => { class X extends Model {...}; X.init({...}); return X; }`
- Multi-table writes use Sequelize transactions with try/catch rollback
- `db/models/index.js` auto-loads all model files and calls `associate()`

### Security
- Rate limiting on auth endpoints (20 req/15 min)
- Helmet headers, CORS locked to `FRONTEND_URL`, HttpOnly cookies
- Server-side session invalidation on logout
- HTML escaping on user-generated content

## Environment Variables

Defined in root `.env`:
- `NODE_ENV`, `PORT` — App environment and port
- `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT` — PostgreSQL connection
- `JWT_SECRET`, `JWT_EXPIRES_IN` — JWT configuration
- `FRONTEND_URL` — Backend CORS origin (defaults to `http://localhost:5173`)
- `VITE_BACKEND_URL` — Frontend API base URL (defaults to `http://localhost:3000`)

## Current State

Backend API is fully implemented: auth (register/login/logout/me), discussions CRUD with reactions, comments CRUD with reactions, user management with ban/unban. Frontend has pages and components built but `App.jsx` still needs to be wired up with React Router and `AuthProvider`. Admin and profile pages referenced in `Navbar` do not exist yet.