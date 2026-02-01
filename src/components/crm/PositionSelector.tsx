import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Position } from '../../types/crm';

interface PositionSelectorProps {
  positions: Position[];
  selectedPositionIds: string[];
  onAdd: (positionId: string) => void;
  onRemove: (positionId: string) => void;
  onRemoveAll: () => void;
}

export function PositionSelector({
  positions,
  selectedPositionIds,
  onAdd,
  onRemove,
  onRemoveAll,
}: PositionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPositions = useMemo(() => {
    const available = positions.filter((p) => !selectedPositionIds.includes(p.id));
    if (!searchTerm.trim()) return available;

    const search = searchTerm.toLowerCase();
    return available.filter((p) => p.name.toLowerCase().includes(search));
  }, [positions, selectedPositionIds, searchTerm]);

  const selectedPositions = useMemo(() => {
    return positions.filter((p) => selectedPositionIds.includes(p.id));
  }, [positions, selectedPositionIds]);

  const handleAddPosition = (positionId: string) => {
    onAdd(positionId);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cargo..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      {searchTerm && filteredPositions.length > 0 && (
        <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
          {filteredPositions.map((position) => (
            <button
              key={position.id}
              type="button"
              onClick={() => handleAddPosition(position.id)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              {position.name}
            </button>
          ))}
        </div>
      )}

      {selectedPositions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cargos Seleccionados ({selectedPositions.length})
            </h4>
            <button
              type="button"
              onClick={onRemoveAll}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
            >
              Eliminar todos
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedPositions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {position.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(position.id)}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPositions.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No hay cargos seleccionados. Busque y seleccione cargos arriba.
        </p>
      )}
    </div>
  );
}
