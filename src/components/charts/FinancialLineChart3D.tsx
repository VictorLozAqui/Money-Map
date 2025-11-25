import React, { useEffect, useRef, useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { Income, Expense } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialLineChart3DProps {
  incomes: Income[];
  expenses: Expense[];
}

const FinancialLineChart3D: React.FC<FinancialLineChart3DProps> = ({ incomes, expenses }) => {
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

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const currentMonthTransactions = [
    ...incomes.filter(i => i.data <= end),
    ...expenses.filter(e => e.data <= end)
  ];

  if (currentMonthTransactions.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Nenhum dado disponivel
      </div>
    );
  }

  const days = eachDayOfInterval({ start, end });

  const data = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');

    const dayIncomes = incomes
      .filter(i => format(i.data, 'yyyy-MM-dd') <= dayStr && i.data <= now)
      .reduce((sum, i) => sum + i.valor, 0);

    const dayExpenses = expenses
      .filter(e => format(e.data, 'yyyy-MM-dd') <= dayStr && e.data <= now)
      .reduce((sum, e) => sum + e.valor, 0);

    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      rendimentos: dayIncomes,
      gastos: dayExpenses,
      saldo: dayIncomes - dayExpenses
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Nenhum dado disponivel
      </div>
    );
  }

  const isCompact = containerWidth < 720;
  const isTight = containerWidth < 520;
  const chartHeight = isTight ? 260 : isCompact ? 320 : 400;
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
            <linearGradient id="colorRendimentos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            strokeOpacity={0.5}
          />
          
          <XAxis
            dataKey="date"
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
          
          <Legend
            wrapperStyle={{
              paddingTop: isCompact ? '10px' : '20px',
              fontSize: isTight ? '12px' : '14px',
              fontWeight: '500'
            }}
          />
          
          <Area
            type="monotone"
            dataKey="rendimentos"
            fill="url(#colorRendimentos)"
            stroke="none"
            legendType="none"
          />
          
          <Area
            type="monotone"
            dataKey="gastos"
            fill="url(#colorGastos)"
            stroke="none"
            legendType="none"
          />
          
          <Line
            type="monotone"
            dataKey="rendimentos"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: dotRadius, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: activeDotRadius, stroke: '#10B981', strokeWidth: 3 }}
            filter="url(#lineShadow)"
          />
          
          <Line
            type="monotone"
            dataKey="gastos"
            stroke="#EF4444"
            strokeWidth={3}
            dot={{ fill: '#EF4444', r: dotRadius, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: activeDotRadius, stroke: '#EF4444', strokeWidth: 3 }}
            filter="url(#lineShadow)"
          />
          
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="#3B82F6"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: '#3B82F6', r: dotRadius, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: activeDotRadius, stroke: '#3B82F6', strokeWidth: 3 }}
            filter="url(#lineShadow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialLineChart3D;
