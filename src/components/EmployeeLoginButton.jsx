import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding } from 'react-icons/fa';

const EmployeeLoginButton = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 text-center">
      <div className="text-sm text-gray-500 mb-2">Are you an employee?</div>
      <button
        onClick={() => navigate('/employee/login')}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
      >
        <FaBuilding className="mr-2 h-4 w-4" />
        Employee Login
      </button>
    </div>
  );
};

export default EmployeeLoginButton;
