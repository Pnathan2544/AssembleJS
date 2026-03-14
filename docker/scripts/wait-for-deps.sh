#!/bin/sh
# wait-for-deps.sh – lightweight TCP readiness probe.
# Usage: wait-for-deps.sh host:port [host:port ...] -- command [args]
#
# This script is a fallback for images that do not support depends_on
# health-gating. Prefer Compose depends_on + healthcheck where possible.

set -e

TIMEOUT=${WAIT_TIMEOUT:-30}

wait_for() {
  local host="${1%%:*}"
  local port="${1##*:}"
  local elapsed=0

  echo "[wait] Waiting for ${host}:${port}…"
  until nc -z "$host" "$port" 2>/dev/null; do
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
      echo "[wait] Timeout after ${TIMEOUT}s waiting for ${host}:${port}"
      exit 1
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  echo "[wait] ${host}:${port} is up (${elapsed}s)"
}

# Parse args: collect host:port pairs, then everything after '--'
while [ "$#" -gt 0 ]; do
  case "$1" in
    --)
      shift
      break
      ;;
    *)
      wait_for "$1"
      shift
      ;;
  esac
done

exec "$@"
