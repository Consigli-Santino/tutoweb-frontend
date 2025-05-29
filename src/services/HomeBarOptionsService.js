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
            "roles": [ "alumno&tutor"],
            "path": "/disponibility"
        },
        {
            "icon": "bookmark",
            "name": "Mis Reservas",
            "roles": ["alumno", "alumno&tutor"],
            "path": "/reservas"
        },
        {
            "icon": "box",
            "name": "Listado Reservas",
            "roles": ["superAdmin"],
            "path": "/listReservations"
        },
        {
            "icon": "diagram-3",
            "name": "Mis servicios",
            "roles": ["alumno&tutor"],
            "path": "/tutor/servicios"
        },
        {
            "icon": "grid",
            "name": "Estadisticas",
            "roles": [ "alumno&tutor", "superAdmin","alumno"],
            "path": "/dashboard"
        },
        {
            "icon": "question-circle",
            "name": "Ayuda",
            "roles": ["alumno", "alumno&tutor", "superAdmin", "guardia"],
            "path": "/faq"
        },

    ]

    loadHomeBarOptionsBasedOnRole(roles) {
        if (!roles || (Array.isArray(roles) && roles.length === 0)) {
            return [];
        }
        if (Array.isArray(roles)) {
            return this.optionsHomeBar.filter(option => {
                return option.roles.some(role => roles.includes(role));
            });
        }
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