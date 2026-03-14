# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# docker/nginx/Dockerfile  –  public ingress + static asset server
#
# Multi-stage:
#   web-deps    install React dependencies (cache layer)
#   web-builder build React bundle
#   runtime     nginx with proxy config + compiled assets
# ---------------------------------------------------------------------------

# ── Stage 1: web dependency layer ────────────────────────────────────────────
FROM node-web-base AS web-deps
COPY apps/web/package*.json ./
RUN npm ci --prefer-offline

# ── Stage 2: React build ─────────────────────────────────────────────────────
FROM web-deps AS web-builder
ARG BUILD_MODE=production
ENV NODE_ENV=${BUILD_MODE}
COPY apps/web/ ./
RUN npm run build

# ── Stage 3: nginx runtime ───────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.description="NodeMesh nginx ingress"

# Remove default site config
RUN rm -f /etc/nginx/conf.d/default.conf

# Web assets from build stage
COPY --from=web-builder /app/dist /usr/share/nginx/html

# Nginx configuration
COPY docker/nginx/nginx.conf  /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/     /etc/nginx/conf.d/

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/healthz || exit 1
