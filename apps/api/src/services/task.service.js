/**
 * task.service.js – business logic for tasks.
 * Cache-aside pattern: read from cache → miss → read from DB → write to cache.
 * Writes always go to DB first, then invalidate cache.
 */
const repo  = require('../repositories/task.repository')
const cache = require('../cache/task.cache')

async function getAllTasks() {
  const cached = await cache.getAll()
  if (cached) return { tasks: cached, fromCache: true }

  const tasks = await repo.findAll()
  await cache.setAll(tasks)
  return { tasks, fromCache: false }
}

async function getTaskById(id) {
  const cached = await cache.getById(id)
  if (cached) return { task: { ...cached, fromCache: true }, fromCache: true }

  const task = await repo.findById(id)
  if (!task) return null
  await cache.setById(id, task)
  return { task, fromCache: false }
}

async function createTask(data) {
  const task = await repo.create(data)
  await cache.invalidateAll()
  return task
}

async function updateTask(id, patch) {
  const task = await repo.updateById(id, patch)
  if (!task) return null
  await cache.invalidateAll()
  return task
}

async function deleteTask(id) {
  const task = await repo.deleteById(id)
  if (!task) return null
  await cache.invalidateAll()
  return task
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask }
