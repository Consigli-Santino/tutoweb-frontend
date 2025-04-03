class HomeBarOptionsService {
    optionsHomeBar = [
        {
            "icon": "building-fill",
            "name": "Carreras",
            "roles": ["superAdmin"],
            "path": "/carriers"
        },
        {
            "icon": "folder",
            "name": "Materias",
            "roles": ["alumno", "alumno&profesor", "superAdmin"],
            "path": "/subjects"
        },
        {
            "icon": "book",
            "name": "Clases",
            "roles": ["alumno", "alumno&profesor", "superAdmin", "guardia"],
            "path": "/library"
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
        if (Array.isArray(roles)) {
            return this.optionsHomeBar.filter(option => {
                return roles.some(role => option.roles.includes(role));
            });
        }
        // Si roles es un string único
        else if (typeof roles === 'string') {
            return this.optionsHomeBar.filter(option => {
                return option.roles.includes(roles);
            });
        }
        // Si por alguna razón roles es undefined o null
        return [];
    }

    getOptions(roles) {
        return this.loadHomeBarOptionsBasedOnRole(roles);
    }
}

export default new HomeBarOptionsService();