
import React from 'react';
import { ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, children }) => {
    return (
        <div className="materia-card">
            <h3 className="materia-title">{title}</h3>
            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartCard;