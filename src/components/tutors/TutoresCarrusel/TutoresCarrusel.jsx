import React, {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import './TutoresCarrusel.css';
import { useEntidades } from "../../../context/EntidadesContext.jsx";
import useAuth from "../../../context/AuthContext.jsx";
import ApiService from '../../../services/ApiService';
import CustomSelect from '../../../components/CustomInputs/CustomSelect.jsx';

const TutoresCarrusel = () => {
    const { user } = useAuth();
    const { getTutoresByCarreraWithMaterias, getMateriasByCarrera } = useEntidades();
    const [tutores, setTutores] = useState([]);
    const [filteredTutores, setFilteredTutores] = useState([]);
    const [tutoresServicios, setTutoresServicios] = useState({});
    const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [imageUrls, setImageUrls] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const timerRef = useRef(null);
    const carreraId = user?.carreras?.[0]?.id;

    const filterTutoresByService = (tutoresArray, serviceValue) => {
        if (!serviceValue || !serviceValue.trim()) {
            return tutoresArray;
        }

        return tutoresArray.filter(tutor => {
            const servicios = tutoresServicios[tutor.email] || [];
            return servicios.some(servicio =>
                servicio.materia?.id?.toString() === serviceValue.trim()
            );
        });
    };

    const applyFilters = (tutoresArray) => {
        let filtered = tutoresArray;

        // Filtrar por nombre
        if (searchTerm && searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(tutor =>
                tutor.nombre.toLowerCase().includes(searchLower) ||
                tutor.apellido.toLowerCase().includes(searchLower) ||
                tutor.email.toLowerCase().includes(searchLower)
            );
        }
        if (serviceFilter && serviceFilter.trim()) {
            filtered = filterTutoresByService(filtered, serviceFilter);
        }

        return filtered;
    };

    useEffect(() => {
        const filtered = applyFilters(tutores);
        setFilteredTutores(filtered);

        // Ajustar currentIndex si es necesario
        if (filtered.length === 0) {
            setCurrentIndex(0);
        } else if (currentIndex >= filtered.length) {
            setCurrentIndex(0);
        }

        setIsTransitioning(false);
        setPreviousIndex(null);
    }, [tutores, searchTerm, serviceFilter, tutoresServicios]);

    const handlePrevTutor = () => {
        if (isTransitioning || filteredTutores.length <= 1) return;
        setPreviousIndex(currentIndex);
        const prevIndex = currentIndex === 0 ? filteredTutores.length - 1 : currentIndex - 1;
        setIsTransitioning(true);
        setCurrentIndex(prevIndex);
    };

    const handleNextTutor = () => {
        if (isTransitioning || filteredTutores.length <= 1) return;
        setPreviousIndex(currentIndex);
        const nextIndex = currentIndex === filteredTutores.length - 1 ? 0 : currentIndex + 1;
        setIsTransitioning(true);
        setCurrentIndex(nextIndex);
    };

    useEffect(() => {
        const fetchTutores = async () => {
            try {
                if (!carreraId) {
                    setError('No se encontró información de carrera del usuario');
                    setLoading(false);
                    return;
                }

                const data = await getTutoresByCarreraWithMaterias(carreraId);
                if (data.success) {
                    setTutores(data.data);
                    setFilteredTutores(data.data);

                    const serviciosPorTutor = {};
                    for (const tutor of data.data) {
                        const serviciosResponse = await ApiService.fetchApi(`/servicios/tutor/${tutor.email}`);
                        if (serviciosResponse.success) {
                            serviciosPorTutor[tutor.email] = serviciosResponse.data;
                        }
                    }
                    setTutoresServicios(serviciosPorTutor);
                } else {
                    setError(data.message || 'Error al cargar los tutores');
                }

                const materiasResponse = await getMateriasByCarrera(carreraId);
                if (materiasResponse && materiasResponse.success) {
                    setMateriasDisponibles(materiasResponse.data);
                } else {
                    console.warn('No se pudieron cargar las materias para el filtro');
                }
            } catch (err) {
                setError('Error al conectar con el servidor');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTutores();
    }, [getTutoresByCarreraWithMaterias, getMateriasByCarrera, carreraId]);

    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setPreviousIndex(null);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    useEffect(() => {
        if (filteredTutores.length <= 1 || searchTerm.trim() || serviceFilter.trim()) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            if (!isTransitioning) {
                setPreviousIndex(currentIndex);
                const nextIndex = currentIndex === filteredTutores.length - 1 ? 0 : currentIndex + 1;
                setIsTransitioning(true);
                setCurrentIndex(nextIndex);
            }
        }, 7000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [filteredTutores.length, currentIndex, isTransitioning, searchTerm, serviceFilter]);

    const loadImageAsBlob = async (fotoPath) => {
        if (!fotoPath) return 'https://via.placeholder.com/400';
        if (fotoPath.startsWith('http')) return fotoPath;
        const baseUrl = import.meta.env.VITE_BACKEND_URL
        const fullUrl = `${baseUrl}${fotoPath}`;
        if (imageUrls[fullUrl]) {
            return imageUrls[fullUrl];
        }
        if (loadingImages[fullUrl]) {
            return 'https://via.placeholder.com/400';
        }

        try {
            setLoadingImages(prev => ({...prev, [fullUrl]: true}));
            const response = await fetch(fullUrl, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to load image');

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            setImageUrls(prev => ({...prev, [fullUrl]: blobUrl}));
            setLoadingImages(prev => ({...prev, [fullUrl]: false}));

            return blobUrl;
        } catch (error) {
            console.error('Error loading image:', error);
            setLoadingImages(prev => ({...prev, [fullUrl]: false}));
            return 'https://via.placeholder.com/400';
        }
    };

    const getImageUrl = (fotoPath) => {
        if (!fotoPath) return 'https://via.placeholder.com/400';
        if (fotoPath.startsWith('http')) return fotoPath;
        const baseUrl = import.meta.env.VITE_BACKEND_URL
        const fullUrl = `${baseUrl}${fotoPath}`;
        return imageUrls[fullUrl] || 'https://via.placeholder.com/400';
    };

    useEffect(() => {
        const preloadImages = async () => {
            for (const tutor of filteredTutores) {
                if (tutor.foto_perfil) {
                    await loadImageAsBlob(tutor.foto_perfil);
                }
            }
        };

        if (filteredTutores.length > 0) {
            preloadImages();
        }
    }, [filteredTutores]);

    const renderStars = (puntuacion) => {
        const totalStars = 5;
        const fullStars = Math.floor(puntuacion);
        const halfStar = puntuacion % 1 >= 0.5;

        let stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>);
        }

        if (halfStar) {
            stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
        }

        const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
        }

        return (
            <div className="d-flex align-items-center">
                {stars}
                <small className="text-muted ms-1">({puntuacion.toFixed(1)})</small>
            </div>
        );
    };

    const resetSearch = () => {
        setServiceFilter("");
        setSearchTerm("");
    };

    const hasActiveFilters = () => {
        return searchTerm.trim() || serviceFilter.trim();
    };

    if (loading) {
        return (
            <div className="tutores-carrusel-compact my-2 text-center">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <small className="ms-2">Cargando tutores...</small>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tutores-carrusel-compact my-2">
                <div className="alert alert-danger py-1 small" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (tutores.length === 0) {
        return null;
    }

    if (filteredTutores.length === 0 && hasActiveFilters()) {
        return (
            <div className="tutores-destacados-section h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Tutores Destacados</h6>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowFilter(!showFilter)}
                        title="Buscar tutor"
                    >
                        <i className="bi bi-funnel"></i>
                    </button>
                </div>

                <div className="mb-3">
                    <div className="row g-2">
                        <div className="input-group">
                        <span className="input-group-text bg-white border-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                            <input
                                type="text"
                                className="form-control form-control-sm border-0 py-2"
                                placeholder="Buscar por nombre"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-12">
                            <CustomSelect
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                options={materiasDisponibles}
                                placeholder="Buscar por materia..."
                                className="form-select form-select-sm"
                                variant="light"
                            />
                        </div>
                        {hasActiveFilters() && (
                            <div className="col-12">
                                <button
                                    className="btn btn-sm btn-outline-secondary w-100"
                                    onClick={resetSearch}
                                    title="Limpiar filtros"
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="tutores-card card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="card-body p-3 text-center">
                        <i className="bi bi-search fs-1 text-muted mb-3"></i>
                        <p className="text-muted mb-2">
                            No se encontraron tutores con los filtros aplicados
                        </p>
                        {searchTerm && (
                            <p className="small text-muted">Nombre: "{searchTerm}"</p>
                        )}
                        {serviceFilter && (
                            <p className="small text-muted">
                                Materia: "{materiasDisponibles.find(m => m.id.toString() === serviceFilter)?.nombre || serviceFilter}"
                            </p>
                        )}
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={resetSearch}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Mostrar todos los tutores
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // CORRECCIÓN: Agregar validación para evitar el error
    if (filteredTutores.length === 0 || currentIndex >= filteredTutores.length) {
        return null;
    }

    const tutor = filteredTutores[currentIndex];

    // CORRECCIÓN: Validación adicional antes de acceder a tutor.email
    if (!tutor) {
        return null;
    }

    const servicios = tutoresServicios[tutor.email] || [];

    return (
        <div className="tutores-destacados-section h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                    Tutores Destacados
                    {hasActiveFilters() && (
                        <span className="badge bg-primary ms-2 small">
                            Filtrado
                            {searchTerm && ` - ${searchTerm}`}
                            {serviceFilter && ` - ${materiasDisponibles.find(m => m.id.toString() === serviceFilter)?.nombre || 'Materia'}`}
                        </span>
                    )}
                </h6>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowFilter(!showFilter)}
                    title="Filtros"
                >
                    <i className="bi bi-funnel"></i>
                </button>
            </div>

            {showFilter && (
                <div className="mb-3">
                    <div className="row g-2">
                        <div className="input-group">
                        <span className="input-group-text bg-white border-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                            <input
                                type="text"
                                className="form-control form-control-sm border-0 py-2"
                                placeholder="Buscar por nombre"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-12">
                            <CustomSelect
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                options={materiasDisponibles}
                                placeholder="Buscar por materia..."
                                className="form-select form-select-sm"
                                variant="light"
                            />
                        </div>
                        {hasActiveFilters() && (
                            <div className="col-12">
                                <button
                                    className="btn btn-sm btn-outline-secondary w-100"
                                    onClick={resetSearch}
                                    title="Limpiar filtros"
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="tutores-card card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="tutor-slide-container position-relative">
                    <div className="tutor-images-wrapper">
                        {isTransitioning && previousIndex !== null && filteredTutores[previousIndex] && (
                            <img
                                src={getImageUrl(filteredTutores[previousIndex].foto_perfil)}
                                className="tutor-image tutor-image-outgoing"
                                alt={`${filteredTutores[previousIndex].nombre} ${filteredTutores[previousIndex].apellido}`}
                            />
                        )}

                        <img
                            src={getImageUrl(tutor.foto_perfil)}
                            className="tutor-image tutor-image-incoming"
                            alt={`${tutor.nombre} ${tutor.apellido}`}
                        />
                    </div>

                    <div className="nombre-overlay d-flex align-items-end">
                        <h6 className="text-white text-center w-100 mb-2">
                            {tutor.nombre} {tutor.apellido}
                        </h6>
                    </div>

                    {filteredTutores.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevTutor}
                                className="carousel-control-prev"
                                type="button"
                                aria-label="Anterior"
                                disabled={isTransitioning}
                            >
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            </button>
                            <button
                                onClick={handleNextTutor}
                                className="carousel-control-next"
                                type="button"
                                aria-label="Siguiente"
                                disabled={isTransitioning}
                            >
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            </button>
                        </>
                    )}
                </div>

                <div className="card-body p-3">
                    <div className="mb-2">
                        {renderStars(tutor.puntuacion_promedio)}
                    </div>

                    <div className="mb-2">
                        <div className="d-flex align-items-center">
                            <small className="fw-bold me-1">Carrera:</small>
                            <small className="text-dark">{tutor.carreras[0]?.nombre}</small>
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="d-flex align-items-start flex-wrap">
                            <small className="fw-bold me-1">Servicios:</small>
                            <small className="text-dark">
                                {servicios.length > 0 ? (
                                    <>
                                        {servicios.slice(0, 2).map((servicio, index) => (
                                            <span key={servicio.id}>
                                                {servicio.materia?.nombre}
                                                {index === 0 && servicios.length > 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                        {servicios.length > 2 ? ` y ${servicios.length - 2} más` : ''}
                                    </>
                                ) : (
                                    "No hay servicios disponibles"
                                )}
                            </small>
                        </div>
                    </div>

                    <Link
                        to={`/tutores/${tutor.email}`}
                        className="btn btn-primary btn-sm w-100 rounded-3 mt-2"
                        style={{backgroundColor: '#283048', borderColor: '#283048'}}
                    >
                        Ver Disponibilidad
                    </Link>
                </div>
            </div>

            {filteredTutores.length > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    {filteredTutores.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`carousel-indicator-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => {
                                if (!isTransitioning) {
                                    setPreviousIndex(currentIndex);
                                    setIsTransitioning(true);
                                    setCurrentIndex(index);
                                }
                            }}
                            disabled={isTransitioning}
                            aria-label={`Tutor ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TutoresCarrusel;