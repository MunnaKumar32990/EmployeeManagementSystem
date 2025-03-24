import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import authService from './services/authService';
import { io } from 'socket.io-client';
import AuthProvider from './context/AuthProvider';

// Protected route component
const ProtectedRoute = ({ element, allowedRole }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }
  
  return element;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Check for user in session storage
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    // Initialize Socket.io connection
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';
      
    const newSocket = io(serverUrl, {
      auth: {
        token: sessionStorage.getItem('token'),
        userId: currentUser?._id
      }
    });
    
    // Set up Socket.io event listeners
    newSocket.on('connect', () => {
      console.log('Connected to Socket.io server');
      
      // Identify user to server on connect
      if (currentUser) {
        newSocket.emit('user-connected', currentUser._id);
      }
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Store socket in state
    setSocket(newSocket);
    
    // Clean up socket connection on unmount
    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleLogout = () => {
    // Disconnect socket before logout
    if (socket && socket.connected) {
      socket.disconnect();
    }
    
    authService.logout();
    setUser(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          
          {/* Protected routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute 
                allowedRole="admin" 
                element={<AdminDashboard onLogout={handleLogout} socket={socket} />} 
              />
            } 
          />
          
          <Route 
            path="/employee" 
            element={
              <ProtectedRoute 
                allowedRole="employee" 
                element={<EmployeeDashboard onLogout={handleLogout} socket={socket} />} 
              />
            } 
          />
          
          {/* Default route - redirect based on role */}
          <Route 
            path="/" 
            element={
              !user ? <Navigate to="/login" /> :
              user.role === 'admin' ? <Navigate to="/admin" /> :
              <Navigate to="/employee" />
            } 
          />
          
          {/* Catch-all route for undefined routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;