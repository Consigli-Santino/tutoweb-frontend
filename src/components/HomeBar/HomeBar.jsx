import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HomeBar.css';

const HomeBar = ({ userOptions = [] }) => {
    // Usar el hook useLocation para obtener la ruta actual
    const location = useLocation();

    return (
        <nav className="navbar fixed-bottom navbar-dark shadow-sm py-0" style={{ backgroundColor: '#283048' }}>
            <div className="container-fluid">
                <div className="row w-100 mx-0">
                    {userOptions.map((option, index) => {
                        // Verificar si esta opción corresponde a la ruta actual
                        const isActive = location.pathname === option.path ||
                            (option.path !== '/' && location.pathname.startsWith(option.path));

                        return (
                            <div key={index} className="col text-center p-0">
                                <Link
                                    to={option.path}
                                    className={`nav-link d-flex flex-column py-2 text-white nav-icon-button ${isActive ? 'active' : ''}`}
                                >
                                    <div className="icon-circle" style={isActive ? {backgroundColor: 'rgba(255, 255, 255, 0.25)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'} : {}}>
                                        <i className={`bi bi-${option.icon} fs-4 mb-1`}></i>
                                    </div>
                                    <span className="small">{option.name}</span>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default HomeBar;