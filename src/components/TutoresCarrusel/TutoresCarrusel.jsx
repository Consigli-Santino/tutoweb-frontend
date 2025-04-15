import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TutoresCarrusel.css';

const TutoresCarrusel = () => {
    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchTutores = async () => {
            try {
                // Simulación de petición fetch
                // En una implementación real, esta sería la URL de tu API
                //const response = await fetch('https://api.tutoweb.com/usuarios?es_tutor=true');

                // Simulamos la respuesta
                const mockResponse = {
                    "success": true,
                    "data": [
                        {
                            "id": 2,
                            "nombre": "Santino",
                            "apellido": "Consigli",
                            "email": "consiglisantino@gmail.com",
                            "fecha_registro": "2025-03-30T02:46:13.603000",
                            "es_tutor": true,
                            "puntuacion_promedio": 4.8,
                            "cantidad_reseñas": 15,
                            "foto_perfil": "https://ui-avatars.com/api/?name=Santino+Consigli",
                            "id_rol": 2,
                            "carreras": [
                                { "id": 1, "nombre": "Tecnicatura en Programación" }
                            ],
                            "materias": ["Programación I", "Algoritmos Avanzados"]
                        },
                        {
                            "id": 3,
                            "nombre": "Laura",
                            "apellido": "Martínez",
                            "email": "laura.martinez@example.com",
                            "fecha_registro": "2025-04-02T15:48:52.883000",
                            "es_tutor": true,
                            "puntuacion_promedio": 4.5,
                            "cantidad_reseñas": 12,
                            "foto_perfil": "https://randomuser.me/api/portraits/women/44.jpg",
                            "id_rol": 2,
                            "carreras": [
                                { "id": 1, "nombre": "Tecnicatura en Programación" }
                            ],
                            "materias": ["Bases de Datos", "Sistemas Operativos"]
                        },
                        {
                            "id": 4,
                            "nombre": "Eliseo",
                            "apellido": "Lariguet",
                            "email": "user@eliseo.com",
                            "fecha_registro": "2025-04-02T23:13:05.687000",
                            "es_tutor": true,
                            "puntuacion_promedio": 4.7,
                            "cantidad_reseñas": 9,
                            "foto_perfil": "https://randomuser.me/api/portraits/men/67.jpg",
                            "id_rol": 2,
                            "carreras": [
                                { "id": 1, "nombre": "Tecnicatura en Programación" }
                            ],
                            "materias": ["Redes", "Seguridad Informática"]
                        },
                        {
                            "id": 5,
                            "nombre": "Carla",
                            "apellido": "Fernández",
                            "email": "carla.fernandez@example.com",
                            "fecha_registro": "2025-03-15T10:23:45.123000",
                            "es_tutor": true,
                            "puntuacion_promedio": 4.9,
                            "cantidad_reseñas": 20,
                            "foto_perfil": "https://randomuser.me/api/portraits/women/28.jpg",
                            "id_rol": 2,
                            "carreras": [
                                { "id": 1, "nombre": "Tecnicatura en Programación" }
                            ],
                            "materias": ["Matemática Discreta", "Álgebra Lineal"]
                        }
                    ],
                    "message": "Get usuarios successfully"
                };

                // En un caso real, esperaríamos la respuesta del fetch
                // const data = await response.json();
                const data = mockResponse;

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

        // Establecer intervalo para el carrusel automático
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === tutores.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [tutores.length]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? tutores.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === tutores.length - 1 ? 0 : prevIndex + 1
        );
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
            <div className="d-flex justify-content-center">
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
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="card-body px-3 py-2">
                        <div className="d-flex align-items-center mb-2">
                            <img
                                src={tutor.foto_perfil || 'https://via.placeholder.com/50'}
                                className="tutor-img-compact rounded-circle"
                                alt={`${tutor.nombre} ${tutor.apellido}`}
                            />
                            <div className="ms-3">
                                <h6 className="fw-bold mb-0">{tutor.nombre} {tutor.apellido}</h6>
                                {renderStars(tutor.puntuacion_promedio)}
                            </div>
                        </div>

                        <div className="text-center mb-2">
                            <div className="badge rounded-pill fw-normal mb-1" style={{backgroundColor: '#283048', color: 'white'}}>
                                {tutor.carreras[0]?.nombre}
                            </div>
                        </div>

                        <div className="materias-container text-center mb-2">
                            <small className="fw-bold d-block mb-1">Materias:</small>
                            <div className="d-flex flex-wrap justify-content-center gap-1">
                                {tutor.materias?.map((materia, idx) => (
                                    <span key={idx} className="badge bg-light text-dark small">
                                        {materia}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Link
                            to={`/tutores/${tutor.id}`}
                            className="btn btn-primary btn-sm w-100 rounded-3"
                            style={{backgroundColor: '#283048', borderColor: '#283048'}}
                        >
                            Ver Disponibilidad
                        </Link>
                    </div>
                </div>

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
            </div>
        </div>
    );
};

export default TutoresCarrusel;