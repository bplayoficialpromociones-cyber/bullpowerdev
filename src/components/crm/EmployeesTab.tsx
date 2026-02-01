import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import { DataGrid, Column } from '../DataGrid';
import { LoadingOverlay } from '../LoadingOverlay';
import { Toast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmployeeModal } from './EmployeeModal';
import { Employee } from '../../types/crm';
import { employeesService } from '../../services/crmService';
import { useAuth } from '../../contexts/AuthContext';

export function EmployeesTab() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationMessage, setOperationMessage] = useState('');

  const canCreate = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canEdit = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';
  const canDelete = user?.role?.name === 'super_admin';

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setOperationMessage('Cargando empleados...');
      setOperationProgress(30);

      const { employees: data } = await employeesService.list();

      setOperationProgress(80);
      setEmployees(data || []);
      setOperationProgress(100);

      setTimeout(() => setLoading(false), 300);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cargar empleados', type: 'error' });
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;

    try {
      setOperationMessage('Eliminando empleado...');
      setOperationProgress(0);
      setLoading(true);

      setOperationProgress(50);
      await employeesService.delete(deletingEmployee.id);

      setOperationProgress(100);
      setToast({ message: 'Empleado eliminado exitosamente', type: 'success' });
      setDeletingEmployee(null);
      await loadEmployees();
    } catch (error: any) {
      setToast({ message: error.message || 'Error al eliminar empleado', type: 'error' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    await loadEmployees();
    setToast({
      message: editingEmployee ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente',
      type: 'success',
    });
  };

  const columns: Column<Employee>[] = [
    {
      key: 'last_name',
      header: 'Nombre Completo',
      sortable: true,
      filterable: true,
      width: '20%',
      render: (employee) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {employee.last_name}, {employee.first_name}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
      filterable: true,
      width: '18%',
      render: (employee) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">{employee.client?.name || '-'}</div>
          {employee.client?.client_type && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {employee.client.client_type.name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'positions',
      header: 'Cargos Actuales',
      width: '20%',
      render: (employee) => {
        const currentPositions = employee.positions?.filter((p) => p.is_current) || [];
        if (currentPositions.length === 0) {
          return <span className="text-gray-500 dark:text-gray-400">Sin cargo</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {currentPositions.map((ep) => (
              <span
                key={ep.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <Briefcase className="w-3 h-3 mr-1" />
                {ep.position?.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      filterable: true,
      width: '18%',
      render: (employee) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {employee.email || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha Alta',
      sortable: true,
      filterType: 'date',
      width: '12%',
      render: (employee) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(employee.created_at).toLocaleDateString('es-AR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: '12%',
      render: (employee) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(employee);
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
                setDeletingEmployee(employee);
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
            Listado de Empleados
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {employees.length} empleado{employees.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Empleado
          </button>
        )}
      </div>

      <div className="relative">
        <DataGrid
          columns={columns}
          data={employees}
          loading={loading}
          loadingMessage={operationMessage}
          onRowClick={canEdit ? handleEdit : undefined}
          emptyMessage="No hay empleados registrados"
          pageSize={10}
        />
        {loading && operationProgress > 0 && (
          <LoadingOverlay message={operationMessage} progress={operationProgress} showProgress />
        )}
      </div>

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {deletingEmployee && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Empleado"
          message={`¿Estás seguro de que deseas eliminar al empleado "${deletingEmployee.first_name} ${deletingEmployee.last_name}"? Esta acción marcará el registro como eliminado pero permanecerá en la base de datos.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEmployee(null)}
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
