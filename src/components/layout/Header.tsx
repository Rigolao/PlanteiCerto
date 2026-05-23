import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useProfile();
  const { theme, setTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isArvores = location.pathname === '/';
  const isQuemSomos = location.pathname === '/quem-somos';
  const isProjetos = location.pathname === '/projetos';
  const isPerfil = location.pathname === '/perfil';

  // Fecha o drawer ao mudar de rota
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Bloqueia scroll quando drawer está aberto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-[1000] bg-background border-b border-border">
        <div className="flex items-center justify-between px-6 md:px-10 h-16 max-w-5xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
          >
            <img src="/logo.png" alt="PlanteiCerto Logo" width="56" height="56" className="shrink-0 object-contain rounded-md" />
            <span className="font-serif font-bold text-foreground">PlanteiCerto</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isArvores ? 'text-primary font-semibold border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
            >
              Árvores
            </button>
            {user && (
              <button
                onClick={() => navigate('/projetos')}
                className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isProjetos ? 'text-primary font-semibold border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-foreground font-medium'
                  }`}
              >
                Meus Projetos
              </button>
            )}
            {user && (
              <button
                onClick={() => navigate('/perfil')}
                className={`flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm transition-colors ${isPerfil ? 'text-primary font-semibold border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-foreground font-medium'
                  }`}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : null}
                Meu Perfil
              </button>
            )}
            <button
              onClick={() => navigate('/quem-somos')}
              className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isQuemSomos ? 'text-primary font-semibold border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
            >
              Quem Somos
            </button>
            {user && isAdmin && (
              <button
                onClick={() => navigate('/admin/arvores')}
                className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <Shield size={16} />
                Admin
              </button>
            )}
            {user ? (
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="text-muted-foreground text-sm bg-transparent border-none cursor-pointer hover:text-foreground transition-colors"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2 rounded-full border-none cursor-pointer hover:shadow-lg transition-all"
              >
                Entrar
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-secondary-foreground border-none cursor-pointer hover:bg-secondary/80 transition-colors"
              title="Alternar tema"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        isAdmin={isAdmin}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onLogout={() => setLogoutModalOpen(true)}
        onLogin={() => setAuthModalOpen(true)}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => signOut()}
        title="Sair da conta"
        description="Tem certeza que deseja encerrar sua sessão? Você precisará entrar novamente para gerenciar seus projetos."
        confirmLabel="Sair agora"
        variant="danger"
      />
    </>
  );
}
