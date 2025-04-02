import Navbar from "../Navbar/Navbar.jsx";
import SideBarOptionsService from "../../services/SideBarOptionsService.js";
import HomeBarOptionsService from "../../services/HomeBarOptionsService.js";
import HomeBar from "../HomeBar/HomeBar.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

const Home =()=>{
    const {user, availableRoutesSideBar, availableRoutesHomeBar} = useAuth();

    const filteredButtonsSideBar = SideBarOptionsService.getOptions().filter((option) => {
        return availableRoutesSideBar.includes(option.path);
    })
    const filteredButtonsHome = HomeBarOptionsService.getOptions().filter((option) => {
        return availableRoutesHomeBar.includes(option.path);
    })
    return(
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <Navbar userOptions={filteredButtonsSideBar} />

            {/* Contenido */}
            <div className="container-fluid py-4 flex-grow-1">
                <div className="row">
                    <div className="col-12">
                        <h1 className="fw-bold text-center">Bienvenido a TutoWeb</h1>
                        <p className="text-center text-muted">Gestiona tus clases y reservas de forma sencilla</p>
                    </div>
                </div>
            </div>
            <HomeBar userOptions={filteredButtonsHome} />
        </div>
    )
}
export default Home