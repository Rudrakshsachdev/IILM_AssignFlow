import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import styles from '../AdminDashboard.module.css';

const AdminDashboardChart = ({ data }) => {
  // data: { total_students, total_faculty, total_assignments, total_submissions, total_courses }
  const chartData = [
    { name: 'Students', count: data.total_students || 0, color: '#10b981' }, // Emerald
    { name: 'Faculty', count: data.total_faculty || 0, color: '#3b82f6' },  // Blue
    { name: 'Assignments', count: data.total_assignments || 0, color: '#1e3a8a' }, // Navy
    { name: 'Submissions', count: data.total_submissions || 0, color: '#6366f1' }, // Indigo
    { name: 'Courses', count: data.total_courses || 0, color: '#f59e0b' },  // Amber
  ];

  return (
    <div className={`glass-card ${styles.chartCard}`}>
      <div className={styles.chartHeader}>
        <h3>System Analytics</h3>
        <p>Comprehensive overview of platform growth and engagement</p>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 13, fill: '#64748b' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                padding: '12px'
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
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

export default AdminDashboardChart;
