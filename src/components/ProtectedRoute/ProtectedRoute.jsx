import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../context/AuthContext';

const ProtectedRoute = ({ children, path }) => {
    const { isAuthenticated, hasAccess, loading } = useAuth();

    // Mostrar indicador de carga mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado pero no tiene acceso a la ruta, mostrar unauthorized
    if (path && !hasAccess(path)) {
        console.log(`Usuario no tiene acceso a la ruta: ${path}`);
        return <Navigate to="/unauthorized" replace />;
    }

    // Si está autenticado y tiene acceso, mostrar el componente hijo
    return children;
};

export default ProtectedRoute;