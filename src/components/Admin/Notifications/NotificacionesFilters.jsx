import React from 'react';
import CustomSelect from '../../../components/CustomInputs/CustomSelect.jsx';

const NotificacionesFilters = ({
                                   searchTerm,
                                   setSearchTerm,
                                   tipoFilter,
                                   setTipoFilter,
                                   estadoFilter,
                                   setEstadoFilter,
                                   isAdmin,
                                   resetFilters
                               }) => {
    const getPlaceholderText = () => {
        if (isAdmin) {
            return "Buscar por título, mensaje, usuario o email...";
        }
        return "Buscar por título o mensaje...";
    };

    return (
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
                            placeholder={getPlaceholderText()}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-8">
                    <div className="row g-2">
                        <div className="col-md-3 col-6 mb-2">
                            <CustomSelect
                                value={tipoFilter}
                                onChange={(e) => setTipoFilter(e.target.value)}
                                options={[
                                    { id: 'reserva', nombre: 'Reserva' },
                                    { id: 'pago', nombre: 'Pago' },
                                    { id: 'recordatorio', nombre: 'Recordatorio' },
                                    { id: 'sistema', nombre: 'Sistema' }
                                ]}
                                placeholder="Todos los tipos"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-3 col-6 mb-2">
                            <CustomSelect
                                value={estadoFilter}
                                onChange={(e) => setEstadoFilter(e.target.value)}
                                options={[
                                    { id: 'leida', nombre: 'Leída' },
                                    { id: 'no_leida', nombre: 'No leída' }
                                ]}
                                placeholder="Todos los estados"
                                className="bg-white border-0 py-2 rounded-3"
                                variant="light"
                            />
                        </div>
                        <div className="col-md-3 col-6 mb-2">
                            {/* Espacio para futuros filtros */}
                        </div>
                        <div className="col-md-3 col-6 mb-2 d-flex align-items-center">
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

export default NotificacionesFilters;