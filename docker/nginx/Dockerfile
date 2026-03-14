# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# docker/nginx/Dockerfile  –  public ingress
# Bundles config only; static web assets are copied in from web build stage
# via the Compose build or a shared volume.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.description="NodeMesh Nginx ingress"

# Remove default site
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our configs
COPY docker/nginx/nginx.conf      /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/         /etc/nginx/conf.d/

EXPOSE 80 443

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/healthz || exit 1
