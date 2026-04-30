# Jobryx — Phase 1 Design Spec

**Date:** 2026-04-30
**Team:** Rayane, Liam, Fael, Sohan
**Repo:** git@github.com:EpitechBachelorPromo2028/B-YEP-200-NCE-2-1-jobaggregator-2.git

---

## Context

Jobryx is an Epitech job/internship aggregator platform. The project is split into 4 phases:

| Phase | Scope |
|-------|-------|
| **1 — Foundation** *(this spec)* | Monorepo, Docker, DB schema, auth backend + frontend, CI |
| 2 — Data Collection | WeLoveDevs integration, ingestion pipeline, offer listing/filtering |
| 3 — Data + AI Features | Dashboard analytics, local AI (keyword extraction) |
| 4 — Security, Admin, Docs | Cyber hardening, admin UI, WCAG audit, ADRs, automated tests |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 (async) |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Containerization | Docker + Docker Compose |
| CI | GitHub Actions |

---

## Project Structure

```
jobryx/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Button, Input, Navbar...)
│   │   ├── pages/            # Register, Login, Dashboard (placeholder)
│   │   ├── hooks/            # useAuth, useApi
│   │   ├── services/         # api.ts — fetch calls to backend
│   │   └── types/            # TypeScript interfaces
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/       # auth.py (register, login, me)
│   │   ├── core/             # config.py, security.py (JWT), deps.py
│   │   ├── db/               # session.py, base.py
│   │   ├── models/           # user.py (SQLAlchemy ORM model)
│   │   ├── schemas/          # user.py (Pydantic request/response schemas)
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  role        VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
```

Constraints:
- `role` must be one of `user`, `admin` (enforced at application layer via Pydantic enum)
- `email` and `username` are unique — duplicate registration returns 409
- `password` is never returned in any API response (excluded from all response schemas)

Phase 2 will add: `offers`, `saved_offers`, `tags` tables.

---

## Backend API Routes

Base path: `/api/v1`

| Method | Route | Auth | Request Body | Response |
|--------|-------|------|-------------|----------|
| `POST` | `/auth/register` | None | `{email, username, password}` | `201 UserOut` |
| `POST` | `/auth/login` | None | `{email, password}` (form) | `200 {access_token, token_type}` |
| `GET` | `/auth/me` | Bearer JWT | — | `200 UserOut` |
| `GET` | `/health` | None | — | `200 {status: "ok"}` |

**Auth flow:**
1. Register → password bcrypt-hashed, user stored in DB
2. Login → credentials verified, JWT access token returned (30min expiry)
3. Protected routes → `Depends(get_current_user)` extracts and validates JWT

**Error responses:** standard FastAPI HTTPException with appropriate codes (400 validation, 401 unauthorized, 409 conflict, 422 unprocessable).

---

## Frontend Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Home | `/` | Public | Landing with sign up / sign in CTAs |
| Register | `/register` | Public | Registration form |
| Login | `/login` | Public | Login form |
| Dashboard | `/dashboard` | Protected | Placeholder — redirects to `/login` if unauthenticated |

**Auth state:**
- JWT stored in `localStorage`
- `useAuth` hook exposes `user`, `login()`, `logout()`, `isAuthenticated`
- `ProtectedRoute` wrapper redirects unauthenticated users to `/login`

---

## Docker Compose

3 services on internal network `jobryx_network`:

```
db        → postgres:16-alpine, volume jobryx_pgdata, healthcheck
backend   → FastAPI, depends_on db (healthy), port 8000
frontend  → Vite dev, depends_on backend, port 5173
            /api requests proxied → backend:8000
```

**One command to start:**
```bash
cp .env.example .env  # fill in secrets
docker compose up --build
```

**Required env vars (`.env.example`):**
```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=jobryx
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
VITE_API_URL=http://localhost:8000
```

Secrets are never hardcoded. No `.env` file is committed (`.gitignore` enforced).

---

## GitHub Actions CI

File: `.github/workflows/ci.yml`
Triggers: push and pull_request to `main`

```
Job: lint-and-build
  ├── backend-lint    ruff check + ruff format --check
  ├── frontend-lint   eslint + tsc --noEmit
  └── frontend-build  vite build
```

Automated tests are deferred to Phase 4 (requires real business logic to test).

---

## Branch Convention

```
main           → stable, CI required to pass before merge
feat/<name>    → new features (e.g. feat/auth-backend)
fix/<name>     → bug fixes
```

---

## Out of Scope for Phase 1

- WeLoveDevs API integration (Phase 2)
- Offer listing, search, filtering (Phase 2)
- Data feature / AI feature (Phase 3)
- Admin interface (Phase 4)
- Cybersecurity hardening beyond JWT/bcrypt (Phase 4)
- WCAG audit (Phase 4)
- Automated tests (Phase 4)
- ADR documents (Phase 4)
