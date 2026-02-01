import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Headphones,
  PlugZap,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  LogOut,
  Dices,
  Coins
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { AdminUser } from '../types/auth';

interface SidebarProps {
  user: AdminUser | null;
  onLogout: () => void;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion', 'integrador', 'soporte'],
  },
  {
    name: 'Usuarios Admin',
    path: '/dashboard/usuarios',
    icon: <Users className="w-5 h-5" />,
    roles: ['super_admin'],
  },
  {
    name: 'CRM Clientes',
    path: '/dashboard/crm',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion', 'integrador'],
  },
  {
    name: 'Facturación',
    path: '/dashboard/facturacion',
    icon: <FileText className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion'],
  },
  {
    name: 'Gastos',
    path: '/dashboard/gastos',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion'],
  },
  {
    name: 'Monedas',
    path: '/dashboard/monedas',
    icon: <Coins className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion'],
  },
  {
    name: 'Juegos',
    path: '/dashboard/juegos',
    icon: <Dices className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion', 'integrador'],
  },
  {
    name: 'Integraciones',
    path: '/dashboard/integraciones',
    icon: <PlugZap className="w-5 h-5" />,
    roles: ['super_admin', 'integrador'],
  },
  {
    name: 'Soporte',
    path: '/dashboard/soporte',
    icon: <Headphones className="w-5 h-5" />,
    roles: ['super_admin', 'soporte'],
  },
  {
    name: 'Tráfico',
    path: '/dashboard/trafico',
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion', 'integrador'],
  },
  {
    name: 'Analytics',
    path: '/dashboard/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['super_admin', 'facturacion', 'integrador', 'soporte'],
  },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item =>
    !user || item.roles.includes((user as any).role?.name || 'guest')
  );

  return (
    <div className="w-64 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col">
      <div className="p-6 border-b border-[var(--border-color)]">
        <div className="flex flex-col items-center gap-2">
          <Logo size="lg" />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)] space-y-4">
        <ThemeToggle variant="full" size="md" />

        {user && (
          <div className="p-3 bg-[var(--bg-primary)] rounded-lg">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
            {(user as any).role && (
              <p className="text-xs text-[var(--color-primary)] mt-1">
                {(user as any).role.display_name}
              </p>
            )}
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
