import { useState, useEffect } from 'react';
import { Plus, Pencil as Edit2, Trash2, Upload, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { Mechanic } from '../../types/games';
import { FilterInput } from '../FilterInput';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';

type SortColumn = 'name';
type SortOrder = 'asc' | 'desc';

export function MechanicsTab() {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; mechanic: Mechanic | null }>({
    isOpen: false,
    mechanic: null
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', video_url: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
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
      setLoadingMessage('Iniciando carga de mecánicas...');

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      setLoadingProgress(30);
      setLoadingMessage('Cargando mecánicas...');

      const data = await gamesService.getMechanics();

      setLoadingProgress(90);
      setLoadingMessage('Procesando datos...');

      setMechanics(data);

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
      setToast({ message: 'Error al cargar mecánicas', type: 'error' });
      setLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  };

  const handleEdit = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setFormData({
      name: mechanic.name,
      description: mechanic.description || '',
      video_url: mechanic.video_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (mechanic: Mechanic) => {
    setDeleteConfirm({ isOpen: true, mechanic });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.mechanic) return;
    try {
      await gamesService.deleteMechanic(deleteConfirm.mechanic.id);
      setToast({ message: 'Mecánica eliminada', type: 'success' });
      await loadData();
    } catch (error) {
      setToast({ message: 'Error al eliminar', type: 'error' });
    } finally {
      setDeleteConfirm({ isOpen: false, mechanic: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setSaveProgress(0);
    setSaveMessage(selectedMechanic ? 'Actualizando mecánica...' : 'Creando mecánica...');

    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      setSaveProgress(30);
      setSaveMessage('Guardando información...');

      if (selectedMechanic) {
        await gamesService.updateMechanic(selectedMechanic.id, formData);
        setToast({ message: 'Mecánica actualizada', type: 'success' });
      } else {
        await gamesService.createMechanic(formData);
        setToast({ message: 'Mecánica creada', type: 'success' });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedMechanic) return;

    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      const imageUrl = await gamesService.uploadCatalogImage(file, selectedMechanic.id, 'mechanic');

      await gamesService.updateMechanic(selectedMechanic.id, { thumbnail_url: imageUrl });
      setToast({ message: 'Imagen subida correctamente', type: 'success' });
      await loadData();
    } catch (error) {
      setToast({ message: 'Error al subir imagen', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredMechanics = mechanics.filter(mechanic =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    const order = sortOrder === 'asc' ? 1 : -1;
    return aValue > bValue ? order : -order;
  });

  const totalPages = Math.ceil(sortedMechanics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMechanics = sortedMechanics.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = () => {
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
          placeholder="Buscar mecánicas..."
        />
        {canEdit && (
          <button
            onClick={() => {
              setSelectedMechanic(null);
              setFormData({ name: '', description: '', video_url: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nueva Mecánica
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full">
          <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-color)]">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <div className="flex items-center">
                  Nombre
                  <SortIcon />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Video
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {paginatedMechanics.map((mechanic) => (
              <tr key={mechanic.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {mechanic.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {mechanic.description || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {mechanic.thumbnail_url ? (
                    <img
                      src={mechanic.thumbnail_url}
                      alt={mechanic.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">Sin imagen</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {mechanic.video_url ? (
                    <a
                      href={mechanic.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline text-sm"
                    >
                      Ver video
                    </a>
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">Sin video</span>
                  )}
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(mechanic)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mechanic)}
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
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedMechanics.length)} de{' '}
            {sortedMechanics.length} mecánicas
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
                {selectedMechanic ? 'Editar Mecánica' : 'Nueva Mecánica'}
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
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Ej: Free Spins, Multiplicadores, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Describe cómo funciona esta mecánica..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  URL de Video
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {selectedMechanic && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Imagen de Mecánica
                  </label>
                  <div className="flex items-center gap-4">
                    {selectedMechanic.thumbnail_url && (
                      <img
                        src={selectedMechanic.thumbnail_url}
                        alt={selectedMechanic.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <label className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity flex-1">
                  {selectedMechanic ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.isOpen && deleteConfirm.mechanic && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Mecánica"
          message={`¿Estás seguro de eliminar "${deleteConfirm.mechanic.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, mechanic: null })}
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
