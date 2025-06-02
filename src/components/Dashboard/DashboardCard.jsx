// components/DashboardCard.jsx

import React from 'react';

const DashboardCard = ({ title, value, icon, color }) => {
    return (
        <div className="col-12 col-md-6 col-lg-3">
            <div className="materia-card">
                <h3 className="materia-title">{title}</h3>
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className={`fs-1 fw-bold text-${color} mb-0`}>{value}</h2>
                    <div className={`bg-${color} p-3 rounded-circle text-white`}>
                        <i className={`bi ${icon} fs-4`}></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;