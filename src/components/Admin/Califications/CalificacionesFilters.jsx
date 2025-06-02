import React from 'react';
import CustomSelect from '../../../components/CustomInputs/CustomSelect.jsx';

const CalificacionesFilters = ({
                                   searchTerm,
                                   setSearchTerm,
                                   carreraFilter,
                                   setCarreraFilter,
                                   materiaFilter,
                                   setMateriaFilter,
                                   puntuacionFilter,
                                   setPuntuacionFilter,
                                   usuarioFilter,
                                   setUsuarioFilter,
                                   carreras,
                                   materias,
                                   resetFilters
                               }) => {
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
                            placeholder="Buscar por estudiante, tutor, materia o comentario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-9">
                    <div className="row g-2">
                        <div className="col-md-2 col-6 mb-2">
                            <CustomSelect
                                value={carreraFilter}
                                onChange={(e) => setCarreraFilter(e.target.value)}
                                options={carreras}
                                placeholder="Todas las carreras"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-2 col-6 mb-2">
                            <CustomSelect
                                value={materiaFilter}
                                onChange={(e) => setMateriaFilter(e.target.value)}
                                options={materias}
                                placeholder="Todas las materias"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-2 col-6 mb-2">
                            <CustomSelect
                                value={puntuacionFilter}
                                onChange={(e) => setPuntuacionFilter(e.target.value)}
                                options={[
                                    { id: '1', nombre: '1 ★' },
                                    { id: '2', nombre: '2 ★' },
                                    { id: '3', nombre: '3 ★' },
                                    { id: '4', nombre: '4 ★' },
                                    { id: '5', nombre: '5 ★' }
                                ]}
                                placeholder="Todas las puntuaciones"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-2 col-6 mb-2">
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
export default CalificacionesFilters