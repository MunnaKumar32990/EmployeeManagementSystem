// This is a test utility to manually add a task to the current user
// To use, run this in the browser console:
// import('./testTask.js').then(module => module.addTestTask())

export function addTestTask() {
  console.log('Adding test task to current user...');
  
  try {
    // Get current user from session storage
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in session storage');
      return;
    }
    
    const user = JSON.parse(userJson);
    console.log('Current user:', user);
    
    // Create a test task
    const testTask = {
      _id: Date.now().toString(),
      taskTitle: 'Test Task ' + new Date().toLocaleTimeString(),
      title: 'Test Task ' + new Date().toLocaleTimeString(),
      taskDescription: 'This is a test task created directly for debugging purposes',
      description: 'This is a test task created directly for debugging purposes',
      taskDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Test',
      priority: 'medium',
      status: 'new',
      assignedTo: user._id,
      createdAt: new Date().toISOString(),
      active: false,
      newTask: true,
      failed: false,
      completed: false
    };
    
    console.log('Created test task:', testTask);
    
    // Store in localStorage for persistence
    const storedTasks = JSON.parse(localStorage.getItem('ems_tasks') || '[]');
    storedTasks.push({
      ...testTask,
      targetEmployee: user.firstName
    });
    localStorage.setItem('ems_tasks', JSON.stringify(storedTasks));
    console.log('Saved test task to localStorage');
    
    // Inject the task directly into the user
    // First, get existing user data if any
    let userData = JSON.parse(localStorage.getItem('userData') || '[]');
    
    // Find the current user in the array
    let userFound = false;
    userData = userData.map(u => {
      if (u._id === user._id) {
        userFound = true;
        // Add the task to the user's tasks
        const tasks = Array.isArray(u.tasks) ? [...u.tasks, testTask] : [testTask];
        
        // Update task counts
        const taskCounts = u.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 };
        taskCounts.newTask++;
        
        return {
          ...u,
          tasks,
          taskCounts
        };
      }
      return u;
    });
    
    // If user not found in userData, add them
    if (!userFound) {
      userData.push({
        ...user,
        tasks: [testTask],
        taskCounts: { newTask: 1, active: 0, completed: 0, failed: 0 }
      });
    }
    
    // Save back to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('Updated user data in localStorage');
    
    alert('Test task added successfully. Try refreshing the page to see it.');
  } catch (error) {
    console.error('Error adding test task:', error);
    alert('Error adding test task. See console for details.');
  }
}

// Add a function to clear all tasks
export function clearAllTasks() {
  try {
    localStorage.removeItem('ems_tasks');
    
    // Get current user from session storage
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in session storage');
      return;
    }
    
    const user = JSON.parse(userJson);
    
    // Get existing user data
    let userData = JSON.parse(localStorage.getItem('userData') || '[]');
    
    // Clear tasks for current user
    userData = userData.map(u => {
      if (u._id === user._id) {
        return {
          ...u,
          tasks: [],
          taskCounts: { newTask: 0, active: 0, completed: 0, failed: 0 }
        };
      }
      return u;
    });
    
    // Save back to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('Cleared all tasks for current user');
    
    alert('All tasks cleared. Refresh the page to see changes.');
  } catch (error) {
    console.error('Error clearing tasks:', error);
    alert('Error clearing tasks. See console for details.');
  }
} 