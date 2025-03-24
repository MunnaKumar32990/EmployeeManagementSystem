import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { motion } from 'framer-motion';

const ActiveEmployees = ({ onSelectEmployee, socket }) => {
  const { userData, loading: contextLoading, error: contextError } = useContext(AuthContext);
  const [activeUserIds, setActiveUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('ActiveEmployees render with userData:', userData);

  // Extract and set employees when userData changes
  useEffect(() => {
    setLoading(true);
    
    try {
      if (contextError) {
        setError(contextError);
        return;
      }
      
      // Extract employees from userData
      let employeesList = [];
      
      if (userData) {
        console.log('Processing userData in ActiveEmployees:', userData);
        
        // Case 1: userData has allUsers property (preferred structure)
        if (userData.allUsers && Array.isArray(userData.allUsers)) {
          employeesList = userData.allUsers.filter(user => user.role === 'employee');
          console.log('Found employees from userData.allUsers:', employeesList.length);
        }
        // Case 2: userData is directly an array of users
        else if (Array.isArray(userData)) {
          employeesList = userData.filter(user => user.role === 'employee');
          console.log('Found employees from userData array:', employeesList.length);
        }
        // Case 3: We may need to make an API call directly
        else {
          console.log('userData does not contain expected employee data structure:', userData);
        }
      }
      
      console.log('Setting allEmployees with:', employeesList.length, 'employees');
      // Map through and ensure each employee has the expected properties
      setAllEmployees(employeesList.map(emp => ({
        ...emp,
        // Ensure essential properties exist
        tasks: emp.tasks || [],
        taskCounts: emp.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 }
      })));
    } catch (err) {
      console.error('Error processing employee data:', err);
      setError('Failed to load employee data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userData, contextError]);

  useEffect(() => {
    // Handle socket connection and active users
    if (socket) {
      // Socket connection status
      socket.on('connect', () => {
        console.log('Socket connected in ActiveEmployees');
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected in ActiveEmployees');
      });

      // Listen for users status updates
      socket.on('users-updated', (data) => {
        console.log('User status updated:', data);
        
        if (data.status === 'online') {
          setActiveUserIds(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        } else {
          setActiveUserIds(prev => prev.filter(id => id !== data.userId));
        }
      });

      // Receive list of active users
      socket.on('active-users-list', (userIds) => {
        console.log('Received active users list:', userIds);
        setActiveUserIds(userIds || []);
      });

      // Request current active users
      socket.emit('get-active-users');
    }
    
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('users-updated');
        socket.off('active-users-list');
      }
    };
  }, [socket]);
  
  const handleSelectEmployee = (employee) => {
    console.log('Selected employee:', employee);
    setSelectedEmployee(employee);
    if (onSelectEmployee) {
      onSelectEmployee(employee);
    }
  };
  
  // Filter based on search
  const filteredEmployees = allEmployees.filter(emp => 
    (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log('All employees:', allEmployees.length, 'Filtered:', filteredEmployees.length);

  // Show loading indicator if context is still loading
  if (contextLoading || loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mt-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Employee Management
          </span>
        </h2>
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-white">Loading employees...</span>
        </div>
      </div>
    );
  }
  
  if (contextError || error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mt-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Employee Management
          </span>
        </h2>
        <div className="bg-red-800/30 border border-red-700 text-white rounded-lg p-4">
          <p>{contextError || error}</p>
          <div className="mt-2 flex space-x-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Employee Management
        </span>
      </h2>
      
      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search employees by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
      </div>
      
      {/* Summary information */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-400 text-sm">
          <span className="font-medium text-blue-400">{filteredEmployees.length}</span> 
          {filteredEmployees.length === 1 ? ' employee' : ' employees'} 
          {searchTerm ? ` found for "${searchTerm}"` : ' in system'}
        </p>
        
        <span className="text-sm text-gray-400">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> {activeUserIds.length} online
        </span>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee, index) => {
            const isActive = activeUserIds.includes(employee._id);
            const taskCount = (employee.tasks && employee.tasks.length) || 0;
            
            return (
              <motion.div 
                key={employee._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedEmployee && selectedEmployee._id === employee._id 
                    ? 'bg-blue-700 shadow-lg transform -translate-y-1' 
                    : 'bg-gray-700 hover:bg-gray-600 hover:shadow-md hover:-translate-y-1'}
                  ${isActive ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-500'}
                `}
                onClick={() => handleSelectEmployee(employee)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-lg">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'}`}>
                    <span className={`h-2 w-2 rounded-full mr-2 ${isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                    {isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  {employee.email || 'No email available'}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    {taskCount} Tasks
                  </span>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEmployee(employee);
                    }}
                  >
                    Assign Task
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center bg-gray-700 rounded-lg">
            {searchTerm ? (
              <>
                <svg className="w-12 h-12 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p className="text-gray-300">No employees found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                <p className="text-gray-300 mb-1">No employees registered in the system</p>
                <p className="text-gray-500 text-sm">Add employees to start assigning tasks</p>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActiveEmployees; 