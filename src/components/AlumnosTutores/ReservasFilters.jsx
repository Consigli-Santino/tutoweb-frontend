import React from 'react';
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx';

const ReservasFilters = ({
                             searchTerm,
                             setSearchTerm,
                             estadoFilter,
                             setEstadoFilter,
                             materiaFilter,
                             setMateriaFilter,
                             modalidadFilter,
                             setModalidadFilter,
                             materias,
                             activeTab,
                             resetFilters
                         }) => {
    const getPlaceholderText = () => {
        switch (activeTab) {
            case 'estudiante':
                return "Buscar por tutor o materia...";
            case 'tutor':
                return "Buscar por estudiante o materia...";
            case 'admin':
                return "Buscar por estudiante, tutor o materia...";
            default:
                return "Buscar...";
        }
    };

    return (
        <div className="filter-container mb-4 p-3 shadow-sm">
            <div className="row g-2">
                <div className="col-12 col-md-3 mb-2">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control form-control-sm border-0 py-2"
                            placeholder={getPlaceholderText()}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-9">
                    <div className="row g-2">
                        <div className="col-md-3 col-6 mb-2">
                            <CustomSelect
                                value={estadoFilter}
                                onChange={(e) => setEstadoFilter(e.target.value)}
                                options={[
                                    { id: 'pendiente', nombre: 'Pendiente' },
                                    { id: 'confirmada', nombre: 'Confirmada' },
                                    { id: 'completada', nombre: 'Completada' },
                                    { id: 'cancelada', nombre: 'Cancelada' }
                                ]}
                                placeholder="Todos los estados"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-3 col-6 mb-2">
                            <CustomSelect
                                value={materiaFilter}
                                onChange={(e) => setMateriaFilter(e.target.value)}
                                options={materias}
                                placeholder="Todas las materias"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-3 col-6 mb-2">
                            <CustomSelect
                                value={modalidadFilter}
                                onChange={(e) => setModalidadFilter(e.target.value)}
                                options={[
                                    { id: 'virtual', nombre: 'Virtual' },
                                    { id: 'presencial', nombre: 'Presencial' }
                                ]}
                                placeholder="Todas las modalidades"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-2 col-6 mb-2 d-flex align-items-center">
                            <button
                                className="btn btn-sm py-2 w-100 rounded-3 btn-light border-0"
                                onClick={resetFilters}
                                title="Limpiar filtros"
                            >
                                <i className="bi bi-trash"></i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservasFilters;