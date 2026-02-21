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
npm run preview            # Preview production build
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

## Architecture

### Backend (`backend/`)
- **Framework**: Express.js 5 (CommonJS)
- **ORM**: Sequelize 6 with PostgreSQL driver (`pg`)
- **Structure**:
  - `src/index.js` — App entry point, mounts routes and middleware
  - `src/routes/` — Route modules: `auth.js`, `users.js`, `posts.js` (discussions)
  - `src/middlewares/` — Error handler (`errorHandler.js`) and 404 handler (`notFound.js`)
  - `db/models/` — Sequelize model definitions (configured via `db/models/index.js`)
  - `db/migrations/` — Schema migrations (run in order)
  - `db/seeders/` — Seed data for roles, permissions, users, and role-permission mappings
  - `config/config.js` — Sequelize DB config (reads from env vars)
  - `.sequelizerc` — Sequelize CLI path configuration

### Frontend (`frontend/`)
- **Framework**: React 19 with Vite 7 (ES Modules)
- **Entry**: `src/main.jsx` → `src/App.jsx`
- **Linting**: ESLint 9 flat config with React Hooks and React Refresh plugins

### Database Schema
PostgreSQL 15 with RBAC design:
- **Core**: Users, Roles, Permissions, Discussions, Comments, Sessions
- **Junction**: UserRoles, RolePermissions, ReactionDiscussion, ReactionComment
- **Seeded roles**: Admin, Moderator, User, Guest, Banned
- **Seeded users**: admin_alice (Admin), mod_bob (Moderator), user_charlie (User)

### Docker Services
| Service    | Port | Description               |
|------------|------|---------------------------|
| frontend   | 5173 | React dev server          |
| backend    | 3000 | Express API server        |
| db         | 5432 | PostgreSQL 15             |
| pgadmin    | 5050 | Database admin UI (admin@admin.com / root) |

## Environment Variables

Defined in root `.env`, used by Docker Compose and backend config:
- `NODE_ENV`, `PORT` — App environment and port
- `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT` — PostgreSQL connection

In development config (`config/config.js`), `DB_HOST` defaults to `localhost`; in test/docker it uses the `db` service hostname.

## Current State

API routes (`/auth/*`, `/users/*`, `/posts/*`) are stubbed with 501 responses — not yet implemented. The `/health` endpoint works. Frontend connects to backend health check with a hardcoded IP address.
