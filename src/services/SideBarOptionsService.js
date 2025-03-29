class SidebarOptionsService {
    sideBarOptions = [
        {
            "icon": "person-circle",
            "name": "Mi Perfil",
            "roles": ["alumno", "alumno&profesor", "admin"],
            "path": "/profile"
        },
        {
            "icon": "person-circle",
            "name": "Mi Perfil",
            "roles": ["guardia"],
            "path": "/profile"
        }
    ]
    loadSideBarOptionsBasedOnRole() {
        //TODO GET USER ROLE FROM LOCAL STORAGE
        const userRole = "alumno"
        return this.sideBarOptions.filter(option => {
            return option.roles.includes(userRole);
        });
    }

    getOptions() {
        return this.loadSideBarOptionsBasedOnRole();
    }
}

export default new SidebarOptionsService();