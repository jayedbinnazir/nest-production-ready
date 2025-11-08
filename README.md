## Retailer Sales Representative Backend

Backend service for managing national retailer data, supporting sales representatives (SRs) and administrators. The API is built with NestJS, PostgreSQL (TypeORM), Redis caching, and ships with Docker, migrations, seeds, Swagger docs, and automated tests.

### Core Capabilities
- JWT authentication for admins and SRs (role-aware guards and decorators)
- Hierarchy management: regions, areas, distributors, territories
- Retailer catalogue:
  - SR endpoints: paginated assignments, search/filter, detail view, limited updates
  - Admin endpoints: CRUD, CSV bulk import, bulk assignments/unassignments
- Sales rep management with soft limits (~70 retailers / rep configurable)
- Redis-backed caching on SR retailer listings
- Kafka/socket.io scaffolding preserved from boilerplate

---

## 1. Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose (for containerized stack)
- PostgreSQL 14+ (local or via Docker)
- Redis 6+ (local or via Docker)

### Install dependencies
```bash
npm install
```

### Environment variables
Create `.env.dev` (or copy to `.env.prod` for production). Example configuration:
```
APP_NAME=Retailer API
PORT=3000
HOST=0.0.0.0
GLOBAL_PREFIX=api

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=retailer_db

JWT_SECRET=super-secret-change-me
JWT_EXPIRES_IN=3600
AUTH_SALT_ROUNDS=10
RETAILER_CACHE_TTL=60
SALES_REP_ASSIGNMENT_LIMIT=200

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin123!
SEED_ADMIN_NAME=System Admin
SEED_SALES_REP_USERNAME=sr001
SEED_SALES_REP_PASSWORD=SrUser123!
```

---

## 2. Running the application

### Local development
```bash
# start Postgres & Redis via docker-compose (optional helper)
docker-compose -f docker-compose.dev.yml up -d

# run migrations
npm run mr

# seed baseline data (roles, admin, sample hierarchy, SR assignments)
npm run seed

# start API with hot reload
npm run start:dev
```

### Production build
```bash
npm run build
npm run start:prod
```

### Dockerized stack
```bash
# build & run app + dependencies (dev profile)
npm run docker:build

# stop containers
npm run docker:down
```

---

## 3. Database & Data

- `npm run mgd` – generate migration (development)
- `npm run mr` – run migrations
- `npm run mrv` – revert last migration
- `npm run seed` – idempotent seed script creating:
  - `admin` / `sales_rep` roles
  - Admin user (uses `SEED_ADMIN_*`)
  - Sample region/area/territory/distributor hierarchy
  - Three demo retailers assigned to default SR

Migration file: `migrations/1720460400000-RetailerSchema.ts`

---

## 4. Testing & Quality

```bash
# run unit tests (>=5 focused scenarios around auth flows)
npm run test

# optional coverage
npm run test:cov
```

- ESLint / Prettier configs provided (`npm run lint`, `npm run format`)
- Global validation pipe (whitelist & transform) and exception filter configured

---

## 5. API Documentation

- Swagger UI served at `http://localhost:3000/api/docs`
- Versioned routing (`/api/v1/...`)
- Auth:
  - `POST /api/v1/auth/login` with body `{ type: 'admin' | 'sales_rep', identifier, password }`
  - Bearer token required for subsequent requests

### Key Endpoints
- `GET /api/v1/retailers` – SR paginated assignments (search, filters, caching)
- `PATCH /api/v1/retailers/:uid` – SR updates (points, routes, notes)
- `POST /api/v1/admin/retailers/import` – CSV upload (`uid,name,phone,...`)
- `POST /api/v1/admin/assignments/bulk` – assign retailers to SRs
- `POST /api/v1/admin/assignments/bulk-unassign` – unassign retailers
- CRUD under `/api/v1/admin/{regions|areas|territories|distributors|retailers|sales-reps}`

---

## 6. Scaling & Performance Notes

- **Data modeling**: all lookup tables normalized, join table (`sales_rep_retailers`) with composite unique index, wide indexing on searchable retailer columns to handle ~1M records.
- **Caching**: Redis-backed cache for SR listings with per-query keys and targeted invalidation on updates/assignments; TTL configurable via `RETAILER_CACHE_TTL`.
- **Query efficiency**: TypeORM query builders with explicit joins avoid N+1; pagination uses `LIMIT/OFFSET`.
- **Write throughput**: Bulk assignments executed within a transaction, optional assignment limit guard (`SALES_REP_ASSIGNMENT_LIMIT`).
- **Security**: RBAC enforced via custom decorators/guards, JWT strategy issues typed payloads, password hashing with configurable rounds, CSV import sanitized and resilient per row.
- **Operational readiness**: Dockerized stack, migrations + seeds, centralized config, healthful logging via global exception filter, Swagger for integration hand-off, automated tests for critical auth paths.

---

## 7. Folder Highlights

- `src/retailer` – domain services, controllers, DTOs for retailers & admin workflows
- `src/region|area|territory|distributor` – hierarchy management modules
- `src/sales_rep` – sales representative lifecycle and assignment helpers
- `src/auth` – JWT strategy, guards, decorators, and login flows
- `scripts/seed.ts` – repeatable seed script
- `migrations/` – TypeORM schema migrations

---

## 8. Next Steps / Extensions

- Add e2e tests covering SR & admin happy paths
- Integrate Kafka events for assignment/import audit streaming (scaffold available)
- Enhance retailer search with full-text & route-based facets
- Implement background job for CSV imports >10k rows (chunking + status tracking)

Happy hacking! 🚀
