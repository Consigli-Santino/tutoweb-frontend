// EntidadesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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

    // Cargar datos comunes al iniciar
    useEffect(() => {
        loadCommonData();
    }, []);

    // Función para cargar datos comunes
    const loadCommonData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Cargar carreras
            const carrerasData = await ApiService.getCarreras();
            if (carrerasData.success) {
                setCarreras(carrerasData.data);
            }

            // Cargar roles
            const rolesData = await ApiService.getRoles();
            if (rolesData.success) {
                setRoles(rolesData.data);
            }

            // Cargar materias
            const materiasData = await ApiService.getMaterias();
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
        refreshCommonData: loadCommonData,
    };

    return (
        <EntidadesContext.Provider value={value}>
            {children}
        </EntidadesContext.Provider>
    );
};

export default EntidadesContext;