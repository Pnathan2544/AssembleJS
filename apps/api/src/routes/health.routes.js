const { Router } = require('express')
const db    = require('../config/db')
const redis = require('../config/redis')

const router = Router()

router.get('/health', async (req, res) => {
  const [mongo, redisOk] = await Promise.all([db.isHealthy(), redis.isHealthy()])
  const status = mongo && redisOk ? 'ok' : 'degraded'
  res.status(status === 'ok' ? 200 : 503).json({
    status,
    services: { mongo, redis: redisOk },
    uptime: Math.floor(process.uptime()),
  })
})

router.get('/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    nodeEnv: process.env.NODE_ENV,
    node:    process.version,
  })
})

module.exports = router
