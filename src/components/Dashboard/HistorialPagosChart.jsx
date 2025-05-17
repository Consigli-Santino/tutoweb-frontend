// components/HistorialPagosChart.jsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const HistorialPagosChart = ({ data }) => {
    // Colores específicos para el estado de los pagos
    const COLORS = ['#00C49F', '#FFBB28', '#FF8042']; // Completados, Pendientes, Cancelados

    return (
        <ChartCard title="Historial de Pagos">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} pagos`, 'Cantidad']} />
                <Legend />
            </PieChart>
        </ChartCard>
    );
};

export default HistorialPagosChart;