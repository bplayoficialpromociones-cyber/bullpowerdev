import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, X,
  CircleDot, Grid3x3, Spade, Video, Hash,
  Cherry, Sparkles, Coins, Zap, Trophy,
  Heart, Diamond, UserCircle, TrendingUp, Dices
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { Game } from '../../types/games';
import { ConfirmDialog } from '../ConfirmDialog';
import { Toast } from '../Toast';
import { ProgressBar } from '../ProgressBar';
import { GameModal } from './GameModal';

type SortColumn = 'name' | 'type' | 'rtp' | 'volatility' | 'integration_date' | 'status';
type SortOrder = 'asc' | 'desc';

interface Filters {
  name: string;
  type: string;
  rtp: string;
  volatility: string;
  integrationDate: string;
  status: string;
}

export function GamesTab() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; game: Game | null }>({ isOpen: false, game: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; game: Game | null }>({ isOpen: false, game: null });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    name: '',
    type: '',
    rtp: '',
    volatility: '',
    integrationDate: '',
    status: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Iniciando carga de juegos...');

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      setLoadingProgress(30);
      setLoadingMessage('Cargando catálogo de juegos...');

      const data = await gamesService.getGames();

      setLoadingProgress(90);
      setLoadingMessage('Procesando datos...');

      setGames(data);

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
      setToast({ message: 'Error al cargar juegos', type: 'error' });
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

  const clearFilters = () => {
    setFilters({
      name: '',
      type: '',
      rtp: '',
      volatility: '',
      integrationDate: '',
      status: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const filteredAndSortedGames = useMemo(() => {
    let filtered = games.filter(game => {
      if (filters.name && !game.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.type && !game.game_type?.name?.toLowerCase().includes(filters.type.toLowerCase())) return false;
      if (filters.rtp && game.rtp && !game.rtp.toString().includes(filters.rtp)) return false;
      if (filters.volatility && !game.volatility?.name?.toLowerCase().includes(filters.volatility.toLowerCase())) return false;
      if (filters.integrationDate && game.integration_date && !game.integration_date.includes(filters.integrationDate)) return false;
      if (filters.status && !game.status?.name?.toLowerCase().includes(filters.status.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.game_type?.name || '';
          bValue = b.game_type?.name || '';
          break;
        case 'rtp':
          aValue = a.rtp || 0;
          bValue = b.rtp || 0;
          break;
        case 'volatility':
          aValue = a.volatility?.name || '';
          bValue = b.volatility?.name || '';
          break;
        case 'integration_date':
          aValue = a.integration_date ? new Date(a.integration_date).getTime() : 0;
          bValue = b.integration_date ? new Date(b.integration_date).getTime() : 0;
          break;
        case 'status':
          aValue = a.status?.name || '';
          bValue = b.status?.name || '';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [games, filters, sortColumn, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (game: Game) => {
    setDeleteConfirm({ isOpen: true, game });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.game) return;
    try {
      await gamesService.deleteGame(deleteConfirm.game.id);
      setToast({ message: 'Juego eliminado', type: 'success' });
      await loadData();
    } catch (error) {
      setToast({ message: 'Error al eliminar', type: 'error' });
    } finally {
      setDeleteConfirm({ isOpen: false, game: null });
    }
  };

  const handleEdit = (game: Game) => {
    setEditModal({ isOpen: true, game });
  };

  const handleSave = async (gameData: Partial<Game>) => {
    try {
      if (editModal.game) {
        await gamesService.updateGame(editModal.game.id, gameData);
        setToast({ message: 'Juego actualizado correctamente', type: 'success' });
      } else {
        await gamesService.createGame(gameData);
        setToast({ message: 'Juego creado correctamente', type: 'success' });
      }
      await loadData();
      setEditModal({ isOpen: false, game: null });
    } catch (error) {
      console.error('Error al guardar:', error);
      setToast({ message: editModal.game ? 'Error al actualizar juego' : 'Error al crear juego', type: 'error' });
      throw error;
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const getStatusColor = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'con bugs':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getGameIcon = (gameTypeName?: string) => {
    const typeLower = gameTypeName?.toLowerCase() || '';
    const iconClass = "w-5 h-5 text-[var(--text-secondary)]";

    // Slots básicos (todos usan el icono Cherry)
    if (
      typeLower === 'slot' ||
      typeLower === 'classic slot' ||
      typeLower === 'slot classic' ||
      typeLower === 'video slot' ||
      typeLower.includes('slot')
    ) {
      return <Cherry className={iconClass} />;
    }

    // Slots especiales con mecánicas específicas
    if (typeLower === 'megaways') {
      return <Zap className={iconClass} />;
    }
    if (typeLower === 'cluster pays') {
      return <Coins className={iconClass} />;
    }
    if (typeLower.includes('hold') && typeLower.includes('win')) {
      return <Trophy className={iconClass} />;
    }

    // Juegos de mesa
    if (typeLower === 'ruleta' || typeLower === 'roulette') {
      return <CircleDot className={iconClass} />;
    }
    if (typeLower === 'bingo') {
      return <Grid3x3 className={iconClass} />;
    }
    if (typeLower === 'poker') {
      return <Spade className={iconClass} />;
    }
    if (typeLower === 'blackjack') {
      return <Heart className={iconClass} />;
    }
    if (typeLower === 'baccarat') {
      return <Diamond className={iconClass} />;
    }

    // Otros
    if (typeLower.includes('vivo') || typeLower.includes('live') || typeLower === 'casino en vivo') {
      return <Video className={iconClass} />;
    }
    if (typeLower === 'keno') {
      return <Hash className={iconClass} />;
    }

    return <TrendingUp className={iconClass} />;
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Filtros activos:</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => setEditModal({ isOpen: true, game: null })}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nuevo Juego
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full">
          <thead className="bg-[var(--bg-elevated)]">
            <tr className="border-b border-[var(--border-color)]">
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => handleSort('name')}
                    className="flex items-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--color-primary)]"
                  >
                    Nombre
                    <SortIcon column="name" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => handleSort('type')}
                    className="flex items-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--color-primary)]"
                  >
                    Tipo
                    <SortIcon column="type" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => handleSort('rtp')}
                    className="flex items-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--color-primary)]"
                  >
                    RTP
                    <SortIcon column="rtp" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.rtp}
                    onChange={(e) => setFilters({ ...filters, rtp: e.target.value })}
                    className="px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => handleSort('volatility')}
                    className="flex items-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--color-primary)]"
                  >
                    Volatilidad
                    <SortIcon column="volatility" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.volatility}
                    onChange={(e) => setFilters({ ...filters, volatility: e.target.value })}
                    className="px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => handleSort('integration_date')}
                    className="flex items-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--color-primary)]"
                  >
                    Integración
                    <SortIcon column="integration_date" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.integrationDate}
                    onChange={(e) => setFilters({ ...filters, integrationDate: e.target.value })}
                    className="px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => handleSort('status')}
                    className="flex items-center text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--color-primary)]"
                  >
                    Estado
                    <SortIcon column="status" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGames.map((game) => {
              return (
                <tr key={game.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                        {getGameIcon(game.game_type?.name)}
                      </div>
                      <div className="relative">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {game.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{game.game_type?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{game.rtp ? `${game.rtp}%` : '-'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{game.volatility?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {game.integration_date ? new Date(game.integration_date).toLocaleDateString('es-AR') : 'Pendiente'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status?.name)}`}>
                      {game.status?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {canEdit && (
                        <>
                          <button onClick={() => handleEdit(game)} className="p-1 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(game)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedGames.length === 0 && (
        <div className="text-center py-12">
          <Dices className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
          <p className="text-[var(--text-secondary)]">{hasActiveFilters ? 'No se encontraron juegos con los filtros aplicados' : 'No hay juegos registrados'}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
          <div className="text-sm text-[var(--text-secondary)]">
            Mostrando <span className="font-medium text-[var(--color-primary)]">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium text-[var(--color-primary)]">{Math.min(currentPage * itemsPerPage, filteredAndSortedGames.length)}</span> de <span className="font-medium text-[var(--color-primary)]">{filteredAndSortedGames.length}</span> resultados
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 hover:bg-[var(--accent-hover)]">«</button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 hover:bg-[var(--accent-hover)]">‹</button>
            <span className="px-4 py-1 text-sm font-medium bg-[var(--color-primary)] text-white rounded">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 hover:bg-[var(--accent-hover)]">›</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded border border-[var(--border-color)] disabled:opacity-50 hover:bg-[var(--accent-hover)]">»</button>
          </div>
        </div>
      )}

      <GameModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, game: null })}
        onSave={handleSave}
        game={editModal.game}
      />
      <ConfirmDialog isOpen={deleteConfirm.isOpen} title="Eliminar Juego" message={`¿Eliminar "${deleteConfirm.game?.name}"? Esta acción no se puede deshacer.`} onConfirm={confirmDelete} onCancel={() => setDeleteConfirm({ isOpen: false, game: null })} type="danger" />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
