import React, { useState } from 'react';
import utnLogo from '../assets/UTN_logo.jpg'
import {useNavigate} from "react-router-dom";


const Login = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/home');
        // Aquí iría la lógica de autenticación
        console.log('Datos enviados:', formData);
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
            <div className="login-wrapper w-100 mx-auto text-center" style={{maxWidth: '400px'}}>
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    {/* Cabecera con fondo azul */}
                    <div className="card-header border-0 text-center p-4" style={{backgroundColor: '#283048'}}>
                        <div className="d-flex justify-content-center mb-3">
                            <div className="bg-white rounded-3 p-2" style={{width: '80px', height: '80px'}}>
                                <img src={utnLogo} alt="Logo UTN" className="img-fluid" />
                            </div>
                        </div>
                        <div className="text-white fw-bold fs-4">TutoWeb</div>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="card-body p-4">
                        <h1 className="fw-bold text-center fs-2 mb-1">Login</h1>
                        <p className="text-center text-muted mb-4">Inicia sesión para continuar.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted small">CORREO INSTITUCIONAL</label>
                                <input
                                    type="email"
                                    className="form-control bg-light border-0 py-3 rounded-3"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ingrese su correo institucional"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted small">CONTRASEÑA</label>
                                <input
                                    type="password"
                                    className="form-control bg-light border-0 py-3 rounded-3"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••"
                                />
                            </div>
                            <button type="submit" className="btn btn-dark w-100 py-2 mb-3 rounded-3">
                                Iniciar Sesión
                            </button>
                            <div className="text-center">
                                <a href="#" className="text-muted small d-block mb-2">¿Olvidaste la contraseña?</a>
                                <a href="#" className="text-muted small">Registrarse</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;