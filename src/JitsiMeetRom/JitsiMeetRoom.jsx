import React, { useState } from 'react';
import apiService from "../services/ApiService.js";

const JitsiMeetRoom = ({ roomUrl, displayName, onClose }) => {
    const [hasOpenedCall, setHasOpenedCall] = useState(false);

    // Asegurar URL completa
    const getFullUrl = (url) => {
        return url.startsWith('http') ? url : `https://meet.jit.si/${url}`;
    };

    // Función para abrir la videollamada en una nueva pestaña
    const openVideoCall = () => {

        const url = getFullUrl(roomUrl);
        window.open(url, '_blank');
        setHasOpenedCall(true);
    };

    return (
        <div className="text-center p-4" style={{ background: '#f8f9fa', height: '100%' }}>
            <div className="py-3">
                {!hasOpenedCall ? (
                    // Primera pantalla: instrucciones para abrir la videollamada
                    <>
                        <div className="mb-4">
                            <i className="bi bi-camera-video text-primary" style={{ fontSize: '3rem' }}></i>
                        </div>

                        <h4 className="mb-3">Sala de videollamada lista</h4>

                        <p className="mb-4">
                            La videollamada se abrirá en una nueva pestaña. Puedes mantener ambas pestañas abiertas.
                        </p>

                        <div className="d-grid gap-3 col-md-10 mx-auto mb-4">
                            <button
                                onClick={openVideoCall}
                                className="btn btn-primary btn-lg"
                            >
                                <i className="bi bi-camera-video-fill me-2"></i>
                                Iniciar videollamada
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>

                        <div className="alert alert-info mt-3 mx-auto small text-start">
                            <div className="fw-bold mb-2">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                Consejos para una mejor experiencia:
                            </div>
                            <ul className="mb-0">
                                <li>Permite el acceso a tu cámara y micrófono cuando el navegador lo solicite.</li>
                                <li>Una vez iniciada la videollamada, puedes volver a esta ventana para controlar tu reserva.</li>
                                <li>La sala permanecerá abierta durante toda la tutoría.</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    // Segunda pantalla: después de abrir la videollamada
                    <>
                        <div className="mb-4">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                        </div>

                        <h4 className="mb-3">Videollamada iniciada</h4>

                        <div className="alert alert-success mb-4">
                            <i className="bi bi-camera-video-fill me-2"></i>
                            Tu sesión de tutoría está activa en otra pestaña.
                        </div>

                        <div className="d-grid gap-3 col-md-10 mx-auto">
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

                        <p className="text-muted mt-4 small">
                            Puedes alternar entre la videollamada y esta aplicación cuando lo necesites.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default JitsiMeetRoom;