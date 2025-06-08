import React, { useState, useEffect, useRef, useCallback } from 'react';
import ApiService from '../../services/ApiService.js';
import './BubbleGame.css'; // Importar CSS externo

const ClassCountdown = React.memo(({ onClassAlert }) => {
    const [nextClassTime, setNextClassTime] = useState(null);
    const [timeToClass, setTimeToClass] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(true);

    // Usar useRef para mantener referencia del timer Y evitar re-renders
    const timerRef = useRef(null);
    const reloadTimeoutRef = useRef(null);
    const isActiveRef = useRef(true); // Para controlar si el componente está activo

    // Función para formatear el tiempo restante incluyendo segundos
    const formatTimeToClass = useCallback((milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            parts: { days, hours, minutes, seconds },
            formatted: {
                days: days.toString().padStart(2, '0'),
                hours: hours.toString().padStart(2, '0'),
                minutes: minutes.toString().padStart(2, '0'),
                seconds: seconds.toString().padStart(2, '0')
            }
        };
    }, []);

    const loadNextReserva = useCallback(async () => {
        if (!isActiveRef.current) return; // No hacer nada si el componente fue desmontado

        try {
            setLoading(true);
            const response = await ApiService.getNextReservaTime();
            if (!isActiveRef.current) return; // Verificar de nuevo después de la API call

            if (response.success && response.data && response.data.fecha && response.data.hora_inicio) {
                const nextClassDateTime = new Date(`${response.data.fecha}T${response.data.hora_inicio}`);
                setNextClassTime(nextClassDateTime);
                console.log('📅 Nueva clase cargada:', nextClassDateTime);
            } else {
                setNextClassTime(null);
                console.log('❌ No hay próxima clase');
            }
        } catch (error) {
            console.error('Error cargando próxima reserva:', error);
            if (isActiveRef.current) {
                setNextClassTime(null);
            }
        } finally {
            if (isActiveRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Función para limpiar timers de forma segura
    const clearTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            console.log('🧹 Timer principal limpiado');
        }
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
            reloadTimeoutRef.current = null;
            console.log('🧹 Timeout de recarga limpiado');
        }
    }, []);

    // Función del timer separada para evitar recreaciones
    const startTimer = useCallback(() => {
        if (!nextClassTime || !isActiveRef.current) return;

        // Limpiar timer existente
        clearTimers();

        console.log('🚀 INICIANDO TIMER ROBUSTO para clase:', nextClassTime);

        timerRef.current = setInterval(() => {
            if (!isActiveRef.current) {
                console.log('⚠️ Componente inactivo, deteniendo timer');
                clearTimers();
                return;
            }

            const now = new Date();
            const timeDiff = nextClassTime - now;
            const twoMinutesInMs = 2 * 60 * 1000;
            const shouldShowAlert = timeDiff <= twoMinutesInMs && timeDiff > 0;

            if (isActiveRef.current) {
                setShowAlert(shouldShowAlert);

                // Notificar al componente padre sobre la alerta
                if (onClassAlert) {
                    onClassAlert(shouldShowAlert);
                }

                if (timeDiff > 0) {
                    setTimeToClass(timeDiff);
                } else {
                    console.log('🏁 Clase terminada, limpiando y recargando...');
                    setTimeToClass(null);
                    setNextClassTime(null);
                    setShowAlert(false);

                    // Limpiar timer actual
                    clearTimers();

                    // Recargar próxima reserva después de que pase la actual
                    reloadTimeoutRef.current = setTimeout(() => {
                        if (isActiveRef.current) {
                            console.log('🔄 Recargando próxima reserva...');
                            loadNextReserva();
                        }
                    }, 5000);
                }
            }
        }, 1000);

    }, [nextClassTime, onClassAlert, clearTimers, loadNextReserva]);

    // Effect para manejar el timer - SIMPLIFICADO
    useEffect(() => {
        if (nextClassTime) {
            startTimer();
        }

        return () => {
            clearTimers();
        };
    }, [nextClassTime, startTimer, clearTimers]);

    // Cargar próxima reserva al montar el componente - SOLO UNA VEZ
    useEffect(() => {
        console.log('🏗️ Montando ClassCountdown');
        isActiveRef.current = true;
        loadNextReserva();

        // Cleanup al desmontar
        return () => {
            console.log('🗑️ Desmontando ClassCountdown');
            isActiveRef.current = false;
            clearTimers();
        };
    }, []); // Dependencias vacías - solo se ejecuta una vez

    // Si está cargando
    if (loading) {
        return (
            <div className="mt-2">
                <div className="d-flex align-items-center justify-content-center p-3 rounded timer-container">
                    <div className="spinner-border spinner-border-sm me-2 text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <small className="text-muted">Verificando próxima clase...</small>
                </div>
            </div>
        );
    }

    // Si no hay próxima clase
    if (!timeToClass) {
        return (
            <div className="mt-2">
                <div className="d-flex align-items-center justify-content-center p-3 rounded timer-container">
                    <small className="text-muted">No tiene una proxima clase confirmada.</small>
                </div>
            </div>
        );
    }

    const timeFormatted = formatTimeToClass(timeToClass);
    const isUrgent = timeToClass <= 5 * 60 * 1000; // 5 minutos
    const isCritical = timeToClass <= 2 * 60 * 1000; // 2 minutos

    return (
        <>
            {/* Alerta de próxima clase crítica */}
            {isCritical && (
                <div className="alert alert-danger alert-dismissible fade show mb-3">
                    <div className="row align-items-center">
                        <div className="col-auto">
                            <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                        </div>
                        <div className="col">
                            <strong className="d-block">¡Tu clase comienza YA!</strong>
                            <div className="small">
                                Solo faltan <span className="fw-bold">{timeFormatted.parts.minutes}m {timeFormatted.formatted.seconds}s</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Timer principal - SOLO Bootstrap */}
            <div className="mt-2 w-100">
                <div className={`timer-container p-3 rounded ${isCritical ? 'bg-danger bg-opacity-10' : isUrgent ? 'bg-warning bg-opacity-10' : 'bg-light'}`}>
                    <div className="row align-items-center g-2">
                        {/* Texto - 12 columnas en móvil, auto en desktop */}
                        <div className="col-12 col-md-auto text-center text-md-start">
                            <span className="fw-medium text-muted">Próxima clase:</span>
                        </div>

                        {/* Timer - 12 columnas en móvil, resto en desktop */}
                        <div className="col-12 col-md">
                            <div className="d-flex justify-content-center justify-content-md-end gap-2 flex-wrap">
                                {timeFormatted.parts.days > 0 && (
                                    <div className="timer-unit bg-white border rounded text-center p-2">
                                        <div className="fw-bold text-dark">{timeFormatted.formatted.days}</div>
                                        <small className="text-muted">d</small>
                                    </div>
                                )}
                                {(timeFormatted.parts.hours > 0 || timeFormatted.parts.days > 0) && (
                                    <div className="timer-unit bg-white border rounded text-center p-2">
                                        <div className="fw-bold text-dark">{timeFormatted.formatted.hours}</div>
                                        <small className="text-muted">h</small>
                                    </div>
                                )}
                                <div className="timer-unit bg-white border rounded text-center p-2">
                                    <div className="fw-bold text-dark">{timeFormatted.formatted.minutes}</div>
                                    <small className="text-muted">m</small>
                                </div>
                                <div className="timer-unit text-center p-2 rounded text-white seconds-unit">
                                    <div className="fw-bold seconds-number">{timeFormatted.formatted.seconds}</div>
                                    <small className="text-white-50">s</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default ClassCountdown;