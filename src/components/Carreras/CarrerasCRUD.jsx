import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { useEntidades } from '../../context/EntidadesContext';
import ExcelExportService from "../../services/ExcelExportService.js";
import '../../commonTables.css';

const CarrerasCRUD = () => {
    const { carreras: contextCarreras, refreshCommonData } = useEntidades();
    const [carreras, setCarreras] = useState([]);
    const [filteredCarreras, setFilteredCarreras] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentCarrera, setCurrentCarrera] = useState({
        nombre: '',
        descripcion: '',
        facultad: 'Universidad Tecnológica Nacional'
    });

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
            setCurrentPage(1);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = carreras.filter(carrera =>
            carrera.nombre.toLowerCase().includes(searchTermLower) ||
            carrera.descripcion?.toLowerCase().includes(searchTermLower) ||
            carrera.facultad?.toLowerCase().includes(searchTermLower)
        );
        setFilteredCarreras(filtered);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Paginación
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentCarreras = filteredCarreras.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCarreras.length / ITEMS_PER_PAGE);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
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

    const exportToExcel = async () => {
        setIsLoading(true);
        ExcelExportService.exportCarrerasToExcel(filteredCarreras);
        setIsLoading(false);
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
            {error && (
                <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

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
                                placeholder="Buscar por nombre, descripción o facultad..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <button
                                className="btn btn-sm py-2 rounded-3 btn-light border-0 me-2"
                                onClick={clearFilters}
                                title="Limpiar filtros"
                            >
                                <i className="bi bi-trash"></i> Limpiar
                            </button>
                            <button
                                className="btn btn-sm btn-outline-success rounded-pill"
                                onClick={exportToExcel}
                            >
                                <i className="bi bi-file-excel me-1"></i> Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-rounded" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                    <tr className="table-header">
                        <th className="border-0">Nombre</th>
                        <th className="border-0">Facultad</th>
                        <th className="border-0">Descripción</th>
                        <th className="border-0">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentCarreras.length > 0 ? (
                        currentCarreras.map(carrera => (
                            <tr key={carrera.id} className="table-row hover-row">
                                <td className="border-0 py-3">{carrera.nombre}</td>
                                <td className="border-0 py-3">{carrera.facultad}</td>
                                <td className="border-0 py-3">
                                    {carrera.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}
                                </td>
                                <td className="border-0 py-3">
                                    <div className="d-flex">
                                        <button
                                            className="btn btn-sm me-1 btn-action-edit"
                                            onClick={() => handleShowEditModal(carrera)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-action-delete"
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
                            <td colSpan="4" className="text-center border-0 py-5">
                                {isLoading ? (
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="spinner-border" style={{ color: '#283048' }} role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <span className="mt-2 text-muted">Cargando carreras...</span>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column align-items-center empty-state">
                                        <i className="bi bi-search empty-state-icon"></i>
                                        <span>No hay carreras que coincidan con los filtros aplicados</span>
                                        <button
                                            className="btn btn-sm mt-3 app-primary"
                                            onClick={clearFilters}
                                        >
                                            Limpiar filtros
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCarreras.length)} de {filteredCarreras.length} carreras
                </div>
            </div>

            {/* Paginación */}
            {filteredCarreras.length > ITEMS_PER_PAGE && (
                <nav aria-label="Paginación de carreras" className="mt-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Página {currentPage} de {totalPages}
                        </div>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                            </li>

                            {/* Mostrar páginas */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                // Mostrar solo algunas páginas para evitar demasiados botones
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        </li>
                                    );
                                } else if (
                                    pageNumber === currentPage - 2 ||
                                    pageNumber === currentPage + 2
                                ) {
                                    return (
                                        <li key={pageNumber} className="page-item disabled">
                                            <span className="page-link">...</span>
                                        </li>
                                    );
                                }
                                return null;
                            })}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
            )}

            {/* Espacio adicional para evitar que el HomeBar tape contenido */}
            <div className="home-bar-spacing"></div>

            <button
                className="btn btn-lg rounded-circle position-fixed shadow btn-float-add"
                onClick={handleShowCreateModal}
            >
                <i className="bi bi-plus fs-4"></i>
            </button>

            {/* Modal para crear/editar carrera */}
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