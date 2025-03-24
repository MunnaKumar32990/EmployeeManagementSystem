import React from 'react';
import authService from '../../services/authService';

const Header = ({ onLogout, data }) => {
  const user = data || authService.getCurrentUser();
  const username = user?.name || user?.firstName || 'User';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout if onLogout prop is not provided
      authService.logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className='flex items-end justify-between'>
      <h1 className='text-2xl font-medium text-white'>Hello <br /> <span className='text-3xl font-semibold'>{username} 👋</span></h1>
      <button 
        onClick={handleLogout} 
        className='bg-red-600 hover:bg-red-700 text-base font-medium text-white px-5 py-2 rounded-sm transition duration-200'
      >
        Log Out
      </button>
    </div>
  );
};

export default Header;
