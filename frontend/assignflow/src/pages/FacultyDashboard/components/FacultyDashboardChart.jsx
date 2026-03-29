import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from '../FacultyDashboard.module.css';

const FacultyDashboardChart = ({ data }) => {
  // data: { evaluated_submissions, pending_evaluations }
  const chartData = [
    { name: 'Reviewed', value: data.evaluated_submissions || 0, color: '#10b981' }, // Emerald
    { name: 'Pending Review', value: data.pending_evaluations || 0, color: '#f59e0b' }, // Amber
  ];

  const total = chartData.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <div className={`glass-card ${styles.chartCard}`}>
      <div className={styles.chartHeader}>
        <h3>Grading Progress</h3>
        <p>Total Submissions: {total}</p>
      </div>
      <div className={styles.chartWrapper}>
        {total === 0 ? (
          <div className={styles.noData}>No submissions received yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  padding: '10px'
                }} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboardChart;
