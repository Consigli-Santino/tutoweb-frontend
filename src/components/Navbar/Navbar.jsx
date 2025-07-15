import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import logo from '../../assets/d67bf100-ca44-453c-8737-aeffbe5d0c18.png';
import './navbar.css';
import '../HomeBar/HomeBar.css'; // Importa los estilos del HomeBar

const Navbar = ({ userOptions = [] }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth(); // Obtenemos el usuario del contexto
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const notificationsRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Mejorado useEffect para notificaciones
    useEffect(() => {
        function handleClickOutside(event) {
            // Verificar si el clic fue fuera del panel de notificaciones Y del botón de notificaciones
            if (notificationsRef.current &&
                !notificationsRef.current.contains(event.target) &&
                !event.target.closest('.notification-bell-container')) {
                setShowNotifications(false);
            }
        }

        function handleScroll(event) {
            // Solo cerrar notificaciones si el scroll NO es dentro del panel de notificaciones
            if (notificationsRef.current &&
                !notificationsRef.current.contains(event.target) &&
                !event.target.closest('.notifications-body')) {
                setShowNotifications(false);
            }
        }

        function handleResize() {
            // Cerrar notificaciones al cambiar el tamaño de pantalla
            setShowNotifications(false);
        }

        function handleEscapeKey(event) {
            // Cerrar con la tecla Escape
            if (event.key === 'Escape') {
                setShowNotifications(false);
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
            document.addEventListener('keydown', handleEscapeKey);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [showNotifications]);

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

    // Función para obtener notificaciones
    const fetchNotifications = async () => {
        if (!user) return;

        try {
            setIsLoadingNotifications(true);
            const response = await ApiService.fetchNotificaciones();

            if (response.success) {
                setNotifications(response.data);
                // Contar no leídas
                setUnreadCount(response.data.filter(notif => !notif.leida).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // Marcar una notificación como leída
    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await ApiService.marcarNotificacionComoLeida(id);
            // Actualizar localmente
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, leida: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Marcar todas como leídas
    const markAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await ApiService.marcarTodasLasNotificacionesComoLeidas();
            // Actualizar localmente
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, leida: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Navegar a la página correspondiente según el tipo de notificación
    const handleNotificationClick = (notification) => {
        // Marcar como leída primero
        ApiService.marcarNotificacionComoLeida(notification.id);

        // Navegar según el tipo de notificación
        if (notification.tipo === 'reserva') {
            navigate('/reservas')
        } else if (notification.tipo === 'pago') {
            navigate('/pagos');
        } else {
            // Para otros tipos, solo cerrar el menú
            setShowNotifications(false);
        }
    };

    // Formatear tiempo relativo
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours} h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Hace ${diffInDays} d`;

        return date.toLocaleDateString();
    };

    // Función para manejar el clic en "Mi Perfil"
    const handleMyProfileClick = () => {
        if (user && user.email) {
            navigate(`/register?email=${user.email}`);
            setSidebarOpen(false);
        }
    };

    // Función para renderizar el panel de notificaciones
    const renderNotificationsPanel = () => (
        <div className="notifications-panel" ref={notificationsRef}>
            <div className="notifications-header">
                <h6 className="mb-0">Notificaciones</h6>
                {unreadCount > 0 && (
                    <button
                        className="btn btn-sm text-primary p-0 border-0"
                        onClick={markAllAsRead}
                        style={{ fontSize: '0.8rem' }}
                    >
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div
                className="notifications-body"
                onScroll={(e) => e.stopPropagation()} // Prevenir que el scroll se propague
            >
                {isLoadingNotifications ? (
                    <div className="notifications-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <span>Cargando notificaciones...</span>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="notification-list">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.leida ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-content">
                                    <div className="notification-title">
                                        {notification.titulo}
                                    </div>
                                    <div className="notification-message">
                                        {notification.mensaje}
                                    </div>
                                    <div className="notification-time">
                                        {formatTime(notification.fecha_creacion)}
                                    </div>
                                </div>
                                {!notification.leida && (
                                    <button
                                        className="btn btn-sm mark-read-btn"
                                        onClick={(e) => markAsRead(notification.id, e)}
                                        title="Marcar como leída"
                                    >
                                        <i className="bi bi-check2-all"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-notifications">
                        <i className="bi bi-bell-slash"></i>
                        <p>No tienes notificaciones</p>
                    </div>
                )}
            </div>
        </div>
    );

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

                    {/* Botón de notificaciones con animación - MEJORADO */}
                    <div className="ms-auto notification-bell-container position-relative">
                        <button
                            className="btn btn-link text-white border-0 p-0 nav-icon-button"
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notificaciones"
                            aria-expanded={showNotifications}
                        >
                            <div className="icon-circle position-relative">
                                <i className="bi bi-bell-fill fs-4 notification-bell"></i>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </div>
                        </button>

                        {/* Panel de notificaciones */}
                        {showNotifications && renderNotificationsPanel()}
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
                            <img src={logo} alt="Logo UTN" className="img-fluid" />
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