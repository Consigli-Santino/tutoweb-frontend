// Dashboard.jsx - Componente principal refactorizado

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import _ from 'lodash';
import '../../commonTables.css';

// Componentes refactorizados
import DateRangeFilter from './DateRangeFilter';
import DashboardCard from './DashboardCard';
import ReservasBarChart from './ReservasBarChart';
import IngresosPeriodoChart from './IngresosPeriodoChart';
import ReservasMateriaChart from './ReservasMateriasChart.jsx';
import UsuariosRolChart from './UsuariosRolChart';
import DistribucionCalificacionesChart from './DistribucionCalificacionesChart';
import HorariosChart from './HorariosChart';
import HistorialPagosChart from './HistorialPagosChart';
import KPIsAdminSection from './KPIsAdminSection';
import TutoresMejorCalificadosChart from './TutoresMejorCalificadosChart';
import MateriasDemandadasChart from './MateriasDemandadasChart';
import ReservasTable from './ReservasTable';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determinar si el usuario tiene roles específicos
    const isTutor = useMemo(() => {
        return user && (user.roles.includes('tutor') || user.roles.includes('alumno&tutor'));
    }, [user]);

    const isStudent = useMemo(() => {
        return user && (user.roles.includes('estudiante') || user.roles.includes('alumno') || user.roles.includes('alumno&tutor'));
    }, [user]);

    const isAdmin = useMemo(() => {
        return user && (user.roles.includes('admin') || user.roles.includes('superAdmin'));
    }, [user]);

    // Estados para datos del dashboard
    const [activeTab, setActiveTab] = useState(isStudent ? 'estudiante' : (isTutor ? 'tutor' : 'admin'));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estados para filtros de fecha (60 días por defecto)
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 60); // Últimos 60 días
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Estados para datos
    const [reservas, setReservas] = useState([]);
    const [pagos, setPagos] = useState({});
    const [calificaciones, setCalificaciones] = useState([]);
    const [tutores, setTutores] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    // Colores para los gráficos
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === 'estudiante') {
                // Fetch detailed reservations for the student with date filters
                const reservasResponse = await ApiService.fetchReservasDetalladasByEstudiante(fechaDesde, fechaHasta);
                if (reservasResponse.success) {
                    const reservasFiltradas = reservasResponse.data.filter(reserva => reserva.estado !== 'cancelada');
                    setReservas(reservasFiltradas);

                    const idsReservas = reservasFiltradas.map(reserva => reserva.id);

                    // Fetch payments for the reservations
                    const pagosObj = {};
                    const response = await ApiService.fetchPagosByReservas(idsReservas);
                    if (response.success) {
                        Object.entries(response.data).forEach(([reservaId, pagos]) => {
                            pagosObj[reservaId] = pagos;
                        });
                    }
                    setPagos(pagosObj);

                    // Fetch student ratings
                    const calificacionesResponse = await ApiService.getCalificacionesByEstudiante();
                    if (calificacionesResponse.success) {
                        setCalificaciones(calificacionesResponse.data);
                    }
                }
            }
            else if (activeTab === 'tutor') {
                // Obtener reservas como tutor con filtros de fecha
                const reservasTutorResponse = await ApiService.fetchReservasDetalladasByTutor(fechaDesde, fechaHasta);
                if (reservasTutorResponse.success) {
                    setReservas(reservasTutorResponse.data);
                    const idsReservas = reservasTutorResponse.data.map(reserva => reserva.id);

                    const pagosObj = {};
                    const response = await ApiService.fetchPagosByReservas(idsReservas);
                    if (response.success) {
                        Object.entries(response.data).forEach(([reservaId, pagos]) => {
                            pagosObj[reservaId] = pagos;
                        });
                    }
                    setPagos(pagosObj);

                    const calificacionesResponse = await ApiService.getCalificacionesByTutor(user.id);
                    if (calificacionesResponse.success) {
                        setCalificaciones(calificacionesResponse.data);
                    }
                }
            } else if (activeTab === 'admin') {
                // Obtener datos para admin
                const usuariosResponse = await ApiService.getAllUsuarios();
                if (usuariosResponse.success) {
                    setUsuarios(usuariosResponse.data);
                }

                const tutoresResponse = await ApiService.getTutores();
                if (tutoresResponse.success) {
                    setTutores(tutoresResponse.data);
                }

                const materiasResponse = await ApiService.getAllMaterias();
                if (materiasResponse.success) {
                    setMaterias(materiasResponse.data);
                }

                // Obtener todas las reservas para admin con filtros de fecha
                const allReservasResponse = await ApiService.getAllReservas(fechaDesde, fechaHasta);
                if (allReservasResponse.success) {
                    setReservas(allReservasResponse.data);
                }
            }
        } catch (err) {
            setError(`Error al cargar los datos: ${err.message}`);
            console.error("Error fetching dashboard data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para aplicar filtros de fecha
    const handleFilterChange = () => {
        fetchDashboardData();
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Procesamiento de datos para métricas
    const getReservasByStatus = () => {
        return _.countBy(reservas, 'estado');
    };

    const getReservasByMateria = () => {
        const countByMateria = {};
        reservas.forEach(reserva => {
            if (reserva.materia && reserva.materia.nombre) {
                countByMateria[reserva.materia.nombre] = (countByMateria[reserva.materia.nombre] || 0) + 1;
            }
        });

        // Convertir a formato para gráficos
        return Object.keys(countByMateria).map(nombre => ({
            name: nombre,
            count: countByMateria[nombre]
        }));
    };

    const getHistorialPagos = () => {
        const pagosList = Object.values(pagos).flat();
        const pagosPorEstado = _.countBy(pagosList, 'estado');
        return Object.keys(pagosPorEstado).map(estado => ({
            name: estado.charAt(0).toUpperCase() + estado.slice(1),
            value: pagosPorEstado[estado]
        }));
    };

    const getIngresosPorPeriodo = () => {
        const pagosList = Object.values(pagos)
            .flat()
            .filter(pago => pago.estado === 'completado');
        const ingresosPorMes = {};
        pagosList.forEach(pago => {
            const fecha = new Date(pago.fecha_pago);
            const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

            ingresosPorMes[mesKey] = (ingresosPorMes[mesKey] || 0) + pago.monto;
        });

        return Object.keys(ingresosPorMes).map(mes => {
            const [year, month] = mes.split('-');
            return {
                name: `${month}/${year}`,
                ingresos: ingresosPorMes[mes]
            };
        }).sort((a, b) => {
            const [monthA, yearA] = a.name.split('/');
            const [monthB, yearB] = b.name.split('/');
            return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });
    };

    const getPromedioCalificaciones = () => {
        if (!calificaciones.length) return 0;
        const total = calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0);
        return (total / calificaciones.length).toFixed(1);
    };

    const getDistribucionCalificaciones = () => {
        const countByPuntuacion = _.countBy(calificaciones, 'puntuacion');
        const resultado = [];
        for (let i = 1; i <= 5; i++) {
            resultado.push({
                name: `${i} ★`,
                value: countByPuntuacion[i] || 0
            });
        }

        return resultado;
    };

    const getHorarioCount = () => {
        const horarioCount = {};
        reservas.forEach(reserva => {
            if (reserva.hora_inicio) {
                const hora = parseInt(reserva.hora_inicio.split(':')[0]);
                horarioCount[hora] = (horarioCount[hora] || 0) + 1;
            }
        });
        return Object.keys(horarioCount)
            .map(hora => ({
                name: `${hora}:00`,
                count: horarioCount[hora]
            }))
            .sort((a, b) => {
                return parseInt(a.name) - parseInt(b.name);
            });
    };

    // Renderizar el contenido del dashboard
    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main mb-5 pb-5">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">
                            Dashboard {activeTab === 'estudiante' ? 'Estudiante' : activeTab === 'tutor' ? 'Tutor' : 'Administrador'}
                        </h1>
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={handleBack}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver
                        </button>
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

                    {/* Filtros de fecha */}
                    <DateRangeFilter
                        fechaDesde={fechaDesde}
                        setFechaDesde={setFechaDesde}
                        fechaHasta={fechaHasta}
                        setFechaHasta={setFechaHasta}
                        onFilter={handleFilterChange}
                    />

                    {isLoading ? (
                        <div className="d-flex justify-content-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tarjetas de resumen */}
                            <div className="row g-3 mb-4">
                                <DashboardCard
                                    title={activeTab === 'estudiante' ? 'Tus Reservas' :
                                        activeTab === 'tutor' ? 'Tus Tutorías' :
                                            'Total Reservas'}
                                    value={reservas.length}
                                    icon="bi-calendar-check"
                                    color="primary"
                                />

                                <DashboardCard
                                    title={activeTab === 'estudiante' ? 'Pagos Realizados' :
                                        activeTab === 'tutor' ? 'Ingresos' :
                                            'Total Ingresos'}
                                    value={`$${Object.values(pagos)
                                        .flat()
                                        .filter(pago => pago.estado === 'completado')
                                        .reduce((sum, pago) => sum + pago.monto, 0)}`}
                                    icon="bi-cash"
                                    color="success"
                                />

                                <DashboardCard
                                    title={activeTab === 'estudiante' ? 'Calificaciones Dadas' :
                                        activeTab === 'tutor' ? 'Calificación Promedio' :
                                            'Total Usuarios'}
                                    value={activeTab === 'estudiante' ? calificaciones.length :
                                        activeTab === 'tutor' ? getPromedioCalificaciones() :
                                            usuarios.length}
                                    icon={activeTab === 'admin' ? 'bi-people' : 'bi-star'}
                                    color="warning"
                                />

                                <DashboardCard
                                    title={activeTab === 'estudiante' ? 'Reservas Pendientes' :
                                        activeTab === 'tutor' ? 'Tutorías Pendientes' :
                                            'Tutores Activos'}
                                    value={activeTab === 'admin' ?
                                        tutores.length :
                                        reservas.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length}
                                    icon={activeTab === 'admin' ? 'bi-mortarboard' : 'bi-hourglass'}
                                    color="info"
                                />
                            </div>

                            {/* Gráficos principales */}
                            <div className="row g-3 mb-4">
                                {/* Gráfico 1: Reservas por estado */}
                                <div className="col-12 col-lg-6">
                                    <ReservasBarChart
                                        data={Object.entries(getReservasByStatus()).map(([key, value]) => ({ name: key, value }))}
                                    />
                                </div>

                                {/* Gráfico 2: Varía según el rol */}
                                <div className="col-12 col-lg-6">
                                    {activeTab === 'tutor' && (
                                        <IngresosPeriodoChart data={getIngresosPorPeriodo()} />
                                    )}

                                    {activeTab === 'estudiante' && (
                                        <ReservasMateriaChart data={getReservasByMateria()} />
                                    )}

                                    {activeTab === 'admin' && (
                                        <UsuariosRolChart
                                            data={[
                                                { name: 'Estudiantes', value: usuarios.filter(u => u.rol.nombre === 'alumno').length },
                                                { name: 'Tutores', value: usuarios.filter(u => u.rol.nombre === 'tutor').length },
                                                { name: 'Ambos', value: usuarios.filter(u => u.rol.nombre === 'alumno&tutor').length },
                                                { name: 'Administradores', value: usuarios.filter(u => u.rol.nombre === 'admin' || u.rol.nombre === 'superAdmin').length }
                                            ]}
                                            colors={COLORS}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Gráficos secundarios */}
                            <div className="row g-3 mb-4">
                                {activeTab === 'tutor' && (
                                    <>
                                        <div className="col-12 col-lg-6">
                                            <DistribucionCalificacionesChart
                                                data={getDistribucionCalificaciones()}
                                                colors={COLORS}
                                            />
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <HorariosChart data={getHorarioCount()} />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'estudiante' && (
                                    <div className="col-12 col-lg-6">
                                        <HistorialPagosChart data={getHistorialPagos()} />
                                    </div>
                                )}

                                {activeTab === 'admin' && (
                                    <>
                                        <div className="col-12 col-lg-6">
                                            <TutoresMejorCalificadosChart
                                                data={tutores
                                                    .filter(t => t.puntuacion_promedio > 0)
                                                    .sort((a, b) => b.puntuacion_promedio - a.puntuacion_promedio)
                                                    .slice(0, 10)
                                                    .map(t => ({
                                                        name: `${t.nombre} ${t.apellido}`,
                                                        rating: t.puntuacion_promedio,
                                                        reviews: t.cantidad_reseñas
                                                    }))}
                                            />
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <MateriasDemandadasChart
                                                data={getReservasByMateria()
                                                    .sort((a, b) => b.count - a.count)
                                                    .slice(0, 10)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* KPIs adicionales para Administradores */}
                            {activeTab === 'admin' && (
                                <KPIsAdminSection
                                    reservas={reservas}
                                    tutores={tutores}
                                    pagos={pagos}
                                />
                            )}

                            {/* Tabla de últimas reservas */}
                            <ReservasTable
                                reservas={reservas}
                                pagos={pagos}
                                activeTab={activeTab}
                            />

                            {/* Nota informativa según el rol activo */}
                            <div className="alert alert-info mt-4">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                <strong>Información:</strong>
                                {activeTab === 'estudiante'
                                    ? 'Este dashboard muestra un resumen de tus reservas, pagos y calificaciones como estudiante.'
                                    : activeTab === 'tutor'
                                        ? 'Este dashboard muestra un resumen de tus tutorías, ingresos y calificaciones recibidas como tutor.'
                                        : 'Este dashboard muestra un resumen general del sistema de tutorías.'}
                            </div>
                        </>
                    )}

                    {/* Espacio adicional para evitar que el HomeBar tape contenido */}
                    <div className="mt-5 pt-3">
                        {/* Espacio reservado para el HomeBar */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;