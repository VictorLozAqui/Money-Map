import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Expense } from '../../types';

interface ExpensePieChartProps {
  expenses: Expense[];
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6B7280'  // gray
];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses }) => {
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
      <div className="h-80 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensePieChart;

