import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { Expense, Currency, ExpenseType } from '../../types/expenses';
import { expensesService, currenciesService, expenseTypesService } from '../../services/expensesService';
import { clientsService, employeesService } from '../../services/crmService';
import { ProgressBar } from '../ProgressBar';
import { Toast } from '../Toast';

interface ExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}

export function ExpenseModal({ expense, onClose, onSave }: ExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingInvoice, setExistingInvoice] = useState<{ url: string; filename: string } | null>(
    expense?.invoice_url && expense?.invoice_filename
      ? { url: expense.invoice_url, filename: expense.invoice_filename }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: expense?.name || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    currency_id: expense?.currency_id || '',
    expense_type_id: expense?.expense_type_id || '',
    client_id: expense?.client_id || '',
    employee_id: expense?.employee_id || '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.client_id && employees.length > 0) {
      const clientEmployees = employees.filter(emp => emp.client_id === formData.client_id);
      setFilteredEmployees(clientEmployees);

      if (formData.employee_id && !clientEmployees.find(emp => emp.id === formData.employee_id)) {
        if (!expense) {
          setFormData(prev => ({ ...prev, employee_id: '' }));
        }
      }
    } else if (!formData.client_id) {
      setFilteredEmployees([]);
      if (!expense) {
        setFormData(prev => ({ ...prev, employee_id: '' }));
      }
    }
  }, [formData.client_id, employees, expense]);

  const loadData = async () => {
    try {
      setLoading(true);
      setProgress(10);

      const [currenciesData, clientsData, employeesData, typesData] = await Promise.all([
        currenciesService.list(1, 1000),
        clientsService.list(),
        employeesService.list(),
        expenseTypesService.list(),
      ]);

      setProgress(70);

      const allEmployees = employeesData.employees || [];
      setCurrencies(currenciesData.currencies || []);
      setClients(clientsData.clients || []);
      setEmployees(allEmployees);
      setExpenseTypes(typesData.types || []);

      if (expense && expense.client_id) {
        const clientEmployees = allEmployees.filter(emp => emp.client_id === expense.client_id);
        setFilteredEmployees(clientEmployees);
      }

      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Error al cargar los datos', type: 'error' });
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setToast({
        message: 'Tipo de archivo no permitido. Solo se aceptan archivos .jpg, .png o .pdf',
        type: 'error'
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({
        message: 'El archivo es demasiado grande. El tamaño máximo es 5MB',
        type: 'error'
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingInvoice = async () => {
    if (!expense?.id || !existingInvoice) return;

    try {
      setLoading(true);
      const filePath = existingInvoice.url.split('/').pop();
      if (filePath) {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const token = localStorage.getItem('auth_token');
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-invoice?filePath=${encodeURIComponent(filePath)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al eliminar la factura');
        }
      }

      setExistingInvoice(null);
      setToast({ message: 'Factura eliminada', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar la factura', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uploadInvoice = async (file: File): Promise<{ url: string; filename: string } | null> => {
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const token = localStorage.getItem('auth_token');
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir la factura');
      }

      const data = await response.json();
      return {
        url: data.url,
        filename: data.filename
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.date || !formData.amount || !formData.currency_id ||
        !formData.expense_type_id || !formData.client_id || !formData.employee_id) {
      setToast({ message: 'Todos los campos son obligatorios', type: 'error' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setToast({ message: 'El monto debe ser mayor a cero', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      let invoiceData: { invoice_url?: string; invoice_filename?: string } = {};

      if (selectedFile) {
        setProgress(25);
        const uploadResult = await uploadInvoice(selectedFile);
        if (uploadResult) {
          invoiceData = {
            invoice_url: uploadResult.url,
            invoice_filename: uploadResult.filename
          };
        }
      } else if (existingInvoice) {
        invoiceData = {
          invoice_url: existingInvoice.url,
          invoice_filename: existingInvoice.filename
        };
      }

      const data = {
        ...formData,
        amount,
        ...invoiceData,
        ...(expense && { id: expense.id }),
      };

      setProgress(50);

      if (expense) {
        await expensesService.update(data);
        setToast({ message: 'Gasto actualizado exitosamente', type: 'success' });
      } else {
        await expensesService.create(data);
        setToast({ message: 'Gasto creado exitosamente', type: 'success' });
      }

      setProgress(100);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (error: any) {
      setProgress(100);
      setToast({ message: error.message || 'Error al guardar el gasto', type: 'error' });
      setLoading(false);
    }
  };

  const getExpenseTypeBadgeColor = (typeName: string) => {
    return typeName === 'Entrada'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Gasto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moneda <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency_id}
                onChange={(e) => setFormData({ ...formData, currency_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              >
                <option value="">Seleccionar moneda</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.expense_type_id}
                onChange={(e) => setFormData({ ...formData, expense_type_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              >
                <option value="">Seleccionar tipo</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {formData.expense_type_id && (
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getExpenseTypeBadgeColor(expenseTypes.find(t => t.id === formData.expense_type_id)?.name || '')}`}>
                    {expenseTypes.find(t => t.id === formData.expense_type_id)?.name}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Empleado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading || !formData.client_id}
                required
              >
                <option value="">
                  {formData.client_id ? 'Seleccionar empleado' : 'Primero selecciona un cliente'}
                </option>
                {filteredEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Factura (opcional)
            </label>

            {existingInvoice && !selectedFile && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{existingInvoice.filename}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(existingInvoice.url, '_blank')}
                    className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    disabled={loading}
                  >
                    Ver factura
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveExistingInvoice}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {selectedFile && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">{selectedFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="invoice-upload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Haz clic para subir</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG o PDF (máx. 5MB)
                  </p>
                </div>
                <input
                  id="invoice-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
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
            {expense ? 'Actualizar' : 'Crear'}
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
