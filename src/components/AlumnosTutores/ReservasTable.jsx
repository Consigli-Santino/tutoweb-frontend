import React, { useState } from 'react';

const ReservasTable = ({
                           reservas,
                           pagos,
                           isLoading,
                           activeTab,
                           getEstadoPagosReserva,
                           getMontoPagadoReserva,
                           resetFilters,
                           componentRef
                       }) => {
    const [expandedRows, setExpandedRows] = useState({});

    // Expandir/contraer fila para mostrar detalles de pago
    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const ReservaRow = ({ reserva }) => (
        <React.Fragment key={reserva.id}>
            <tr className={`table-row hover-row ${expandedRows[reserva.id] ? 'bg-light' : ''}`}>
                {activeTab === 'admin' && (
                    <td className="border-0 py-3">
                        {reserva.estudiante ? (
                            <span className="tag-email">
                                {reserva.estudiante.nombre} {reserva.estudiante.apellido}
                            </span>
                        ) : 'N/A'}
                    </td>
                )}
                {(activeTab === 'admin' || activeTab === 'estudiante') && (
                    <td className="border-0 py-3">
                        {reserva.tutor ? (
                            <span className="tag-email">
                                {reserva.tutor.nombre} {reserva.tutor.apellido}
                            </span>
                        ) : 'N/A'}
                    </td>
                )}
                <td className="border-0 py-3">
                    <span className="tag-carrera">
                        {reserva.materia ? reserva.materia.nombre : 'N/A'}
                    </span>
                </td>
                <td className="border-0 py-3">
                    {new Date(reserva.fecha).toLocaleDateString()}
                </td>
                <td className="border-0 py-3">
                    {reserva.hora_inicio.substring(0, 5)} - {reserva.hora_fin.substring(0, 5)}
                </td>
                <td className="border-0 py-3">
                    <span className={`badge ${reserva.servicio?.modalidad === 'virtual' ? 'bg-info' : 'bg-secondary'}`}>
                        {reserva.servicio?.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                    </span>
                </td>
                <td className="border-0 py-3">
                    <span className={`badge ${
                        reserva.estado === 'completada' ? 'bg-success' :
                            reserva.estado === 'pendiente' ? 'bg-warning' :
                                reserva.estado === 'confirmada' ? 'bg-primary' :
                                    'bg-danger'
                    }`}>
                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                    </span>
                </td>
                <td className="border-0 py-3">
                    <span className={`badge ${
                        getEstadoPagosReserva(reserva.id) === 'Pagado' ? 'bg-success' :
                            getEstadoPagosReserva(reserva.id) === 'Pendiente' ? 'bg-warning' :
                                'bg-secondary'
                    }`}>
                        {getEstadoPagosReserva(reserva.id)}
                    </span>
                </td>
                <td className="border-0 py-3">
                    <button
                        className={expandedRows[reserva.id] ? "btn-remove-materia" : "btn-add-materia"}
                        onClick={() => toggleRowExpansion(reserva.id)}
                    >
                        {expandedRows[reserva.id] ? (
                            <i className="bi bi-dash"></i>
                        ) : (
                            <i className="bi bi-plus"></i>
                        )}
                    </button>
                </td>
            </tr>
            {expandedRows[reserva.id] && (
                <tr>
                    <td colSpan="10" className="p-0 border-0">
                        <div className="p-3 mb-3 materia-card">
                            <div className="row">
                                <div className="col-md-6">
                                    <h5 className="mb-3 materia-title">Detalles de la Reserva</h5>
                                    <div className="mb-2">
                                        <strong>Fecha Creación:</strong> {new Date(reserva.fecha_creacion).toLocaleString()}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Sala Virtual:</strong> {reserva.sala_virtual || 'No disponible'}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h5 className="mb-3 materia-title">Detalles de Pago</h5>
                                    {pagos[reserva.id] && pagos[reserva.id].length > 0 ? (
                                        <div>
                                            <div className="mb-2">
                                                <strong>Precio del Servicio:</strong> ${reserva.servicio?.precio.toLocaleString()}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Monto Pagado:</strong> ${getMontoPagadoReserva(reserva.id).toLocaleString()}
                                            </div>
                                            <table className="table table-sm mt-2">
                                                <thead>
                                                <tr>
                                                    <th>Método</th>
                                                    <th>Estado</th>
                                                    <th>Monto</th>
                                                    <th>Fecha</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {pagos[reserva.id].map(pago => (
                                                    <tr key={pago.id}>
                                                        <td>{pago.metodo_pago}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                pago.estado === 'completado' ? 'bg-success' :
                                                                    'bg-warning'
                                                            }`}>
                                                                {pago.estado}
                                                            </span>
                                                        </td>
                                                        <td>${pago.monto.toLocaleString()}</td>
                                                        <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString() : 'Pendiente'}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="alert alert-light">
                                            No hay pagos registrados para esta reserva.
                                        </div>
                                    )}
                                </div>
                            </div>
                            {reserva.servicio?.modalidad === 'virtual' && reserva.sala_virtual && (
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <a
                                            href={reserva.sala_virtual}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="bi bi-camera-video me-1"></i>
                                            Acceder a la Sala Virtual
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );

    const LoadingRow = () => (
        <tr>
            <td colSpan="10" className="text-center border-0 py-5">
                <div className="d-flex flex-column align-items-center">
                    <div className="spinner-border" style={{ color: '#283048' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="mt-2 text-muted">Cargando reservas...</span>
                </div>
            </td>
        </tr>
    );

    const EmptyRow = () => (
        <tr>
            <td colSpan="10" className="text-center border-0 py-5">
                <div className="d-flex flex-column align-items-center empty-state">
                    <i className="bi bi-search empty-state-icon"></i>
                    <span>No hay reservas que coincidan con los filtros aplicados</span>
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
        <div className="table-responsive" ref={componentRef}>
            <table className="table table-hover table-rounded" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                <tr className="table-header">
                    {activeTab === 'admin' && <th className="border-0">Estudiante</th>}
                    {(activeTab === 'admin' || activeTab === 'estudiante') && <th className="border-0">Tutor</th>}
                    <th className="border-0">Materia</th>
                    <th className="border-0">Fecha</th>
                    <th className="border-0">Horario</th>
                    <th className="border-0">Modalidad</th>
                    <th className="border-0">Estado</th>
                    <th className="border-0">Pago</th>
                    <th className="border-0">Detalles</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <LoadingRow />
                ) : reservas.length > 0 ? (
                    reservas.map((reserva) => (
                        <ReservaRow key={reserva.id} reserva={reserva} />
                    ))
                ) : (
                    <EmptyRow />
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ReservasTable;