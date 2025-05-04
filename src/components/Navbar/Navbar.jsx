import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import utnLogo from '../../assets/UTN_logo.jpg';
import './Navbar.css';
import '../HomeBar/HomeBar.css'; // Importa los estilos del HomeBar

const Navbar = ({ userOptions = [] }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth(); // Obtenemos el usuario del contexto
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

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

    // Función para manejar el clic en "Mi Perfil"
    const handleMyProfileClick = () => {
        if (user && user.email) {
            navigate(`/register?email=${user.email}`);
            setSidebarOpen(false);
        }
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{ backgroundColor: '#283048' }}>
                <div className="container-fluid">
                    {/* Botón de perfil con animación */}
                    <button
                        className="btn btn-link text-white border-0 p-0 nav-icon-button profile-toggle"
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <div className="icon-circle">
                            <i className="bi bi-person-circle fs-4"></i>
                        </div>
                    </button>

                    {/* Botón de notificaciones con animación */}
                    <div className="ms-auto">
                        <button className="btn btn-link text-white border-0 p-0 nav-icon-button">
                            <div className="icon-circle">
                                <i className="bi bi-bell-fill fs-4 notification-bell"></i>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Sidebar y backdrop permanecen igual */}
            <div
                ref={sidebarRef}
                className={`offcanvas offcanvas-start ${sidebarOpen ? 'show' : ''}`}
                tabIndex="-1"
                id="profileSidebar"
                style={{
                    visibility: sidebarOpen ? 'visible' : 'hidden',
                    maxWidth: '85%',
                    width: 'auto'
                }}
            >
                <div className="offcanvas-header text-white" style={{ backgroundColor: '#283048' }}>
                    <div className="d-flex align-items-center">
                        <div className="bg-white rounded-3 p-1 me-2" style={{ width: '40px', height: '40px' }}>
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

                <div className="offcanvas-body d-flex flex-column p-0">
                    <div className="p-3 flex-grow-1">
                        <p className="text-muted small mb-2">MENÚ</p>
                        <div className="list-group list-group-flush">
                            {/* Añadir opción de Mi Perfil al principio */}
                            <button
                                className="list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex align-items-center"
                                onClick={handleMyProfileClick}
                            >
                                <i className="bi bi-person-fill me-3"></i>
                                <span>Mi Perfil</span>
                            </button>

                            {/* Opciones dinámicas del usuario */}
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

                    <div className="mt-auto p-3 border-top">
                        <button
                            className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                            onClick={() => {
                                logout();
                            }}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>

            {sidebarOpen && (
                <div
                    className="offcanvas-backdrop fade show"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Navbar;