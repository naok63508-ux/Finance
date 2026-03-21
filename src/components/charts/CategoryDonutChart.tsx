"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Vibrant, pastel-like aesthetic colors
const COLORS = [
  '#facc15', '#60a5fa', '#c084fc', '#f87171', 
  '#34d399', '#fb923c', '#e879f9', '#2dd4bf', 
  '#a3e635', '#38bdf8', '#fb7185'
];

export function CategoryDonutChart({ data }: { data: { name: string, value: number }[] }) {
  // Configured to be a sleek, thin donut chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="90%"
          paddingAngle={4}
          dataKey="value"
          stroke="none"
          cornerRadius={6}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits:2})}`, '']} 
          contentStyle={{ 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.05)', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            background: 'var(--card)',
            color: 'var(--foreground)',
            padding: '12px 16px',
            fontWeight: 700
          }}
          itemStyle={{ paddingTop: 4 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
