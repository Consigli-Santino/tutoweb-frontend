import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../Login/LoginButton.css';

const Users = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [filteredUsuarios, setFilteredUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [rolFilter, setRolFilter] = useState('');
    const [carreraFilter, setCarreraFilter] = useState('');
    const [materiaFilter, setMateriaFilter] = useState('');

    // Listas para los selectores de filtro
    const [carreras, setCarreras] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [roles] = useState([
        { id: 'all', nombre: 'Todos' },
        { id: 'true', nombre: 'Tutores' },
        { id: 'false', nombre: 'Estudiantes' }
    ]);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Efecto para aplicar los filtros cuando cambian
    useEffect(() => {
        applyFilters();
    }, [searchTerm, rolFilter, carreraFilter, materiaFilter, usuarios]);

    const fetchUsuarios = async () => {
        setIsLoading(true);
        try {
            // Obtener token del localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const response = await fetch('http://localhost:7000/usuarios/all', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setUsuarios(data.data);
                setFilteredUsuarios(data.data);

                // Extraer lista única de carreras
                const uniqueCarreras = [];
                const carrerasSet = new Set();

                data.data.forEach(usuario => {
                    if (usuario.carreras && usuario.carreras.length > 0) {
                        usuario.carreras.forEach(carrera => {
                            if (!carrerasSet.has(carrera.id)) {
                                carrerasSet.add(carrera.id);
                                uniqueCarreras.push(carrera);
                            }
                        });
                    }
                });

                setCarreras([{ id: '', nombre: 'Todas las carreras' }, ...uniqueCarreras]);

                // Aquí se podrían obtener las materias desde una API si estuvieran disponibles
                setMaterias([{ id: '', nombre: 'Todas las materias' }]);

            } else {
                throw new Error(data.message || 'Error al obtener usuarios');
            }
        } catch (error) {
            console.error('Error fetching usuarios:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para aplicar todos los filtros
    const applyFilters = () => {
        let result = [...usuarios];

        // Aplicar filtro de búsqueda general
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(usuario =>
                usuario.nombre.toLowerCase().includes(searchTermLower) ||
                usuario.apellido.toLowerCase().includes(searchTermLower) ||
                usuario.email.toLowerCase().includes(searchTermLower) ||
                (usuario.carreras && usuario.carreras.some(c =>
                    c.nombre.toLowerCase().includes(searchTermLower)
                ))
            );
        }

        // Aplicar filtro por rol (tutor/estudiante)
        if (rolFilter && rolFilter !== 'all') {
            const isTutor = rolFilter === 'true';
            result = result.filter(usuario => usuario.es_tutor === isTutor);
        }

        // Aplicar filtro por carrera
        if (carreraFilter) {
            result = result.filter(usuario =>
                    usuario.carreras && usuario.carreras.some(c =>
                        c.id.toString() === carreraFilter
                    )
            );
        }

        // Aplicar filtro por materia (si estuviera disponible)
        if (materiaFilter) {
            // Aquí iría la lógica para filtrar por materia
            // Por ahora no se implementa porque no tenemos datos de materias
        }

        setFilteredUsuarios(result);
    };

    // Manejar cambios en los filtros
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRolFilterChange = (e) => {
        setRolFilter(e.target.value);
    };

    const handleCarreraFilterChange = (e) => {
        setCarreraFilter(e.target.value);
    };

    const handleMateriaFilterChange = (e) => {
        setMateriaFilter(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRolFilter('');
        setCarreraFilter('');
        setMateriaFilter('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:7000/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar: ${response.status}`);
            }

            // Refrescar la lista de usuarios
            await fetchUsuarios();

        } catch (error) {
            console.error('Error eliminando usuario:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/usuarios/editar/${id}`);
    };

    const handleAdd = () => {
        navigate('/admin/usuarios/nuevo');
    };

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow border-0 rounded-4 overflow-hidden">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="fw-bold fs-4 mb-0">Administración de Usuarios</h1>

                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Sección de filtros */}
                    <div className="row g-2 mb-4">
                        <div className="col-12 col-md-4 mb-2">
                            <input
                                type="text"
                                className="form-control form-control-sm bg-light border-0 py-2 rounded-3"
                                placeholder="Buscar por nombre, apellido, email o carrera..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="col-12 col-md-8">
                            <div className="row g-2">
                                <div className="col-md-4 col-6 mb-2">
                                    <select
                                        className="form-select form-select-sm bg-light border-0 py-2 rounded-3"
                                        value={rolFilter}
                                        onChange={handleRolFilterChange}
                                    >
                                        <option value="">Todos los roles</option>
                                        <option value="true">Tutores</option>
                                        <option value="false">Estudiantes</option>
                                    </select>
                                </div>
                                <div className="col-md-4 col-6 mb-2">
                                    <select
                                        className="form-select form-select-sm bg-light border-0 py-2 rounded-3"
                                        value={carreraFilter}
                                        onChange={handleCarreraFilterChange}
                                    >
                                        <option value="">Todas las carreras</option>
                                        {carreras.slice(1).map(carrera => (
                                            <option key={carrera.id} value={carrera.id}>
                                                {carrera.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 col-6 mb-2">
                                    <select
                                        className="form-select form-select-sm bg-light border-0 py-2 rounded-3"
                                        value={materiaFilter}
                                        onChange={handleMateriaFilterChange}
                                        disabled={materias.length <= 1}
                                    >
                                        <option value="">Todas las materias</option>
                                        {materias.slice(1).map(materia => (
                                            <option key={materia.id} value={materia.id}>
                                                {materia.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-1 col-6 mb-2 d-flex align-items-center">
                                    <button
                                        className="btn btn-sm btn-outline-secondary py-2 w-100"
                                        onClick={clearFilters}
                                        title="Limpiar filtros"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>Fecha Registro</th>
                                <th>Tutor</th>
                                <th>Carrera</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsuarios.length > 0 ? (
                                filteredUsuarios.map(usuario => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.apellido}</td>
                                        <td>{usuario.email}</td>
                                        <td>{new Date(usuario.fecha_registro).toLocaleDateString()}</td>
                                        <td>
                                                <span className={`badge ${usuario.es_tutor ? 'bg-success' : 'bg-secondary'}`}>
                                                    {usuario.es_tutor ? 'Sí' : 'No'}
                                                </span>
                                        </td>
                                        <td>
                                            {usuario.carreras && usuario.carreras.length > 0
                                                ? usuario.carreras.map(c => c.nombre).join(', ')
                                                : '-'
                                            }
                                        </td>
                                        <td>
                                            <div className="d-flex">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => handleEdit(usuario.id)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(usuario.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        {isLoading ? 'Cargando usuarios...' : 'No hay usuarios que coincidan con los filtros aplicados'}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mostrar contador de resultados */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                            Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
                        </div>
                    </div>

                    {/* Espacio adicional para evitar que el contenido quede detrás del HomeBar en mobile */}
                    <div className="pb-5 mb-4"></div>
                </div>
            </div>

            {/* Botón flotante para agregar usuario */}
            <button
                className="btn btn-lg rounded-circle position-fixed shadow"
                style={{
                    backgroundColor: '#283048',
                    color: 'white',
                    width: '56px',
                    height: '56px',
                    bottom: '80px',
                    right: '20px',
                    zIndex: 999,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onClick={handleAdd}
            >
                <i className="bi bi-plus fs-4"></i>
            </button>
        </div>
    );
};

export default Users;