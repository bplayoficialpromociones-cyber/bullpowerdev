import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from 'lucide-react';
import { FilterInput } from './FilterInput';
import { LoadingOverlay } from './LoadingOverlay';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date';
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  loadingMessage?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  showFilters?: boolean;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  loadingMessage = 'Cargando datos...',
  pageSize = 25,
  onRowClick,
  emptyMessage = 'No hay datos para mostrar',
  showFilters = true,
}: DataGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const cellValue = String(row[key] || '').toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {loading && <LoadingOverlay message={loadingMessage} />}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  <div className="flex flex-col gap-2">
                    <div
                      className={`flex items-center gap-2 ${
                        column.sortable ? 'cursor-pointer select-none' : ''
                      }`}
                      onClick={() => handleSort(column.key, column.sortable)}
                    >
                      <span>{column.header}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ArrowUp
                            className={`w-3 h-3 ${
                              sortKey === column.key && sortDirection === 'asc'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 dark:text-gray-600'
                            }`}
                          />
                          <ArrowDown
                            className={`w-3 h-3 -mt-1 ${
                              sortKey === column.key && sortDirection === 'desc'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 dark:text-gray-600'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                    {showFilters && column.filterable && (
                      <FilterInput
                        value={filters[column.key] || ''}
                        onChange={(value) => handleFilterChange(column.key, value)}
                        placeholder={`Filtrar ${column.header.toLowerCase()}...`}
                        type={column.filterType}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    onRowClick
                      ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      : ''
                  } transition-colors`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mostrando <span className="text-teal-600 dark:text-teal-400 font-semibold">{startIndex + 1}</span> a{' '}
            <span className="text-teal-600 dark:text-teal-400 font-semibold">{Math.min(endIndex, sortedData.length)}</span> de{' '}
            <span className="text-teal-600 dark:text-teal-400 font-semibold">{sortedData.length}</span> resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
              title="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
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
  );
}
