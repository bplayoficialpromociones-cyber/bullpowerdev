import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Currency } from '../../types/expenses';

interface CurrencySelectorProps {
  value: string;
  onChange: (currencyId: string) => void;
  currencies: Currency[];
  required?: boolean;
  disabled?: boolean;
}

export function CurrencySelector({ value, onChange, currencies, required = false, disabled = false }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCurrency = currencies.find(c => c.id === value);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (currencyId: string) => {
    onChange(currencyId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-left flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--accent-hover)]'
        }`}
      >
        <span className={selectedCurrency ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>
          {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.code})` : 'Seleccionar moneda'}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-[300px] overflow-hidden">
          <div className="p-2 border-b border-[var(--border-color)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar moneda..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[240px]">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.id}
                  type="button"
                  onClick={() => handleSelect(currency.id)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-[var(--accent-hover)] transition-colors ${
                    currency.id === value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{currency.name}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{currency.code}</span>
                  </div>
                  {currency.symbol && (
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Símbolo: {currency.symbol}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-[var(--text-secondary)]">
                No se encontraron monedas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
