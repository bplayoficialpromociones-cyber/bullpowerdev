import { useState } from 'react';
import { FileText, List } from 'lucide-react';
import { InvoicesTab } from '../components/billing/InvoicesTab';

export default function Billing() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'statuses'>('invoices');

  const tabs = [
    { id: 'invoices' as const, name: 'Facturas', icon: FileText },
    { id: 'statuses' as const, name: 'Estados', icon: List },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Facturación</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Gestión completa de facturas y estados de cobro
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)]">
        <div className="flex border-b border-[var(--border-color)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium transition-all relative
                  ${activeTab === tab.id
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'statuses' && (
            <div className="text-center py-12">
              <List className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Estados de Facturas
              </h3>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                Los estados de facturas son valores fijos del sistema:
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-left">
                  <h4 className="font-semibold text-green-800 dark:text-green-400">Cobrada</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Factura pagada completamente</p>
                </div>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-left">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Pendiente de Pago</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Esperando confirmación de pago</p>
                </div>
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-left">
                  <h4 className="font-semibold text-red-800 dark:text-red-400">No Cobrada</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">Factura vencida sin cobrar</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-900/30 rounded-lg text-left">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-400">Rechazada</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Factura rechazada por el cliente</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
