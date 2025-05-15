class HomeBarOptionsService {
    optionsHomeBar = [
        {
            "icon": "house-fill",
            "name": "Inicio",
            "roles": ["alumno", "alumno&tutor", "superAdmin", "guardia"],
            "path": "/home"
        },
        {
            "icon": "folder",
            "name": "Materias",
            "roles": [ "alumno&tutor"],
            "path": "/subjects"
        },
        {
            "icon": "people",
            "name": "Usuarios",
            "roles": ["superAdmin"],
            "path": "/users"
        },
        {
            "icon": "calendar",
            "name": "Horarios",
            "roles": [ "alumno&tutor", "superAdmin"],
            "path": "/disponibility"
        },
        {
            "icon": "coin",
            "name": "Pagos y saldos",
            "roles": ["superAdmin"],
            "path": "/payments"
        },
        {
            "icon": "bookmark",
            "name": "Mis Reservas",
            "roles": ["alumno", "alumno&tutor","superAdmin"],
            "path": "/reservas"
        },
        {
            "icon": "diagram-3",
            "name": "Mis servicios",
            "roles": ["alumno&tutor"],
            "path": "/tutor/servicios"
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