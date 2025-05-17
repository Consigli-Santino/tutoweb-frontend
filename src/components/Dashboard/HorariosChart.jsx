// components/HorariosChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const HorariosChart = ({ data }) => {
    return (
        <ChartCard title="Horarios más Solicitados">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="count" name="Reservas" fill="#8884d8" />
            </BarChart>
        </ChartCard>
    );
};

export default HorariosChart;