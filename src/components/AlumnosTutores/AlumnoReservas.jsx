import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import JitsiMeetRoom from '../../JitsiMeetRom/JitsiMeetRoom.jsx';
import '../../commonTables.css';
import { useSearchParams } from 'react-router-dom';

const AlumnoReservas = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
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
    const [actionType, setActionType] = useState(null); // 'cancel', 'confirm', 'complete', 'pay'

    // Estados para el modal de Jitsi Meet
    const [showJitsiModal, setShowJitsiModal] = useState(false);
    const [activeJitsiRoom, setActiveJitsiRoom] = useState(null);
    const [activeReserva, setActiveReserva] = useState(null);

    // Estado para el modal de pago
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentReserva, setCurrentReserva] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [reservaPagos, setReservaPagos] = useState({});  // Para almacenar el estado de pago de las reservas

    useEffect(() => {
        fetchReservas();
    }, [activeTab]);
    useEffect(() => {
        // Obtener parámetros de la URL
        const paymentStatus = searchParams.get('payment_status');
        const reservaId = searchParams.get('reserva_id');
        const paymentError = searchParams.get('payment_error');

        if (paymentStatus) {
            console.log(`Retorno de pago detectado: status=${paymentStatus}, reservaId=${reservaId}`);

            // Mostrar mensaje según el resultado
            if (paymentStatus === 'approved') {
                setSuccess("¡Pago completado con éxito! La información se actualizará en unos segundos.");
                // Actualizar los datos
                fetchReservas();
                if (reservaId) {
                    fetchPagoByReserva(parseInt(reservaId));
                }
            }
            else if (paymentStatus === 'pending') {
                setSuccess("El pago está en proceso. Se te notificará cuando se confirme.");
                fetchReservas();
            }
            else {
                setError("El pago no se completó. Por favor, intenta nuevamente.");
                fetchReservas();
            }

            // Limpiar la URL para evitar mostrar el mensaje múltiples veces
            navigate('/reservas', { replace: true });
        }

        if (paymentError) {
            setError("Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.");
            navigate('/reservas', { replace: true });
        }
    }, [searchParams, navigate]);
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

                // Obtener información de pagos para las reservas
                for (const reserva of sortedReservas) {
                    if (reserva.estado === 'completada') {
                        fetchPagoByReserva(reserva.id);
                    }
                }
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

    const fetchPagoByReserva = async (reservaId) => {
        try {
            const response = await ApiService.fetchPagoByReserva(reservaId);
            if (response.success) {
                setReservaPagos(prevState => ({
                    ...prevState,
                    [reservaId]: response.data
                }));
            }
        } catch (err) {
            console.error(`Error fetching pago for reserva ${reservaId}:`, err);
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

    // Función para mostrar el modal de pago
    const handlePaymentModal = (reserva) => {
        setCurrentReserva(reserva);
        setShowPaymentModal(true);
    };

    // Función para procesar el pago
    const handleProcessPayment = async (reserva, method) => {
        setIsProcessingPayment(true);
        setError(null);

        try {
            // Crear objeto de pago
            const pagoData = {
                reserva_id: reserva.id,
                monto: reserva.servicio.precio,
                metodo_pago: method
            };

            const response = await ApiService.createPago(pagoData);

            if (response.success) {
                // Si es pago con mercado_pago, redirigir a la URL de pago
                if (method === 'mercado_pago' && response.data.payment_url) {
                    window.open(response.data.payment_url, '_blank');
                }

                // Actualizar la lista de reservas y pagos
                await fetchReservas();
                await fetchPagoByReserva(reserva.id);

                setSuccess(`Pago ${method === 'efectivo' ? 'registrado' : 'iniciado'} correctamente`);
            } else {
                throw new Error(response.message || 'Error procesando el pago');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error procesando pago:", err);
        } finally {
            setIsProcessingPayment(false);
            setShowPaymentModal(false);
        }
    };

    // Función para actualizar el estado de un pago en efectivo (solo para tutores)
    const handleConfirmEfectivoPago = async (pagoId) => {
        setIsProcessingPayment(true);
        setError(null);

        try {
            const response = await ApiService.updatePagoEstado(pagoId, 'completado');

            if (response.success) {
                await fetchReservas();
                setSuccess("Pago confirmado correctamente");
            } else {
                throw new Error(response.message || 'Error confirmando el pago');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error confirmando pago:", err);
        } finally {
            setIsProcessingPayment(false);
            setConfirmActionId(null);
            setActionType(null);
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

    const getEstadoPagoBadge = (pago) => {
        if (!pago) return null;

        switch (pago.estado) {
            case 'completado':
                return (
                    <span className="badge bg-success">
                        <i className="bi bi-cash-coin me-1"></i>
                        Pagado
                    </span>
                );
            case 'pendiente':
                return (
                    <span className="badge bg-warning text-dark">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Pago Pendiente
                    </span>
                );
            case 'cancelado':
                return (
                    <span className="badge bg-danger">
                        <i className="bi bi-x-circle me-1"></i>
                        Pago Cancelado
                    </span>
                );
            default:
                return null;
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
        return activeTab === 'tutor' && reserva.estado === 'pendiente';
    };

    const canCompleteReserva = (reserva) => {
        // Solo tutores pueden completar reservas confirmadas
        if (activeTab !== 'tutor' || reserva.estado !== 'confirmada') {
            return false;
        }

        // Verificamos que la reserva esté en estado confirmada
        // Ya no verificamos si la hora de fin ha pasado - permitimos completar en cualquier momento
        // después de que la reserva esté confirmada
        return true;  // Si es tutor y la reserva está confirmada, puede completarla
    };

    const canPayReserva = (reserva) => {
        if (activeTab !== 'estudiante' || reserva.estado !== 'completada') {
            return false;
        }
        const pago = reservaPagos[reserva.id];
        if (pago && pago.estado === 'completado') {
            return false;
        }

        return true;
    };

    const canConfirmEfectivoPago = (reserva) => {
        // Solo tutores pueden confirmar pagos en efectivo pendientes
        if (activeTab !== 'tutor' || reserva.estado !== 'completada') {
            return false;
        }

        // Verificar si hay un pago en efectivo pendiente
        const pago = reservaPagos[reserva.id];
        return pago && pago.metodo_pago === 'efectivo' && pago.estado === 'pendiente';
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
        const reservaStartTime = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
        const reservaEndTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const bufferBefore = new Date(reservaStartTime.getTime() - 15 * 60 * 1000); // 15 min antes
        const bufferAfter = new Date(reservaEndTime.getTime() + 15 * 60 * 1000); // 15 min después
        const now = new Date();

        return now >= bufferBefore && now <= bufferAfter;
    };

    const handleBack = () => {
        navigate(-1);
    };

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

    // Renderizar el modal de pago
    const renderPaymentModal = () => {
        if (!showPaymentModal || !currentReserva) return null;

        return (
            <div
                className="modal show d-block"
                tabIndex="-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Selecciona método de pago</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowPaymentModal(false)}
                                disabled={isProcessingPayment}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <p className="fw-bold">Tutoría: {currentReserva.materia?.nombre || `#${currentReserva.id}`}</p>
                            <p>Fecha: {formatDateTime(currentReserva.fecha, currentReserva.hora_inicio)}</p>
                            <p className="mb-4">Precio: ${currentReserva.servicio?.precio || 0}</p>

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleProcessPayment(currentReserva, 'mercado_pago')}
                                    disabled={isProcessingPayment}
                                >
                                    <i className="bi bi-credit-card me-2"></i>
                                    Pagar con Mercado Pago
                                </button>

                                {activeTab === 'tutor' && (
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleProcessPayment(currentReserva, 'efectivo')}
                                        disabled={isProcessingPayment}
                                    >
                                        <i className="bi bi-cash me-2"></i>
                                        Registrar pago en efectivo
                                    </button>
                                )}
                            </div>

                            {isProcessingPayment && (
                                <div className="text-center mt-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Procesando...</span>
                                    </div>
                                    <p className="mt-2">Procesando pago...</p>
                                </div>
                            )}
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
                                                            {/* Mostrar estado de pago si está completada */}
                                                            {reserva.estado === 'completada' && (
                                                                <span className="ms-2">
                                                                    {getEstadoPagoBadge(reservaPagos[reserva.id])}
                                                                </span>
                                                            )}
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

                                                        {/* Botón de pago (solo estudiante) */}
                                                        {canPayReserva(reserva) && (
                                                            <div className="mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => handlePaymentModal(reserva)}
                                                                    title="Realizar pago"
                                                                >
                                                                    <i className="bi bi-credit-card me-1"></i>
                                                                    Pagar ahora
                                                                </button>
                                                            </div>
                                                        )}
                                                        {/* Botón de pago (solo estudiante) */}
                                                        {canCompleteReserva(reserva) && (
                                                            <div className="mt-2">
                                                                {(confirmActionId === reserva.id && actionType === 'complete') ? (
                                                                    <div className="d-flex gap-1">
                                                                        <button
                                                                            className="btn btn-sm btn-success"
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
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => {
                                                                            setConfirmActionId(reserva.id);
                                                                            setActionType('complete');
                                                                        }}
                                                                        title="Marcar como completada"
                                                                    >
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        Completar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Confirmar pago en efectivo (solo tutor) */}
                                                        {canConfirmEfectivoPago(reserva) && (
                                                            <div className="mt-2">
                                                                {(confirmActionId === reserva.id && actionType === 'confirmpay') ? (
                                                                    <div className="d-flex gap-1">
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={() => handleConfirmEfectivoPago(reservaPagos[reserva.id].id)}
                                                                            title="Confirmar pago en efectivo"
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
                                                                            setActionType('confirmpay');
                                                                        }}
                                                                        title="Confirmar pago en efectivo"
                                                                    >
                                                                        <i className="bi bi-cash-coin me-1"></i>
                                                                        Confirmar pago
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

                                                    {/* Información de pago */}
                                                    {reserva.estado === 'completada' && reservaPagos[reserva.id] && (
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="bi bi-credit-card me-2 text-primary"></i>
                                                            <span>
                                                               Pago: {reservaPagos[reserva.id].metodo_pago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'} -
                                                                {reservaPagos[reserva.id].estado === 'completado' ? ' Pagado' :
                                                                    reservaPagos[reserva.id].estado === 'pendiente' ? ' Pendiente' : ' Cancelado'}
                                                           </span>
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
                            <div className="mt-1">
                                Para las tutorías virtuales, la videollamada estará disponible 15 minutos antes y después del horario reservado.
                            </div>
                            <div className="mt-1">
                                El pago puede realizarse una vez que la tutoría esté marcada como "Completada".
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-4">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <strong>Información:</strong> Como tutor, puedes confirmar o cancelar las reservas pendientes. Una vez finalizada la tutoría, márcala como completada.
                            <div className="mt-1">
                                Si el estudiante paga en efectivo, deberás registrar y confirmar el pago manualmente.
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

            {/* Renderizar el modal de pago cuando sea necesario */}
            {renderPaymentModal()}
        </div>
    );
};

export default AlumnoReservas;