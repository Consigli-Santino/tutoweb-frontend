// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

import Login from './components/Login/Login.jsx';
import Home from "./components/Home/Home.jsx";
import FormUser from "./components/Register/FormUser.jsx";
import Unauthorized from "./components/Unauthorized/Unauthorized.jsx";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Clasess from "./components/Clases/Clasess.jsx";
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/form-user" element={<FormUser />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Rutas protegidas */}
                    <Route path="/home" element={
                        <ProtectedRoute path="/home">
                            <Home />
                        </ProtectedRoute>
                    }/>
                    <Route path="/clases" element={
                        <ProtectedRoute path="/clases">
                            <Clasess />
                        </ProtectedRoute>
                    }/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;