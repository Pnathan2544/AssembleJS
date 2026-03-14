# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# apps/api/Dockerfile  –  Express API
# Stages: api-base → deps → runtime
# ---------------------------------------------------------------------------

# ── Stage 1: shared runtime base ─────────────────────────────────────────────
FROM node-api-base AS api-base

# ── Stage 2: dependency installation (cache-friendly) ────────────────────────
FROM api-base AS deps
COPY --chown=appuser:appgroup apps/api/package*.json ./
RUN npm ci --omit=dev --prefer-offline

# ── Stage 3: final runtime image ─────────────────────────────────────────────
FROM api-base AS runtime

LABEL org.opencontainers.image.description="NodeMesh API"

# Copy only production node_modules
COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup apps/api/src ./src
COPY --chown=appuser:appgroup apps/api/package.json ./package.json

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:3000/api/health || exit 1

CMD ["node", "src/app.js"]
