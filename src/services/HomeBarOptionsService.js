class HomeBarOptionsService {
    optionsHomeBar = [
        {
            "icon": "folder",
            "name": "Materias",
            "roles": ["alumno", "alumno&profesor", "admin"],
            "path": "/subjects"
        },
        {
            "icon": "book",
            "name": "Clases",
            "roles": ["alumno", "alumno&profesor", "admin", "guardia"],
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

    loadHomeBarOptionsBasedOnRole() {
        //TODO GET USER ROLE FROM LOCAL STORAGE
        const userRole = "alumno";

        return this.optionsHomeBar.filter(option => {
            return option.roles.includes(userRole);
        });
    }

    getOptions() {
        return this.loadHomeBarOptionsBasedOnRole();
    }
}

export default new HomeBarOptionsService();