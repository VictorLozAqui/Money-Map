import React, { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

  const isCompact = containerWidth < 720;
  const isTight = containerWidth < 520;
  const chartHeight = isTight ? 270 : isCompact ? 320 : 380;
  const outerRadius = isTight ? 95 : isCompact ? 110 : 130;
  const innerRadius = isTight ? 50 : isCompact ? 58 : 68;

  const legendItems = data.map((item, index) => ({
    name: item.name,
    color: COLORS[index % COLORS.length].base
  }));

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Nenhum dado disponivel
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius: inner, outerRadius: outer, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = inner + (outer - inner) * (isTight ? 1.12 : 1.25);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill={isDarkMode ? '#E5E7EB' : '#1F2937'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
        style={{
          textShadow: isDarkMode
            ? '0 2px 8px rgba(0,0,0,0.8)'
            : '0 2px 4px rgba(255,255,255,0.8), 0 0 2px rgba(0,0,0,0.3)'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="relative flex flex-col gap-4" ref={containerRef}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg opacity-50 blur-xl translate-y-4 -z-10"></div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.gradient[0]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color.gradient[1]} stopOpacity={1} />
              </linearGradient>
            ))}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.4" />
            </filter>
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={-180}
            outerRadius={outerRadius - 12}
            fill="#000000"
            fillOpacity={0.1}
            dataKey="value"
            isAnimationActive={false}
            legendType="none"
            stroke="none"
            labelLine={false}
            label={false}
          />

          <Pie
            data={data}
            cx="50%"
            cy="48%"
            startAngle={180}
            endAngle={-180}
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={0}
            dataKey="value"
            filter="url(#shadow)"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${index % COLORS.length})`}
                stroke="none"
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              padding: '12px 14px',
              color: isDarkMode ? '#F9FAFB' : '#111827'
            }}
            itemStyle={{
              color: isDarkMode ? '#E5E7EB' : '#111827',
              fontWeight: 600
            }}
            labelStyle={{
              color: isDarkMode ? '#F9FAFB' : '#111827',
              fontWeight: 700,
              marginBottom: 6
            }}
            formatter={(value: number) => [
              value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
              'Valor'
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="max-h-28 overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-gray-800 dark:text-gray-200">
          {legendItems.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="flex items-center gap-2 min-w-[130px]">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensePieChart3D;
