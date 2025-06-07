import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEntidades } from '../../context/EntidadesContext.jsx';
import ApiService from '../../services/ApiService';
import '../../commonTables.css';
import ReservaCard from './ReservaCard';
import PaymentModal from './PaymentModal';
import VideoCallModal from './VideoCallModal';
import CalificacionModal from './CalificacionModal';
import DateRangeFilter from '../Dashboard/DateRangeFilter';
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx';

const ReservasContainer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { materias } = useEntidades();
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
    const [filteredReservas, setFilteredReservas] = useState([]);
    const [activeTab, setActiveTab] = useState(isStudent ? 'estudiante' : 'tutor');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // NEW: State for reserva actions
    const [reservaActions, setReservaActions] = useState({});

    // Confirmation states
    const [confirmActionId, setConfirmActionId] = useState(null);
    const [actionType, setActionType] = useState(null);

    // Filter states
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 20);
        return fechaDesde.toISOString().split('T')[0];
    });
    const [fechaHasta, setFechaHasta] = useState(() => {
        const fechaHasta = new Date();
        fechaHasta.setDate(fechaHasta.getDate() + 10);
        return fechaHasta.toISOString().split('T')[0];
    });
    const [materiaFilter, setMateriaFilter] = useState('');

    // Modal states
    const [showJitsiModal, setShowJitsiModal] = useState(false);
    const [activeJitsiRoom, setActiveJitsiRoom] = useState(null);
    const [activeReserva, setActiveReserva] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentReserva, setCurrentReserva] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [reservaPagos, setReservaPagos] = useState({});

    const [showCalificacionModal, setShowCalificacionModal] = useState(false);
    const [reservaToRate, setReservaToRate] = useState(null);

    // Funciones de validación existentes
    const isReservaExpired = (reserva) => {
        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const now = new Date();
        return now > reservaDateTime;
    };

    const getReservaStatus = (reserva, pago = null) => {
        const isExpired = isReservaExpired(reserva);
        if (isExpired && (reserva.estado === 'pendiente' || reserva.estado === 'confirmada')) {
            return 'expirada';
        }
        return reserva.estado;
    };

    const getPaymentWarning = (reserva, pago = null) => {
        if (activeTab !== 'estudiante' || reserva.estado !== 'completada') return null;

        const reservaDate = new Date(reserva.fecha);
        const now = new Date();
        const daysDiff = Math.floor((now - reservaDate) / (1000 * 60 * 60 * 24));

        if ((!pago || pago.estado === 'pendiente') && daysDiff > 3) {
            return {
                type: 'danger',
                message: `Pago pendiente hace ${daysDiff} días. Por favor, realiza el pago lo antes posible.`
            };
        }

        if ((!pago || pago.estado === 'pendiente') && daysDiff >= 1) {
            return {
                type: 'warning',
                message: `Pago pendiente hace ${daysDiff} día(s). Recuerda realizar el pago.`
            };
        }

        return null;
    };

    const canStartClass = (reserva) => {
        if (activeTab !== 'tutor' || reserva.estado !== 'confirmada') return false;

        const now = new Date();
        const reservaDate = new Date(reserva.fecha);
        const [horaInicio] = reserva.hora_inicio.split(':');
        const [horaFin] = reserva.hora_fin.split(':');

        const startTime = new Date(reservaDate);
        startTime.setHours(parseInt(horaInicio), 0, 0, 0);

        const endTime = new Date(reservaDate);
        endTime.setHours(parseInt(horaFin), 0, 0, 0);

        const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);

        return now >= allowStartTime && now <= endTime;
    };

    const getTimeUntilClass = (reserva) => {
        const now = new Date();
        const reservaDate = new Date(reserva.fecha);
        const [horaInicio] = reserva.hora_inicio.split(':');

        const startTime = new Date(reservaDate);
        startTime.setHours(parseInt(horaInicio), 0, 0, 0);

        const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
        const timeDiff = allowStartTime - now;

        if (timeDiff <= 0) return null;

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Function to fetch reserva actions
    const fetchReservaActions = async (reservaIds) => {
        if (!reservaIds || reservaIds.length === 0) {
            setReservaActions({});
            return;
        }

        try {
            const response = await ApiService.getReservasActions(reservaIds);
            if (response.success) {
                // Convert array to object keyed by reserva_id
                const actionsMap = {};
                response.data.forEach(action => {
                    actionsMap[action.reserva_id] = action;
                });
                setReservaActions(actionsMap);
            }
        } catch (err) {
            console.error("Error fetching reserva actions:", err);
            setReservaActions({});
        }
    };

    // Function to record video call action
    const recordVideoCallAction = async (reservaId) => {
        try {
            const response = await ApiService.recordVideoCallAction(reservaId);
            if (response.success) {
                // Update local state
                setReservaActions(prev => ({
                    ...prev,
                    [reservaId]: response.data
                }));
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error("Error recording video call action:", err);
            throw err;
        }
    };

    // Aplicar validaciones a las reservas
    const processReservasWithValidations = (reservasList) => {
        return reservasList.map(reserva => {
            const pago = reservaPagos[reserva.id];
            const actualStatus = getReservaStatus(reserva, pago);
            const paymentWarning = getPaymentWarning(reserva, pago);
            const canStart = canStartClass(reserva);
            const timeUntil = getTimeUntilClass(reserva);

            return {
                ...reserva,
                actualStatus,
                paymentWarning,
                canStartClass: canStart,
                timeUntilClass: timeUntil,
                isExpired: isReservaExpired(reserva)
            };
        });
    };

    useEffect(() => {
        fetchReservas();
    }, [activeTab]);

    useEffect(() => {
        filterReservasByMateria();
    }, [reservas, materiaFilter]);

    // NEW: Effect to fetch actions when reservas change
    useEffect(() => {
        if (reservas.length > 0) {
            const reservaIds = reservas.map(r => r.id);
            fetchReservaActions(reservaIds);
        }
    }, [reservas]);

    useEffect(() => {
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

    const fetchReservas = async (fromDate = fechaDesde, toDate = fechaHasta) => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (activeTab === 'estudiante') {
                response = await ApiService.fetchReservasDetalladasByEstudiante(fromDate, toDate);

                if (response.success) {
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
                    await fetchAllPagosAndCalificaciones();
                } else {
                    throw new Error(response.message || 'Error al obtener reservas');
                }
            } else {
                response = await ApiService.fetchReservasDetalladasByTutor(fromDate, toDate);

                if (response.success) {
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

    const filterReservasByMateria = () => {
        if (!materiaFilter) {
            setFilteredReservas(reservas);
        } else {
            const filtered = reservas.filter(reserva =>
                reserva.materia && reserva.materia.id.toString() === materiaFilter
            );
            setFilteredReservas(filtered);
        }
    };

    const handleFilterChange = () => {
        fetchReservas(fechaDesde, fechaHasta);
    };

    const resetDateRange = () => {
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 20);
        const newFechaDesde = fechaDesde.toISOString().split('T')[0];

        const fechaHasta = new Date();
        fechaHasta.setDate(fechaHasta.getDate() + 10);
        const newFechaHasta = fechaHasta.toISOString().split('T')[0];

        setFechaDesde(newFechaDesde);
        setFechaHasta(newFechaHasta);
        fetchReservas(newFechaDesde, newFechaHasta);
    };

    const resetMateriaFilter = () => {
        setMateriaFilter('');
    };

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

    const fetchAllPagosAndCalificaciones = async () => {
        try {
            const pagosResponse = await ApiService.fetchPagosByEstudiante();
            if (pagosResponse.success) {
                setReservaPagos(pagosResponse.data);
            }

            const calificacionesResponse = await ApiService.getCalificacionesForEstudianteReservas();
            if (calificacionesResponse.success) {
                const reservasCalificadas = Object.keys(calificacionesResponse.data).map(id => parseInt(id));
                console.log("Reservas calificadas:", reservasCalificadas);

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

    const handleOpenRatingModal = (reserva) => {
        setReservaToRate(reserva);
        setShowCalificacionModal(true);
    };

    const handleSubmitRating = async (rating, comment) => {
        if (!reservaToRate) return;

        try {
            const calificacionData = {
                reserva_id: reservaToRate.id,
                calificador_id: user.id,
                calificado_id: reservaToRate.tutor.id,
                puntuacion: rating,
                comentario: comment
            };

            const response = await ApiService.createCalificacion(calificacionData);

            if (response.success) {
                setSuccess("Calificación enviada correctamente");

                setReservas(prevReservas =>
                    prevReservas.map(reserva =>
                        reserva.id === reservaToRate.id
                            ? { ...reserva, calificado: true }
                            : reserva
                    )
                );

                console.log(`Reserva ${reservaToRate.id} marcada como calificada`);
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
        // Validar si puede iniciar la clase
        /*if (!reserva.canStartClass && activeTab === 'tutor') {
            const timeUntil = reserva.timeUntilClass;
            if (timeUntil) {
                setError(`No puedes iniciar la clase aún. Faltan ${timeUntil} para que puedas acceder.`);
                return;
            } else if (reserva.isExpired) {
                setError("Esta clase ya ha terminado. No puedes acceder a la sala virtual.");
                return;
            }
        }
*/
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

    // Funciones de validación de acciones actualizadas
    const canCancelReserva = (reserva) => {
        const actualStatus = reserva.actualStatus || reserva.estado;

        if (actualStatus !== 'pendiente' && actualStatus !== 'confirmada') {
            return false;
        }

        if (actualStatus === 'expirada') {
            return false;
        }

        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
        const now = new Date();
        const hoursBeforeLimit = 2;
        const limitTime = new Date(reservaDateTime.getTime() - (hoursBeforeLimit * 60 * 60 * 1000));

        return now < limitTime;
    };

    const canConfirmReserva = (reserva) => {
        const actualStatus = reserva.actualStatus || reserva.estado;
        return activeTab === 'tutor' && actualStatus === 'pendiente' && !reserva.isExpired;
    };

    const canCompleteReserva = (reserva) => {
        const actualStatus = reserva.actualStatus || reserva.estado;
        return activeTab === 'tutor' && actualStatus === 'confirmada' && !reserva.isExpired;
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

        const pago = reservaPagos[reserva.id];
        if (!pago || pago.estado !== 'completado') {
            return false;
        }

        return reserva.calificado !== true;
    };

    const isPastReserva = (reserva) => {
        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const now = new Date();
        return now > reservaDateTime;
    };

    // Procesar reservas con validaciones
    const processedReservas = useMemo(() => {
        return processReservasWithValidations(filteredReservas);
    }, [filteredReservas, reservaPagos, activeTab]);

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

                    {/* Filtros de fecha */}
                    <DateRangeFilter
                        fechaDesde={fechaDesde}
                        setFechaDesde={setFechaDesde}
                        fechaHasta={fechaHasta}
                        setFechaHasta={setFechaHasta}
                        onFilter={handleFilterChange}
                        resetDateRange={resetDateRange}
                    />

                    {/* Filtro de materia */}
                    <div className="mb-4">
                        <div className="row g-2">
                            <div className="col-12 col-md-6 col-lg-4">
                                <CustomSelect
                                    value={materiaFilter}
                                    onChange={(e) => setMateriaFilter(e.target.value)}
                                    options={materias}
                                    placeholder="Todas las materias"
                                    className="form-select form-select-sm"
                                    variant="light"
                                />
                            </div>
                            <div className="col-12 col-md-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={resetMateriaFilter}
                                    title="Limpiar filtro de materia"
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reservations section */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-calendar-check me-2 text-primary"></i>
                            {activeTab === 'estudiante' ? 'Mis reservas' : 'Reservas recibidas'}
                            {materiaFilter && (
                                <span className="badge bg-primary ms-2">
                                    Filtrado por: {materias.find(m => m.id.toString() === materiaFilter)?.nombre}
                                </span>
                            )}
                        </h2>

                        <div className="reservas-container">
                            {isLoading ? (
                                <div className="d-flex justify-content-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : processedReservas.length > 0 ? (
                                <div className="row g-3">
                                    {processedReservas.map((reserva) => (
                                        <ReservaCard
                                            key={reserva.id}
                                            reserva={reserva}
                                            activeTab={activeTab}
                                            reservaPagos={reservaPagos}
                                            reservaActions={reservaActions} // NEW: Pass actions
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
                                    <p>
                                        {materiaFilter
                                            ? `No tienes reservas para la materia seleccionada en el rango de fechas especificado`
                                            : activeTab === 'estudiante'
                                                ? 'No tienes reservas de tutorías en el rango de fechas especificado'
                                                : 'No tienes reservas pendientes en el rango de fechas especificado'
                                        }
                                    </p>
                                    <p className="text-muted">
                                        {activeTab === 'estudiante'
                                            ? 'Explora los servicios disponibles y realiza una reserva'
                                            : 'Cuando los estudiantes reserven tus tutorías, aparecerán aquí'}
                                    </p>
                                    {materiaFilter && (
                                        <button
                                            className="btn btn-sm btn-outline-primary mt-2"
                                            onClick={resetMateriaFilter}
                                        >
                                            <i className="bi bi-funnel me-1"></i>
                                            Quitar filtro de materia
                                        </button>
                                    )}
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
                            <div className="mt-1 text-warning">
                                <strong>Importante:</strong> Debes realizar el pago dentro de los 3 días posteriores a la tutoría.
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-4">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <strong>Información:</strong> Como tutor, puedes confirmar o cancelar las reservas pendientes. Una vez finalizada la tutoría, márcala como completada.
                            <div className="mt-1">
                                Solo puedes acceder a la sala virtual 15 minutos antes del inicio de la clase y hasta el final de la misma.
                            </div>
                            <div className="mt-1">
                                Si el estudiante paga en efectivo, deberás registrar y confirmar el pago manualmente.
                            </div>
                            <div className="mt-1">
                                Las calificaciones de los estudiantes afectan tu puntuación promedio visible en tu perfil.
                            </div>
                            <div className="mt-1 text-warning">
                                <strong>Importante:</strong> Las reservas que pasen su fecha límite sin confirmarse se marcarán automáticamente como no realizadas.
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
                    activeTab={activeTab}
                    recordVideoCallAction={recordVideoCallAction}
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