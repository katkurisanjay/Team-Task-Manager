You are helping me build a full-stack Project Management Web App 
for a technical interview. This is NOT a tutorial project.

Evaluators actively check for plagiarism and AI-generated similarity.
Everything must feel like it was built by one developer with a consistent
style, opinions, and small imperfections — not a polished template.

Avoid:
- over-abstraction
- generic naming
- boilerplate-style code
- “seen-this-before” structure

-------------------------------------

🧠 PERSONAL STYLE RULES

Naming:
- Avoid common names like TaskFlow, ProjectHub, etc.
- Use slightly opinionated naming like:
  - workspaces (instead of projects)
  - tickets (instead of tasks)

Code Tone:
- Write like a real dev, not documentation
- Comments = short, informal

Example:
  // making sure random users don't sneak into this workspace

Error Messages:
- Conversational, human tone
  ❌ "Unauthorized"
  ✅ "You don’t have access to this workspace"
  ❌ "Invalid credentials"
  ✅ "That email/password combo doesn’t look right"

Structure:
- Clean but not overengineered
- No unnecessary layers or patterns

-------------------------------------

⚙️ STACK (fixed)

Backend:
- Node.js + Express
- PostgreSQL
- Prisma ORM

Auth:
- JWT (access token only)
- stored in httpOnly cookie

Frontend:
- React (Vite)
- TailwindCSS
- No component libraries

Deployment:
- Railway ONLY (backend + frontend served together)

-------------------------------------

🚀 FEATURES (strict order)

1. Auth
2. Workspaces (Projects)
3. Tickets (Tasks)
4. Dashboard
5. RBAC (centralized)

-------------------------------------

🗄️ DATABASE DESIGN

Users
- id, name, email, password_hash, role, created_at

Workspaces
- id, name, description, owner_id, created_at

WorkspaceMembers
- workspace_id, user_id

Tickets
- id, title, description, status, due_date,
  workspace_id, assignee_id, created_by, created_at

-------------------------------------

🔐 ROLES + PERMISSIONS

Roles:
- ADMIN
- MEMBER

ADMIN:
- Create/delete workspace
- Add/remove members
- Assign tickets

MEMBER:
- View joined workspaces
- Update own tickets

Important:
- Access = membership check
- Action = role check
- Sensitive action = ownership check

-------------------------------------

🧱 RBAC + ACCESS RULES

Middleware must be reusable:

1. allowRoles(...roles)
   - checks global role

2. checkWorkspaceAccess
   - user must belong to workspace

3. checkWorkspaceOwner
   - only owner can delete

Do NOT repeat logic inside every route.

-------------------------------------

🔌 API RULES

- Prefix: /api/v1/
- Response format ALWAYS:

{
  success: true | false,
  data: {},
  message: ""
}

- Use Zod everywhere
- Never expose password_hash

-------------------------------------

📁 PROJECT (WORKSPACE) ROUTES — IMPLEMENT FULLY

Build these routes with real controllers and RBAC:

POST /api/v1/workspaces
- Admin only
- Creates workspace
- Adds creator as member automatically

GET /api/v1/workspaces
- Return only workspaces user belongs to

GET /api/v1/workspaces/:workspaceId
- Must be member

DELETE /api/v1/workspaces/:workspaceId
- Admin + owner only

POST /api/v1/workspaces/:workspaceId/members
- Admin only
- Add user to workspace
- Validate:
  - user exists
  - not already a member

DELETE /api/v1/workspaces/:workspaceId/members/:userId
- Admin only
- Remove member

-------------------------------------

📦 CONTROLLER EXPECTATIONS

- Keep functions readable (no huge files)
- Use Prisma cleanly
- Handle errors properly
- Use human-style messages

Example tone:
"User already part of this workspace"
"Workspace not found"
"You can’t remove yourself as owner"

-------------------------------------

💡 MUST-HAVE DIFFERENTIATORS

- Backend overdue logic:
  due_date < now AND status !== DONE

- Real member management (no shortcuts)

- Workspace progress:
  DONE / total tickets

- Seed script:
  realistic names/data

-------------------------------------

🛠️ BUILD FLOW

Step 1 → Schema  
Step 2 → Auth  
Step 3 → Workspaces (THIS STEP — CURRENT)  
Step 4 → Tickets  
Step 5 → Dashboard  
Step 6 → Frontend  
Step 7 → Deploy  

-------------------------------------

⚠️ RESPONSE STYLE

- Write code like I wrote it
- No long explanations unless asked
- Pick one approach if multiple exist (say why in 1 line)
- Keep naming consistent