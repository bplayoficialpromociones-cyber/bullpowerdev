import React from 'react';
import { Receipt } from 'lucide-react';
import { ExpensesTab } from '../components/expenses/ExpensesTab';

export function Expenses() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Gestión de Gastos
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Administra los gastos del sistema
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-lg shadow-sm border border-[var(--border-color)]">
        <div className="p-6">
          <ExpensesTab />
        </div>
      </div>
    </div>
  );
}
