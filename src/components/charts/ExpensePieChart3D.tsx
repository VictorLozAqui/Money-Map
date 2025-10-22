import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Expense } from '../../types';

interface ExpensePieChartProps {
  expenses: Expense[];
}

const COLORS = [
  { base: '#3B82F6', gradient: ['#60A5FA', '#2563EB'] }, // blue
  { base: '#EF4444', gradient: ['#F87171', '#DC2626'] }, // red
  { base: '#10B981', gradient: ['#34D399', '#059669'] }, // green
  { base: '#F59E0B', gradient: ['#FBBF24', '#D97706'] }, // amber
  { base: '#8B5CF6', gradient: ['#A78BFA', '#7C3AED'] }, // violet
  { base: '#EC4899', gradient: ['#F472B6', '#DB2777'] }, // pink
  { base: '#14B8A6', gradient: ['#2DD4BF', '#0D9488'] }, // teal
  { base: '#F97316', gradient: ['#FB923C', '#EA580C'] }, // orange
  { base: '#6B7280', gradient: ['#9CA3AF', '#4B5563'] }  // gray
];

const ExpensePieChart3D: React.FC<ExpensePieChartProps> = ({ expenses }) => {
  // Agrupa gastos por categoria
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.tipo]) {
      acc[expense.tipo] = 0;
    }
    acc[expense.tipo] += expense.valor;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Nenhum dado disponível
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="relative">
      {/* Sombra de fundo para efeito 3D */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg opacity-50 blur-xl transform translate-y-4"></div>
      
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.gradient[0]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color.gradient[1]} stopOpacity={1} />
              </linearGradient>
            ))}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.4"/>
            </filter>
          </defs>
          
          {/* Sombra do gráfico */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={-180}
            outerRadius={105}
            fill="#000000"
            fillOpacity={0.1}
            dataKey="value"
            isAnimationActive={false}
            legendType="none"
          />
          
          {/* Gráfico principal com gradientes */}
          <Pie
            data={data}
            cx="50%"
            cy="48%"
            startAngle={180}
            endAngle={-180}
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            dataKey="value"
            filter="url(#shadow)"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${index % COLORS.length})`}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              padding: '12px'
            }}
            formatter={(value: number) => [
              value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
              'Valor'
            ]}
          />
          
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart3D;

