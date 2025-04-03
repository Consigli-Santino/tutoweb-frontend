import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import utnLogo from '../../assets/UTN_logo.jpg';
import './Navbar.css';


const Navbar = ({ userOptions = [] }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    // Cerrar sidebar cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                !event.target.closest('.profile-toggle')) {
                setSidebarOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarRef]);


    return (
        <>
            {/* Navbar con Bootstrap */}
            <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{ backgroundColor: '#283048' }}>
                <div className="container-fluid">
                    {/* Perfil a la izquierda */}
                    <button
                        className="btn btn-link text-white border-0 p-0 profile-toggle"
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <i className="bi bi-person-circle fs-4"></i>
                    </button>

                    {/* Logo central
                    <div className="navbar-brand mx-auto d-flex align-items-center">
                        <div className="bg-white rounded-3 p-1 me-2" style={{width: '40px', height: '40px'}}>
                            <img src={utnLogo} alt="Logo UTN" className="img-fluid" />
                        </div>
                        <span className="fw-bold d-none d-sm-inline">TutoWeb</span>
                    </div>
                     */}
                    {/* Notificaciones a la derecha */}
                    <div className="ms-auto">
                        <button className="btn btn-link text-white border-0 p-0">
                            <i className="bi bi-bell-fill fs-4 notification-bell"></i>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Offcanvas Sidebar para el perfil */}
            <div
                ref={sidebarRef}
                className={`offcanvas offcanvas-start ${sidebarOpen ? 'show' : ''}`}
                tabIndex="-1"
                id="profileSidebar"
                style={{
                    visibility: sidebarOpen ? 'visible' : 'hidden',
                    maxWidth: '280px'
                }}
            >
                <div className="offcanvas-header text-white" style={{ backgroundColor: '#283048' }}>
                    <div className="d-flex align-items-center">
                        <div className="bg-white rounded-3 p-1 me-2" style={{width: '40px', height: '40px'}}>
                            <img src={utnLogo} alt="Logo UTN" className="img-fluid" />
                        </div>
                        <h5 className="offcanvas-title">TutoWeb</h5>
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close"
                    ></button>
                </div>

                <div className="offcanvas-body p-0">
                    <div className="p-3">
                        <p className="text-muted small mb-2">MENÚ</p>
                        <div className="list-group list-group-flush">
                            {userOptions.map((option) => (
                                <Link
                                    key={option.name}
                                    to={option.path}
                                    className="list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex align-items-center"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <i className={`bi bi-${option.icon} me-3`}></i>
                                    <span>{option.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop cuando sidebar está abierto */}
            {sidebarOpen && (
                <div
                    className="offcanvas-backdrop fade show"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Navbar