import React, { useState } from 'react';
import CarrerasCRUD from './CarrerasCRUD';
import MateriasCRUD from './MateriasCRUD';
import { useEntidades } from '../../context/EntidadesContext';

const CarrerasMateriasCRUD = () => {
    const [activeTab, setActiveTab] = useState('carreras');
    const { isLoading } = useEntidades();

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow">
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold fs-4 mb-0">Gestión Académica</h1>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2 text-muted">Cargando datos...</p>
                        </div>
                    ) : (
                        <>
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'carreras' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('carreras')}
                                    >
                                        Carreras
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'materias' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('materias')}
                                    >
                                        Materias
                                    </button>
                                </li>
                            </ul>

                            {activeTab === 'carreras' && <CarrerasCRUD />}
                            {activeTab === 'materias' && <MateriasCRUD />}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CarrerasMateriasCRUD;