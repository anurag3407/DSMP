import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import Web3Context from '../../context/Web3Context';

// Single, authoritative ProtectedRoute implementation.
const ProtectedRoute = ({ children }) => {
  // If Web3 context is available and wallet connected, allow access
  const web3 = useContext(Web3Context);
  if (web3 && web3.isConnected) return children;

  // Fallback to classic session stored in localStorage
  const user = localStorage.getItem('user');
  if (user) return children;

  return <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
