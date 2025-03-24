import authService from './authService';

const TASKS_STORAGE_KEY = 'ems_tasks';
const USERDATA_STORAGE_KEY = 'userData';

// Create a configured axios instance for tasks
const api = authService.api;

const taskService = {
  // Get tasks from localStorage and API
  getTasks: async () => {
    try {
      // First try to get from API
      const response = await api.get('/users/me/tasks');
      const apiTasks = response.data?.tasks || [];
      console.log('API Tasks:', apiTasks);
      
      // Then get from localStorage
      const cachedTasks = taskService.getCachedTasks();
      console.log('Cached Tasks:', cachedTasks);
      
      // Merge tasks, preferring API tasks when there's a conflict on _id
      const apiTaskIds = new Set(apiTasks.map(task => task._id));
      const uniqueCachedTasks = cachedTasks.filter(task => !apiTaskIds.has(task._id));
      
      const mergedTasks = [...apiTasks, ...uniqueCachedTasks];
      console.log('Merged Tasks:', mergedTasks);
      
      // Update cache with merged tasks
      taskService.cacheTasks(mergedTasks);
      
      return mergedTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fall back to cached tasks on error
      return taskService.getCachedTasks();
    }
  },
  
  // Get tasks from localStorage
  getCachedTasks: () => {
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error retrieving cached tasks:', error);
      return [];
    }
  },
  
  // Save tasks to localStorage
  cacheTasks: (tasks) => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error caching tasks:', error);
    }
  },
  
  // Create a new task
  createTask: async (taskData) => {
    try {
      // Try to create via API
      const response = await api.post('/tasks', taskData);
      const newTask = response.data;
      
      // Update local cache with the new task
      const tasks = taskService.getCachedTasks();
      tasks.push(newTask);
      taskService.cacheTasks(tasks);
      
      // Also update user data to include the new task
      taskService.updateUserTaskData(newTask);
      
      return newTask;
    } catch (error) {
      console.error('Error creating task via API:', error);
      
      // Fall back to local storage only
      const localTask = {
        ...taskData,
        _id: Date.now().toString(), // Generate a temporary ID
        createdAt: new Date().toISOString()
      };
      
      // Add to local storage
      const tasks = taskService.getCachedTasks();
      tasks.push(localTask);
      taskService.cacheTasks(tasks);
      
      // Also update user data
      taskService.updateUserTaskData(localTask);
      
      return localTask;
    }
  },
  
  // Update a task
  updateTask: async (taskId, taskData) => {
    try {
      // Try to update via API
      const response = await api.put(`/tasks/${taskId}`, taskData);
      const updatedTask = response.data;
      
      // Update local cache with the updated task
      const tasks = taskService.getCachedTasks();
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? { ...task, ...updatedTask } : task
      );
      taskService.cacheTasks(updatedTasks);
      
      // Also update user data
      taskService.updateUserTaskData(updatedTask);
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task via API:', error);
      
      // Fall back to local storage only
      // Update local cache with the updated task
      const tasks = taskService.getCachedTasks();
      const localUpdatedTask = { ...taskData, _id: taskId };
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? { ...task, ...localUpdatedTask } : task
      );
      taskService.cacheTasks(updatedTasks);
      
      // Also update user data
      taskService.updateUserTaskData(localUpdatedTask);
      
      return localUpdatedTask;
    }
  },
  
  // Update user data in localStorage to include the task
  updateUserTaskData: (task) => {
    try {
      const userData = JSON.parse(localStorage.getItem(USERDATA_STORAGE_KEY) || '[]');
      
      // Find the target employee
      const updatedUserData = userData.map(user => {
        if (user._id === task.assignedTo) {
          // Make sure the user has tasks array and taskCounts
          const tasks = Array.isArray(user.tasks) ? [...user.tasks] : [];
          
          // Check if task already exists in tasks
          const taskIndex = tasks.findIndex(t => t._id === task._id);
          if (taskIndex >= 0) {
            // Update existing task
            tasks[taskIndex] = { ...tasks[taskIndex], ...task };
          } else {
            // Add new task
            tasks.push(task);
          }
          
          // Update task counts
          const taskCounts = user.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 };
          
          // Recalculate counts based on tasks
          const newCounts = {
            newTask: 0,
            active: 0,
            completed: 0,
            failed: 0
          };
          
          tasks.forEach(t => {
            if (t.status === 'new' || t.newTask) newCounts.newTask++;
            else if (t.status === 'in progress' || t.active) newCounts.active++;
            else if (t.status === 'completed' || t.completed) newCounts.completed++;
            else if (t.status === 'failed' || t.failed) newCounts.failed++;
          });
          
          return {
            ...user,
            tasks,
            taskCounts: newCounts
          };
        }
        return user;
      });
      
      localStorage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user task data:', error);
    }
  }
};

export default taskService; 