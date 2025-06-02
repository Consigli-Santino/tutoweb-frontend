import React, {useState, useCallback, useEffect} from 'react';
import utnLogo from '../../assets/UTN_logo.jpg';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import _ from 'lodash';
import '../Login/LoginButton.css';
import CustomSelect from "../CustomInputs/CustomSelect.jsx";
import { useAuth } from '../../context/AuthContext';
import { useEntidades } from '../../context/EntidadesContext';
import Unauthorized from "../Unauthorized/Unauthorized.jsx";

const FormUser = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { roles: contextRoles, carreras: contextCarreras, isLoading: contextLoading } = useEntidades();
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [carreras, setCarreras] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [originalEmail, setOriginalEmail] = useState('');

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

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                if (contextCarreras && contextCarreras.length > 0) {
                    setCarreras(contextCarreras);
                } else {
                    const carrerasUrl = (import.meta.env.VITE_BACKEND_URL) + '/carreras/all';
                    const carrerasResponse = await fetch(carrerasUrl, {
                        headers: {
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });
                    if (isMounted) {
                        const carrerasData = await carrerasResponse.json();
                        setCarreras(carrerasData.data);
                    }
                }

                const isSuperAdmin = user && user.roles && user.roles.includes('superAdmin');
                if (isSuperAdmin && contextRoles && contextRoles.length > 0) {
                    setRoles(contextRoles);
                } else {
                    const rolesUrl = (import.meta.env.VITE_BACKEND_URL) + '/roles/all/register';
                    const rolesResponse = await fetch(rolesUrl, {
                        headers: {
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });
                    if (isMounted) {
                        const rolesData = await rolesResponse.json();
                        setRoles(rolesData.data);
                    }
                }

                if (emailParam && isMounted) {
                    setIsEditing(true);
                    setOriginalEmail(emailParam);

                    if (user && user.email !== emailParam) {
                        setIsAuthorized(false);
                    } else {
                        await fetchUserData(emailParam);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [emailParam]);

    const fetchUserData = async (email) => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const userUrl = `${import.meta.env.VITE_BACKEND_URL}/usuario/by-email/${email}`;

            const token = localStorage.getItem('token');

            const response = await fetch(userUrl, {
                headers: {
                    'Authorization':'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo obtener la información del usuario');
            }

            const userData = await response.json();
            const user = userData.data;

            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                foto_perfil: null,
                id_rol: user.rol?.id?.toString() || '',
                carrera_id: user.carreras?.[0]?.id?.toString() || ''
            });

            if (user.foto_perfil) {
                const imageUrl = user.foto_perfil.startsWith('http')
                    ? user.foto_perfil
                    : `${import.meta.env.VITE_BACKEND_URL}${user.foto_perfil}`;
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
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevState => ({
                ...prevState,
                foto_perfil: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }

        setIsLoading(true);

        if (!isEditing || (formData.password && formData.confirmPassword)) {
            if (formData.password !== formData.confirmPassword) {
                setError("Las contraseñas no coinciden");
                setIsLoading(false);
                return;
            }
        }

        setError(null);

        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre);
        formDataToSend.append('apellido', formData.apellido);
        formDataToSend.append('email', formData.email);

        if (!isEditing || formData.password) {
            formDataToSend.append('password', formData.password);
        }
        formDataToSend.append('id_rol', formData.id_rol);
        formDataToSend.append('id_carrera', formData.carrera_id);

        if (formData.foto_perfil) {
            formDataToSend.append('profile_image', formData.foto_perfil);
        }

        const url = isEditing
            ? `${import.meta.env.VITE_BACKEND_URL}/usuario/${originalEmail}/form`
            : `${import.meta.env.VITE_BACKEND_URL}/usuario/register-user`;

        const headers = {
            'ngrok-skip-browser-warning': 'true'
        };
        if (isEditing) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            body: formDataToSend,
            headers: headers
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.detail || data.message || (isEditing ? 'Error al actualizar' : 'Error en el registro'));
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(isEditing ? 'Actualización exitosa:' : 'Registro exitoso:', data);
                if (data.success) {
                    alert(isEditing ? 'Usuario actualizado correctamente' : 'Usuario registrado correctamente');
                    navigate(isEditing ? '/home' : '/login');
                } else {
                    setError(data.message || (isEditing ? 'Error al actualizar usuario' : 'Error al registrar usuario'));
                }
            })
            .catch(error => {
                console.error(isEditing ? 'Error en la actualización:' : 'Error en el registro:', error);
                setError(error.message || (isEditing ? 'Error al actualizar usuario' : 'Error al registrar usuario'));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (!isAuthorized) {
        return <Unauthorized />;
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-2">
            <div className="login-wrapper w-100 mx-auto" style={{maxWidth: '800px'}}>
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    <div className="card-header border-0 text-center p-3 p-md-4" style={{backgroundColor: '#283048'}}>
                        <div className="d-flex justify-content-center mb-2">
                            <div className="bg-white rounded-3 p-2" style={{width: '60px', height: '60px'}}>
                                <img src={utnLogo} alt="Logo UTN" className="img-fluid" />
                            </div>
                        </div>
                        <div className="text-white fw-bold fs-4">TutoWeb</div>
                    </div>

                    <div className="card-body p-3 p-md-4">
                        <h1 className="fw-bold text-center fs-4 mb-1">
                            {isEditing ? 'Editar Perfil' : 'Registro'}
                        </h1>
                        <p className="text-center text-muted mb-3 small">
                            {isEditing ? 'Actualiza tus datos personales.' : 'Crea tu cuenta para comenzar.'}
                        </p>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

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
                                        disabled={isLoading || isEditing}
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
                                        {isEditing ? 'NUEVA CONTRASEÑA (dejar en blanco para mantener la actual)' : 'CONTRASEÑA'}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={isEditing ? "Nueva contraseña (opcional)" : "Ingrese la contraseña"}
                                        disabled={isLoading}
                                        required={!isEditing}
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
                                        required={!isEditing || formData.password !== ''}
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

                            <div className="row g-2 mb-3">
                                <div className="col-12 mb-2">
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
                                            name="foto_perfil"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            disabled={isLoading}
                                        />
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
                                    {isEditing ? 'Actualizar Perfil' : 'Registrarse'}
                                </div>
                            </button>

                            <div className="text-center">
                                {!isEditing ? (
                                    <p className="text-muted small mb-0">
                                        ¿Ya tienes una cuenta?
                                        <a href="/login" className="ms-1">Iniciar sesión</a>
                                    </p>
                                ) : (
                                    <p className="text-muted small mb-0">
                                        <a href="/home" className="ms-1">Volver al inicio</a>
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormUser;