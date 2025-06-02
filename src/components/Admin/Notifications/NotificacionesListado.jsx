// NotificacionesListado.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext';
import DateRangeFilter from '../../Dashboard/DateRangeFilter';
import NotificacionesFilters from './NotificacionesFilters.jsx';
import NotificacionesTable from './NotificacionesTable';
import NotificacionesStats from './NotificacionesStats';
import '../../../commonTables.css';
import ApiService from "../../../services/ApiService.js";

const NotificacionesListado = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notificaciones, setNotificaciones] = useState([]);
    const [filteredNotificaciones, setFilteredNotificaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Determinar si es admin
    const isAdmin = user && (user.roles.includes('admin') || user.roles.includes('superAdmin'));

    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [usuarioFilter, setUsuarioFilter] = useState('');
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 30);
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchNotificaciones = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let response;

            if (isAdmin) {
                response = await ApiService.getAllNotificaciones(fechaDesde, fechaHasta);
            } else {
                response = await ApiService.getNotificacionesByUser();
            }

            if (response.success) {
                setNotificaciones(response.data);
                setFilteredNotificaciones(response.data);
                setCurrentPage(1);
            } else {
                throw new Error(response.message || 'Error al obtener las notificaciones');
            }
        } catch (err) {
            setError(err.message);
            console.error("Error obteniendo notificaciones:", err);
        } finally {
            setIsLoading(false);
        }
    }, [fechaDesde, fechaHasta, isAdmin]);

    useEffect(() => {
        fetchNotificaciones();
    }, [fetchNotificaciones]);

    useEffect(() => {
        let result = [...notificaciones];
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(notificacion => {
                const titulo = notificacion.titulo?.toLowerCase() || '';
                const mensaje = notificacion.mensaje?.toLowerCase() || '';
                const usuarioNombre = notificacion.usuario ?
                    `${notificacion.usuario.nombre} ${notificacion.usuario.apellido}`.toLowerCase() : '';
                const usuarioEmail = notificacion.usuario?.email?.toLowerCase() || '';

                return titulo.includes(searchTermLower) ||
                    mensaje.includes(searchTermLower) ||
                    usuarioNombre.includes(searchTermLower) ||
                    usuarioEmail.includes(searchTermLower);
            });
        }
        if (tipoFilter) {
            result = result.filter(notificacion => notificacion.tipo === tipoFilter);
        }

        if (estadoFilter) {
            if (estadoFilter === 'leida') {
                result = result.filter(notificacion => notificacion.leida === true);
            } else if (estadoFilter === 'no_leida') {
                result = result.filter(notificacion => notificacion.leida === false);
            }
        }

        setFilteredNotificaciones(result);
        setCurrentPage(1);
    }, [searchTerm, tipoFilter, estadoFilter, notificaciones]);


    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentNotificaciones = filteredNotificaciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNotificaciones.length / ITEMS_PER_PAGE);

    const handleFilterChange = () => {
        fetchNotificaciones();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setTipoFilter('');
        setEstadoFilter('');
        setUsuarioFilter('');
        setCurrentPage(1);
    };

    const resetDateRange = () => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 30);
        const newFechaDesde = fechaDesde.toISOString().split('T')[0];
        const newFechaHasta = new Date().toISOString().split('T')[0];
        setFechaDesde(newFechaDesde);
        setFechaHasta(newFechaHasta);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleMarkAsRead = async (notificacionId) => {
        try {
            const response = await ApiService.markNotificacionAsRead(notificacionId);
            if (response.success) {
                setSuccess("Notificación marcada como leída");
                fetchNotificaciones();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await ApiService.markAllNotificacionesAsRead();
            if (response.success) {
                setSuccess(`Se marcaron ${response.data.count} notificaciones como leídas`);
                fetchNotificaciones();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    };

    const handleDeleteNotificacion = async (notificacionId) => {
        try {
            const response = await ApiService.deleteNotificacion(notificacionId);
            if (response.success) {
                setSuccess("Notificación eliminada correctamente");
                fetchNotificaciones();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    };

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">
                            {isAdmin ? 'Gestión de Notificaciones' : 'Mis Notificaciones'}
                        </h1>
                        <div>
                            {!isAdmin && (
                                <button
                                    className="btn btn-sm btn-outline-primary rounded-pill me-2"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <i className="bi bi-check-all me-1"></i> Marcar todas como leídas
                                </button>
                            )}
                            <button
                                className="btn btn-sm btn-outline-secondary rounded-pill"
                                onClick={handleBack}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Volver
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {/* Mensajes */}
                    {error && (
                        <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success shadow-sm rounded-3" role="alert">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            {success}
                        </div>
                    )}

                    {/* Estadísticas */}
                    <NotificacionesStats notificaciones={filteredNotificaciones} />

                    {/* Filtros de fecha (solo para admins) */}
                    {isAdmin && (
                        <DateRangeFilter
                            fechaDesde={fechaDesde}
                            setFechaDesde={setFechaDesde}
                            fechaHasta={fechaHasta}
                            setFechaHasta={setFechaHasta}
                            onFilter={handleFilterChange}
                            resetDateRange={resetDateRange}
                        />
                    )}

                    {/* Filtros adicionales */}
                    <NotificacionesFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        tipoFilter={tipoFilter}
                        setTipoFilter={setTipoFilter}
                        estadoFilter={estadoFilter}
                        setEstadoFilter={setEstadoFilter}
                        isAdmin={isAdmin}
                        resetFilters={resetFilters}
                    />

                    {/* Tabla */}
                    <NotificacionesTable
                        notificaciones={currentNotificaciones}
                        isLoading={isLoading}
                        isAdmin={isAdmin}
                        resetFilters={resetFilters}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotificacion}
                    />

                    {/* Paginación */}
                    {filteredNotificaciones.length > ITEMS_PER_PAGE && (
                        <nav aria-label="Paginación de notificaciones" className="mt-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted small">
                                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredNotificaciones.length)} de {filteredNotificaciones.length} notificaciones
                                </div>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pageNumber)}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                </li>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return (
                                                <li key={pageNumber} className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    )}

                    {/* Información */}
                    <div className="alert alert-info mt-4">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <strong>Información:</strong>
                        {isAdmin
                            ? 'Este listado muestra todas las notificaciones del sistema. Puedes filtrar por tipo, estado y usuario.'
                            : 'Este listado muestra todas tus notificaciones. Las notificaciones no leídas aparecen resaltadas.'
                        }
                    </div>

                    <div className="home-bar-spacing"></div>
                </div>
            </div>
        </div>
    );
};

export default NotificacionesListado;