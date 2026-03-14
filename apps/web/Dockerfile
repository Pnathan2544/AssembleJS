# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# apps/web/Dockerfile  –  multi-stage React build
# Stages: web-base → deps → builder → runtime (nginx)
# ---------------------------------------------------------------------------

# ── Stage 1: shared build base ───────────────────────────────────────────────
FROM node-web-base AS web-base
# Inherits non-root user, node 20-alpine, corepack

# ── Stage 2: dependency layer (cache-friendly) ───────────────────────────────
FROM web-base AS deps
# Copy manifests first so this layer is only invalidated when deps change
COPY --chown=appuser:appgroup apps/web/package*.json ./
RUN npm ci --prefer-offline

# ── Stage 3: builder ─────────────────────────────────────────────────────────
FROM deps AS builder
ARG BUILD_MODE=production
ENV NODE_ENV=${BUILD_MODE}

COPY --chown=appuser:appgroup apps/web/ ./
RUN npm run build

# ── Stage 4: runtime – nginx serves the static bundle ───────────────────────
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.description="NodeMesh web – static assets"

# Remove default config; our own is injected via Compose / nginx image
RUN rm /etc/nginx/conf.d/default.conf

# Copy the compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root nginx: nginx master runs as root to bind :80, but workers run as
# the default 'nginx' user already set in the upstream image.
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1
