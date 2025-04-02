import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para rutas protegidas que verifica autenticación y permisos.
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si hay acceso
 * @param {string} props.path - Ruta actual que se está intentando acceder
 * @returns {React.ReactNode} - El componente correspondiente según la verificación
 */
const ProtectedRoute = ({ children, path }) => {
    const { isAuthenticated, loading, hasAccess } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && isAuthenticated && !hasAccess(path)) {
            window.location.replace('/unauthorized');
        }
    }, [loading, isAuthenticated, hasAccess, path]);

    // Si está cargando, mostrar un indicador de carga
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Verificar si el usuario tiene acceso a esta ruta específica
    if (!hasAccess(path)) {
        // Mientras se procesa la redirección, mostrar un indicador de carga
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Redirigiendo...</span>
                </div>
            </div>
        );
    }

    // Si todo está bien, renderizar los hijos (el contenido protegido)
    return children;
};

export default ProtectedRoute;