import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TerminosCondiciones = () => {
    const { user } = useAuth();
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Secciones de términos y condiciones
    const terminos = [
        {
            id: 'aceptacion',
            titulo: '1. Aceptación de los Términos',
            contenido: `Al acceder y utilizar TutoWeb, usted acepta cumplir con estos términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestra plataforma.

            Estos términos constituyen un acuerdo legal entre usted y TutoWeb, y establecen las reglas y restricciones que rigen el uso de nuestros servicios.`
        },
        {
            id: 'descripcion',
            titulo: '2. Descripción del Servicio',
            contenido: `TutoWeb es una plataforma educativa que conecta estudiantes con tutores para facilitar el aprendizaje académico. Nuestros servicios incluyen:

            • Sistema de reservas de tutorías
            • Gestión de horarios y disponibilidad  
            • Sistema de calificaciones y evaluaciones
            • Plataforma de videollamadas integrada
            • Gestión de pagos y facturación
            • Notificaciones y recordatorios
            • Seguimiento del progreso académico`
        },
        {
            id: 'registro',
            titulo: '3. Registro y Cuentas de Usuario',
            contenido: `Para utilizar TutoWeb, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.

            Tipos de Usuario:
            • Estudiantes: Pueden buscar, reservar y calificar tutorías
            • Tutores: Pueden ofrecer servicios educativos y gestionar horarios, ademas tambien pueden buscar, reservar y calificar tutorias  
            • Administradores: Gestionan la plataforma y supervisan operaciones`
        },
        {
            id: 'responsabilidades',
            titulo: '4. Responsabilidades del Usuario',
            contenido: `Los usuarios se comprometen a:

            • Proporcionar información veraz y actualizada
            • Mantener un comportamiento respetuoso y profesional
            • No compartir credenciales de acceso
            • Cumplir con los horarios de tutorías programadas
            • Respetar los derechos de propiedad intelectual
            • No utilizar la plataforma para actividades ilegales
            • Reportar cualquier comportamiento inapropiado`
        },
        {
            id: 'propiedad',
            titulo: '5. Propiedad Intelectual',
            contenido: `TutoWeb y todo su contenido, incluyendo textos, gráficos, logos, iconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software, son propiedad de TutoWeb o de sus proveedores de contenido.

            Todos los materiales están protegidos por las leyes de derechos de autor nacionales e internacionales. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.`
        },
        {
            id: 'pagos',
            titulo: '6. Política de Pagos y Reembolsos',
            contenido: `Los pagos se procesan de forma segura a través de nuestros proveedores de servicios de pago certificados. 

            • Los precios se muestran en pesos argentinos (ARS)
            • Los pagos se procesan al momento de la reserva
            • Las políticas de reembolso se aplican según las circunstancias específicas
            • Cancelaciones con más de 24hs de anticipación: reembolso completo
            • Cancelaciones con menos de 24hs: sujeto a evaluación`
        },
        {
            id: 'limitacion',
            titulo: '7. Limitación de Responsabilidad',
            contenido: `TutoWeb actúa como intermediario entre estudiantes y tutores. No somos responsables por:

            • La calidad del contenido educativo proporcionado por los tutores
            • Disputas que puedan surgir entre usuarios
            • Interrupciones del servicio por motivos técnicos
            • Pérdida de datos debido a problemas técnicos externos
            • Resultados académicos de los estudiantes`
        },
        {
            id: 'modificaciones',
            titulo: '8. Modificaciones',
            contenido: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.

            El uso continuado del servicio constituye la aceptación de los términos modificados. Le recomendamos revisar periódicamente esta página.`
        }
    ];

    const politicaPrivacidad = [


        {
            id: 'uso-datos',
            titulo: 'Uso de los Datos',
            contenido: `Utilizamos sus datos personales exclusivamente para:

            • Facilitar la conexión entre estudiantes y tutores
            • Procesar pagos y facturación
            • Enviar notificaciones y recordatorios
            • Mejorar nuestros servicios
            • Cumplir con obligaciones legales
            • Proporcionar soporte técnico`
        },
        {
            id: 'derechos',
            titulo: 'Sus Derechos',
            contenido: `Como usuario, usted tiene derecho a:

            • ACCESO: Conocer qué datos tenemos sobre usted
            • RECTIFICACIÓN: Corregir datos inexactos o incompletos
            • SUPRESIÓN: Solicitar la eliminación de sus datos
            • PORTABILIDAD: Obtener una copia de sus datos
            • OPOSICIÓN: Oponerse al tratamiento de sus datos
            • LIMITACIÓN: Restringir el procesamiento de sus datos`
        },
        {
            id: 'eliminacion',
            titulo: 'Eliminación de Datos',
            contenido: `Si desea eliminar permanentemente sus datos personales de nuestra plataforma, puede solicitarlo contactando a privacidad@tutoweb.com

            Procesaremos su solicitud en un plazo máximo de 30 días hábiles. Tenga en cuenta que algunos datos pueden conservarse por obligaciones legales.`
        },
    ];

    const cookies = [
        {
            id: 'que-son',
            titulo: '¿Qué son las Cookies?',
            contenido: `Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestra plataforma. Nos ayudan a mejorar su experiencia de usuario y a proporcionar servicios personalizados.`
        },
        {
            id: 'tipos-cookies',
            titulo: 'Tipos de Cookies que Utilizamos',
            contenido: `
            • COOKIES DE AUTENTICACIÓN: Para mantener su sesión activa`
        },
        {
            id: 'control',
            titulo: 'Control de Cookies',
            contenido: `Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su dispositivo y configurar la mayoría de los navegadores para evitar que se instalen.

            Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio.`
        }
    ];

    const renderSection = (items, sectionType) => (
        <div className="mb-4">
            {items.map((item, index) => (
                <div key={item.id} className="mb-3">
                    <div
                        className="d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer border"
                        onClick={() => toggleSection(`${sectionType}-${item.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h6 className="mb-0 fw-bold text-dark">
                            <i className="bi bi-chevron-right me-2 text-primary"></i>
                            {item.titulo}
                        </h6>
                        <i className={`bi ${expandedSection === `${sectionType}-${item.id}` ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}></i>
                    </div>
                    {expandedSection === `${sectionType}-${item.id}` && (
                        <div className="p-3 border border-top-0 rounded-bottom bg-white">
                            <div className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                {item.contenido}
                            </div>
                        </div>
                    )}
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
                            <i className="bi bi-shield-check me-2 text-primary"></i>
                            Términos y Condiciones
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
                        <strong>Información Legal de TutoWeb</strong>
                        <div className="mt-1">
                            Esta página contiene los términos y condiciones que rigen el uso de nuestra plataforma educativa.
                        </div>
                    </div>

                    {/* Navegación con pestañas */}
                    <ul className="nav nav-pills mb-4 justify-content-center" role="tablist">
                        <li className="nav-item me-2" role="presentation">
                            <button
                                className="nav-link active"
                                id="terminos-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#terminos"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-file-text me-1"></i>
                                Términos y Condiciones
                            </button>
                        </li>
                        <li className="nav-item me-2" role="presentation">
                            <button
                                className="nav-link"
                                id="privacidad-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#privacidad"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-shield-lock me-1"></i>
                                Protección de Datos
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link"
                                id="cookies-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#cookies"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-cookie me-1"></i>
                                Política de Cookies
                            </button>
                        </li>
                    </ul>

                    {/* Contenido de las pestañas */}
                    <div className="tab-content">
                        {/* Pestaña de Términos y Condiciones */}
                        <div className="tab-pane fade show active" id="terminos" role="tabpanel">
                            <div className="alert alert-primary mb-4 rounded-3">
                                <i className="bi bi-calendar-event me-2"></i>
                                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
                            </div>
                            {renderSection(terminos, 'terminos')}
                        </div>

                        {/* Pestaña de Protección de Datos */}
                        <div className="tab-pane fade" id="privacidad" role="tabpanel">
                            {renderSection(politicaPrivacidad, 'privacidad')}

                        </div>

                        {/* Pestaña de Cookies */}
                        <div className="tab-pane fade" id="cookies" role="tabpanel">
                            <div className="alert alert-success mb-4 rounded-3">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <strong>Política de Cookies Transparente:</strong> Le informamos claramente sobre el uso de cookies en TutoWeb.
                            </div>
                            {renderSection(cookies, 'cookies')}
                        </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="card bg-light border-0 rounded-3 mt-5">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-primary mb-3">
                                <i className="bi bi-envelope me-2"></i>
                                ¿Tienes dudas sobre estos términos?
                            </h6>
                            <p className="mb-0 small">
                                Si tienes preguntas sobre nuestros términos y condiciones o políticas de privacidad,
                                puedes contactarnos en: <strong>legal@tutoweb.com</strong> o <strong>privacidad@tutoweb.com</strong>
                            </p>
                            <p className="mb-0 small mt-2">
                                <strong>Córdoba, Argentina</strong>
                            </p>
                        </div>
                    </div>

                    {/* Espacio adicional para evitar que el HomeBar tape contenido */}
                    <div style={{ height: '100px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default TerminosCondiciones;