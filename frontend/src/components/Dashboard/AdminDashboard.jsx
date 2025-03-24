import React, { useContext, useState, useEffect } from 'react'
import Header from '../other/Header'
import AllTask from '../other/AllTask'
import CreateTask from '../other/createTask'
import ActiveEmployees from '../other/ActiveEmployees'
import NotificationsContainer from '../other/Notifications'
import { AuthContext } from '../../context/AuthProvider'
import { motion } from 'framer-motion'

const AdminDashboard = ({ onLogout, socket }) => {
    const auth = useContext(AuthContext);
    const { loading, userData } = auth;
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'employees'
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeTasks: 0,
        completedTasks: 0
    });
    
    useEffect(() => {
        // Calculate stats based on userData
        if (userData) {
            console.log('Calculating admin dashboard stats from userData:', userData);
            
            let employees = [];
            let allTasks = [];
            
            // Extract employees and tasks based on userData structure
            if (userData.allUsers && Array.isArray(userData.allUsers)) {
                // Get employees from allUsers array
                employees = userData.allUsers.filter(user => user.role === 'employee');
                
                // Collect all tasks from all users
                userData.allUsers.forEach(user => {
                    if (user.tasks && Array.isArray(user.tasks)) {
                        allTasks = [...allTasks, ...user.tasks];
                    }
                });
            } else if (Array.isArray(userData)) {
                // If userData is directly an array (old format)
                employees = userData.filter(user => user.role === 'employee');
                
                // Collect tasks from the admin user if available
                const adminUser = userData.find(user => user.role === 'admin');
                if (adminUser && adminUser.tasks) {
                    allTasks = adminUser.tasks;
                }
            }
            
            console.log('Admin stats calculation:', {
                employeesCount: employees.length,
                tasksCount: allTasks.length
            });
            
            setStats({
                totalEmployees: employees.length,
                activeTasks: allTasks.filter(task => task.status !== 'completed').length,
                completedTasks: allTasks.filter(task => task.status === 'completed').length
            });
        }
    }, [userData]);
    
    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
        // Switch to tasks tab after selecting an employee
        setActiveTab('tasks');
    };

    if (loading) {
        return (
            <div className='min-h-screen w-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center'>
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-white text-xl font-semibold"
                    >
                        Loading dashboard data...
                    </motion.p>
                    <p className="text-gray-400 text-sm">Retrieving employee and task information</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen w-full bg-gradient-to-r from-gray-900 to-gray-800 pb-10'>
            {/* Header with navbar */}
            <div className="bg-gray-800 bg-opacity-90 shadow-lg backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <Header onLogout={onLogout} />
                    
                    {/* Stats cards */}
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                    >
                        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 border border-blue-800/50 rounded-lg p-4 backdrop-blur-sm shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-600/20 mr-4">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-blue-300 text-sm font-medium">Total Employees</p>
                                    <p className="text-white text-2xl font-bold">{stats.totalEmployees}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/30 border border-purple-800/50 rounded-lg p-4 backdrop-blur-sm shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-600/20 mr-4">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-purple-300 text-sm font-medium">Active Tasks</p>
                                    <p className="text-white text-2xl font-bold">{stats.activeTasks}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-900/40 to-green-800/30 border border-green-800/50 rounded-lg p-4 backdrop-blur-sm shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-600/20 mr-4">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-green-300 text-sm font-medium">Completed Tasks</p>
                                    <p className="text-white text-2xl font-bold">{stats.completedTasks}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Tabs */}
                    <div className="flex space-x-4 mt-6 border-b border-gray-700">
                        <motion.button 
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            onClick={() => setActiveTab('tasks')}
                            className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center ${
                                activeTab === 'tasks' 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Task Management
                        </motion.button>
                        <motion.button 
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            onClick={() => setActiveTab('employees')}
                            className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center ${
                                activeTab === 'employees' 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Employee Management
                        </motion.button>
                    </div>
                </div>
            </div>
            
            {/* Main content */}
            <div className="container mx-auto px-6 py-8">
                {selectedEmployee && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-800/50 px-6 py-4 rounded-lg mb-6 flex justify-between items-center shadow-lg backdrop-blur-sm"
                    >
                        <div>
                            <h3 className="font-medium text-blue-300 text-sm">Selected Employee</h3>
                            <p className="text-white text-lg">
                                {selectedEmployee.firstName} {selectedEmployee.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{selectedEmployee.email}</p>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedEmployee(null)}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-all duration-200 flex items-center space-x-1 shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Clear Selection</span>
                        </motion.button>
                    </motion.div>
                )}
                
                {activeTab === 'tasks' ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CreateTask selectedEmployee={selectedEmployee} socket={socket} />
                        <AllTask />
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <ActiveEmployees onSelectEmployee={handleSelectEmployee} socket={socket} />
                    </motion.div>
                )}
            </div>
            
            {/* Notifications */}
            <NotificationsContainer socket={socket} userId={userData?._id} />
        </div>
    )
}

export default AdminDashboard

