import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { useEntidades } from '../../context/EntidadesContext';

const CarrerasCRUD = () => {
    const { carreras: contextCarreras, refreshCommonData } = useEntidades();
    const [carreras, setCarreras] = useState([]);
    const [filteredCarreras, setFilteredCarreras] = useState([]);
    const [displayedCarreras, setDisplayedCarreras] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentCarrera, setCurrentCarrera] = useState({
        nombre: '',
        descripcion: '',
        facultad: 'Universidad Tecnológica Nacional'
    });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (contextCarreras.length > 0) {
            setCarreras(contextCarreras);
            setFilteredCarreras(contextCarreras);
            setIsLoading(false);
        } else {
            fetchCarreras();
        }
    }, [contextCarreras]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, carreras]);

    useEffect(() => {
        const sortedCarreras = [...filteredCarreras].sort((a, b) => b.id - a.id);
        setDisplayedCarreras(sortedCarreras.slice(0, ITEMS_PER_PAGE));
    }, [filteredCarreras]);

    const fetchCarreras = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ApiService.getCarreras();
            if (response.success) {
                setCarreras(response.data);
                setFilteredCarreras(response.data);
            } else {
                throw new Error(response.message || 'Error al obtener carreras');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        if (!searchTerm.trim()) {
            setFilteredCarreras(carreras);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = carreras.filter(carrera =>
            carrera.nombre.toLowerCase().includes(searchTermLower) ||
            carrera.descripcion?.toLowerCase().includes(searchTermLower) ||
            carrera.facultad?.toLowerCase().includes(searchTermLower)
        );
        setFilteredCarreras(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleShowCreateModal = () => {
        setCurrentCarrera({
            nombre: '',
            descripcion: '',
            facultad: 'Universidad Tecnológica Nacional'
        });
        setModalMode('create');
        setShowModal(true);
    };

    const handleShowEditModal = (carrera) => {
        setCurrentCarrera({
            id: carrera.id,
            nombre: carrera.nombre,
            descripcion: carrera.descripcion || '',
            facultad: carrera.facultad || 'Universidad Tecnológica Nacional'
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCarrera(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveCarrera = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (modalMode === 'create') {
                response = await ApiService.createCarrera(currentCarrera);
            } else {
                response = await ApiService.updateCarrera(currentCarrera.id, currentCarrera);
            }

            if (response.success) {
                setShowModal(false);
                refreshCommonData();
                await fetchCarreras();
            } else {
                throw new Error(response.message || `Error al ${modalMode === 'create' ? 'crear' : 'editar'} la carrera`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCarrera = async (id) => {
        if (!window.confirm('¿Está seguro que desea eliminar esta carrera?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await ApiService.deleteCarrera(id);
            if (response.success) {
                refreshCommonData();
                await fetchCarreras();
            } else {
                throw new Error(response.message || 'Error al eliminar la carrera');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-4 p-3 bg-light rounded shadow-sm">
                <div className="row g-2">
                    <div className="col-12 col-md-6 mb-2">
                        <div className="input-group">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search text-muted"></i>
              </span>
                            <input
                                type="text"
                                className="form-control form-control-sm border-0 py-2"
                                placeholder="Buscar por nombre, descripción o facultad..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    <div className="col-12 col-md-6 text-end mb-2">
                        <button
                            className="btn btn-sm py-2 rounded-3 btn-primary"
                            onClick={handleShowCreateModal}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva Carrera
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
                        <th>Facultad</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                <div className="d-flex flex-column align-items-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <span className="mt-2 text-muted">Cargando carreras...</span>
                                </div>
                            </td>
                        </tr>
                    ) : displayedCarreras.length > 0 ? (
                        displayedCarreras.map(carrera => (
                            <tr key={carrera.id}>
                                <td>{carrera.nombre}</td>
                                <td>{carrera.facultad}</td>
                                <td>
                                    {carrera.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}
                                </td>
                                <td>
                                    <div className="d-flex">
                                        <button
                                            className="btn btn-sm me-1 btn-outline-primary"
                                            onClick={() => handleShowEditModal(carrera)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteCarrera(carrera.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                <div className="d-flex flex-column align-items-center">
                                    <i className="bi bi-search fs-1 text-muted"></i>
                                    <span>No hay carreras que coincidan con la búsqueda</span>
                                    <button
                                        className="btn btn-sm mt-3 btn-primary"
                                        onClick={() => setSearchTerm('')}
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
                    Mostrando {displayedCarreras.length} de {filteredCarreras.length} carreras (últimas {ITEMS_PER_PAGE})
                </div>
            </div>

            {/* Modal para crear/editar carrera usando Bootstrap nativo */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" aria-hidden={!showModal}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{modalMode === 'create' ? 'Crear Nueva Carrera' : 'Editar Carrera'}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSaveCarrera}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        value={currentCarrera.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="facultad" className="form-label">Facultad</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="facultad"
                                        name="facultad"
                                        value={currentCarrera.facultad}
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
                                        value={currentCarrera.descripcion}
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

export default CarrerasCRUD;