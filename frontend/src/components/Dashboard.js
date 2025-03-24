import React, { useState, useEffect } from 'react';
import AuthService from '../services/authService';
import TaskService from '../services/taskService';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await TaskService.getTasks();
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>{task.taskTitle}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
