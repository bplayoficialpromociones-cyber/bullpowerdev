import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Shield, Lock, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight, Ban, Unlock } from 'lucide-react';
import { AdminUser } from '../types/auth';
import { TwoFactorModal } from '../components/TwoFactorModal';
import { Toast, ToastType } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    secret: string;
    qrCodeUrl: string;
    userEmail: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isSuperAdmin = currentUser?.role?.name === 'super_admin';

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmDialog({ isOpen: true, message, onConfirm, type });
  };

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role_id: '',
    is_active: true,
  });

  useEffect(() => {
    loadUsers();
    loadRoles();

    const refreshInterval = setInterval(() => {
      loadUsers();
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.role?.display_name?.toLowerCase().includes(searchLower) ||
        user.role?.name?.toLowerCase().includes(searchLower) ||
        user.last_login_ip?.toLowerCase().includes(searchLower) ||
        user.last_login_city?.toLowerCase().includes(searchLower) ||
        user.last_login_state?.toLowerCase().includes(searchLower) ||
        user.last_login_country?.toLowerCase().includes(searchLower) ||
        (user.is_active ? 'activo' : 'inactivo').includes(searchLower) ||
        (user.two_factor_enabled ? 'habilitado' : 'deshabilitado').includes(searchLower) ||
        (user.is_online ? 'conectado' : 'desconectado').includes(searchLower) ||
        (user.is_blocked ? 'bloqueado' : 'desbloqueado').includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      // Simular progreso mientras cargamos
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await response.json();

      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (data.success) {
        const sortedUsers = (data.users || []).sort((a: any, b: any) => {
          if (a.is_online && !b.is_online) return -1;
          if (!a.is_online && b.is_online) return 1;
          return 0;
        });
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      }

      // Limpiar la barra de progreso después de un momento
      setTimeout(() => setLoadingProgress(0), 500);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoadingProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-roles`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', user?: any) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        full_name: user.full_name,
        password: '',
        role_id: user.role_id,
        is_active: user.is_active,
      });
    } else {
      setFormData({
        email: '',
        full_name: '',
        password: '',
        role_id: roles[0]?.id || '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      password: '',
      role_id: '',
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = modalMode === 'create'
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users-create`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users-update`;

      const body = modalMode === 'create'
        ? formData
        : { id: selectedUser.id, ...formData };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        await loadUsers();
        handleCloseModal();
        showToast(
          modalMode === 'create' ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente',
          'success'
        );
      } else {
        showToast(data.error || 'Error al guardar usuario', 'error');
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (userId: string) => {
    showConfirm(
      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users-delete`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ id: userId }),
            }
          );

          const data = await response.json();

          if (data.success) {
            await loadUsers();
            showToast('Usuario eliminado exitosamente', 'success');
          } else {
            showToast(data.error || 'Error al eliminar usuario', 'error');
          }
        } catch (error) {
          showToast('Error de conexión', 'error');
        } finally {
          setIsLoading(false);
        }
      },
      'danger'
    );
  };

  const handleToggle2FA = (user: any) => {
    const action = user.two_factor_enabled ? 'disable' : 'enable';

    const performToggle = async () => {
      setProcessingUsers(prev => new Set(prev).add(user.id));

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-2fa-manage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              userId: user.id,
              action
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          if (action === 'enable') {
            setTwoFactorData({
              secret: data.secret,
              qrCodeUrl: data.qrCodeUrl,
              userEmail: user.email
            });
            setShow2FAModal(true);
          } else {
            showToast('Autenticación 2FA desactivada exitosamente', 'success');
          }
          await loadUsers();
        } else {
          showToast(data.error || 'Error al modificar 2FA', 'error');
        }
      } catch (error) {
        showToast('Error de conexión', 'error');
      } finally {
        setProcessingUsers(prev => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
      }
    };

    if (action === 'disable') {
      showConfirm(
        '¿Estás seguro de que deseas desactivar 2FA para este usuario?',
        performToggle,
        'warning'
      );
    } else {
      performToggle();
    }
  };

  const handleBlockUser = (user: any) => {
    const isBlocking = !user.is_blocked;
    const action = isBlocking ? 'bloquear' : 'desbloquear';

    showConfirm(
      `¿Estás seguro de que deseas ${action} este usuario?${isBlocking ? ' El usuario será desconectado automáticamente.' : ''}`,
      async () => {
        setProcessingUsers(prev => new Set(prev).add(user.id));

        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users-block`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                userId: user.id,
                currentUserId: currentUser?.id,
                block: isBlocking
              }),
            }
          );

          const data = await response.json();

          if (data.success) {
            await loadUsers();
            showToast(data.message, 'success');
          } else {
            showToast(data.error || `Error al ${action} usuario`, 'error');
          }
        } catch (error) {
          showToast('Error de conexión', 'error');
        } finally {
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(user.id);
            return next;
          });
        }
      },
      isBlocking ? 'danger' : 'info'
    );
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Usuarios Admin
          </h1>
          <p className="text-[var(--text-secondary)]">
            Gestiona los usuarios del sistema administrativo
          </p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Usuario
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por email, nombre, rol, IP, ubicación, estado, bloqueado..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {loadingProgress > 0 && loadingProgress < 100 && (
          <div className="p-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Cargando usuarios...
              </span>
              <span className="text-sm font-bold text-[var(--color-primary)]">
                {loadingProgress}%
              </span>
            </div>
            <div className="relative h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-color)]">
              <div
                className="absolute top-0 left-0 h-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px]">
            <thead className="bg-[var(--bg-primary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Conexión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  2FA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {currentUsers.map((user) => {
                const isProcessing = processingUsers.has(user.id);
                const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;
                const lastLoginFormatted = lastLogin ?
                  `${lastLogin.toLocaleDateString('es-AR')} ${lastLogin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` :
                  'Nunca';

                return (
                  <tr key={user.id} className="hover:bg-[var(--bg-primary)] transition-colors relative">
                    {isProcessing && (
                      <td colSpan={9} className="absolute inset-0 bg-[var(--bg-primary)]/50 z-10">
                        <div className="h-full flex items-center justify-center">
                          <div className="bg-[var(--bg-surface)] rounded-lg p-4 shadow-lg border border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-medium text-[var(--text-primary)]">
                                Procesando...
                              </span>
                            </div>
                            <div className="mt-2 w-48 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--color-primary)] animate-pulse" style={{ width: '100%' }} />
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {user.full_name}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Shield className="w-3 h-3" />
                        {user.role?.display_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {lastLoginFormatted}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        user.is_online
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                          : 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}>
                        <span className={`relative w-2 h-2 rounded-full ${
                          user.is_online ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {user.is_online && (
                            <>
                              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                              <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse" />
                            </>
                          )}
                        </span>
                        {user.is_online ? 'Conectado' : 'Desconectado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.two_factor_enabled
                          ? 'badge-enabled'
                          : 'badge-disabled'
                      }`}>
                        {user.two_factor_enabled ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'badge-active'
                          : 'badge-inactive'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {(user.last_login_city || user.last_login_state || user.last_login_country) && (
                          <div className="flex flex-wrap items-center gap-1 text-xs">
                            {user.last_login_city && (
                              <span className="text-[var(--text-primary)] font-medium">{user.last_login_city}</span>
                            )}
                            {user.last_login_state && (
                              <>
                                {user.last_login_city && <span className="text-[var(--text-secondary)]">,</span>}
                                <span className="text-[var(--text-secondary)]">{user.last_login_state}</span>
                              </>
                            )}
                            {user.last_login_country && (
                              <>
                                {(user.last_login_city || user.last_login_state) && <span className="text-[var(--text-secondary)]">,</span>}
                                <span className="text-[var(--text-secondary)]">{user.last_login_country}</span>
                              </>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[var(--text-secondary)]">IP:</span>
                          <span className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-primary)] px-2 py-0.5 rounded">
                            {user.last_login_ip || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_blocked
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {user.is_blocked ? 'Bloqueado' : 'Desbloqueado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle2FA(user)}
                          disabled={isProcessing}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.two_factor_enabled
                              ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.two_factor_enabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                        >
                          {user.two_factor_enabled ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </button>
                        {isSuperAdmin && user.role?.name !== 'super_admin' && (
                          <button
                            onClick={() => handleBlockUser(user)}
                            disabled={isProcessing}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.is_blocked
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={user.is_blocked ? 'Desbloquear Usuario' : 'Bloquear Usuario'}
                          >
                            {user.is_blocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal('edit', user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-[var(--text-secondary)]">No se encontraron usuarios</p>
            </div>
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] text-white"
                title="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-[var(--text-primary)]">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] dark:bg-[var(--color-primary)] dark:hover:bg-[var(--color-primary-hover)] text-white"
                title="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] rounded-xl max-w-md w-full p-6 border border-[var(--border-color)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
              {modalMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={modalMode === 'edit'}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Contraseña {modalMode === 'edit' && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={modalMode === 'create'}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Rol
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-[var(--text-primary)]">
                  Usuario activo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : modalMode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {show2FAModal && twoFactorData && (
        <TwoFactorModal
          isOpen={show2FAModal}
          onClose={() => {
            setShow2FAModal(false);
            setTwoFactorData(null);
          }}
          secret={twoFactorData.secret}
          qrCodeUrl={twoFactorData.qrCodeUrl}
          userEmail={twoFactorData.userEmail}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        type={confirmDialog.type}
      />
    </div>
  );
}
