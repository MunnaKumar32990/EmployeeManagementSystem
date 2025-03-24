const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUsers, 
  updateUser 
} = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', auth, getUserProfile);
router.get('/me/tasks', auth, (req, res) => {
  try {
    // This is a simple helper endpoint to check if tasks exist for debugging
    const userId = req.user.id;
    console.log(`Requested tasks for user ${userId}`);
    
    // Find the user to get their tasks
    const User = require('../models/User');
    User.findById(userId)
      .select('tasks taskCounts firstName lastName')
      .lean()
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Return user tasks and task counts
        res.status(200).json({
          user: `${user.firstName} ${user.lastName}`,
          taskCounts: user.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 },
          tasksCount: user.tasks ? user.tasks.length : 0,
          tasks: user.tasks || []
        });
      })
      .catch(err => {
        console.error('Error fetching user tasks:', err);
        res.status(500).json({ message: 'Server error fetching tasks' });
      });
  } catch (error) {
    console.error('Error in tasks endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});
router.put('/:id', auth, updateUser);

// Admin only routes
router.get('/', auth, adminOnly, getUsers);

module.exports = router;
