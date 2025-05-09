import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import JitsiMeetRoom from '../../JitsiMeetRom/JitsiMeetRoom.jsx';
import '../../commonTables.css';

const AlumnoReservas = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determinar si el usuario tiene rol de tutor
    const isTutor = useMemo(() => {
        return user && (user.roles.includes('tutor') || user.roles.includes('alumno&tutor'));
    }, [user]);

    // Determinar si el usuario tiene rol de estudiante
    const isStudent = useMemo(() => {
        return user && (user.roles.includes('estudiante') || user.roles.includes('alumno') || user.roles.includes('alumno&tutor'));
    }, [user]);

    // Estados principales
    const [reservas, setReservas] = useState([]);
    const [activeTab, setActiveTab] = useState(isStudent ? 'estudiante' : 'tutor');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estados para acciones de confirmación
    const [confirmActionId, setConfirmActionId] = useState(null);
    const [actionType, setActionType] = useState(null); // 'cancel', 'confirm', 'complete'

    // Estados para el modal de Jitsi Meet
    const [showJitsiModal, setShowJitsiModal] = useState(false);
    const [activeJitsiRoom, setActiveJitsiRoom] = useState(null);
    const [activeReserva, setActiveReserva] = useState(null);

    useEffect(() => {
        fetchReservas();
    }, [activeTab]);

    const fetchReservas = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (activeTab === 'estudiante') {
                // Obtener reservas como estudiante
                response = await ApiService.fetchReservasDetalladasByEstudiante();
            } else {
                // Obtener reservas como tutor
                response = await ApiService.fetchReservasDetalladasByTutor();
            }

            if (response.success) {
                // Ordenar reservas: primero pendientes y confirmadas, luego por fecha más cercana
                const sortedReservas = response.data.sort((a, b) => {
                    // Primero ordenar por estado
                    const estadoOrder = { 'pendiente': 0, 'confirmada': 1, 'completada': 2, 'cancelada': 3 };
                    if (estadoOrder[a.estado] !== estadoOrder[b.estado]) {
                        return estadoOrder[a.estado] - estadoOrder[b.estado];
                    }

                    // Luego ordenar por fecha
                    const dateA = new Date(a.fecha + 'T' + a.hora_inicio);
                    const dateB = new Date(b.fecha + 'T' + b.hora_inicio);
                    return dateA - dateB;
                });

                setReservas(sortedReservas);
            } else {
                throw new Error(response.message || 'Error al obtener reservas');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error fetching reservas:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelReserva = async (id) => {
        await handleReservaAction(id, 'cancelar');
    };

    const handleConfirmReserva = async (id) => {
        await handleReservaAction(id, 'confirmar');
    };

    const handleCompleteReserva = async (id) => {
        await handleReservaAction(id, 'completar');
    };

    const handleReservaAction = async (id, action) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setConfirmActionId(null);
        setActionType(null);

        try {
            let response;
            let successMessage;

            switch (action) {
                case 'cancelar':
                    response = await ApiService.updateReserva(id, { estado: 'cancelada' });
                    successMessage = "Reserva cancelada correctamente";
                    break;
                case 'confirmar':
                    response = await ApiService.updateReserva(id, { estado: 'confirmada' });
                    successMessage = "Reserva confirmada correctamente";
                    break;
                case 'completar':
                    response = await ApiService.updateReserva(id, { estado: 'completada' });
                    successMessage = "Reserva marcada como completada correctamente";
                    break;
                default:
                    throw new Error('Acción no reconocida');
            }

            if (response.success) {
                setSuccess(successMessage);

                // Actualizar la lista de reservas
                fetchReservas();

                // Limpiar mensaje después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(response.message || `Error al ${action} la reserva`);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error(`Error ${action} reserva:`, err);
        } finally {
            setIsLoading(false);
        }
    };


    const startVideoCall = (reserva) => {
        if (!reserva.sala_virtual) {
            setError("No hay sala virtual disponible para esta reserva.");
            return;
        }
        let roomUrl = reserva.sala_virtual;
        if (!roomUrl.startsWith('http')) {
            roomUrl = `https://meet.jit.si/${roomUrl}`;
        }

        console.log("Abriendo sala virtual:", roomUrl);
        setActiveJitsiRoom(roomUrl);
        setActiveReserva(reserva);
        setShowJitsiModal(true);
    };

    const closeVideoCall = () => {
        console.log("Cerrando videollamada");
        setShowJitsiModal(false);
        setTimeout(() => {
            setActiveJitsiRoom(null);
            setActiveReserva(null);
        }, 300);
    };

    const formatDateTime = (date, time) => {
        const formattedDate = new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `${formattedDate} - ${time}`;
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'pendiente':
                return (
                    <span className="badge bg-warning text-dark">
                        <i className="bi bi-hourglass me-1"></i>
                        Pendiente
                    </span>
                );
            case 'confirmada':
                return (
                    <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Confirmada
                    </span>
                );
            case 'completada':
                return (
                    <span className="badge bg-info">
                        <i className="bi bi-check-square me-1"></i>
                        Completada
                    </span>
                );
            case 'cancelada':
                return (
                    <span className="badge bg-danger">
                        <i className="bi bi-x-circle me-1"></i>
                        Cancelada
                    </span>
                );
            default:
                return <span className="badge bg-secondary">Desconocido</span>;
        }
    };

    const canCancelReserva = (reserva) => {
        // Solo se pueden cancelar reservas pendientes o confirmadas
        // Y solo si la fecha/hora no ha pasado
        if (reserva.estado !== 'pendiente' && reserva.estado !== 'confirmada') {
            return false;
        }

        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
        const now = new Date();

        // Permitir cancelar hasta 2 horas antes
        const hoursBeforeLimit = 2;
        const limitTime = new Date(reservaDateTime.getTime() - (hoursBeforeLimit * 60 * 60 * 1000));

        return now < limitTime;
    };

    const canConfirmReserva = (reserva) => {
        // Solo los tutores pueden confirmar reservas pendientes
        return activeTab === 'tutor' && reserva.estado === 'pendiente';
    };

    const canCompleteReserva = (reserva) => {
        // Solo los tutores pueden marcar como completadas las reservas confirmadas
        if (activeTab !== 'tutor' || reserva.estado !== 'confirmada') {
            return false;
        }

        // Solo se puede marcar como completada si ya pasó la hora
        const reservaEndTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const now = new Date();

        return now > reservaEndTime;
    };

    const isPastReserva = (reserva) => {
        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const now = new Date();
        return now > reservaDateTime;
    };

    const canJoinVideoCall = (reserva) => {
        // Verificar si la reserva es virtual y está confirmada
        if (
            reserva.estado !== 'confirmada' ||
            !reserva.sala_virtual ||
            !(reserva.servicio?.modalidad === 'virtual' || reserva.servicio?.modalidad === 'ambas')
        ) {
            return false;
        }

        // Verificar si está dentro del rango de tiempo (15 minutos antes hasta 15 minutos después)
        /*const reservaStartTime = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
        const reservaEndTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const bufferBefore = new Date(reservaStartTime.getTime() - 15 * 60 * 1000); // 15 min antes
        const bufferAfter = new Date(reservaEndTime.getTime() + 15 * 60 * 1000); // 15 min después
        const now = new Date();

        return now >= bufferBefore && now <= bufferAfter;*/
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Renderizar el modal de Jitsi Meet
    // En AlumnoReservas.jsx

// Renderizar el modal de Jitsi Meet
    // Renderizar el modal de Jitsi Meet
    const renderJitsiModal = () => {
        if (!showJitsiModal || !activeJitsiRoom || !activeReserva) return null;

        return (
            <div
                className="modal show d-block"
                tabIndex="-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {activeReserva.materia?.nombre ?
                                    `Tutoría: ${activeReserva.materia.nombre}` :
                                    `Sala Virtual #${activeReserva.id}`}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeVideoCall}
                            ></button>
                        </div>
                        <div className="modal-body p-0" style={{ height: '500px', overflow: 'hidden' }}>
                            <JitsiMeetRoom
                                roomUrl={activeJitsiRoom}
                                displayName={`${user.nombre} ${user.apellido}`}
                                onClose={closeVideoCall}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid px-3 py-2">
            {/* Agrego mb-5 pb-5 para espacio en la parte inferior para que no se solape con el HomeBar */}
            <div className="card shadow card-main mb-5 pb-5">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">
                            {activeTab === 'estudiante' ? 'Mis Reservas de Tutorías' : 'Gestión de Tutorías'}
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
                    {/* Tabs para usuario con ambos roles */}
                    {isTutor && isStudent && (
                        <div className="mb-4">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'estudiante' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('estudiante')}
                                    >
                                        <i className="bi bi-person me-2"></i>
                                        Como Estudiante
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'tutor' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('tutor')}
                                    >
                                        <i className="bi bi-mortarboard me-2"></i>
                                        Como Tutor
                                    </button>
                                </li>
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

                    {/* Sección de reservas */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-calendar-check me-2 text-primary"></i>
                            {activeTab === 'estudiante' ? 'Mis reservas' : 'Reservas recibidas'}
                        </h2>

                        <div className="reservas-container">
                            {isLoading ? (
                                <div className="d-flex justify-content-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : reservas.length > 0 ? (
                                <div className="row g-3">
                                    {reservas.map((reserva) => (
                                        <div key={reserva.id} className="col-12 col-md-6 col-lg-4">
                                            <div className={`materia-card ${isPastReserva(reserva) ? 'opacity-75' : ''}`}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h3 className="materia-title">
                                                            {reserva.materia?.nombre || `Tutoría #${reserva.id}`}
                                                        </h3>
                                                        <div className="mb-1">
                                                            {getEstadoBadge(reserva.estado)}
                                                        </div>
                                                    </div>

                                                    {/* Botones de acción según rol y estado */}
                                                    <div>
                                                        {/* Cancelar reserva (estudiante o tutor) */}
                                                        {canCancelReserva(reserva) && (
                                                            <div>
                                                                {(confirmActionId === reserva.id && actionType === 'cancel') ? (
                                                                    <div className="d-flex gap-1">
                                                                        <button
                                                                            className="btn btn-sm btn-danger"
                                                                            onClick={() => handleCancelReserva(reserva.id)}
                                                                            title="Confirmar cancelación"
                                                                        >
                                                                            <i className="bi bi-check"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => {
                                                                                setConfirmActionId(null);
                                                                                setActionType(null);
                                                                            }}
                                                                            title="Cancelar"
                                                                        >
                                                                            <i className="bi bi-x"></i>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        className="btn-remove-materia"
                                                                        onClick={() => {
                                                                            setConfirmActionId(reserva.id);
                                                                            setActionType('cancel');
                                                                        }}
                                                                        title="Cancelar reserva"
                                                                    >
                                                                        <i className="bi bi-x-circle"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Confirmar reserva (solo tutor) */}
                                                        {canConfirmReserva(reserva) && (
                                                            <div className="mt-2">
                                                                {(confirmActionId === reserva.id && actionType === 'confirm') ? (
                                                                    <div className="d-flex gap-1">
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={() => handleConfirmReserva(reserva.id)}
                                                                            title="Confirmar tutoría"
                                                                        >
                                                                            <i className="bi bi-check"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => {
                                                                                setConfirmActionId(null);
                                                                                setActionType(null);
                                                                            }}
                                                                            title="Cancelar"
                                                                        >
                                                                            <i className="bi bi-x"></i>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-success"
                                                                        onClick={() => {
                                                                            setConfirmActionId(reserva.id);
                                                                            setActionType('confirm');
                                                                        }}
                                                                        title="Confirmar reserva"
                                                                    >
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        Confirmar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Marcar como completada (solo tutor) */}
                                                        {canCompleteReserva(reserva) && (
                                                            <div className="mt-2">
                                                                {(confirmActionId === reserva.id && actionType === 'complete') ? (
                                                                    <div className="d-flex gap-1">
                                                                        <button
                                                                            className="btn btn-sm btn-info"
                                                                            onClick={() => handleCompleteReserva(reserva.id)}
                                                                            title="Marcar como completada"
                                                                        >
                                                                            <i className="bi bi-check"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => {
                                                                                setConfirmActionId(null);
                                                                                setActionType(null);
                                                                            }}
                                                                            title="Cancelar"
                                                                        >
                                                                            <i className="bi bi-x"></i>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-info"
                                                                        onClick={() => {
                                                                            setConfirmActionId(reserva.id);
                                                                            setActionType('complete');
                                                                        }}
                                                                        title="Marcar como completada"
                                                                    >
                                                                        <i className="bi bi-check-square me-1"></i>
                                                                        Completada
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="reserva-details">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="bi bi-calendar me-2 text-primary"></i>
                                                        <span>{formatDateTime(reserva.fecha, reserva.hora_inicio)}</span>
                                                    </div>

                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="bi bi-clock me-2 text-primary"></i>
                                                        <span>{reserva.hora_inicio} - {reserva.hora_fin}</span>
                                                    </div>

                                                    {/* Información del tutor o estudiante dependiendo del rol activo */}
                                                    {activeTab === 'estudiante' && reserva.tutor && (
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="bi bi-person me-2 text-primary"></i>
                                                            <span>Tutor: {reserva.tutor.nombre} {reserva.tutor.apellido}</span>
                                                        </div>
                                                    )}

                                                    {activeTab === 'tutor' && reserva.estudiante && (
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="bi bi-person me-2 text-primary"></i>
                                                            <span>Estudiante: {reserva.estudiante.nombre} {reserva.estudiante.apellido}</span>
                                                        </div>
                                                    )}

                                                    {/* Información del precio */}
                                                    {reserva.servicio && reserva.servicio.precio && (
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="bi bi-currency-dollar me-2 text-primary"></i>
                                                            <span>Precio: ${reserva.servicio.precio}</span>
                                                        </div>
                                                    )}

                                                    {/* Modalidad */}
                                                    {reserva.servicio && reserva.servicio.modalidad && (
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className={`bi ${reserva.servicio.modalidad === 'presencial' ? 'bi-building' : 'bi-laptop'} me-2 text-primary`}></i>
                                                            <span>Modalidad: {reserva.servicio.modalidad.charAt(0).toUpperCase() + reserva.servicio.modalidad.slice(1)}</span>
                                                        </div>
                                                    )}

                                                    {reserva.servicio &&
                                                        (reserva.servicio.modalidad === 'virtual') &&
                                                        reserva.estado === 'confirmada' && (
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="bi bi-camera-video me-2 text-primary"></i>
                                                                {reserva.sala_virtual ? (
                                                                    <div className="sala-virtual-container">
                                                                        <span>Sala Virtual: </span>
                                                                        <div className="mt-1">
                                                                            {/* Siempre mostrar el botón habilitado */}
                                                                            <button
                                                                                className="btn btn-sm btn-primary me-1"
                                                                                onClick={() => startVideoCall(reserva)}
                                                                            >
                                                                                <i className="bi bi-camera-video-fill me-1"></i>
                                                                                Iniciar Videollamada
                                                                            </button>
                                                                            <a
                                                                                href={reserva.sala_virtual}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                title="Abrir en nueva pestaña"
                                                                            >
                                                                                <i className="bi bi-box-arrow-up-right"></i>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted">Sala pendiente de configuración</span>
                                                                )}
                                                            </div>
                                                        )}

                                                    {/* Notas de la reserva */}
                                                    {reserva.notas && (
                                                        <div className="mt-2">
                                                            <h4 className="fs-6 fw-bold mb-1">Notas:</h4>
                                                            <p className="materia-description">{reserva.notas}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="bi bi-calendar-x-fill empty-state-icon"></i>
                                    <p>{activeTab === 'estudiante' ? 'No tienes reservas de tutorías' : 'No tienes reservas pendientes'}</p>
                                    <p className="text-muted">
                                        {activeTab === 'estudiante'
                                            ? 'Explora los servicios disponibles y realiza una reserva'
                                            : 'Cuando los estudiantes reserven tus tutorías, aparecerán aquí'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nota informativa según el rol activo */}
                    {activeTab === 'estudiante' ? (
                        <div className="alert alert-info mt-4">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <strong>Información:</strong> Las reservas solo pueden cancelarse hasta 2 horas antes del horario programado.
                            {/* Nueva nota sobre videollamadas */}
                            <div className="mt-1">
                                Para las tutorías virtuales, la videollamada estará disponible 15 minutos antes y después del horario reservado.
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-4">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <strong>Información:</strong> Como tutor, puedes confirmar o cancelar las reservas pendientes. Una vez finalizada la tutoría, puedes marcarla como completada.
                            {/* Nueva nota sobre videollamadas */}
                            <div className="mt-1">
                                Las salas virtuales se generan automáticamente al confirmar una tutoría con modalidad virtual.
                            </div>
                        </div>
                    )}

                    {/* Espacio adicional para evitar que el HomeBar tape contenido */}
                    <div className="mt-5 pt-3">
                        {/* Espacio reservado para el HomeBar */}
                    </div>
                </div>
            </div>

            {/* Renderizar el modal de Jitsi Meet cuando sea necesario */}
            {renderJitsiModal()}
        </div>
    );
};

export default AlumnoReservas;