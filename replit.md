# HYDROGES - Échange de Documents

## Overview

Internal company document exchange platform for employees. Built in French.
Allows employees to send, receive, schedule, draft, and sign documents within the company.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 20+
- **Package manager**: pnpm
- **Frontend**: React + Vite (artifacts/hydroges-docs)
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Auth**: HMAC-SHA256 JWT (Node built-in crypto), PBKDF2 password hashing

## Features

- **Boîte de Réception** — Inbox: documents received by the logged-in user
- **Documents Envoyées** — Sent documents from the logged-in user (status=sent)
- **Envois Programmées** — Scheduled sends with date/time picker (status=scheduled)
- **Boîte d'Envois** — Outbox: all docs where user is sender (any status)
- **Brouillons** — Draft documents from the logged-in user (status=draft)
- **En cours de validation** — Documents received by user, not yet signed
- **Document Viewer** — Inline document reading
- **Compose Modal** — Create new documents, pick recipient, schedule send
- **Signature Tool** — Click to place QR stamp signature on document
- **Login / Register** — Real JWT auth via API

## Authentication

- JWT signed with HMAC-SHA256 using `crypto` built-in
- Passwords hashed with PBKDF2 (salt per user, 10000 iterations, sha256)
- Token stored in `localStorage` as `hydroges_token`; user info as `hydroges_user`
- `setAuthTokenGetter` from api-client-react auto-injects Bearer token into all API calls
- All document routes require `Authorization: Bearer <token>`
- Documents auto-filtered to current user on the backend (sender OR recipient)

## Seeded Accounts (default password: `Admin123!`)

| loginId          | Nom              | Service              |
|------------------|------------------|----------------------|
| ahmed.benali     | Ahmed Benali     | Direction Générale   |
| fatima.zohra     | Fatima Zohra     | Ressources Humaines  |
| karim.mansouri   | Karim Mansouri   | Finance & Comptabilité |
| sara.hadj        | Sara Hadj        | Informatique         |
| hassan.boudiaf   | Hassan Boudiaf   | Operations           |
| nadia.belkaid    | Nadia Belkaid    | Hydraulique          |
| omar.kheloufi    | Omar Kheloufi    | Travaux              |
| leila.bouhali    | Leila Bouhali    | Juridique            |

Company number: `0125.6910.0681`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express 5 API server
│   │   └── src/
│   │       ├── lib/auth.ts        # JWT + password utils
│   │       ├── middlewares/auth.ts # requireAuth/optionalAuth
│   │       └── routes/
│   │           ├── auth.ts        # /api/auth/login|register|me
│   │           └── documents.ts   # All routes require auth
│   └── hydroges-docs/      # React + Vite frontend
│       └── src/
│           ├── context/AuthContext.tsx  # Real API auth, JWT storage
│           ├── hooks/use-app-data.ts   # API-first data hooks
│           └── pages/                  # login, register, inbox, etc.
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/documents.ts  # users table + auth columns
└── scripts/
    └── src/seed.ts         # Database seeder (wipes + re-seeds)
```

## Database Schema

**users**:
- id, name, email, department, avatarInitials, createdAt
- loginId (unique, e.g. "ahmed.benali")
- passwordHash, passwordSalt (PBKDF2)
- companyNumber (default "0125.6910.0681")
- role (e.g. "Directeur Général")

**documents**:
- id, title, content, status, senderId, senderName, recipientId, recipientName, recipientEmail
- scheduledAt, signedAt, signatureData, signatureX, signatureY
- fileType, fileSize, category, createdAt, updatedAt

## API Routes

- `GET /api/healthz` — Health check
- `POST /api/auth/register` — Register new account
- `POST /api/auth/login` — Login → returns JWT
- `GET /api/auth/me` — Current user (requires auth)
- `GET /api/users` — List all users
- `GET /api/documents` — List user's documents (requires auth, auto-filtered)
- `POST /api/documents` — Create document (requires auth)
- `GET /api/documents/:id` — Get document (requires auth)
- `PUT /api/documents/:id` — Update document (requires auth, sender only)
- `DELETE /api/documents/:id` — Delete document (requires auth, sender only)
- `POST /api/documents/:id/sign` — Sign document (requires auth)
- `POST /api/documents/:id/send` — Send document (requires auth, sender only)

## Development

```bash
# Install
pnpm install

# Run DB migrations
pnpm --filter @workspace/db run push

# Seed sample data (WIPES existing data first)
pnpm --filter @workspace/scripts run seed

# Run API server
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/hydroges-docs run dev
```
