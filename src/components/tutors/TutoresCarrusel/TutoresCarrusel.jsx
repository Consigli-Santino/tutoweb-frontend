import React, {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import './TutoresCarrusel.css';
import { useEntidades } from "../../../context/EntidadesContext.jsx";
import useAuth from "../../../context/AuthContext.jsx";
import ApiService from '../../../services/ApiService';

const TutoresCarrusel = () => {
    const { user } = useAuth();
    const { getTutoresByCarreraWithMaterias, getServiciosByTutor } = useEntidades();
    const [tutores, setTutores] = useState([]);
    const [tutoresServicios, setTutoresServicios] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const timerRef = useRef(null);
    const handlePrevTutor = () => {
        if (isTransitioning) return;
        setPreviousIndex(currentIndex);
        const prevIndex = currentIndex === 0 ? tutores.length - 1 : currentIndex - 1;
        setIsTransitioning(true);
        setCurrentIndex(prevIndex);
    };

    // Manejador para cambiar manualmente al siguiente tutor
    const handleNextTutor = () => {
        if (isTransitioning) return;
        setPreviousIndex(currentIndex);
        const nextIndex = currentIndex === tutores.length - 1 ? 0 : currentIndex + 1;
        setIsTransitioning(true);
        setCurrentIndex(nextIndex);
    };

    useEffect(() => {
        const fetchTutores = async () => {
            try {
                const data = await getTutoresByCarreraWithMaterias(user.carreras[0]?.id);
                if (data.success) {
                    setTutores(data.data);

                    // Cargar servicios para cada tutor
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
            } catch (err) {
                setError('Error al conectar con el servidor');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTutores();
    }, [getTutoresByCarreraWithMaterias, user.carreras]);

    // Efecto para detectar el final de la transición
    useEffect(() => {
        if (isTransitioning) {
            // Finalizar la transición después de 800ms
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setPreviousIndex(null);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    // Efecto para rotación automática con transición suave
    useEffect(() => {
        // Solo configurar el intervalo si hay más de un tutor y no estamos en transición
        if (tutores.length <= 1) return;

        // Limpiar cualquier temporizador previo
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Intervalo para cambiar tutores (7 segundos)
        timerRef.current = setInterval(() => {
            if (!isTransitioning) {
                // Guardar el índice actual como el anterior
                setPreviousIndex(currentIndex);

                // Determinar índice siguiente
                const nextIndex = currentIndex === tutores.length - 1 ? 0 : currentIndex + 1;

                // Iniciar transición
                setIsTransitioning(true);
                setCurrentIndex(nextIndex);
            }
        }, 7000);

        // Limpiar intervalo al desmontar
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [tutores.length, currentIndex, isTransitioning]);

    const getImageUrl = (fotoPath) => {
        if (!fotoPath) return 'https://via.placeholder.com/400';

        return fotoPath.startsWith('http')
            ? fotoPath
            : `http://192.168.0.38:7000${fotoPath}`;
    };

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

    // Mostrar solo el tutor actual
    const tutor = tutores[currentIndex];
    // Obtener los servicios del tutor actual usando su email como clave
    const servicios = tutoresServicios[tutor.email] || [];

    return (
        <div className="tutores-destacados-section h-100">
            <h6 className="fw-bold text-center mb-3">Tutores Destacados</h6>

            <div className="tutores-card card shadow-sm border-0 rounded-4 overflow-hidden">
                {/* Contenedor de imagen con transición suave */}
                <div className="tutor-slide-container position-relative">
                    <div className="tutor-images-wrapper">
                        {/* Mostrar la imagen anterior durante la transición */}
                        {isTransitioning && previousIndex !== null && (
                            <img
                                src={getImageUrl(tutores[previousIndex].foto_perfil)}
                                className="tutor-image tutor-image-outgoing"
                                alt={`${tutores[previousIndex].nombre} ${tutores[previousIndex].apellido}`}
                            />
                        )}

                        {/* Mostrar la imagen actual */}
                        <img
                            src={getImageUrl(tutor.foto_perfil)}
                            className="tutor-image tutor-image-incoming"
                            alt={`${tutor.nombre} ${tutor.apellido}`}
                        />
                    </div>

                    {/* Overlay con nombre */}
                    <div className="nombre-overlay d-flex align-items-end">
                        <h6 className="text-white text-center w-100 mb-2">
                            {tutor.nombre} {tutor.apellido}
                        </h6>
                    </div>

                    {/* Botones de navegación lateral */}
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
                </div>

                {/* Información adicional bajo la imagen */}
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

            {/* Indicadores de carrusel */}
            <div className="d-flex justify-content-center mt-3">
                {tutores.map((_, index) => (
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
        </div>
    );
};

export default TutoresCarrusel;