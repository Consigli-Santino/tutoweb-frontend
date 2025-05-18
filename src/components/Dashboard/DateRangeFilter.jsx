// components/DateRangeFilter.jsx

import React from 'react';

const DateRangeFilter = ({ fechaDesde, setFechaDesde, fechaHasta, setFechaHasta, onFilter,resetDateRange }) => {
    return (
        <div className="mb-4">
            <div className="d-flex justify-content-end flex-wrap gap-2">
                <div className="d-flex flex-nowrap gap-2">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">Desde</span>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            max={fechaHasta}
                        />
                    </div>

                    <div className="input-group input-group-sm">
                        <span className="input-group-text">Hasta</span>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            min={fechaDesde}
                        />
                    </div>

                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={resetDateRange}
                    >
                        <i className="bi bi-trash me-1"></i> Limpiar
                    </button>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={onFilter}
                    >
                        <i className="bi bi-funnel me-1"></i> Filtrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateRangeFilter;