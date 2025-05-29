import React, { useState } from 'react';

const NotificacionesTable = ({
                                 notificaciones,
                                 isLoading,
                                 isAdmin,
                                 resetFilters,
                                 onMarkAsRead,
                                 onDelete
                             }) => {
    const [expandedRows, setExpandedRows] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTipoBadge = (tipo) => {
        const badges = {
            'reserva': { class: 'bg-primary', icon: 'bi-calendar-check', text: 'Reserva' },
            'pago': { class: 'bg-success', icon: 'bi-cash-coin', text: 'Pago' },
            'recordatorio': { class: 'bg-warning text-dark', icon: 'bi-bell', text: 'Recordatorio' },
            'sistema': { class: 'bg-info', icon: 'bi-gear', text: 'Sistema' }
        };

        const badge = badges[tipo] || { class: 'bg-secondary', icon: 'bi-info-circle', text: tipo };

        return (
            <span className={`badge ${badge.class}`}>
                <i className={`bi ${badge.icon} me-1`}></i>
                {badge.text}
            </span>
        );
    };

    const getEstadoBadge = (leida) => {
        return leida ? (
            <span className="badge bg-success">
                <i className="bi bi-check-circle me-1"></i>
                Leída
            </span>
        ) : (
            <span className="badge bg-warning text-dark">
                <i className="bi bi-exclamation-circle me-1"></i>
                No leída
            </span>
        );
    };

    const handleDeleteClick = (id) => {
        if (confirmDelete === id) {
            onDelete(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    const NotificacionRow = ({ notificacion }) => (
        <React.Fragment key={notificacion.id}>
            <tr className={`table-row hover-row ${expandedRows[notificacion.id] ? 'bg-light' : ''} ${!notificacion.leida ? 'table-warning' : ''}`}>
                <td className="border-0 py-3">
                    {formatDate(notificacion.fecha_creacion)}
                </td>

                {isAdmin && (
                    <td className="border-0 py-3">
                        {notificacion.usuario ? (
                            <div>
                                <span className="tag-email d-block">
                                    {notificacion.usuario.nombre} {notificacion.usuario.apellido}
                                </span>
                                <small className="text-muted">{notificacion.usuario.email}</small>
                            </div>
                        ) : 'N/A'}
                    </td>
                )}

                <td className="border-0 py-3">
                    {getTipoBadge(notificacion.tipo)}
                </td>

                <td className="border-0 py-3">
                    <strong className="d-block">{notificacion.titulo}</strong>
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                        {notificacion.mensaje}
                    </span>
                </td>

                <td className="border-0 py-3">
                    {getEstadoBadge(notificacion.leida)}
                </td>

                <td className="border-0 py-3">
                    <div className="d-flex gap-1">
                        {/* Botón de ver detalles */}
                        <button
                            className={expandedRows[notificacion.id] ? "btn-remove-materia" : "btn-add-materia"}
                            onClick={() => toggleRowExpansion(notificacion.id)}
                            title={expandedRows[notificacion.id] ? "Ocultar detalles" : "Ver más detalles"}
                        >
                            {expandedRows[notificacion.id] ? (
                                <i className="bi bi-dash"></i>
                            ) : (
                                <i className="bi bi-plus"></i>
                            )}
                        </button>

                        {/* Botón marcar como leída */}
                        {!notificacion.leida && (
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => onMarkAsRead(notificacion.id)}
                                title="Marcar como leída"
                            >
                                <i className="bi bi-check"></i>
                            </button>
                        )}

                        {/* Botón eliminar */}
                        <button
                            className={`btn btn-sm ${confirmDelete === notificacion.id ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleDeleteClick(notificacion.id)}
                            title={confirmDelete === notificacion.id ? "Confirmar eliminación" : "Eliminar notificación"}
                        >
                            <i className={`bi ${confirmDelete === notificacion.id ? 'bi-check' : 'bi-trash'}`}></i>
                        </button>

                        {confirmDelete === notificacion.id && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setConfirmDelete(null)}
                                title="Cancelar"
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {expandedRows[notificacion.id] && (
                <tr>
                    <td colSpan={isAdmin ? "6" : "5"} className="p-0 border-0">
                        <div className="p-3 mb-3 materia-card">
                            <div className="row">
                                <div className="col-md-6">
                                    <h5 className="mb-3 materia-title">Información de la Notificación</h5>
                                    <div className="mb-2">
                                        <strong>ID:</strong> {notificacion.id}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Tipo:</strong> {getTipoBadge(notificacion.tipo)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Estado:</strong> {getEstadoBadge(notificacion.leida)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha de creación:</strong> {formatDate(notificacion.fecha_creacion)}
                                    </div>
                                    {notificacion.fecha_programada && (
                                        <div className="mb-2">
                                            <strong>Fecha programada:</strong> {formatDate(notificacion.fecha_programada)}
                                        </div>
                                    )}
                                    {notificacion.reserva_id && (
                                        <div className="mb-2">
                                            <strong>Reserva relacionada:</strong> #{notificacion.reserva_id}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <h5 className="mb-3 materia-title">Mensaje Completo</h5>
                                    <div className="p-3 bg-light rounded-3">
                                        <h6 className="fw-bold">{notificacion.titulo}</h6>
                                        <p className="mb-0">{notificacion.mensaje}</p>
                                    </div>

                                    {isAdmin && notificacion.usuario && (
                                        <div className="mt-3">
                                            <h6 className="materia-title">Información del Usuario</h6>
                                            <div className="mb-1">
                                                <strong>Nombre:</strong> {notificacion.usuario.nombre} {notificacion.usuario.apellido}
                                            </div>
                                            <div className="mb-1">
                                                <strong>Email:</strong> {notificacion.usuario.email}
                                            </div>
                                            <div className="mb-1">
                                                <strong>ID Usuario:</strong> {notificacion.usuario.id}
                                            </div>
                                        </div>
                                    )}

                                    {notificacion.reserva && (
                                        <div className="mt-3">
                                            <h6 className="materia-title">Información de la Reserva</h6>
                                            <div className="mb-1">
                                                <strong>Fecha:</strong> {new Date(notificacion.reserva.fecha).toLocaleDateString('es-AR')}
                                            </div>
                                            <div className="mb-1">
                                                <strong>Horario:</strong> {notificacion.reserva.hora_inicio?.substring(0, 5)} - {notificacion.reserva.hora_fin?.substring(0, 5)}
                                            </div>
                                            <div className="mb-1">
                                                <strong>Estado:</strong> {notificacion.reserva.estado}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );

    const LoadingRow = () => (
        <tr>
            <td colSpan={isAdmin ? "6" : "5"} className="text-center border-0 py-5">
                <div className="d-flex flex-column align-items-center">
                    <div className="spinner-border" style={{ color: '#283048' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="mt-2 text-muted">Cargando notificaciones...</span>
                </div>
            </td>
        </tr>
    );

    const EmptyRow = () => (
        <tr>
            <td colSpan={isAdmin ? "6" : "5"} className="text-center border-0 py-5">
                <div className="d-flex flex-column align-items-center empty-state">
                    <i className="bi bi-bell empty-state-icon"></i>
                    <span>No hay notificaciones que coincidan con los filtros aplicados</span>
                    <button
                        className="btn btn-sm mt-3 app-primary"
                        onClick={resetFilters}
                    >
                        Limpiar filtros
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="table-responsive">
            <table className="table table-hover table-rounded" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                <tr className="table-header">
                    <th className="border-0">Fecha</th>
                    {isAdmin && <th className="border-0">Usuario</th>}
                    <th className="border-0">Tipo</th>
                    <th className="border-0">Título y Mensaje</th>
                    <th className="border-0">Estado</th>
                    <th className="border-0">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <LoadingRow />
                ) : notificaciones.length > 0 ? (
                    notificaciones.map((notificacion) => (
                        <NotificacionRow key={notificacion.id} notificacion={notificacion} />
                    ))
                ) : (
                    <EmptyRow />
                )}
                </tbody>
            </table>
        </div>
    );
};

export default NotificacionesTable;