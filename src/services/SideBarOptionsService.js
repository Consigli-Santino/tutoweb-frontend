class SidebarOptionsService {
    sideBarOptions = [
        {
            "icon": "table",
            "name": "Listado Reservas",
            "roles": ["alumno&tutor","alumno"],
            "path": "/listReservations"
        },
        {
            "icon": "journal-text",
            "name": "Calificaciones",
            "roles": ["superAdmin"],
            "path": "/califications"
        },
        {
            "icon": "mortarboard",
            "name": "Materias y Carreras",
            "roles": ["superAdmin"],
            "path": "/matcarr"
        },
        {
            "icon": "bell-fill",
            "name": "Notificaciones",
            "roles": ["superAdmin","alumno&tutor"],
            "path": "/Notifications"
        },
        {
            "icon": "controller",
            "name": "Juegos",
            "roles": ["superAdmin","alumno&tutor"],
            "path": "/plays"
        },
        {
            "icon": "question-circle",
            "name": "Ayuda",
            "roles": ["alumno&tutor","superAdmin"],
            "path": "/faq"
        },
        {
            "icon": "shield-check",
            "name": "Términos y Condiciones",
            "roles": ["alumno&tutor","superAdmin","alumno"],
            "path": "/terminoscondiciones"
        }
    ]

    loadSideBarOptionsBasedOnRole(roles) {
        if (Array.isArray(roles)) {
            return this.sideBarOptions.filter(option => {
                return roles.some(role => option.roles.includes(role));
            });
        }
        else if (typeof roles === 'string') {
            return this.sideBarOptions.filter(option => {
                return option.roles.includes(roles);
            });
        }
        return [];
    }

    getOptions(role) {
        return this.loadSideBarOptionsBasedOnRole(role);
    }
}

export default new SidebarOptionsService();