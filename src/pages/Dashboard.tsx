import { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  currencySymbol: string;
  expensesCurrencySymbol: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const hasAccess = user?.role?.name === 'super_admin' || user?.role?.name === 'facturacion';

  useEffect(() => {
    if (hasAccess) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  const loadStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const dashboardCards = [
    {
      title: 'Total Usuarios',
      value: (stats?.totalUsers || 0).toString(),
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      show: true,
    },
    {
      title: 'Facturación Mensual',
      value: formatCurrency(stats?.monthlyRevenue || 0, stats?.currencySymbol || '$'),
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      show: true,
    },
    {
      title: 'Gastos Mensuales',
      value: formatCurrency(stats?.monthlyExpenses || 0, stats?.expensesCurrencySymbol || '$'),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      show: user?.role?.name === 'super_admin',
    },
    {
      title: 'Integraciones Activas',
      value: '0',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      show: true,
    },
    {
      title: 'Tickets Abiertos',
      value: '0',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      show: true,
    },
  ].filter(card => card.show);

  if (!hasAccess) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Shield className="w-16 h-16 text-[var(--text-secondary)] mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Acceso Denegado</h2>
          <p className="text-[var(--text-secondary)] text-center max-w-md">
            No tienes permisos para acceder al Dashboard. Solo usuarios con rol Super Admin o Facturación pueden ver esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Bienvenido, {user?.full_name || 'Usuario'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card) => (
          <div
            key={card.title}
            className="bg-[var(--bg-surface)] rounded-xl p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                <div className="text-white">{card.icon}</div>
              </div>
            </div>
            {loading && card.title !== 'Integraciones Activas' && card.title !== 'Tickets Abiertos' ? (
              <div className="h-16 flex items-center justify-start">
                <LoadingSpinner size={40} color="#10b981" />
              </div>
            ) : (
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {card.value}
              </h3>
            )}
            <p className="text-sm text-[var(--text-secondary)]">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-surface)] rounded-xl p-6 border border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-[var(--bg-primary)] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Inicio de sesión exitoso
                </p>
                <p className="text-xs text-[var(--text-secondary)]">Hace unos momentos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl p-6 border border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Accesos Rápidos
          </h2>
          <div className="space-y-2">
            {user?.role?.name === 'super_admin' && (
              <a
                href="/dashboard/usuarios"
                className="block p-3 bg-[var(--bg-primary)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors"
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Gestionar Usuarios
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Crear, editar y eliminar usuarios del sistema
                </p>
              </a>
            )}
            <div className="block p-3 bg-[var(--bg-primary)] rounded-lg opacity-50 cursor-not-allowed">
              <p className="text-sm font-medium text-[var(--text-primary)]">Mi Perfil</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Próximamente disponible
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
