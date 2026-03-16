import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminRoute Component
 * A wrapper for admin-only routes.
 * Checks if 'adminToken' exists in localStorage.
 * If not, redirects to the login page.
 */
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    // Redirect to login if token is missing
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if token is present
  return children;
};

export default AdminRoute;
