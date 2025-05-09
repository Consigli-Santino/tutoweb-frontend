import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { EntidadesProvider } from "./context/EntidadesContext.jsx";

import Login from './components/Login/Login.jsx';
import Home from "./components/Home/Home.jsx";
import FormUser from "./components/Register/FormUser.jsx";
import Unauthorized from "./components/Unauthorized/Unauthorized.jsx";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Clasess from "./components/Clases/Clasess.jsx";
import Users from "./components/Admin/Users.jsx";
import AppLayout from './components/Layout/AppLayout.jsx';
import FormUserByAdmin from './components/Admin/FormUserByAdmin.jsx';
import TutorsCRUDMaterias from "./components/tutors/TutorsMaterias/TutorsCRUDMaterias.jsx";
import TutorsCRUDDisponibilidad from "./components/tutors/TutorsDisponibility/TutorsCRUDDisponibilidad.jsx";
import TutorProfile from "./components/tutors/TutorProfile/TutorProfile.jsx";
import TutorsCRUDServiciosTutoria from "./components/tutors/TutorsCRUDServiciosTutoria/TutorsCRUDServiciosTutoria.jsx";
import AlumnoReservas from "./components/AlumnosTutores/AlumnoReservas.jsx";

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

                        {/* Rutas protegidas con Layout (con navbar/homebar) */}
                        <Route element={<AppLayout />}>
                            <Route path="/home" element={
                                <ProtectedRoute path="/home">
                                    <Home />
                                </ProtectedRoute>
                            } />
                            <Route path="/subjects" element={
                                <ProtectedRoute path="/subjects">
                                    <TutorsCRUDMaterias/>
                                </ProtectedRoute>
                            } />
                            <Route path="/reservas" element={
                                <ProtectedRoute path="/reservas">
                                    <AlumnoReservas/>
                                </ProtectedRoute>
                            } />
                            <Route path="/clases" element={
                                <ProtectedRoute path="/clases">
                                    <Clasess />
                                </ProtectedRoute>
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