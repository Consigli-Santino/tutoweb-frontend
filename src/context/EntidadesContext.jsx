// EntidadesContext.jsx - Versión optimizada
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import ApiService from '../services/ApiService.js';

// Crear el contexto
const EntidadesContext = createContext();

// Hook personalizado para usar el contexto
export const useEntidades = () => useContext(EntidadesContext);

// Proveedor del contexto
export const EntidadesProvider = ({ children }) => {
    // Estados para los datos comunes
    const [carreras, setCarreras] = useState([]);
    const [roles, setRoles] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Usar useRef para rastrear si ya se cargaron los datos
    const initialDataLoaded = useRef(false);

    // Cargar datos comunes solo una vez al iniciar
    useEffect(() => {
        // Evitar cargar datos si ya han sido cargados
        if (!initialDataLoaded.current) {
            loadCommonData();
            initialDataLoaded.current = true;
        }
    }, []);

    // Función para cargar datos comunes
    const loadCommonData = async () => {
        // Evitar iniciar otra carga si ya está en progreso
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            // Cargar datos en paralelo para mejorar rendimiento
            const [carrerasData, rolesData, materiasData] = await Promise.all([
                ApiService.getCarreras(),
                ApiService.getRoles(),
                ApiService.getMaterias()
            ]);

            console.log("Datos cargados una sola vez");

            if (carrerasData.success) {
                setCarreras(carrerasData.data);
            }

            if (rolesData.success) {
                setRoles(rolesData.data);
            }

            if (materiasData.success) {
                setMaterias(materiasData.data);
            }
        } catch (err) {
            console.error('Error cargando datos comunes:', err);
            setError('Error al cargar los datos básicos de la aplicación');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para forzar la recarga de datos si es necesario
    const forceRefreshData = () => {
        initialDataLoaded.current = false;
        loadCommonData();
    };

    // Valor del contexto que se proveerá
    const value = {
        // Datos
        carreras,
        roles,
        materias,

        // Estado
        isLoading,
        error,

        // Métodos para obtener datos
        getUsuarios: ApiService.getUsuarios,
        getCarreras: ApiService.getCarreras,
        getRoles: ApiService.getRoles,
        getMaterias: ApiService.getMaterias,
        deleteUsuario: ApiService.deleteUsuario,

        // Método para recargar datos comunes
        refreshCommonData: forceRefreshData,
    };

    return (
        <EntidadesContext.Provider value={value}>
            {children}
        </EntidadesContext.Provider>
    );
};

export default EntidadesContext;