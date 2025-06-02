// CalificacionesListado.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useEntidades } from '../../../context/EntidadesContext.jsx';
import { useAuth } from '../../../context/AuthContext';
import DateRangeFilter from '../../Dashboard/DateRangeFilter';
import CalificacionesFilters from './CalificacionesFilters.jsx';
import CalificacionesTable from './CalificacionesTable';
import CalificacionesStats from './CalificacionesStats';
import ApiService from '../../../services/ApiService';
import '../../../commonTables.css';

const CalificacionesListado = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { materias, carreras } = useEntidades();

    const [calificaciones, setCalificaciones] = useState([]);
    const [filteredCalificaciones, setFilteredCalificaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [carreraFilter, setCarreraFilter] = useState('');
    const [materiaFilter, setMateriaFilter] = useState('');
    const [puntuacionFilter, setPuntuacionFilter] = useState('');
    const [usuarioFilter, setUsuarioFilter] = useState('');

    // Fechas (últimos 60 días por defecto)
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60);
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const fetchCalificaciones = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (fechaDesde) params.append('fecha_desde', fechaDesde);
            if (fechaHasta) params.append('fecha_hasta', fechaHasta);
            if (usuarioFilter) params.append('usuario_id', usuarioFilter);

            const response = await ApiService.getCalificacionesByDateRange(fechaDesde, fechaHasta, usuarioFilter);

            if (response.success) {
                setCalificaciones(response.data);
                setFilteredCalificaciones(response.data);
                setCurrentPage(1);
            } else {
                throw new Error(response.message || 'Error al obtener las calificaciones');
            }
        } catch (err) {
            setError(err.message);
            console.error("Error obteniendo calificaciones:", err);
        } finally {
            setIsLoading(false);
        }
    }, [fechaDesde, fechaHasta, usuarioFilter]);

    useEffect(() => {
        fetchCalificaciones();
    }, [fetchCalificaciones]);


    useEffect(() => {
        let result = [...calificaciones];

        // Filtro de búsqueda por texto
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(calificacion => {
                const estudianteNombre = calificacion.calificador ?
                    `${calificacion.calificador.nombre} ${calificacion.calificador.apellido}`.toLowerCase() : '';
                const tutorNombre = calificacion.calificado ?
                    `${calificacion.calificado.nombre} ${calificacion.calificado.apellido}`.toLowerCase() : '';
                const materiaNombre = calificacion.reserva?.materia?.nombre?.toLowerCase() || '';
                const comentario = calificacion.comentario?.toLowerCase() || '';

                return estudianteNombre.includes(searchTermLower) ||
                    tutorNombre.includes(searchTermLower) ||
                    materiaNombre.includes(searchTermLower) ||
                    comentario.includes(searchTermLower);
            });
        }

        // Filtro por carrera
        if (carreraFilter) {
            result = result.filter(calificacion =>
                calificacion.reserva?.materia?.carrera_id?.toString() === carreraFilter
            );
        }

        // Filtro por materia
        if (materiaFilter) {
            result = result.filter(calificacion =>
                calificacion.reserva?.materia?.id?.toString() === materiaFilter
            );
        }

        // Filtro por puntuación
        if (puntuacionFilter) {
            result = result.filter(calificacion =>
                calificacion.puntuacion.toString() === puntuacionFilter
            );
        }

        setFilteredCalificaciones(result);
        setCurrentPage(1);
    }, [searchTerm, carreraFilter, materiaFilter, puntuacionFilter, calificaciones]);

    // Paginación
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentCalificaciones = filteredCalificaciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCalificaciones.length / ITEMS_PER_PAGE);

    const handleFilterChange = () => {
        fetchCalificaciones();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCarreraFilter('');
        setMateriaFilter('');
        setPuntuacionFilter('');
        setUsuarioFilter('');
        setCurrentPage(1);
    };

    const resetDateRange = () => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60);
        const newFechaDesde = fechaDesde.toISOString().split('T')[0];
        const newFechaHasta = new Date().toISOString().split('T')[0];
        setFechaDesde(newFechaDesde);
        setFechaHasta(newFechaHasta);
        fetchCalificaciones();
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

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Gestión de Calificaciones</h1>
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={handleBack}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver
                        </button>
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
                    <CalificacionesStats calificaciones={filteredCalificaciones} />

                    {/* Filtros de fecha */}
                    <DateRangeFilter
                        fechaDesde={fechaDesde}
                        setFechaDesde={setFechaDesde}
                        fechaHasta={fechaHasta}
                        setFechaHasta={setFechaHasta}
                        onFilter={handleFilterChange}
                        resetDateRange={resetDateRange}
                    />

                    {/* Filtros adicionales */}
                    <CalificacionesFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        carreraFilter={carreraFilter}
                        setCarreraFilter={setCarreraFilter}
                        materiaFilter={materiaFilter}
                        setMateriaFilter={setMateriaFilter}
                        puntuacionFilter={puntuacionFilter}
                        setPuntuacionFilter={setPuntuacionFilter}
                        usuarioFilter={usuarioFilter}
                        setUsuarioFilter={setUsuarioFilter}
                        carreras={carreras}
                        materias={materias}
                        resetFilters={resetFilters}
                    />

                    {/* Tabla */}
                    <CalificacionesTable
                        calificaciones={currentCalificaciones}
                        isLoading={isLoading}
                        resetFilters={resetFilters}
                    />

                    {/* Paginación */}
                    {filteredCalificaciones.length > ITEMS_PER_PAGE && (
                        <nav aria-label="Paginación de calificaciones" className="mt-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted small">
                                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCalificaciones.length)} de {filteredCalificaciones.length} calificaciones
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
                        <strong>Información:</strong> Este listado muestra todas las calificaciones realizadas en el sistema. Solo se muestran calificaciones de reservas completadas.
                    </div>

                    <div className="home-bar-spacing"></div>
                </div>
            </div>
        </div>
    );
};

export default CalificacionesListado;