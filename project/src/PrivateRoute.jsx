
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  
  const isAuthorized = allowedRoles ? allowedRoles.includes(userRole) : true;

  return token && isAuthorized ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
