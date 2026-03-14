const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Task = mongoose.model('Task', taskSchema)

async function findAll() {
  return Task.find().sort({ createdAt: -1 }).lean()
}

async function findById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Task.findById(id).lean()
}

async function create(data) {
  const task = new Task(data)
  return (await task.save()).toObject()
}

async function updateById(id, patch) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Task.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean()
}

async function deleteById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Task.findByIdAndDelete(id).lean()
}

module.exports = { findAll, findById, create, updateById, deleteById }
