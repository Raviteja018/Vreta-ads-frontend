import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/admin/login')}
      className="text-sm font-medium text-purple-600 hover:text-purple-700"
    >
      Admin Login
    </button>
  );
};

export default AdminLoginButton;
