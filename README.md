# BrikWork — Team Task Manager

A full-stack team task management application built with Node.js, Express, Prisma, and React. Teams can create workspaces, manage members, create and assign tickets, and track progress from a central dashboard.

---

## What this does

BrikWork is built around the idea that project management tools should get out of your way. You create a workspace (think: project), invite people to it, and then break the work into tickets. Each ticket can be assigned to someone, given a due date, and tracked through three states — Todo, In Progress, and Done.

Admins control the workspace. They create it, add members, assign tickets, and can delete the whole thing if needed. Members can view everything they're part of and update the status of tickets assigned to them. Nothing more, nothing less — no role confusion.

The dashboard gives each person a quick summary of how their work is going across all their workspaces.

---

## Tech stack

**Backend**
- Node.js + Express
- Prisma ORM (SQLite for local dev, PostgreSQL for production)
- JWT authentication stored in httpOnly cookies
- Zod for input validation

**Frontend**
- React (Vite)
- Vanilla CSS with CSS custom properties
- React Router DOM
- Axios

---

## Project structure

```
brikwork/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB models
│   │   └── seed.js             # Dev seed data
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Prisma client
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── workspace.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # requireAuth
│   │   │   ├── rbac.middleware.js   # allowRoles, checkWorkspaceAccess, checkWorkspaceOwner
│   │   │   └── error.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── workspace.routes.js
│   │   │   ├── ticket.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── response.js     # Standard { success, data, message }
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js       # Axios instance with interceptors
    │   │   └── index.js        # All API functions
    │   ├── components/
    │   │   ├── AppLayout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── RouteGuards.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── WorkspacesPage.jsx
    │   │   └── WorkspaceDetailPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## API reference

All endpoints are prefixed with `/api/v1/`. Every response follows this format:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/logout` | Logout (clears cookie) | No |
| GET | `/auth/me` | Get current user | Yes |

### Workspaces

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/workspaces` | List workspaces you belong to | Any |
| POST | `/workspaces` | Create workspace | Admin |
| GET | `/workspaces/:id` | Get workspace with tickets + members | Member |
| DELETE | `/workspaces/:id` | Delete workspace | Admin + Owner |
| POST | `/workspaces/:id/members` | Add member by email | Admin |
| DELETE | `/workspaces/:id/members/:userId` | Remove member | Admin |

### Tickets

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/workspaces/:id/tickets` | List tickets in workspace | Member |
| POST | `/workspaces/:id/tickets` | Create ticket | Admin |
| PATCH | `/workspaces/:id/tickets/:ticketId` | Update ticket | Admin / Assigned member |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Personal stats + workspace progress | Yes |

---

## Roles explained

There are two roles in the system.

**Admin** — can create and delete workspaces, add or remove members from any workspace they own, create tickets and assign them to anyone in the workspace.

**Member** — can see any workspace they're added to. Can update the status of tickets assigned to them. Can't touch anything else.

Access control runs through three middleware functions that are composed on each route:

- `requireAuth` — checks the JWT cookie
- `checkWorkspaceAccess` — confirms the user is actually a member of the workspace
- `allowRoles(...roles)` — checks the user's global role
- `checkWorkspaceOwner` — used specifically for delete, confirms ownership

---

## Database schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  owner_id    String
  createdAt   DateTime @default(now())
}

model WorkspaceMember {
  workspace_id String
  user_id      String
  @@id([workspace_id, user_id])
}

model Ticket {
  id           String    @id @default(cuid())
  title        String
  description  String?
  status       Status    @default(TODO)
  due_date     DateTime?
  workspace_id String
  assignee_id  String?
  created_by   String
  createdAt    DateTime  @default(now())
}
```

---

## Running locally

**Prerequisites:** Node.js 18+, npm

### Backend

```bash
cd backend
cp .env.example .env
# Fill in JWT_SECRET and DATABASE_URL in .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Backend starts on `http://localhost:3000`

Seed creates three accounts:
- `alice@example.com` / `password123` — Admin
- `bob@example.com` / `password123` — Member
- `charlie@example.com` / `password123` — Member

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`

Vite proxies `/api` requests to `http://localhost:3000` so you don't need to touch CORS in dev.

---

## Environment variables

Create `backend/.env`:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
```

For production (PostgreSQL):

```env
PORT=3000
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key-here"
```

---

## Deployment (Railway)

1. Push this repo to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a PostgreSQL database service
4. Add a backend service pointing to `/backend`
5. Set environment variables: `DATABASE_URL` (from Railway PostgreSQL), `JWT_SECRET`
6. For the frontend, build it and either serve it statically or add a second Railway service
7. Run `npx prisma migrate deploy` on first deploy

Make sure to update `schema.prisma` provider from `sqlite` to `postgresql` before deploying.

---

## Features at a glance

- JWT authentication with httpOnly cookies (no localStorage)
- Workspace-level membership — users only see workspaces they're added to
- Overdue detection — tickets past their due date that aren't done are flagged automatically
- Dashboard with clickable stat cards — click "Overdue" and your ticket list filters to just those
- Progress tracking per workspace — done tickets / total tickets shown as a progress bar
- Clean RBAC — access rules are enforced server-side, not just hidden on the frontend
- Input validation with Zod on every POST/PATCH endpoint

---

## Known limitations

- No email notifications
- No file attachments on tickets
- No ticket priority field (just status)
- SQLite in dev means no concurrent write support — switch to PostgreSQL before any real load

---

