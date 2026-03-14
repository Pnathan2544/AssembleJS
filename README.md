# NodeMesh

Production-grade multi-service Docker platform.

```
nginx (public) ──► api (Express) ──► mongo (MongoDB)
                                 └──► redis (cache)
web (React SPA, served by nginx)
```

## Stack

| Service | Image / Base | Role |
|---------|-------------|------|
| `nginx` | nginx:1.27-alpine | Public ingress, static assets, API proxy |
| `api`   | node-api-base:local → custom multi-stage | REST API (Express) |
| `web`   | node-web-base:local → multi-stage → nginx | React SPA |
| `mongo` | mongo:7.0 | Persistent document store |
| `redis` | redis:7.4-alpine | Cache / session store |

## Quick start

```bash
# 1. Build custom base images (one-time, or when base Dockerfiles change)
make bases

# 2. Start full dev stack (hot reload, all ports exposed)
make dev

# 3. Open browser
open http://localhost
```

### URLs in dev mode

| URL | Description |
|-----|-------------|
| `http://localhost` | React app (via nginx) |
| `http://localhost/api/health` | API health check |
| `http://localhost/api/tasks` | Tasks REST endpoint |
| `http://localhost:3000/api/health` | API direct (dev only) |
| `http://localhost:5173` | Vite dev server (dev only) |

## Architecture

### Networks

- `edge` – nginx + web, public-facing
- `backend` – nginx + api + mongo + redis, internal only (`internal: true`)

### Volumes

- `mongo_data` – MongoDB data directory
- `redis_data` – Redis AOF persistence
- `nginx_logs` – Nginx access + error logs

### Secrets

Sensitive values are mounted as files at `/run/secrets/<name>` inside containers.
Development placeholder files live in `secrets/`. **Replace these values before any real deployment.**

```
secrets/
  mongo_root_username.txt
  mongo_root_password.txt
  mongo_app_username.txt
  mongo_app_password.txt
  redis_password.txt
```

### Cache-aside pattern (api → redis → mongo)

```
GET /api/tasks/:id
  ↓ task.cache.getById(id)
  ↓ HIT  → return { task, fromCache: true }
  ↓ MISS → task.repository.findById(id)
         → task.cache.setById(id, task)
         → return { task, fromCache: false }
```

Writes always go to Mongo first, then invalidate all task cache keys.

## Compose files

| File | Purpose |
|------|---------|
| `compose/compose.yaml` | Base definitions (used in all modes) |
| `compose/compose.dev.yaml` | Dev overlay: hot reload, exposed ports |
| `compose/compose.prodlike.yaml` | Prod overlay: immutable images, nginx-only ports |

## Makefile targets

```
make help        List all targets
make bases       Build node-web-base and node-api-base images
make dev         Start dev stack (foreground)
make dev-d       Start dev stack (detached)
make prod        Start prod-like stack (detached)
make down        Stop all services
make down-v      Stop + remove volumes (DATA LOSS)
make logs        Tail all logs
make logs-api    Tail api logs
make ps          Show service status
make clean       Prune stopped containers / dangling images
make nuke        Full teardown including volumes (DESTRUCTIVE)
```

## Repository layout

```
multi-service-docker-app/
├─ apps/
│  ├─ web/          React SPA (Vite)
│  └─ api/          Express REST API
│     └─ src/
│        ├─ routes/        HTTP routing
│        ├─ controllers/   Request/response mapping
│        ├─ services/      Business logic + cache policy
│        ├─ repositories/  Mongo access
│        ├─ cache/         Redis helpers
│        ├─ middleware/     Error handler, request-id
│        └─ config/        DB, Redis, secrets
├─ docker/
│  ├─ base/         Custom base Dockerfiles
│  ├─ nginx/        Nginx image + config
│  ├─ mongo/init/   DB init scripts
│  └─ scripts/      wait-for-deps, healthcheck helpers
├─ secrets/         Placeholder secret files (replace in prod)
├─ compose/         Compose files
├─ .dockerignore
├─ Makefile
└─ README.md
```

## API reference

### Health

```
GET /api/health    → { status, services: { mongo, redis }, uptime }
GET /api/version   → { version, nodeEnv, node }
```

### Tasks

```
GET    /api/tasks         List all tasks (cached)
GET    /api/tasks/:id     Get single task (cached, shows fromCache flag)
POST   /api/tasks         Create task  { title }
PATCH  /api/tasks/:id     Update task  { title?, completed? }
DELETE /api/tasks/:id     Delete task
```

## Phase roadmap

- [x] Phase 1 — Skeleton (repo structure, minimal apps, Compose stubs)
- [x] Phase 2 — Base images (node-web-base, node-api-base)
- [x] Phase 3 — Data layer (Mongo + Redis, cache-aside tasks endpoint)
- [x] Phase 4 — Reverse proxy (nginx serves web, proxies API)
- [x] Phase 5 — Production hardening (secrets, healthchecks, non-root, log rotation)
- [x] Phase 6 — Optimization (multi-stage web, slim API runtime, .dockerignore)
- [ ] Phase 7 — Validation (bring up full stack, verify persistence, TLS practice)
