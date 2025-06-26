import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { EntidadesProvider } from "./context/EntidadesContext.jsx";

import Login from './components/Login/Login.jsx';
import Home from "./components/Home/Home.jsx";
import FormUser from "./components/Register/FormUser.jsx";
import Unauthorized from "./components/Unauthorized/Unauthorized.jsx";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Users from "./components/Admin/Users.jsx";
import AppLayout from './components/Layout/AppLayout.jsx';
import FormUserByAdmin from './components/Admin/FormUserByAdmin.jsx';
import TutorsCRUDMaterias from "./components/tutors/TutorsMaterias/TutorsCRUDMaterias.jsx";
import TutorsCRUDDisponibilidad from "./components/tutors/TutorsDisponibility/TutorsCRUDDisponibilidad.jsx";
import TutorProfile from "./components/tutors/TutorProfile/TutorProfile.jsx";
import TutorsCRUDServiciosTutoria from "./components/tutors/TutorsCRUDServiciosTutoria/TutorsCRUDServiciosTutoria.jsx";
import PaymentPending from "./components/Payments/PaymentPending.jsx";
import PaymentFailure from "./components/Payments/PaymentFailure.jsx";
import PaymentSuccess from "./components/Payments/PaymentSucces.jsx";
import ReservasContainer from "./components/AlumnosTutores/ReservasContainer.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import ListadoReservas from "./components/AlumnosTutores/ListadoReservas.jsx";
import CarrerasMateriasCRUD from "./components/Carreras/CarrerasMateriasCRUD.jsx";
import CalificacionesListado from "./components/Admin/Califications/CalificacionesListado.jsx";
import NotificacionesListado from "./components/Admin/Notifications/NotificacionesListado.jsx";
import AyudaPreguntasFrecuentes from "./components/AyudaPreguntasFrecuentes/AyudaPreguntasFrecuentes.jsx";
import BubblePopGame from "./components/Home/BubblePopGame.jsx";
import TerminosCondiciones from "./components/TYC/TerminosCondiciones.jsx";


function App() {
    return (
        <AuthProvider>
            {/* Envolver todo con el EntidadesProvider FUERA de Routes */}
            <EntidadesProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Rutas públicas (sin navbar/homebar) */}
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<FormUser />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/payment-failure" element={<PaymentFailure />} />
                        <Route path="/payment-pending" element={<PaymentPending />} />

                        {/* Rutas protegidas con Layout (con navbar/homebar) */}
                        <Route element={<AppLayout />}>
                            <Route path="/home" element={
                                <ProtectedRoute path="/home">
                                    <Home />
                                </ProtectedRoute>
                            } />
                            <Route path="terminoscondiciones" element={
                                <ProtectedRoute path="terminoscondiciones">
                                    <TerminosCondiciones />
                                </ProtectedRoute>
                            }
                            ></Route>
                            <Route path="/faq" element={
                                <ProtectedRoute path="/faq">
                                    <AyudaPreguntasFrecuentes />
                                </ProtectedRoute>
                            } />
                            <Route path="/plays" element={
                                <ProtectedRoute path="/plays">
                                    <BubblePopGame></BubblePopGame>
                                </ProtectedRoute>
                            }/>
                            <Route path="/califications" element={
                                <ProtectedRoute path="/califications">
                                    <CalificacionesListado/>
                                </ProtectedRoute>
                            } />
                            <Route path="/notifications" element={
                                <ProtectedRoute path="/Notifications">
                                    <NotificacionesListado/>
                                </ProtectedRoute>
                            } />
                            <Route path="/subjects" element={
                                <ProtectedRoute path="/subjects">
                                    <TutorsCRUDMaterias/>
                                </ProtectedRoute>
                            } />
                            <Route path="/reservas" element={
                                <ProtectedRoute path="/reservas">
                                    <ReservasContainer/>
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                                <ProtectedRoute path="/dashboard">
                                    <Dashboard/>
                                </ProtectedRoute>
                            } />
                            <Route path="/listReservations" element={
                                <ListadoReservas path="/listReservations">
                                    <Dashboard/>
                                </ListadoReservas>
                            } />
                            <Route path="/disponibility" element={
                                <ProtectedRoute path="/disponibility">
                                    <TutorsCRUDDisponibilidad/>
                                </ProtectedRoute>
                            } />
                            <Route path="/users" element={
                                <ProtectedRoute path="/users">
                                    <Users />
                                </ProtectedRoute>
                            } />
                            <Route path="/matcarr" element={
                                <ProtectedRoute path="/matcarr">
                                    <CarrerasMateriasCRUD />
                                </ProtectedRoute>
                            } />
                            <Route path="/tutores/:email" element={
                                <ProtectedRoute path="/tutores/:email">
                                    <TutorProfile />
                                </ProtectedRoute>
                            } />
                            <Route path="/tutor/servicios" element={
                                <ProtectedRoute path="/tutor/servicios">
                                    <TutorsCRUDServiciosTutoria/>
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/usuarios" element={
                                <ProtectedRoute path="/admin/usuarios">
                                    <Users />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/usuarios/nuevo" element={
                                <ProtectedRoute path="/admin/usuarios/nuevo">
                                    <FormUserByAdmin />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/usuarios/editar/:id" element={
                                <ProtectedRoute path="/admin/usuarios/editar/:id">
                                    <FormUserByAdmin />
                                </ProtectedRoute>
                            } />
                            {/* Añadimos la ruta para mi perfil dentro del layout pero sin protegerla */}
                            <Route path="/form-user" element={<FormUser />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </EntidadesProvider>
        </AuthProvider>
    );
}

export default App;