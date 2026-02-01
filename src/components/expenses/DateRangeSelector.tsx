import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  onRangeChange: (startDate: string, endDate: string) => void;
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preset, setPreset] = useState('');

  const getDateRange = (presetValue: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (presetValue) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        end = today;
        break;
      case '15days':
        start.setDate(today.getDate() - 15);
        end = today;
        break;
      case 'month':
        start.setDate(today.getDate() - 30);
        end = today;
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      default:
        return null;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handlePresetChange = (presetValue: string) => {
    setPreset(presetValue);
    const range = getDateRange(presetValue);
    if (range) {
      setStartDate(range.start);
      setEndDate(range.end);
      onRangeChange(range.start, range.end);
    }
  };

  const handleCustomRange = () => {
    if (startDate && endDate) {
      setPreset('');
      onRangeChange(startDate, endDate);
    }
  };

  useEffect(() => {
    const range = getDateRange('month');
    if (range) {
      setStartDate(range.start);
      setEndDate(range.end);
      setPreset('month');
      onRangeChange(range.start, range.end);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Período de Análisis
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => handlePresetChange('today')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            preset === 'today'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => handlePresetChange('week')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            preset === 'week'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Última Semana
        </button>
        <button
          onClick={() => handlePresetChange('15days')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            preset === '15days'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Últimos 15 Días
        </button>
        <button
          onClick={() => handlePresetChange('month')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            preset === 'month'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Último Mes
        </button>
        <button
          onClick={() => handlePresetChange('lastMonth')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            preset === 'lastMonth'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Mes Pasado
        </button>
        <button
          onClick={() => handlePresetChange('year')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            preset === 'year'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Año Completo
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Rango Personalizado
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomRange}
              disabled={!startDate || !endDate}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
