class HomeBarOptionsService {
    optionsHomeBar = [
        {
            "icon": "house-fill",
            "name": "Inicio",
            "roles": ["alumno", "alumno&profesor", "superAdmin", "guardia"],
            "path": "/home"
        },
        {
            "icon": "folder",
            "name": "Materias",
            "roles": ["alumno", "alumno&profesor"],
            "path": "/subjects"
        },
        {
            "icon": "people",
            "name": "Usuarios",
            "roles": ["superAdmin"],
            "path": "/users"
        },
        {
            "icon": "book",
            "name": "Clases",
            "roles": ["alumno", "alumno&profesor", "superAdmin", "guardia"],
            "path": "/clases"
        },
        {
            "icon": "calendar",
            "name": "Horarios",
            "roles": ["alumno", "alumno&profesor", "superAdmin"],
            "path": "/evaluations"
        },
        {
            "icon": "coin",
            "name": "Pagos y saldos",
            "roles": ["alumno", "superAdmin"],
            "path": "/payments"
        }
    ]

    loadHomeBarOptionsBasedOnRole(roles) {
        // Si no hay roles, devolver un array vacío
        if (!roles || (Array.isArray(roles) && roles.length === 0)) {
            return [];
        }

        // Si roles es un array
        if (Array.isArray(roles)) {
            return this.optionsHomeBar.filter(option => {
                return option.roles.some(role => roles.includes(role));
            });
        }
        // Si roles es un string único
        else if (typeof roles === 'string') {
            return this.optionsHomeBar.filter(option => {
                return option.roles.includes(roles);
            });
        }

        return [];
    }

    getOptions(roles) {
        return this.loadHomeBarOptionsBasedOnRole(roles);
    }
}

export default new HomeBarOptionsService();