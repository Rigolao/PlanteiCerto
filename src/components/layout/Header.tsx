import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield, ChevronDown, User as UserIcon, FolderGit2, LogOut } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useProfile();
  const { theme, setTheme } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const isArvores = location.pathname === '/';
  const isQuemSomos = location.pathname === '/quem-somos';

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
            >
              <img src="/logo.png" alt="PlanteiCerto Logo" width="56" height="56" className="shrink-0 object-contain rounded-md" />
              <span className="font-serif font-bold text-foreground">PlanteiCerto</span>
            </button>
            <div className="hidden sm:flex items-center gap-4 ml-3 pl-4 border-l border-border h-12">
              <img src="/logos/unaerp.png" alt="UNAERP" className="h-12 w-auto object-contain" />
              <img src="/logos/mestrado.png" alt="Mestrado Tecnologia Ambiental" className="h-8 w-auto object-contain" />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => navigate('/')}
              className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isArvores ? 'text-primary font-semibold border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
            >
              Árvores
            </button>
            <button
              onClick={() => navigate('/quem-somos')}
              className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isQuemSomos ? 'text-primary font-semibold border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
            >
              Quem Somos
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm transition-colors text-muted-foreground hover:text-foreground font-medium"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {user.nome?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block max-w-[100px] truncate">{user.nome}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm font-semibold text-foreground truncate">{user.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { navigate('/perfil'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer border-none text-left bg-transparent"
                    >
                      <UserIcon size={16} />
                      Meu Perfil
                    </button>

                    <button
                      onClick={() => { navigate('/projetos'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer border-none text-left bg-transparent"
                    >
                      <FolderGit2 size={16} />
                      Meus Projetos
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { navigate('/admin/arvores'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer border-none text-left bg-transparent"
                      >
                        <Shield size={16} />
                        Administração
                      </button>
                    )}

                    <div className="h-px bg-border my-2"></div>

                    <button
                      onClick={() => { setLogoutModalOpen(true); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-none text-left bg-transparent"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
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
