import React, { useEffect, useState } from 'react';
import Header from '../other/Header';
import TaskListNumbers from '../other/TaskListNumber';
import TaskList from '../TaskList/Tasklist';
import NotificationsContainer from '../other/Notifications';
import authService from '../../services/authService';
// Import test functions and taskService
import { addTestTask, clearAllTasks } from '../../testTask';
import taskService from '../../services/taskService';
import { motion } from 'framer-motion';

const EmployeeDashboard = ({ onLogout, socket }) => {
  const [userData, setUserData] = useState(authService.getCurrentUser());
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({ 
    dataFetched: false, 
    tasksCount: 0,
    socketConnected: false,
    lastUpdate: null
  });

  useEffect(() => {
    // Fetch employee data
    const fetchEmployeeData = async () => {
      try {
        // First, try to get user profile data
        const profileResponse = await authService.api.get(`/users/me`);
        console.log('Fetched profile data:', profileResponse.data);
        
        // Get tasks using taskService instead
        const tasks = await taskService.getTasks();
        console.log('Fetched tasks using taskService:', tasks);
        
        // Calculate actual task counts from tasks array rather than using stored counts
        const taskCounts = {
          newTask: 0,
          active: 0,
          completed: 0,
          failed: 0
        };
        
        // Only count tasks if they actually exist
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
          tasks.forEach(task => {
            if (task.status === 'new' || task.newTask) taskCounts.newTask++;
            else if (task.status === 'in progress' || task.active) taskCounts.active++;
            else if (task.status === 'completed' || task.completed) taskCounts.completed++;
            else if (task.status === 'failed' || task.failed) taskCounts.failed++;
          });
        }
        
        // Combine the data, with tasks data from taskService
        const combinedData = {
          ...profileResponse.data,
          tasks: Array.isArray(tasks) ? tasks : [],
          taskCounts
        };
        
        console.log('Combined data:', {
          name: combinedData.firstName,
          tasksCount: combinedData.tasks.length,
          taskCounts: combinedData.taskCounts
        });
        
        // Check the current user in AuthContext
        const currentUser = authService.getCurrentUser();
        console.log('Current user from auth service:', currentUser);
        
        // If response doesn't have tasks but we have userData with tasks, merge them
        if ((!combinedData.tasks || combinedData.tasks.length === 0) && 
            userData && userData.tasks && userData.tasks.length > 0) {
          console.log('Using tasks from userData instead of server response');
          combinedData.tasks = userData.tasks;
          
          // Update task counts based on tasks
          if (combinedData.tasks && combinedData.tasks.length > 0) {
            const counts = {
              newTask: 0,
              active: 0,
              completed: 0,
              failed: 0
            };
            
            combinedData.tasks.forEach(task => {
              if (task.status === 'new' || task.newTask) counts.newTask++;
              else if (task.status === 'in progress' || task.active) counts.active++;
              else if (task.status === 'completed' || task.completed) counts.completed++;
              else if (task.status === 'failed' || task.failed) counts.failed++;
            });
            
            combinedData.taskCounts = counts;
          }
        }
        
        setEmployeeData(combinedData);
        setDebug(prev => ({ 
          ...prev, 
          dataFetched: true, 
          tasksCount: combinedData.tasks?.length || 0,
          lastUpdate: new Date().toISOString()
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setError('Failed to load your data. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchEmployeeData();

    // Set up socket event listeners
    if (socket) {
      // Connect with our user id
      socket.emit('user-connected', userData?._id);
      setDebug(prev => ({ ...prev, socketConnected: socket.connected }));
      
      // Socket connection status
      socket.on('connect', () => {
        console.log('Socket connected');
        setDebug(prev => ({ ...prev, socketConnected: true }));
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setDebug(prev => ({ ...prev, socketConnected: false }));
      });
      
      // Listen for task updates
      socket.on('task-updated', (updatedTask) => {
        console.log('Task updated via socket:', updatedTask);
        // Update your task list here
        setEmployeeData(prevData => {
          if (!prevData) return prevData;
          
          // Update tasks array with the updated task
          const updatedTasks = prevData.tasks?.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          ) || [];
          
          // Recalculate task counts
          const taskCounts = {
            newTask: 0,
            active: 0,
            completed: 0,
            failed: 0
          };
          
          updatedTasks.forEach(task => {
            if (task.status === 'new' || task.newTask) taskCounts.newTask++;
            else if (task.status === 'in progress' || task.active) taskCounts.active++;
            else if (task.status === 'completed' || task.completed) taskCounts.completed++;
            else if (task.status === 'failed' || task.failed) taskCounts.failed++;
          });
          
          const newData = {
            ...prevData,
            tasks: updatedTasks,
            taskCounts
          };
          setDebug(prev => ({ 
            ...prev, 
            tasksCount: newData.tasks?.length || 0,
            lastUpdate: new Date().toISOString()
          }));
          return newData;
        });
      });

      // Listen for new tasks assigned to this employee
      socket.on('task-assigned', (newTask) => {
        console.log('New task assigned via socket:', newTask);
        // Add the new task to your task list
        setEmployeeData(prevData => {
          if (!prevData) return prevData;
          
          const tasks = prevData.tasks || [];
          const updatedTasks = [...tasks, newTask];
          
          // Recalculate task counts
          const taskCounts = {
            newTask: 0,
            active: 0,
            completed: 0,
            failed: 0
          };
          
          updatedTasks.forEach(task => {
            if (task.status === 'new' || task.newTask) taskCounts.newTask++;
            else if (task.status === 'in progress' || task.active) taskCounts.active++;
            else if (task.status === 'completed' || task.completed) taskCounts.completed++;
            else if (task.status === 'failed' || task.failed) taskCounts.failed++;
          });
          
          const newData = {
            ...prevData,
            tasks: updatedTasks,
            taskCounts
          };
          setDebug(prev => ({ 
            ...prev, 
            tasksCount: newData.tasks?.length || 0,
            lastUpdate: new Date().toISOString()
          }));
          return newData;
        });
      });
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('task-updated');
        socket.off('task-assigned');
      }
    };
  }, [socket, userData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold"
          >
            Loading your dashboard...
          </motion.p>
          <p className="text-gray-400 text-sm">Retrieving your tasks and information</p>
        </div>
      </div>
    );
  }

  // Render error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-red-600/20 border border-red-600 rounded-lg p-6 max-w-lg text-center shadow-lg"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md shadow transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    );
  }

  const displayData = employeeData || userData;
  const hasData = Boolean(displayData);
  const hasTasks = Array.isArray(displayData?.tasks) && displayData.tasks.length > 0;

  // Calculate welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const name = displayData?.firstName || 'Employee';
    
    if (hour < 12) return `Good Morning, ${name}`;
    if (hour < 17) return `Good Afternoon, ${name}`;
    return `Good Evening, ${name}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Header section with subtle gradient */}
      <div className="bg-gray-800 bg-opacity-90 shadow-lg backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Header onLogout={onLogout} data={displayData} />
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-6 py-8">
        {hasData ? (
          <>
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold text-white">
                {getWelcomeMessage()} 👋
              </h1>
              <p className="text-gray-400 mt-1">
                Here's an overview of your tasks and activities
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <TaskListNumbers data={displayData} />
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700/50"
            >
              <div className="px-6 py-4 bg-gray-700/50 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Assigned Tasks
                </h2>
                <p className="text-gray-300 text-sm">
                  Here are all the tasks that have been assigned to you
                </p>
              </div>
              
              <div className="p-6">
                <TaskList data={displayData} socket={socket} />
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700/50 shadow-xl"
          >
            <div className="w-24 h-24 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No User Data Available</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">We couldn't load your user information. This might be due to a connection issue or your account may need to be set up properly.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Refresh Page
            </button>
            <button
              onClick={onLogout}
              className="ml-3 bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Log Out
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Notifications */}
      <NotificationsContainer socket={socket} userId={userData?._id} />
    </div>
  );
};

export default EmployeeDashboard;