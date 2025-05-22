import React from 'react';

const ReservasStats = ({ reservas }) => {
    const getEstadisticasReservas = () => {
        const total = reservas.length;
        const completadas = reservas.filter(r => r.estado === 'completada').length;
        const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
        const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
        const canceladas = reservas.filter(r => r.estado === 'cancelada').length;// Calcular porcentajes
        const pctCompletadas = total > 0 ? Math.round((completadas / total) * 100) : 0;
        const pctPendientes = total > 0 ? Math.round((pendientes / total) * 100) : 0;
        const pctConfirmadas = total > 0 ? Math.round((confirmadas / total) * 100) : 0;
        const pctCanceladas = total > 0 ? Math.round((canceladas / total) * 100) : 0;
        return {
            total,
            completadas,
            pendientes,
            confirmadas,
            canceladas,
            pctCompletadas,
            pctPendientes,
            pctConfirmadas,
            pctCanceladas
        };
    };

    const estadisticas = getEstadisticasReservas();

    return (
        <div className="row g-3 mb-4">
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-calendar-check fs-3 text-primary"></i>
                        </div>
                        <div>
                            <div className="materia-title">Total Reservas</div>
                            <div className="fs-4 fw-bold">{estadisticas.total}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="materia-card materia-card-available">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-check-circle fs-3 text-success"></i>
                        </div>
                        <div>
                            <div className="materia-title">Completadas</div>
                            <div className="fs-4 fw-bold">
                                {estadisticas.completadas}
                                <span className="fs-6 fw-normal text-muted ms-1">({estadisticas.pctCompletadas}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-hourglass-split fs-3 text-warning"></i>
                        </div>
                        <div>
                            <div className="materia-title">Pendientes</div>
                            <div className="fs-4 fw-bold">
                                {estadisticas.pendientes}
                                <span className="fs-6 fw-normal text-muted ms-1">({estadisticas.pctPendientes}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-x-circle fs-3 text-danger"></i>
                        </div>
                        <div>
                            <div className="materia-title">Canceladas</div>
                            <div className="fs-4 fw-bold">
                                {estadisticas.canceladas}
                                <span className="fs-6 fw-normal text-muted ms-1">({estadisticas.pctCanceladas}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservasStats;