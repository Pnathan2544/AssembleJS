#!/bin/sh
# Used as HEALTHCHECK in the API Dockerfile.
# Returns 0 (healthy) if /api/health responds with status=ok.
curl -sf --max-time 4 "http://localhost:${PORT:-3000}/api/health" \
    | grep -q '"status":"ok"' || exit 1
