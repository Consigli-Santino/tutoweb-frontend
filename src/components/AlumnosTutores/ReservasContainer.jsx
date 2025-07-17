
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEntidades } from '../../context/EntidadesContext.jsx';
import ApiService from '../../services/ApiService';
import useReservaActions from '../../hooks/useReservaActions';
import '../../commonTables.css';
import ReservaCard from './ReservaCard';
import PaymentModal from './PaymentModal';
import VideoCallModal from './VideoCallModal';
import CalificacionModal from './CalificacionModal';
import DateRangeFilter from '../Dashboard/DateRangeFilter';
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

const ReservasContainer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { materias } = useEntidades();
    const [searchParams] = useSearchParams();

    // NUEVO ESTADO PARA BYPASS DE VALIDACIONES
    const [bypassValidations, setBypassValidations] = useState(false);

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
    const activeTabRef = useRef(activeTab);
    // State for reserva actions
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
    const [reservaPagos, setReservaPagos] = useState({});
    const [showCalificacionModal, setShowCalificacionModal] = useState(false);
    const [reservaToRate, setReservaToRate] = useState(null);
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    // ===== HOOKS PERSONALIZADOS =====

    // Callbacks para el hook de acciones
    const handleActionSuccess = useCallback((message, details) => {
        setSuccess(message);
        console.log('✅ Acción exitosa:', details);

        // Refrescar datos después de una acción exitosa
        fetchReservas();

        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
    }, []);

    const handleActionError = useCallback((message, details) => {
        setError(message);
        console.error('❌ Error en acción:', details);

        // Auto-hide error message after 8 seconds
        setTimeout(() => setError(null), 8000);
    }, []);

    // Hook personalizado para acciones de reserva
    const {
        isProcessing: isActionProcessing,
        processingAction,
        cancelarReserva,
        confirmarReserva,
        completarReserva,
        procesarPago,
        confirmarPagoEfectivo,
        enviarCalificacion,
        isActionProcessing: checkActionProcessing
    } = useReservaActions(activeTab, handleActionSuccess, handleActionError);

    // ===== UTILITY FUNCTIONS =====

    const isReservaExpired = (reserva) => {
        // Si bypass está activado, nunca considerar expired para propósitos de testing
        if (bypassValidations) return false;

        try {
            const reservaDateTimeString = `${reserva.fecha}T${reserva.hora_fin}`;
            const reservaDateTime = new Date(reservaDateTimeString);

            if (isNaN(reservaDateTime.getTime())) {
                console.error('Invalid date created from:', reservaDateTimeString);
                return false;
            }

            const now = new Date();
            return now > reservaDateTime;
        } catch (error) {
            console.error('Error checking if reserva is expired:', error);
            return false;
        }
    };

    const getReservaStatus = (reserva, pago = null) => {
        const isExpired = isReservaExpired(reserva);
        if (isExpired && reserva.estado === 'pendiente') {
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
        // Si bypass está activado, permitir iniciar clase si es tutor y está confirmada
        if (bypassValidations) {
            return activeTab === 'tutor' && reserva.estado === 'confirmada';
        }

        if (activeTab !== 'tutor' || reserva.estado !== 'confirmada') return false;

        const now = new Date();
        const [year, month, day] = reserva.fecha.split('-');
        const [horaInicio, minutoInicio] = reserva.hora_inicio.split(':');
        const [horaFin, minutoFin] = reserva.hora_fin.split(':');

        const startTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(horaInicio),
            parseInt(minutoInicio),
            0
        );

        const endTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(horaFin),
            parseInt(minutoFin),
            0
        );

        const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
        return now >= allowStartTime && now <= endTime;
    };

    const getTimeUntilClass = (reserva) => {
        // Si bypass está activado, no mostrar tiempo restante
        if (bypassValidations) return null;

        const now = new Date();
        const [year, month, day] = reserva.fecha.split('-');

        // FIX: Parsear tanto horas como minutos
        const [horaInicio, minutoInicio] = reserva.hora_inicio.split(':');
        const [horaFin, minutoFin] = reserva.hora_fin.split(':');

        const startTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(horaInicio),
            parseInt(minutoInicio), // ← FIX: Agregar minutos
            0
        );

        const endTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(horaFin),
            parseInt(minutoFin), // ← FIX: Agregar minutos
            0
        );

        const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);

        if (now > endTime) return null;
        if (now >= allowStartTime && now <= endTime) return null;

        if (now < allowStartTime) {
            const timeDiff = allowStartTime - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        }

        return null;
    };

    // ===== VALIDATION FUNCTIONS =====

    const canCancelReserva = (reserva) => {
        const actualStatus = reserva.actualStatus || reserva.estado;

        if (actualStatus !== 'pendiente' && actualStatus !== 'confirmada') {
            return false;
        }

        if (actualStatus === 'expirada') {
            return false;
        }

        // Si bypass está activado, permitir cancelar (ignorar restricción horaria)
        if (bypassValidations) {
            return !checkActionProcessing('cancelar', reserva.id);
        }

        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
        const now = new Date();
        const hoursBeforeLimit = 2;
        const limitTime = new Date(reservaDateTime.getTime() - (hoursBeforeLimit * 60 * 60 * 1000));

        return now < limitTime && !checkActionProcessing('cancelar', reserva.id);
    };

    const canConfirmReserva = (reserva) => {
        const actualStatus = reserva.actualStatus || reserva.estado;
        return activeTab === 'tutor' &&
            actualStatus === 'pendiente' &&
            !reserva.isExpired &&
            !checkActionProcessing('confirmar', reserva.id);
    };

    const canCompleteReserva = (reserva) => {
        const actualStatus = reserva.actualStatus || reserva.estado;
        const action = reservaActions[reserva.id];

        if (activeTab !== 'tutor') return false;
        if (actualStatus !== 'confirmada') return false;
        if (checkActionProcessing('completar', reserva.id)) return false;

        // Si bypass está activado, solo verificar que ambos hayan abierto la videollamada
        if (bypassValidations) {
            // Para testing, permitir completar si ambos han abierto la videollamada
            // O si no hay acción registrada aún (para permitir testing sin videollamada)
            if (!action) {
                return true; // Permitir completar sin restricciones en modo test
            }
            return true;
            //return action.tutor_opened && action.estudiante_opened;
        }

        // Validaciones normales
        if (!reserva.isExpired) return false;

        if (!action || !action.tutor_opened || !action.estudiante_opened) {
            return false;
        }

        return true;
    };

    const canPayReserva = (reserva) => {
        const pago = reservaPagos[reserva.id];
        const action = reservaActions[reserva.id];

        if (activeTab !== 'estudiante') return false;
        if (checkActionProcessing('pago', reserva.id)) return false;

        if (reserva.estado === 'completada') {
            return !pago || pago.estado !== 'completado';
        }

        // Si bypass está activado, permitir pagar reservas confirmadas inmediatamente
        if (bypassValidations && reserva.estado === 'confirmada') {
            return !pago || pago.estado !== 'completado';
        }

        if (reserva.estado === 'confirmada' && reserva.isExpired) {
            if (action && action.tutor_opened && action.estudiante_opened) {
                return !pago || pago.estado !== 'completado';
            }
        }

        return false;
    };

    const canConfirmEfectivoPago = (reserva) => {
        if (activeTab !== 'tutor' || reserva.estado !== 'completada') {
            return false;
        }

        const pago = reservaPagos[reserva.id];
        return pago &&
            pago.metodo_pago === 'efectivo' &&
            pago.estado === 'pendiente' &&
            !checkActionProcessing('confirmar_pago', pago.id);
    };

    const canRateReserva = (reserva) => {
        if (activeTab !== 'estudiante' || reserva.estado !== 'completada') {
            return false;
        }

        const pago = reservaPagos[reserva.id];
        if (!pago || pago.estado !== 'completado') {
            return false;
        }

        return reserva.calificado !== true && !checkActionProcessing('calificar', reserva.id);
    };

    const isPastReserva = (reserva) => {
        // Si bypass está activado, nunca considerar como pasada para propósitos de testing
        if (bypassValidations) return false;

        const reservaDateTime = new Date(`${reserva.fecha}T${reserva.hora_fin}`);
        const now = new Date();
        return now > reservaDateTime;
    };

    // ===== API FUNCTIONS =====

    const fetchReservaActions = async (reservaIds) => {
        if (!reservaIds || reservaIds.length === 0) {
            setReservaActions({});
            return;
        }

        try {
            const response = await ApiService.getReservasActions(reservaIds);
            if (response.success) {
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

    const recordVideoCallAction = async (reservaId) => {
        try {
            const response = await ApiService.recordVideoCallAction(reservaId);
            if (response.success) {
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

    const processReservasWithValidations = (reservasList) => {
        return reservasList.map(reserva => {
            const pago = reservaPagos[reserva.id];
            const actualStatus = getReservaStatus(reserva, pago);
            const paymentWarning = getPaymentWarning(reserva, pago);
            const canStart = canStartClass(reserva);
            const timeUntil = getTimeUntilClass(reserva);

            // Nueva validación para acceso a videollamada (tanto tutor como estudiante)
            const canAccessVideo = bypassValidations
                ? reserva.estado === 'confirmada'
                : (activeTab === 'tutor' ? canStart : (
                    activeTab === 'estudiante' && reserva.estado === 'confirmada' ? (() => {
                        const now = new Date();
                        const [year, month, day] = reserva.fecha.split('-');
                        const [horaInicio, minutoInicio] = reserva.hora_inicio.split(':');
                        const [horaFin, minutoFin] = reserva.hora_fin.split(':');

                        const startTime = new Date(
                            parseInt(year),
                            parseInt(month) - 1,
                            parseInt(day),
                            parseInt(horaInicio),
                            parseInt(minutoInicio),
                            0
                        );

                        const endTime = new Date(
                            parseInt(year),
                            parseInt(month) - 1,
                            parseInt(day),
                            parseInt(horaFin),
                            parseInt(minutoFin),
                            0
                        );

                        const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
                        const allowEndTime = new Date(endTime.getTime() + 15 * 60 * 1000);

                        return now >= allowStartTime && now <= allowEndTime;
                    })() : false
                ));

            return {
                ...reserva,
                actualStatus,
                paymentWarning,
                canStartClass: canStart,
                canAccessVideoCall: canAccessVideo,
                timeUntilClass: timeUntil,
                isExpired: isReservaExpired(reserva)
            };
        });
    };

    const fetchPagosByTutor = async () => {
        try {
            const pagosResponse = await ApiService.fetchPagosByTutor();
            if (pagosResponse.success) {
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

    const fetchReservas = async (fromDate = fechaDesde, toDate = fechaHasta) => {
        setIsLoading(true);
        setError(null);

        try {
            let response;

            // Usar activeTabRef.current en lugar de activeTab
            if (activeTabRef.current === 'estudiante') {
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

    // ===== ACTION HANDLERS - USANDO EL HOOK PERSONALIZADO =====

    const handleCancelReserva = async (id) => {
        setConfirmActionId(null);
        setActionType(null);
        return cancelarReserva(id);
    };

    const handleConfirmReserva = async (id) => {
        setConfirmActionId(null);
        setActionType(null);
        return confirmarReserva(id);
    };

    const handleCompleteReserva = async (id) => {
        setConfirmActionId(null);
        setActionType(null);
        return completarReserva(id);
    };

    // ===== PAYMENT HANDLERS =====

    const handlePaymentModal = (reserva) => {
        setCurrentReserva(reserva);
        setShowPaymentModal(true);
    };

    const handleProcessPayment = async (reserva, method) => {
        try {
            await procesarPago(reserva, method);
            setShowPaymentModal(false);
            // Refrescar el pago específico después del procesamiento
            setTimeout(() => {
                fetchPagoByReserva(reserva.id);
            }, 1000);
        } catch (error) {
            // Error ya manejado por el hook
            setShowPaymentModal(false);
        }
    };

    const handleConfirmEfectivoPago = async (pagoId) => {
        setConfirmActionId(null);
        setActionType(null);
        return confirmarPagoEfectivo(pagoId);
    };

    // ===== RATING HANDLERS =====

    const handleOpenRatingModal = (reserva) => {
        setReservaToRate(reserva);
        setShowCalificacionModal(true);
    };

    const handleSubmitRating = async (rating, comment) => {
        if (!reservaToRate) return;

        try {
            await enviarCalificacion(reservaToRate, rating, comment, {
                userId: user.id
            });

            // Actualizar estado local
            setReservas(prevReservas =>
                prevReservas.map(reserva =>
                    reserva.id === reservaToRate.id
                        ? { ...reserva, calificado: true }
                        : reserva
                )
            );

            setShowCalificacionModal(false);
            setReservaToRate(null);
        } catch (error) {
            // Error ya manejado por el hook
            setShowCalificacionModal(false);
            setReservaToRate(null);
        }
    };

    // ===== VIDEO CALL HANDLERS =====

    const startVideoCall = (reserva) => {
        // Si bypass está activado, omitir todas las validaciones horarias
        if (!bypassValidations) {
            // Validaciones para tutor
            if (activeTab === 'tutor' && !reserva.canStartClass) {
                const timeUntil = reserva.timeUntilClass;
                if (timeUntil) {
                    setError(`No puedes iniciar la clase aún. Faltan ${timeUntil} para que puedas acceder.`);
                    return;
                } else if (reserva.isExpired) {
                    setError("Esta clase ya ha terminado. No puedes acceder a la sala virtual.");
                    return;
                }
            }

            // Validaciones para estudiante (normalmente también tienen restricciones horarias)
            if (activeTab === 'estudiante') {
                const now = new Date();
                const [year, month, day] = reserva.fecha.split('-');
                const [horaInicio, minutoInicio] = reserva.hora_inicio.split(':');
                const [horaFin, minutoFin] = reserva.hora_fin.split(':');

                const startTime = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(horaInicio),
                    parseInt(minutoInicio),
                    0
                );

                const endTime = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(horaFin),
                    parseInt(minutoFin),
                    0
                );

                const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
                const allowEndTime = new Date(endTime.getTime() + 15 * 60 * 1000);

                if (now < allowStartTime) {
                    const timeDiff = allowStartTime - now;
                    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const timeUntil = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                    setError(`No puedes acceder a la clase aún. Faltan ${timeUntil} para que puedas acceder.`);
                    return;
                }

                if (now > allowEndTime) {
                    setError("Esta clase ya ha terminado. No puedes acceder a la sala virtual.");
                    return;
                }
            }
        }

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

    // ===== FILTER FUNCTIONS =====

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

    const handleBack = () => {
        navigate(-1);
    };

    // ===== EFFECTS =====

    useEffect(() => {
        fetchReservas();
    }, [activeTab]);

    useEffect(() => {
        filterReservasByMateria();
    }, [reservas, materiaFilter]);

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

    // ===== PROCESSED DATA =====

    const processedReservas = useMemo(() => {
        return processReservasWithValidations(filteredReservas);
    }, [filteredReservas, reservaPagos, activeTab, bypassValidations]);

    // Combinar loading states
    const isCurrentlyLoading = isLoading || isActionProcessing;

    // ===== RENDER =====

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main mb-5 pb-5">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">
                            {activeTab === 'estudiante' ? 'Mis Reservas de Tutorías' : 'Gestión de Tutorías'}
                        </h1>
                        <div className="d-flex gap-2">
                            {/* BOTÓN DE BYPASS PARA TESTING */}
                            <button
                                className={`btn btn-sm ${bypassValidations ? 'btn-warning' : 'btn-outline-secondary'} rounded-pill`}
                                onClick={() => setBypassValidations(!bypassValidations)}
                                title="Desactivar validaciones horarias para testing"
                                disabled={isCurrentlyLoading}
                            >
                                <i className={`bi ${bypassValidations ? 'bi-shield-slash' : 'bi-shield-check'} me-1`}></i>
                                {bypassValidations ? 'Test ON' : 'Test OFF'}
                            </button>

                            <button
                                className="btn btn-sm btn-outline-secondary rounded-pill"
                                onClick={handleBack}
                                disabled={isCurrentlyLoading}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Volver
                            </button>
                        </div>
                    </div>

                    {/* INDICADOR DE MODO BYPASS */}
                    {bypassValidations && (
                        <div className="alert alert-warning alert-sm mt-2 mb-0">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <strong>Modo Testing:</strong> Las validaciones horarias están desactivadas.
                            <br />
                            <small>
                                ✅ Iniciar clases sin restricciones horarias (tutor y estudiante)
                                <br />
                                ✅ Completar clases sin esperar que termine el horario
                                <br />
                                ✅ Pagar reservas confirmadas inmediatamente
                                <br />
                                ✅ Cancelar reservas sin restricción de 2 horas
                            </small>
                        </div>
                    )}
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
                                        disabled={isCurrentlyLoading}
                                    >
                                        <i className="bi bi-person me-2"></i>
                                        Como Estudiante
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'tutor' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('tutor')}
                                        disabled={isCurrentlyLoading}
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
                        <div className="alert alert-danger shadow-sm rounded-3 alert-dismissible" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError(null)}
                                aria-label="Close"
                            ></button>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success shadow-sm rounded-3 alert-dismissible" role="alert">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            {success}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setSuccess(null)}
                                aria-label="Close"
                            ></button>
                        </div>
                    )}

                    {/* Processing indicator */}
                    {isActionProcessing && processingAction && (
                        <div className="alert alert-info shadow-sm rounded-3 d-flex align-items-center" role="alert">
                            <div className="spinner-border spinner-border-sm me-3" role="status">
                                <span className="visually-hidden">Procesando...</span>
                            </div>
                            <div>
                                <strong>Procesando acción...</strong>
                                <br />
                                <small className="text-muted">
                                    {processingAction.includes('cancelar') && 'Cancelando reserva y enviando notificaciones...'}
                                    {processingAction.includes('confirmar') && 'Confirmando reserva y enviando notificaciones...'}
                                    {processingAction.includes('completar') && 'Completando reserva y enviando notificaciones...'}
                                    {processingAction.includes('pago') && 'Procesando pago...'}
                                    {processingAction.includes('calificar') && 'Enviando calificación...'}
                                    {processingAction.includes('email') && 'Enviando email...'}
                                </small>
                            </div>
                        </div>
                    )}


                    {/* Date filters */}
                    <DateRangeFilter
                        fechaDesde={fechaDesde}
                        setFechaDesde={setFechaDesde}
                        fechaHasta={fechaHasta}
                        setFechaHasta={setFechaHasta}
                        onFilter={handleFilterChange}
                        resetDateRange={resetDateRange}
                        disabled={isCurrentlyLoading}
                    />

                    {/* Subject filter */}
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
                                    disabled={isCurrentlyLoading}
                                />
                            </div>
                            <div className="col-12 col-md-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={resetMateriaFilter}
                                    title="Limpiar filtro de materia"
                                    disabled={isCurrentlyLoading}
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
                                            reservaActions={reservaActions}
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
                                            isProcessing={isActionProcessing}
                                            processingAction={processingAction}
                                            bypassValidations={bypassValidations}
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
                                            disabled={isCurrentlyLoading}
                                        >
                                            <i className="bi bi-funnel me-1"></i>
                                            Quitar filtro de materia
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informative notes based on active role */}
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
                            <div className="mt-1 text-info">
                                <strong>Notificaciones:</strong> Recibirás emails de confirmación para todas las acciones importantes de tus reservas.
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
                                <strong>Importante:</strong> Solo puedes completar una reserva después de que haya terminado el horario programado.
                            </div>
                            <div className="mt-1 text-info">
                                <strong>Notificaciones:</strong> Recibirás emails cuando tengas nuevas reservas y confirmaciones de pago.
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
                    isProcessing={checkActionProcessing('pago', currentReserva.id)}
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
                    isProcessing={checkActionProcessing('calificar', reservaToRate.id)}
                />
            )}

            {/* Loading overlay for critical actions */}
            {isActionProcessing && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1040 }}>
                    <div className="bg-white p-4 rounded-3 shadow text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Procesando...</span>
                        </div>
                        <div className="fw-bold mb-2">
                            {processingAction?.includes('cancelar') && 'Cancelando reserva...'}
                            {processingAction?.includes('confirmar') && 'Confirmando reserva...'}
                            {processingAction?.includes('completar') && 'Completando reserva...'}
                            {processingAction?.includes('pago') && 'Procesando pago...'}
                            {processingAction?.includes('calificar') && 'Enviando calificación...'}
                        </div>
                        <small className="text-muted">
                            Se están enviando las notificaciones por email correspondientes.
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservasContainer;