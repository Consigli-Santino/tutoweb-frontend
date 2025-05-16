import React from 'react';

const PaymentModal = ({ showModal, reserva, activeTab, isProcessing, onClose, onProcessPayment }) => {
    if (!showModal || !reserva) return null;

    const formatDateTime = (date, time) => {
        const formattedDate = new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `${formattedDate} - ${time}`;
    };

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
                            onClick={onClose}
                            disabled={isProcessing}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <p className="fw-bold">Tutoría: {reserva.materia?.nombre || `#${reserva.id}`}</p>
                        <p>Fecha: {formatDateTime(reserva.fecha, reserva.hora_inicio)}</p>
                        <p className="mb-4">Precio: ${reserva.servicio?.precio || 0}</p>

                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={() => onProcessPayment(reserva, 'mercado_pago')}
                                disabled={isProcessing}
                            >
                                <i className="bi bi-credit-card me-2"></i>
                                Pagar con Mercado Pago
                            </button>

                            {activeTab === 'tutor' && (
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => onProcessPayment(reserva, 'efectivo')}
                                    disabled={isProcessing}
                                >
                                    <i className="bi bi-cash me-2"></i>
                                    Registrar pago en efectivo
                                </button>
                            )}
                        </div>

                        {isProcessing && (
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

export default PaymentModal;