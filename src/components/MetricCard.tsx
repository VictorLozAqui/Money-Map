import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => {
  const iconColorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600'
  };

  const valueColorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${valueColorClasses[color]}`}>
            {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${iconColorClasses[color]}`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
