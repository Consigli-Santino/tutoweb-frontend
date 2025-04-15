import React from 'react';
import TutoresCarrusel from "../TutoresCarrusel/TutoresCarrusel.jsx";

const Home = () => {
    return(
        <>
            {/* Carrusel de Tutores (compacto) */}
            <div className="container-fluid px-3 py-2">
                <TutoresCarrusel />
            </div>

            {/* Contenido Principal */}
            <div className="container-fluid py-3 flex-grow-1">
                <div className="row">
                    <div className="col-12">
                        <h1 className="fw-bold text-center">Bienvenido a TutoWeb</h1>
                        <p className="text-center text-muted">Gestiona tus clases y reservas de forma sencilla</p>
                    </div>
                </div>

                {/* Espacio adicional para evitar que el contenido quede detrás del HomeBar en mobile */}
                <div className="pb-5 mb-4"></div>
            </div>
        </>
    )
}

export default Home;