import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { useEntidades } from '../../context/EntidadesContext';

const MateriasCRUD = () => {
    const { materias: contextMaterias, carreras: contextCarreras, refreshCommonData } = useEntidades();

    const [materias, setMaterias] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [filteredMaterias, setFilteredMaterias] = useState([]);
    const [displayedMaterias, setDisplayedMaterias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [carreraFilter, setCarreraFilter] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentMateria, setCurrentMateria] = useState({
        nombre: '',
        carrera_id: '',
        descripcion: '',
        año_plan: ''
    });

    // Número de materias a mostrar
    const ITEMS_PER_PAGE = 10;

    // Usar materias y carreras del contexto si están disponibles
    useEffect(() => {
        if (contextMaterias.length > 0) {
            setMaterias(contextMaterias);
            setFilteredMaterias(contextMaterias);
            setIsLoading(false);
        } else {
            fetchMaterias();
        }
    }, [contextMaterias]);

    useEffect(() => {
        if (contextCarreras.length > 0) {
            setCarreras(contextCarreras);

            // Inicializar el carrera_id de la materia actual si no está establecido
            if (contextCarreras.length > 0 && !currentMateria.carrera_id) {
                setCurrentMateria(prev => ({
                    ...prev,
                    carrera_id: contextCarreras[0].id
                }));
            }
        } else {
            fetchCarreras();
        }
    }, [contextCarreras]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, carreraFilter, materias]);

    useEffect(() => {
        const sortedMaterias = [...filteredMaterias].sort((a, b) => b.id - a.id);
        setDisplayedMaterias(sortedMaterias.slice(0, ITEMS_PER_PAGE));
    }, [filteredMaterias]);

    const fetchMaterias = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ApiService.getMaterias();
            if (response.success) {
                setMaterias(response.data);
                setFilteredMaterias(response.data);
            } else {
                throw new Error(response.message || 'Error al obtener materias');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCarreras = async () => {
        try {
            const response = await ApiService.getCarreras();
            if (response.success) {
                setCarreras(response.data);
                if (response.data.length > 0 && !currentMateria.carrera_id) {
                    setCurrentMateria(prev => ({
                        ...prev,
                        carrera_id: response.data[0].id
                    }));
                }
            } else {
                throw new Error(response.message || 'Error al obtener carreras');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const applyFilters = () => {
        let result = [...materias];

        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(materia =>
                materia.nombre.toLowerCase().includes(searchTermLower) ||
                materia.descripcion?.toLowerCase().includes(searchTermLower)
            );
        }

        if (carreraFilter) {
            result = result.filter(materia =>
                materia.carrera_id.toString() === carreraFilter
            );
        }

        setFilteredMaterias(result);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCarreraFilterChange = (e) => {
        setCarreraFilter(e.target.value);
    };

    const handleShowCreateModal = () => {
        setCurrentMateria({
            nombre: '',
            carrera_id: carreras.length > 0 ? carreras[0].id : '',
            descripcion: '',
            año_plan: ''
        });
        setModalMode('create');
        setShowModal(true);
    };

    const handleShowEditModal = (materia) => {
        setCurrentMateria({
            id: materia.id,
            nombre: materia.nombre,
            carrera_id: materia.carrera_id,
            descripcion: materia.descripcion || '',
            año_plan: materia.año_plan || ''
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentMateria(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveMateria = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (modalMode === 'create') {
                response = await ApiService.createMateria(currentMateria);
            } else {
                response = await ApiService.updateMateria(currentMateria.id, currentMateria);
            }

            if (response.success) {
                setShowModal(false);
                // Refrescar datos en el contexto global
                refreshCommonData();
                await fetchMaterias();
            } else {
                throw new Error(response.message || `Error al ${modalMode === 'create' ? 'crear' : 'editar'} la materia`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMateria = async (id) => {
        if (!window.confirm('¿Está seguro que desea eliminar esta materia?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await ApiService.deleteMateria(id);

            if (response.success) {
                refreshCommonData();
                await fetchMaterias();
            } else {
                throw new Error(response.message || 'Error al eliminar la materia');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getCarreraById = (id) => {
        const carrera = carreras.find(c => c.id === id);
        return carrera ? carrera.nombre : 'N/A';
    };

    return (
        <div>
            <div className="mb-4 p-3 bg-light rounded shadow-sm">
                <div className="row g-2">
                    <div className="col-12 col-md-4 mb-2">
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
                    <div className="col-12 col-md-4 mb-2">
                        <select
                            className="form-select form-select-sm py-2"
                            value={carreraFilter}
                            onChange={handleCarreraFilterChange}
                        >
                            <option value="">Todas las carreras</option>
                            {carreras.map(carrera => (
                                <option key={carrera.id} value={carrera.id}>
                                    {carrera.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-4 text-end mb-2">
                        <button
                            className="btn btn-sm py-2 rounded-3 btn-primary"
                            onClick={handleShowCreateModal}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva Materia
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                    <tr className="bg-light">
                        <th>Nombre</th>
                        <th>Carrera</th>
                        <th>Año Plan</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="6" className="text-center py-5">
                                <div className="d-flex flex-column align-items-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <span className="mt-2 text-muted">Cargando materias...</span>
                                </div>
                            </td>
                        </tr>
                    ) : displayedMaterias.length > 0 ? (
                        displayedMaterias.map(materia => (
                            <tr key={materia.id}>
                                <td>{materia.nombre}</td>
                                <td>
                    <span className="badge bg-info text-dark">
                      {getCarreraById(materia.carrera_id)}
                    </span>
                                </td>
                                <td>
                                    {materia.año_plan || <span className="text-muted fst-italic">N/A</span>}
                                </td>
                                <td>
                                    {materia.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}
                                </td>
                                <td>
                                    <div className="d-flex">
                                        <button
                                            className="btn btn-sm me-1 btn-outline-primary"
                                            onClick={() => handleShowEditModal(materia)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteMateria(materia.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5">
                                <div className="d-flex flex-column align-items-center">
                                    <i className="bi bi-search fs-1 text-muted"></i>
                                    <span>No hay materias que coincidan con los filtros aplicados</span>
                                    <button
                                        className="btn btn-sm mt-3 btn-primary"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCarreraFilter('');
                                        }}
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                    Mostrando {displayedMaterias.length} de {filteredMaterias.length} materias (últimas {ITEMS_PER_PAGE})
                </div>
            </div>

            {/* Modal para crear/editar materia usando Bootstrap nativo */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" aria-hidden={!showModal}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{modalMode === 'create' ? 'Crear Nueva Materia' : 'Editar Materia'}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSaveMateria}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        value={currentMateria.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="carrera_id" className="form-label">Carrera*</label>
                                    <select
                                        className="form-select"
                                        id="carrera_id"
                                        name="carrera_id"
                                        value={currentMateria.carrera_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccione una carrera</option>
                                        {carreras.map(carrera => (
                                            <option key={carrera.id} value={carrera.id}>
                                                {carrera.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="año_plan" className="form-label">Año Plan</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="año_plan"
                                        name="año_plan"
                                        value={currentMateria.año_plan}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        id="descripcion"
                                        name="descripcion"
                                        rows="3"
                                        value={currentMateria.descripcion}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default MateriasCRUD;