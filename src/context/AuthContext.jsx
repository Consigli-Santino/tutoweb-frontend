import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import SideBarOptionsService from "../services/SideBarOptionsService.js";
import HomeBarOptionsService from "../services/HomeBarOptionsService.js";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableRoutesSideBar, setAvailableRoutesSideBar] = useState([]);
    const [availableRoutesHomeBar, setAvailableRoutesHomeBar] = useState([]);
    const loginUrl = import.meta.env.VITE_LOGIN_TUTOWEB;

    const loadUserFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setAvailableRoutesSideBar([]);
            setAvailableRoutesHomeBar([]);
            setLoading(false);
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                console.log('Token expirado');
                logout();
                return;
            }
            let roles = [];
            if (typeof decodedToken.user_rol === 'string') {
                roles = [decodedToken.user_rol]; // Si es string, convertirlo a array
            } else if (Array.isArray(decodedToken.user_rol)) {
                roles = decodedToken.user_rol.map(role =>
                    typeof role === 'object' && role.rol ? role.rol : role
                );
            }
            console.log('Roles del usuario:', roles);
            const sideBarOptions = SideBarOptionsService.getOptions(roles)
            const homeBarOptions = HomeBarOptionsService.getOptions(roles);
            const routesSideBar = sideBarOptions
                .filter(option => {
                    return option.roles.some(role => roles.includes(role));
                })
                .map(option => option.path);

            const routesHomeBar = homeBarOptions
                .filter(option => {
                    return option.roles.some(role => roles.includes(role));
                })
                .map(option => option.path);

            setUser({
                nombre: decodedToken.user_data.nombre || '',
                apellido: decodedToken.user_data.apellido || '',
                email: decodedToken.user_data.email || '',
                es_tutor: decodedToken.user_data.es_tutor || false,
                roles: roles,
                carreras: decodedToken.user_carreras || []
            });

            setAvailableRoutesSideBar(routesSideBar);
            setAvailableRoutesHomeBar(routesHomeBar);

        } catch (error) {
            console.error('Error al decodificar el token:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };
    const login = (token) => {
        localStorage.setItem('token', token);
        loadUserFromToken();
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setAvailableRoutesSideBar([]);
        setAvailableRoutesHomeBar([]);
        window.location.href = loginUrl;
    };
    const hasAccess = (path) => {
        if (!user) return false;

        // Siempre permitir acceso a /home
        if (path === '/home') {
            return true;
        }

        // Verificar acceso directo
        if (availableRoutesSideBar.includes(path) || availableRoutesHomeBar.includes(path)) {
            return true;
        }
        // Por ejemplo, si tiene acceso a /users, también debería tener acceso a /admin/usuarios/*
        if (path.startsWith('/admin/usuarios/')) {
            return availableRoutesSideBar.includes('/users') ||
                availableRoutesHomeBar.includes('/users') ||
                availableRoutesSideBar.includes('/admin/usuarios') ||
                availableRoutesHomeBar.includes('/admin/usuarios');
        }

        return false;
    };

    useEffect(() => {
        loadUserFromToken();

        // Manejar token en hash URL (para login con redirección)
        const handleHashChange = () => {
            const hashToken = window.location.hash.substring(1);
            if (hashToken) {
                login(hashToken);
                window.history.replaceState(null, null, ' ');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        hasAccess,
        availableRoutesSideBar,
        availableRoutesHomeBar,
        isAuthenticated: !!user,
        reloadUser: loadUserFromToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
export default useAuth;