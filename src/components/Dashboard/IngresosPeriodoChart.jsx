import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const IngresosPeriodoChart = ({ data }) => {
    return (
        <ChartCard title="Ingresos por Período">
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                <Legend />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
        </ChartCard>
    );
};

export default IngresosPeriodoChart;