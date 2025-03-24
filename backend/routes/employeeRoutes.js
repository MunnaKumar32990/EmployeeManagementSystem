const express = require('express');
const { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');
const { auth, adminOnly } = require('../middleware/auth');
const { validateEmployeeData } = require('../middleware/validation');

const router = express.Router();

// Get all employees
router.get('/', auth, getEmployees);

// Get employee by ID
router.get('/:id', auth, getEmployeeById);

// Create new employee (admin only)
router.post('/', auth, adminOnly, validateEmployeeData, createEmployee);

// Update employee (admin only)
router.put('/:id', auth, adminOnly, validateEmployeeData, updateEmployee);

// Delete employee (admin only)
router.delete('/:id', auth, adminOnly, deleteEmployee);

module.exports = router; 