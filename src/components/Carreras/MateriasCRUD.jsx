import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { useEntidades } from '../../context/EntidadesContext';
import ExcelExportService from "../../services/ExcelExportService.js";
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx';
import '../../commonTables.css';

const MateriasCRUD = () => {
    const { materias: contextMaterias, carreras: contextCarreras, refreshCommonData } = useEntidades();

    const [materias, setMaterias] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [filteredMaterias, setFilteredMaterias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [carreraFilter, setCarreraFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentMateria, setCurrentMateria] = useState({
        nombre: '',
        carrera_id: '',
        descripcion: '',
        año_plan: ''
    });

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
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCarreraFilterChange = (e) => {
        setCarreraFilter(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCarreraFilter('');
        setCurrentPage(1);
    };

    // Paginación
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentMaterias = filteredMaterias.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMaterias.length / ITEMS_PER_PAGE);

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

    const exportToExcel = async () => {
        setIsLoading(true);
        ExcelExportService.exportMateriasToExcel(filteredMaterias);
        setIsLoading(false);
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
            {error && (
                <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            <div className="filter-container mb-4 p-3 shadow-sm">
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
                    <div className="col-12 col-md-8">
                        <div className="row g-2">
                            <div className="col-md-6 col-12 mb-2">
                                <CustomSelect
                                    value={carreraFilter}
                                    onChange={handleCarreraFilterChange}
                                    options={carreras}
                                    placeholder="Todas las carreras"
                                    className="bg-white border-0 py-2 rounded-3"
                                    variant="light"
                                />
                            </div>
                            <div className="col-md-6 col-12 mb-2 d-flex align-items-center justify-content-between">
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
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-rounded" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                    <tr className="table-header">
                        <th className="border-0">Nombre</th>
                        <th className="border-0">Carrera</th>
                        <th className="border-0">Año Plan</th>
                        <th className="border-0">Descripción</th>
                        <th className="border-0">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentMaterias.length > 0 ? (
                        currentMaterias.map(materia => (
                            <tr key={materia.id} className="table-row hover-row">
                                <td className="border-0 py-3">{materia.nombre}</td>
                                <td className="border-0 py-3">
                                        <span className="badge bg-success">
                                            {getCarreraById(materia.carrera_id)}
                                        </span>
                                </td>
                                <td className="border-0 py-3">
                                    {materia.año_plan || <span className="text-muted fst-italic">N/A</span>}
                                </td>
                                <td className="border-0 py-3">
                                    {materia.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}
                                </td>
                                <td className="border-0 py-3">
                                    <div className="d-flex">
                                        <button
                                            className="btn btn-sm me-1 btn-action-edit"
                                            onClick={() => handleShowEditModal(materia)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-action-delete"
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
                            <td colSpan="5" className="text-center border-0 py-5">
                                {isLoading ? (
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="spinner-border" style={{ color: '#283048' }} role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <span className="mt-2 text-muted">Cargando materias...</span>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column align-items-center empty-state">
                                        <i className="bi bi-search empty-state-icon"></i>
                                        <span>No hay materias que coincidan con los filtros aplicados</span>
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
                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMaterias.length)} de {filteredMaterias.length} materias
                </div>
            </div>

            {/* Paginación */}
            {filteredMaterias.length > ITEMS_PER_PAGE && (
                <nav aria-label="Paginación de materias" className="mt-4">
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

            {/* Modal para crear/editar materia */}
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