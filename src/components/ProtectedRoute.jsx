import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to appropriate login page
  if (!currentUser) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a role is required and user doesn't have it, redirect to home
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // If user is not approved (and not an admin), redirect to pending approval page
  if (!currentUser.isApproved && currentUser.role !== 'admin') {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
};

export default ProtectedRoute;
