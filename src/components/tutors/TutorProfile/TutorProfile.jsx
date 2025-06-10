import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useEntidades } from '../../../context/EntidadesContext';
import ApiService from '../../../services/ApiService';
import DatePicker, { registerLocale } from 'react-datepicker';
import { format, addDays, isAfter, isSameDay as isSameDayFns, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../commonTables.css';


registerLocale('es', es);

const TutorProfile = () => {
    const API_URL = (import.meta.env.VITE_BACKEND_URL);
    const { email } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { refreshCommonData } = useEntidades();
    const { getTutorByEmail } = useEntidades();
    const [tutor, setTutor] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const today = new Date();
    const maxDate = addDays(today, 30);


    const [disponibilidadesTutor, setDisponibilidadesTutor] = useState([]);

    const [fechasConReservas, setFechasConReservas] = useState({});

    const [fechasDisponibles, setFechasDisponibles] = useState([]);

    const [showCalendario, setShowCalendario] = useState(false);

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const setTutorImage = async (imageUrl) => {
        try {
            const imageResponse = await fetch(imageUrl, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                const objectURL = URL.createObjectURL(blob);
                setTutor(prevTutor => ({
                    ...prevTutor,
                    foto_perfil: objectURL
                }));
            } else {
                console.error('Error fetching image:', imageResponse.statusText);
            }
        } catch (err) {
            console.error('Error fetching image:', err);
        }
    };

    useEffect(() => {
        fetchTutor();
    }, [email]);

    useEffect(() => {
        if (selectedServicio && selectedDate) {
            fetchHorariosDisponibles();
        }
    }, [selectedServicio, selectedDate]);

    useEffect(() => {
        if (tutor) {
            fetchDisponibilidadesTutor();
        }
    }, [tutor]);

    // Nuevo useEffect para calcular fechas disponibles cuando cambien las disponibilidades o el servicio seleccionado
    useEffect(() => {
        if (disponibilidadesTutor.length > 0 && selectedServicio) {
            calcularFechasDisponibles();
        }
    }, [disponibilidadesTutor, selectedServicio]);

    const fetchTutor = async () => {
        setIsLoading(true);
        try {
            const response = await getTutorByEmail(email);
            if (response.success) {
                const serviciosResponse = await ApiService.fetchApi(`/servicios/tutor/${email}`);
                if (serviciosResponse.success) {
                    setServicios(serviciosResponse.data);
                }

                // Primero establecer los datos del tutor
                setTutor(response.data);

                // Luego manejar la imagen si existe
                if (response.data.foto_perfil) {
                    const imageUrl = response.data.foto_perfil.startsWith('http')
                        ? response.data.foto_perfil
                        : `${API_URL}${response.data.foto_perfil}`;

                    // Cargar la imagen mediante blob
                    await setTutorImage(imageUrl);
                }
            } else {
                throw new Error(response.message || 'Error al obtener información del tutor');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDisponibilidadesTutor = async () => {
        setIsLoading(true);
        try {
            const response = await ApiService.fetchApi(`/disponibilidades/tutor/${tutor.id}`);
            if (response.success) {
                setDisponibilidadesTutor(response.data);
            } else {
                throw new Error(response.message || 'Error al obtener disponibilidades del tutor');
            }
        } catch (err) {
            setError(`Error al cargar disponibilidades: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para verificar si una fecha específica tiene horarios disponibles considerando la hora actual
    const verificarDisponibilidadFecha = async (fecha, disponibilidades) => {
        const ahora = new Date();

        // Si la fecha es anterior a hoy, no está disponible
        if (startOfDay(fecha) < startOfDay(ahora)) {
            return false;
        }

        // Si es hoy, verificar que haya horarios futuros disponibles
        if (isSameDayFns(fecha, ahora)) {
            // Verificar si alguna disponibilidad de este día tiene horarios futuros
            const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
            const disponibilidadesDelDia = disponibilidades.filter(d => d.dia_semana === diaSemana);

            if (disponibilidadesDelDia.length === 0) return false;

            // Verificar si hay algún horario futuro (con margen de 1 hora)
            const horaActual = ahora.getHours();
            const minutosActuales = ahora.getMinutes();
            const tiempoActualEnMinutos = horaActual * 60 + minutosActuales + 60; // +60 min de margen

            for (const disp of disponibilidadesDelDia) {
                const [horaInicio, minutosInicio] = disp.hora_inicio.split(':').map(Number);
                const tiempoInicioEnMinutos = horaInicio * 60 + minutosInicio;

                if (tiempoInicioEnMinutos > tiempoActualEnMinutos) {
                    return true; // Hay al menos un horario futuro
                }
            }

            return false; // No hay horarios futuros
        }

        // Si es una fecha futura, verificar si hay disponibilidad ese día
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
        return disponibilidades.some(d => d.dia_semana === diaSemana);
    };

    const calcularFechasDisponibles = async () => {
        if (!selectedServicio || !tutor || !tutor.id) return;

        setIsLoading(true);
        try {
            const fechasGeneradas = [];
            const diasAConsultar = 7;
            const ahora = new Date();

            for (let i = 0; i < diasAConsultar; i++) {
                const fecha = addDays(today, i);

                // Verificar disponibilidad considerando la hora actual
                const disponible = await verificarDisponibilidadFecha(fecha, disponibilidadesTutor);

                if (disponible) {
                    fechasGeneradas.push(fecha);
                }
            }

            setFechasDisponibles(fechasGeneradas);

            // Si la fecha seleccionada ya no es válida, seleccionar la primera disponible
            if (fechasGeneradas.length > 0 && !fechasGeneradas.some(f => isSameDay(f, selectedDate))) {
                setSelectedDate(fechasGeneradas[0]);
            }
        } catch (err) {
            setError(`Error al calcular fechas disponibles: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHorariosDisponibles = async () => {
        setIsLoading(true);
        setHorariosDisponibles([]);

        try {
            // Usar el nuevo endpoint que filtra automáticamente los horarios ya reservados
            const fechaStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await ApiService.fetchApi(`/disponibilidades/disponibles/${tutor.id}/${fechaStr}`);

            if (response.success) {
                let horarios = response.data.map(disp => ({
                    hora_inicio: disp.hora_inicio,
                    hora_fin: disp.hora_fin,
                    disponibilidad_id: disp.id
                }));

                // Si es hoy, filtrar horarios que ya pasaron
                if (isSameDay(selectedDate, new Date())) {
                    const ahora = new Date();
                    const horaActual = ahora.getHours();
                    const minutosActuales = ahora.getMinutes();
                    const tiempoActualEnMinutos = horaActual * 60 + minutosActuales + 60; // +60 min de margen

                    horarios = horarios.filter(horario => {
                        const [horaInicio, minutosInicio] = horario.hora_inicio.split(':').map(Number);
                        const tiempoInicioEnMinutos = horaInicio * 60 + minutosInicio;
                        return tiempoInicioEnMinutos > tiempoActualEnMinutos;
                    });
                }

                setHorariosDisponibles(horarios);
            } else {
                throw new Error(response.message || 'No se pudieron cargar las disponibilidades');
            }
        } catch (err) {
            setError(`Error al obtener horarios disponibles: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (servicio) => {
        setSelectedServicio(servicio);
        setShowCalendario(true);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleReservar = async (horarioInicio, horarioFin) => {
        if (!user) {
            setError("Debes iniciar sesión para reservar una tutoría");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const response = await ApiService.fetchApi('/reserva/create', 'POST', {
                estudiante_id: user.id,
                servicio_id: selectedServicio.id,
                fecha: formattedDate,
                hora_inicio: horarioInicio,
                hora_fin: horarioFin,
                estado: 'pendiente'
            });

            if (response.success) {
                setSuccess('¡Reserva creada con éxito! El tutor recibirá tu solicitud.');
                fetchHorariosDisponibles();
                // Re-calcular fechas disponibles después de crear reserva
                calcularFechasDisponibles();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(response.message || 'Error al crear la reserva');
            }
        } catch (err) {
            if(err.response && err.response.status === 409) {
                setError('Debes pagar tus reservas para seguir reservando');
                return;
            }
            setError(`Error al crear reserva: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatHorario = (hora) => {
        return hora.substring(0, 5);
    };

    const formatPrecio = (precio) => {
        return parseFloat(precio).toFixed(2);
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const formatDayName = (date) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    };

    const formatMonthName = (date) => {
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return months[date.getMonth()];
    };

    // Agrupar fechas disponibles por día de la semana
    const getFechasAgrupadasPorDia = () => {
        const grupos = {};

        fechasDisponibles.forEach(fecha => {
            const diaSemana = fecha.getDay();
            if (!grupos[diaSemana]) {
                grupos[diaSemana] = [];
            }
            grupos[diaSemana].push(fecha);
        });

        return grupos;
    };

    // Cleanup de URLs de blob cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (tutor?.foto_perfil && tutor.foto_perfil.startsWith('blob:')) {
                URL.revokeObjectURL(tutor.foto_perfil);
            }
        };
    }, [tutor?.foto_perfil]);

    if (isLoading && !tutor) {
        return (
            <div className="container-fluid px-3 py-2">
                <div className="card shadow card-main">
                    <div className="card-body p-5 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Agrupar fechas por día de la semana para mostrarlas más organizadas
    const fechasAgrupadas = getFechasAgrupadasPorDia();

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Perfil del Tutor</h1>
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={handleBack}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver
                        </button>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
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

                    {tutor && (
                        <>
                            {/* Información del Tutor */}
                            <div className="tutor-profile mb-4">
                                <div className="row">
                                    <div className="col-4 col-md-3 mb-3">
                                        <div className="profile-image-container d-flex justify-content-center align-items-center">
                                            {tutor.foto_perfil ? (
                                                <img
                                                    src={tutor.foto_perfil}
                                                    alt={`${tutor.nombre} ${tutor.apellido}`}
                                                    className="img-fluid rounded-circle shadow-sm"
                                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="profile-avatar d-flex justify-content-center align-items-center bg-light rounded-circle shadow-sm"
                                                     style={{ width: '100px', height: '100px' }}>
                                                    <i className="bi bi-person-circle fs-1 text-secondary"></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-8 col-md-9">
                                        <h2 className="fw-bold fs-3 mb-2">{tutor.nombre} {tutor.apellido}</h2>

                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2 flex-wrap">
                                                <span className="badge bg-primary me-2 mb-1">Tutor</span>
                                                <div className="tutor-rating mb-1">
                                                    <i className="bi bi-star-fill text-warning me-1"></i>
                                                    <span>{parseFloat(tutor.puntuacion_promedio || 0).toFixed(1)}</span>
                                                    <small className="text-muted ms-1">({tutor.cantidad_reseñas || 0} reseñas)</small>
                                                </div>
                                            </div>

                                            {tutor.carreras && tutor.carreras.length > 0 && (
                                                <div>
                                                    <small className="text-muted">Carrera: </small>
                                                    <div className="d-flex flex-wrap">
                                                        {tutor.carreras.map((carrera, index) => (
                                                            <span key={carrera.id} className="badge bg-light text-dark me-1 mb-1">
                                                                {carrera.nombre}
                                                                {index < tutor.carreras.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Servicios del Tutor */}
                            <div className="mb-4">
                                <h2 className="fs-5 fw-bold mb-3">
                                    <i className="bi bi-mortarboard me-2 text-primary"></i>
                                    Materias Disponibles
                                </h2>

                                <div className="overflow-auto pb-2">
                                    {servicios.length > 0 ? (
                                        <div className="row g-2 g-md-3">
                                            {servicios.map(servicio => (
                                                <div key={servicio.id} className="col-12 col-md-6 col-lg-4">
                                                    <div
                                                        className={`materia-card ${selectedServicio?.id === servicio.id ? 'border-primary' : ''}`}
                                                        onClick={() => handleServiceSelect(servicio)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h3 className="materia-title">{servicio.materia?.nombre || "Materia"}</h3>
                                                                <div className="d-flex flex-wrap mt-2">
                                                                    <span className="materia-year-badge me-1 mb-1">
                                                                        ${formatPrecio(servicio.precio)} / hora
                                                                    </span>
                                                                    <span className="materia-year-badge me-1 mb-1">
                                                                        {capitalizeFirstLetter(servicio.modalidad || "virtual")}
                                                                    </span>
                                                                </div>
                                                                {servicio.descripcion && (
                                                                    <p className="materia-description mt-2">
                                                                        {servicio.descripcion}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className={`badge ${selectedServicio?.id === servicio.id ? 'bg-primary' : 'bg-light text-dark'}`}>
                                                                {selectedServicio?.id === servicio.id ? 'Seleccionado' : 'Seleccionar'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <i className="bi bi-mortarboard-fill empty-state-icon"></i>
                                            <p>Este tutor aún no ha publicado servicios</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Calendario de disponibilidad */}
                            {selectedServicio && showCalendario && (
                                <div className="mb-4">
                                    <h2 className="fs-5 fw-bold mb-3">
                                        <i className="bi bi-calendar-check me-2 text-success"></i>
                                        Fechas Disponibles
                                    </h2>

                                    {isLoading ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </div>
                                    ) : fechasDisponibles.length === 0 ? (
                                        <div className="alert alert-info">
                                            <i className="bi bi-info-circle me-2"></i>
                                            No hay fechas disponibles para los próximos 7 días. El tutor puede no tener horarios futuros disponibles o todas las fechas pueden estar reservadas.
                                        </div>
                                    ) : (
                                        <div className="fechas-disponibles mb-4">
                                            <div className="card shadow-sm">
                                                <div className="card-header bg-light">
                                                    <h3 className="fs-6 fw-bold mb-0">
                                                        <i className="bi bi-calendar-day me-2"></i>
                                                        Próximos Días Disponibles
                                                    </h3>
                                                    <small className="text-muted">
                                                        <i className="bi bi-info-circle me-1"></i>
                                                        Se requiere reservar con al menos 1 hora de anticipación
                                                    </small>
                                                </div>
                                                <div className="card-body p-3">
                                                    <div className="d-flex flex-wrap">
                                                        {fechasDisponibles.map(fecha => {
                                                            const esHoy = isSameDay(fecha, new Date());
                                                            return (
                                                                <button
                                                                    key={fecha.toISOString()}
                                                                    className={`btn btn-outline-success me-2 mb-2 ${isSameDay(selectedDate, fecha) ? 'active' : ''}`}
                                                                    onClick={() => handleDateChange(fecha)}
                                                                >
                                                                    {esHoy ? 'Hoy' : formatDayName(fecha).substring(0, 3)} {fecha.getDate()} {formatMonthName(fecha).substring(0, 3)}
                                                                    {esHoy && <i className="bi bi-clock ms-1"></i>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mostrar horarios disponibles para la fecha seleccionada */}
                            {selectedServicio && selectedDate && fechasDisponibles.length > 0 && (
                                <div className="mb-5 pb-5"> {/* Añadido padding y margin bottom para evitar solapamiento con home bar */}
                                    <h2 className="fs-5 fw-bold mb-3">
                                        <i className="bi bi-clock me-2 text-warning"></i>
                                        Horarios Disponibles - {format(selectedDate, 'dd/MM/yyyy')}
                                    </h2>

                                    <div className="pb-5"> {/* Padding bottom adicional */}
                                        {isLoading ? (
                                            <div className="d-flex justify-content-center p-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Cargando...</span>
                                                </div>
                                            </div>
                                        ) : horariosDisponibles.length > 0 ? (
                                            <div className="row g-2 g-md-3 pb-5"> {/* Padding bottom adicional */}
                                                {horariosDisponibles.map((horario, index) => (
                                                    <div key={index} className="col-6 col-md-4 col-lg-3">
                                                        <div className="card border h-100">
                                                            <div className="card-body p-2 p-md-3">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <h5 className="card-title mb-0 fs-6">
                                                                        <i className="bi bi-clock me-2"></i>
                                                                        {formatHorario(horario.hora_inicio)} - {formatHorario(horario.hora_fin)}
                                                                    </h5>
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={() => handleReservar(horario.hora_inicio, horario.hora_fin)}
                                                                        title="Reservar horario"
                                                                        disabled={!user}
                                                                    >
                                                                        <i className="bi bi-calendar-check"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 mb-5">
                                                <i className="bi bi-calendar-x fs-1 text-muted"></i>
                                                <p className="mt-3">No hay horarios disponibles para esta fecha</p>
                                                <p className="text-muted">
                                                    {isSameDay(selectedDate, new Date())
                                                        ? 'Los horarios restantes de hoy ya pasaron o no están disponibles'
                                                        : 'Prueba seleccionando otra fecha o contacta con el tutor'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorProfile;