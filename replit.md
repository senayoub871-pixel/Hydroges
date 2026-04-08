# HYDROGES Document Exchange

A full-stack document exchange application (HYDROGES) migrated from Render/Vercel to Replit.

## Architecture

This is a **pnpm monorepo** with the following structure:

```
/
├── artifacts/
│   ├── api-server/       Express.js REST API backend
│   └── hydroges-docs/    React + Vite frontend
├── lib/
│   ├── api-spec/         OpenAPI spec + codegen (orval)
│   ├── api-client-react/ Generated API client for React
│   ├── api-zod/          Generated Zod validators
│   └── db/               Drizzle ORM + PostgreSQL schema
└── scripts/              Utility scripts
```

## Workflows

- **Start application** — Frontend Vite dev server on port 5000 (webview)
  - Command: `cd artifacts/hydroges-docs && PORT=5000 pnpm run dev`
- **Backend API** — Express API server on port 3000 (console)
  - Command: `cd artifacts/api-server && PORT=3000 NODE_ENV=development pnpm run build && PORT=3000 NODE_ENV=development pnpm run start`

## Key Details

- **Package manager**: pnpm (workspace monorepo)
- **Frontend**: React 19 + Vite + TailwindCSS 4 + Wouter (routing) + TanStack Query
- **Backend**: Express 5 + Pino logging + JWT auth (custom HS256 implementation)
- **Database**: PostgreSQL via Drizzle ORM (`DATABASE_URL` secret required)
- **API Proxy**: In dev mode, Vite proxies `/api/*` → `http://localhost:3000`

## Environment Secrets

- `DATABASE_URL` — PostgreSQL connection string (already configured)
- `SESSION_SECRET` — Session secret (already configured)
- `JWT_SECRET` — Optional; defaults to a dev fallback (set in production)

## Codegen

When the OpenAPI spec changes, regenerate the client:
```
pnpm --filter @workspace/api-spec run codegen
```

## Database Migrations

To push schema changes:
```
pnpm --filter @workspace/db run push
```
