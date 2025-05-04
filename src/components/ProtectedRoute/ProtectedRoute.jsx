import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Improved ProtectedRoute with loading state handling
const ProtectedRoute = ({ children, path }) => {
    const { isAuthenticated, loading, hasAccess } = useAuth();

    // Show loading indicator while auth state is being determined
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user doesn't have access to this specific route, redirect to unauthorized
    if (!hasAccess(path)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If authenticated and authorized, render the children
    return children;
};

export default ProtectedRoute;