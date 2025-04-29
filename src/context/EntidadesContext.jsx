import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext'; // Importar el contexto de autenticación
import ApiService from '../services/ApiService.js';

const EntidadesContext = createContext();

export const useEntidades = () => useContext(EntidadesContext);

export const EntidadesProvider = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const [carreras, setCarreras] = useState([]);
    const [roles, setRoles] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const initialDataLoaded = useRef(false);

    // En EntidadesContext.jsx
    useEffect(() => {
        // Solo cargar si estamos autenticados, no estamos cargando y no hemos cargado los datos iniciales
        if (isAuthenticated && !loading && !initialDataLoaded.current) {
            loadCommonData();
            initialDataLoaded.current = true;
        }
    }, [isAuthenticated, loading]); // Elimina user de las dependencias si no es necesario

    const loadCommonData = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const requests = [
                ApiService.getCarreras(),
                ApiService.getMaterias(),
                ApiService.getTutoresByCarrera(user.carreras[0]?.id),
            ];
            // Solo cargar roles si el usuario no es "alumno" o "alumno&profesor"
            if (user?.roles[0] !== "alumno" && user?.roles[0] !== "alumno&profesor") {
                requests.push(ApiService.getRoles());
            }

            const [carrerasData, materiasData, rolesData] = await Promise.all(requests);
            if (carrerasData.success) setCarreras(carrerasData.data);
            if (materiasData.success) setMaterias(materiasData.data);
            if (rolesData?.success) setRoles(rolesData.data);
        } catch (err) {
            console.error("Error cargando datos comunes:", err);
            setError("Error al cargar los datos básicos de la aplicación");
        } finally {
            setIsLoading(false);
        }
    };

    const forceRefreshData = () => {
        initialDataLoaded.current = false;
        loadCommonData();
    };

    const value = {
        carreras,
        roles,
        materias,
        isLoading,
        error,
        getMateriasByTutor: ApiService.getMateriasByTutor,
        getTutoresByCarrera: ApiService.getTutoresByCarrera,
        getUsuarios: ApiService.getUsuarios,
        getCarreras: ApiService.getCarreras,
        getRoles: ApiService.getRoles,
        getMaterias: ApiService.getMaterias,
        deleteUsuario: ApiService.deleteUsuario,
        refreshCommonData: forceRefreshData,
    };

    return (
        <EntidadesContext.Provider value={value}>
            {children}
        </EntidadesContext.Provider>
    );
};

export default EntidadesContext;