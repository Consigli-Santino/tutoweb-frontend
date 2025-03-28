import Navbar from "./Navbar.jsx";

const Home =()=>{
    const userOptions = [
        { id: 1, name: 'Mi Perfil', icon: 'person-circle', path: '/profile' },
        { id: 2, name: 'Mis Tutorías', icon: 'journal-bookmark', path: '/tutorials' },
        { id: 3, name: 'Mis Reservas', icon: 'calendar-check', path: '/reservations' },
        { id: 4, name: 'Configuración', icon: 'gear-fill', path: '/settings' },
        { id: 5, name: 'Cerrar Sesión', icon: 'box-arrow-right', path: '/logout' }
    ];


    return(
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <Navbar userOptions={userOptions} />

            {/* Contenido */}
            <div className="container-fluid py-4 flex-grow-1">
                <div className="row">
                    <div className="col-12">
                        <h1 className="fw-bold text-center">Bienvenido a TutoWeb</h1>
                        <p className="text-center text-muted">Gestiona tus tutorías y reservas de forma sencilla</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Home