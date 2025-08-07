import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntidades } from '../../../context/EntidadesContext.jsx';
import { useAuth } from '../../../context/AuthContext';
import CustomSelect from '../../../components/CustomInputs/CustomSelect';
import '../../../commonTables.css';
import ApiService from '../../../services/ApiService';

const TutorsCRUDServiciosTutoria = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getMateriasByTutor, refreshCommonData } = useEntidades();

    const carreraId = user.carreras[0]?.id;
    const [tutorMaterias, setTutorMaterias] = useState([]);
    const [tutorServicios, setTutorServicios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estado para nuevo servicio o edición
    const [editingServicio, setEditingServicio] = useState(null);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [formData, setFormData] = useState({
        precio: '',
        modalidad: 'virtual',
        descripcion: ''
    });

    // Opciones para modalidad
    const modalidadOptions = [
        { id: 'virtual', nombre: 'Virtual' }
    ];

    useEffect(() => {
        fetchData();
    }, [carreraId]);

    const fetchData = async () => {
        if (!carreraId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Obtener materias del tutor
            const materiasResponse = await getMateriasByTutor(user.id, carreraId);
            if (materiasResponse && materiasResponse.success) {
                const materiasActivas = materiasResponse.data
                    .filter(item => item.materia && item.estado === true)
                    .map(item => ({
                        ...item.materia,
                        relacionId: item.id
                    }));
                setTutorMaterias(materiasActivas);
            }

            // Obtener servicios del tutor
            const serviciosResponse = await ApiService.fetchApi(`/servicios/tutor/${user.email}`);
            if (serviciosResponse.success) {
                setTutorServicios(serviciosResponse.data);
            }
        } catch (err) {
            setError(`Error al cargar datos: ${err.message}`);
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSelectChange = (e, field) => {
        setFormData({
            ...formData,
            [field]: e.target.value
        });
    };

    const handleMateriaSelect = (materia) => {
        // Verificar si ya existe un servicio para esta materia
        const existingServicio = tutorServicios.find(s => s.materia_id === materia.id);

        if (existingServicio) {
            setEditingServicio(existingServicio.id);
            setFormData({
                precio: existingServicio.precio.toString(),
                modalidad: existingServicio.modalidad,
                descripcion: existingServicio.descripcion || ''
            });
        } else {
            setEditingServicio(null);
            setFormData({
                precio: '',
                modalidad: 'virtual',
                descripcion: ''
            });
        }

        setSelectedMateria(materia);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMateria) {
            setError("Debes seleccionar una materia");
            return;
        }

        if (!formData.precio) {
            setError("Debes indicar un precio");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            let response;

            if (editingServicio) {
                // Actualizar servicio existente
                response = await ApiService.updateServicio(editingServicio, {
                    precio: parseFloat(formData.precio),
                    modalidad: formData.modalidad,
                    descripcion: formData.descripcion
                });
            } else {
                // Crear nuevo servicio
                response = await ApiService.createServicio({
                    tutor_id: user.id,
                    materia_id: selectedMateria.id,
                    precio: parseFloat(formData.precio),
                    modalidad: formData.modalidad,
                    descripcion: formData.descripcion,
                    activo: true
                });
            }

            if (response && response.success) {
                setSuccess(editingServicio
                    ? `Servicio para "${selectedMateria.nombre}" actualizado correctamente`
                    : `Servicio para "${selectedMateria.nombre}" creado correctamente`);

                // Limpiar formulario
                setSelectedMateria(null);
                setEditingServicio(null);
                setFormData({
                    precio: '',
                    modalidad: 'virtual',
                    descripcion: ''
                });

                // Actualizar lista de servicios
                fetchData();

                // Limpiar mensaje después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(response?.message || 'Error al procesar el servicio');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error processing servicio:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteServicio = async (id, nombreMateria) => {
        if (!window.confirm(`¿Está seguro que desea eliminar el servicio para ${nombreMateria}?`)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await ApiService.deleteServicio(id);

            if (response && response.success) {
                setSuccess(`Servicio para "${nombreMateria}" eliminado correctamente`);

                // Si estábamos editando este servicio, limpiar el formulario
                if (editingServicio === id) {
                    setSelectedMateria(null);
                    setEditingServicio(null);
                    setFormData({
                        precio: '',
                        modalidad: 'virtual',
                        descripcion: ''
                    });
                }

                // Actualizar lista de servicios
                fetchData();

                // Limpiar mensaje después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(response?.message || 'Error al eliminar el servicio');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            console.error("Error deleting servicio:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Mis Servicios de Tutoría</h1>
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={handleBack}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver
                        </button>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {/* Mensajes de error/éxito */}
                    {error && (
                        <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success shadow-sm rounded-3" role="alert">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            {success}
                        </div>
                    )}

                    {/* Sección de servicios actuales */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-mortarboard me-2 text-primary"></i>
                            Servicios que ofrezco
                        </h2>

                        <div className="servicios-container">
                            {isLoading ? (
                                <div className="d-flex justify-content-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : tutorServicios.length > 0 ? (
                                <div className="row g-3">
                                    {tutorServicios.map((servicio) => (
                                        <div key={servicio.id} className="col-12 col-md-6 col-lg-4">
                                            <div className="materia-card">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h3 className="materia-title">{servicio.materia?.nombre}</h3>
                                                        <div className="d-flex flex-wrap mt-2">
                                                            <span className="materia-year-badge me-1 mb-1">
                                                                ${servicio.precio}
                                                            </span>
                                                            <span className="materia-year-badge me-1 mb-1">
                                                                {servicio.modalidad.charAt(0).toUpperCase() + servicio.modalidad.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex">
                                                        <button
                                                            className="btn-edit-materia me-2"
                                                            onClick={() => handleMateriaSelect(servicio.materia)}
                                                            title="Editar servicio"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn-remove-materia"
                                                            onClick={() => handleDeleteServicio(servicio.id, servicio.materia?.nombre)}
                                                            title="Eliminar servicio"
                                                        ><i className="bi bi-x-circle"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {servicio.descripcion && (
                                                    <p className="materia-description">{servicio.descripcion}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="bi bi-mortarboard-fill empty-state-icon"></i>
                                    <p>Aún no has configurado servicios de tutoría</p>
                                    <p className="text-muted">Configura tus servicios utilizando el formulario inferior</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulario para crear/editar servicio */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-plus-circle me-2 text-success"></i>
                            {editingServicio ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-3">
                                {/* Selección de materia */}
                                <div className="col-12 mb-3">
                                    <label className="form-label fw-bold">Materia</label>

                                    {tutorMaterias.length > 0 ? (
                                        <div className="row g-3">
                                            {tutorMaterias.map((materia) => (
                                                <div key={materia.id} className="col-12 col-md-6 col-lg-4">
                                                    <div
                                                        className={`materia-card cursor-pointer ${selectedMateria?.id === materia.id ? 'border-primary' : ''}`}
                                                        onClick={() => handleMateriaSelect(materia)}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h3 className="materia-title">{materia.nombre}</h3>
                                                                {materia.año_plan && (
                                                                    <span className="materia-year-badge">
                                                                        Plan {materia.año_plan}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`badge ${selectedMateria?.id === materia.id ? 'bg-primary' : 'bg-light text-dark'}`}>
                                                                {selectedMateria?.id === materia.id ? 'Seleccionada' : 'Seleccionar'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            No tienes materias asignadas. Primero debes asignar materias en la sección "Mis Materias".
                                        </div>
                                    )}
                                </div>

                                {selectedMateria && (
                                    <>
                                        {/* Precio */}
                                        <div className="col-12 col-md-4">
                                            <label htmlFor="precio" className="form-label">Precio por hora ($)</label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="precio"
                                                    name="precio"
                                                    placeholder="Ej: 1500"
                                                    value={formData.precio}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Modalidad */}
                                        <div className="col-12 col-md-4">
                                            <label htmlFor="modalidad" className="form-label">Modalidad</label>
                                            <CustomSelect
                                                id="modalidad"
                                                value={formData.modalidad}
                                                onChange={(e) => handleSelectChange(e, 'modalidad')}
                                                options={modalidadOptions}
                                                placeholder="Seleccione modalidad"
                                                className="form-select"
                                                required
                                            />
                                        </div>

                                        {/* Descripción */}
                                        <div className="col-12">
                                            <label htmlFor="descripcion" className="form-label">Descripción (opcional)</label>
                                            <textarea
                                                className="form-control"
                                                id="descripcion"
                                                name="descripcion"
                                                rows="3"
                                                placeholder="Describe brevemente tu servicio..."
                                                value={formData.descripcion}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="col-12 d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    setSelectedMateria(null);
                                                    setEditingServicio(null);
                                                    setFormData({
                                                        precio: '',
                                                        modalidad: 'virtual',
                                                        descripcion: ''
                                                    });
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn app-primary"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                ) : (
                                                    <i className="bi bi-check-circle me-2"></i>
                                                )}
                                                {editingServicio ? 'Actualizar Servicio' : 'Crear Servicio'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="home-bar-spacing"></div>
                </div>
            </div>
        </div>
    );
};

export default TutorsCRUDServiciosTutoria;