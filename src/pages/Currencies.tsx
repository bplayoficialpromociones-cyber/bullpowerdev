import React from 'react';
import { Coins } from 'lucide-react';
import { CurrenciesTab } from '../components/expenses/CurrenciesTab';

export function Currencies() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Coins className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Gestión de Monedas
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Administra las monedas disponibles en el sistema
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-lg shadow-sm border border-[var(--border-color)]">
        <div className="p-6">
          <CurrenciesTab />
        </div>
      </div>
    </div>
  );
}
