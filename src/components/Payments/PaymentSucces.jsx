import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService'; // Asegúrate de tener la ruta correcta a ApiService

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const updatePaymentStatus = async () => {
            try {
                // Obtener parámetros de la URL
                const reservaId = searchParams.get('reserva_id');
                const pagoId = searchParams.get('pago_id');
                const paymentId = searchParams.get('payment_id');

                console.log(`Pago exitoso: Reserva ID=${reservaId}, Pago ID=${pagoId}, Payment ID=${paymentId}`);

                // Si tenemos un ID de reserva, intentamos verificar el estado
                if (reservaId) {
                    try {
                        const response = await ApiService.fetchPagoByReserva(reservaId);
                        if (response.success && response.data) {
                            console.log('Estado del pago:', response.data.estado);
                        }
                    } catch (apiError) {
                        console.error('Error al verificar el pago:', apiError);
                        // No establecemos error para mantener la experiencia positiva
                    }
                }

                // Simular una carga breve
                setTimeout(() => {
                    setLoading(false);
                }, 1500);

                // Redirigir automáticamente después de 5 segundos
                const redirectTimer = setTimeout(() => {
                    navigate('/reservas');
                }, 5000);

                // Limpieza del temporizador si el componente se desmonta
                return () => {
                    clearTimeout(redirectTimer);
                };

            } catch (err) {
                console.error('Error procesando resultado del pago:', err);
                setError('Hubo un problema al procesar el resultado del pago');
                setLoading(false);
            }
        };

        updatePaymentStatus();
    }, [navigate, searchParams]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body text-center p-5">
                            {loading ? (
                                <>
                                    <div className="spinner-border text-success mb-4" style={{ width: '3rem', height: '3rem' }} role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <h3>Procesando pago...</h3>
                                </>
                            ) : error ? (
                                <>
                                    <div className="text-warning mb-4">
                                        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '5rem' }}></i>
                                    </div>
                                    <h3 className="mb-3">Pago recibido</h3>
                                    <p className="mb-4">Tu pago ha sido registrado, pero hubo un problema al actualizar el sistema. No te preocupes, el equipo de soporte verificará tu pago.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/reservas')}
                                    >
                                        Volver a mis reservas
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-success mb-4">
                                        <i className="bi bi-check-circle-fill" style={{ fontSize: '5rem' }}></i>
                                    </div>
                                    <h3 className="mb-3">¡Pago exitoso!</h3>
                                    <p className="mb-4">Tu pago ha sido procesado correctamente. Serás redirigido automáticamente a tus reservas.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/reservas')}
                                    >
                                        Volver a mis reservas
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;