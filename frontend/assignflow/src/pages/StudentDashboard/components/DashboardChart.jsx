import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from '../StudentDashboard.module.css';

const DashboardChart = ({ data }) => {
  // data: { totalAssignments, submitted, evaluated }
  const chartData = [
    { name: 'Total Assignments', value: data.totalAssignments, color: '#1e3a8a' }, // Navy Blue
    { name: 'Submitted', value: data.submitted, color: '#3b82f6' }, // Blue
    { name: 'Evaluated', value: data.evaluated, color: '#10b981' }, // Emerald
  ];

  return (
    <div className={`glass-card ${styles.chartCard}`}>
      <div className={styles.chartHeader}>
        <h3>Submission Performance</h3>
        <p>Overview of your academic progress</p>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: 'white'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
