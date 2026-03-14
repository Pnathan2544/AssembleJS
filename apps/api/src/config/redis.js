const Redis = require('ioredis')
const secrets = require('./secrets')

let client = null

function getClient() {
  if (client) return client

  const host     = process.env.REDIS_HOST || 'redis'
  const port     = parseInt(process.env.REDIS_PORT || '6379', 10)
  let   password

  try {
    password = secrets.redisPassword()
  } catch {
    password = undefined
  }

  client = new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  })

  client.on('connect', () => console.log(`[redis] Connected to ${host}:${port}`))
  client.on('error',   err => console.error('[redis] Error:', err.message))

  return client
}

async function isHealthy() {
  try {
    const pong = await getClient().ping()
    return pong === 'PONG'
  } catch {
    return false
  }
}

module.exports = { getClient, isHealthy }
