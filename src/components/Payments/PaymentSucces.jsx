import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const updatePaymentStatus = async () => {
            try {
                // Aquí podrías verificar el estado del pago con Mercado Pago
                // Podrías obtener el ID de la reserva de la URL si lo pasaste como parámetro

                setTimeout(() => {
                    setLoading(false);
                }, 2000);

                // Redirigir automáticamente después de 5 segundos
                setTimeout(() => {
                    navigate('/reservas');
                }, 5000);
            } catch (error) {
                console.error('Error verificando el pago:', error);
                setLoading(false);
            }
        };

        updatePaymentStatus();
    }, [navigate]);

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
                            ) : (
                                <>
                                    <div className="text-success mb-4">
                                        <i className="bi bi-check-circle-fill" style={{ fontSize: '5rem' }}></i>
                                    </div>
                                    <h3 className="mb-3">¡Pago exitoso!</h3>
                                    <p className="mb-4">Tu pago ha sido procesado correctamente.</p>
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