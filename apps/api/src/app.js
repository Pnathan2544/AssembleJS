require('express-async-errors')
const express = require('express')
const db      = require('./config/db')
const redis   = require('./config/redis')

const requestId   = require('./middleware/requestId')
const errorHandler = require('./middleware/errorHandler')

const healthRoutes = require('./routes/health.routes')
const taskRoutes   = require('./routes/tasks.routes')

const app  = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(requestId)

// Structured request logging
app.use((req, _res, next) => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    rid: req.id,
    method: req.method,
    path: req.path,
  }))
  next()
})

// Routes
app.use('/api', healthRoutes)
app.use('/api/tasks', taskRoutes)

// Catch-all 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler (must be last)
app.use(errorHandler)

async function start() {
  try {
    await db.connect()
    await redis.getClient().connect()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[api] Listening on :${PORT}`)
    })
  } catch (err) {
    console.error('[api] Startup failed:', err)
    process.exit(1)
  }
}

start()
