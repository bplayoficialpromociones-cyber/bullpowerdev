import React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';

interface ExpenseStats {
  totalIncome: number;
  totalExpense: number;
  byEmployee: Record<string, { name: string; income: number; expense: number }>;
  byClient: Record<string, { name: string; income: number; expense: number }>;
  byType: Record<string, number>;
  byCurrency: Record<string, { income: number; expense: number; symbol: string }>;
  totalRecords: number;
}

interface ExpenseChartsProps {
  stats: ExpenseStats | null;
}

export function ExpenseCharts({ stats }: ExpenseChartsProps) {
  if (!stats) {
    return null;
  }

  const colors = [
    '#14B8A6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#3B82F6',
    '#F97316',
  ];

  const PieChartComponent = ({ data, title }: { data: Record<string, number>; title: string }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return null;

    let currentAngle = 0;
    const segments = Object.entries(data).map(([key, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
      const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
      const endX = 50 + 40 * Math.cos((currentAngle - 90) * (Math.PI / 180));
      const endY = 50 + 40 * Math.sin((currentAngle - 90) * (Math.PI / 180));
      const largeArc = angle > 180 ? 1 : 0;

      return {
        key,
        value,
        percentage,
        color: colors[index % colors.length],
        path: `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`,
      };
    });

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <svg viewBox="0 0 100 100" className="w-64 h-64">
            {segments.map((segment, index) => (
              <g key={index}>
                <path d={segment.path} fill={segment.color} className="hover:opacity-80 transition-opacity" />
              </g>
            ))}
          </svg>
          <div className="flex-1 space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {segment.key}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BarChartComponent = ({ data, title }: { data: Record<string, number>; title: string }) => {
    const entries = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 8);
    const maxValue = Math.max(...entries.map(([, value]) => value));
    if (maxValue === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-3">
          {entries.map(([key, value], index) => {
            const percentage = (value / maxValue) * 100;
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {key}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium ml-2">
                    $ {value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const employeeData: Record<string, number> = {};
  Object.entries(stats.byEmployee).forEach(([id, data]) => {
    employeeData[data.name] = data.income - data.expense;
  });

  const clientData: Record<string, number> = {};
  Object.entries(stats.byClient).forEach(([id, data]) => {
    clientData[data.name] = data.income - data.expense;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          data={stats.byType}
          title="Distribución por Tipo"
        />
        <BarChartComponent
          data={employeeData}
          title="Balance por Empleado"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          data={clientData}
          title="Balance por Cliente"
        />
        <PieChartComponent
          data={{
            'Entradas': stats.totalIncome,
            'Salidas': stats.totalExpense,
          }}
          title="Entradas vs Salidas"
        />
      </div>
    </div>
  );
}
