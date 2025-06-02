

import React from 'react';

const ReservasTable = ({ reservas, pagos, activeTab }) => {
    const getTitle = () => {
        switch (activeTab) {
            case 'estudiante':
                return 'Mis Últimas Reservas';
            case 'tutor':
                return 'Mis Últimas Tutorías';
            case 'admin':
                return 'Últimas Reservas del Sistema';
            default:
                return 'Reservas';
        }
    };

    const getEmptyMessage = () => {
        switch (activeTab) {
            case 'estudiante':
                return 'No tienes reservas de tutorías';
            case 'tutor':
                return 'No tienes reservas pendientes';
            case 'admin':
                return 'No hay reservas en el sistema';
            default:
                return 'No hay reservas';
        }
    };

    return (
        <div className="materia-card mt-4">
            <h3 className="materia-title mb-3">{getTitle()}</h3>

            {reservas.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Materia</th>
                            {activeTab === 'estudiante' && <th>Tutor</th>}
                            {activeTab === 'tutor' && <th>Estudiante</th>}
                            {activeTab === 'admin' && (
                                <>
                                    <th>Estudiante</th>
                                    <th>Tutor</th>
                                </>
                            )}
                            <th>Estado</th>
                            <th>Pago</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservas
                            .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                            .slice(0, 10)
                            .map((reserva, index) => (
                                <tr key={index}>
                                    <td>
                                        {new Date(reserva.fecha).toLocaleDateString('es-AR')}
                                        <br />
                                        <small>
                                            {reserva.hora_inicio ? reserva.hora_inicio.substring(0, 5) : ''} -
                                            {reserva.hora_fin ? reserva.hora_fin.substring(0, 5) : ''}
                                        </small>
                                    </td>
                                    <td>{reserva.materia ? reserva.materia.nombre : 'N/A'}</td>
                                    {activeTab === 'estudiante' && (
                                        <td>
                                            {reserva.tutor ? `${reserva.tutor.nombre} ${reserva.tutor.apellido}` : 'N/A'}
                                        </td>
                                    )}
                                    {(activeTab === 'tutor' || activeTab === 'admin') && (
                                        <td>
                                            {reserva.estudiante ? `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}` : 'N/A'}
                                        </td>
                                    )}
                                    {activeTab === 'admin' && (
                                        <td>
                                            {reserva.tutor ? `${reserva.tutor.nombre} ${reserva.tutor.apellido}` : 'N/A'}
                                        </td>
                                    )}
                                    <td>
                                            <span className={`badge ${
                                                reserva.estado === 'completada' ? 'bg-success' :
                                                    reserva.estado === 'confirmada' ? 'bg-primary' :
                                                        reserva.estado === 'pendiente' ? 'bg-warning text-dark' :
                                                            'bg-danger'
                                            }`}>
                                                {reserva.estado}
                                            </span>
                                    </td>
                                    <td>
                                        {pagos[reserva.id] && pagos[reserva.id].length > 0 ? (
                                            pagos[reserva.id].some(pago => pago.estado === 'completado') ? (
                                                <span className="badge bg-success">completado</span>
                                            ) : (
                                                pagos[reserva.id].map((pago, index) => (
                                                    <span key={index} className={`badge ${
                                                        pago.estado === 'pendiente' ? 'bg-warning text-dark' : 'bg-danger'
                                                    } me-1`}>
                                                            {pago.estado}
                                                        </span>
                                                ))
                                            )
                                        ) : (
                                            <span className="badge bg-secondary">Sin pago</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <i className="bi bi-calendar-x-fill empty-state-icon"></i>
                    <p>{getEmptyMessage()}</p>
                </div>
            )}
        </div>
    );
};

export default ReservasTable;