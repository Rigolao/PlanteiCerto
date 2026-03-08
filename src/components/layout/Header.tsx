import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useTheme } from '../../contexts/ThemeContext';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isArvores = location.pathname === '/';
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
        <div className="flex items-center justify-between px-6 md:px-10 h-16 max-w-7xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
          >
            <span className="text-2xl leading-none">🌱</span>
            <span className="text-foreground text-lg font-bold tracking-tight">PlanteiCerto</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className={`bg-transparent border-none cursor-pointer text-sm font-medium transition-colors ${isArvores ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Árvores
            </button>
            {user && (
              <button
                onClick={() => navigate('/projetos')}
                className={`bg-transparent border-none cursor-pointer text-sm font-medium transition-colors ${isProjetos ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Meus Projetos
              </button>
            )}
            {user && (
              <button
                onClick={() => navigate('/perfil')}
                className={`flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors ${isPerfil ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : null}
                Meu Perfil
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

      {/* Mobile Drawer (Sidebar) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[10001] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Content */}
          <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-background shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <span className="font-bold text-lg">Menu</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors bg-transparent border-none cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isArvores ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  } bg-transparent border-none cursor-pointer text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4.5 9.15a1 1 0 0 0-.3.72V22h15.6V9.87a1 1 0 0 0-.3-.72z"></path>
                </svg>
                Início (Árvores)
              </button>

              {user && (
                <button
                  onClick={() => navigate('/projetos')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isProjetos ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    } bg-transparent border-none cursor-pointer text-left`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Meus Projetos
                </button>
              )}

              {user && (
                <button
                  onClick={() => {
                    navigate('/perfil');
                    setDrawerOpen(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isPerfil ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    } bg-transparent border-none cursor-pointer text-left`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Meu Perfil
                </button>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-border flex flex-col gap-4">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all text-muted-foreground hover:bg-muted bg-transparent border-none cursor-pointer text-left w-full"
              >
                {isDarkMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    Modo Claro
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    Modo Escuro
                  </>
                )}
              </button>

              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="px-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Logado como</p>
                    <p className="text-sm font-semibold truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-muted text-destructive text-sm font-bold border-none cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg border-none cursor-pointer"
                >
                  Fazer Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
