import React from 'react';
import { Link } from 'react-router-dom';
import './HomeBar.css'; // Make sure to create this CSS file

const HomeBar = ({ userOptions = [] }) => {
    return (
        <nav className="navbar fixed-bottom navbar-dark shadow-sm py-0" style={{ backgroundColor: '#283048' }}>
            <div className="container-fluid">
                <div className="row w-100 mx-0">
                    {userOptions.map((option, index) => (
                        <div key={index} className="col text-center p-0">
                            <Link
                                to={option.path}
                                key={option.name}
                                className="nav-link d-flex flex-column py-2 text-white nav-icon-button"
                            >
                                <div className="icon-circle">
                                    <i className={`bi bi-${option.icon} fs-4 mb-1`}></i>
                                </div>
                                <span className="small">{option.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default HomeBar;