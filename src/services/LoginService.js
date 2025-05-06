class LoginService {
    async login(email, password) {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Login response:", data);
                return {
                    success: true,
                    data: data
                };
            } else {
                let errorMessage = '';
                if (response.status === 401) {
                    errorMessage = 'Usuario o contraseña incorrectos';
                } else if (response.status === 422) {
                    errorMessage = 'Datos de entrada inválidos';
                } else if (response.status === 500) {
                    errorMessage = 'Error en el servidor. Intente más tarde';
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || `Error de autenticación: ${response.status}`;
                    } catch (e) {
                        errorMessage = `Error de autenticación: ${response.status}`;
                    }
                }

                return {
                    success: false,
                    error: errorMessage
                };
            }
        } catch (error) {
            console.error("Error durante el login:", error);
            if (error.message && (
                error.message.includes('SSL') ||
                error.message.includes('certificate')
            )) {
                return {
                    success: false,
                    error: 'Error de conexión segura con el servidor. Verifique la URL o contacte al administrador.'
                };
            } else if (error.name === 'TypeError') {
                return {
                    success: false,
                    error: 'No se pudo conectar con el servidor. Verifique que el servidor esté en funcionamiento.'
                };
            }

            return {
                success: false,
                error: 'Error de conexión. Intente nuevamente o contacte al administrador.'
            };
        }
    }
}

export default new LoginService();