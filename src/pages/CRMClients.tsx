import React, { useState } from 'react';
import { Users, Briefcase, Award } from 'lucide-react';
import { ClientsTab } from '../components/crm/ClientsTab';
import { EmployeesTab } from '../components/crm/EmployeesTab';
import { PositionsTab } from '../components/crm/PositionsTab';

type Tab = 'clients' | 'employees' | 'positions';

export function CRMClients() {
  const [activeTab, setActiveTab] = useState<Tab>('clients');

  const tabs = [
    { id: 'clients' as Tab, label: 'Clientes', icon: Users },
    { id: 'employees' as Tab, label: 'Empleados', icon: Briefcase },
    { id: 'positions' as Tab, label: 'Cargos', icon: Award },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CRM - Gestión de Clientes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra clientes, empleados y cargos del sistema
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'positions' && <PositionsTab />}
        </div>
      </div>
    </div>
  );
}
