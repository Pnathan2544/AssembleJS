#!/bin/bash
# Runs once on first container start (mongo entrypoint convention).
# Creates the application user with credentials read from secret files.
set -euo pipefail

SECRETS_DIR="${SECRETS_DIR:-/run/secrets}"

APP_USER=$(cat "${SECRETS_DIR}/mongo_app_username")
APP_PASS=$(cat "${SECRETS_DIR}/mongo_app_password")
APP_DB="${MONGO_DB:-nodemesh}"

echo "[mongo-init] Creating app user '${APP_USER}' on database '${APP_DB}'"

mongosh --quiet \
    -u "$(cat "${SECRETS_DIR}/mongo_root_username")" \
    -p "$(cat "${SECRETS_DIR}/mongo_root_password")" \
    --authenticationDatabase admin \
    "${APP_DB}" \
    --eval "
        db.createUser({
          user: '${APP_USER}',
          pwd:  '${APP_PASS}',
          roles: [{ role: 'readWrite', db: '${APP_DB}' }]
        });
        print('[mongo-init] User created.');
    "
