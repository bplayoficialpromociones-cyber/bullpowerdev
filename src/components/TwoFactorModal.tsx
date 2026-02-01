import { X, Copy, Check, Shield } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  secret: string;
  qrCodeUrl: string;
  userEmail: string;
}

export function TwoFactorModal({ isOpen, onClose, secret, qrCodeUrl, userEmail }: TwoFactorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Configurar Autenticación 2FA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--accent-hover)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-secondary)]">
              Usuario: <span className="font-medium text-[var(--text-primary)]">{userEmail}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Paso 1: Escanear código QR</h3>
            <div className="p-4 bg-white rounded-lg border border-[var(--border-color)]">
              <img
                src={qrCodeUrl}
                alt="QR Code para 2FA"
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, Microsoft Authenticator, etc.)
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Paso 2: O ingresa manualmente</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={secret}
                readOnly
                className="flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono text-sm"
              />
              <button
                onClick={handleCopy}
                className="p-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                title="Copiar secreto"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Si no puedes escanear el código QR, ingresa este código manualmente en tu aplicación de autenticación
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-black">
              <strong>Importante:</strong> Guarda este código en un lugar seguro. Lo necesitarás si cambias de dispositivo o reinstalar tu aplicación de autenticación.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Paso 3: Verificar</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              El usuario deberá ingresar el código de 6 dígitos generado por la aplicación de autenticación en su próximo inicio de sesión.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 p-6 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
