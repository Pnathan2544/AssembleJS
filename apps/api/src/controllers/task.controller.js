const service = require('../services/task.service')

async function list(req, res) {
  const result = await service.getAllTasks()
  res.json(result)
}

async function get(req, res) {
  const result = await service.getTaskById(req.params.id)
  if (!result) return res.status(404).json({ error: 'Task not found' })
  res.json(result)
}

async function create(req, res) {
  const { title } = req.body
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: '`title` is required' })
  }
  const task = await service.createTask({ title: title.trim() })
  res.status(201).json({ task })
}

async function update(req, res) {
  const allowed = ['title', 'completed']
  const patch = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  )
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided' })
  }
  const task = await service.updateTask(req.params.id, patch)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json({ task })
}

async function remove(req, res) {
  const task = await service.deleteTask(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.status(204).end()
}

module.exports = { list, get, create, update, remove }
