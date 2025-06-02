// components/ReservasMateriaChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const ReservasMateriaChart = ({ data }) => {
    return (
        <ChartCard title="Tutorías por Materia">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="count" name="Cantidad" fill="#82ca9d" />
            </BarChart>
        </ChartCard>
    );
};

export default ReservasMateriaChart;