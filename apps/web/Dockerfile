# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# apps/web/Dockerfile  –  Vite dev server (development only)
# Production assets are built inside docker/nginx/Dockerfile as a stage.
# ---------------------------------------------------------------------------

FROM node-web-base AS web-base

COPY --chown=appuser:appgroup apps/web/package*.json ./
RUN NODE_ENV=development npm ci --prefer-offline \
    && chown -R appuser:appgroup node_modules

COPY --chown=appuser:appgroup apps/web/ ./

USER appuser

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -q --spider http://localhost:5173/ || exit 1

CMD ["npm", "run", "dev"]
