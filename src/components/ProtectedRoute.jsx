import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const hasRequiredRole = (adminRole, requiredRole) => {
  if (!requiredRole) return true;
  if (requiredRole === 'admin') {
    return adminRole === 'admin' || adminRole === 'superadmin';
  }
  return adminRole === requiredRole;
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { admin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-pink)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole(admin?.role, requiredRole)) {
    const defaultPage = admin?.role === 'superadmin' ? '/db-explorer' : '/dashboard';
    return <Navigate to={defaultPage} replace />;
  }

  return children;
};

export default ProtectedRoute;
