import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntidades } from '../../../context/EntidadesContext.jsx';
import { useAuth } from '../../../context/AuthContext';
import CustomSelect from '../../../components/CustomInputs/CustomSelect';
import '../../../commonTables.css';
import ApiService from '../../../services/ApiService'; // Importado directamente para las operaciones no expuestas por EntidadesContext

const TutorsCRUDMaterias = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        getMateriasByTutor,
        getMateriasByCarrera,
        refreshCommonData,
    } = useEntidades();

    const carreraId = user.carreras[0]?.id; // Obtener el ID de la primera carrera del usuario
    const [tutorMaterias, setTutorMaterias] = useState([]);
    const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const [filteredMaterias, setFilteredMaterias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [añoPlanFilter, setAñoPlanFilter] = useState('');
    const añosDisponibles = Array.from({ length: 10 }, (_, i) => ({
        id: (new Date().getFullYear() - i).toString(),
        nombre: (new Date().getFullYear() - i).toString()
    }));

    useEffect(() => {
        fetchData();
    }, [carreraId, ]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, añoPlanFilter, materiasDisponibles]);

    const fetchData = async () => {
        if (!carreraId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await getMateriasByTutor(user.id, carreraId);

            if (response && response.success) {
                // Procesar las materias asignadas
                const materiasAsignadas = response.data
                    .filter(item => item.materia) // Asegurar que materia existe
                    .map(item => ({
                        ...item.materia,
                        relacionId: item.id,
                        estado: item.estado
                    }));

                // Guardar las materias activas del tutor
                setTutorMaterias(materiasAsignadas.filter(m => m.estado === true));

                // Cambiar el nombre de la variable para evitar sobreescribir 'response'
                const responseMaterias = await getMateriasByCarrera(carreraId);
                if (responseMaterias && responseMaterias.success) {
                    setFilteredMaterias(responseMaterias.data);
                    setMateriasDisponibles(responseMaterias.data);
                }
                const allMateriasList = responseMaterias.data;
                if (allMateriasList && allMateriasList.length > 0) {
                    const materiasAsignadasIds = new Set(materiasAsignadas.map(m => m.id));
                    const disponibles = allMateriasList
                        .filter(m => m.carrera_id === carreraId && !materiasAsignadasIds.has(m.id));
                    setMateriasDisponibles(disponibles);
                }
            } else {
                throw new Error(response?.message || 'Error al obtener materias');
            }
        } catch (err) {
            setError(`Error al cargar datos: ${err.message}`);
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...materiasDisponibles];

        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(materia =>
                materia.nombre.toLowerCase().includes(searchTermLower) ||
                (materia.descripcion && materia.descripcion.toLowerCase().includes(searchTermLower))
            );
        }

        if (añoPlanFilter) {
            result = result.filter(materia =>
                materia.año_plan && materia.año_plan.toString() === añoPlanFilter
            );
        }

        setFilteredMaterias(result);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAñoPlanFilterChange = (e) => {
        setAñoPlanFilter(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setAñoPlanFilter('');
    };

    const handleAddMateria = async (materiaId) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Crear la relación materia-carrera-usuario usando ApiService directamente
            const response = await ApiService.fetchApi('/materias-carrera-usuario/create', 'POST', {
                estado: true,
                usuario_id: user.id,
                materia_id: materiaId,
                carrera_id: carreraId
            });

            if (response.success) {
                // Obtener el nombre de la materia para el mensaje de éxito
                const selectedMateria = materiasDisponibles.find(m => m.id === materiaId);
                setSuccess(`Materia "${selectedMateria.nombre}" añadida correctamente`);

                // Limpiar el mensaje de éxito después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);

                // Actualizar datos
                fetchData();
            } else {
                throw new Error(response.message || 'Error al añadir la materia');
            }
        } catch (err) {
            setError(`Error al añadir materia: ${err.message}`);
            console.error("Error adding materia:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMateria = async (relacionId) => {
        if (!window.confirm('¿Está seguro que desea eliminar esta materia de su perfil?')) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Eliminar la relación materia-carrera-usuario usando ApiService directamente
            const response = await ApiService.fetchApi(`/materias-carrera-usuario/${relacionId}`, 'DELETE');

            if (response.success) {
                // Obtener el nombre de la materia para el mensaje de éxito
                const materiaEliminada = tutorMaterias.find(m => m.relacionId === relacionId);
                setSuccess(`Materia "${materiaEliminada?.nombre || ''}" eliminada correctamente`);

                // Limpiar el mensaje de éxito después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);

                // Actualizar datos
                fetchData();
            } else {
                throw new Error(response.message || 'Error al eliminar la materia');
            }
        } catch (err) {
            setError(`Error al eliminar materia: ${err.message}`);
            console.error("Error removing materia:", err);
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
                        <h1 className="fw-bold fs-4 mb-0">Mis Materias</h1>
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

                    {/* Sección de materias asignadas */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-journal-check me-2 text-primary"></i>
                            Materias que tutorizo
                        </h2>

                        <div className="assigned-materias-container">
                            {isLoading ? (
                                <div className="d-flex justify-content-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : tutorMaterias.length > 0 ? (
                                <div className="row g-3">
                                    {tutorMaterias.map((materia) => (
                                        <div key={materia.relacionId} className="col-12 col-md-6 col-lg-4">
                                            <div className="materia-card">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h3 className="materia-title">{materia.nombre}</h3>
                                                        {materia.año_plan && (
                                                            <span className="materia-year-badge">
                                                                Plan {materia.año_plan}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="btn-remove-materia"
                                                        onClick={() => handleRemoveMateria(materia.relacionId)}
                                                        title="Eliminar materia"
                                                    >
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </div>

                                                {materia.descripcion && (
                                                    <p className="materia-description">{materia.descripcion}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="bi bi-journal-x empty-state-icon"></i>
                                    <p>Aún no tienes materias asignadas</p>
                                    <p className="text-muted">Selecciona materias de la lista inferior para comenzar a tutorizar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección para agregar materias */}
                    <div>
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-journal-plus me-2 text-success"></i>
                            Añadir Materias
                        </h2>

                        {/* Filtros */}
                        <div className="filter-container mb-4 p-3 shadow-sm">
                            <div className="row g-2">
                                <div className="col-12 col-md-6 mb-2">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-0">
                                            <i className="bi bi-search text-muted"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm border-0 py-2"
                                            placeholder="Buscar por nombre o descripción..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="row g-2">
                                        <div className="col-8 mb-2">
                                            <CustomSelect
                                                value={añoPlanFilter}
                                                onChange={handleAñoPlanFilterChange}
                                                options={añosDisponibles}
                                                placeholder="Todos los planes"
                                                className="bg-white border-0 py-2 rounded-3"
                                                variant="light"
                                            />
                                        </div>
                                        <div className="col-4 mb-2 d-flex align-items-center">
                                            <button
                                                className="btn btn-sm py-2 w-100 rounded-3 btn-light border-0"
                                                onClick={clearFilters}
                                                title="Limpiar filtros"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lista de materias disponibles */}
                        <div className="available-materias-container">
                            {isLoading ? (
                                <div className="d-flex justify-content-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : filteredMaterias.length > 0 ? (
                                <div className="row g-3">
                                    {filteredMaterias.map((materia) => (
                                        <div key={materia.id} className="col-12 col-md-6 col-lg-4">
                                            <div className="materia-card materia-card-available">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h3 className="materia-title">{materia.nombre}</h3>
                                                        {materia.año_plan && (
                                                            <span className="materia-year-badge">
                                                                Plan {materia.año_plan}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="btn-add-materia"
                                                        onClick={() => handleAddMateria(materia.id)}
                                                        title="Añadir materia"
                                                    >
                                                        <i className="bi bi-plus-circle"></i>
                                                    </button>
                                                </div>

                                                {materia.descripcion && (
                                                    <p className="materia-description">{materia.descripcion}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="bi bi-search empty-state-icon"></i>
                                    <p>{materiasDisponibles.length === 0 && !isLoading ?
                                        "No hay materias disponibles para agregar" :
                                        "No se encontraron materias con los filtros actuales"}
                                    </p>
                                    {searchTerm || añoPlanFilter ? (
                                        <button
                                            className="btn btn-sm mt-2 app-primary"
                                            onClick={clearFilters}
                                        >
                                            Limpiar filtros
                                        </button>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="home-bar-spacing"></div>
                </div>
            </div>
        </div>
    );
};

export default TutorsCRUDMaterias;