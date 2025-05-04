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
                'Authorization': `Bearer ${token}`
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

    static async getUsuarios() {
        return ApiService.fetchApi('/usuarios/all');
    }
    static async getMateriasByTutor(usuario_id,carrera_id) {
        return ApiService.fetchApi(`/materias-carrera-usuario/usuario/${usuario_id}/carrera/${carrera_id}`);
    }

    static async getCarreras() {
        return ApiService.fetchApi('/carreras/all');
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
}

export default ApiService;