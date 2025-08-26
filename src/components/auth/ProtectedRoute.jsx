import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, user, hasPermission } = useAuthStore();
  const location = useLocation();

  // Show loading if authentication status is being determined
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this feature.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;