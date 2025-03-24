import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import taskService from '../../services/taskService'

const CreateTask = ({ selectedEmployee, socket }) => {
    const { userData, setUserData } = useContext(AuthContext)

    const [taskTitle, setTaskTitle] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskDate, setTaskDate] = useState('')
    const [asignTo, setAsignTo] = useState('')
    const [category, setCategory] = useState('')
    const [priority, setPriority] = useState('medium')
    const [status, setStatus] = useState('new')
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [debugInfo, setDebugInfo] = useState(null)

    // Update assignTo field when selectedEmployee changes
    useEffect(() => {
        if (selectedEmployee) {
            setAsignTo(selectedEmployee.firstName)
        }
    }, [selectedEmployee])

    const submitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccessMessage('')
        setDebugInfo(null)

        if (!userData || !Array.isArray(userData)) {
            console.error('User data is not available or not in the expected format')
            setLoading(false)
            return
        }

        // Validation
        if (!taskTitle || !taskDescription || !taskDate || !asignTo || !category) {
            alert('Please fill in all required fields')
            setLoading(false)
            return
        }

        // Find target employee
        const targetEmployee = userData.find(user => user.firstName === asignTo);
        if (!targetEmployee) {
            alert(`User "${asignTo}" not found. Please check the name.`)
            setLoading(false)
            return
        }

        // Create a properly structured task object
        const newTaskData = { 
            _id: Date.now().toString(), // This will be replaced by server if API call succeeds
            taskTitle, 
            title: taskTitle, // Add both formats for compatibility
            taskDescription, 
            description: taskDescription, // Add both formats for compatibility
            taskDate,
            dueDate: taskDate, 
            category, 
            priority,
            status,
            assignedTo: targetEmployee._id,
            assignedBy: userData.find(user => user.role === 'admin')?._id,
            createdAt: new Date().toISOString(),
            active: status === 'active' || status === 'in progress',
            newTask: status === 'new', 
            failed: status === 'failed', 
            completed: status === 'completed' 
        }

        try {
            console.log('Creating new task:', newTaskData);
            
            // Use taskService to create task
            const createdTask = await taskService.createTask(newTaskData);
            console.log('Task created via taskService:', createdTask);

            // Update state with new task
            const updatedUserData = [...userData];
            let targetEmployeeIndex = -1;

            updatedUserData.forEach((user, index) => {
                if (user.firstName === asignTo) {
                    targetEmployeeIndex = index;
                    
                    // Ensure tasks array exists
                    if (!user.tasks) user.tasks = [];
                    if (!user.taskCounts) user.taskCounts = { newTask: 0, active: 0, completed: 0, failed: 0 };
                    
                    // Add the task to the employee's tasks if not already there
                    const taskExists = user.tasks.some(task => task._id === createdTask._id);
                    if (!taskExists) {
                        console.log(`Adding task to ${user.firstName}'s tasks array (before: ${user.tasks.length} tasks)`);
                        user.tasks.push(createdTask);
                        console.log(`Task added (after: ${user.tasks.length} tasks)`);
                        
                        // Update appropriate task count based on status
                        if (createdTask.newTask || createdTask.status === 'new') {
                            user.taskCounts.newTask = (user.taskCounts.newTask || 0) + 1;
                        } else if (createdTask.active || createdTask.status === 'active' || createdTask.status === 'in progress') {
                            user.taskCounts.active = (user.taskCounts.active || 0) + 1;
                        } else if (createdTask.completed || createdTask.status === 'completed') {
                            user.taskCounts.completed = (user.taskCounts.completed || 0) + 1;
                        } else if (createdTask.failed || createdTask.status === 'failed') {
                            user.taskCounts.failed = (user.taskCounts.failed || 0) + 1;
                        }
                    }
                }
            });
            
            // Set the updated data
            setUserData(updatedUserData);
            
            // Save debug info about the assigned employee
            setDebugInfo({
                taskAssigned: true,
                targetEmployee: {
                    name: asignTo,
                    id: targetEmployee._id,
                    index: targetEmployeeIndex,
                    tasksCount: updatedUserData[targetEmployeeIndex]?.tasks?.length
                },
                task: createdTask
            });

            // Emit event via socket.io if available
            if (socket && targetEmployee._id) {
                console.log(`Emitting task-assigned event for employee ${targetEmployee._id}`, createdTask);
                
                socket.emit('task-assigned', {
                    task: createdTask,
                    assignedToId: targetEmployee._id
                });
            } else {
                console.warn('Socket not available or target employee ID missing:', { 
                    socketAvailable: !!socket, 
                    targetEmployeeId: targetEmployee._id 
                });
            }
            
            // Display success message
            setSuccessMessage(`Task assigned to ${asignTo} successfully!`);
            console.log('Task created successfully:', createdTask);

            // Reset form after submission
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

            // Reset form
            setTaskTitle('');
            setTaskDescription('');
            setTaskDate('');
            if (!selectedEmployee) {
                setAsignTo('');
            }
            setCategory('');
            setPriority('medium');
            setStatus('new');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='bg-gray-800 rounded-lg p-6 shadow-lg mt-6'>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                {selectedEmployee 
                    ? `Assign Task to ${selectedEmployee.firstName} ${selectedEmployee.lastName}` 
                    : 'Create New Task'}
            </h2>
            
            {successMessage && (
                <div className="bg-green-600 text-white px-4 py-2 rounded-md mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                </div>
            )}
            
            {/* Debug information (only visible in development) */}
            {false && process.env.NODE_ENV === 'development' && debugInfo && (
                <div className="mb-4 p-3 bg-gray-700 rounded-md text-xs text-gray-300 font-mono">
                    <div className="font-bold mb-1">Debug Info:</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}
            
            <form onSubmit={submitHandler} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="space-y-4">
                    <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>Task Title</label>
                        <input
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                            type="text" 
                            placeholder='E.g., UI Design for Dashboard'
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>Due Date</label>
                        <input
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                            type="date"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>Assigned To</label>
                        <input
                            value={asignTo}
                            onChange={(e) => setAsignTo(e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${selectedEmployee ? 'cursor-not-allowed' : ''}`}
                            type="text" 
                            placeholder='Employee name'
                            readOnly={!!selectedEmployee}
                            required
                        />
                        {selectedEmployee && (
                            <p className="text-xs text-blue-400 mt-1">
                                Selected employee: {selectedEmployee.firstName} {selectedEmployee.lastName}
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>Category</label>
                        <input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                            type="text" 
                            placeholder='E.g., Design, Development, Testing'
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className='block text-sm font-medium text-gray-300 mb-1'>Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-300 mb-1'>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                            >
                                <option value="new">New</option>
                                <option value="active">Active</option>
                                <option value="review">In Review</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className='block text-sm font-medium text-gray-300 mb-1'>Description</label>
                        <textarea 
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                            rows="8"
                            placeholder="Enter detailed task description here..."
                            required
                        ></textarea>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition 
                                    ${loading ? 'bg-green-700 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {loading ? 'Creating Task...' : selectedEmployee ? `Assign Task to ${selectedEmployee.firstName}` : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateTask