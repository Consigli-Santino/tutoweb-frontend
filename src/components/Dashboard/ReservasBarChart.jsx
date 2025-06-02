// components/ReservasBarChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const ReservasBarChart = ({ data }) => {
    return (
        <ChartCard title="Reservas por Estado">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
            </BarChart>
        </ChartCard>
    );
};

export default ReservasBarChart;