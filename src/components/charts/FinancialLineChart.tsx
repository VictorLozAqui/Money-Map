import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Income, Expense } from '../../types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialLineChartProps {
  incomes: Income[];
  expenses: Expense[];
  months?: number;
}

const FinancialLineChart: React.FC<FinancialLineChartProps> = ({
  incomes,
  expenses,
  months = 6
}) => {
  // Gera os últimos N meses
  const endDate = new Date();
  const startDate = subMonths(endDate, months - 1);
  const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });

  const data = monthsInterval.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthIncomes = incomes
      .filter(inc => inc.data >= monthStart && inc.data <= monthEnd)
      .reduce((sum, inc) => sum + inc.valor, 0);

    const monthExpenses = expenses
      .filter(exp => exp.data >= monthStart && exp.data <= monthEnd)
      .reduce((sum, exp) => sum + exp.valor, 0);

    return {
      month: format(month, 'MMM/yy', { locale: ptBR }),
      rendimentos: monthIncomes,
      gastos: monthExpenses,
      saldo: monthIncomes - monthExpenses
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number) =>
            value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="rendimentos"
          stroke="#10B981"
          strokeWidth={2}
          name="Rendimentos"
        />
        <Line
          type="monotone"
          dataKey="gastos"
          stroke="#EF4444"
          strokeWidth={2}
          name="Gastos"
        />
        <Line
          type="monotone"
          dataKey="saldo"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Saldo"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinancialLineChart;

