import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, allowedRole }) {
  const { loginStatus, role } = useSelector((store) => store.auth);

  if (!loginStatus) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/search" replace />;
  }

  return children;
}

export default ProtectedRoute;
