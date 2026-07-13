import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface ReportPieChartProps {
  data: DataPoint[];
  colors: string[];
}

export default function ReportPieChart({ data, colors }: ReportPieChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent, x, y }) => {
              const displayPercent = percent && !isNaN(percent) ? (percent * 100).toFixed(0) : '0';
              return (
                <text 
                  x={x} 
                  y={y} 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fill="#71717a"
                  className="text-xs font-mono"
                >
                  {name} ({displayPercent}%)
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
