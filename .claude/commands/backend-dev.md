# Backend Development Assistant

You are helping develop the backend of a full-stack forum/social media application with RBAC.

## Critical Rules

1. **NEVER run terminal commands yourself.** The user has sudo/Docker permissions — you do not. When a command needs to be run (migrations, seeds, Docker, testing), **output the exact command** for the user to execute and wait for them to paste the result back.
2. **Write code, suggest commands.** Your job is to write/edit backend code (routes, models, middleware, migrations, seeders). The user handles execution.
3. **Always read before editing.** Never modify a file you haven't read in this session.

## Project Context

- **Framework**: Express.js 5 (CommonJS)
- **ORM**: Sequelize 6 + PostgreSQL 15
- **Auth**: bcryptjs for password hashing
- **Structure**:
  - `backend/src/index.js` — Entry point
  - `backend/src/routes/` — Route modules (auth.js, users.js, posts.js)
  - `backend/src/middlewares/` — Middleware (errorHandler.js, notFound.js)
  - `backend/db/models/` — Sequelize models
  - `backend/db/migrations/` — Schema migrations
  - `backend/db/seeders/` — Seed data
  - `backend/config/config.js` — DB config

## Database Schema

| Table | Key Columns |
|-------|------------|
| Users | id, username, password (bcrypt), fname, lname |
| Roles | id, role_name, description |
| Permissions | id, name (e.g. `discussion.create`) |
| UserRoles | u_id → Users, r_id → Roles |
| RolePermissions | r_id → Roles, p_id → Permissions |
| Discussions | id, owner_id → Users, title, content |
| Comments | id, user_id → Users, discussion_id → Discussions, content |
| Sessions | id, u_id → Users, session |
| ReactionDiscussions | user_id, disscussion_id (typo in schema), type (ENUM) |
| ReactionComments | user_id, comment_id, type (ENUM) |

**Roles**: Admin, Moderator, User, Guest, Banned
**Reaction types**: like, dislike, love, wow, haha, sad, angry

## Docker Commands (for user to run)

```bash
# Rebuild and start
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml up -d --build backend db

# Run migrations
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml exec backend npx sequelize-cli db:migrate

# Run seeds
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml exec backend npx sequelize-cli db:seed:all

# Undo seeds
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml exec backend npx sequelize-cli db:seed:undo:all

# View backend logs
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml logs -f backend

# Test an endpoint
curl http://localhost:3000/health
```

## Workflow

1. When the user describes a feature or bug, explore the relevant code first
2. Write/edit the necessary files (routes, models, middleware, migrations)
3. If DB changes are needed, create a new migration file
4. Provide the user with the exact commands to run (migrate, seed, rebuild, test)
5. Wait for the user to report the result before proceeding

## Security Requirements

Every piece of code you write MUST follow these security practices. Treat these as non-negotiable.

### Authentication & Sessions
- **Never store plaintext passwords.** Always hash with bcryptjs (cost factor 10).
- **Never expose password hashes** in API responses — exclude `password` from all user queries using Sequelize `attributes: { exclude: ['password'] }`.
- **Use secure, httpOnly, sameSite cookies** for session tokens. Never store tokens in localStorage.
- **Regenerate session IDs** after login to prevent session fixation.
- **Set session expiry** — sessions must not live forever. Implement a TTL.

### Input Validation & Sanitization
- **Validate all input** at the route level before it reaches the DB. Check types, lengths, and formats.
- **Sanitize user-generated content** (discussion titles, content, comments) to prevent stored XSS. Strip or escape HTML tags.
- **Use parameterized queries only.** Sequelize does this by default — never use `sequelize.query()` with string concatenation.
- **Limit input lengths** — enforce maximum lengths for username (30), title (200), content (10000), comments (5000).
- **Validate enum values server-side** (e.g. reaction types) — never trust the client.

### Authorization & RBAC
- **Check permissions on every protected route** using middleware. Never rely on frontend hiding UI elements.
- **Verify resource ownership** for `.own` operations — always compare `req.user.id` against the resource's owner/user ID from the DB, not from the request body.
- **Banned users get nothing.** Check ban status in auth middleware before any route handler runs.
- **Admin/Mod escalation protection** — only Admins can assign the Admin role. Moderators cannot promote themselves or others to Admin.
- **Never trust client-supplied IDs for authorization** — always fetch the resource from DB and check ownership.

### API Security
- **Rate limit** auth endpoints (login, register) to prevent brute-force attacks.
- **Use CORS properly** — restrict allowed origins, don't use `*` in production.
- **Never leak internal details** in error messages — return generic messages to the client, log details server-side.
- **Return consistent error shapes**: `{ success: false, error: "message" }` with appropriate HTTP status codes.
- **Use helmet** or equivalent security headers (X-Content-Type-Options, X-Frame-Options, etc.).

### Data Protection
- **Never return sensitive fields** — always explicitly select which fields to return rather than returning entire model instances.
- **Paginate list endpoints** — never return unbounded query results. Default to 20 items, max 100.
- **Prevent mass assignment** — use explicit allowlists when creating/updating records, never pass `req.body` directly to `Model.create()`.

### SQL & ORM Safety
- **Always use Sequelize model methods** (findByPk, findAll, create, update, destroy) — never raw SQL unless absolutely necessary.
- **Use transactions** for any operation that touches multiple tables.
- **Scope deletions** — soft-delete where possible, cascade-delete only where the schema requires it.

## Conventions

- Use `resource.action.scope` for permission names (e.g. `discussion.edit.own`)
- All routes return JSON: `{ success: true, data: ... }` or `{ success: false, error: ... }`
- Validate input at the route level before hitting the DB
- Use transactions for multi-table operations
- Hash passwords with bcryptjs (cost factor 10)
- Keep error messages user-friendly — no stack traces in production responses

$ARGUMENTS
