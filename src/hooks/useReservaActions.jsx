// hooks/useReservaActions.js
import { useState, useCallback } from 'react';
import ApiService from '../services/ApiService';

export const useReservaActions = (activeTab, onSuccess, onError) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingAction, setProcessingAction] = useState(null);

    // Función genérica para manejar acciones de reserva
    const handleReservaAction = useCallback(async (reservaId, action, options = {}) => {
        setIsProcessing(true);
        setProcessingAction(`${action}_${reservaId}`);

        try {
            const reservaActual = await ApiService.getReservaDetallada(reservaId);
            if (!reservaActual.success) {
                throw new Error(reservaActual.message || 'Error procesando la reserva');
            }

            let response;
            let successMessage;
            let newState;
            let emailContext = {};

            switch (action) {
                case 'cancelar':
                    newState = 'cancelada';
                    emailContext = {
                        canceladoPor: activeTab === 'tutor' ? 'tutor' : 'estudiante',
                        usuarioQueEjecuta: activeTab,
                        ...options.context
                    };
                    response = await ApiService.updateReserva(reservaId, { estado: newState }, emailContext);
                    successMessage = options.successMessage || "Reserva cancelada correctamente";
                    break;

                case 'confirmar':
                    newState = 'confirmada';
                    emailContext = {
                        usuarioQueEjecuta: activeTab,
                        ...options.context
                    };
                    response = await ApiService.updateReserva(reservaId, { estado: newState }, emailContext);
                    successMessage = options.successMessage || "Reserva confirmada correctamente";
                    break;

                case 'completar':
                    newState = 'completada';
                    emailContext = {
                        usuarioQueEjecuta: activeTab,
                        ...options.context
                    };
                    response = await ApiService.updateReserva(reservaId, { estado: newState }, emailContext);
                    successMessage = options.successMessage || "Reserva marcada como completada correctamente";
                    break;

                default:
                    throw new Error(`Acción no reconocida: ${action}`);
            }

            if (response.success) {
                onSuccess?.(successMessage, {
                    reservaId,
                    action,
                    newState,
                    previousState: reservaActual.data.estado
                });
                return response;
            } else {
                throw new Error(response.message || `Error al ${action} la reserva`);
            }
        } catch (error) {
            onError?.(`Error al ${action} reserva: ${error.message}`, {
                reservaId,
                action,
                error: error.message
            });
            throw error;
        } finally {
            setIsProcessing(false);
            setProcessingAction(null);
        }
    }, [activeTab, onSuccess, onError]);

    // Funciones específicas para cada acción
    const cancelarReserva = useCallback((reservaId, options = {}) => {
        return handleReservaAction(reservaId, 'cancelar', {
            successMessage: "La reserva ha sido cancelada. Se ha notificado a las partes involucradas.",
            ...options
        });
    }, [handleReservaAction]);

    const confirmarReserva = useCallback((reservaId, options = {}) => {
        return handleReservaAction(reservaId, 'confirmar', {
            successMessage: "La reserva ha sido confirmada. El estudiante recibirá una notificación por email.",
            ...options
        });
    }, [handleReservaAction]);

    const completarReserva = useCallback((reservaId, options = {}) => {
        return handleReservaAction(reservaId, 'completar', {
            successMessage: "La reserva ha sido marcada como completada. Ambos participantes han sido notificados.",
            ...options
        });
    }, [handleReservaAction]);

    // Función para manejar pagos
    const procesarPago = useCallback(async (reserva, metodo, options = {}) => {
        setIsProcessing(true);
        setProcessingAction(`pago_${reserva.id}`);

        try {
            const pagoData = {
                reserva_id: reserva.id,
                monto: reserva.servicio.precio,
                metodo_pago: metodo
            };

            const response = await ApiService.createPago(pagoData, options.context);

            if (response.success) {
                let successMessage;
                if (metodo === 'mercado_pago') {
                    successMessage = "Redirigiendo a Mercado Pago para completar el pago...";
                    if (response.data.payment_url) {
                        window.open(response.data.payment_url, '_blank');
                    }
                } else {
                    successMessage = "Pago en efectivo registrado correctamente.";
                }

                onSuccess?.(successMessage, {
                    reservaId: reserva.id,
                    metodo,
                    pagoId: response.data.id,
                    monto: pagoData.monto
                });

                return response;
            } else {
                throw new Error(response.message || 'Error procesando el pago');
            }
        } catch (error) {
            onError?.(`Error procesando pago: ${error.message}`, {
                reservaId: reserva.id,
                metodo,
                error: error.message
            });
            throw error;
        } finally {
            setIsProcessing(false);
            setProcessingAction(null);
        }
    }, [onSuccess, onError]);

    // Función para confirmar pagos en efectivo
    const confirmarPagoEfectivo = useCallback(async (pagoId, options = {}) => {
        setIsProcessing(true);
        setProcessingAction(`confirmar_pago_${pagoId}`);

        try {
            const response = await ApiService.updatePagoEstado(pagoId, 'completado', options.context);

            if (response.success) {
                onSuccess?.("Pago en efectivo confirmado correctamente. El estudiante recibirá una notificación.", {
                    pagoId,
                    action: 'confirmar_pago'
                });
                return response;
            } else {
                throw new Error(response.message || 'Error confirmando el pago');
            }
        } catch (error) {
            onError?.(`Error confirmando pago: ${error.message}`, {
                pagoId,
                error: error.message
            });
            throw error;
        } finally {
            setIsProcessing(false);
            setProcessingAction(null);
        }
    }, [onSuccess, onError]);

    // Función para enviar calificación
    const enviarCalificacion = useCallback(async (reserva, rating, comment, options = {}) => {
        setIsProcessing(true);
        setProcessingAction(`calificar_${reserva.id}`);

        try {
            const calificacionData = {
                reserva_id: reserva.id,
                calificador_id: options.userId,
                calificado_id: reserva.tutor.id,
                puntuacion: rating,
                comentario: comment
            };

            const response = await ApiService.createCalificacion(calificacionData);

            if (response.success) {
                onSuccess?.("Calificación enviada correctamente. ¡Gracias por tu feedback!", {
                    reservaId: reserva.id,
                    rating,
                    comment
                });
                return response;
            } else {
                throw new Error(response.message || 'Error enviando calificación');
            }
        } catch (error) {
            onError?.(`Error enviando calificación: ${error.message}`, {
                reservaId: reserva.id,
                error: error.message
            });
            throw error;
        } finally {
            setIsProcessing(false);
            setProcessingAction(null);
        }
    }, [onSuccess, onError]);

    // Función para enviar email manual
    const enviarEmailManual = useCallback(async (tipo, data, options = {}) => {
        setIsProcessing(true);
        setProcessingAction(`email_${tipo}`);

        try {
            const response = await ApiService.enviarEmailManual(tipo, data, options.context);

            if (response.success) {
                onSuccess?.(`Email de ${tipo} enviado correctamente.`, {
                    tipo,
                    data
                });
                return response;
            } else {
                throw new Error(response.error || 'Error enviando email');
            }
        } catch (error) {
            onError?.(`Error enviando email: ${error.message}`, {
                tipo,
                error: error.message
            });
            throw error;
        } finally {
            setIsProcessing(false);
            setProcessingAction(null);
        }
    }, [onSuccess, onError]);

    // Función para verificar si una acción está en proceso
    const isActionProcessing = useCallback((action, reservaId = null) => {
        if (!processingAction) return false;

        if (reservaId) {
            return processingAction === `${action}_${reservaId}`;
        }

        return processingAction.startsWith(action);
    }, [processingAction]);

    return {
        isProcessing,
        processingAction,
        cancelarReserva,
        confirmarReserva,
        completarReserva,
        procesarPago,
        confirmarPagoEfectivo,
        enviarCalificacion,
        enviarEmailManual,
        isActionProcessing,
        handleReservaAction
    };
};

export default useReservaActions;