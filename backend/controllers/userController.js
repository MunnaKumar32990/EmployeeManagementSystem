const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role = 'employee' } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({ 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword, 
      role,
      taskCounts: {
        newTask: 0,
        active: 0,
        completed: 0,
        failed: 0
      }
    });
    
    const savedUser = await newUser.save();
    
    // Create token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    console.log('Fetching user profile with ID:', req.user.id);
    
    // Find user and ensure tasks are included
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean(); // Convert to plain JS object for manipulation
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log found user data for debugging
    console.log('User data found:', {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      tasksCount: user.tasks ? user.tasks.length : 0
    });
    
    // Ensure tasks property exists and is an array
    if (!user.tasks) {
      console.log('No tasks found in user data, initializing empty array');
      user.tasks = [];
    }
    
    // Ensure taskCounts exist with default values if missing
    if (!user.taskCounts) {
      console.log('No taskCounts found, initializing defaults');
      user.taskCounts = {
        newTask: 0,
        active: 0, 
        completed: 0,
        failed: 0
      };
    }
    
    // For employee users, check if we need to recalculate task counts
    if (user.role === 'employee') {
      console.log('Employee user, ensuring task counts match task statuses');
      
      // Calculate actual counts from tasks
      const counts = {
        newTask: 0,
        active: 0,
        completed: 0,
        failed: 0
      };
      
      user.tasks.forEach(task => {
        if (task.status === 'new' || task.newTask) counts.newTask++;
        else if (task.status === 'in progress' || task.active) counts.active++;
        else if (task.status === 'completed' || task.completed) counts.completed++;
        else if (task.status === 'failed' || task.failed) counts.failed++;
      });
      
      user.taskCounts = counts;
      console.log('Updated task counts:', counts);
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    // Check if user is updating own profile or admin is updating someone
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Prevent role updates unless admin
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to change role' });
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUsers,
  updateUser
};
