import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trees, Users, ArrowLeft, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { label: 'Árvores', path: '/admin/arvores', icon: Trees },
  { label: 'Equipe', path: '/admin/equipe', icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const Sidebar = ({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} flex flex-col bg-card border-r border-border h-full`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <rect width="32" height="32" rx="7" fill="currentColor" className="text-primary" />
            <path d="M16 26V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 14C16 14 11 11 8 6C12 4 16 9 16 14Z" fill="white" opacity="0.9"/>
            <path d="M16 14C16 14 21 11 24 6C20 4 16 9 16 14Z" fill="white" opacity="0.7"/>
            <path d="M16 19C16 19 10 16 8 11C12 9 16 14 16 19Z" fill="white" opacity="0.6"/>
            <path d="M16 19C16 19 22 16 24 11C20 9 16 14 16 19Z" fill="white" opacity="0.5"/>
          </svg>
          <span className="text-foreground text-lg font-bold tracking-tight">Admin</span>
        </div>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border-none cursor-pointer text-left w-full ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted bg-transparent'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Voltar ao site */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-all bg-transparent border-none cursor-pointer text-left w-full"
        >
          <ArrowLeft size={20} />
          Voltar ao site
        </button>
      </div>
    </aside>
  );

  return (
    <div className={`min-h-screen flex bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[10001] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-background shadow-2xl animate-in slide-in-from-right duration-300">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden sticky top-0 z-[1000] bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="w-10" /> {/* Spacer */}
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="shrink-0">
                <rect width="32" height="32" rx="7" fill="currentColor" className="text-primary" />
                <path d="M16 26V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 14C16 14 11 11 8 6C12 4 16 9 16 14Z" fill="white" opacity="0.9"/>
                <path d="M16 14C16 14 21 11 24 6C20 4 16 9 16 14Z" fill="white" opacity="0.7"/>
                <path d="M16 19C16 19 10 16 8 11C12 9 16 14 16 19Z" fill="white" opacity="0.6"/>
                <path d="M16 19C16 19 22 16 24 11C20 9 16 14 16 19Z" fill="white" opacity="0.5"/>
              </svg>
              <span className="font-bold text-base">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
