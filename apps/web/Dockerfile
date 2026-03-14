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
    CMD node -e "require('http').get('http://localhost:5173/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["npm", "run", "dev"]
