import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TutoresCarrusel.css';
import { useEntidades } from "../../context/EntidadesContext.jsx";

const TutoresCarrusel = () => {
    const { getUsuarios } = useEntidades();
    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Cargar tutores al montar el componente
    useEffect(() => {
        const fetchTutores = async () => {
            try {
                const data = await getUsuarios();
                if (data.success) {
                    setTutores(data.data);
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
    }, [getUsuarios]);

    // Efecto para rotación automática
    useEffect(() => {
        // Solo configurar el intervalo si hay más de un tutor
        if (tutores.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prevIndex =>
                prevIndex === tutores.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        // Limpiar intervalo al desmontar
        return () => clearInterval(interval);
    }, [tutores.length]);

    const getImageUrl = (fotoPath) => {
        if (!fotoPath) return 'https://via.placeholder.com/400';

        return fotoPath.startsWith('http')
            ? fotoPath
            : `http://localhost:7000${fotoPath}`;
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

    return (
        <div className="tutores-carrusel-compact my-2">
            <h6 className="fw-bold text-center mb-2">Tutores Destacados</h6>

            <div className="tutor-card-compact position-relative">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{position: 'relative'}}>
                    {/* Imagen del tutor que ocupa todo el ancho */}
                    <div className="tutor-img-container">
                        <img
                            src={getImageUrl(tutor.foto_perfil)}
                            className="tutor-img-compact"
                            alt={`${tutor.nombre} ${tutor.apellido}`}
                        />
                        {/* Overlay con nombre directamente sobre la imagen */}
                        <div className="nombre-overlay">
                            <h6 className="text-white text-center mb-0">
                                {tutor.nombre} {tutor.apellido}
                            </h6>
                        </div>
                    </div>

                    {/* Información adicional bajo la imagen */}
                    <div className="card-body p-2">
                        <div className="mb-2">
                            {renderStars(tutor.puntuacion_promedio)}
                        </div>

                        <div className="mb-2">
                            <div className="d-flex align-items-center">
                                <small className="fw-bold me-1">Carrera:</small>
                                <small className="text-dark">{tutor.carreras[0]?.nombre}</small>
                            </div>
                        </div>

                        <div className="materias-container mb-2">
                            <div className="d-flex align-items-center flex-wrap">
                                <small className="fw-bold me-1">Materias:</small>
                                <small className="text-dark">
                                    {tutor.materias?.slice(0, 2).join(', ')}
                                    {tutor.materias?.length > 2 ? ` y ${tutor.materias.length - 2} más` : ''}
                                </small>
                            </div>
                        </div>

                        <Link
                            to={`/tutores/${tutor.id}`}
                            className="btn btn-primary btn-sm w-100 rounded-3 mt-2"
                            style={{backgroundColor: '#283048', borderColor: '#283048', fontSize: '0.8rem', position: 'relative', zIndex: 10}}
                        >
                            Ver Disponibilidad
                        </Link>
                    </div>
                </div>

                {/* Indicadores de carrusel */}
                <div className="carousel-indicators-compact">
                    {tutores.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`carousel-indicator-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Tutor ${index + 1}`}
                        ></button>
                    ))}
                </div>

                {/* Botones de acción estilo app de citas (opcionales) */}
                <div className="tutor-actions d-none">
                    <button className="action-btn action-dislike">
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <button className="action-btn action-like">
                        <i className="bi bi-heart-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutoresCarrusel;