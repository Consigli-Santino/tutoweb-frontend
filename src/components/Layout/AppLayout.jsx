import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from "../Navbar/Navbar.jsx";
import HomeBar from "../HomeBar/HomeBar.jsx";
import SideBarOptionsService from "../../services/SideBarOptionsService.js";
import HomeBarOptionsService from "../../services/HomeBarOptionsService.js";
import useAuth from "../../context/AuthContext.jsx";

const AppLayout = () => {
    const { user, availableRoutesSideBar, availableRoutesHomeBar, isAuthenticated } = useAuth();
    const location = useLocation();

    const publicRoutes = ['/login', '/', '/form-user', '/unauthorized'];
    if (publicRoutes.includes(location.pathname) || !isAuthenticated) {
        return <Outlet />;
    }

    const sideBarOptions = SideBarOptionsService.getOptions(user?.roles || []);
    const homeBarOptions = HomeBarOptionsService.getOptions(user?.roles || []);

    const filteredButtonsSideBar = sideBarOptions.filter((option) => {
        return availableRoutesSideBar.includes(option.path);
    });

    const filteredButtonsHome = homeBarOptions.filter((option) => {
        return availableRoutesHomeBar.includes(option.path);
    });

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar fijo en todas las páginas autenticadas */}
            <Navbar userOptions={filteredButtonsSideBar} />

            {/* Contenido dinámico que cambia según la ruta */}
            <div className="flex-grow-1">
                <Outlet />
            </div>

            {/* HomeBar fijo en todas las páginas autenticadas */}
            <HomeBar userOptions={filteredButtonsHome} />
        </div>
    );
};

export default AppLayout;