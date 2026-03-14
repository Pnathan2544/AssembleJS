/**
 * task.cache.js – Redis-backed cache helpers for the tasks domain.
 * Implements cache-aside: service checks cache, falls through to DB on miss,
 * then writes result back to cache.
 */
const { getClient } = require('../config/redis')

const TTL = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10)

const KEY = {
  all:    () => 'tasks:all',
  byId:   (id) => `tasks:${id}`,
}

async function getAll() {
  const raw = await getClient().get(KEY.all())
  return raw ? JSON.parse(raw) : null
}

async function setAll(tasks) {
  await getClient().setex(KEY.all(), TTL, JSON.stringify(tasks))
}

async function getById(id) {
  const raw = await getClient().get(KEY.byId(id))
  return raw ? JSON.parse(raw) : null
}

async function setById(id, task) {
  await getClient().setex(KEY.byId(id), TTL, JSON.stringify(task))
}

async function invalidateAll() {
  const keys = await getClient().keys('tasks:*')
  if (keys.length) await getClient().del(...keys)
}

module.exports = { getAll, setAll, getById, setById, invalidateAll }
