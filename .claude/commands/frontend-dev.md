# Frontend Development Assistant

You are helping develop the complete React frontend for a full-stack forum/social media application. The backend is already fully implemented — your job is to build the frontend that consumes it.

## Critical Rules

1. **NEVER run terminal commands yourself.** The user has sudo/Docker permissions — you do not. When a command needs to be run (npm install, Docker rebuild, etc.), **output the exact command** for the user to execute and wait for them to paste the result back.
2. **Write code, suggest commands.** Your job is to write/edit frontend code (components, pages, hooks, services, styles). The user handles execution.
3. **Always read before editing.** Never modify a file you haven't read in this session.
4. **Use ES Modules.** The frontend uses `"type": "module"` — always use `import`/`export`, never `require`.

## Project Context

- **Framework**: React 19 with Vite 7 (ES Modules)
- **Entry**: `frontend/src/main.jsx` → `frontend/src/App.jsx`
- **Styling**: CSS (no CSS framework installed by default — suggest one if needed)
- **Linting**: ESLint 9 flat config with React Hooks and React Refresh plugins
- **Port**: Vite dev server on `http://localhost:5173`
- **Backend API**: `http://localhost:3000` (Express.js)

## Backend API Reference

Base URL: `http://localhost:3000`
All responses follow `{ success: true, data: {...} }` or `{ success: false, error: "message" }`.
Auth uses **httpOnly cookies** (`session_token`) — set automatically by the backend. The frontend also receives the token in the JSON response for `Authorization: Bearer` header usage.

### Authentication

| Method | Endpoint | Body | Auth | Response |
|--------|----------|------|------|----------|
| POST | `/auth/register` | `{ username, password, fname, lname }` | No | `{ user, token }` |
| POST | `/auth/login` | `{ username, password }` | No | `{ user, token }` |
| POST | `/auth/logout` | — | Yes | `{ message }` |
| GET | `/auth/me` | — | Yes | `{ user, permissions }` |

**Validation rules:**
- username: 3-30 chars, alphanumeric + underscore only
- password: 6-128 chars
- fname, lname: 1-50 chars

### Discussions

| Method | Endpoint | Body | Auth | Response |
|--------|----------|------|------|----------|
| GET | `/discussions` | — | No | `{ discussions[], pagination }` |
| GET | `/discussions/:id` | — | No | `{ discussion }` (with comments & reactions) |
| POST | `/discussions` | `{ title, content }` | Yes (`discussion.create`) | `{ discussion }` |
| PATCH | `/discussions/:id` | `{ title?, content? }` | Yes (`discussion.edit.own/any`) | `{ discussion }` |
| DELETE | `/discussions/:id` | — | Yes (`discussion.delete.own/any`) | `{ message }` |

**Validation:** title: 1-200 chars, content: 1-10000 chars
**Pagination:** `?page=1&limit=20` → response includes `{ page, limit, total, pages }`

### Comments (nested under discussions)

| Method | Endpoint | Body | Auth | Response |
|--------|----------|------|------|----------|
| GET | `/discussions/:discussionId/comments` | — | No | `{ comments[], pagination }` |
| POST | `/discussions/:discussionId/comments` | `{ content }` | Yes (`comment.create`) | `{ comment }` |
| PATCH | `/discussions/:discussionId/comments/:commentId` | `{ content }` | Yes (`comment.edit.own/any`) | `{ comment }` |
| DELETE | `/discussions/:discussionId/comments/:commentId` | — | Yes (`comment.delete.own/any`) | `{ message }` |

**Validation:** content: 1-5000 chars

### Reactions

| Method | Endpoint | Body | Auth | Response |
|--------|----------|------|------|----------|
| POST | `/discussions/:id/reactions` | `{ type }` | Yes | `{ reaction }` |
| DELETE | `/discussions/:id/reactions` | — | Yes | `{ message }` |
| POST | `/discussions/:discussionId/comments/:commentId/reactions` | `{ type }` | Yes | `{ reaction }` |
| DELETE | `/discussions/:discussionId/comments/:commentId/reactions` | — | Yes | `{ message }` |

**Reaction types:** `like`, `dislike`, `love`, `wow`, `haha`, `sad`, `angry`
**Behavior:** POST upserts (creates or updates existing reaction). DELETE removes own reaction.

### Users

| Method | Endpoint | Body | Auth | Permission |
|--------|----------|------|------|------------|
| GET | `/users` | — | Yes | `user.read.any` |
| GET | `/users/me` | — | Yes | — |
| GET | `/users/:id` | — | Yes | `user.read.own/any` |
| PATCH | `/users/:id` | `{ fname?, lname?, password?, current_password? }` | Yes | `user.edit.own/any` |
| DELETE | `/users/:id` | — | Yes | `user.delete.own/any` |
| POST | `/users/:id/ban` | — | Yes | `user.ban.any` |
| POST | `/users/:id/unban` | — | Yes | `user.ban.any` |

**Password change:** When changing own password, `current_password` is required.

### Health Check

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/health` | `{ status: 'ok' }` |

## RBAC — Roles & Permissions

The backend enforces all permissions server-side. The frontend should use permissions to **show/hide UI elements** (buttons, forms, admin panels) — never rely solely on the frontend for access control.

**Roles:** Admin, Moderator, User, Guest, Banned

| Role | Key Capabilities |
|------|-----------------|
| Admin | Full access: CRUD all content, manage users, ban/unban, assign roles |
| Moderator | Edit/delete any discussion or comment, ban/unban users |
| User | Create discussions/comments, edit/delete own, react |
| Guest | Read-only (no account) |
| Banned | No access (blocked at auth middleware) |

The `GET /auth/me` response includes a `permissions` array (e.g. `["discussion.create", "comment.edit.own", ...]`). Use this to conditionally render UI.

## Recommended Frontend Structure

```
frontend/src/
├── main.jsx                    # React DOM entry
├── App.jsx                     # Root component with router
├── api/
│   └── client.js               # Axios/fetch wrapper with auth headers
├── context/
│   └── AuthContext.jsx          # Auth state (user, permissions, login/logout)
├── hooks/
│   ├── useAuth.js              # Shortcut for AuthContext
│   └── usePermission.js        # Check if user has a permission
├── pages/
│   ├── HomePage.jsx            # Discussion list (paginated)
│   ├── DiscussionPage.jsx      # Single discussion with comments
│   ├── LoginPage.jsx           # Login form
│   ├── RegisterPage.jsx        # Register form
│   ├── ProfilePage.jsx         # User profile / settings
│   └── AdminPage.jsx           # User management (admin/mod only)
├── components/
│   ├── Navbar.jsx              # Navigation bar with auth state
│   ├── DiscussionCard.jsx      # Discussion preview in list
│   ├── DiscussionForm.jsx      # Create/edit discussion form
│   ├── CommentList.jsx         # Comments section
│   ├── CommentForm.jsx         # Create/edit comment form
│   ├── ReactionBar.jsx         # Reaction buttons for discussions/comments
│   ├── Pagination.jsx          # Reusable pagination component
│   └── ProtectedRoute.jsx      # Route guard for auth-required pages
└── styles/
    └── ...                     # CSS files
```

## Auth Flow

1. **Login/Register** → backend sets `session_token` httpOnly cookie + returns token in JSON
2. **API client** should include `credentials: 'include'` (for cookies) in every fetch call
3. **On app load** → call `GET /auth/me` to check if user is already logged in (cookie-based)
4. **Logout** → call `POST /auth/logout`, clear local auth state
5. **Token in response** is also available if you need `Authorization: Bearer` header (e.g., for non-cookie contexts), but cookies are preferred

## API Client Setup

The API client must:
- Set `credentials: 'include'` on every request (sends httpOnly cookies)
- Set `Content-Type: application/json` for POST/PATCH requests
- Handle `401` responses globally (redirect to login / clear auth state)
- Handle `403` responses (show "forbidden" message)
- Parse the `{ success, data, error }` response shape consistently

## Docker Commands (for user to run)

```bash
# Rebuild and start frontend
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml up -d --build frontend

# View frontend logs
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml logs -f frontend

# Install a new npm package (inside container)
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml exec frontend npm install <package-name>

# Run linter
sudo docker compose -f /home/xpham/INSA/web-avance/projet/docker-compose.yml exec frontend npm run lint
```

## UX Requirements

1. **Responsive design** — should work on desktop and mobile
2. **Loading states** — show spinners/skeletons while fetching data
3. **Error handling** — display backend error messages in a user-friendly way (toasts or inline errors)
4. **Optimistic updates** — for reactions, update the UI immediately before the server responds
5. **Form validation** — validate client-side first (matching backend rules), show inline errors
6. **Permission-based UI** — only show edit/delete buttons, admin panel links, etc. when the user has the right permissions
7. **Pagination** — paginate discussion lists and comment lists, don't load everything at once

## Security Requirements

- **Never store tokens in localStorage** — rely on httpOnly cookies set by the backend
- **Always use `credentials: 'include'`** in fetch/axios calls
- **Sanitize rendered content** — if displaying user-generated HTML, use a safe renderer. The backend already escapes HTML, but defense in depth applies
- **Never expose permissions logic client-side as a security boundary** — it's only for UX. The backend enforces everything

## Workflow

1. When the user describes a feature or page, explore the existing frontend code first
2. Set up foundational layers first: API client, auth context, router
3. Build pages and components iteratively
4. If new npm packages are needed, tell the user the exact install command
5. Provide the user with Docker commands to rebuild/test
6. Wait for the user to report the result before proceeding

## Conventions

- Functional components only (no class components)
- Use React hooks (useState, useEffect, useContext, useCallback, useMemo)
- Name components with PascalCase, hooks with `use` prefix, utilities with camelCase
- One component per file, file name matches component name
- Keep components focused — if a component exceeds ~150 lines, split it
- Use CSS Modules or a consistent CSS strategy — no inline styles for layout

$ARGUMENTS
