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
        }

    ]
    loadSideBarOptionsBasedOnRole(roles) {
        // Si roles es ya un array, usarlo directamente
        if (Array.isArray(roles)) {
            return this.sideBarOptions.filter(option => {
                return roles.some(role => option.roles.includes(role));
            });
        }
        // Si roles es un string único
        else if (typeof roles === 'string') {
            return this.sideBarOptions.filter(option => {
                return option.roles.includes(roles);
            });
        }
        // Si por alguna razón roles es undefined o null
        return [];
    }

    getOptions(role) {
        return this.loadSideBarOptionsBasedOnRole(role);
    }
}

export default new SidebarOptionsService();