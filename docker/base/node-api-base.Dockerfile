# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# node-api-base  –  shared base for Express runtime stages
# ---------------------------------------------------------------------------
FROM node:20-alpine3.19

LABEL org.opencontainers.image.description="NodeMesh API runtime base"

# curl  – healthchecks
# dumb-init – proper PID 1 / signal handling
RUN apk add --no-cache \
        ca-certificates \
        tzdata \
        curl \
        dumb-init \
    && update-ca-certificates

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV TZ=UTC \
    NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Default: dumb-init as PID 1 → all child stages inherit signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
