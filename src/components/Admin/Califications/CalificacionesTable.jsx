// CalificacionesTable.jsx
import React, { useState } from 'react';

const CalificacionesTable = ({ calificaciones, isLoading, resetFilters }) => {
    const [expandedRows, setExpandedRows] = useState({});

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

    const renderStars = (puntuacion) => {
        return (
            <div className="d-flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`bi bi-star${star <= puntuacion ? '-fill text-warning' : ' text-muted'} me-1`}
                    ></i>
                ))}
            </div>
        );
    };

    const CalificacionRow = ({ calificacion }) => (
        <React.Fragment key={calificacion.id}>
            <tr className={`table-row hover-row ${expandedRows[calificacion.id] ? 'bg-light' : ''}`}>
                <td className="border-0 py-3">
                    {formatDate(calificacion.fecha)}
                </td>
                <td className="border-0 py-3">
                    {calificacion.calificador ? (
                        <span className="tag-email">
                            {calificacion.calificador.nombre} {calificacion.calificador.apellido}
                        </span>
                    ) : 'N/A'}
                </td>
                <td className="border-0 py-3">
                    {calificacion.calificado ? (
                        <span className="tag-email">
                            {calificacion.calificado.nombre} {calificacion.calificado.apellido}
                        </span>
                    ) : 'N/A'}
                </td>
                <td className="border-0 py-3">
                    <span className="tag-carrera">
                        {calificacion.reserva?.materia?.nombre || 'N/A'}
                    </span>
                </td>
                <td className="border-0 py-3">
                    {renderStars(calificacion.puntuacion)}
                </td>
                <td className="border-0 py-3">
                    {calificacion.comentario ? (
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                            {calificacion.comentario}
                        </span>
                    ) : (
                        <span className="text-muted fst-italic">Sin comentarios</span>
                    )}
                </td>
                <td className="border-0 py-3">
                    <button
                        className={expandedRows[calificacion.id] ? "btn-remove-materia" : "btn-add-materia"}
                        onClick={() => toggleRowExpansion(calificacion.id)}
                        title={expandedRows[calificacion.id] ? "Ocultar detalles" : "Ver más detalles"}
                    >
                        {expandedRows[calificacion.id] ? (
                            <i className="bi bi-dash"></i>
                        ) : (
                            <i className="bi bi-plus"></i>
                        )}
                    </button>
                </td>
            </tr>
            {expandedRows[calificacion.id] && (
                <tr>
                    <td colSpan="7" className="p-0 border-0">
                        <div className="p-3 mb-3 materia-card">
                            <div className="row">
                                <div className="col-md-6">
                                    <h5 className="mb-3 materia-title">Información del Estudiante</h5>
                                    {calificacion.calificador && (
                                        <>
                                            <div className="mb-2">
                                                <strong>Nombre completo:</strong> {calificacion.calificador.nombre} {calificacion.calificador.apellido}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Email:</strong> {calificacion.calificador.email}
                                            </div>
                                            <div className="mb-2">
                                                <strong>ID:</strong> {calificacion.calificador.id}
                                            </div>
                                        </>
                                    )}

                                    <h5 className="mb-3 mt-4 materia-title">Información de la Reserva</h5>
                                    {calificacion.reserva && (
                                        <>
                                            <div className="mb-2">
                                                <strong>Fecha de tutoría:</strong> {new Date(calificacion.reserva.fecha).toLocaleDateString('es-AR')}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Horario:</strong> {calificacion.reserva.hora_inicio?.substring(0, 5)} - {calificacion.reserva.hora_fin?.substring(0, 5)}
                                            </div>
                                            <div className="mb-2">
                                                <strong>ID Reserva:</strong> {calificacion.reserva_id}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <h5 className="mb-3 materia-title">Información del Tutor</h5>
                                    {calificacion.calificado && (
                                        <>
                                            <div className="mb-2">
                                                <strong>Nombre completo:</strong> {calificacion.calificado.nombre} {calificacion.calificado.apellido}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Email:</strong> {calificacion.calificado.email}
                                            </div>
                                            <div className="mb-2">
                                                <strong>ID:</strong> {calificacion.calificado.id}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Puntuación promedio:</strong>
                                                <span className="ms-2">
                                                    {calificacion.calificado.puntuacion_promedio.toFixed(1)} ★
                                                    <span className="text-muted ms-1">
                                                        ({calificacion.calificado.cantidad_reseñas} reseñas)
                                                    </span>
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    <h5 className="mb-3 mt-4 materia-title">Comentario Completo</h5>
                                    <div className="p-3 bg-light rounded-3">
                                        {calificacion.comentario ? (
                                            <p className="mb-0">{calificacion.comentario}</p>
                                        ) : (
                                            <p className="mb-0 text-muted fst-italic">El estudiante no dejó comentarios adicionales</p>
                                        )}
                                    </div>
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
            <td colSpan="7" className="text-center border-0 py-5">
                <div className="d-flex flex-column align-items-center">
                    <div className="spinner-border" style={{ color: '#283048' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="mt-2 text-muted">Cargando calificaciones...</span>
                </div>
            </td>
        </tr>
    );

    const EmptyRow = () => (
        <tr>
            <td colSpan="7" className="text-center border-0 py-5">
                <div className="d-flex flex-column align-items-center empty-state">
                    <i className="bi bi-star empty-state-icon"></i>
                    <span>No hay calificaciones que coincidan con los filtros aplicados</span>
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
                    <th className="border-0">Estudiante</th>
                    <th className="border-0">Tutor</th>
                    <th className="border-0">Materia</th>
                    <th className="border-0">Puntuación</th>
                    <th className="border-0">Comentario</th>
                    <th className="border-0">Detalles</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <LoadingRow />
                ) : calificaciones.length > 0 ? (
                    calificaciones.map((calificacion) => (
                        <CalificacionRow key={calificacion.id} calificacion={calificacion} />
                    ))
                ) : (
                    <EmptyRow />
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CalificacionesTable;