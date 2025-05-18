import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useEntidades } from '../../context/EntidadesContext.jsx';
import { useAuth } from '../../context/AuthContext';
import { useReactToPrint } from 'react-to-print';
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx';
import DateRangeFilter from '../Dashboard/DateRangeFilter';
import ApiService from '../../services/ApiService';
import '../../commonTables.css';
// Solo usamos los estilos existentes y Bootstrap

const ListadoReservas = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        carreras,
        materias,
        roles,
    } = useEntidades();

    // Estados
    const [reservas, setReservas] = useState([]);
    const [pagos, setPagos] = useState({});
    const [filteredReservas, setFilteredReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [materiaFilter, setMateriaFilter] = useState('');
    const [modalidadFilter, setModalidadFilter] = useState('');
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60); // Últimos 60 días
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Referencia para la impresión
    const componentRef = React.useRef();

    // Determinar roles del usuario
    const isTutor = user && (user.roles.includes('tutor') || user.roles.includes('alumno&tutor'));
    const isStudent = user && (user.roles.includes('estudiante') || user.roles.includes('alumno') || user.roles.includes('alumno&tutor'));
    const isAdmin = user && (user.roles.includes('admin') || user.roles.includes('superAdmin'));

    // Establecer la pestaña activa basada en el rol del usuario
    useEffect(() => {
        if (isStudent) {
            setActiveTab('estudiante');
        } else if (isTutor) {
            setActiveTab('tutor');
        } else if (isAdmin) {
            setActiveTab('admin');
        }
    }, [isStudent, isTutor, isAdmin]);

    // Obtener datos de reservas según el rol
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

                // Obtener pagos asociados a las reservas
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

        // Filtro por estado
        if (estadoFilter) {
            result = result.filter(reserva => reserva.estado === estadoFilter);
        }

        // Filtro por materia
        if (materiaFilter) {
            result = result.filter(reserva =>
                reserva.materia && reserva.materia.id.toString() === materiaFilter
            );
        }

        // Filtro por modalidad
        if (modalidadFilter) {
            result = result.filter(reserva =>
                reserva.servicio && reserva.servicio.modalidad === modalidadFilter
            );
        }

        setFilteredReservas(result);
    }, [searchTerm, estadoFilter, materiaFilter, modalidadFilter, reservas]);

    // Manejar cambio en los filtros
    const handleFilterChange = () => {
        fetchReservasData();
    };

    // Resetear filtros
    const resetFilters = () => {
        setSearchTerm('');
        setEstadoFilter('');
        setMateriaFilter('');
        setModalidadFilter('');
    };

    // Resetear rango de fechas
    const resetDateRange = () => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60);
        const newFechaDesde = fechaDesde.toISOString().split('T')[0];
        const newFechaHasta = new Date().toISOString().split('T')[0];
        setFechaDesde(newFechaDesde);
        setFechaHasta(newFechaHasta);
        fetchReservasData();
    };

    // Expandir/contraer fila para mostrar detalles de pago
    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Manejar la impresión
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Reporte_Reservas_${new Date().toISOString().split('T')[0]}`,
        onBeforePrint: () => {
            // Expandir todas las filas para la impresión
            const allExpanded = {};
            reservas.forEach(reserva => {
                allExpanded[reserva.id] = true;
            });
            setExpandedRows(allExpanded);
        },
        onAfterPrint: () => {
            // Restaurar el estado anterior después de imprimir
            setExpandedRows({});
        }
    });

    // Obtener estadísticas básicas de reservas
    const getEstadisticasReservas = () => {
        const total = filteredReservas.length;
        const completadas = filteredReservas.filter(r => r.estado === 'completada').length;
        const pendientes = filteredReservas.filter(r => r.estado === 'pendiente').length;
        const canceladas = filteredReservas.filter(r => r.estado === 'cancelada').length;

        // Calcular porcentajes
        const pctCompletadas = total > 0 ? Math.round((completadas / total) * 100) : 0;
        const pctPendientes = total > 0 ? Math.round((pendientes / total) * 100) : 0;
        const pctCanceladas = total > 0 ? Math.round((canceladas / total) * 100) : 0;

        return {
            total,
            completadas,
            pendientes,
            canceladas,
            pctCompletadas,
            pctPendientes,
            pctCanceladas
        };
    };

    // Obtener estadísticas de pagos
    const getEstadisticasPagos = () => {
        let totalPagos = 0;
        let completados = 0;
        let pendientes = 0;

        Object.values(pagos).flat().forEach(pago => {
            if (pago.estado === 'completado') {
                completados += pago.monto;
                totalPagos += pago.monto;
            } else if (pago.estado === 'pendiente') {
                pendientes += pago.monto;
                totalPagos += pago.monto;
            }
        });

        return {
            totalPagos,
            completados,
            pendientes
        };
    };

    // Exportar a Excel
    const exportToExcel = () => {
        // Implementación de exportación a Excel
        setSuccess('Exportando a Excel...');
        setTimeout(() => setSuccess(null), 3000);
    };

    // Volver a la página anterior
    const handleBack = () => {
        navigate(-1);
    };

    // Obtener el estado de los pagos para una reserva
    const getEstadoPagosReserva = (reservaId) => {
        const pagosReserva = pagos[reservaId] || [];
        if (pagosReserva.length === 0) return 'Sin pagos';

        const completados = pagosReserva.some(p => p.estado === 'completado');
        if (completados) return 'Pagado';

        return 'Pendiente';
    };

    // Obtener el monto total pagado para una reserva
    const getMontoPagadoReserva = (reservaId) => {
        const pagosReserva = pagos[reservaId] || [];
        return pagosReserva
            .filter(p => p.estado === 'completado')
            .reduce((sum, p) => sum + p.monto, 0);
    };

    const estadisticas = getEstadisticasReservas();
    const estadisticasPagos = getEstadisticasPagos();

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Listado de Reservas</h1>
                        <div>
                            <button
                                className="btn btn-sm btn-outline-primary rounded-pill me-2"
                                onClick={handlePrint}
                            >
                                <i className="bi bi-printer me-1"></i> Imprimir
                            </button>
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

                    {/* Resumen estadístico usando tarjetas tipo materias */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3 col-sm-6">
                            <div className="materia-card">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i className="bi bi-calendar-check fs-3 text-primary"></i>
                                    </div>
                                    <div>
                                        <div className="materia-title">Total Reservas</div>
                                        <div className="fs-4 fw-bold">{estadisticas.total}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <div className="materia-card materia-card-available">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i className="bi bi-check-circle fs-3 text-success"></i>
                                    </div>
                                    <div>
                                        <div className="materia-title">Completadas</div>
                                        <div className="fs-4 fw-bold">
                                            {estadisticas.completadas}
                                            <span className="fs-6 fw-normal text-muted ms-1">({estadisticas.pctCompletadas}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <div className="materia-card">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i className="bi bi-hourglass-split fs-3 text-warning"></i>
                                    </div>
                                    <div>
                                        <div className="materia-title">Pendientes</div>
                                        <div className="fs-4 fw-bold">
                                            {estadisticas.pendientes}
                                            <span className="fs-6 fw-normal text-muted ms-1">({estadisticas.pctPendientes}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <div className="materia-card">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i className="bi bi-x-circle fs-3 text-danger"></i>
                                    </div>
                                    <div>
                                        <div className="materia-title">Canceladas</div>
                                        <div className="fs-4 fw-bold">
                                            {estadisticas.canceladas}
                                            <span className="fs-6 fw-normal text-muted ms-1">({estadisticas.pctCanceladas}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                    <div className="filter-container mb-4 p-3 shadow-sm">
                        <div className="row g-2">
                            <div className="col-12 col-md-3 mb-2">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0 py-2"
                                        placeholder={activeTab === 'estudiante' ? "Buscar por tutor o materia..." :
                                            activeTab === 'tutor' ? "Buscar por estudiante o materia..." :
                                                "Buscar por estudiante, tutor o materia..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-9">
                                <div className="row g-2">
                                    <div className="col-md-3 col-6 mb-2">
                                        <CustomSelect
                                            value={estadoFilter}
                                            onChange={(e) => setEstadoFilter(e.target.value)}
                                            options={[
                                                { id: 'pendiente', nombre: 'Pendiente' },
                                                { id: 'confirmada', nombre: 'Confirmada' },
                                                { id: 'completada', nombre: 'Completada' },
                                                { id: 'cancelada', nombre: 'Cancelada' }
                                            ]}
                                            placeholder="Todos los estados"
                                            className="bg-white border-0 py-2 rounded-3"
                                            variant="light"
                                        />
                                    </div>
                                    <div className="col-md-3 col-6 mb-2">
                                        <CustomSelect
                                            value={materiaFilter}
                                            onChange={(e) => setMateriaFilter(e.target.value)}
                                            options={materias}
                                            placeholder="Todas las materias"
                                            className="bg-white border-0 py-2 rounded-3"
                                            variant="light"
                                        />
                                    </div>
                                    <div className="col-md-3 col-6 mb-2">
                                        <CustomSelect
                                            value={modalidadFilter}
                                            onChange={(e) => setModalidadFilter(e.target.value)}
                                            options={[
                                                { id: 'virtual', nombre: 'Virtual' },
                                                { id: 'presencial', nombre: 'Presencial' }
                                            ]}
                                            placeholder="Todas las modalidades"
                                            className="bg-white border-0 py-2 rounded-3"
                                            variant="light"
                                        />
                                    </div>
                                    <div className="col-md-2 col-6 mb-2 d-flex align-items-center">
                                        <button
                                            className="btn btn-sm py-2 w-100 rounded-3 btn-light border-0"
                                            onClick={resetFilters}
                                            title="Limpiar filtros"
                                        >
                                            <i className="bi bi-trash"></i> Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de reservas */}
                    <div className="table-responsive" ref={componentRef}>
                        <table className="table table-hover table-rounded" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                            <tr className="table-header">
                                {activeTab === 'admin' && <th className="border-0">Estudiante</th>}
                                {(activeTab === 'admin' || activeTab === 'estudiante') && <th className="border-0">Tutor</th>}
                                <th className="border-0">Materia</th>
                                <th className="border-0">Fecha</th>
                                <th className="border-0">Horario</th>
                                <th className="border-0">Modalidad</th>
                                <th className="border-0">Estado</th>
                                <th className="border-0">Pago</th>
                                <th className="border-0">Detalles</th>
                            </tr>
                            </thead>
                            <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="10" className="text-center border-0 py-5">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="spinner-border" style={{ color: '#283048' }} role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                            <span className="mt-2 text-muted">Cargando reservas...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredReservas.length > 0 ? (
                                filteredReservas.map((reserva) => (
                                    <React.Fragment key={reserva.id}>
                                        <tr className={`table-row hover-row ${expandedRows[reserva.id] ? 'bg-light' : ''}`}>
                                            {activeTab === 'admin' && (
                                                <td className="border-0 py-3">
                                                    {reserva.estudiante ? (
                                                        <span className="tag-email">
                                                                {reserva.estudiante.nombre} {reserva.estudiante.apellido}
                                                            </span>
                                                    ) : 'N/A'}
                                                </td>
                                            )}
                                            {(activeTab === 'admin' || activeTab === 'estudiante') && (
                                                <td className="border-0 py-3">
                                                    {reserva.tutor ? (
                                                        <span className="tag-email">
                                                                {reserva.tutor.nombre} {reserva.tutor.apellido}
                                                            </span>
                                                    ) : 'N/A'}
                                                </td>
                                            )}
                                            <td className="border-0 py-3">
                                                    <span className="tag-carrera">
                                                        {reserva.materia ? reserva.materia.nombre : 'N/A'}
                                                    </span>
                                            </td>
                                            <td className="border-0 py-3">
                                                {new Date(reserva.fecha).toLocaleDateString()}
                                            </td>
                                            <td className="border-0 py-3">
                                                {reserva.hora_inicio.substring(0, 5)} - {reserva.hora_fin.substring(0, 5)}
                                            </td>
                                            <td className="border-0 py-3">
                                                    <span className={`badge ${reserva.servicio?.modalidad === 'virtual' ? 'bg-info' : 'bg-secondary'}`}>
                                                        {reserva.servicio?.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                                                    </span>
                                            </td>
                                            <td className="border-0 py-3">
                                                    <span className={`badge ${
                                                        reserva.estado === 'completada' ? 'bg-success' :
                                                            reserva.estado === 'pendiente' ? 'bg-warning' :
                                                                reserva.estado === 'confirmada' ? 'bg-primary' :
                                                                    'bg-danger'
                                                    }`}>
                                                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                                    </span>
                                            </td>
                                            <td className="border-0 py-3">
                                                    <span className={`badge ${
                                                        getEstadoPagosReserva(reserva.id) === 'Pagado' ? 'bg-success' :
                                                            getEstadoPagosReserva(reserva.id) === 'Pendiente' ? 'bg-warning' :
                                                                'bg-secondary'
                                                    }`}>
                                                        {getEstadoPagosReserva(reserva.id)}
                                                    </span>
                                            </td>
                                            <td className="border-0 py-3">
                                                <button
                                                    className={expandedRows[reserva.id] ? "btn-remove-materia" : "btn-add-materia"}
                                                    onClick={() => toggleRowExpansion(reserva.id)}
                                                >
                                                    {expandedRows[reserva.id] ? (
                                                        <i className="bi bi-dash"></i>
                                                    ) : (
                                                        <i className="bi bi-plus"></i>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows[reserva.id] && (
                                            <tr>
                                                <td colSpan="10" className="p-0 border-0">
                                                    <div className="p-3 mb-3 materia-card">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <h5 className="mb-3 materia-title">Detalles de la Reserva</h5>
                                                                <div className="mb-2">
                                                                    <strong>Fecha Creación:</strong> {new Date(reserva.fecha_creacion).toLocaleString()}
                                                                </div>
                                                                <div className="mb-2">
                                                                    <strong>Sala Virtual:</strong> {reserva.sala_virtual || 'No disponible'}
                                                                </div>
                                                                <div className="mb-2">
                                                                    <strong>Notas:</strong> {reserva.notas || 'Sin notas'}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <h5 className="mb-3 materia-title">Detalles de Pago</h5>
                                                                {pagos[reserva.id] && pagos[reserva.id].length > 0 ? (
                                                                    <div>
                                                                        <div className="mb-2">
                                                                            <strong>Precio del Servicio:</strong> ${reserva.servicio?.precio.toLocaleString()}
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <strong>Monto Pagado:</strong> ${getMontoPagadoReserva(reserva.id).toLocaleString()}
                                                                        </div>
                                                                        <table className="table table-sm mt-2">
                                                                            <thead>
                                                                            <tr>
                                                                                <th>Método</th>
                                                                                <th>Estado</th>
                                                                                <th>Monto</th>
                                                                                <th>Fecha</th>
                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                            {pagos[reserva.id].map(pago => (
                                                                                <tr key={pago.id}>
                                                                                    <td>{pago.metodo_pago}</td>
                                                                                    <td>
                                                                                                <span className={`badge ${
                                                                                                    pago.estado === 'completado' ? 'bg-success' :
                                                                                                        'bg-warning'
                                                                                                }`}>
                                                                                                    {pago.estado}
                                                                                                </span>
                                                                                    </td>
                                                                                    <td>${pago.monto.toLocaleString()}</td>
                                                                                    <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString() : 'Pendiente'}</td>
                                                                                </tr>
                                                                            ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <div className="alert alert-light">
                                                                        No hay pagos registrados para esta reserva.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {reserva.servicio?.modalidad === 'virtual' && reserva.sala_virtual && (
                                                            <div className="row mt-3">
                                                                <div className="col-12">
                                                                    <a
                                                                        href={reserva.sala_virtual}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm btn-primary"
                                                                    >
                                                                        <i className="bi bi-camera-video me-1"></i>
                                                                        Acceder a la Sala Virtual
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center border-0 py-5">
                                        <div className="d-flex flex-column align-items-center empty-state">
                                            <i className="bi bi-search empty-state-icon"></i>
                                            <span>No hay reservas que coincidan con los filtros aplicados</span>
                                            <button
                                                className="btn btn-sm mt-3 app-primary"
                                                onClick={resetFilters}
                                            >
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>



                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                            Mostrando {filteredReservas.length} de {reservas.length} reservas
                        </div>
                    </div>

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