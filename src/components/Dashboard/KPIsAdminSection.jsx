// components/KPIsAdminSection.jsx

import React from 'react';

const KPIsAdminSection = ({ reservas, tutores, pagos }) => {
    // Cálculo de tasa de completitud
    const getTasaCompletitud = () => {
        const total = reservas.length;
        const completadas = reservas.filter(r => r.estado === 'completada').length;
        return total > 0 ? `${(completadas / total * 100).toFixed(1)}%` : '0%';
    };

    // Cálculo de calificación promedio de tutores
    const getCalificacionPromedio = () => {
        return parseFloat(tutores.reduce((sum, tutor) => sum + (tutor.puntuacion_promedio || 0), 0) /
            tutores.filter(tutor => tutor.puntuacion_promedio > 0).length || 0).toFixed(1);
    };

    // Cálculo de ingreso promedio por tutor
    const getIngresoPromedioTutor = () => {
        const totalIngresos = Object.values(pagos)
            .flat()
            .filter(p => p.estado === 'completado')
            .reduce((sum, p) => sum + p.monto, 0);
        const tutoresActivos = tutores.filter(t => t.cantidad_reseñas > 0).length;

        return tutoresActivos > 0
            ? `$${Math.round(totalIngresos / tutoresActivos)}`
            : '$0';
    };

    return (
        <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
                <div className="materia-card">
                    <h3 className="materia-title">Tasa de Completitud</h3>
                    <div className="text-center">
                        <h2 className="display-4 fw-bold text-primary">
                            {getTasaCompletitud()}
                        </h2>
                        <p className="materia-description">Porcentaje de reservas completadas exitosamente</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-md-4">
                <div className="materia-card">
                    <h3 className="materia-title">Calificación Promedio</h3>
                    <div className="text-center">
                        <div className="d-flex align-items-center justify-content-center">
                            <h2 className="display-4 fw-bold text-warning mb-0">
                                {getCalificacionPromedio()}
                            </h2>
                            <i className="bi bi-star-fill text-warning ms-2 fs-3"></i>
                        </div>
                        <p className="materia-description">Satisfacción general de los estudiantes</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-md-4">
                <div className="materia-card">
                    <h3 className="materia-title">Ingreso Promedio por Tutor</h3>
                    <div className="text-center">
                        <h2 className="display-4 fw-bold text-success">
                            {getIngresoPromedioTutor()}
                        </h2>
                        <p className="materia-description">Promedio de ingresos por tutor activo</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIsAdminSection;