import React from 'react'
import { motion } from 'framer-motion'

const TaskListNumbers = ({data}) => {
  // Safely access task counts with fallbacks
  const taskCounts = data?.taskCounts || {};
  const newTasks = taskCounts.newTask || 0;
  const completedTasks = taskCounts.completed || 0;
  const activeTasks = taskCounts.active || 0;
  const failedTasks = taskCounts.failed || 0;
  
  // Calculate total tasks and completion percentage
  const totalTasks = newTasks + completedTasks + activeTasks + failedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-sm font-medium">Overall Progress</h3>
          <span className="text-blue-400 text-sm font-medium">{completionPercentage}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
          />
        </div>
      </div>
      
      {/* Task count cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className='rounded-lg shadow-lg bg-gradient-to-br from-blue-600/40 to-blue-700/40 border border-blue-500/30 backdrop-blur-sm'
        >
          <div className='p-5'>
            <div className='flex justify-between items-center'>
              <div>
                <motion.h2 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className='text-3xl font-bold text-white'
                >
                  {newTasks}
                </motion.h2>
                <h3 className='text-blue-300 mt-1 font-medium text-sm uppercase tracking-wide'>New Tasks</h3>
              </div>
              <div className='rounded-full bg-blue-500/20 p-3 border border-blue-500/30'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-blue-900/30 rounded-full h-1.5">
                <div 
                  className="bg-blue-400 h-1.5 rounded-full"
                  style={{ width: totalTasks ? `${(newTasks / totalTasks) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className='rounded-lg shadow-lg bg-gradient-to-br from-green-600/40 to-green-700/40 border border-green-500/30 backdrop-blur-sm'
        >
          <div className='p-5'>
            <div className='flex justify-between items-center'>
              <div>
                <motion.h2 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className='text-3xl font-bold text-white'
                >
                  {completedTasks}
                </motion.h2>
                <h3 className='text-green-300 mt-1 font-medium text-sm uppercase tracking-wide'>Completed</h3>
              </div>
              <div className='rounded-full bg-green-500/20 p-3 border border-green-500/30'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-green-900/30 rounded-full h-1.5">
                <div 
                  className="bg-green-400 h-1.5 rounded-full"
                  style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className='rounded-lg shadow-lg bg-gradient-to-br from-yellow-600/40 to-yellow-700/40 border border-yellow-500/30 backdrop-blur-sm'
        >
          <div className='p-5'>
            <div className='flex justify-between items-center'>
              <div>
                <motion.h2 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className='text-3xl font-bold text-white'
                >
                  {activeTasks}
                </motion.h2>
                <h3 className='text-yellow-300 mt-1 font-medium text-sm uppercase tracking-wide'>In Progress</h3>
              </div>
              <div className='rounded-full bg-yellow-500/20 p-3 border border-yellow-500/30'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-yellow-900/30 rounded-full h-1.5">
                <div 
                  className="bg-yellow-400 h-1.5 rounded-full"
                  style={{ width: totalTasks ? `${(activeTasks / totalTasks) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className='rounded-lg shadow-lg bg-gradient-to-br from-red-600/40 to-red-700/40 border border-red-500/30 backdrop-blur-sm'
        >
          <div className='p-5'>
            <div className='flex justify-between items-center'>
              <div>
                <motion.h2 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className='text-3xl font-bold text-white'
                >
                  {failedTasks}
                </motion.h2>
                <h3 className='text-red-300 mt-1 font-medium text-sm uppercase tracking-wide'>Failed</h3>
              </div>
              <div className='rounded-full bg-red-500/20 p-3 border border-red-500/30'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-red-900/30 rounded-full h-1.5">
                <div 
                  className="bg-red-400 h-1.5 rounded-full"
                  style={{ width: totalTasks ? `${(failedTasks / totalTasks) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TaskListNumbers