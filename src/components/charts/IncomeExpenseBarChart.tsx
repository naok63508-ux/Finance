"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export function IncomeExpenseBarChart({ data }: { data: { month: string, income: number, expense: number, balance: number }[] }) {
  
  // Zarss-style chart has background pill bars, and foreground dark bars!
  const maxVal = Math.max(...data.map(d => d.income || 100));
  const normalizedData = data.map(d => ({ ...d, full: maxVal }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={normalizedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="month" 
          fontSize={13} 
          tickLine={false} 
          axisLine={false} 
          tick={{ fill: '#a0a0a0', fontWeight: 500 }}
          dy={15}
        />
        <YAxis 
          fontSize={13} 
          tickLine={false} 
          axisLine={false} 
          domain={[0, maxVal]}
          tickFormatter={(value) => value === 0 ? '0 K' : `${Math.round(value/1000)} K`} 
          tick={{ fill: '#a0a0a0', fontWeight: 500 }}
        />
        <Tooltip 
          cursor={false}
          formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', {maximumFractionDigits: 0})}`, 'Amount']}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            background: '#ffffff',
            color: '#1a1a1a',
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: '14px'
          }}
        />
        
        {/* Background rounded bars */}
        <Bar dataKey="full" className="fill-[#e8e7e1] dark:fill-[#2d2d2d]" radius={[16, 16, 16, 16]} barSize={42} />
        
        {/* Foreground dark bars overlapping */}
        <Bar dataKey="income" radius={[16, 16, 16, 16]} barSize={42} style={{transform: "translateX(-42px)"}}>
          {
            normalizedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#222222" />
            ))
          }
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
