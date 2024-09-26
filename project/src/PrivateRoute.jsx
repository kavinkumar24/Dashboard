import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const location = useLocation();


  const isAuthorized = allowedRoles ? allowedRoles.includes(userRole) : true;

  if (token && location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  if (!token && location.pathname === '/login') {
    return children; 
  }

  return token && isAuthorized ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
