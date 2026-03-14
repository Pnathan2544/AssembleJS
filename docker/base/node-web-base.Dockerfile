# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# node-web-base  –  shared base for React build stages
# ---------------------------------------------------------------------------
FROM node:20-alpine3.19

LABEL org.opencontainers.image.description="NodeMesh web build base"

# System deps useful during CI / build (git for version injection, etc.)
RUN apk add --no-cache \
        ca-certificates \
        tzdata \
        git \
    && update-ca-certificates

# Package-manager hygiene
RUN npm config set update-notifier false && \
    corepack enable && \
    corepack prepare npm@latest --activate 2>/dev/null || true

# Non-root user that all child stages inherit
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV TZ=UTC \
    NODE_ENV=production

WORKDIR /app
