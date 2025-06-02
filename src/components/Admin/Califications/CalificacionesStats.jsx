import React from 'react';

const CalificacionesStats = ({ calificaciones }) => {
    const getEstadisticas = () => {
        const total = calificaciones.length;
        const promedioGeneral = total > 0
            ? (calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) / total).toFixed(1)
            : 0;

        const distribuccion = {
            1: calificaciones.filter(cal => cal.puntuacion === 1).length,
            2: calificaciones.filter(cal => cal.puntuacion === 2).length,
            3: calificaciones.filter(cal => cal.puntuacion === 3).length,
            4: calificaciones.filter(cal => cal.puntuacion === 4).length,
            5: calificaciones.filter(cal => cal.puntuacion === 5).length,
        };

        const calificacionesPositivas = calificaciones.filter(cal => cal.puntuacion >= 4).length;
        const pctPositivas = total > 0 ? Math.round((calificacionesPositivas / total) * 100) : 0;

        return {
            total,
            promedioGeneral,
            distribuccion,
            calificacionesPositivas,
            pctPositivas
        };
    };

    const stats = getEstadisticas();

    return (
        <div className="row g-3 mb-4">
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-star-fill fs-3 text-primary"></i>
                        </div>
                        <div>
                            <div className="materia-title">Total Calificaciones</div>
                            <div className="fs-4 fw-bold">{stats.total}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="materia-card materia-card-available">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-graph-up fs-3 text-success"></i>
                        </div>
                        <div>
                            <div className="materia-title">Promedio General</div>
                            <div className="fs-4 fw-bold">
                                {stats.promedioGeneral}
                                <span className="fs-6 fw-normal text-muted ms-1">★</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-hand-thumbs-up fs-3 text-warning"></i>
                        </div>
                        <div>
                            <div className="materia-title">Calificaciones Positivas</div>
                            <div className="fs-4 fw-bold">
                                {stats.calificacionesPositivas}
                                <span className="fs-6 fw-normal text-muted ms-1">({stats.pctPositivas}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-award fs-3 text-info"></i>
                        </div>
                        <div>
                            <div className="materia-title">Excelentes (5★)</div>
                            <div className="fs-4 fw-bold">
                                {stats.distribuccion[5]}
                                <span className="fs-6 fw-normal text-muted ms-1">
                                    ({stats.total > 0 ? Math.round((stats.distribuccion[5] / stats.total) * 100) : 0}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CalificacionesStats