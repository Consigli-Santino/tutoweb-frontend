import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../Login/LoginButton.css';
import '../../commonTables.css';
import { useEntidades } from '../../context/EntidadesContext.jsx';
import CustomSelect from '../../components/CustomInputs/CustomSelect.jsx'; // Importamos nuestro componente personalizado

const Users = () => {
    const navigate = useNavigate();
    const {
        carreras,
        roles,
        getUsuarios,
        deleteUsuario,
    } = useEntidades();

    const [usuarios, setUsuarios] = useState([]);
    const [filteredUsuarios, setFilteredUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [rolFilter, setRolFilter] = useState('');
    const [carreraFilter, setCarreraFilter] = useState('');
    const [materiaFilter, setMateriaFilter] = useState('');

    useEffect(() => {
        fetchUsuarios();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, rolFilter, carreraFilter, materiaFilter, usuarios]);

    const fetchUsuarios = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getUsuarios();
            if (data.success) {
                setUsuarios(data.data);
                setFilteredUsuarios(data.data);
            } else {
                throw new Error(data.message || 'Error al obtener usuarios');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...usuarios];

        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(usuario =>
                usuario.nombre.toLowerCase().includes(searchTermLower) ||
                usuario.apellido.toLowerCase().includes(searchTermLower) ||
                usuario.email.toLowerCase().includes(searchTermLower) ||
                (usuario.rol && usuario.rol.nombre.toLowerCase().includes(searchTermLower)) ||
                (usuario.carreras && usuario.carreras.some(c =>
                    c.nombre.toLowerCase().includes(searchTermLower)
                ))
            );
        }

        if (rolFilter) {
            result = result.filter(usuario =>
                usuario.rol && usuario.rol.id.toString() === rolFilter
            );
        }

        if (carreraFilter) {
            result = result.filter(usuario =>
                    usuario.carreras && usuario.carreras.some(c =>
                        c.id.toString() === carreraFilter
                    )
            );
        }

        if (materiaFilter) {
            result = result.filter(usuario =>
                    usuario.materias && usuario.materias.some(m =>
                        m.id.toString() === materiaFilter
                    )
            );
        }

        setFilteredUsuarios(result);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRolFilterChange = (e) => {
        setRolFilter(e.target.value);
    };

    const handleCarreraFilterChange = (e) => {
        const selectedCarreraId = e.target.value;
        setCarreraFilter(selectedCarreraId);
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
            const response = await deleteUsuario(id);

            if (response.success) {
                await fetchUsuarios();
            } else {
                throw new Error(response.message || 'Error al eliminar el usuario');
            }
        } catch (err) {
            setError(err.message);
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
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Administración de Usuarios</h1>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {error && (
                        <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="filter-container mb-4 p-3 shadow-sm">
                        <div className="row g-2">
                            <div className="col-12 col-md-4 mb-2">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0 py-2"
                                        placeholder="Buscar por nombre, apellido, email o carrera..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-8">
                                <div className="row g-2">
                                    <div className="col-md-4 col-6 mb-2">
                                        <CustomSelect
                                            value={rolFilter}
                                            onChange={handleRolFilterChange}
                                            options={roles}
                                            placeholder="Todos los roles"
                                            className="bg-white border-0 py-2 rounded-3"
                                            variant="light"
                                        />
                                    </div>
                                    <div className="col-md-4 col-6 mb-2">
                                        <CustomSelect
                                            value={carreraFilter}
                                            onChange={handleCarreraFilterChange}
                                            options={carreras}
                                            placeholder="Todas las carreras"
                                            className="bg-white border-0 py-2 rounded-3"
                                            variant="light"
                                        />
                                    </div>
                                    <div className="col-md-1 col-6 mb-2 d-flex align-items-center">
                                        <button
                                            className="btn btn-sm py-2 w-100 rounded-3 btn-light border-0"
                                            onClick={clearFilters}
                                            title="Limpiar filtros"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover table-rounded" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                            <tr className="table-header">
                                <th className="border-0">Nombre</th>
                                <th className="border-0">Apellido</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Fecha Registro</th>
                                <th className="border-0">Rol</th>
                                <th className="border-0">Carrera</th>
                                <th className="border-0">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsuarios.length > 0 ? (
                                filteredUsuarios.map(usuario => (
                                    <tr key={usuario.id} className="table-row hover-row">
                                        <td className="border-0 py-3">{usuario.nombre}</td>
                                        <td className="border-0 py-3">{usuario.apellido}</td>
                                        <td className="border-0 py-3">
                                                <span className="tag-email">
                                                    {usuario.email}
                                                </span>
                                        </td>
                                        <td className="border-0 py-3">
                                            {new Date(usuario.fecha_registro).toLocaleDateString()}
                                        </td>
                                        <td className="border-0 py-3">
                                                <span className={`badge ${usuario.rol.nombre ? 'bg-success' : 'bg-secondary'}`}>
                                                    {usuario.rol ? usuario.rol.nombre : 'Sin rol'}
                                                </span>
                                        </td>
                                        <td className="border-0 py-3">
                                            {usuario.carreras && usuario.carreras.length > 0
                                                ? usuario.carreras.map((c, idx) => (
                                                    <span key={idx} className="tag-carrera">
                                                            {c.nombre}
                                                        </span>
                                                ))
                                                : <span className="text-muted fst-italic">Sin carrera</span>
                                            }
                                        </td>
                                        <td className="border-0 py-3">
                                            <div className="d-flex">
                                                <button
                                                    className="btn btn-sm me-1 btn-action-edit"
                                                    onClick={() => handleEdit(usuario.id)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-action-delete"
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
                                    <td colSpan="8" className="text-center border-0 py-5">
                                        {isLoading ? (
                                            <div className="d-flex flex-column align-items-center">
                                                <div className="spinner-border" style={{ color: '#283048' }} role="status">
                                                    <span className="visually-hidden">Cargando...</span>
                                                </div>
                                                <span className="mt-2 text-muted">Cargando usuarios...</span>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column align-items-center empty-state">
                                                <i className="bi bi-search empty-state-icon"></i>
                                                <span>No hay usuarios que coincidan con los filtros aplicados</span>
                                                <button
                                                    className="btn btn-sm mt-3 app-primary"
                                                    onClick={clearFilters}
                                                >
                                                    Limpiar filtros
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                            Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
                        </div>
                    </div>

                    <div className="home-bar-spacing"></div>
                </div>
            </div>

            <button
                className="btn btn-lg rounded-circle position-fixed shadow btn-float-add"
                onClick={handleAdd}
            >
                <i className="bi bi-plus fs-4"></i>
            </button>
        </div>
    );
};

export default Users;