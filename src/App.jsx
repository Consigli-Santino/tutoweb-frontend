
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/Login.jsx';
import Home from "./components/Home.jsx";



function App() {
    return (
            <BrowserRouter>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />}
                    />
                </Routes>
            </BrowserRouter>
    );
}

export default App;