import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import _ from 'lodash';
import '../Login/LoginButton.css';
import { useEntidades } from "../../context/EntidadesContext.jsx";
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx'; // Importamos nuestro componente personalizado
const API_URL = (import.meta.env.VITE_BACKEND_URL);

const FormUserByAdmin = () => {
    const {
        carreras,
        roles
    } = useEntidades();
    const navigate = useNavigate();
    const { id } = useParams(); // Capturar el ID de la URL si estamos en modo edición
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        foto_perfil: null,
        id_rol: '',
        carrera_id: ''
    });

    // Si hay un ID, cargar los datos del usuario para edición
    useEffect(() => {
        if (id) {
            fetchUsuario();
        }
    }, [id]);

    const fetchUsuario = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const response = await fetch(`${API_URL}/usuario/${id}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener usuario: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setFormData({
                    nombre: data.data.nombre || '',
                    apellido: data.data.apellido || '',
                    email: data.data.email || '',
                    password: '',
                    confirmPassword: '',
                    foto_perfil: null,
                    carrera_id: data.data.carreras[0]?.id?.toString() || '',
                    rol_id: data.data.rol?.id?.toString() || ''
                });
                if (data.data.foto_perfil) {
                    const imageUrl = data.data.foto_perfil.startsWith('http')
                        ? data.data.foto_perfil
                        : `${API_URL}${data.data.foto_perfil}`;
                    console.log('Image URL:', imageUrl);
                    try {
                        const imageResponse = await fetch(imageUrl, {
                            headers: {
                                'ngrok-skip-browser-warning': 'true'
                            }
                        });

                        if (imageResponse.ok) {
                            const blob = await imageResponse.blob();
                            const objectURL = URL.createObjectURL(blob);
                            setImagePreview(objectURL);
                        }
                    } catch (error) {
                        console.error('Error loading image:', error);
                        setImagePreview(imageUrl);
                    }
                }
            } else {
                throw new Error(data.message || 'Error al obtener usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevState => ({
                ...prevState,
                foto_perfil: file
            }));

            // Create preview of the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = useCallback(
        _.debounce(async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setError(null);

            // Validate password match for new users or if password is being changed
            if ((!id && formData.password !== formData.confirmPassword) ||
                (id && formData.password && formData.password !== formData.confirmPassword)) {
                setError("Las contraseñas no coinciden");
                setIsLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No se encontró token de autenticación');
                }

                // Crear FormData para enviar incluyendo la imagen
                const formDataToSend = new FormData();

                // Añadir los campos al FormData
                formDataToSend.append('nombre', formData.nombre);
                formDataToSend.append('apellido', formData.apellido);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('id_carrera', formData.carrera_id); // Cambiado a id_carrera según FormUser
                formDataToSend.append('id_rol', formData.rol_id); // Cambiado a id_rol según FormUser

                // Sólo añadir password si es nuevo usuario o si se está cambiando
                if (!id || (id && formData.password)) {
                    formDataToSend.append('password', formData.password);
                }

                if (formData.foto_perfil) {
                    formDataToSend.append('profile_image', formData.foto_perfil);
                }
                const originalEmail = formData.email; // Esto debe ser el email original, no el nuevo

                // Usar los endpoints exactamente como en FormUser
                const url = id
                    ? `${import.meta.env.VITE_BACKEND_URL}/usuario/${originalEmail}/form`
                    : `${import.meta.env.VITE_BACKEND_URL}/usuario/register-user`;

                const method = id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formDataToSend
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    alert(id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                    navigate('/users');
                } else {
                    throw new Error(data.message || `Error al ${id ? 'actualizar' : 'crear'} usuario`);
                }
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }, 500, { leading: true, trailing: false }),
        [navigate, formData, id]
    );
    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow border-0 rounded-4 overflow-hidden">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="fw-bold fs-4 mb-0">{id ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h1>
                        <button
                            className="btn btn-sm py-2 px-3 rounded-3"
                            style={{backgroundColor: '#f0f0f0'}}
                            onClick={() => navigate('/users')}
                            disabled={isLoading}
                        >
                            Volver
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label className="form-label text-muted small mb-1">NOMBRE</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ingrese nombre"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label text-muted small mb-1">APELLIDO</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    placeholder="Ingrese apellido"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label className="form-label text-muted small mb-1">CORREO ELECTRÓNICO</label>
                                <input
                                    type="email"
                                    className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ingrese correo electrónico"
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
                                <label className="form-label text-muted small mb-1">
                                    {id ? 'NUEVA CONTRASEÑA (opcional)' : 'CONTRASEÑA'}
                                </label>
                                <input
                                    type="password"
                                    className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={id ? "Dejar en blanco para mantener la actual" : "Ingrese contraseña"}
                                    disabled={isLoading}
                                    required={!id}
                                />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label text-muted small mb-1">
                                    {id ? 'CONFIRMAR NUEVA CONTRASEÑA' : 'CONFIRMAR CONTRASEÑA'}
                                </label>
                                <input
                                    type="password"
                                    className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={id ? "Confirmar nueva contraseña" : "Confirme contraseña"}
                                    disabled={isLoading}
                                    required={!id}
                                />
                            </div>
                        </div>

                        <div className="row g-2 mb-3">
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
                            <div className="col-md-4 mb-2">
                                <label className="form-label text-muted small mb-1">ROL</label>
                                <CustomSelect
                                    name="rol_id"
                                    value={formData.rol_id}
                                    onChange={handleChange}
                                    options={roles}
                                    placeholder="Seleccione un rol"
                                    disabled={isLoading}
                                    isSearchable={true}
                                    variant="light"
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-sm py-2 px-4 me-2 rounded-3"
                                style={{backgroundColor: '#f0f0f0'}}
                                onClick={() => navigate('/users')}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-sm py-2 px-4 rounded-3"
                                style={{backgroundColor: '#283048', color: 'white'}}
                                disabled={isLoading}
                            >
                                <div className="login-button-content">
                                    {isLoading && <span className="login-button-spinner"></span>}
                                    {id ? 'Actualizar' : 'Guardar'}
                                </div>
                            </button>
                        </div>
                    </form>

                    {/* Espacio adicional para evitar que el contenido quede detrás del HomeBar en mobile */}
                    <div className="pb-5 mb-4"></div>
                </div>
            </div>
        </div>
    );
};

export default FormUserByAdmin;