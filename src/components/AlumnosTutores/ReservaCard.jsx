// Updated ReservaCard.jsx with actions tracking - PRODUCTION VERSION

import React from 'react';

const ReservaCard = ({
                         reserva,
                         activeTab,
                         reservaPagos,
                         reservaActions,
                         isPastReserva,
                         canCancelReserva,
                         canConfirmReserva,
                         canCompleteReserva,
                         canPayReserva,
                         canConfirmEfectivoPago,
                         canRateReserva,
                         confirmActionId,
                         actionType,
                         setConfirmActionId,
                         setActionType,
                         handleCancelReserva,
                         handleConfirmReserva,
                         handleCompleteReserva,
                         handlePaymentModal,
                         handleConfirmEfectivoPago,
                         handleOpenRatingModal,
                         startVideoCall
                     }) => {
    const formatDateTime = (date, time) => {
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}/${month}/${year}`;

        return `${formattedDate} - ${time}`;
    };

    const getEstadoBadge = (estado, actualStatus = null, isExpired = false) => {
        const status = actualStatus || estado;

        if (status === 'expirada' || (isExpired && (estado === 'pendiente' || estado === 'confirmada'))) {
            return (
                <span className="badge bg-secondary">
                    <i className="bi bi-clock-history me-1"></i>
                    No realizada
                </span>
            );
        }

        switch (status) {
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

    const getPaymentWarningAlert = (paymentWarning) => {
        if (!paymentWarning) return null;

        const alertClass = paymentWarning.type === 'danger' ? 'alert-danger' : 'alert-warning';
        const iconClass = paymentWarning.type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill';

        return (
            <div className={`alert ${alertClass} alert-sm mt-2 mb-0`} role="alert">
                <i className={`bi ${iconClass} me-1`}></i>
                <small>{paymentWarning.message}</small>
            </div>
        );
    };

    const getClassTimeInfo = (reserva) => {
        if (activeTab !== 'tutor' || reserva.estado !== 'confirmada') return null;

        const now = new Date();
        const [year, month, day] = reserva.fecha.split('-');

        // FIX: Parsear hora Y minutos
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

        if (now > endTime) {
            return (
                <div className="alert alert-secondary alert-sm mt-2 mb-0" role="alert">
                    <i className="bi bi-clock-history me-1"></i>
                    <small>Esta clase ya ha finalizado</small>
                </div>
            );
        }

        if (now >= allowStartTime && now <= endTime) {
            const minutesUntilEnd = Math.floor((endTime - now) / (1000 * 60));
            return (
                <div className="alert alert-success alert-sm mt-2 mb-0" role="alert">
                    <i className="bi bi-play-circle-fill me-1"></i>
                    <small>¡Ya puedes iniciar la clase! (quedan {minutesUntilEnd} minutos)</small>
                </div>
            );
        }

        if (reserva.timeUntilClass) {
            return (
                <div className="alert alert-info alert-sm mt-2 mb-0" role="alert">
                    <i className="bi bi-clock me-1"></i>
                    <small>Podrás iniciar la clase en {reserva.timeUntilClass}</small>
                </div>
            );
        }

        return null;
    };

    // Function to render video call actions tracking
    const getVideoCallActionsInfo = () => {
        if (!reservaActions || !shouldShowVideoCallButton(reserva)) return null;

        const action = reservaActions[reserva.id];
        if (!action) return null;

        return (
            <div className="mt-2 p-2 bg-light rounded-2 border">
                <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-eye me-2 text-primary"></i>
                    <span className="fw-bold small text-muted">Acceso a videollamada:</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {action.estudiante_opened && (
                        <span className="badge bg-success d-flex align-items-center">
                            <i className="bi bi-person-check me-1"></i>
                            Estudiante conectado
                        </span>
                    )}
                    {action.tutor_opened && (
                        <span className="badge bg-info d-flex align-items-center">
                            <i className="bi bi-mortarboard me-1"></i>
                            Tutor conectado
                        </span>
                    )}
                    {!action.estudiante_opened && !action.tutor_opened && (
                        <span className="badge bg-secondary d-flex align-items-center">
                            <i className="bi bi-clock me-1"></i>
                            Esperando conexiones
                        </span>
                    )}
                </div>

                {/* Show who's missing if only one connected */}
                {(action.estudiante_opened && !action.tutor_opened) && (
                    <div className="mt-1">
                        <small className="text-muted">Esperando al tutor...</small>
                    </div>
                )}
                {(action.tutor_opened && !action.estudiante_opened) && (
                    <div className="mt-1">
                        <small className="text-muted">Esperando al estudiante...</small>
                    </div>
                )}

                {/* Show success message when both connected */}
                {action.estudiante_opened && action.tutor_opened && (
                    <div className="mt-1">
                        <small className="text-success fw-bold">
                            <i className="bi bi-check-circle me-1"></i>
                            ¡Ambos participantes se conectaron!
                        </small>
                    </div>
                )}
            </div>
        );
    };

    const shouldShowVideoCallButton = (reserva) => {
        if (!reserva.servicio ||
            (reserva.servicio.modalidad !== 'virtual' && reserva.servicio.modalidad !== 'ambas') ||
            !reserva.sala_virtual) {
            return false;
        }

        if (activeTab === 'estudiante' && reserva.estado === 'confirmada') {
            return true;
        }

        if (activeTab === 'tutor' && reserva.estado === 'confirmada') {
            return reserva.canStartClass || !reserva.isExpired;
        }

        return false;
    };

    const getVideoCallButtonText = (reserva) => {
        // Función helper para calcular tiempo hasta poder acceder
        const getTimeUntilAccess = (reserva) => {
            const now = new Date();
            const [year, month, day] = reserva.fecha.split('-');
            const [horaInicio] = reserva.hora_inicio.split(':');

            const startTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(horaInicio), 0, 0);
            const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
            const timeDiff = allowStartTime - now;

            if (timeDiff <= 0) return null;

            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        };

        // Para tutores
        if (activeTab === 'tutor') {
            if (reserva.canStartClass) {
                return "Iniciar Clase";
            } else if (reserva.isExpired) {
                return "Clase finalizada";
            } else {
                const timeUntil = getTimeUntilAccess(reserva);
                return timeUntil ? `Disponible en ${timeUntil}` : "Aún no disponible";
            }
        }

        // Para estudiantes
        if (activeTab === 'estudiante') {
            if (reserva.isExpired) {
                return "Clase finalizada";
            } else {
                const timeUntil = getTimeUntilAccess(reserva);
                return timeUntil ? `Disponible en ${timeUntil}` : "Acceder a Videollamada";
            }
        }

        return "Acceder a Videollamada";
    };
    const getStudentVideoCallInfo = (reserva) => {
        if (activeTab !== 'estudiante' || reserva.estado !== 'confirmada' || !shouldShowVideoCallButton(reserva)) {
            return null;
        }

        const now = new Date();
        const [year, month, day] = reserva.fecha.split('-');
        const [horaInicio] = reserva.hora_inicio.split(':');
        const [horaFin] = reserva.hora_fin.split(':');

        const startTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(horaInicio), 0, 0);
        const endTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(horaFin), 0, 0);
        const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);

        // Si puede acceder ahora
        if (now >= allowStartTime && now <= endTime) {
            const minutesUntilEnd = Math.floor((endTime - now) / (1000 * 60));
            return (
                <div className="alert alert-success alert-sm mt-2 mb-0" role="alert">
                    <i className="bi bi-play-circle-fill me-1"></i>
                    <small>¡Puedes acceder a la videollamada! (quedan {minutesUntilEnd} minutos)</small>
                </div>
            );
        }

        if (now < allowStartTime) {
            const timeDiff = allowStartTime - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            return (
                <div className="alert alert-info alert-sm mt-2 mb-0" role="alert">
                    <i className="bi bi-clock me-1"></i>
                    <small>Podrás acceder a la videollamada en {timeText}</small>
                </div>
            );
        }

        return null;
    };

    const isVideoCallButtonDisabled = (reserva) => {
        // Función helper para calcular si puede acceder (FIXED para parsear minutos)
        const canAccessVideoCall = (reserva) => {
            const now = new Date();
            const [year, month, day] = reserva.fecha.split('-');

            // FIX: Parsear hora Y minutos (igual que las otras funciones)
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

            const allowStartTime = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 min antes

            return now >= allowStartTime && now <= endTime;
        };

        // Para estudiantes: misma lógica que tutores (15 min antes)
        if (activeTab === 'estudiante') {
            const canAccess = canAccessVideoCall(reserva);
            return !canAccess; // Deshabilitar si NO puede acceder
        }

        // Para tutores: usar la lógica existente
        if (activeTab === 'tutor') {
            return !reserva.canStartClass && !reserva.isExpired;
        }

        return true; // Por defecto, deshabilitar
    };


    // Simple function to open modal - Action recording happens in modal
    const handleStartVideoCall = (reserva) => {
        startVideoCall(reserva);
    };

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className={`materia-card ${isPastReserva ? 'opacity-75' : ''} ${reserva.actualStatus === 'expirada' ? 'border-secondary' : ''}`}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h3 className="materia-title">
                            {reserva.materia?.nombre || `Tutoría #${reserva.id}`}
                        </h3>
                        <div className="mb-1">
                            {getEstadoBadge(reserva.estado, reserva.actualStatus, reserva.isExpired)}

                            {/* Payment status badge if completed */}
                            {reserva.estado === 'completada' && (
                                <span className="ms-2">
                                    {getEstadoPagoBadge(reservaPagos[reserva.id])}
                                </span>
                            )}

                            {/* Rating badge if already rated */}
                            {reserva.calificado === true && (
                                <span className="badge bg-primary ms-2">
                                    <i className="bi bi-star-fill me-1"></i>
                                    Calificado
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons based on role and state */}
                    <div>
                        {/* Cancel reservation (student or tutor) */}
                        {canCancelReserva && reserva.actualStatus !== 'expirada' && (
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

                        {/* Confirm reservation (tutor only) */}
                        {canConfirmReserva && reserva.actualStatus !== 'expirada' && (
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

                        {/* Payment button (student only) */}
                        {canPayReserva && (
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

                        {/* Complete button (tutor only) */}
                        {canCompleteReserva && reserva.actualStatus !== 'expirada' && (
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

                        {/* Confirm cash payment (tutor only) */}
                        {canConfirmEfectivoPago && (
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

                        {/* Rate button (student only, for paid reservations) */}
                        {canRateReserva && (
                            <div className="mt-2">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleOpenRatingModal(reserva)}
                                    title="Calificar tutoría"
                                >
                                    <i className="bi bi-star me-1"></i>
                                    Calificar
                                </button>
                            </div>
                        )}

                        {/* If already rated, show rating badge */}
                        {reserva.calificado === true && (
                            <div className="mt-2">
                                <span className="badge bg-success">
                                    <i className="bi bi-star-fill me-1"></i>
                                    Ya calificaste esta tutoría
                                </span>
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

                    {/* Tutor or student info depending on active role */}
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

                    {/* Price information */}
                    {reserva.servicio && reserva.servicio.precio && (
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-currency-dollar me-2 text-primary"></i>
                            <span>Precio: ${reserva.servicio.precio}</span>
                        </div>
                    )}

                    {/* Modality */}
                    {reserva.servicio && reserva.servicio.modalidad && (
                        <div className="d-flex align-items-center mb-2">
                            <i className={`bi ${reserva.servicio.modalidad === 'presencial' ? 'bi-building' : 'bi-laptop'} me-2 text-primary`}></i>
                            <span>Modalidad: {reserva.servicio.modalidad.charAt(0).toUpperCase() + reserva.servicio.modalidad.slice(1)}</span>
                        </div>
                    )}

                    {/* Payment information */}
                    {reserva.estado === 'completada' && reservaPagos[reserva.id] && (
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-credit-card me-2 text-primary"></i>
                            <span>
                                Pago: {reservaPagos[reserva.id].metodo_pago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'} -
                                {reservaPagos[reserva.id].estado === 'completado' ? (
                                    <span className="text-success fw-bold"> Pagado</span>
                                ) : reservaPagos[reserva.id].estado === 'pendiente' ? (
                                    <span className="text-warning fw-bold"> Pendiente</span>
                                ) : (
                                    <span className="text-danger fw-bold"> Cancelado</span>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Show message when no payment exists */}
                    {reserva.estado === 'completada' && !reservaPagos[reserva.id] && activeTab === 'tutor' && (
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-credit-card me-2 text-danger"></i>
                            <span className="text-danger">
                                El estudiante aún no ha iniciado el proceso de pago
                            </span>
                        </div>
                    )}

                    {/* Video call section */}
                    {shouldShowVideoCallButton(reserva) && (
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-camera-video me-2 text-primary"></i>
                            <div className="sala-virtual-container w-100">
                                <span>Sala Virtual: </span>
                                <div className="mt-1">
                                    <button
                                        className={`btn btn-sm ${isVideoCallButtonDisabled(reserva) ? 'btn-outline-secondary' : 'btn-primary'} me-1`}
                                        onClick={() => handleStartVideoCall(reserva)}
                                        disabled={isVideoCallButtonDisabled(reserva)}
                                        title={isVideoCallButtonDisabled(reserva) ? "Aún no puedes acceder" : "Acceder a la videollamada"}
                                    >
                                        <i className="bi bi-camera-video-fill me-1"></i>
                                        {getVideoCallButtonText(reserva)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No virtual room available message */}
                    {reserva.servicio &&
                        (reserva.servicio.modalidad === 'virtual' || reserva.servicio.modalidad === 'ambas') &&
                        reserva.estado === 'confirmada' && !reserva.sala_virtual && (
                            <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-camera-video me-2 text-muted"></i>
                                <span className="text-muted">Sala pendiente de configuración</span>
                            </div>
                        )}

                    {/* Video call actions tracking */}
                    {getVideoCallActionsInfo()}

                    {/* Payment warning alert */}
                    {getPaymentWarningAlert(reserva.paymentWarning)}

                    {/* Class time info for tutors */}
                    {getClassTimeInfo(reserva)}

                    {getStudentVideoCallInfo(reserva)}
                </div>
            </div>
        </div>
    );
};

export default ReservaCard;