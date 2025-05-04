import React from 'react';
import TutoresCarrusel from "../tutors/TutoresCarrusel/TutoresCarrusel.jsx";

const Home = () => {
    return(
        <>
            {/* Contenedor principal con diseño responsivo */}
            <div className="container-fluid px-3 py-2">
                <div className="row">
                    {/* Columna del carrusel - En móvil ocupa todo el ancho, en PC solo la mitad izquierda */}
                    <div className="col-12 col-md-6 mb-4 mb-md-0">
                        <TutoresCarrusel />
                    </div>

                    {/* Contenido principal - En móvil va debajo del carrusel, en PC a la derecha */}
                    <div className="col-12 col-md-6">
                        <div className="py-md-4 ms-md-3">
                            <h1 className="fw-bold text-center text-md-start">Bienvenido a TutoWeb</h1>
                            <p className="text-center text-md-start text-muted">Gestiona tus clases y reservas de forma sencilla</p>

                            {/* Aquí puedes añadir más contenido que irá a la derecha en PC y debajo en móvil */}
                            <div className="mt-4">
                                {/* Ejemplo de tarjetas o contenido adicional */}
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

                {/* Espacio adicional para evitar que el contenido quede detrás del HomeBar en mobile */}
                <div className="pb-5 mb-4 d-md-none"></div>
            </div>
        </>
    )
}

export default Home;