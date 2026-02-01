import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckSquare, Square, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { LoadingOverlay } from '../LoadingOverlay';
import { Toast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';
import { CurrencyModal } from './CurrencyModal';
import { FilterInput } from '../FilterInput';
import { Currency } from '../../types/expenses';
import { currenciesService } from '../../services/expensesService';
import { useAuth } from '../../contexts/AuthContext';

export function CurrenciesTab() {
  const { user } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [deletingCurrency, setDeletingCurrency] = useState<Currency | null>(null);
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
  const itemsPerPage = 15;

  const canCreate = user?.role?.name === 'super_admin';
  const canEdit = user?.role?.name === 'super_admin';
  const canDelete = user?.role?.name === 'super_admin';

  useEffect(() => {
    loadCurrencies();
  }, [currentPage, searchQuery]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCurrencies = useMemo(() => {
    if (!sortField) return currencies;

    return [...currencies].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [currencies, sortField, sortDirection]);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setOperationMessage('Cargando monedas...');
      setOperationProgress(30);

      const { currencies: data, pagination } = await currenciesService.list(
        currentPage,
        itemsPerPage,
        searchQuery
      );

      setOperationProgress(80);
      setCurrencies(data || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotalCount(pagination?.total || 0);
      setOperationProgress(100);
      setSelectedIds(new Set());

      setTimeout(() => setLoading(false), 300);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cargar monedas', type: 'error' });
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditingCurrency(null);
    setShowModal(true);
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCurrency) return;

    try {
      setOperationMessage('Eliminando moneda...');
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await currenciesService.delete(deletingCurrency.id);

      setOperationProgress(100);
      setToast({ message: 'Moneda eliminada exitosamente', type: 'success' });
      setDeletingCurrency(null);
      await loadCurrencies();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar moneda', type: 'error' });
      setLoading(false);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.size === 0) return;

    try {
      setOperationMessage(`Eliminando ${selectedIds.size} moneda(s)...`);
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await currenciesService.deleteMultiple(Array.from(selectedIds));

      setOperationProgress(100);
      setToast({ message: `${selectedIds.size} moneda(s) eliminada(s) exitosamente`, type: 'success' });
      setDeletingMultiple(false);
      await loadCurrencies();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar monedas', type: 'error' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadCurrencies();
    setToast({
      message: editingCurrency ? 'Moneda actualizada exitosamente' : 'Moneda creada exitosamente',
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
    if (selectedIds.size === currencies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currencies.map((c) => c.id)));
    }
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
            placeholder="Buscar por código, nombre o símbolo..."
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
              Eliminar Seleccionadas ({selectedIds.size})
            </button>
          )}
          {canCreate && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Moneda
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
                      {selectedIds.size === currencies.length && currencies.length > 0 ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('code')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Código
                    <SortIcon field="code" />
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
                  <button
                    onClick={() => handleSort('symbol')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Símbolo
                    <SortIcon field="symbol" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ejemplo
                </th>
                {(canEdit || canDelete) && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currencies.length === 0 ? (
                <tr>
                  <td
                    colSpan={canDelete ? 6 : 5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No hay monedas para mostrar
                  </td>
                </tr>
              ) : (
                sortedCurrencies.map((currency) => (
                  <tr
                    key={currency.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {canDelete && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelection(currency.id)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {selectedIds.has(currency.id) ? (
                            <CheckSquare className="h-5 w-5 text-teal-600" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {currency.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {currency.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      <span className="text-lg">{currency.symbol}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {currency.symbol} 1,234.56
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(currency)}
                              className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingCurrency(currency)}
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

      {showModal && (
        <CurrencyModal
          currency={editingCurrency}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {deletingCurrency && (
        <ConfirmDialog
          isOpen={true}
          type="danger"
          title="Eliminar Moneda"
          message={`¿Está seguro que desea eliminar la moneda "${deletingCurrency.name}" (${deletingCurrency.code})? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setDeletingCurrency(null)}
        />
      )}

      {deletingMultiple && (
        <ConfirmDialog
          isOpen={true}
          type="danger"
          title="Eliminar Monedas"
          message={`¿Está seguro que desea eliminar ${selectedIds.size} moneda(s)? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDeleteMultiple}
          onCancel={() => setDeletingMultiple(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
