import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import '../../commonTables.css';
import ReservaCard from './ReservaCard';
import PaymentModal from './PaymentModal';
import VideoCallModal from './VideoCallModal';
import CalificacionModal from './CalificacionModal';

const ReservasContainer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    // Role determinations
    const isTutor = useMemo(() => {
        return user && (user.roles.includes('tutor') || user.roles.includes('alumno&tutor'));
    }, [user]);

    const isStudent = useMemo(() => {
        return user && (user.roles.includes('estudiante') || user.roles.includes('alumno') || user.roles.includes('alumno&tutor'));
    }, [user]);

    // Main states
    const [reservas, setReservas] = useState([]);
    const [activeTab, setActiveTab] = useState(isStudent ? 'estudiante' : 'tutor');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Confirmation states
    const [confirmActionId, setConfirmActionId] = useState(null);
    const [actionType, setActionType] = useState(null);
    //Dates
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 7);
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        const fechaHasta = new Date();
        fechaHasta.setDate(fechaHasta.getDate() + 14); // 14 days in the future
        return fechaHasta.toISOString().split('T')[0];
    });
    // Modal states
    const [showJitsiModal, setShowJitsiModal] = useState(false);
    const [activeJitsiRoom, setActiveJitsiRoom] = useState(null);
    const [activeReserva, setActiveReserva] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentReserva, setCurrentReserva] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [reservaPagos, setReservaPagos] = useState({});

    // New state for rating modal
    const [showCalificacionModal, setShowCalificacionModal] = useState(false);
    const [reservaToRate, setReservaToRate] = useState(null);

    useEffect(() => {
        fetchReservas();
    }, [activeTab]);

    useEffect(() => {
        // Handle payment return parameters
        const paymentStatus = searchParams.get('payment_status');
        const reservaId = searchParams.get('reserva_id');
        const paymentError = searchParams.get('payment_error');

        if (paymentStatus) {
            if (paymentStatus === 'approved') {
                setSuccess("¡Pago completado con éxito! La información se actualizará en unos segundos.");
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
                response = await ApiService.fetchReservasDetalladasByEstudiante(fechaDesde,fechaHasta);

                if (response.success) {
                    // Sort reservations
                    const sortedReservas = response.data.sort((a, b) => {
                        const estadoOrder = { 'pendiente': 0, 'confirmada': 1, 'completada': 2, 'cancelada': 3 };
                        if (estadoOrder[a.estado] !== estadoOrder[b.estado]) {
                            return estadoOrder[a.estado] - estadoOrder[b.estado];
                        }

                        const dateA = new Date(a.fecha + 'T' + a.hora_inicio);
                        const dateB = new Date(b.fecha + 'T' + b.hora_inicio);
                        return dateA - dateB;
                    });

                    // Primero configuramos las reservas
                    setReservas(sortedReservas);

                    // Luego cargamos pagos y calificaciones, y actualizamos las reservas
                    await fetchAllPagosAndCalificaciones();
                } else {
                    throw new Error(response.message || 'Error al obtener reservas');
                }
            } else {
                response = await ApiService.fetchReservasDetalladasByTutor(fechaDesde,fechaHasta);

                if (response.success) {
                    // Sort reservations
                    const sortedReservas = response.data.sort((a, b) => {
                        const estadoOrder = { 'pendiente': 0, 'confirmada': 1, 'completada': 2, 'cancelada': 3 };
                        if (estadoOrder[a.estado] !== estadoOrder[b.estado]) {
                            return estadoOrder[a.estado] - estadoOrder[b.estado];
                        }

                        const dateA = new Date(a.fecha + 'T' + a.hora_inicio);
                        const dateB = new Date(b.fecha + 'T' + b.hora_inicio);
                        return dateA - dateB;
                    });

                    setReservas(sortedReservas);

                    // También cargamos los pagos para el tutor
                    await fetchPagosByTutor();
                } else {
                    throw new Error(response.message || 'Error al obtener reservas');
                }
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error fetching reservas:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Nuevo método para obtener los pagos cuando estamos en rol de tutor
    const fetchPagosByTutor = async () => {
        try {
            const pagosResponse = await ApiService.fetchPagosByTutor();
            if (pagosResponse.success) {
                console.log("Pagos del tutor:", pagosResponse.data);
                setReservaPagos(pagosResponse.data);
            }
        } catch (err) {
            console.error("Error fetching pagos for tutor:", err);
        }
    };

    // Nuevo método para obtener todos los pagos y calificaciones de una vez
    const fetchAllPagosAndCalificaciones = async () => {
        try {
            // Obtener todos los pagos para las reservas del estudiante
            const pagosResponse = await ApiService.fetchPagosByEstudiante();
            if (pagosResponse.success) {
                setReservaPagos(pagosResponse.data);
            }

            // Obtener todas las calificaciones para las reservas del estudiante
            const calificacionesResponse = await ApiService.getCalificacionesForEstudianteReservas();
            if (calificacionesResponse.success) {
                // Guardar los IDs de las reservas que ya tienen calificación
                const reservasCalificadas = Object.keys(calificacionesResponse.data).map(id => parseInt(id));
                console.log("Reservas calificadas:", reservasCalificadas);

                // Explícitamente marcar cada reserva como calificada o no
                setReservas(prevReservas => {
                    const updatedReservas = prevReservas.map(reserva => {
                        const isCalificada = reservasCalificadas.includes(reserva.id);
                        return {
                            ...reserva,
                            calificado: isCalificada
                        };
                    });
                    return updatedReservas;
                });
            }
        } catch (err) {
            console.error("Error fetching pagos and calificaciones:", err);
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

    // Esta función ya no se utiliza para verificar cada reserva individualmente
    // Pero la mantenemos para posibles usos específicos
    const checkCalificacion = async (reservaId) => {
        try {
            const response = await ApiService.getCalificacionByReserva(reservaId);
            if (response.success) {
                // Update reservas to mark as already rated
                setReservas(prevReservas =>
                    prevReservas.map(reserva =>
                        reserva.id === reservaId
                            ? { ...reserva, calificado: true }
                            : reserva
                    )
                );
            }
        } catch (err) {
            console.error(`Error checking calificacion for reserva ${reservaId}:`, err);
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
                fetchReservas();
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

    const handlePaymentModal = (reserva) => {
        setCurrentReserva(reserva);
        setShowPaymentModal(true);
    };

    const handleProcessPayment = async (reserva, method) => {
        setIsProcessingPayment(true);
        setError(null);

        try {
            const pagoData = {
                reserva_id: reserva.id,
                monto: reserva.servicio.precio,
                metodo_pago: method
            };

            const response = await ApiService.createPago(pagoData);

            if (response.success) {
                if (method === 'mercado_pago' && response.data.payment_url) {
                    window.open(response.data.payment_url, '_blank');
                }

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

    // New function to open the rating modal
    const handleOpenRatingModal = (reserva) => {
        setReservaToRate(reserva);
        setShowCalificacionModal(true);
    };

    // New function to submit rating
    const handleSubmitRating = async (rating, comment) => {
        if (!reservaToRate) return;

        try {
            const calificacionData = {
                reserva_id: reservaToRate.id,
                calificador_id: user.id,  // Current user as calificador
                calificado_id: reservaToRate.tutor.id,  // Rating the tutor
                puntuacion: rating,
                comentario: comment
            };

            const response = await ApiService.createCalificacion(calificacionData);

            if (response.success) {
                setSuccess("Calificación enviada correctamente");

                // Update the reserva to show it's been rated
                setReservas(prevReservas =>
                    prevReservas.map(reserva =>
                        reserva.id === reservaToRate.id
                            ? { ...reserva, calificado: true }
                            : reserva
                    )
                );

                console.log(`Reserva ${reservaToRate.id} marcada como calificada`);

                // Also update the local state to immediately show the change
                reservaToRate.calificado = true;
            } else {
                throw new Error(response.message || 'Error enviando calificación');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error enviando calificación:", err);
        } finally {
            setShowCalificacionModal(false);
            setReservaToRate(null);
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

        setActiveJitsiRoom(roomUrl);
        setActiveReserva(reserva);
        setShowJitsiModal(true);
    };

    const closeVideoCall = () => {
        setShowJitsiModal(false);
        setTimeout(() => {
            setActiveJitsiRoom(null);
            setActiveReserva(null);
        }, 300);
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Reservation state verification functions
    const canCancelReserva = (reserva) => {
        if (reserva.estado !== 'pendiente' && reserva.estado !== 'confirmada') {
            return false;
        }

        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
        const now = new Date();
        const hoursBeforeLimit = 2;
        const limitTime = new Date(reservaDateTime.getTime() - (hoursBeforeLimit * 60 * 60 * 1000));

        return now < limitTime;
    };

    const canConfirmReserva = (reserva) => {
        return activeTab === 'tutor' && reserva.estado === 'pendiente';
    };

    const canCompleteReserva = (reserva) => {
        return activeTab === 'tutor' && reserva.estado === 'confirmada';
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
        if (activeTab !== 'tutor' || reserva.estado !== 'completada') {
            return false;
        }

        const pago = reservaPagos[reserva.id];
        return pago && pago.metodo_pago === 'efectivo' && pago.estado === 'pendiente';
    };

    const canRateReserva = (reserva) => {

        if (activeTab !== 'estudiante' || reserva.estado !== 'completada') {
            return false;
        }

        // Solo se pueden calificar reservas con pago completado
        const pago = reservaPagos[reserva.id];
        if (!pago || pago.estado !== 'completado') {
            return false;
        }

        // No se puede calificar si ya tiene calificación
        return reserva.calificado !== true;
    };

    const isPastReserva = (reserva) => {
        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const now = new Date();
        return now > reservaDateTime;
    };

    return (
        <div className="container-fluid px-3 py-2">
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
                    {/* Tabs for user with both roles */}
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

                    {/* Error/success messages */}
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

                    {/* Reservations section */}
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
                                        <ReservaCard
                                            key={reserva.id}
                                            reserva={reserva}
                                            activeTab={activeTab}
                                            reservaPagos={reservaPagos}
                                            isPastReserva={isPastReserva(reserva)}
                                            canCancelReserva={canCancelReserva(reserva)}
                                            canConfirmReserva={canConfirmReserva(reserva)}
                                            canCompleteReserva={canCompleteReserva(reserva)}
                                            canPayReserva={canPayReserva(reserva)}
                                            canConfirmEfectivoPago={canConfirmEfectivoPago(reserva)}
                                            canRateReserva={canRateReserva(reserva)}
                                            confirmActionId={confirmActionId}
                                            actionType={actionType}
                                            setConfirmActionId={setConfirmActionId}
                                            setActionType={setActionType}
                                            handleCancelReserva={handleCancelReserva}
                                            handleConfirmReserva={handleConfirmReserva}
                                            handleCompleteReserva={handleCompleteReserva}
                                            handlePaymentModal={handlePaymentModal}
                                            handleConfirmEfectivoPago={handleConfirmEfectivoPago}
                                            handleOpenRatingModal={handleOpenRatingModal}
                                            startVideoCall={startVideoCall}
                                        />
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

                    {/* Informative note based on active role */}
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
                            <div className="mt-1">
                                Después del pago, puedes calificar la tutoría para compartir tu experiencia.
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-4">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <strong>Información:</strong> Como tutor, puedes confirmar o cancelar las reservas pendientes. Una vez finalizada la tutoría, márcala como completada.
                            <div className="mt-1">
                                Si el estudiante paga en efectivo, deberás registrar y confirmar el pago manualmente.
                            </div>
                            <div className="mt-1">
                                Las calificaciones de los estudiantes afectan tu puntuación promedio visible en tu perfil.
                            </div>
                        </div>
                    )}

                    {/* Additional space to prevent HomeBar from covering content */}
                    <div className="mt-5 pt-3">
                        {/* Space reserved for HomeBar */}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showJitsiModal && activeJitsiRoom && activeReserva && (
                <VideoCallModal
                    showModal={showJitsiModal}
                    roomUrl={activeJitsiRoom}
                    reserva={activeReserva}
                    user={user}
                    onClose={closeVideoCall}
                />
            )}

            {showPaymentModal && currentReserva && (
                <PaymentModal
                    showModal={showPaymentModal}
                    reserva={currentReserva}
                    activeTab={activeTab}
                    isProcessing={isProcessingPayment}
                    onClose={() => setShowPaymentModal(false)}
                    onProcessPayment={handleProcessPayment}
                />
            )}

            {showCalificacionModal && reservaToRate && (
                <CalificacionModal
                    showModal={showCalificacionModal}
                    reserva={reservaToRate}
                    onClose={() => {
                        setShowCalificacionModal(false);
                        setReservaToRate(null);
                    }}
                    onSubmitRating={handleSubmitRating}
                />
            )}
        </div>
    );
};

export default ReservasContainer;