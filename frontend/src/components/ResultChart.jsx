import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ResultChart = ({ data }) => {
  // Curated color list for bars
  const colors = ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#a855f7', '#f43f5e'];

  // Format data for chart mapping
  const chartData = data.map((candidate) => ({
    name: candidate.name,
    votes: candidate.voteCount || 0,
    party: candidate.party
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{payload[0].name}</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Party: <span style={{ color: 'var(--primary)' }}>{payload[0].payload.party}</span>
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>
            Votes: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 350, marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-secondary)" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-glass)' }}
          />
          <YAxis 
            allowDecimals={false}
            stroke="var(--text-secondary)" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-glass)' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultChart;
