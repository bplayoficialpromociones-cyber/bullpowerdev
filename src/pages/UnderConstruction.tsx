import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UnderConstruction() {
  const location = useLocation();

  const getSectionName = () => {
    const path = location.pathname;
    const sectionMap: { [key: string]: string } = {
      '/dashboard/crm': 'CRM Clientes',
      '/dashboard/facturacion': 'Facturación',
      '/dashboard/gastos': 'Gastos',
      '/dashboard/integraciones': 'Integraciones',
      '/dashboard/soporte': 'Soporte',
      '/dashboard/trafico': 'Tráfico',
      '/dashboard/analytics': 'Analytics',
      '/dashboard/pagos': 'Pagos',
    };
    return sectionMap[path] || 'Esta sección';
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-[var(--bg-primary)]">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-[var(--color-primary)]/10">
          <Construction className="w-12 h-12 text-[var(--color-primary)]" />
        </div>

        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          Sección en Construcción
        </h1>

        <p className="text-xl text-[var(--text-secondary)] mb-2">
          {getSectionName()} está en desarrollo
        </p>

        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          Estamos trabajando para traerte esta funcionalidad pronto. Mientras tanto, puedes explorar otras secciones del panel de administración.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)]">
            ¿Tienes alguna pregunta o sugerencia?
          </p>
          <p className="text-sm text-[var(--color-primary)] mt-1">
            Contacta al equipo de desarrollo
          </p>
        </div>
      </div>
    </div>
  );
}
