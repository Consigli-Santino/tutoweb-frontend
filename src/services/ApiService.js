// ApiService.js
const API_URL = 'http://localhost:7000';
//TODO : Cambiar a la URL de PARA USAR ENVS
/**
 * Clase para centralizar las llamadas a la API
 */
class ApiService {
    /**
     * Método genérico para realizar peticiones a la API
     * @param {string} endpoint - La ruta del endpoint
     * @param {string} method - El método HTTP (GET, POST, PUT, DELETE)
     * @param {Object} body - El cuerpo de la petición (opcional)
     * @returns {Promise<any>} - La respuesta de la API
     */
    static async fetchApi(endpoint, method = 'GET', body = null) {
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

    static async getCarreras() {
        return ApiService.fetchApi('/carreras/all');
    }

    static async getRoles() {
        return ApiService.fetchApi('/roles/all');
    }

    static async getMaterias() {
        return ApiService.fetchApi('/materias/all');
    }

    static async deleteUsuario(id) {
        return ApiService.fetchApi(`/usuario/${id}`, 'DELETE');
    }
}

export default ApiService;