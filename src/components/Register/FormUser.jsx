import React, {useState, useCallback, useEffect} from 'react';
import utnLogo from '../../assets/UTN_logo.jpg';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import '../Login/LoginButton.css';
import CustomSelect from "../CustomInputs/CustomSelect.jsx";

const FormUser = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [carreras, setCarreras] = useState([]);
    const [roles, setRoles] = useState([]);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        profileImage: null,
        id_rol: '',
        carrera_id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar carreras
                const carrerasUrl = (import.meta.env.VITE_BACKEND_URL) + '/carreras/all';
                const carrerasResponse = await fetch(carrerasUrl);
                const carrerasData = await carrerasResponse.json();
                setCarreras(carrerasData.data);

                // Cargar roles
                const rolesUrl = (import.meta.env.VITE_BACKEND_URL) + '/roles/all/register';
                const rolesResponse = await fetch(rolesUrl);
                debugger
                const rolesData = await rolesResponse.json();
                setRoles(rolesData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? (checked ? 'alumno&profesor' : 'alumno') : value
        }));
    };

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

            // Preparar FormData para enviar
            const formDataToSend = new FormData();
            formDataToSend.append('nombre', formData.nombre);
            formDataToSend.append('apellido', formData.apellido);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('es_tutor', formData.role === 'alumno&profesor');

            // Agregar el ID del rol seleccionado
            formDataToSend.append('id_rol', formData.id_rol);

            // Añadir ID de carrera como array
            formDataToSend.append('id_carrera', [formData.carrera_id]);

            // Añadir imagen si existe
            if (formData.profileImage) {
                formDataToSend.append('profile_image', formData.profileImage);
            }

            // Realizar la petición con FormData
            fetch((import.meta.env.VITE_BACKEND_URL) + '/usuario/register-user', {
                method: 'POST',
                body: formDataToSend,
                // No incluir Content-Type header, el navegador lo configura automáticamente
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.detail || 'Error en el registro');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Registro exitoso:', data);
                    alert('Usuario registrado correctamente');
                    navigate('/login');
                })
                .catch(error => {
                    console.error('Error en el registro:', error);
                    alert(error.message || 'Error al registrar usuario');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 500, { leading: true, trailing: false }),
        [navigate, formData]
    );

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-2">
            <div className="login-wrapper w-100 mx-auto" style={{maxWidth: '800px'}}>
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    {/* Cabecera con fondo azul */}
                    <div className="card-header border-0 text-center p-3 p-md-4" style={{backgroundColor: '#283048'}}>
                        <div className="d-flex justify-content-center mb-2">
                            <div className="bg-white rounded-3 p-2" style={{width: '60px', height: '60px'}}>
                                <img src={utnLogo} alt="Logo UTN" className="img-fluid" />
                            </div>
                        </div>
                        <div className="text-white fw-bold fs-4">TutoWeb</div>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="card-body p-3 p-md-4">
                        <h1 className="fw-bold text-center fs-4 mb-1">Registro</h1>
                        <p className="text-center text-muted mb-3 small">Crea tu cuenta para comenzar.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-2">
                                <div className="col-6 mb-2">
                                    <label className="form-label text-muted small mb-1">NOMBRE</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ingrese su nombre"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="col-6 mb-2">
                                    <label className="form-label text-muted small mb-1">APELLIDO</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        placeholder="Ingrese su apellido"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-muted small mb-1">CORREO INSTITUCIONAL</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Ingrese su correo institucional"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-muted small mb-1">CARRERA</label>
                                    <CustomSelect
                                        name="carrera_id"
                                        value={formData.carrera_id}
                                        onChange={handleChange}
                                        options={carreras}
                                        placeholder="Seleccione una carrera"
                                        disabled={isLoading}
                                        required
                                        isSearchable={true}
                                        variant="light"
                                    />
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-muted small mb-1">CONTRASEÑA</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Ingrese la contraseña"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-muted small mb-1">CONFIRMAR CONTRASEÑA</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-12 mb-2">
                                <label className="form-label text-muted small mb-1">¿QUÉ DESEAS SER?</label>
                                <CustomSelect
                                    name="id_rol"
                                    value={formData.id_rol}
                                    onChange={handleChange}
                                    options={roles}
                                    placeholder="Seleccione un rol"
                                    disabled={isLoading}
                                    required
                                    isSearchable={true}
                                    variant="light"
                                />
                            </div>

                            <div className="row g-2 mb-2">
                                <div className="col-md-8 mb-2">
                                    <label className="form-label text-muted small mb-1">FOTO DE PERFIL</label>
                                    <div className="d-flex align-items-center">
                                        {imagePreview && (
                                            <div className="me-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Vista previa"
                                                    className="rounded-circle"
                                                    style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                            name="profileImage"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4 mb-2 d-flex align-items-end">
                                    <div className="form-check mb-1 mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="rolCheck"
                                            name="role"
                                            checked={formData.role === 'alumno&profesor'}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                        <label className="form-check-label text-muted small" htmlFor="rolCheck">
                                            También soy profesor
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-sm w-100 py-2 mb-2 rounded-3"
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

export default FormUser;