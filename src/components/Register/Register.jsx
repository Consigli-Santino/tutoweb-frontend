import React, { useState, useCallback } from 'react';
import utnLogo from '../../assets/UTN_logo.jpg';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import '../Login/LoginButton.css'; // Import the CSS file with spinner animation

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        profileImage: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevState => ({
                ...prevState,
                profileImage: file
            }));

            // Create preview of the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Using lodash debounce for the register function
    const handleSubmit = useCallback(
        _.debounce((e) => {
            e.preventDefault();
            setIsLoading(true);

            // Validate password match
            if (formData.password !== formData.confirmPassword) {
                alert("Las contraseñas no coinciden");
                setIsLoading(false);
                return;
            }

            // Simulate API call with a 500ms delay
            setTimeout(() => {
                console.log('Datos de registro enviados:', formData);
                navigate('/login');
                setIsLoading(false);
            }, 500);
        }, 500, { leading: true, trailing: false }),
        [navigate, formData]
    );

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
            <div className="login-wrapper w-100 mx-auto" style={{maxWidth: '500px'}}>
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
                        <h1 className="fw-bold text-center fs-2 mb-1">Registro</h1>
                        <p className="text-center text-muted mb-4">Crea tu cuenta para comenzar.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted small">NOMBRE</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 py-3 rounded-3"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ingrese su nombre"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted small">APELLIDO</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 py-3 rounded-3"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        placeholder="Ingrese su apellido"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

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
                                    required
                                />
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted small">CONTRASEÑA</label>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0 py-3 rounded-3"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-muted small">CONFIRMAR CONTRASEÑA</label>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0 py-3 rounded-3"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small">FOTO DE PERFIL</label>
                                <div className="d-flex align-items-center">
                                    {imagePreview && (
                                        <div className="me-3">
                                            <img
                                                src={imagePreview}
                                                alt="Vista previa"
                                                className="rounded-circle"
                                                style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control bg-light border-0 py-3 rounded-3"
                                        name="profileImage"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 py-2 mb-3 rounded-3"
                                style={{backgroundColor: '#283048', color: 'white'}}
                                disabled={isLoading}
                            >
                                <div className="login-button-content">
                                    {isLoading && <span className="login-button-spinner"></span>}
                                    Registrarse
                                </div>
                            </button>

                            <div className="text-center">
                                <p className="text-muted small mb-0">
                                    ¿Ya tienes una cuenta?
                                    <a href="/login" className="ms-1">Iniciar sesión</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;