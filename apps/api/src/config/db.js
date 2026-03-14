const mongoose = require('mongoose')
const secrets = require('./secrets')

let connected = false

async function connect() {
  if (connected) return

  const host = process.env.MONGO_HOST || 'mongo'
  const port = process.env.MONGO_PORT || '27017'
  const db   = process.env.MONGO_DB   || 'nodemesh'
  const user = secrets.mongoAppUsername()
  const pass = secrets.mongoAppPassword()

  const uri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}?authSource=${db}`

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  })

  connected = true
  console.log(`[db] Connected to MongoDB at ${host}:${port}/${db}`)
}

async function isHealthy() {
  try {
    if (mongoose.connection.readyState !== 1) return false
    await mongoose.connection.db.admin().ping()
    return true
  } catch {
    return false
  }
}

module.exports = { connect, isHealthy }
