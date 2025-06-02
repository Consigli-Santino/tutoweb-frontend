
// components/MateriasDemandadasChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const MateriasDemandadasChart = ({ data }) => {
    return (
        <ChartCard title="Materias más Demandadas">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="count" name="Cantidad de Reservas" fill="#FF8042" />
            </BarChart>
        </ChartCard>
    );
};

export default MateriasDemandadasChart;