'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PhaseCostBarChart({ data }) {
  const chartData = data.map((item) => ({
    name: item._id,
    cost: item.totalCost,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Bar dataKey="cost" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
