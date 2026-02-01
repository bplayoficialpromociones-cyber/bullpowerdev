import { useState, useEffect } from 'react';
import { Plus, Pencil as Edit2, Trash2, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { expensesServiceExports } from '../../services/expensesService';
import { Denomination } from '../../types/games';
import { Currency } from '../../types/expenses';
import { FilterInput } from '../FilterInput';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';

type SortColumn = 'name' | 'min_bet' | 'max_bet';
type SortOrder = 'asc' | 'desc';

export function DenominationsTab() {
  const { user } = useAuth();
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDenomination, setSelectedDenomination] = useState<Denomination | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; denomination: Denomination | null }>({
    isOpen: false,
    denomination: null
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    currency_id: '',
    min_bet: 0,
    max_bet: 0,
    available_bets: [] as number[]
  });
  const [betInput, setBetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Iniciando carga de denominaciones...');

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      setLoadingProgress(30);
      setLoadingMessage('Cargando denominaciones y monedas...');

      const [denominationsData, currenciesData] = await Promise.all([
        gamesService.getDenominations(),
        expensesServiceExports.getCurrencies()
      ]);

      setLoadingProgress(90);
      setLoadingMessage('Procesando datos...');

      setDenominations(denominationsData);
      setCurrencies(currenciesData);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage('¡Listo!');

      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingMessage('');
      }, 300);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Error al cargar denominaciones', type: 'error' });
      setLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  };

  const handleEdit = (denomination: Denomination) => {
    setSelectedDenomination(denomination);
    setFormData({
      name: denomination.name,
      currency_id: denomination.currency_id,
      min_bet: denomination.min_bet,
      max_bet: denomination.max_bet,
      available_bets: denomination.available_bets
    });
    setIsModalOpen(true);
  };

  const handleDelete = (denomination: Denomination) => {
    setDeleteConfirm({ isOpen: true, denomination });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.denomination) return;
    try {
      await gamesService.deleteDenomination(deleteConfirm.denomination.id);
      setToast({ message: 'Denominación eliminada', type: 'success' });
      await loadData();
    } catch (error) {
      setToast({ message: 'Error al eliminar', type: 'error' });
    } finally {
      setDeleteConfirm({ isOpen: false, denomination: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.available_bets.length === 0) {
      setToast({ message: 'Debes agregar al menos una apuesta disponible', type: 'error' });
      return;
    }

    setSaving(true);
    setSaveProgress(0);
    setSaveMessage(selectedDenomination ? 'Actualizando denominación...' : 'Creando denominación...');

    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      setSaveProgress(30);
      setSaveMessage('Guardando información...');

      if (selectedDenomination) {
        await gamesService.updateDenomination(selectedDenomination.id, formData);
        setToast({ message: 'Denominación actualizada', type: 'success' });
      } else {
        await gamesService.createDenomination(formData);
        setToast({ message: 'Denominación creada', type: 'success' });
      }

      clearInterval(progressInterval);
      setSaveProgress(100);
      setSaveMessage('¡Listo!');

      setTimeout(async () => {
        setIsModalOpen(false);
        await loadData();
        setSaving(false);
        setSaveProgress(0);
        setSaveMessage('');
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      setSaving(false);
      setSaveProgress(0);
      setSaveMessage('');
      setToast({ message: 'Error al guardar', type: 'error' });
    }
  };

  const addBet = () => {
    const betValue = parseFloat(betInput);
    if (isNaN(betValue) || betValue <= 0) {
      setToast({ message: 'Ingresa un valor válido', type: 'error' });
      return;
    }
    if (formData.available_bets.includes(betValue)) {
      setToast({ message: 'Esta apuesta ya existe', type: 'error' });
      return;
    }
    setFormData({
      ...formData,
      available_bets: [...formData.available_bets, betValue].sort((a, b) => a - b)
    });
    setBetInput('');
  };

  const removeBet = (bet: number) => {
    setFormData({
      ...formData,
      available_bets: formData.available_bets.filter(b => b !== bet)
    });
  };

  const filteredDenominations = denominations.filter(denomination =>
    denomination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    denomination.currency?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDenominations = [...filteredDenominations].sort((a, b) => {
    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];

    if (sortColumn === 'name') {
      aValue = a.name;
      bValue = b.name;
    }

    const order = sortOrder === 'asc' ? 1 : -1;
    if (typeof aValue === 'string') {
      return aValue.localeCompare(bValue) * order;
    }
    return (aValue > bValue ? 1 : -1) * order;
  });

  const totalPages = Math.ceil(sortedDenominations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDenominations = sortedDenominations.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const canEdit = user?.role?.name === 'super_admin';

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
        <FilterInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar denominaciones..."
        />
        {canEdit && (
          <button
            onClick={() => {
              setSelectedDenomination(null);
              setFormData({
                name: '',
                currency_id: currencies[0]?.id || '',
                min_bet: 0,
                max_bet: 0,
                available_bets: []
              });
              setBetInput('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nueva Denominación
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full">
          <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-color)]">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Nombre
                  <SortIcon column="name" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Moneda
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('min_bet')}
              >
                <div className="flex items-center">
                  Apuesta Mín.
                  <SortIcon column="min_bet" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => handleSort('max_bet')}
              >
                <div className="flex items-center">
                  Apuesta Máx.
                  <SortIcon column="max_bet" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Apuestas Disponibles
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {paginatedDenominations.map((denomination) => (
              <tr key={denomination.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {denomination.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {denomination.currency?.code} ({denomination.currency?.symbol})
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {denomination.currency?.symbol} {denomination.min_bet.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {denomination.currency?.symbol} {denomination.max_bet.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {denomination.available_bets.slice(0, 5).map((bet, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-[var(--bg-elevated)] rounded border border-[var(--border-color)]"
                      >
                        {denomination.currency?.symbol} {bet}
                      </span>
                    ))}
                    {denomination.available_bets.length > 5 && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        +{denomination.available_bets.length - 5} más
                      </span>
                    )}
                  </div>
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(denomination)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(denomination)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedDenominations.length)} de{' '}
            {sortedDenominations.length} denominaciones
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {selectedDenomination ? 'Editar Denominación' : 'Nueva Denominación'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saving && (
                <div className="mb-4">
                  <ProgressBar progress={saveProgress} message={saveMessage} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Estándar ARS, Premium USD, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Moneda *
                </label>
                <select
                  required
                  value={formData.currency_id}
                  onChange={(e) => setFormData({ ...formData, currency_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Selecciona una moneda</option>
                  {currencies.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.name} ({currency.code} - {currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Apuesta Mínima *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.min_bet}
                    onChange={(e) => setFormData({ ...formData, min_bet: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Apuesta Máxima *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.max_bet}
                    onChange={(e) => setFormData({ ...formData, max_bet: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Apuestas Disponibles *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBet();
                      }
                    }}
                    className="input-field flex-1"
                    placeholder="Ej: 10, 50, 100..."
                  />
                  <button
                    type="button"
                    onClick={addBet}
                    className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.available_bets.map((bet, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[var(--bg-elevated)] rounded border border-[var(--border-color)] flex items-center gap-2"
                    >
                      <span className="text-sm">
                        {currencies.find(c => c.id === formData.currency_id)?.symbol || '$'} {bet}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBet(bet)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.available_bets.length === 0 && (
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    No hay apuestas disponibles. Agrega al menos una.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity flex-1">
                  {selectedDenomination ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.isOpen && deleteConfirm.denomination && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Denominación"
          message={`¿Estás seguro de eliminar "${deleteConfirm.denomination.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, denomination: null })}
          type="danger"
        />
      )}

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
