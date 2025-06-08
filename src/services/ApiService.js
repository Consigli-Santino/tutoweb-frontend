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
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error en la solicitud");

            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error en llamada a API (${endpoint}):`, error);
            throw error;
        }
    }

    static async getUsuarios() {
        return ApiService.fetchApi('/usuarios/all');
    }

    static getCalificacionesByDateRangeWithParams(queryString = '') {
        let endpoint = '/calificaciones/date-range';
        if (queryString) {
            endpoint += `?${queryString}`;
        }
        return ApiService.fetchApi(endpoint);
    }

    static getCalificacionesByDateRange(fechaDesde = null, fechaHasta = null, usuarioId = null) {
        let endpoint = '/calificaciones/date-range';
        const params = new URLSearchParams();

        if (fechaDesde) {
            params.append('fecha_desde', fechaDesde);
        }
        if (fechaHasta) {
            params.append('fecha_hasta', fechaHasta);
        }
        if (usuarioId) {
            params.append('usuario_id', usuarioId);
        }

        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }

        return ApiService.fetchApi(endpoint);
    }
    static async getNextReservaTime() {
        return ApiService.fetchApi('/next/reserva/time');
    }

    static getCalificacionesUltimosDias(dias = 60, usuarioId = null) {
        const fechaHasta = new Date().toISOString().split('T')[0];
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - dias);
        const fechaDesdeStr = fechaDesde.toISOString().split('T')[0];

        return ApiService.getCalificacionesByDateRange(fechaDesdeStr, fechaHasta, usuarioId);
    }

    static getCalificacionesByUsuario(usuarioId, fechaDesde = null, fechaHasta = null) {
        return ApiService.getCalificacionesByDateRange(fechaDesde, fechaHasta, usuarioId);
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

    static getAllReservas(fechaDesde = null, fechaHasta = null) {
        let endpoint = '/reservas/admin/all';
        if (fechaDesde && fechaHasta) {
            endpoint += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
        }
        return ApiService.fetchApi(endpoint);
    }

    static getCalificacionesByEstudiante() {
        return ApiService.fetchApi('/calificaciones/estudiante');
    }

    static async getReservasActions(reservaIds) {
        const body = { reserva_ids: reservaIds };
        return ApiService.fetchApi('/reservas/actions', 'POST', body);
    }

    static async recordVideoCallAction(reservaId) {
        return ApiService.fetchApi(`/reservas/estudiante/actions?id_reserva=${reservaId}`, 'POST');
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

    static createPago(pagoData) {
        return ApiService.fetchApi('/pago/create', 'POST', pagoData);
    }

    static updatePagoEstado(pagoId, estado) {
        return ApiService.fetchApi(`/pago/${pagoId}/estado/${estado}`, 'PUT');
    }

    static fetchReservasDetalladasByEstudiante(fechaDesde = null, fechaHasta = null) {
        let endpoint = '/reservas/estudiante/detalladas';
        if (fechaDesde && fechaHasta) {
            endpoint += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
        }

        return ApiService.fetchApi(endpoint);
    }

    static getReservasByTutor() {
        return ApiService.fetchApi('/reservas/tutor');
    }

    static fetchReservasDetalladasByTutor(fechaDesde = null, fechaHasta = null) {
        let endpoint = '/reservas/tutor/detalladas';
        if (fechaDesde && fechaHasta) {
            endpoint += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
        }

        return ApiService.fetchApi(endpoint);
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

    static fetchNotificaciones(soloNoLeidas = false) {
        return ApiService.fetchApi(`/notificaciones?solo_no_leidas=${soloNoLeidas}`);
    }

    static marcarNotificacionComoLeida(id) {
        return ApiService.fetchApi(`/notificaciones/${id}/leer`, 'PUT');
    }

    static marcarTodasLasNotificacionesComoLeidas() {
        return ApiService.fetchApi('/notificaciones/leer-todas', 'PUT');
    }

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
        return ApiService.fetchApi('/calificaciones/estudiante/reserva');
    }

    static async fetchPagosByReservas(idsReservas) {
        return ApiService.fetchApi('/pagos/reservas', 'POST', { reserva_ids: idsReservas });
    }

    static createCarrera(carrera) {
        return ApiService.fetchApi('/carrera/create', 'POST', carrera);
    }

    static getCarrera(id) {
        return ApiService.fetchApi(`/carrera/${id}`);
    }

    static updateCarrera(id, carrera) {
        return ApiService.fetchApi(`/carrera/${id}`, 'PUT', carrera);
    }

    static deleteCarrera(id) {
        return ApiService.fetchApi(`/carrera/${id}`, 'DELETE');
    }

    static createMateria(materia) {
        return ApiService.fetchApi('/materia/create', 'POST', materia);
    }

    static getMateria(id) {
        return ApiService.fetchApi(`/materia/${id}`);
    }

    static updateMateria(id, materia) {
        return ApiService.fetchApi(`/materia/${id}`, 'PUT', materia);
    }

    static deleteMateria(id) {
        return ApiService.fetchApi(`/materia/${id}`, 'DELETE');
    }

    // === NOTIFICACIONES ===

    static async getNotificacionesByUser(soloNoLeidas = false) {
        const params = soloNoLeidas ? '?solo_no_leidas=true' : '';
        return ApiService.fetchApi(`/notificaciones${params}`);
    }

    static async getAllNotificaciones(fechaDesde = null, fechaHasta = null) {
        let endpoint = '/notificaciones/all';
        const params = new URLSearchParams();

        if (fechaDesde) params.append('fecha_desde', fechaDesde);
        if (fechaHasta) params.append('fecha_hasta', fechaHasta);

        const queryString = params.toString();
        if (queryString) {
            endpoint += `?${queryString}`;
        }

        return ApiService.fetchApi(endpoint);
    }

    static async getNotificacionesByTipo(tipo) {
        return ApiService.fetchApi(`/notificaciones/tipo/${tipo}`);
    }

    static async getEstadisticasNotificaciones(fechaDesde = null, fechaHasta = null) {
        let endpoint = '/notificaciones/estadisticas';
        const params = new URLSearchParams();

        if (fechaDesde) params.append('fecha_desde', fechaDesde);
        if (fechaHasta) params.append('fecha_hasta', fechaHasta);

        const queryString = params.toString();
        if (queryString) {
            endpoint += `?${queryString}`;
        }

        return ApiService.fetchApi(endpoint);
    }

    static async createNotificacion(notificacionData) {
        return ApiService.fetchApi('/notificaciones/create', 'POST', notificacionData);
    }

    static async markNotificacionAsRead(notificacionId) {
        return ApiService.fetchApi(`/notificaciones/${notificacionId}/leer`, 'PUT');
    }

    static async markAllNotificacionesAsRead() {
        return ApiService.fetchApi('/notificaciones/leer-todas', 'PUT');
    }

    static async deleteNotificacion(notificacionId) {
        return ApiService.fetchApi(`/notificaciones/${notificacionId}`, 'DELETE');
    }
}

export default ApiService;