import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Cherry } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { GameType } from '../../types/games';
import { FilterInput } from '../FilterInput';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';

export function GameTypesTab() {
  const { user } = useAuth();
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<GameType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: GameType | null }>({ isOpen: false, type: null });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', paylines: 0, max_payout: '', reels_rows: '', hit_frequency: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingProgress, setDeletingProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await gamesService.getGameTypes();
      setGameTypes(data);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Error al cargar tipos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedType(null);
    setFormData({ name: '', description: '', paylines: 0, max_payout: '', reels_rows: '', hit_frequency: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (type: GameType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      paylines: type.paylines || 0,
      max_payout: type.max_payout || '',
      reels_rows: type.reels_rows || '',
      hit_frequency: type.hit_frequency || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (type: GameType) => {
    setDeleteConfirm({ isOpen: true, type });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.type) return;

    const typeId = deleteConfirm.type.id;
    const typeName = deleteConfirm.type.name;
    setDeleteConfirm({ isOpen: false, type: null });

    setDeletingId(typeId);
    setDeletingProgress(0);

    const progressInterval = setInterval(() => {
      setDeletingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      await gamesService.deleteGameType(typeId);
      setDeletingProgress(100);

      setTimeout(async () => {
        await loadData();
        setDeletingId(null);
        setDeletingProgress(0);
        setToast({ message: 'Tipo eliminado', type: 'success' });
      }, 300);
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      clearInterval(progressInterval);
      setDeletingId(null);
      setDeletingProgress(0);

      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('juegos asociados') || errorMessage.includes('foreign key') || errorMessage.includes('constraint') || errorMessage.includes('violates')) {
        setToast({ message: `No se puede eliminar "${typeName}" porque tiene juegos asociados`, type: 'error' });
      } else {
        setToast({ message: error.message || 'Error al eliminar tipo', type: 'error' });
      }

      await loadData();
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setSaveProgress(0);
    setSaveMessage(selectedType ? 'Actualizando tipo...' : 'Creando tipo...');

    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const cleanData = {
        name: formData.name,
        description: formData.description || null,
        paylines: formData.paylines || null,
        max_payout: formData.max_payout || null,
        reels_rows: formData.reels_rows || null,
        hit_frequency: formData.hit_frequency || null,
      };

      setSaveProgress(30);
      setSaveMessage('Guardando información...');

      if (selectedType) {
        await gamesService.updateGameType(selectedType.id, cleanData);
        setToast({ message: 'Tipo actualizado', type: 'success' });
      } else {
        await gamesService.createGameType(cleanData);
        setToast({ message: 'Tipo creado', type: 'success' });
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
      console.error('Error al guardar:', error);
      clearInterval(progressInterval);
      setSaving(false);
      setSaveProgress(0);
      setSaveMessage('');
      setToast({ message: 'Error al guardar', type: 'error' });
    }
  };

  const filteredTypes = gameTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = user?.role?.name === 'super_admin';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-secondary)]">Cargando...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <FilterInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar tipos..." />
        {canEdit && (
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Nuevo Tipo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type) => {
          const isDeleting = deletingId === type.id;
          return (
            <div key={type.id} className={`p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg transition-all ${isDeleting ? 'opacity-75' : 'hover:shadow-lg'}`}>
              {isDeleting && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">Eliminando tipo...</span>
                    <span className="text-sm font-semibold text-green-600">{deletingProgress}%</span>
                  </div>
                  <ProgressBar progress={deletingProgress} color="green" showPercentage={false} />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">{type.name}</h3>
                {canEdit && !isDeleting && (
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(type)} className="p-1 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(type)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg">
                <Cherry className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Cantidad de Juegos:</span>
                <span className="text-lg font-bold text-[var(--color-primary)]">{type.games_count || 0}</span>
              </div>
              {type.description && <p className="text-sm text-[var(--text-secondary)] mb-3">{type.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {type.paylines !== undefined && <div><span className="text-[var(--text-secondary)]">Líneas:</span> <span className="font-medium">{type.paylines}</span></div>}
                {type.max_payout && <div><span className="text-[var(--text-secondary)]">Max:</span> <span className="font-medium">{type.max_payout}</span></div>}
                {type.reels_rows && <div><span className="text-[var(--text-secondary)]">Reels:</span> <span className="font-medium">{type.reels_rows}</span></div>}
                {type.hit_frequency && <div><span className="text-[var(--text-secondary)]">Hit:</span> <span className="font-medium">{type.hit_frequency}</span></div>}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
          <p className="text-[var(--text-secondary)]">{searchTerm ? 'No se encontraron tipos' : 'No hay tipos registrados'}</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] rounded-xl shadow-xl max-w-2xl w-full">
            <div className="border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedType ? 'Editar Tipo' : 'Nuevo Tipo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--accent-hover)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saving && (
                <div className="mb-4">
                  <ProgressBar progress={saveProgress} message={saveMessage} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Nombre *</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Líneas de Pago</label>
                  <input type="number" value={formData.paylines} onChange={(e) => setFormData({ ...formData, paylines: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Pago Máximo</label>
                  <input type="text" value={formData.max_payout} onChange={(e) => setFormData({ ...formData, max_payout: e.target.value })} placeholder="Ej: 5,000x" className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Reels x Rows</label>
                  <input type="text" value={formData.reels_rows} onChange={(e) => setFormData({ ...formData, reels_rows: e.target.value })} placeholder="Ej: 5x3" className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Hit Frequency</label>
                  <input type="text" value={formData.hit_frequency} onChange={(e) => setFormData({ ...formData, hit_frequency: e.target.value })} placeholder="Ej: 25%" className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity">{selectedType ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={deleteConfirm.isOpen} title="Eliminar Tipo" message={`¿Eliminar "${deleteConfirm.type?.name}"?`} onConfirm={confirmDelete} onCancel={() => setDeleteConfirm({ isOpen: false, type: null })} type="danger" />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
