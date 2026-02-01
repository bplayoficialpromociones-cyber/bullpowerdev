import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, LogIn, Shield, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(captcha);
    setCaptchaInput('');
    setCaptchaError(false);
    setTimeout(() => drawCaptcha(captcha), 10);
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e0f2ed';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${50 + Math.random() * 100}, ${100 + Math.random() * 100}, ${80 + Math.random() * 100}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 150}, ${100 + Math.random() * 100}, ${Math.random() * 150}, 0.3)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    ctx.font = 'bold 40px Arial';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 35;
      const y = canvas.height / 2;
      const rotation = (Math.random() - 0.5) * 0.4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const gradient = ctx.createLinearGradient(0, -20, 0, 20);
      gradient.addColorStop(0, `rgb(${20 + Math.random() * 80}, ${30 + Math.random() * 70}, ${20 + Math.random() * 80})`);
      gradient.addColorStop(1, `rgb(${30 + Math.random() * 60}, ${40 + Math.random() * 50}, ${30 + Math.random() * 60})`);
      ctx.fillStyle = gradient;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${50 + Math.random() * 100}, ${100 + Math.random() * 100}, ${80 + Math.random() * 100}, 0.4)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const startY = Math.random() * canvas.height;
      ctx.moveTo(0, startY);
      for (let x = 0; x < canvas.width; x += 5) {
        ctx.lineTo(x, startY + Math.sin(x / 20) * 10);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError(false);

    if (captchaInput.toLowerCase() !== captchaValue.toLowerCase()) {
      setCaptchaError(true);
      setError('Código de seguridad incorrecto');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage('Iniciando autenticación...');

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      setLoadingProgress(20);
      setLoadingMessage('Validando credenciales...');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      setLoadingProgress(60);
      setLoadingMessage('Procesando respuesta...');

      if (!response.ok) {
        const errorData = await response.json();
        clearInterval(progressInterval);
        setLoadingProgress(0);
        setLoadingMessage('');
        setError(errorData.error || `Error del servidor (${response.status})`);
        generateCaptcha();
        return;
      }

      const data = await response.json();

      setLoadingProgress(80);

      if (data.requires_2fa) {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setLoadingMessage('Requiere verificación 2FA');
        setTimeout(() => {
          setShowTwoFactor(true);
          setLoadingProgress(0);
          setLoadingMessage('');
        }, 300);
      } else if (data.success) {
        setLoadingProgress(100);
        setLoadingMessage('Acceso concedido');
        login(data.user);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 300);
      } else {
        clearInterval(progressInterval);
        setLoadingProgress(0);
        setLoadingMessage('');
        setError(data.error || 'Error al iniciar sesión');
        generateCaptcha();
      }
    } catch (err) {
      console.error('Login error:', err);
      clearInterval(progressInterval);
      setLoadingProgress(0);
      setLoadingMessage('');
      setError('Error de conexión. Por favor, intenta nuevamente.');
      generateCaptcha();
    } finally {
      clearInterval(progressInterval);
      if (!showTwoFactor) {
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
          setLoadingMessage('');
        }, 300);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage('Verificando código 2FA...');

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      setLoadingProgress(30);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, code: twoFactorCode }),
      });

      setLoadingProgress(70);
      setLoadingMessage('Procesando autenticación...');

      const data = await response.json();

      if (data.success) {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setLoadingMessage('Acceso concedido');
        login(data.user);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 300);
      } else {
        clearInterval(progressInterval);
        setLoadingProgress(0);
        setLoadingMessage('');
        setError(data.error || 'Código 2FA incorrecto');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setLoadingProgress(0);
      setLoadingMessage('');
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsLoading(false);
        if (!window.location.href.includes('/dashboard')) {
          setLoadingProgress(0);
          setLoadingMessage('');
        }
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle variant="full" size="lg" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow-xl p-8 border border-[var(--border-color)]">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
          </div>

          {!showTwoFactor ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Código de Seguridad
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <canvas
                      ref={canvasRef}
                      width="240"
                      height="80"
                      className={`border-2 rounded-lg ${captchaError ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="p-3 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg transition-colors"
                      title="Generar nuevo código"
                    >
                      <RefreshCw className="w-5 h-5 text-[var(--text-primary)]" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-primary)] border text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                      captchaError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-[var(--border-color)]'
                    }`}
                    placeholder="Ingrese el código de seguridad"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </>
                )}
              </button>

              {isLoading && loadingProgress > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] dark:from-[#34d399] dark:via-[#10b981] dark:to-[#059669] transition-all duration-300 ease-out shadow-lg"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {loadingMessage}
                    </span>
                    <span className="text-xs font-bold text-[#10b981] dark:text-[#34d399]">
                      {loadingProgress}%
                    </span>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Autenticación de Dos Factores
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Ingresa el código de 6 dígitos de tu aplicación autenticadora
                </p>
              </div>

              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Código 2FA
                </label>
                <input
                  id="twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Verificar Código
                    </>
                  )}
                </button>

                {isLoading && loadingProgress > 0 && (
                  <div className="space-y-2">
                    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] dark:from-[#34d399] dark:via-[#10b981] dark:to-[#059669] transition-all duration-300 ease-out shadow-lg"
                        style={{ width: `${loadingProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {loadingMessage}
                      </span>
                      <span className="text-xs font-bold text-[#10b981] dark:text-[#34d399]">
                        {loadingProgress}%
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  disabled={isLoading}
                  className="w-full py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volver
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
            <p>Bull Power Admin v1.0</p>
            <p className="mt-1">Sistema de Gestión para Fabricante de Casino Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
