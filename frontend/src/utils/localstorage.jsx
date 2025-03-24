/**
 * This file is deprecated and included only for backward compatibility.
 * New code should use authService instead of direct localStorage access.
 */

// Get data from localStorage
export const getLocalStorage = () => {
  try {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
    
    return {
      employees,
      loggedInUser
    };
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return {
      employees: [],
      loggedInUser: null
    };
  }
};

// Set data to localStorage
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error setting localStorage:', error);
    return false;
  }
}; 