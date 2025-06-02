import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useEntidades } from '../../context/EntidadesContext.jsx';
import { useAuth } from '../../context/AuthContext';
import { useReactToPrint } from 'react-to-print';
import DateRangeFilter from '../Dashboard/DateRangeFilter';
import ReservasFilters from './ReservasFilters';
import ReservasTable from './ReservasTable';
import ReservasStats from './ReservasStats';
import ApiService from '../../services/ApiService';
import '../../commonTables.css';
import ExcelExportService from '../../services/ExcelExportService';

const ListadoReservas = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { materias } = useEntidades();

    const [reservas, setReservas] = useState([]);
    const [pagos, setPagos] = useState({});
    const [filteredReservas, setFilteredReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [materiaFilter, setMateriaFilter] = useState('');
    const [modalidadFilter, setModalidadFilter] = useState('');
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60);
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const componentRef = React.useRef();
    const isTutor = user && (user.roles.includes('tutor') || user.roles.includes('alumno&tutor'));
    const isStudent = user && (user.roles.includes('estudiante') || user.roles.includes('alumno') || user.roles.includes('alumno&tutor'));
    const isAdmin = user && (user.roles.includes('admin') || user.roles.includes('superAdmin'));

    useEffect(() => {
        if (isStudent) {
            setActiveTab('estudiante');
        } else if (isTutor) {
            setActiveTab('tutor');
        } else if (isAdmin) {
            setActiveTab('admin');
        }
    }, [isStudent, isTutor, isAdmin]);

    const fetchReservasData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let reservasResponse;

            if (activeTab === 'estudiante') {
                reservasResponse = await ApiService.fetchReservasDetalladasByEstudiante(fechaDesde, fechaHasta);
            } else if (activeTab === 'tutor') {
                reservasResponse = await ApiService.fetchReservasDetalladasByTutor(fechaDesde, fechaHasta);
            } else if (activeTab === 'admin') {
                reservasResponse = await ApiService.getAllReservas(fechaDesde, fechaHasta);
            }
            if (reservasResponse.success) {
                setReservas(reservasResponse.data);
                setFilteredReservas(reservasResponse.data);
                setCurrentPage(1);
                const idsReservas = reservasResponse.data.map(reserva => reserva.id);
                const pagosResponse = await ApiService.fetchPagosByReservas(idsReservas);
                if (pagosResponse.success) {
                    setPagos(pagosResponse.data);
                }
            } else {
                throw new Error(reservasResponse.message || 'Error al obtener las reservas');
            }
        } catch (err) {
            setError(err.message);
            console.error("Error obteniendo datos de reservas:", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, fechaDesde, fechaHasta]);

    useEffect(() => {
        if (activeTab) {
            fetchReservasData();
        }
    }, [activeTab, fetchReservasData]);

    useEffect(() => {
        let result = [...reservas];

        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(reserva => {
                const estudianteNombre = reserva.estudiante ?
                    `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`.toLowerCase() : '';
                const tutorNombre = reserva.tutor ?
                    `${reserva.tutor.nombre} ${reserva.tutor.apellido}`.toLowerCase() : '';
                const materiaNombre = reserva.materia ?
                    reserva.materia.nombre.toLowerCase() : '';

                return estudianteNombre.includes(searchTermLower) ||
                    tutorNombre.includes(searchTermLower) ||
                    materiaNombre.includes(searchTermLower);
            });
        }

        if (estadoFilter) {
            result = result.filter(reserva => reserva.estado === estadoFilter);
        }

        if (materiaFilter) {
            result = result.filter(reserva =>
                reserva.materia && reserva.materia.id.toString() === materiaFilter
            );
        }

        if (modalidadFilter) {
            result = result.filter(reserva =>
                reserva.servicio && reserva.servicio.modalidad === modalidadFilter
            );
        }

        setFilteredReservas(result);
        console.log(filteredReservas);
        setCurrentPage(1);
    }, [searchTerm, estadoFilter, materiaFilter, modalidadFilter, reservas]);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentReservas = filteredReservas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReservas.length / ITEMS_PER_PAGE);


    const handleFilterChange = () => {
        fetchReservasData();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setEstadoFilter('');
        setMateriaFilter('');
        setModalidadFilter('');
        setCurrentPage(1);
    };

    const resetDateRange = () => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60);
        const newFechaDesde = fechaDesde.toISOString().split('T')[0];
        const newFechaHasta = new Date().toISOString().split('T')[0];
        setFechaDesde(newFechaDesde);
        setFechaHasta(newFechaHasta);
        fetchReservasData();
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Reporte_Reservas_${new Date().toISOString().split('T')[0]}`,
    });

    const exportToExcel = () => {
        setSuccess('Exportando a Excel...');
        ExcelExportService.exportReservasToExcel(filteredReservas, activeTab)
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Funciones de utilidad para pagos
    const getEstadoPagosReserva = (reservaId) => {
        const pagosReserva = pagos[reservaId] || [];
        if (pagosReserva.length === 0) return 'Sin pagos';

        const completados = pagosReserva.some(p => p.estado === 'completado');
        if (completados) return 'Pagado';

        return 'Pendiente';
    };

    const getMontoPagadoReserva = (reservaId) => {
        const pagosReserva = pagos[reservaId] || [];
        return pagosReserva
            .filter(p => p.estado === 'completado')
            .reduce((sum, p) => sum + p.monto, 0);
    };

    // Paginación handlers
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
                        <h1 className="fw-bold fs-4 mb-0">Listado de Reservas</h1>
                        <div>
                            <button
                                className="btn btn-sm btn-outline-success rounded-pill me-2"
                                onClick={exportToExcel}
                            >
                                <i className="bi bi-file-excel me-1"></i> Excel
                            </button>
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
                    {/* Tabs para usuario con múltiples roles */}
                    {((isStudent && isTutor) || (isStudent && isAdmin) || (isTutor && isAdmin)) && (
                        <div className="mb-4">
                            <ul className="nav nav-tabs">
                                {isStudent && (
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'estudiante' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('estudiante')}
                                        >
                                            <i className="bi bi-person me-2"></i>
                                            Como Estudiante
                                        </button>
                                    </li>
                                )}
                                {isTutor && (
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'tutor' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('tutor')}
                                        >
                                            <i className="bi bi-mortarboard me-2"></i>
                                            Como Tutor
                                        </button>
                                    </li>
                                )}
                                {isAdmin && (
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('admin')}
                                        >
                                            <i className="bi bi-shield-lock me-2"></i>
                                            Como Administrador
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Mensajes de error/éxito */}
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
                    <ReservasStats reservas={filteredReservas} />

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
                    <ReservasFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        estadoFilter={estadoFilter}
                        setEstadoFilter={setEstadoFilter}
                        materiaFilter={materiaFilter}
                        setMateriaFilter={setMateriaFilter}
                        modalidadFilter={modalidadFilter}
                        setModalidadFilter={setModalidadFilter}
                        materias={materias}
                        activeTab={activeTab}
                        resetFilters={resetFilters}
                    />

                    {/* Tabla de reservas */}
                    <ReservasTable
                        reservas={currentReservas}
                        pagos={pagos}
                        isLoading={isLoading}
                        activeTab={activeTab}
                        getEstadoPagosReserva={getEstadoPagosReserva}
                        getMontoPagadoReserva={getMontoPagadoReserva}
                        resetFilters={resetFilters}
                        componentRef={componentRef}
                    />

                    {/* Paginación */}
                    {filteredReservas.length > ITEMS_PER_PAGE && (
                        <nav aria-label="Paginación de reservas" className="mt-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted small">
                                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReservas.length)} de {filteredReservas.length} reservas
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

                                    {/* Mostrar páginas */}
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Mostrar solo algunas páginas para evitar demasiados botones
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

                    {/* Nota informativa según el rol activo */}
                    <div className="alert alert-info mt-4">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <strong>Información:</strong>
                        {activeTab === 'estudiante'
                            ? 'Este listado muestra las reservas que has realizado como estudiante. Puedes ver los detalles de cada reserva y su estado de pago.'
                            : activeTab === 'tutor'
                                ? 'Este listado muestra las tutorías que tienes asignadas como tutor. Puedes ver los detalles de cada reserva y su estado de pago.'
                                : 'Este listado muestra todas las reservas del sistema. Puedes filtrar, imprimir o exportar esta información para análisis.'}
                    </div>

                    {/* Espacio adicional para evitar que el HomeBar tape contenido */}
                    <div className="home-bar-spacing"></div>
                </div>
            </div>
        </div>
    );
};

export default ListadoReservas;