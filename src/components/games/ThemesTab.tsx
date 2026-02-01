import { useState, useEffect } from 'react';
import { Plus, Pencil as Edit2, Trash2, Upload, Palette, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { Theme } from '../../types/games';
import { FilterInput } from '../FilterInput';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';

type SortColumn = 'name';
type SortOrder = 'asc' | 'desc';

export function ThemesTab() {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; theme: Theme | null }>({
    isOpen: false,
    theme: null
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Iniciando carga de temáticas...');

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      setLoadingProgress(30);
      setLoadingMessage('Cargando temáticas...');

      const data = await gamesService.getThemes();

      setLoadingProgress(90);
      setLoadingMessage('Procesando datos...');

      setThemes(data);

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
      setToast({ message: 'Error al cargar temáticas', type: 'error' });
      setLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  };

  const handleEdit = (theme: Theme) => {
    setSelectedTheme(theme);
    setFormData({ name: theme.name, description: theme.description || '' });
    setNewImageUrl(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (theme: Theme) => {
    setDeleteConfirm({ isOpen: true, theme });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.theme) return;
    try {
      await gamesService.deleteTheme(deleteConfirm.theme.id);
      setToast({ message: 'Temática eliminada', type: 'success' });
      await loadData();
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setDeleteConfirm({ isOpen: false, theme: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setSaveProgress(0);
    setSaveMessage(selectedTheme ? 'Actualizando temática...' : 'Creando temática...');

    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      setSaveProgress(30);
      setSaveMessage('Guardando información...');

      const dataToSave = { ...formData };
      if (newImageUrl) {
        dataToSave.thumbnail_url = newImageUrl;
      }

      if (selectedTheme) {
        await gamesService.updateTheme(selectedTheme.id, dataToSave);
        setToast({ message: 'Temática actualizada', type: 'success' });
      } else {
        await gamesService.createTheme(dataToSave);
        setToast({ message: 'Temática creada', type: 'success' });
      }

      clearInterval(progressInterval);
      setSaveProgress(100);
      setSaveMessage('¡Listo!');

      setTimeout(async () => {
        setIsModalOpen(false);
        setNewImageUrl(null);
        setImageFile(null);
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
    if (!e.target.files?.[0]) return;

    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      setImageFile(file);

      // Usar ID de la temática si existe, si no usar un ID temporal
      const themeId = selectedTheme?.id || `temp-${Date.now()}`;
      const imageUrl = await gamesService.uploadCatalogImage(file, themeId, 'theme');
      setNewImageUrl(imageUrl);

      const action = selectedTheme ? '"Actualizar"' : '"Crear"';
      setToast({ message: `Imagen cargada. Presiona ${action} para guardar los cambios.`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al subir imagen', type: 'error' });
      setImageFile(null);
      setNewImageUrl(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedThemes = [...filteredThemes].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    const order = sortOrder === 'asc' ? 1 : -1;
    return aValue > bValue ? order : -order;
  });

  const totalPages = Math.ceil(sortedThemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThemes = sortedThemes.slice(startIndex, startIndex + itemsPerPage);

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
          placeholder="Buscar temáticas..."
        />
        {canEdit && (
          <button
            onClick={() => {
              setSelectedTheme(null);
              setFormData({ name: '', description: '' });
              setNewImageUrl(null);
              setImageFile(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nueva Temática
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
              <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Juegos
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {paginatedThemes.map((theme) => (
              <tr key={theme.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {theme.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {theme.description || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {theme.thumbnail_url ? (
                    <img
                      src={theme.thumbnail_url}
                      alt={theme.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">Sin imagen</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {theme.games_count || 0}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(theme)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(theme)}
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
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedThemes.length)} de{' '}
            {sortedThemes.length} temáticas
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
                {selectedTheme ? 'Editar Temática' : 'Nueva Temática'}
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Imagen de Temática
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {(newImageUrl || selectedTheme?.thumbnail_url) && (
                      <img
                        src={newImageUrl || selectedTheme?.thumbnail_url}
                        alt={formData.name || 'Temática'}
                        className="w-20 h-20 object-cover rounded border-2 border-[var(--border-color)]"
                      />
                    )}
                    <label className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Subiendo...' : (newImageUrl ? 'Cambiar Imagen' : 'Subir Imagen')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage || saving}
                      />
                    </label>
                  </div>
                  {imageFile && (
                    <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">Archivo:</span>
                        <span>{imageFile.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium text-[var(--text-primary)]">Tamaño:</span>
                        <span>{(imageFile.size / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="mt-2 text-xs text-[var(--color-primary)]">
                        ⚠️ Presiona "{selectedTheme ? 'Actualizar' : 'Crear'}" para guardar la imagen
                      </div>
                    </div>
                  )}
                </div>
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
                  {selectedTheme ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.isOpen && deleteConfirm.theme && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Temática"
          message={`¿Estás seguro de eliminar "${deleteConfirm.theme.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, theme: null })}
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
