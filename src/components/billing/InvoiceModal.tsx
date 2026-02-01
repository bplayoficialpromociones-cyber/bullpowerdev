import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { billingService } from '../../services/billingService';
import { crmService } from '../../services/crmService';
import { expensesServiceExports } from '../../services/expensesService';
import { supabase } from '../../lib/supabase';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../types/billing';
import { Client } from '../../types/crm';
import { Currency } from '../../types/expenses';
import { CurrencySelector } from './CurrencySelector';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: () => void;
}

export function InvoiceModal({ invoice, onClose, onSave }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [statuses, setStatuses] = useState<InvoiceStatus[]>([]);

  const [formData, setFormData] = useState({
    client_id: invoice?.client_id || '',
    invoice_date: invoice?.invoice_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    status_id: invoice?.status_id || '',
    currency_id: invoice?.currency_id || '',
    description: invoice?.description || '',
  });

  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    invoice?.items || [{ description: '', quantity: 1, unit_price: 0, subtotal: 0 }]
  );

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setLoadingCatalogs(true);
      const [clientsData, currenciesData, statusesData] = await Promise.all([
        crmService.getClients().catch(() => []),
        expensesServiceExports.getCurrencies().catch(() => []),
        billingService.getInvoiceStatuses().catch(() => []),
      ]);

      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      const currenciesArray = Array.isArray(currenciesData) ? currenciesData : [];
      const statusesArray = Array.isArray(statusesData) ? statusesData : [];

      setClients(clientsArray);
      setCurrencies(currenciesArray);
      setStatuses(statusesArray);

      if (!invoice && currenciesArray.length > 0) {
        const arsDefault = currenciesArray.find(c => c.code === 'ARS');
        if (arsDefault) {
          setFormData(prev => ({ ...prev, currency_id: arsDefault.id }));
        }
      }

      if (!invoice && statusesArray.length > 0) {
        const pendienteStatus = statusesArray.find(s => s.name === 'Pendiente de Pago');
        if (pendienteStatus) {
          setFormData(prev => ({ ...prev, status_id: pendienteStatus.id }));
        }
      }
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      setClients([]);
      setCurrencies([]);
      setStatuses([]);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, subtotal: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity || 0;
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : newItems[index].unit_price || 0;
      newItems[index].subtotal = quantity * unitPrice;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError('');

    if (file.type !== 'application/pdf') {
      setPdfError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfError('El archivo no debe superar los 10MB');
      return;
    }

    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0 || items.some(item => !item.description || item.quantity === 0)) {
      setToast({ message: 'Debes agregar al menos un item válido', type: 'error' });
      return;
    }

    setLoading(true);
    setProgress(0);
    setProgressMessage('');

    try {
      const totalAmount = calculateTotal();
      let invoiceFileUrl = invoice?.invoice_file_url;

      const invoiceData = {
        ...formData,
        amount: totalAmount,
      };

      let savedInvoice: Invoice;

      setProgress(10);
      setProgressMessage(invoice ? 'Actualizando factura...' : 'Creando factura...');

      if (invoice) {
        savedInvoice = await billingService.updateInvoice(
          invoice.id,
          invoiceData,
          items as Partial<InvoiceItem>[]
        );
        setProgress(50);
      } else {
        savedInvoice = await billingService.createInvoice(
          invoiceData,
          items as Partial<InvoiceItem>[]
        );
        setProgress(50);
      }

      if (pdfFile) {
        setProgressMessage('Subiendo archivo PDF...');
        setProgress(60);

        invoiceFileUrl = await billingService.uploadInvoicePDF(pdfFile, savedInvoice.id);
        setProgress(80);

        setProgressMessage('Actualizando información de factura...');
        const { data: currentInvoice } = await supabase
          .from('billing_invoices')
          .select('*, items:billing_invoice_items(*)')
          .eq('id', savedInvoice.id)
          .single();

        await billingService.updateInvoice(
          savedInvoice.id,
          { invoice_file_url: invoiceFileUrl },
          currentInvoice?.items || []
        );
        setProgress(95);
      } else {
        setProgress(95);
      }

      setProgressMessage('Finalizando...');
      setProgress(100);

      setTimeout(() => {
        onSave();
      }, 300);
    } catch (error: any) {
      console.error('Error al guardar factura:', error);
      setProgress(0);
      setProgressMessage('');
      setToast({
        message: error?.message || 'Error al guardar la factura. Por favor, intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setProgressMessage('');
      }, 500);
    }
  };

  const selectedCurrency = currencies.find(c => c.id === formData.currency_id);

  const getStatusColor = (statusName?: string): string => {
    switch (statusName) {
      case 'Cobrada':
        return '#d1fae5';
      case 'Pendiente de Pago':
        return '#fef3c7';
      case 'No cobrada':
        return '#fecaca';
      case 'Rechazada':
        return '#e5e7eb';
      default:
        return 'transparent';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-surface)] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {invoice ? 'Editar Factura' : 'Nueva Factura'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--accent-hover)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Cliente *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="">Seleccionar cliente</option>
                {Array.isArray(clients) && clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Moneda *
              </label>
              {loadingCatalogs ? (
                <div className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-[var(--text-secondary)]">Cargando monedas...</span>
                </div>
              ) : (
                <CurrencySelector
                  value={formData.currency_id}
                  onChange={(currencyId) => setFormData({ ...formData, currency_id: currencyId })}
                  currencies={currencies}
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Estado *
              </label>
              {loadingCatalogs ? (
                <div className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-[var(--text-secondary)]">Cargando estados...</span>
                </div>
              ) : (
                <select
                  required
                  value={formData.status_id}
                  onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  style={{
                    backgroundColor: formData.status_id ? getStatusColor(statuses.find(s => s.id === formData.status_id)?.name) : undefined,
                    color: formData.status_id ? '#000' : undefined,
                    fontWeight: formData.status_id ? '600' : undefined
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Seleccionar estado</option>
                  {Array.isArray(statuses) && statuses.map((status) => (
                    <option
                      key={status.id}
                      value={status.id}
                      style={{
                        backgroundColor: getStatusColor(status.name),
                        color: '#000',
                        fontWeight: '600',
                        padding: '8px'
                      }}
                    >
                      {status.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Descripción General
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Descripción opcional de la factura..."
            />
          </div>

          <div className="border-t border-[var(--border-color)] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Items de Factura
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Agregar Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-color)]">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Descripción *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        placeholder="Ej: Desarrollo web frontend..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Precio Unit. *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 pt-6">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {selectedCurrency?.symbol || '$'} {(item.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Eliminar item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-[var(--color-primary)]/10 rounded-lg border-2 border-[var(--color-primary)]">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[var(--text-primary)]">Total Factura:</span>
                <span className="text-2xl font-bold text-[var(--color-primary)]">
                  {selectedCurrency?.symbol || '$'} {calculateTotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-6">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Archivo PDF de Factura
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg cursor-pointer hover:bg-[var(--accent-hover)] transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Seleccionar PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {pdfFile && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                  {pdfFile.name}
                </div>
              )}
              {invoice?.invoice_file_url && !pdfFile && (
                <a
                  href={invoice.invoice_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Ver PDF actual
                </a>
              )}
            </div>
            {pdfError && <p className="text-sm text-red-600 mt-2">{pdfError}</p>}
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Máximo 10MB. Solo archivos PDF.
            </p>
            {loading && progress > 0 && (
              <div className="mt-4">
                <ProgressBar
                  progress={progress}
                  message={progressMessage}
                  showPercentage={true}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Guardando...' : invoice ? 'Actualizar' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
