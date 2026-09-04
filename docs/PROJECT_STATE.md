# Project State: Rural Public Healthcare Platform (SIH26133)

**Date Updated:** 2026-09-04  
**Status:** Phase 5 (Authentication & Authorization) Complete

---

## 1. Current Project Structure
The initial project skeleton has been created and conforms to the `ARCHITECTURE.md` specifications.

```text
SIH-Healthcare/
├── package.json               # Root workspace config (concurrently runner)
├── backend/                   # Node.js/Express Backend
│   ├── src/                   
│   │   ├── auth.controller.ts # User registration, login, logout logic
│   │   ├── auth.middleware.ts # JWT verification & Role-based access control
│   │   ├── auth.routes.ts     # Protected and public Auth routes
│   │   ├── auth.test.ts       # Vitest specifications for Auth module
│   │   ├── db.ts              # better-sqlite3 database connection and schemas
│   │   └── index.ts           # Entry point and health-check API
│   └── package.json           
├── frontend/                  # React/Vite Frontend (PWA ready)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.tsx# JWT storage, React Context state
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx  # Protected Route (Role demonstration)
│   │   │   ├── Login.tsx      # Authentication UI
│   │   │   └── Register.tsx   # User Registration UI
│   │   ├── App.tsx            # React Router routing configuration
│   │   └── index.css          # Tailwind CSS directives
│   └── package.json           
├── deployment/                
│   └── docker/
│       └── docker-compose.yml # PostgreSQL + PostGIS, Redis provisioning
├── scripts/
│   └── setup-db.sh            
├── tests/
│   └── README.md
└── docs/                      # Approved Architecture Documentation
    ├── ARCHITECTURE.md
    ├── DATA_FLOW.md
    ├── FEATURE_SCOPE.md
    ├── REQUIREMENTS.md
    ├── SIH_PROBLEM_STATEMENT.md
    ├── USER_ROLES.md
    └── PROJECT_STATE.md
```

## 2. Technologies Currently Being Used
* **Backend:** Node.js (v24 LTS), TypeScript, Express.js, `better-sqlite3` (for isolated auth Phase 5), bcryptjs, jsonwebtoken, zod.
* **Frontend:** React, TypeScript, Vite, React Router DOM, Axios, Tailwind CSS.
* **Database:** Local SQLite (`dev.db`, `test.db`) implemented specifically for this phase to ensure standalone security testing without external Docker dependencies.
* **Testing:** `vitest` and `supertest` for high-speed API boundary testing.

## 3. Features Already Implemented
* **User Registration:** Secure account creation handling duplicate checks and robust password hashing (bcrypt).
* **Secure Login / JWT Issuance:** Payload generation issuing signed tokens containing the user's ID, username, and active Role.
* **Role-Based Access Control (RBAC):** Middleware (`authorizeRoles`) enforcing strict endpoint access boundaries for `ROLE_CITIZEN`, `ROLE_ASHA`, `ROLE_FACILITY_ADMIN`, etc.
* **Frontend Authentication Flows:** Complete React Context managing tokens, protected routing (`/dashboard`), and dynamic API bearer token injection via Axios.
* **Logout / Session Invalidation:** Client-side token purging and API acknowledgement.

## 4. Features That Are Incomplete
* **Clinical Modules (All):** Teleconsultation (WebRTC), CDSS (Triage engine), Referral State Machine, Inventory Management, and Queue Management logic are completely unwritten.
* **Production Database Migration:** SQLite is currently driving the Auth module. We still need to wire the final PostgreSQL schema via TypeORM/Prisma for the clinical records phase.

## 5. Known Bugs
* **None.** The baseline is clean and all 9 vitest authentication specs are passing flawlessly.

## 6. Current Database Status
* **Status:** Local SQLite schema active.
* **Details:** `users` table successfully provisioning `id`, `username`, `passwordHash`, and `role`. 

## 7. Current API Status
* **Status:** Authentication module complete.
* **Active Endpoints:** 
  * `POST /api/auth/register`
  * `POST /api/auth/login`
  * `POST /api/auth/logout`
  * `GET /api/auth/me` (Protected)
  * `GET /api/auth/admin` (Protected - RBAC Test)

## 8. Current Frontend Status
* **Status:** Routing and Auth Context complete.
* **Details:** Multi-page layout operating securely. Unauthorized users attempting to hit `/dashboard` are redirected to `/login`.

## 9. Current Testing Status
* **Status:** Auth module 100% covered.
* **Details:** Unit/Integration tests passing for successful registration, duplicate block, successful login, incorrect password, unauthorized access, authorized access, role restrictions, and logout.

## 10. Deployment Status
* **Status:** Local developer containerization.
* **Details:** Ready to run `docker-compose up` for local state dependencies when migrating to full production schemas.

---

## 11. Recommended Next Development Step
**Phase 6 Execution: CDSS Triage Engine & Teleconsultation Skeleton**
1. Implement the deterministic clinical decision support system (CDSS) for maternal and pediatric triage on the backend.
2. Establish the WebRTC signaling gateway using Socket.io/LiveKit.
3. Build the primary patient screening interfaces in the frontend for `ROLE_ASHA` and `ROLE_CHO`.
