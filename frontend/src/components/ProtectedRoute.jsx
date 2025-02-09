import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ role, children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // User is not authenticated
        return <Navigate to="/signin" />;
    }

    if (role && user.role !== role) {
        // User does not have the required role
        return <Navigate to="/" />;
    }

    // User is authenticated and has the required role
    return children;
};

export default ProtectedRoute;