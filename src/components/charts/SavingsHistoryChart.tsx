import React, { useEffect, useRef, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Expense, Income } from '../../types';

interface SavingsHistoryChartProps {
  incomes: Income[];
  expenses: Expense[];
  months?: number;
}

const SavingsHistoryChart: React.FC<SavingsHistoryChartProps> = ({ incomes, expenses, months = 12 }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    setContainerWidth(containerRef.current.clientWidth);

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) {
        setContainerWidth(width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const safeMonths = Math.max(1, months);
  const endDate = new Date();
  const startDate = subMonths(endDate, safeMonths - 1);
  const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });
  const rangeStart = startOfMonth(startDate);
  const rangeEnd = endOfMonth(endDate);

  const hasDataInRange =
    incomes.some(inc => inc.data >= rangeStart && inc.data <= rangeEnd) ||
    expenses.some(exp => exp.data >= rangeStart && exp.data <= rangeEnd);

  if (!hasDataInRange) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Nenhum dado disponivel
      </div>
    );
  }

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
      month: format(month, 'MMM yy', { locale: ptBR }),
      poupanca: monthIncomes - monthExpenses
    };
  });

  const isCompact = containerWidth < 720;
  const isTight = containerWidth < 520;
  const chartHeight = isTight ? 240 : isCompact ? 300 : 360;
  const tickFontSize = isTight ? 10 : 12;
  const dotRadius = isTight ? 3 : 4;
  const activeDotRadius = isTight ? 5 : 6;

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg opacity-30 blur-xl translate-y-4"></div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={data}
          margin={{
            top: isTight ? 14 : 20,
            right: isCompact ? 18 : 30,
            left: isCompact ? 12 : 20,
            bottom: isCompact ? 14 : 20
          }}
        >
          <defs>
            <linearGradient id="colorPoupanca" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
            <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="month"
            stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
            style={{ fontSize: `${tickFontSize}px`, fontWeight: '600' }}
            tick={{ fill: isDarkMode ? '#D1D5DB' : '#4B5563' }}
          />

          <YAxis
            stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
            style={{ fontSize: `${tickFontSize}px`, fontWeight: '600' }}
            tick={{ fill: isDarkMode ? '#D1D5DB' : '#4B5563' }}
            tickFormatter={(value) =>
              value.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })
            }
          />

          <ReferenceLine
            y={0}
            stroke={isDarkMode ? '#4B5563' : '#9CA3AF'}
            strokeDasharray="4 4"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              padding: '16px',
              color: isDarkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value: number) =>
              value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            }
            labelStyle={{
              fontWeight: '700',
              marginBottom: '8px',
              color: isDarkMode ? '#F3F4F6' : '#1F2937'
            }}
            itemStyle={{
              color: isDarkMode ? '#E5E7EB' : '#111827',
              fontWeight: 600
            }}
          />

          <Area
            type="monotone"
            dataKey="poupanca"
            fill="url(#colorPoupanca)"
            stroke="none"
            legendType="none"
          />

          <Line
            type="monotone"
            dataKey="poupanca"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: dotRadius, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: activeDotRadius, stroke: '#3B82F6', strokeWidth: 3 }}
            filter="url(#lineShadow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsHistoryChart;
