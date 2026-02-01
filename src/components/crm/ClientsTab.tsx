import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { DataGrid, Column } from '../DataGrid';
import { LoadingOverlay } from '../LoadingOverlay';
import { Toast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';
import { ClientModal } from './ClientModal';
import { Client } from '../../types/crm';
import { clientsService } from '../../services/crmService';
import { useAuth } from '../../contexts/AuthContext';

export function ClientsTab() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationMessage, setOperationMessage] = useState('');

  const canCreate = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canEdit = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canDelete = user?.role?.name === 'super_admin';

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setOperationMessage('Cargando clientes...');
      setOperationProgress(30);

      const { clients: data } = await clientsService.list();

      setOperationProgress(80);
      setClients(data || []);
      setOperationProgress(100);

      setTimeout(() => setLoading(false), 300);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cargar clientes', type: 'error' });
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingClient) return;

    try {
      setOperationMessage('Eliminando cliente...');
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await clientsService.delete(deletingClient.id);

      setOperationProgress(100);
      setToast({ message: 'Cliente eliminado exitosamente', type: 'success' });
      setDeletingClient(null);
      await loadClients();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar cliente', type: 'error' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadClients();
    setToast({
      message: editingClient ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente',
      type: 'success',
    });
  };

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      filterable: true,
      width: '20%',
      render: (client) => (
        <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
      ),
    },
    {
      key: 'client_type',
      header: 'Tipo',
      sortable: true,
      filterable: true,
      width: '10%',
      render: (client) => {
        const typeName = client.client_type?.name || '-';
        let colorClasses = '';

        switch (typeName.toLowerCase()) {
          case 'operador':
            colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
            break;
          case 'fabricante':
            colorClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200';
            break;
          case 'agregador':
            colorClasses = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200';
            break;
          default:
            colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
            {typeName}
          </span>
        );
      },
    },
    {
      key: 'cuit_condicion_legal',
      header: 'CUIT',
      sortable: true,
      filterable: true,
      width: '12%',
      render: (client) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {client.cuit_condicion_legal || '-'}
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Dirección',
      filterable: true,
      width: '23%',
      render: (client) => {
        if (!client.address) return <span className="text-gray-500 dark:text-gray-400">-</span>;
        return (
          <div className="text-sm">
            <div className="text-gray-900 dark:text-white">
              {client.address.street} {client.address.number}
              {client.address.floor && `, Piso ${client.address.floor}`}
              {client.address.apartment && `, Depto ${client.address.apartment}`}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {client.address.state?.name}, {client.address.country?.name}
            </div>
          </div>
        );
      },
    },
    {
      key: 'anniversary_date',
      header: 'Aniversario',
      sortable: true,
      filterType: 'date',
      width: '12%',
      render: (client) =>
        client.anniversary_date ? (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            {new Date(client.anniversary_date).toLocaleDateString('es-AR')}
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Fecha Alta',
      sortable: true,
      filterType: 'date',
      width: '12%',
      render: (client) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(client.created_at).toLocaleDateString('es-AR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: '15%',
      render: (client) => (
        <div className="flex items-center gap-2">
          {client.address?.google_maps_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(client.address!.google_maps_url, '_blank');
              }}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Ver en Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(client);
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
                setDeletingClient(client);
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
            Listado de Clientes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {clients.length} cliente{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        )}
      </div>

      <div className="relative">
        <DataGrid
          columns={columns}
          data={clients}
          loading={loading}
          loadingMessage={operationMessage}
          onRowClick={canEdit ? handleEdit : undefined}
          emptyMessage="No hay clientes registrados"
          pageSize={10}
        />
        {loading && operationProgress > 0 && (
          <LoadingOverlay message={operationMessage} progress={operationProgress} showProgress />
        )}
      </div>

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {deletingClient && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Cliente"
          message={`¿Estás seguro de que deseas eliminar el cliente "${deletingClient.name}"?

IMPORTANTE: Esta acción también eliminará todos los empleados asociados a este cliente. Los registros se marcarán como eliminados pero permanecerán en la base de datos.

Podrás volver a crear este cliente en el futuro si lo necesitas.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingClient(null)}
          confirmText="Eliminar Cliente y Empleados"
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
