import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataGrid, Column } from '../DataGrid';
import { LoadingOverlay } from '../LoadingOverlay';
import { Toast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';
import { PositionModal } from './PositionModal';
import { Position } from '../../types/crm';
import { positionsService } from '../../services/crmService';
import { useAuth } from '../../contexts/AuthContext';

export function PositionsTab() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationMessage, setOperationMessage] = useState('');

  const canCreate = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canEdit = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canDelete = user?.role?.name === 'super_admin';

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      setOperationMessage('Cargando cargos...');
      setOperationProgress(30);

      const { positions: data } = await positionsService.list();

      setOperationProgress(80);
      setPositions(data || []);
      setOperationProgress(100);

      setTimeout(() => setLoading(false), 300);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cargar cargos', type: 'error' });
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setShowModal(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;

    try {
      setOperationMessage('Eliminando cargo...');
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await positionsService.delete(deletingPosition.id);

      setOperationProgress(100);
      setToast({ message: 'Cargo eliminado exitosamente', type: 'success' });
      setDeletingPosition(null);
      await loadPositions();
    } catch (error: any) {
      if (error.message.includes('empleado')) {
        setToast({ message: error.message, type: 'error' });
      } else {
        setToast({ message: error.message || 'Error al eliminar cargo', type: 'error' });
      }
      setDeletingPosition(null);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadPositions();
    setToast({
      message: editingPosition ? 'Cargo actualizado exitosamente' : 'Cargo creado exitosamente',
      type: 'success',
    });
    setEditingPosition(null);
  };

  const columns: Column<Position>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      filterable: true,
      width: '25%',
      render: (position) => (
        <div className="font-medium text-gray-900 dark:text-white">{position.name}</div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      filterable: true,
      width: '45%',
      render: (position) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {position.description || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha Creación',
      sortable: true,
      filterType: 'date',
      width: '15%',
      render: (position) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(position.created_at).toLocaleDateString('es-AR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: '10%',
      render: (position) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(position);
              }}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingPosition(position);
              }}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Listado de Cargos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {positions.length} cargo{positions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cargo
          </button>
        )}
      </div>

      <div className="relative">
        <DataGrid
          columns={columns}
          data={positions}
          loading={loading}
          loadingMessage={operationMessage}
          emptyMessage="No hay cargos registrados"
          pageSize={10}
        />
        {loading && operationProgress > 0 && (
          <LoadingOverlay message={operationMessage} progress={operationProgress} showProgress />
        )}
      </div>

      {showModal && (
        <PositionModal
          position={editingPosition}
          onClose={() => {
            setShowModal(false);
            setEditingPosition(null);
          }}
          onSave={handleSave}
        />
      )}

      {deletingPosition && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Cargo"
          message={`¿Estás seguro de que deseas eliminar el cargo "${deletingPosition.name}"?

Si hay empleados activos usando este cargo, no podrás eliminarlo. Solo podrás modificarlo.

Si no hay empleados asociados, el cargo se eliminará permanentemente.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPosition(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
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
