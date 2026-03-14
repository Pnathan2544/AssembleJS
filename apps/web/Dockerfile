# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# apps/web/Dockerfile  –  Vite dev server (development only)
# Production assets are built inside docker/nginx/Dockerfile as a stage.
# ---------------------------------------------------------------------------

FROM node-web-base AS web-base

COPY --chown=appuser:appgroup apps/web/package*.json ./
RUN npm ci --prefer-offline

COPY --chown=appuser:appgroup apps/web/ ./

USER appuser

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5173/ || exit 1

CMD ["npm", "run", "dev"]
