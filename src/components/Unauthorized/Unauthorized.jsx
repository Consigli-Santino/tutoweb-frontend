// components/Unauthorized/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import utnLogo from '../../assets/UTN_logo.jpg';

const Unauthorized = () => {
    // Colores de TutoWeb
    const backgroundColor = '#283048';

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
            <div className="w-100 mx-auto text-center" style={{maxWidth: '600px'}}>
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    {/* Cabecera con fondo azul */}
                    <div className="card-header border-0 text-center p-4" style={{backgroundColor: backgroundColor}}>
                        <div className="d-flex justify-content-center mb-3">
                            <div className="bg-white rounded-3 p-2" style={{width: '80px', height: '80px'}}>
                                <img src={utnLogo} alt="Logo UTN" className="img-fluid" />
                            </div>
                        </div>
                        <div className="text-white fw-bold fs-4">TutoWeb</div>
                    </div>

                    {/* Contenido del mensaje de error */}
                    <div className="card-body p-4">
                        <div className="py-4">
                            <h1 className="display-1 fw-bold text-danger">301</h1>
                            <div className="border-bottom border-danger mx-auto mb-4" style={{ width: '100px' }}></div>

                            <h2 className="fw-bold fs-2 mb-3" style={{color: backgroundColor}}>Acceso Denegado</h2>

                            <div className="alert alert-danger py-3 mb-4">
                                <span className="fs-6">No tienes permisos suficientes para acceder a esta sección</span>
                            </div>

                            <p className="text-muted mb-4">
                                Esta página ha sido movida permanentemente o requiere privilegios especiales para acceder.
                            </p>

                            <div className="d-grid gap-3 col-md-8 mx-auto">
                                <Link
                                    to="/home"
                                    className="btn py-2 rounded-3"
                                    style={{backgroundColor: backgroundColor, color: 'white'}}
                                >
                                    Volver al inicio
                                </Link>

                                <Link
                                    to="/login"
                                    className="btn btn-outline-secondary py-2 rounded-3"
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;