"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BalanceLineChart({ data }: { data: { month: string, balance: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="month" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tick={{ fill: 'currentColor', opacity: 0.5 }} 
          dy={10}
        />
        <YAxis 
          hide 
          domain={['dataMin - 1000', 'dataMax + 1000']}
        />
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Saldo']} 
          contentStyle={{ 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            background: 'var(--card)',
            color: 'var(--foreground)',
            padding: '12px 16px',
            fontWeight: 600
          }}
          itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
          cursor={{ stroke: 'rgba(129, 140, 248, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#818cf8"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorBalance)"
          activeDot={{ r: 8, strokeWidth: 4, stroke: 'var(--card)', fill: '#818cf8' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
