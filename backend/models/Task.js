const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskTitle: String,
  taskDescription: String,
  taskDate: Date,
  category: String,
  asignTo: String,
  active: Boolean,
  newTask: Boolean,
  failed: Boolean,
  completed: Boolean,
});

module.exports = mongoose.model('Task', taskSchema);
