import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Heart,
  CreditCard,
  Package,
  Newspaper,
  Mail,
  Send,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Palette,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/admin/auth/AuthContext';
import { cn } from '@/admin/utils/cn';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
  { to: '/admin/donations', label: 'Donaciones', icon: Heart },
  { to: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
  { to: '/admin/plans', label: 'Planes', icon: Package },
  { to: '/admin/news', label: 'Noticias', icon: Newspaper },
  { to: '/admin/contacts', label: 'Contactos', icon: Mail },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Send },
  { to: '/admin/media', label: 'Media', icon: Image },
  { to: '/admin/donation-guide', label: 'Guía Donación', icon: Heart },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-ink-950 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
            <Palette className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">Pintando Sueños</span>
              <span className="text-[10px] text-ink-500">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600/15 text-primary-400 border-r-2 border-primary-500'
                    : 'text-ink-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-ink-500 hover:text-white lg:flex"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && 'Contraer'}
        </button>

        {/* User + logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-ink-500">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="text-ink-400 hover:text-error-400" title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-16' : 'lg:pl-60')}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-ink-950/80 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-ink-400 hover:text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-success-500/15 px-2 py-1 text-xs font-medium text-success-400">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
