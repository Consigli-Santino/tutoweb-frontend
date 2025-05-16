import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirigir automáticamente después de 5 segundos
        const timeout = setTimeout(() => {
            navigate('/reservas');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body text-center p-5">
                            <div className="text-danger mb-4">
                                <i className="bi bi-x-circle-fill" style={{ fontSize: '5rem' }}></i>
                            </div>
                            <h3 className="mb-3">Pago no completado</h3>
                            <p className="mb-4">Hubo un problema al procesar tu pago. Puedes intentarlo nuevamente desde la sección de reservas.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/reservas')}
                            >
                                Volver a mis reservas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;