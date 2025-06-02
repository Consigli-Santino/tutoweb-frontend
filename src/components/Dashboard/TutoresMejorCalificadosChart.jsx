import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const TutoresMejorCalificadosChart = ({ data }) => {
    return (
        <ChartCard title="Tutores Mejor Calificados">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" name="Calificación" fill="#8884d8" />
                <Bar dataKey="reviews" name="Reseñas" fill="#82ca9d" />
            </BarChart>
        </ChartCard>
    );
};

export default TutoresMejorCalificadosChart;