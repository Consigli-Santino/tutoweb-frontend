import React, { useState } from 'react';
import apiService from "../services/ApiService.js";

const JitsiMeetRoom = ({ roomUrl, displayName, reserva, activeTab, recordVideoCallAction, onClose }) => {
    const [hasOpenedCall, setHasOpenedCall] = useState(false);
    const [isRecordingAction, setIsRecordingAction] = useState(false);

    // Asegurar URL completa
    const getFullUrl = (url) => {
        return url.startsWith('http') ? url : `https://meet.jit.si/${url}`;
    };

    // Función para abrir la videollamada en una nueva pestaña
    const openVideoCall = async () => {
        // Si es la primera vez y tenemos la función de registro, registrar la acción
        if (!hasOpenedCall && recordVideoCallAction && reserva) {
            setIsRecordingAction(true);
            try {
                await recordVideoCallAction(reserva.id);
                console.log(`Video call action recorded for reserva ${reserva.id}`);
            } catch (error) {
                console.error('Error recording video call action:', error);
                // Continuar aunque falle el registro
            } finally {
                setIsRecordingAction(false);
            }
        }

        const url = getFullUrl(roomUrl);
        window.open(url, '_blank');
        setHasOpenedCall(true);
    };

    return (
        <div className="d-flex flex-column h-100" style={{ background: '#f8f9fa' }}>
            <div className="flex-grow-1 d-flex flex-column justify-content-center p-3">
                <div className="text-center">
                    {!hasOpenedCall ? (
                        // Primera pantalla: instrucciones para abrir la videollamada
                        <>
                            <div className="mb-3">
                                <i className="bi bi-camera-video text-primary" style={{ fontSize: '2.5rem' }}></i>
                            </div>

                            <h4 className="mb-3">Sala de videollamada lista</h4>

                            {/* Información de la reserva si está disponible */}
                            {reserva && (
                                <div className="mb-3">
                                    <p className="text-muted mb-1">
                                        {reserva.materia?.nombre && `${reserva.materia.nombre} - `}
                                        {new Date(reserva.fecha).toLocaleDateString('es-AR')} a las {reserva.hora_inicio}
                                    </p>
                                    {activeTab === 'estudiante' && reserva.tutor && (
                                        <p className="text-muted mb-0">
                                            Tutor: {reserva.tutor.nombre} {reserva.tutor.apellido}
                                        </p>
                                    )}
                                    {activeTab === 'tutor' && reserva.estudiante && (
                                        <p className="text-muted mb-0">
                                            Estudiante: {reserva.estudiante.nombre} {reserva.estudiante.apellido}
                                        </p>
                                    )}
                                </div>
                            )}

                            <p className="mb-3 text-muted">
                                La videollamada se abrirá en una nueva pestaña. Puedes mantener ambas pestañas abiertas.
                            </p>

                            <div className="d-grid gap-2 mb-3" style={{ maxWidth: '300px', margin: '0 auto' }}>
                                <button
                                    onClick={openVideoCall}
                                    className="btn btn-primary"
                                    disabled={isRecordingAction}
                                >
                                    {isRecordingAction ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Conectando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-camera-video-fill me-2"></i>
                                            Iniciar videollamada
                                        </>
                                    )}
                                </button>

                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                    disabled={isRecordingAction}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    ) : (
                        // Segunda pantalla: después de abrir la videollamada
                        <>
                            <div className="mb-3">
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2.5rem' }}></i>
                            </div>

                            <h4 className="mb-3">Videollamada iniciada</h4>

                            <div className="alert alert-success mb-3 py-2">
                                <i className="bi bi-camera-video-fill me-2"></i>
                                Tu sesión de tutoría está activa en otra pestaña.
                            </div>

                            <div className="d-grid gap-2" style={{ maxWidth: '300px', margin: '0 auto' }}>
                                <button
                                    onClick={openVideoCall}
                                    className="btn btn-primary"
                                >
                                    <i className="bi bi-arrow-up-right-square me-2"></i>
                                    Volver a la videollamada
                                </button>

                                <button
                                    className="btn btn-success"
                                    onClick={onClose}
                                >
                                    <i className="bi bi-check-lg me-2"></i>
                                    Continuar en la app
                                </button>
                            </div>

                            <p className="text-muted mt-3 small">
                                Puedes alternar entre la videollamada y esta aplicación cuando lo necesites.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Consejos movidos al final y más compactos */}
            {!hasOpenedCall && (
                <div className="mt-auto p-3">
                    <div className="alert alert-info py-2 mx-auto small text-start" style={{ maxWidth: '400px' }}>
                        <div className="fw-bold mb-1">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            Consejos:
                        </div>
                        <ul className="mb-0" style={{ paddingLeft: '1.2rem' }}>
                            <li>Permite el acceso a tu cámara y micrófono.</li>
                            <li>Puedes volver a esta ventana para controlar tu reserva.</li>
                            <li>La sala permanecerá abierta durante toda la tutoría.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JitsiMeetRoom;