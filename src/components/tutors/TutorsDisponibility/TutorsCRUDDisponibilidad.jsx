import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import CustomSelect from '../../../components/CustomInputs/CustomSelect';
import '../../../commonTables.css';
import ApiService from '../../../services/ApiService';

const TutorsCRUDDisponibilidad = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estado para nueva disponibilidad
    const [newDisponibilidad, setNewDisponibilidad] = useState({
        dia_semana: "",
        hora_inicio: "",
        hora_fin: ""
    });

    // Opciones para días de la semana
    const diasSemana = [
        { id: 1, nombre: "Lunes" },
        { id: 2, nombre: "Martes" },
        { id: 3, nombre: "Miércoles" },
        { id: 4, nombre: "Jueves" },
        { id: 5, nombre: "Viernes" },
        { id: 6, nombre: "Sábado" },
        { id: 7, nombre: "Domingo" }
    ];

    const horas = Array.from({ length: 48 }, (_, i) => {
        const hora = Math.floor(i / 2);
        const minutos = i % 2 === 0 ? "00" : "30";
        return {
            id: `${hora.toString().padStart(2, "0")}:${minutos}`,
            nombre: `${hora.toString().padStart(2, "0")}:${minutos}`
        };
    });

    useEffect(() => {
        fetchDisponibilidades();
    }, []);

    const fetchDisponibilidades = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await ApiService.fetchApi(`/disponibilidades/tutor/${user.id}`);

            if (response && response.success) {
                setDisponibilidades(response.data);
            } else {
                throw new Error(response?.message || 'Error al obtener disponibilidades');
            }
        } catch (err) {
            setError(`Error al cargar datos: ${err.message}`);
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (name, value) => {
        setNewDisponibilidad({
            ...newDisponibilidad,
            [name]: value
        });
    };


    const calcularDiferenciaHoras = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return 0;

        const [horaI, minI] = horaInicio.split(':').map(Number);
        const [horaF, minF] = horaFin.split(':').map(Number);

        const minutosInicio = horaI * 60 + minI;
        const minutosFin = horaF * 60 + minF;

        return (minutosFin - minutosInicio) / 60;
    };

    const handleAddDisponibilidad = async () => {
        // Validar formulario
        if (!newDisponibilidad.dia_semana || !newDisponibilidad.hora_inicio || !newDisponibilidad.hora_fin) {
            setError("Debes completar todos los campos");
            return;
        }

        // Validar que hora_inicio < hora_fin
        if (newDisponibilidad.hora_inicio >= newDisponibilidad.hora_fin) {
            setError("La hora de inicio debe ser anterior a la hora de fin");
            return;
        }

        // Validar diferencia máxima de 2 horas
        const diferenciaHoras = calcularDiferenciaHoras(newDisponibilidad.hora_inicio, newDisponibilidad.hora_fin);
        if (diferenciaHoras > 2) {
            setError("La diferencia máxima entre hora de inicio y fin debe ser de 2 horas");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await ApiService.fetchApi('/disponibilidad/create', 'POST', {
                tutor_id: user.id,
                dia_semana: parseInt(newDisponibilidad.dia_semana),
                hora_inicio: newDisponibilidad.hora_inicio,
                hora_fin: newDisponibilidad.hora_fin
            });

            if (response.success) {
                setSuccess('Disponibilidad añadida correctamente');
                setNewDisponibilidad({
                    dia_semana: "",
                    hora_inicio: "",
                    hora_fin: ""
                });

                // Limpiar el mensaje de éxito después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);

                // Actualizar datos
                fetchDisponibilidades();
            } else {
                throw new Error(response.message || 'Error al añadir disponibilidad');
            }
        } catch (err) {
            setError(`Error al añadir disponibilidad: ${err.message}`);
            console.error("Error adding disponibilidad:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveDisponibilidad = async (id) => {
        if (!window.confirm('¿Está seguro que desea eliminar esta disponibilidad?')) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await ApiService.fetchApi(`/disponibilidad/${id}`, 'DELETE');

            if (response.success) {
                setSuccess('Disponibilidad eliminada correctamente');

                // Limpiar el mensaje de éxito después de 3 segundos
                setTimeout(() => setSuccess(null), 3000);

                // Actualizar datos
                fetchDisponibilidades();
            } else {
                throw new Error(response.message || 'Error al eliminar la disponibilidad');
            }
        } catch (err) {
            setError(`Error al eliminar disponibilidad: ${err.message}`);
            console.error("Error removing disponibilidad:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getDiaSemana = (diaNumero) => {
        return diasSemana.find(dia => dia.id === diaNumero)?.nombre || "Desconocido";
    };

    const formatHora = (hora) => {
        if (!hora) return "";
        return hora;
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Mi Disponibilidad</h1>
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={handleBack}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver
                        </button>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {/* Mensajes de error/éxito */}
                    {error && (
                        <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success shadow-sm rounded-3" role="alert">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            {success}
                        </div>
                    )}

                    {/* Sección para agregar disponibilidad */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-plus-circle me-2 text-success"></i>
                            Añadir Disponibilidad
                        </h2>

                        <div className="row g-3 mb-4">
                            <div className="col-12 col-md-4">
                                <label className="form-label">Día de la semana</label>
                                <CustomSelect
                                    value={newDisponibilidad.dia_semana}
                                    onChange={(e) => handleInputChange("dia_semana", e.target.value)}
                                    options={diasSemana}
                                    placeholder="Seleccione día"
                                    className="bg-white"
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label">Hora inicio</label>
                                <CustomSelect
                                    value={newDisponibilidad.hora_inicio}
                                    onChange={(e) => handleInputChange("hora_inicio", e.target.value)}
                                    options={horas}
                                    placeholder="Seleccione hora"
                                    className="bg-white"
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label">Hora fin</label>
                                <CustomSelect
                                    value={newDisponibilidad.hora_fin}
                                    onChange={(e) => handleInputChange("hora_fin", e.target.value)}
                                    options={horas}
                                    placeholder="Seleccione hora"
                                    className="bg-white"
                                />
                            </div>
                            <div className="col-12 col-md-2 d-flex align-items-end">
                                <button
                                    className="btn app-primary w-100"
                                    onClick={handleAddDisponibilidad}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="bi bi-plus-circle me-2"></i>
                                    )}
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sección de disponibilidades */}
                    <div className="mb-4">
                        <h2 className="fs-5 fw-bold mb-3">
                            <i className="bi bi-calendar-week me-2 text-primary"></i>
                            Mis Horarios Disponibles
                        </h2>

                        <div className="disponibilidades-container">
                            {isLoading && disponibilidades.length === 0 ? (
                                <div className="d-flex justify-content-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : disponibilidades.length > 0 ? (
                                <div className="row g-3">
                                    {disponibilidades.map((disponibilidad) => (
                                        <div key={disponibilidad.id} className="col-12 col-md-6 col-lg-4">
                                            <div className="materia-card">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h3 className="materia-title">
                                                            <i className="bi bi-calendar me-2"></i>
                                                            {getDiaSemana(disponibilidad.dia_semana)}
                                                        </h3>
                                                        <span className="materia-year-badge">
                                                            <i className="bi bi-clock me-1"></i>
                                                            {formatHora(disponibilidad.hora_inicio)} - {formatHora(disponibilidad.hora_fin)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="btn-remove-materia"
                                                        onClick={() => handleRemoveDisponibilidad(disponibilidad.id)}
                                                        title="Eliminar disponibilidad"
                                                    >
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="bi bi-calendar-x empty-state-icon"></i>
                                    <p>Aún no tienes horarios disponibles</p>
                                    <p className="text-muted">Añade tu disponibilidad utilizando el formulario superior</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="home-bar-spacing"></div>
                </div>
            </div>
        </div>
    );
};

export default TutorsCRUDDisponibilidad;