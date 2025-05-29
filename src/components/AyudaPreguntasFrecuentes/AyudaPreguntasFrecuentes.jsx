import React, { useState } from 'react';

const AyudaPreguntasFrecuentes = () => {
    const [activeSection, setActiveSection] = useState('general');
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    // Simulamos el usuario para mostrar las secciones apropiadas
    const user = {
        roles: ['estudiante', 'alumno&tutor'] // Puedes cambiar esto para probar diferentes roles
    };

    // Determinar si el usuario es tutor o estudiante
    const isTutor = user && (user.roles.includes('tutor') || user.roles.includes('alumno&tutor'));
    const isStudent = user && (user.roles.includes('estudiante') || user.roles.includes('alumno') || user.roles.includes('alumno&tutor'));

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    // Preguntas frecuentes generales
    const preguntasGenerales = [
        {
            pregunta: "¿Cómo funciona TutoWeb?",
            respuesta: "TutoWeb es una plataforma que conecta estudiantes con tutores. Los estudiantes pueden buscar tutores por materia, reservar sesiones de tutoría y realizar pagos seguros. Los tutores pueden ofrecer sus servicios, gestionar su disponibilidad y recibir calificaciones."
        },
        {
            pregunta: "¿Qué tipos de tutoría están disponibles?",
            respuesta: "Ofrecemos tutorías virtuales (videollamadas)."
        },
        {
            pregunta: "¿Cómo se realizan los pagos?",
            respuesta: "Los pagos se procesan después de completar la tutoría. Aceptamos pagos con Mercado Pago."
        },
        {
            pregunta: "¿Puedo cancelar una reserva?",
            respuesta: "Sí, puedes cancelar una reserva hasta 2 horas antes del horario programado. Las cancelaciones fuera de este tiempo no están permitidas."
        },
        {
            pregunta: "¿Cómo funcionan las calificaciones?",
            respuesta: "Después de cada tutoría completada y pagada, los estudiantes pueden calificar a los tutores del 1 al 5 estrellas y dejar comentarios. Esto ayuda a otros estudiantes a elegir tutores."
        }
    ];

    // Preguntas específicas para estudiantes
    const preguntasEstudiantes = [
        {
            pregunta: "¿Cómo busco un tutor?",
            respuesta: "En la página principal verás tutores destacados de tu carrera. También puedes usar los filtros para buscar por materia específica o nombre del tutor."
        },
        {
            pregunta: "¿Cómo reservo una tutoría?",
            respuesta: "1. Selecciona un tutor y haz clic en 'Ver Disponibilidad'\n2. Elige la materia/servicio que necesitas\n3. Selecciona una fecha disponible\n4. Elige un horario disponible\n5. Confirma tu reserva"
        },
        {
            pregunta: "¿Cuándo debo pagar?",
            respuesta: "El pago se realiza después de que la tutoría esté marcada como 'Completada' por el tutor. Recibirás una notificación cuando puedas proceder con el pago."
        },
        {
            pregunta: "¿Cómo accedo a las tutorías virtuales?",
            respuesta: "Para tutorías virtuales, encontrarás un botón 'Iniciar Videollamada' en la reserva confirmada. Este botón estará disponible 15 minutos antes y después del horario programado."
        },
        {
            pregunta: "¿Qué pasa si el tutor no se presenta?",
            respuesta: "Si el tutor no se presenta, puedes cancelar la reserva y no se te cobrará. También puedes contactar al tutor a través de la plataforma."
        }
    ];

    // Preguntas específicas para tutores
    const preguntasTutores = [
        {
            pregunta: "¿Cómo configuro mis materias?",
            respuesta: "Ve a 'Mis Materias' en el menú. Ahí puedes seleccionar las materias que quieres tutorizar de tu carrera."
        },
        {
            pregunta: "¿Cómo establezco mi disponibilidad?",
            respuesta: "En 'Mi Disponibilidad' puedes agregar tus horarios disponibles por día de la semana. Los estudiantes solo verán estos horarios al hacer reservas."
        },
        {
            pregunta: "¿Cómo creo mis servicios de tutoría?",
            respuesta: "En 'Mis Servicios' puedes crear servicios para cada materia, estableciendo precio, modalidad (virtual) y descripción."
        },
        {
            pregunta: "¿Cómo gestiono las reservas?",
            respuesta: "En 'Gestión de Tutorías' puedes:\n- Ver reservas pendientes y confirmarlas\n- Marcar tutorías como completadas"
        },
        {
            pregunta: "¿Cuándo recibo el pago?",
            respuesta: "Los pagos con Mercado Pago se procesan automáticamente."
        }
    ];

    // Guía paso a paso para estudiantes
    const guiaEstudiantes = [
        {
            titulo: "1. Buscar un Tutor",
            descripcion: "Explora los tutores destacados en la página principal o usa los filtros para encontrar tutores por materia.",
            icono: "bi-search"
        },
        {
            titulo: "2. Ver Perfil del Tutor",
            descripcion: "Revisa la información del tutor, sus calificaciones, materias que ofrece y modalidades disponibles.",
            icono: "bi-person-circle"
        },
        {
            titulo: "3. Seleccionar Servicio",
            descripcion: "Elige la materia específica que necesitas y revisa el precio por hora.",
            icono: "bi-journal-check"
        },
        {
            titulo: "4. Elegir Fecha y Hora",
            descripcion: "Selecciona una fecha disponible y luego elige un horario que se ajuste a tu agenda.",
            icono: "bi-calendar-check"
        },
        {
            titulo: "5. Confirmar Reserva",
            descripcion: "Una vez confirmada, espera a que el tutor confirme tu reserva. Recibirás notificaciones del estado.",
            icono: "bi-check-circle"
        },
        {
            titulo: "6. Asistir a la Tutoría",
            descripcion: "Para realizar las tutorías virtuales, usa el botón de videollamada.",
            icono: "bi-camera-video"
        },
        {
            titulo: "7. Pagar y Calificar",
            descripcion: "Después de la tutoría, procede con el pago y califica la experiencia para ayudar a otros estudiantes.",
            icono: "bi-star"
        }
    ];

    // Guía paso a paso para tutores
    const guiaTutores = [
        {
            titulo: "1. Configurar Materias",
            descripcion: "Ve a 'Mis Materias' y selecciona las materias de tu carrera que quieres tutorizar.",
            icono: "bi-journal-plus"
        },
        {
            titulo: "2. Establecer Disponibilidad",
            descripcion: "En 'Mi Disponibilidad', agrega tus horarios disponibles por día de la semana.",
            icono: "bi-calendar-week"
        },
        {
            titulo: "3. Crear Servicios",
            descripcion: "En 'Mis Servicios', crea servicios para cada materia estableciendo precio y modalidad.",
            icono: "bi-mortarboard"
        },
        {
            titulo: "4. Gestionar Reservas",
            descripcion: "Revisa y confirma las reservas pendientes en 'Gestión de Tutorías'.",
            icono: "bi-calendar-check"
        },
        {
            titulo: "5. Realizar Tutorías",
            descripcion: "Imparte las tutorías según la modalidad acordada (virtual).",
            icono: "bi-camera-video"
        },
        {
            titulo: "6. Completar y Cobrar",
            descripcion: "Marca las tutorías como completadas y confirma los pagos con mercado pago.",
            icono: "bi-cash-coin"
        }
    ];

    const renderFAQ = (faqs) => (
        <div className="accordion">
            {faqs.map((faq, index) => (
                <div key={index} className="card mb-2 border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0 p-0">
                        <button
                            className="btn btn-link text-start text-decoration-none p-3 w-100 text-dark fw-bold"
                            onClick={() => toggleFAQ(index)}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <span>{faq.pregunta}</span>
                                <i className={`bi ${expandedFAQ === index ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </div>
                        </button>
                    </div>
                    {expandedFAQ === index && (
                        <div className="card-body pt-0">
                            <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-line' }}>
                                {faq.respuesta}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderGuiaSteps = (steps) => (
        <div className="row g-3">
            {steps.map((step, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-start">
                                <div className="me-3">
                                    <div className="p-3 rounded text-white" style={{ backgroundColor: '#283048' }}>
                                        <i className={`bi ${step.icono} fs-4`}></i>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="card-title fw-bold text-dark">{step.titulo}</h5>
                                    <p className="card-text text-muted small">{step.descripcion}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">
                            <i className="bi bi-question-circle me-2 text-primary"></i>
                            Centro de Ayuda
                        </h1>
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={() => window.history.back()}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver
                        </button>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {/* Mensaje de bienvenida */}
                    <div className="alert alert-info mb-4 rounded-3">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <strong>¡Bienvenido al Centro de Ayuda!</strong>
                        <div className="mt-1">
                            Aquí encontrarás guías paso a paso y respuestas a las preguntas más frecuentes sobre TutoWeb.
                        </div>
                    </div>

                    {/* Navegación por secciones */}
                    <div className="mb-4">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeSection === 'general' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('general')}
                                >
                                    <i className="bi bi-info-circle me-2"></i>
                                    Información General
                                </button>
                            </li>
                            {isStudent && (
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeSection === 'estudiante' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('estudiante')}
                                    >
                                        <i className="bi bi-person me-2"></i>
                                        Para Estudiantes
                                    </button>
                                </li>
                            )}
                            {isTutor && (
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeSection === 'tutor' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('tutor')}
                                    >
                                        <i className="bi bi-mortarboard me-2"></i>
                                        Para Tutores
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contenido según la sección activa */}
                    {activeSection === 'general' && (
                        <div>
                            <h2 className="fs-5 fw-bold mb-3">
                                <i className="bi bi-question-circle me-2 text-primary"></i>
                                Preguntas Frecuentes Generales
                            </h2>
                            {renderFAQ(preguntasGenerales)}

                            <div className="mt-5">
                                <h2 className="fs-5 fw-bold mb-3">
                                    <i className="bi bi-telephone me-2 text-success"></i>
                                    ¿Necesitas más ayuda?
                                </h2>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <div className="card shadow-sm border-0 rounded-4">
                                            <div className="card-body p-3">
                                                <h5 className="card-title fw-bold">
                                                    <i className="bi bi-envelope me-2"></i>
                                                    Contacto por Email
                                                </h5>
                                                <p className="card-text text-muted small">
                                                    Si tienes problemas técnicos o preguntas específicas, escríbenos a:
                                                </p>
                                                <strong className="text-primary">soporte@tutoweb.com</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="card shadow-sm border-0 rounded-4">
                                            <div className="card-body p-3">
                                                <h5 className="card-title fw-bold">
                                                    <i className="bi bi-clock me-2"></i>
                                                    Horario de Atención
                                                </h5>
                                                <p className="card-text text-muted small">
                                                    Nuestro equipo de soporte está disponible:
                                                </p>
                                                <strong className="text-primary">Lunes a Viernes, 9:00 - 18:00 hs</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'estudiante' && isStudent && (
                        <div>
                            <h2 className="fs-5 fw-bold mb-3">
                                <i className="bi bi-map me-2 text-primary"></i>
                                Guía Paso a Paso para Estudiantes
                            </h2>
                            <p className="text-muted mb-4">
                                Sigue estos pasos para reservar y disfrutar de tus tutorías en TutoWeb.
                            </p>
                            {renderGuiaSteps(guiaEstudiantes)}

                            <div className="mt-5">
                                <h2 className="fs-5 fw-bold mb-3">
                                    <i className="bi bi-question-circle me-2 text-primary"></i>
                                    Preguntas Frecuentes para Estudiantes
                                </h2>
                                {renderFAQ(preguntasEstudiantes)}
                            </div>
                        </div>
                    )}

                    {activeSection === 'tutor' && isTutor && (
                        <div>
                            <h2 className="fs-5 fw-bold mb-3">
                                <i className="bi bi-map me-2 text-primary"></i>
                                Guía Paso a Paso para Tutores
                            </h2>
                            <p className="text-muted mb-4">
                                Configura tu perfil de tutor y comienza a ofrecer tus servicios siguiendo estos pasos.
                            </p>
                            {renderGuiaSteps(guiaTutores)}

                            <div className="mt-5">
                                <h2 className="fs-5 fw-bold mb-3">
                                    <i className="bi bi-question-circle me-2 text-primary"></i>
                                    Preguntas Frecuentes para Tutores
                                </h2>
                                {renderFAQ(preguntasTutores)}
                            </div>
                        </div>
                    )}

                    {/* Consejos adicionales */}
                    <div className="mt-5">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-lightbulb me-2 text-warning"></i>
                            Consejos Útiles
                        </h2>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <div className="alert alert-light border rounded-3">
                                    <h6 className="fw-bold">
                                        <i className="bi bi-bell me-2 text-primary"></i>
                                        Notificaciones
                                    </h6>
                                    <p className="mb-0 small">
                                        Mantén las notificaciones activadas para recibir actualizaciones sobre tus reservas.
                                    </p>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="alert alert-light border rounded-3">
                                    <h6 className="fw-bold">
                                        <i className="bi bi-wifi me-2 text-success"></i>
                                        Conexión Estable
                                    </h6>
                                    <p className="mb-0 small">
                                        Para tutorías virtuales, asegúrate de tener una conexión a internet estable.
                                    </p>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="alert alert-light border rounded-3">
                                    <h6 className="fw-bold">
                                        <i className="bi bi-star me-2 text-warning"></i>
                                        Calificaciones
                                    </h6>
                                    <p className="mb-0 small">
                                        Las calificaciones honestas ayudan a mejorar la calidad de las tutorías.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nota final */}
                    <div className="alert alert-success mt-5 rounded-3">
                        <h6 className="fw-bold">
                            <i className="bi bi-heart-fill me-2"></i>
                            ¡Gracias por usar TutoWeb!
                        </h6>
                        <p className="mb-0 small">
                            Estamos comprometidos en brindarte la mejor experiencia de aprendizaje.
                            Si tienes sugerencias o comentarios, no dudes en contactarnos.
                        </p>
                    </div>

                    {/* Espacio adicional para evitar que el HomeBar tape contenido */}
                    <div style={{ height: '100px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default AyudaPreguntasFrecuentes;