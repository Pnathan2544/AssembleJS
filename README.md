# NodeMesh

NodeMesh is a production-style containerized application platform built with
Docker Compose, Express, React, MongoDB, Redis, and Nginx. The project is a
compact showcase of the runtime patterns used around ML and data services:
service isolation, dependency health checks, cache-backed APIs, secret
management, reverse proxy ingress, structured logs, and separate development
and production-like environments.

## Why this project matters for MLOps

Although the sample workload is a task API, the platform is intentionally
structured like a model-serving or data-service stack:

- A public ingress layer routes traffic through Nginx while backend services
  stay on an internal Docker network.
- API startup is gated on healthy MongoDB and Redis dependencies.
- Runtime credentials are loaded from Docker secret files, with environment
  variable fallback for local development.
- Redis implements a cache-aside pattern with configurable TTL.
- MongoDB stores persistent application state with an initialized app user.
- Health and version endpoints support smoke tests and deployment checks.
- Compose overlays provide separate hot-reload development and production-like
  runtime modes.
- Local base images keep API and web builds repeatable and cache-friendly.

## Architecture

```text
Browser
  |
  v
Nginx ingress
  |-- serves React static assets
  |-- proxies /api/* to Express
        |
        |-- MongoDB for persistence
        |-- Redis for caching
```

The `backend` network is marked internal, so MongoDB, Redis, and the API are
not directly exposed in the production-like stack. Nginx is the only public
entry point.

## Stack

- Frontend: React 18, Vite
- API: Node.js 20, Express, Mongoose, ioredis
- Data: MongoDB 7, Redis 7
- Ingress: Nginx 1.27
- Platform: Docker, Docker Compose, multi-stage Dockerfiles, Makefile

## Key operational features

- Health checks for MongoDB, Redis, API, web, and Nginx
- `depends_on` health conditions for ordered startup
- Structured JSON logs from API requests and Nginx access logs
- Docker secrets for database and cache credentials
- Internal backend network and separate edge network
- Persistent named volumes for MongoDB, Redis, and Nginx logs
- Development overlay with hot reload and exposed service ports
- Production-like overlay with only ingress ports published
- Smoke-test target for health and version endpoints

## Run locally

Build the local base images:

```sh
make bases
```

Start the development stack with hot reload:

```sh
make dev
```

Start the production-like stack:

```sh
make prod
```

Check service health:

```sh
make check
```

Tail logs:

```sh
make logs
```

## API endpoints

- `GET /api/health` returns MongoDB and Redis dependency status.
- `GET /api/version` returns runtime version information.
- `GET /api/tasks` lists tasks, using Redis cache when available.
- `POST /api/tasks` creates a task and invalidates cached task results.
- `PATCH /api/tasks/:id` updates a task and invalidates cached task results.
- `DELETE /api/tasks/:id` deletes a task and invalidates cached task results.

## Resume positioning

NodeMesh | Docker, Docker Compose, Node.js, Express, React, MongoDB, Redis, Nginx

Built a production-like containerized service platform that demonstrates MLOps
runtime patterns for model-serving and data-service workloads, including
service isolation, reverse proxy ingress, dependency health checks, and
environment-specific deployment overlays.

Implemented Docker Compose dev and production-like stacks with internal backend
networking, persistent MongoDB/Redis volumes, health-gated startup ordering,
container health checks, and Nginx as the only public entry point.

Designed an Express API with MongoDB persistence and Redis cache-aside reads,
including task CRUD endpoints, configurable cache TTL, cache invalidation on
writes, and smoke-testable health/version endpoints for deployment validation.

Integrated Docker secrets, non-root multi-stage runtime images, structured JSON
request/access logging, Makefile automation, and Nginx static asset serving plus
API proxying to support repeatable local operations.

## Next MLOps extensions

To make this project even stronger for an MLOps resume, the next logical steps
are:

- Add a small model-serving service, for example FastAPI plus scikit-learn or
  ONNX Runtime.
- Add CI checks for Docker builds, compose config validation, linting, and API
  smoke tests.
- Add Prometheus metrics and Grafana dashboards for latency, request volume,
  cache hits, and dependency health.
- Add model artifact versioning with MLflow, DVC, or a simple registry folder.
- Add load testing and document service-level objectives for the API.
