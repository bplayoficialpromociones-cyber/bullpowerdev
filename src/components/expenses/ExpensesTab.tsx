import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckSquare, Square, FileText, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { LoadingOverlay } from '../LoadingOverlay';
import { Toast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';
import { ExpenseModal } from './ExpenseModal';
import { FilterInput } from '../FilterInput';
import { DateRangeSelector } from './DateRangeSelector';
import { ExpenseStatistics } from './ExpenseStatistics';
import { ExpenseCharts } from './ExpenseCharts';
import { Expense } from '../../types/expenses';
import { expensesService } from '../../services/expensesService';
import { useAuth } from '../../contexts/AuthContext';

export function ExpensesTab() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationMessage, setOperationMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const itemsPerPage = 15;

  const canCreate = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canEdit = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canDelete = user?.role?.name === 'super_admin';

  useEffect(() => {
    loadExpenses();
  }, [currentPage, searchQuery]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = useMemo(() => {
    if (!sortField) return expenses;

    return [...expenses].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'type':
          aValue = a.expense_type?.name || '';
          bValue = b.expense_type?.name || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'currency':
          aValue = a.currency?.code || '';
          bValue = b.currency?.code || '';
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'employee':
          aValue = a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '';
          bValue = b.employee ? `${b.employee.first_name} ${b.employee.last_name}` : '';
          break;
        case 'client':
          aValue = a.client?.name || '';
          bValue = b.client?.name || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [expenses, sortField, sortDirection]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setOperationMessage('Cargando gastos...');
      setOperationProgress(30);

      const { expenses: data, pagination } = await expensesService.list(currentPage, itemsPerPage, searchQuery);

      setOperationProgress(80);
      setExpenses(data || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotalCount(pagination?.total || 0);
      setOperationProgress(100);
      setSelectedIds(new Set());

      setTimeout(() => setLoading(false), 300);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cargar gastos', type: 'error' });
      setLoading(false);
    }
  };

  const loadStatistics = async (startDate: string, endDate: string) => {
    try {
      setStatsLoading(true);
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const token = localStorage.getItem('auth_token');
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/expenses-stats?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cargar estadísticas', type: 'error' });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate });
    loadStatistics(startDate, endDate);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;

    try {
      setOperationMessage('Eliminando gasto...');
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await expensesService.delete(deletingExpense.id);

      setOperationProgress(100);
      setToast({ message: 'Gasto eliminado exitosamente', type: 'success' });
      setDeletingExpense(null);
      await loadExpenses();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar gasto', type: 'error' });
      setLoading(false);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.size === 0) return;

    try {
      setOperationMessage(`Eliminando ${selectedIds.size} gasto(s)...`);
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await expensesService.deleteMultiple(Array.from(selectedIds));

      setOperationProgress(100);
      setToast({ message: `${selectedIds.size} gasto(s) eliminado(s) exitosamente`, type: 'success' });
      setDeletingMultiple(false);
      await loadExpenses();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar gastos', type: 'error' });
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setOperationMessage('Eliminando todos los gastos...');
      setOperationProgress(0);
      setLoading(true);

      const allIds = expenses.map(e => e.id);
      setOperationProgress(50);
      await expensesService.deleteMultiple(allIds);

      setOperationProgress(100);
      setToast({ message: 'Todos los gastos han sido eliminados', type: 'success' });
      setDeletingMultiple(false);
      await loadExpenses();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar gastos', type: 'error' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadExpenses();
    setToast({
      message: editingExpense ? 'Gasto actualizado exitosamente' : 'Gasto creado exitosamente',
      type: 'success',
    });
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map(e => e.id)));
    }
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getExpenseTypeBadgeColor = (typeName: string) => {
    return typeName === 'Entrada'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {loading && <LoadingOverlay message={operationMessage} progress={operationProgress} />}

      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <FilterInput
            placeholder="Buscar por nombre, descripción..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex space-x-2">
          {canDelete && selectedIds.size > 0 && (
            <button
              onClick={() => setDeletingMultiple(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Seleccionados ({selectedIds.size})
            </button>
          )}
          {canCreate && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {canDelete && (
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {selectedIds.size === expenses.length && expenses.length > 0 ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Fecha
                    <SortIcon field="date" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Tipo
                    <SortIcon field="type" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Monto
                    <SortIcon field="amount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('currency')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Moneda
                    <SortIcon field="currency" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Nombre
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('employee')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Empleado
                    <SortIcon field="employee" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('client')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Cliente
                    <SortIcon field="client" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Factura
                </th>
                {(canEdit || canDelete) && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={canDelete ? 11 : 10}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No hay gastos para mostrar
                  </td>
                </tr>
              ) : (
                sortedExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {canDelete && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelection(expense.id)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {selectedIds.has(expense.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getExpenseTypeBadgeColor(
                          expense.expense_type?.name || ''
                        )}`}
                      >
                        {expense.expense_type?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(expense.amount, expense.currency?.symbol || '$')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {expense.currency?.code || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {expense.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-xs truncate" title={expense.description}>
                        {expense.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {expense.employee
                        ? `${expense.employee.first_name} ${expense.employee.last_name}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {expense.client?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                      {expense.invoice_url ? (
                        <button
                          onClick={() => window.open(expense.invoice_url, '_blank')}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                          title="Ver factura"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingExpense(expense)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mostrando <span className="text-teal-600 dark:text-teal-400 font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> a{' '}
              <span className="text-teal-600 dark:text-teal-400 font-semibold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> de{' '}
              <span className="text-teal-600 dark:text-teal-400 font-semibold">{totalCount}</span> resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 rounded-lg bg-teal-600 dark:bg-teal-500 text-white font-semibold text-sm shadow-md">
                Página {currentPage} de {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Informes y Estadísticas
          </h2>
          <DateRangeSelector onRangeChange={handleDateRangeChange} />
        </div>

        {dateRange && (
          <>
            <ExpenseStatistics stats={stats} loading={statsLoading} />
            {stats && <ExpenseCharts stats={stats} />}
          </>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {deletingExpense && (
        <ConfirmDialog
          isOpen={true}
          type="danger"
          title="Eliminar Gasto"
          message={`¿Está seguro que desea eliminar el gasto "${deletingExpense.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setDeletingExpense(null)}
        />
      )}

      {deletingMultiple && (
        <ConfirmDialog
          isOpen={true}
          type="danger"
          title="Eliminar Gastos"
          message={
            selectedIds.size === expenses.length
              ? `¿Está seguro que desea eliminar TODOS los gastos de esta página? Esta acción no se puede deshacer.`
              : `¿Está seguro que desea eliminar ${selectedIds.size} gasto(s)? Esta acción no se puede deshacer.`
          }
          confirmText="Eliminar"
          onConfirm={handleDeleteMultiple}
          onCancel={() => setDeletingMultiple(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
