import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/admin/auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
            <Palette className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Pintando Sueños</h1>
            <p className="text-sm text-ink-500">Panel Administrativo</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-3 py-2.5 text-sm text-error-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-400">Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paintingdreams@pintandosuenos.com"
                required
                autoFocus
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-primary-500 focus:bg-white/[0.05]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-400">Contraseña</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 pr-10 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-primary-500 focus:bg-white/[0.05]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

        </div>

        <p className="mt-6 text-center text-xs text-ink-600">
          Acceso restringido solo para administradores autorizados
        </p>
      </div>
    </div>
  );
}
