import Navbar from "../Navbar/Navbar.jsx";
import SideBarOptionsService from "../../services/SideBarOptionsService.js";
import HomeBarOptionsService from "../../services/HomeBarOptionsService.js";
import HomeBar from "../HomeBar/HomeBar.jsx";

const Home =()=>{

    const userOptionsSideBar = SideBarOptionsService.getOptions();
    const userOptionsHome = HomeBarOptionsService.getOptions();

    return(
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <Navbar userOptions={userOptionsSideBar} />

            {/* Contenido */}
            <div className="container-fluid py-4 flex-grow-1">
                <div className="row">
                    <div className="col-12">
                        <h1 className="fw-bold text-center">Bienvenido a TutoWeb</h1>
                        <p className="text-center text-muted">Gestiona tus clases y reservas de forma sencilla</p>
                    </div>
                </div>
            </div>
            <HomeBar userOptions={userOptionsHome}/>
        </div>
    )
}
export default Home