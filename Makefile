# Makefile – convenience targets for NodeMesh
# Requires Docker with Compose plugin.

COMPOSE_BASE  := docker compose -f compose/compose.yaml
COMPOSE_DEV   := $(COMPOSE_BASE) -f compose/compose.dev.yaml
COMPOSE_PROD  := $(COMPOSE_BASE) -f compose/compose.prodlike.yaml

.PHONY: help bases check dev prod down logs ps shell clean nuke

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Base images ───────────────────────────────────────────────────────────────
bases: ## Build custom base images locally
	docker build -t node-web-base:local -f docker/base/node-web-base.Dockerfile .
	docker build -t node-api-base:local -f docker/base/node-api-base.Dockerfile .

# ── Validation ────────────────────────────────────────────────────────────────
check: ## Quick smoke test: health + version endpoints
	@curl -sf http://localhost/api/health | python3 -m json.tool || \
	  curl -sf http://localhost/api/health
	@curl -sf http://localhost/api/version | python3 -m json.tool || \
	  curl -sf http://localhost/api/version

# ── Stack targets ─────────────────────────────────────────────────────────────
dev: bases ## Start the full stack in dev mode (hot reload, ports exposed)
	$(COMPOSE_DEV) up --build

dev-d: bases ## Start dev stack detached
	$(COMPOSE_DEV) up --build -d

prod: bases ## Start the full stack in prod-like mode
	$(COMPOSE_PROD) up --build -d

down: ## Stop and remove containers
	$(COMPOSE_BASE) down

down-v: ## Stop containers AND remove named volumes (⚠ data loss)
	$(COMPOSE_BASE) down -v

# ── Operations ────────────────────────────────────────────────────────────────
logs: ## Tail logs for all services
	$(COMPOSE_BASE) logs -f

logs-%: ## Tail logs for a specific service: make logs-api
	$(COMPOSE_BASE) logs -f $*

ps: ## Show running containers
	$(COMPOSE_BASE) ps

shell-%: ## Open a shell in a running service: make shell-api
	$(COMPOSE_BASE) exec $* sh

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove stopped containers and dangling images
	docker system prune -f

nuke: down-v clean ## Full teardown including volumes and images (⚠ destructive)
	docker rmi -f node-web-base:local node-api-base:local 2>/dev/null || true
