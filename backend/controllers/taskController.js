const Task = require('../models/Task');

const createTask = async (req, res) => {
  const { taskTitle, taskDescription, taskDate, category, asignTo } = req.body;
  try {
    const newTask = new Task({ taskTitle, taskDescription, taskDate, category, asignTo });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks };
