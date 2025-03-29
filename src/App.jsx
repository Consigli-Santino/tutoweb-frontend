
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/Login/Login.jsx';
import Home from "./components/Home/Home.jsx";
import Register from "./components/Register/Register.jsx";



function App() {
    //TODO DO PRIVATE ROUTES
    return (
            <BrowserRouter>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />}/>
                    <Route path="/register" element={<Register />} />
                </Routes>
            </BrowserRouter>
    );
}

export default App;