import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Currency } from '../../types/expenses';
import { currenciesService } from '../../services/expensesService';
import { ProgressBar } from '../ProgressBar';
import { Toast } from '../Toast';

interface CurrencyModalProps {
  currency: Currency | null;
  onClose: () => void;
  onSave: () => void;
}

export function CurrencyModal({ currency, onClose, onSave }: CurrencyModalProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    code: currency?.code || '',
    name: currency?.name || '',
    symbol: currency?.symbol || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.symbol) {
      setToast({ message: 'Todos los campos son obligatorios', type: 'error' });
      return;
    }

    if (formData.code.length < 2 || formData.code.length > 5) {
      setToast({ message: 'El código debe tener entre 2 y 5 caracteres', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      const data = {
        ...formData,
        code: formData.code.toUpperCase(),
        ...(currency && { id: currency.id }),
      };

      setProgress(50);

      if (currency) {
        await currenciesService.update(data);
        setToast({ message: 'Moneda actualizada exitosamente', type: 'success' });
      } else {
        await currenciesService.create(data);
        setToast({ message: 'Moneda creada exitosamente', type: 'success' });
      }

      setProgress(100);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (error: any) {
      setProgress(100);
      setToast({ message: error.message || 'Error al guardar la moneda', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currency ? 'Editar Moneda' : 'Nueva Moneda'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading && (
          <div className="px-6 pt-4">
            <ProgressBar progress={progress} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código ISO <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              maxLength={5}
              placeholder="Ej: USD, EUR, ARS"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Código de 2-5 caracteres (ej: USD, EUR, BTC)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Dólar Estadounidense"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Símbolo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              maxLength={10}
              placeholder="Ej: $, €, £"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Símbolo que representa la moneda
            </p>
          </div>

          {formData.code && formData.symbol && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vista previa:</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formData.code} - {formData.name || 'Nombre'} ({formData.symbol})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Ejemplo: {formData.symbol} 1,234.56
              </p>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {currency ? 'Actualizar' : 'Crear'}
          </button>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
