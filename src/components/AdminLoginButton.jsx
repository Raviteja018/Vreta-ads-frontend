import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const AdminLoginButton = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 text-center">
      <div className="text-sm text-gray-500 mb-2">Are you an administrator?</div>
      <button
        onClick={() => navigate('/admin/login')}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200"
      >
        <FaShieldAlt className="mr-2 h-4 w-4" />
        Admin Login
      </button>
    </div>
  );
};

export default AdminLoginButton;
