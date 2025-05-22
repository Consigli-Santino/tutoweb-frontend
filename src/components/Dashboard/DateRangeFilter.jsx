// components/DateRangeFilter.jsx
import React from 'react';

const DateRangeFilter = ({ fechaDesde, setFechaDesde, fechaHasta, setFechaHasta, onFilter, resetDateRange }) => {
    return (
        <div className="mb-4">
            <div className="row g-2">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="d-flex flex-column flex-sm-row gap-2">
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
                    </div>
                </div>
                <div className="col-12 col-md-4 col-lg-6">
                    <div className="d-flex justify-content-md-end gap-2">
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
        </div>
    );
};

export default DateRangeFilter;