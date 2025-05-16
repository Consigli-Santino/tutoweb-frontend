import React from 'react';

const ReservaCard = ({
                         reserva,
                         activeTab,
                         reservaPagos,
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

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className={`materia-card ${isPastReserva ? 'opacity-75' : ''}`}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h3 className="materia-title">
                            {reserva.materia?.nombre || `Tutoría #${reserva.id}`}
                        </h3>
                        <div className="mb-1">
                            {getEstadoBadge(reserva.estado)}
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
                        {canCancelReserva && (
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
                        {canConfirmReserva && (
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
                        {canCompleteReserva && (
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

                    {reserva.servicio &&
                        (reserva.servicio.modalidad === 'virtual' || reserva.servicio.modalidad === 'ambas') &&
                        reserva.estado === 'confirmada' && (
                            <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-camera-video me-2 text-primary"></i>
                                {reserva.sala_virtual ? (
                                    <div className="sala-virtual-container">
                                        <span>Sala Virtual: </span>
                                        <div className="mt-1">
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

                    {/* Reservation notes */}
                    {reserva.notas && (
                        <div className="mt-2">
                            <h4 className="fs-6 fw-bold mb-1">Notas:</h4>
                            <p className="materia-description">{reserva.notas}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservaCard;