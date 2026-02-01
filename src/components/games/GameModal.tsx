import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Game, GameType, GameVolatility, GameStatus } from '../../types/games';
import { gamesService } from '../../services/gamesService';
import { ProgressBar } from '../ProgressBar';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: Partial<Game>) => Promise<void>;
  game: Game | null;
}

export function GameModal({ isOpen, onClose, onSave, game }: GameModalProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [volatilities, setVolatilities] = useState<GameVolatility[]>([]);
  const [statuses, setStatuses] = useState<GameStatus[]>([]);
  const [formData, setFormData] = useState<Partial<Game>>({
    name: '',
    game_type_id: '',
    rtp: undefined,
    volatility_id: '',
    status_id: '',
    integration_date: '',
    trailer_release_date: '',
    multimedia_pack_url: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCatalogs();
      if (game) {
        setFormData({
          name: game.name,
          game_type_id: game.game_type_id || '',
          rtp: game.rtp,
          volatility_id: game.volatility_id || '',
          status_id: game.status_id || '',
          integration_date: game.integration_date || '',
          trailer_release_date: game.trailer_release_date || '',
          multimedia_pack_url: game.multimedia_pack_url || '',
        });
      } else {
        setFormData({
          name: '',
          game_type_id: '',
          rtp: undefined,
          volatility_id: '',
          status_id: '',
          integration_date: '',
          trailer_release_date: '',
          multimedia_pack_url: '',
        });
      }
    }
  }, [isOpen, game]);

  const loadCatalogs = async () => {
    try {
      const [typesData, volatilitiesData, statusesData] = await Promise.all([
        gamesService.getGameTypes(),
        gamesService.getVolatilities(),
        gamesService.getGameStatuses(),
      ]);
      setGameTypes(typesData);
      setVolatilities(volatilitiesData);
      setStatuses(statusesData);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setLoading(true);
    setProgress(0);
    setProgressMessage(game ? 'Actualizando juego...' : 'Creando juego...');

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      setProgress(30);
      setProgressMessage('Guardando información...');

      const cleanData = {
        ...formData,
        integration_date: formData.integration_date || null,
        trailer_release_date: formData.trailer_release_date || null,
        multimedia_pack_url: formData.multimedia_pack_url || null,
      };

      await onSave(cleanData);

      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('¡Listo!');

      setTimeout(() => {
        onClose();
        setLoading(false);
        setProgress(0);
        setProgressMessage('');
      }, 300);
    } catch (error) {
      console.error('Error:', error);
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
      throw error;
    }
  };

  const handleChange = (field: keyof Game, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-surface)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {game ? 'Editar Juego' : 'Nuevo Juego'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading && (
            <div className="mb-4">
              <ProgressBar progress={progress} message={progressMessage} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Nombre del Juego *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tipo de Juego *
              </label>
              <select
                value={formData.game_type_id || ''}
                onChange={(e) => handleChange('game_type_id', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                disabled={loading}
                required
              >
                <option value="">Seleccionar tipo</option>
                {gameTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                RTP (%) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.rtp || ''}
                onChange={(e) => handleChange('rtp', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Volatilidad *
              </label>
              <select
                value={formData.volatility_id || ''}
                onChange={(e) => handleChange('volatility_id', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                disabled={loading}
                required
              >
                <option value="">Seleccionar volatilidad</option>
                {volatilities.map((vol) => (
                  <option key={vol.id} value={vol.id}>
                    {vol.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Estado *
              </label>
              <select
                value={formData.status_id || ''}
                onChange={(e) => handleChange('status_id', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                disabled={loading}
                required
              >
                <option value="">Seleccionar estado</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Fecha de Integración
              </label>
              <input
                type="date"
                value={formData.integration_date || ''}
                onChange={(e) => handleChange('integration_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Fecha de Trailer
              </label>
              <input
                type="date"
                value={formData.trailer_release_date || ''}
                onChange={(e) => handleChange('trailer_release_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              URL del Pack Multimedia
            </label>
            <input
              type="url"
              value={formData.multimedia_pack_url || ''}
              onChange={(e) => handleChange('multimedia_pack_url', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading || !formData.name?.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {game ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
