// Validate employee data
const validateEmployeeData = (req, res, next) => {
  const { firstName, lastName, email, position, department, salary } = req.body;
  
  if (!firstName || !lastName || !email || !position || !department || !salary) {
    return res.status(400).json({ 
      message: 'All required fields must be provided (firstName, lastName, email, position, department, salary)' 
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  // Validate salary is a number
  if (isNaN(Number(salary))) {
    return res.status(400).json({ message: 'Salary must be a number' });
  }
  
  next();
};

module.exports = { validateEmployeeData }; 