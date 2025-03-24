import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch employees data
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log('Fetching employees in AuthProvider...');
        
        // First, get the current user information
        const currentUser = authService.getCurrentUser();
        console.log('Current user from localStorage:', currentUser);
        
        // Then fetch all users from the server
        const response = await authService.api.get('/users');
        console.log('Users API response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Format data properly - ensure we have an object with allUsers array
          const formattedData = {
            ...currentUser,
            allUsers: response.data.map(user => ({
              ...user,
              // Ensure tasks and taskCounts are initialized if they don't exist
              tasks: user.tasks || [],
              taskCounts: user.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 }
            }))
          };
          
          console.log('Formatted user data:', {
            currentUserRole: formattedData.role,
            totalUsers: formattedData.allUsers.length,
            employeeCount: formattedData.allUsers.filter(u => u.role === 'employee').length
          });
          
          setUserData(formattedData);
        } else {
          console.error('Invalid user data format received:', response.data);
          // Still set the current user even if API request failed
          setUserData(currentUser || {});
          setError('Failed to fetch employee data');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Initialize with current user in case of error
        setUserData(authService.getCurrentUser() || {});
        setError('Failed to fetch employee data: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    // Check if user is authenticated before fetching
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      fetchEmployees();
    } else {
      setLoading(false);
      setUserData(null);
    }
  }, []);

  // Provide both the data, loading state, error, and the setter function
  return (
    <AuthContext.Provider value={{ userData, setUserData, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;