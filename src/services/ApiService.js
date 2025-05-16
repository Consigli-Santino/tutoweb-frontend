const API_URL = (import.meta.env.VITE_BACKEND_URL);

class ApiService {
    static async fetchApi(endpoint, method = 'GET', body = null,) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const headers = {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            };

            if (body && method !== 'GET') {
                headers['Content-Type'] = 'application/json';
            }

            const config = {
                method,
                headers
            };

            if (body && method !== 'GET') {
                config.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_URL}${endpoint}`, config);

            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error en llamada a API (${endpoint}):`, error);
            throw error;
        }
    }

    // Métodos existentes
    static async getUsuarios() {
        return ApiService.fetchApi('/usuarios/all');
    }

    static async getMateriasByTutor(usuario_id, carrera_id) {
        return ApiService.fetchApi(`/materias-carrera-usuario/usuario/${usuario_id}/carrera/${carrera_id}`);
    }

    static async getCarreras() {
        return ApiService.fetchApi('/carreras/all');
    }
    static getAllUsuarios() {
        return ApiService.fetchApi('/usuarios/all');
    }
    static getTutores() {
        return ApiService.fetchApi('/usuarios/tutores');
    }
    static getAllMaterias() {
        return ApiService.fetchApi('/materias/all');
    }
    static getAllReservas() {
        return ApiService.fetchApi('/reservas/admin/all');
    }
    static getCalificacionesByEstudiante() {
        return ApiService.fetchApi('/calificaciones/estudiante');
    }

    static async getRoles() {
        return ApiService.fetchApi('/roles/all');
    }

    static async getProfileImage() {
        return ApiService.fetchApi('/usuario/profile-image');
    }

    static getDisponibilidadesDisponibles(tutorId, fecha) {
        return ApiService.fetchApi(`/disponibilidades/disponibles/${tutorId}/${fecha}`);
    }

    static async getMaterias() {
        return ApiService.fetchApi('/materias/all');
    }

    static async deleteUsuario(id) {
        return ApiService.fetchApi(`/usuario/${id}`, 'DELETE');
    }

    static getTutoresByCarrera(id) {
        return ApiService.fetchApi(`/tutores/by/carrera/${id}`);
    }

    static getMateriasByCarrera(id) {
        return ApiService.fetchApi(`/materias/carrera/${id}`);
    }

    static getTutoresByCarreraWithMaterias(id) {
        return ApiService.fetchApi(`/tutores/by/carrera/${id}/with-materias`);
    }

    static getServiciosByTutor(tutor_id) {
        return ApiService.fetchApi(`/servicios/tutor/${tutor_id}`);
    }

    static getServiciosByMateria(materia_id) {
        return ApiService.fetchApi(`/servicios/materia/${materia_id}`);
    }

    static getServicio(id) {
        return ApiService.fetchApi(`/servicio/${id}`);
    }

    static createServicio(servicio) {
        return ApiService.fetchApi('/servicio/create', 'POST', servicio);
    }

    static updateServicio(id, servicio) {
        return ApiService.fetchApi(`/servicio/${id}`, 'PUT', servicio);
    }

    static checkReservas(tutorId, fecha) {
        return ApiService.fetchApi(`/reservas/check?tutor_id=${tutorId}&fecha=${fecha}`);
    }

    static getTutorByEmail(email) {
        return ApiService.fetchApi(`/usuario/by-email/${email}`);
    }

    static deleteServicio(id) {
        return ApiService.fetchApi(`/servicio/${id}`, 'DELETE');
    }

    // Nuevos métodos para gestión de reservas
    static createReserva(reserva) {
        return ApiService.fetchApi('/reserva/create', 'POST', reserva);
    }

    static getReserva(id) {
        return ApiService.fetchApi(`/reserva/${id}`);
    }

    static getReservaDetallada(id) {
        return ApiService.fetchApi(`/reserva/${id}/detallada`);
    }

    static getReservasByEstudiante() {
        return ApiService.fetchApi('/reservas/estudiante');
    }
    static fetchPagoByReserva(reservaId) {
        return ApiService.fetchApi(`/pago/reserva/${reservaId}`);
    }

// Crear un pago
    static createPago(pagoData) {
        return ApiService.fetchApi('/pago/create', 'POST', pagoData);
    }

// Actualizar el estado de un pago
    static updatePagoEstado(pagoId, estado) {
        return ApiService.fetchApi(`/pago/${pagoId}/estado/${estado}`, 'PUT');
    }

    static fetchReservasDetalladasByEstudiante() {
        return ApiService.fetchApi('/reservas/estudiante/detalladas');
    }

    static getReservasByTutor() {
        return ApiService.fetchApi('/reservas/tutor');
    }

    static fetchReservasDetalladasByTutor() {
        return ApiService.fetchApi('/reservas/tutor/detalladas');
    }

    static updateReserva(id, data) {
        return ApiService.fetchApi(`/reserva/${id}`, 'PUT', data);
    }

    static deleteReserva(id) {
        return ApiService.fetchApi(`/reserva/${id}`, 'DELETE');
    }

    static getHorariosDisponibles(servicioId, fecha) {
        return ApiService.fetchApi(`/horarios-disponibles/${servicioId}?fecha=${fecha}`);
    }

    // Métodos para notificaciones
    static fetchNotificaciones(soloNoLeidas = false) {
        return ApiService.fetchApi(`/notificaciones?solo_no_leidas=${soloNoLeidas}`);
    }

    static marcarNotificacionComoLeida(id) {
        return ApiService.fetchApi(`/notificaciones/${id}/leer`, 'PUT');
    }

    static marcarTodasLasNotificacionesComoLeidas() {
        return ApiService.fetchApi('/notificaciones/leer-todas', 'PUT');
    }

    // Métodos para disponibilidad de tutores
    static crearDisponibilidad(disponibilidad) {
        return ApiService.fetchApi('/disponibilidad/create', 'POST', disponibilidad);
    }

    static getDisponibilidadesByTutor(tutorId) {
        return ApiService.fetchApi(`/disponibilidades/tutor/${tutorId}`);
    }

    static editarDisponibilidad(id, disponibilidad) {
        return ApiService.fetchApi(`/disponibilidad/${id}`, 'PUT', disponibilidad);
    }

    static eliminarDisponibilidad(id) {
        return ApiService.fetchApi(`/disponibilidad/${id}`, 'DELETE');
    }
    static getCalificacionByReserva(reservaId) {
        return ApiService.fetchApi(`/calificacion/reserva/${reservaId}`);
    }

    static createCalificacion(calificacionData) {
        return ApiService.fetchApi('/calificacion/create', 'POST', calificacionData);
    }

    static getCalificacionesByTutor(tutorId) {
        return ApiService.fetchApi(`/calificaciones/tutor/${tutorId}`);
    }

    static fetchPagosByTutor() {
        return ApiService.fetchApi('/pagos/tutor');
    }

    static fetchPagosByEstudiante() {
        return ApiService.fetchApi('/pagos/estudiante');
    }

    static getCalificacionesForEstudianteReservas() {
        return ApiService.fetchApi('/calificaciones/estudiante/reservas');
    }
}

export default ApiService;