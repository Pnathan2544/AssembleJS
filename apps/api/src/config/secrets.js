/**
 * secrets.js – reads sensitive values from Docker secret files
 * mounted at /run/secrets/<name>.
 * Falls back to env vars for local dev without Docker secrets.
 */
const fs = require('fs')
const path = require('path')

const SECRETS_DIR = process.env.SECRETS_DIR || '/run/secrets'

function readSecret(name, envFallback) {
  const filePath = path.join(SECRETS_DIR, name)
  try {
    return fs.readFileSync(filePath, 'utf8').trim()
  } catch {
    const val = process.env[envFallback]
    if (!val) {
      throw new Error(
        `Secret "${name}" not found at ${filePath} and env var "${envFallback}" is not set`
      )
    }
    return val
  }
}

module.exports = {
  mongoAppUsername: () => readSecret('mongo_app_username', 'MONGO_APP_USERNAME'),
  mongoAppPassword: () => readSecret('mongo_app_password', 'MONGO_APP_PASSWORD'),
  redisPassword:   () => readSecret('redis_password',     'REDIS_PASSWORD'),
}
