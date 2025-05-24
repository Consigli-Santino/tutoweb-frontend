import React, { useState, useEffect } from 'react';
import utnLogo from '../../assets/UTN_logo.jpg';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import './LoginButton.css';
import LoginService from "../../services/LoginService.js";

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    // Detectar si viene del logout
    const isFromLogout = searchParams.get('logout') === 'true';

    useEffect(() => {
        if (!loading && isAuthenticated && !isFromLogout) {
            navigate('/home');
        }

        if (isFromLogout) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [isAuthenticated, loading, navigate, isFromLogout]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const result = await LoginService.login(formData.email, formData.password);

            if (result.success) {
                login(result.data.access_token);
                navigate('/home');
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error inesperado:', error);
            setError('Ocurrió un error inesperado. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading && !isFromLogout) {
        return (
            <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

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
                        <p className="text-center text-muted mb-4">
                            {isFromLogout ? 'Sesión cerrada correctamente. Inicia sesión nuevamente.' : 'Inicia sesión para continuar.'}
                        </p>

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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn w-100 py-2 mb-3 rounded-3"
                                style={{backgroundColor: '#283048', color: 'white'}}
                                disabled={isLoading}
                            >
                                <div className="login-button-content">
                                    {isLoading && <span className="login-button-spinner"></span>}
                                    Iniciar Sesión
                                </div>
                            </button>

                            {/* Mensaje de error */}
                            {error && (
                                <div className="alert alert-danger py-2 text-center mb-3">
                                    {error}
                                </div>
                            )}

                            <div className="text-center">
                                <a href="#" className="text-muted small d-block mb-2">¿Olvidaste la contraseña?</a>
                                <a href="/register" className="text-muted small">Registrarse</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;