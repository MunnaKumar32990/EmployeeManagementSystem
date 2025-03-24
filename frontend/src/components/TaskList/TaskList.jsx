import React, { useState } from 'react';
import AcceptTask from './AcceptTask';
import CompleteTask from './CompleteTask';
import FailedTask from './FailedTask';
import NewTask from './NewTask';
import taskService from '../../services/taskService';
import { motion, AnimatePresence } from 'framer-motion';

// Task status component with appropriate color coding
const TaskStatus = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100/80 text-blue-800 border border-blue-200';
      case 'in progress':
        return 'bg-yellow-100/80 text-yellow-800 border border-yellow-200';
      case 'completed':
        return 'bg-green-100/80 text-green-800 border border-green-200';
      case 'failed':
        return 'bg-red-100/80 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100/80 text-gray-800 border border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyles()} shadow-sm`}>
      {status || 'Unknown'}
    </span>
  );
};

// Priority badge component
const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100/80 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-orange-100/80 text-orange-800 border border-orange-200';
      case 'low':
        return 'bg-green-100/80 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100/80 text-gray-800 border border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityStyles()} shadow-sm`}>
      {priority || 'Normal'}
    </span>
  );
};

// Category badge component
const CategoryBadge = ({ category }) => {
  return (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100/80 text-purple-800 border border-purple-200 shadow-sm">
      {category || 'General'}
    </span>
  );
};

const TaskList = ({ data, socket }) => {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleTaskExpansion = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };
  
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Find the task to update
      const task = data?.tasks?.find(task => task._id === taskId);
      if (!task) {
        console.error(`Task with ID ${taskId} not found`);
        return;
      }
      
      // Update task with new status
      const statusFlags = {
        newTask: false,
        active: false,
        completed: false,
        failed: false
      };
      
      // Set the appropriate flag based on status
      if (newStatus === 'new') statusFlags.newTask = true;
      else if (newStatus === 'In Progress' || newStatus === 'active') statusFlags.active = true;
      else if (newStatus === 'Completed' || newStatus === 'completed') statusFlags.completed = true;
      else if (newStatus === 'Failed' || newStatus === 'failed') statusFlags.failed = true;
      
      const updatedTask = { 
        ...task, 
        status: newStatus,
        ...statusFlags
      };
      
      console.log('Updating task status:', { taskId, oldStatus: task.status, newStatus, updatedTask });
      
      // Use taskService to update the task
      const result = await taskService.updateTask(taskId, updatedTask);
      console.log('Task updated via taskService:', result);
      
      // Emit event via socket.io if available
      if (socket) {
        console.log('Emitting task-updated event:', updatedTask);
        socket.emit('task-updated', updatedTask);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Filter and search tasks
  const filteredTasks = () => {
    if (!data?.tasks) return [];
    
    return data.tasks.filter(task => {
      // Get the status for filtering
      const taskStatus = task.status?.toLowerCase() || 
        (task.completed ? 'completed' : task.active ? 'in progress' : task.failed ? 'failed' : 'new');
      
      // Filter by status
      const statusMatch = filterStatus === 'all' || taskStatus.includes(filterStatus.toLowerCase());
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        (task.taskTitle || task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.taskDescription || task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  };
  
  // Check if tasks array exists and has items
  if (!data?.tasks || data.tasks.length === 0) {
    console.log("No tasks found in data:", data);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-lg text-center shadow-xl backdrop-blur-sm"
      >
        <div className="w-20 h-20 bg-gray-700/50 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">No tasks assigned</h3>
        <p className="mt-2 text-gray-400 max-w-md mx-auto">You don't have any tasks assigned to you at the moment. Check back later or contact your administrator.</p>
      </motion.div>
    );
  }

  // Add debug console log to show found tasks
  console.log(`Rendering ${data.tasks.length} tasks`);
  
  // Get the filtered tasks
  const tasksToDisplay = filteredTasks();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden"
    >
      {/* Search and filter controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            className="bg-gray-700/50 border border-gray-600 text-white rounded-md py-2 pl-10 pr-4 block w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilterStatus('in progress')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'in progress' ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {/* Task cards instead of table */}
      <div className="grid grid-cols-1 gap-4">
        {tasksToDisplay.map((task, idx) => (
          <motion.div 
            key={task._id || idx}
            layoutId={task._id || `task-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleTaskExpansion(task._id || idx)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">{task.taskTitle || task.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <CategoryBadge category={task.category} />
                    <PriorityBadge priority={task.priority} />
                    <TaskStatus status={task.status || (task.completed ? 'Completed' : task.active ? 'In Progress' : task.failed ? 'Failed' : 'New')} />
                  </div>
                  
                  <div className="text-sm text-gray-400 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Due: {task.taskDate || task.dueDate ? new Date(task.taskDate || task.dueDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-md transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task._id || idx, 'In Progress');
                    }}
                    title="Start Task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button 
                    className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-md transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task._id || idx, 'Completed');
                    }}
                    title="Complete Task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button 
                    className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-md transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task._id || idx, 'Failed');
                    }}
                    title="Mark as Failed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Task expansion indicator */}
              <div className="flex justify-center mt-1">
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedTaskId === (task._id || idx) ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Expanded task details */}
            <AnimatePresence>
              {expandedTaskId === (task._id || idx) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-700/50 bg-gray-700/20"
                >
                  <div className="p-4">
                    <h4 className="text-md font-medium text-gray-300 mb-2">Description</h4>
                    <p className="mb-4 text-gray-400 whitespace-pre-line">{task.taskDescription || task.description || 'No description provided'}</p>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800/40 rounded-md p-3">
                        <h5 className="text-sm font-medium text-gray-400 mb-1">Created On</h5>
                        <p className="text-white">{task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}</p>
                      </div>
                      <div className="bg-gray-800/40 rounded-md p-3">
                        <h5 className="text-sm font-medium text-gray-400 mb-1">Last Updated</h5>
                        <p className="text-white">{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'Not updated'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task._id || idx, 'In Progress');
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Task
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task._id || idx, 'Completed');
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Complete Task
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task._id || idx, 'Failed');
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark as Failed
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {/* Show message when no tasks match filters */}
      {tasksToDisplay.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-6 text-center shadow"
        >
          <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No tasks match your filters</h3>
          <p className="mt-2 text-gray-400">Try changing your search or filter criteria</p>
          <button 
            onClick={() => { setFilterStatus('all'); setSearchTerm(''); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskList;