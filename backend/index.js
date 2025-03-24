const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Socket.io connection
const activeUsers = new Map(); // Map to store active users: userId -> socketId

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  // When a user connects, add them to active users
  socket.on('user-connected', (userId) => {
    if (userId) {
      console.log(`User ${userId} connected with socket ${socket.id}`);
      activeUsers.set(userId, socket.id);
      
      // Broadcast to all clients that this user is now online
      io.emit('users-updated', {
        userId,
        status: 'online'
      });
      
      // Send the current list of online users to the just connected client
      const onlineUsers = Array.from(activeUsers.keys());
      socket.emit('active-users-list', onlineUsers);
    }
  });
  
  // Listen for task assignments
  socket.on('task-assigned', (data) => {
    const { task, assignedToId } = data;
    console.log(`Task assigned to user ${assignedToId}:`, task);
    
    // If the assigned user is online, send them the task directly
    const assignedUserSocketId = activeUsers.get(assignedToId);
    if (assignedUserSocketId) {
      console.log(`Target user ${assignedToId} is online, sending task notification directly`);
      io.to(assignedUserSocketId).emit('task-assigned', task);
    } else {
      console.log(`Target user ${assignedToId} is offline, task will be available on their next login`);
    }
    
    // Broadcast to all clients that a task was assigned
    io.emit('task-update', { 
      type: 'new', 
      task,
      assignedToId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Listen for task updates
  socket.on('task-updated', (task) => {
    console.log('Task updated:', task);
    
    // Broadcast task update to all clients
    io.emit('task-updated', task);
    
    // Also notify the task assignee directly
    if (task.assignedTo) {
      const assigneeSocketId = activeUsers.get(task.assignedTo);
      if (assigneeSocketId) {
        io.to(assigneeSocketId).emit('task-update-notification', {
          message: `Task "${task.title || task.taskTitle}" has been updated`,
          task
        });
      }
    }
  });
  
  // Request for list of active users
  socket.on('get-active-users', () => {
    socket.emit('active-users-list', Array.from(activeUsers.keys()));
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    
    // Find and remove the disconnected user
    let disconnectedUserId = null;
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        activeUsers.delete(userId);
        break;
      }
    }
    
    // If we found who disconnected, broadcast that they're offline
    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected and is now offline`);
      io.emit('users-updated', {
        userId: disconnectedUserId,
        status: 'offline'
      });
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  // Start the server
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => console.log('MongoDB connection error:', err));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
