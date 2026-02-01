import { useState } from 'react';
import { Dices, Layers, Palette, Zap, DollarSign } from 'lucide-react';
import { GamesTab } from '../components/games/GamesTab';
import { GameTypesTab } from '../components/games/GameTypesTab';
import { ThemesTab } from '../components/games/ThemesTab';
import { MechanicsTab } from '../components/games/MechanicsTab';
import { DenominationsTab } from '../components/games/DenominationsTab';

export default function Games() {
  const [activeTab, setActiveTab] = useState<'games' | 'types' | 'themes' | 'mechanics' | 'denominations'>('games');

  const tabs = [
    { id: 'games' as const, name: 'Juegos', icon: Dices },
    { id: 'types' as const, name: 'Tipos de Juegos', icon: Layers },
    { id: 'themes' as const, name: 'Temáticas', icon: Palette },
    { id: 'mechanics' as const, name: 'Mecánicas', icon: Zap },
    { id: 'denominations' as const, name: 'Denominaciones', icon: DollarSign },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Gestión de Juegos</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Catálogo completo de juegos de casino y sus configuraciones
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)]">
        <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium transition-all relative whitespace-nowrap
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
          {activeTab === 'games' && <GamesTab />}
          {activeTab === 'types' && <GameTypesTab />}
          {activeTab === 'themes' && <ThemesTab />}
          {activeTab === 'mechanics' && <MechanicsTab />}
          {activeTab === 'denominations' && <DenominationsTab />}
        </div>
      </div>
    </div>
  );
}
