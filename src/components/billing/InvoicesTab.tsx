import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil as Edit2, Trash2, FileText, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { billingService } from '../../services/billingService';
import { Invoice, InvoiceStatus } from '../../types/billing';
import { Client } from '../../types/crm';
import { FilterInput } from '../FilterInput';
import { InvoiceModal } from './InvoiceModal';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';

type SortColumn = 'invoice_date' | 'invoice_number' | 'client' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

export function InvoicesTab() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('invoice_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; invoice: Invoice | null }>({
    isOpen: false,
    invoice: null,
  });
  const [deleteMultipleConfirm, setDeleteMultipleConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Iniciando carga de facturas...');

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      setLoadingProgress(30);
      setLoadingMessage('Cargando facturas...');

      const [invoicesData, statusesData] = await Promise.all([
        billingService.getInvoices().catch(() => []),
        billingService.getInvoiceStatuses().catch(() => []),
      ]);

      setLoadingProgress(90);
      setLoadingMessage('Procesando datos...');

      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setStatuses(Array.isArray(statusesData) ? statusesData : []);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage('¡Listo!');

      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingMessage('');
      }, 300);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setToast({ message: 'Error al cargar facturas', type: 'error' });
      setInvoices([]);
      setStatuses([]);
      setLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.invoice_number.toString().includes(searchLower) ||
        invoice.client?.name?.toLowerCase().includes(searchLower) ||
        invoice.status?.name?.toLowerCase().includes(searchLower) ||
        invoice.amount.toString().includes(searchLower) ||
        invoice.description?.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'invoice_date':
          aValue = new Date(a.invoice_date).getTime();
          bValue = new Date(b.invoice_date).getTime();
          break;
        case 'invoice_number':
          aValue = a.invoice_number;
          bValue = b.invoice_number;
          break;
        case 'client':
          aValue = a.client?.name || '';
          bValue = b.client?.name || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status?.name || '';
          bValue = b.status?.name || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invoices, searchTerm, sortColumn, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredAndSortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setDeleteConfirm({ isOpen: true, invoice });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.invoice) return;

    try {
      await billingService.deleteInvoice(deleteConfirm.invoice.id);
      setToast({ message: 'Factura eliminada correctamente', type: 'success' });
      await loadData();
    } catch (error) {
      setToast({ message: 'Error al eliminar factura', type: 'error' });
    } finally {
      setDeleteConfirm({ isOpen: false, invoice: null });
    }
  };

  const handleSelectAll = () => {
    if (selectedInvoiceIds.size === paginatedInvoices.length) {
      setSelectedInvoiceIds(new Set());
    } else {
      const allIds = new Set(paginatedInvoices.map(inv => inv.id));
      setSelectedInvoiceIds(allIds);
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoiceIds);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoiceIds(newSelected);
  };

  const handleDeleteMultiple = () => {
    if (selectedInvoiceIds.size === 0) return;
    setDeleteMultipleConfirm(true);
  };

  const confirmDeleteMultiple = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Eliminando facturas...');

      const totalToDelete = selectedInvoiceIds.size;
      let deleted = 0;

      for (const invoiceId of Array.from(selectedInvoiceIds)) {
        await billingService.deleteInvoice(invoiceId);
        deleted++;
        setLoadingProgress(Math.round((deleted / totalToDelete) * 100));
      }

      setLoadingProgress(100);
      setToast({
        message: `${totalToDelete} factura${totalToDelete > 1 ? 's' : ''} eliminada${totalToDelete > 1 ? 's' : ''} correctamente`,
        type: 'success'
      });
      setSelectedInvoiceIds(new Set());
      await loadData();
    } catch (error) {
      setToast({ message: 'Error al eliminar facturas', type: 'error' });
      setLoading(false);
    } finally {
      setDeleteMultipleConfirm(false);
    }
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    setToast({ message: selectedInvoice ? 'Factura actualizada' : 'Factura creada', type: 'success' });
    await loadData();
  };

  const formatCurrency = (amount: number, currencySymbol?: string) => {
    return `${currencySymbol || '$'} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusColor = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case 'cobrada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pendiente de pago':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'no cobrada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'rechazada':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const canEdit = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8">
        <div className="w-full max-w-md">
          <ProgressBar progress={loadingProgress} message={loadingMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <FilterInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por número, cliente, estado o monto..."
          />
          {selectedInvoiceIds.size > 0 && user?.role?.name === 'super_admin' && (
            <button
              onClick={handleDeleteMultiple}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedInvoiceIds.size})
            </button>
          )}
        </div>
        {canEdit && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              {user?.role?.name === 'super_admin' && (
                <th className="px-4 py-3 text-center" style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedInvoices.length > 0 && selectedInvoiceIds.size === paginatedInvoices.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                  />
                </th>
              )}
              <th
                onClick={() => handleSort('invoice_date')}
                className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
              >
                <div className="flex items-center">
                  Fecha
                  <SortIcon column="invoice_date" />
                </div>
              </th>
              <th
                onClick={() => handleSort('invoice_number')}
                className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
              >
                <div className="flex items-center">
                  Nº Factura
                  <SortIcon column="invoice_number" />
                </div>
              </th>
              <th
                onClick={() => handleSort('client')}
                className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
              >
                <div className="flex items-center">
                  Cliente
                  <SortIcon column="client" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                Moneda
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
              >
                <div className="flex items-center justify-end">
                  Monto
                  <SortIcon column="amount" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
              >
                <div className="flex items-center">
                  Estado
                  <SortIcon column="status" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">
                Factura
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-[var(--border-color)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                {user?.role?.name === 'super_admin' && (
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.has(invoice.id)}
                      onChange={() => handleSelectInvoice(invoice.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                  {formatDate(invoice.invoice_date)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  #{invoice.invoice_number}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                  {invoice.client?.name}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                  {invoice.currency?.code}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--text-primary)]">
                  {formatCurrency(invoice.amount, invoice.currency?.symbol)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status?.name)}`}>
                    {invoice.status?.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {invoice.invoice_file_url ? (
                    <a
                      href={invoice.invoice_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-[var(--text-secondary)] text-xs">Sin PDF</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="p-1 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user?.role?.name === 'super_admin' && (
                          <button
                            onClick={() => handleDelete(invoice)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
          <p className="text-[var(--text-secondary)]">
            {searchTerm ? 'No se encontraron facturas' : 'No hay facturas registradas'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
          <div className="text-sm text-[var(--text-secondary)]">
            Mostrando{' '}
            <span className="font-medium text-[var(--color-primary)]">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            a{' '}
            <span className="font-medium text-[var(--color-primary)]">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}
            </span>{' '}
            de{' '}
            <span className="font-medium text-[var(--color-primary)]">
              {filteredAndSortedInvoices.length}
            </span>{' '}
            resultados
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
            >
              ‹
            </button>
            <span className="px-4 py-1 text-sm font-medium bg-[var(--color-primary)] text-white rounded">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Eliminar Factura"
        message={`¿Estás seguro de que deseas eliminar la factura #${deleteConfirm.invoice?.invoice_number}? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, invoice: null })}
        type="danger"
      />

      <ConfirmDialog
        isOpen={deleteMultipleConfirm}
        title="Eliminar Facturas Seleccionadas"
        message={`¿Estás seguro de que deseas eliminar ${selectedInvoiceIds.size} factura${selectedInvoiceIds.size > 1 ? 's' : ''}? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeleteMultiple}
        onCancel={() => setDeleteMultipleConfirm(false)}
        type="danger"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
