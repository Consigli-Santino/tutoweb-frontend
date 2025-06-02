
// components/DistribucionCalificacionesChart.jsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const DistribucionCalificacionesChart = ({ data, colors }) => {
    return (
        <ChartCard title="Distribución de Calificaciones">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} calificaciones`, 'Cantidad']} />
                <Legend />
            </PieChart>
        </ChartCard>
    );
};

export default DistribucionCalificacionesChart;