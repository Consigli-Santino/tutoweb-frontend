import React from 'react';
import TutoresCarrusel from "../tutors/TutoresCarrusel/TutoresCarrusel.jsx";
const Home = () => {
    return(
        <>
            {/* Contenedor principal con diseño responsivo */}
            <div className="container-fluid px-3 py-2">
                <div className="row">
                    {/* Columna del carrusel - En móvil ocupa todo el ancho, en PC la mitad izquierda */}
                    <div className="col-12 col-lg-6 mb-lg-0">
                        <TutoresCarrusel />
                    </div>

                    {/* Columna derecha - Mensajes de bienvenida y juego */}
                    <div className="col-12 col-lg-6">
                        <div className="ps-lg-3">
                            {/* Mensajes de bienvenida - Solo en PC */}
                            <div className="d-none d-lg-block mb-4">
                                <h1 className="fw-bold">Bienvenido a TutoWeb</h1>
                                <p className="text-muted">Gestiona tus clases y reservas de forma sencilla</p>

                                <div className="mt-4">
                                    <div className="card mb-3 border-0 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">Encuentra tu tutor ideal</h5>
                                            <p className="card-text">Explora nuestro catálogo de tutores especializados en tu carrera.</p>
                                        </div>
                                    </div>

                                    <div className="card mb-3 border-0 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">Reserva clases fácilmente</h5>
                                            <p className="card-text">Programa tus tutorías según tu disponibilidad y necesidades.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Contenido para móviles - Solo se muestra en pantallas pequeñas */}
                <div className="d-lg-none mt-4">
                    <h1 className="fw-bold text-center">Bienvenido a TutoWeb</h1>
                    <p className="text-center text-muted">Gestiona tus clases y reservas de forma sencilla</p>

                    <div className="mt-4">
                        <div className="card mb-3 border-0 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Encuentra tu tutor ideal</h5>
                                <p className="card-text">Explora nuestro catálogo de tutores especializados en tu carrera.</p>
                            </div>
                        </div>

                        <div className="card mb-3 border-0 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Reserva clases fácilmente</h5>
                                <p className="card-text">Programa tus tutorías según tu disponibilidad y necesidades.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="home-bar-spacing"></div>
            </div>
        </>
    )
}

export default Home;