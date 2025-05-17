import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import _ from 'lodash';
import '../../commonTables.css'

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
    const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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
    }, [activeTab, dateRange]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {if (activeTab === 'estudiante') {
            // Fetch detailed reservations for the student
            const reservasResponse = await ApiService.fetchReservasDetalladasByEstudiante();
            if (reservasResponse.success) {
                setReservas(reservasResponse.data);

                // Extract reservation IDs
                const idsReservas = reservasResponse.data.map(reserva => reserva.id);

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
                // Obtener reservas como tutor
                const reservasTutorResponse = await ApiService.fetchReservasDetalladasByTutor();
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

                // Obtener todas las reservas para admin (ejemplo)
                const allReservasResponse = await ApiService.getAllReservas();
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
        console.log("Pagos:", pagos);
        const pagosList = Object.values(pagos)
            .flat()
            .filter(pago => pago.estado === 'completado');
        console.log("Pagos filtrados:", pagosList);
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

        // Asegurar que todas las puntuaciones del 1 al 5 estén representadas
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
        // Agrupar por hora del día
        const horarioCount = {};
        reservas.forEach(reserva => {
            if (reserva.hora_inicio) {
                const hora = parseInt(reserva.hora_inicio.split(':')[0]);
                horarioCount[hora] = (horarioCount[hora] || 0) + 1;
            }
        });

        // Convertir a formato para gráficos y ordenar
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

                    {/* Selector de rango de fechas */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-end">
                            <select
                                className="form-select form-select-sm w-auto"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="week">Última Semana</option>
                                <option value="month">Último Mes</option>
                                <option value="year">Último Año</option>
                            </select>
                        </div>
                    </div>

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
                                {/* Tarjeta 1 */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="materia-card">
                                        <h3 className="materia-title">
                                            {activeTab === 'estudiante' ? 'Tus Reservas' :
                                                activeTab === 'tutor' ? 'Tus Tutorías' :
                                                    'Total Reservas'}
                                        </h3>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h2 className="fs-1 fw-bold text-primary mb-0">{reservas.length}</h2>
                                            <div className="bg-primary p-3 rounded-circle text-white">
                                                <i className="bi bi-calendar-check fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tarjeta 2 */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="materia-card">
                                        <h3 className="materia-title">
                                            {activeTab === 'estudiante' ? 'Pagos Realizados' :
                                                activeTab === 'tutor' ? 'Ingresos' :
                                                    'Total Ingresos'}
                                        </h3>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h2 className="fs-1 fw-bold text-success mb-0">
                                                ${Object.values(pagos)
                                                .flat()
                                                .filter(pago => pago.estado === 'completado')
                                                .reduce((sum, pago) => sum + pago.monto, 0)}
                                            </h2>
                                            <div className="bg-success p-3 rounded-circle text-white">
                                                <i className="bi bi-cash fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tarjeta 3 */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="materia-card">
                                        <h3 className="materia-title">
                                            {activeTab === 'estudiante' ? 'Calificaciones Dadas' :
                                                activeTab === 'tutor' ? 'Calificación Promedio' :
                                                    'Total Usuarios'}
                                        </h3>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h2 className="fs-1 fw-bold text-warning mb-0">
                                                {activeTab === 'estudiante' ? calificaciones.length :
                                                    activeTab === 'tutor' ? getPromedioCalificaciones() :
                                                        usuarios.length}
                                            </h2>
                                            <div className="bg-warning p-3 rounded-circle text-white">
                                                <i className={`bi ${activeTab === 'admin' ? 'bi-people' : 'bi-star'} fs-4`}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tarjeta 4 */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="materia-card">
                                        <h3 className="materia-title">
                                            {activeTab === 'estudiante' ? 'Reservas Pendientes' :
                                                activeTab === 'tutor' ? 'Tutorías Pendientes' :
                                                    'Tutores Activos'}
                                        </h3>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h2 className="fs-1 fw-bold text-info mb-0">
                                                {activeTab === 'admin' ?
                                                    tutores.length :
                                                    reservas.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length}
                                            </h2>
                                            <div className="bg-info p-3 rounded-circle text-white">
                                                <i className={`bi ${activeTab === 'admin' ? 'bi-mortarboard' : 'bi-hourglass'} fs-4`}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gráficos principales - usando materia-card para mantener consistencia visual */}
                            <div className="row g-3 mb-4">
                                {/* Gráfico 1 */}
                                <div className="col-12 col-lg-6">
                                    <div className="materia-card">
                                        <h3 className="materia-title">Reservas por Estado</h3>
                                        <div style={{ height: '300px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={Object.entries(getReservasByStatus()).map(([key, value]) => ({ name: key, value }))}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                                                    <Legend />
                                                    <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Gráfico 2 */}
                                <div className="col-12 col-lg-6">
                                    <div className="materia-card">
                                        {activeTab === 'tutor' ? (
                                            // Para tutores: Ingresos por período
                                            <>
                                                <h3 className="materia-title">Ingresos por Período</h3>
                                                <div style={{ height: '300px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={getIngresosPorPeriodo()}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                                                            <Legend />
                                                            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#82ca9d" fill="#82ca9d" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </>
                                        ) : activeTab === 'estudiante' ? (
                                            // Para estudiantes: Reservas por materia
                                            <>
                                                <h3 className="materia-title">Tutorías por Materia</h3>
                                                <div style={{ height: '300px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={getReservasByMateria()}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                                                            <Legend />
                                                            <Bar dataKey="count" name="Cantidad" fill="#82ca9d" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </>
                                        ) : (
                                            // Para administradores: Distribución de usuarios por rol
                                            <>
                                                <h3 className="materia-title">Usuarios por Rol</h3>
                                                <div style={{ height: '300px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: 'Estudiantes', value: usuarios.filter(u => u.rol.nombre === 'alumno').length },
                                                                    { name: 'Tutores', value: usuarios.filter(u => u.rol.nombre === 'tutor').length },
                                                                    { name: 'Ambos', value: usuarios.filter(u => u.rol.nombre === 'alumno&tutor').length },
                                                                    { name: 'Administradores', value: usuarios.filter(u => u.rol.nombre === 'admin' || u.rol.nombre === 'superAdmin').length }
                                                                ]}
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={100}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            >
                                                                {[
                                                                    { name: 'Estudiantes', value: usuarios.filter(u => u.rol.nombre === 'alumno').length },
                                                                    { name: 'Tutores', value: usuarios.filter(u => u.rol.nombre === 'tutor').length },
                                                                    { name: 'Ambos', value: usuarios.filter(u => u.rol.nombre === 'alumno&tutor').length },
                                                                    { name: 'Administradores', value: usuarios.filter(u => u.rol.nombre === 'admin' || u.rol.nombre === 'superAdmin').length }
                                                                ].map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => [`${value} usuarios`, 'Cantidad']} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gráficos secundarios */}
                            <div className="row g-3 mb-4">
                                {activeTab === 'tutor' && (
                                    <div className="col-12 col-lg-6">
                                        <div className="materia-card">
                                            <h3 className="materia-title">Distribución de Calificaciones</h3>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getDistribucionCalificaciones()}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={100}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {getDistribucionCalificaciones().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [`${value} calificaciones`, 'Cantidad']} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'tutor' && (
                                    <div className="col-12 col-lg-6">
                                        <div className="materia-card">
                                            <h3 className="materia-title">Horarios más Solicitados</h3>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={getHorarioCount()}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                                                        <Legend />
                                                        <Bar dataKey="count" name="Reservas" fill="#8884d8" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'estudiante' && (
                                    <div className="col-12 col-lg-6">
                                        <div className="materia-card">
                                            <h3 className="materia-title">Historial de Pagos</h3>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getHistorialPagos()}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={100}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            <Cell fill="#00C49F" /> {/* Completados */}
                                                            <Cell fill="#FFBB28" /> {/* Pendientes */}
                                                            <Cell fill="#FF8042" /> {/* Cancelados */}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [`${value} pagos`, 'Cantidad']} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'admin' && (
                                    <>
                                        <div className="col-12 col-lg-6">
                                            <div className="materia-card">
                                                <h3 className="materia-title">Tutores Mejor Calificados</h3>
                                                <div style={{ height: '300px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={tutores
                                                                .filter(t => t.puntuacion_promedio > 0)
                                                                .sort((a, b) => b.puntuacion_promedio - a.puntuacion_promedio)
                                                                .slice(0, 10)
                                                                .map(t => ({
                                                                    name: `${t.nombre} ${t.apellido}`,
                                                                    rating: t.puntuacion_promedio,
                                                                    reviews: t.cantidad_reseñas
                                                                }))}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="rating" name="Calificación" fill="#8884d8" />
                                                            <Bar dataKey="reviews" name="Reseñas" fill="#82ca9d" /></BarChart>
</ResponsiveContainer>
</div>
</div>
</div>

<div className="col-12 col-lg-6">
    <div className="materia-card">
        <h3 className="materia-title">Materias más Demandadas</h3>
        <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={getReservasByMateria()
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 10)}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                    <Legend />
                    <Bar dataKey="count" name="Cantidad de Reservas" fill="#FF8042" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
</div>
</>
)}
</div>

{/* KPIs adicionales para Administradores */}
{activeTab === 'admin' && (
    <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
            <div className="materia-card">
                <h3 className="materia-title">Tasa de Completitud</h3>
                <div className="text-center">
                    <h2 className="display-4 fw-bold text-primary">
                        {(() => {
                            const total = reservas.length;
                            const completadas = reservas.filter(r => r.estado === 'completada').length;
                            return total > 0 ? `${(completadas / total * 100).toFixed(1)}%` : '0%';
                        })()}
                    </h2>
                    <p className="materia-description">Porcentaje de reservas completadas exitosamente</p>
                </div>
            </div>
        </div>

        <div className="col-12 col-md-4">
            <div className="materia-card">
                <h3 className="materia-title">Calificación Promedio</h3>
                <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                        <h2 className="display-4 fw-bold text-warning mb-0">
                            {parseFloat(tutores.reduce((sum, tutor) => sum + (tutor.puntuacion_promedio || 0), 0) /
                                tutores.filter(tutor => tutor.puntuacion_promedio > 0).length || 0).toFixed(1)}
                        </h2>
                        <i className="bi bi-star-fill text-warning ms-2 fs-3"></i>
                    </div>
                    <p className="materia-description">Satisfacción general de los estudiantes</p>
                </div>
            </div>
        </div>

        <div className="col-12 col-md-4">
            <div className="materia-card">
                <h3 className="materia-title">Ingreso Promedio por Tutor</h3>
                <div className="text-center">
                    <h2 className="display-4 fw-bold text-success">
                        {(() => {
                            const totalIngresos = Object.values(pagos)
                                .filter(p => p.estado === 'completado')
                                .reduce((sum, p) => sum + p.monto, 0);
                            const tutoresActivos = tutores.filter(t => t.cantidad_reseñas > 0).length;

                            return tutoresActivos > 0
                                ? `$${Math.round(totalIngresos / tutoresActivos)}`
                                : '$0';
                        })()}
                    </h2>
                    <p className="materia-description">Promedio de ingresos por tutor activo</p>
                </div>
            </div>
        </div>
    </div>
)}

{/* Tabla de últimas reservas */}
<div className="materia-card mt-4">
    <h3 className="materia-title mb-3">
        {activeTab === 'estudiante' ? 'Mis Últimas Reservas' :
            activeTab === 'tutor' ? 'Mis Últimas Tutorías' :
                'Últimas Reservas del Sistema'}
    </h3>

    {reservas.length > 0 ? (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Materia</th>
                    {activeTab === 'estudiante' && <th>Tutor</th>}
                    {activeTab === 'tutor' && <th>Estudiante</th>}
                    {activeTab === 'admin' && (
                        <>
                            <th>Estudiante</th>
                            <th>Tutor</th>
                        </>
                    )}
                    <th>Estado</th>
                    <th>Pago</th>
                </tr>
                </thead>
                <tbody>
                {reservas
                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                    .slice(0, 10)
                    .map((reserva, index) => (
                        <tr key={index}>
                            <td>
                                {new Date(reserva.fecha).toLocaleDateString('es-AR')}
                                <br />
                                <small>
                                    {reserva.hora_inicio ? reserva.hora_inicio.substring(0, 5) : ''} -
                                    {reserva.hora_fin ? reserva.hora_fin.substring(0, 5) : ''}
                                </small>
                            </td>
                            <td>{reserva.materia ? reserva.materia.nombre : 'N/A'}</td>
                            {activeTab === 'estudiante' && (
                                <td>
                                    {reserva.tutor ? `${reserva.tutor.nombre} ${reserva.tutor.apellido}` : 'N/A'}
                                </td>
                            )}
                            {(activeTab === 'tutor' || activeTab === 'admin') && (
                                <td>
                                    {reserva.estudiante ? `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}` : 'N/A'}
                                </td>
                            )}
                            {activeTab === 'admin' && (
                                <td>
                                    {reserva.tutor ? `${reserva.tutor.nombre} ${reserva.tutor.apellido}` : 'N/A'}
                                </td>
                            )}
                            <td>
                                                                <span className={`badge ${
                                                                    reserva.estado === 'completada' ? 'bg-success' :
                                                                        reserva.estado === 'confirmada' ? 'bg-primary' :
                                                                            reserva.estado === 'pendiente' ? 'bg-warning text-dark' :
                                                                                'bg-danger'
                                                                }`}>
                                                                    {reserva.estado}
                                                                </span>
                            </td>
                            <td>
                                {pagos[reserva.id] && pagos[reserva.id].length > 0 ? (
                                    pagos[reserva.id].some(pago => pago.estado === 'completado') ? (
                                        <span className="badge bg-success">completado</span>
                                    ) : (
                                        pagos[reserva.id].map((pago, index) => (
                                            <span key={index} className={`badge ${
                                                pago.estado === 'pendiente' ? 'bg-warning text-dark' : 'bg-danger'
                                            } me-1`}>
                    {pago.estado}
                </span>
                                        ))
                                    )
                                ) : (
                                    <span className="badge bg-secondary">Sin pago</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className="empty-state">
            <i className="bi bi-calendar-x-fill empty-state-icon"></i>
            <p>{activeTab === 'estudiante' ? 'No tienes reservas de tutorías' :
                activeTab === 'tutor' ? 'No tienes reservas pendientes' :
                    'No hay reservas en el sistema'}</p>
        </div>
    )}
</div>

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