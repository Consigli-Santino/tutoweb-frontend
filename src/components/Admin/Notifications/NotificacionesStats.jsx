import React from 'react';

const NotificacionesStats = ({ notificaciones }) => {
    const getEstadisticas = () => {
        const total = notificaciones.length;
        const leidas = notificaciones.filter(n => n.leida === true).length;
        const noLeidas = total - leidas;

        // Calcular porcentajes
        const pctLeidas = total > 0 ? Math.round((leidas / total) * 100) : 0;
        const pctNoLeidas = total > 0 ? Math.round((noLeidas / total) * 100) : 0;

        // Contar por tipo
        const porTipo = {
            reserva: notificaciones.filter(n => n.tipo === 'reserva').length,
            pago: notificaciones.filter(n => n.tipo === 'pago').length,
            recordatorio: notificaciones.filter(n => n.tipo === 'recordatorio').length,
            sistema: notificaciones.filter(n => n.tipo === 'sistema').length,
        };

        // Tipo más común
        const tipoMasComun = Object.keys(porTipo).reduce((a, b) =>
            porTipo[a] > porTipo[b] ? a : b, 'sistema'
        );

        return {
            total,
            leidas,
            noLeidas,
            pctLeidas,
            pctNoLeidas,
            porTipo,
            tipoMasComun
        };
    };

    const stats = getEstadisticas();

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'reserva': return 'bi-calendar-check';
            case 'pago': return 'bi-cash-coin';
            case 'recordatorio': return 'bi-bell';
            case 'sistema': return 'bi-gear';
            default: return 'bi-info-circle';
        }
    };

    const getTipoName = (tipo) => {
        switch (tipo) {
            case 'reserva': return 'Reservas';
            case 'pago': return 'Pagos';
            case 'recordatorio': return 'Recordatorios';
            case 'sistema': return 'Sistema';
            default: return tipo;
        }
    };

    return (
        <div className="row g-3 mb-4">
            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-bell-fill fs-3 text-primary"></i>
                        </div>
                        <div>
                            <div className="materia-title">Total Notificaciones</div>
                            <div className="fs-4 fw-bold">{stats.total}</div>
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
                            <div className="materia-title">Leídas</div>
                            <div className="fs-4 fw-bold">
                                {stats.leidas}
                                <span className="fs-6 fw-normal text-muted ms-1">({stats.pctLeidas}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="bi bi-exclamation-circle fs-3 text-warning"></i>
                        </div>
                        <div>
                            <div className="materia-title">No Leídas</div>
                            <div className="fs-4 fw-bold">
                                {stats.noLeidas}
                                <span className="fs-6 fw-normal text-muted ms-1">({stats.pctNoLeidas}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-3 col-sm-6">
                <div className="materia-card">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className={`bi ${getTipoIcon(stats.tipoMasComun)} fs-3 text-info`}></i>
                        </div>
                        <div>
                            <div className="materia-title">Tipo más Común</div>
                            <div className="fs-4 fw-bold">
                                {getTipoName(stats.tipoMasComun)}
                                <span className="fs-6 fw-normal text-muted ms-1">({stats.porTipo[stats.tipoMasComun]})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificacionesStats;