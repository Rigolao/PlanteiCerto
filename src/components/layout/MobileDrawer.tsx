import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import type { UserProfile } from '../../types/auth';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isAdmin: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  user,
  isAdmin,
  isDarkMode,
  onToggleTheme,
  onLogout,
  onLogin,
}: MobileDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isArvores = location.pathname === '/';
  const isQuemSomos = location.pathname === '/quem-somos';
  const isProjetos = location.pathname === '/projetos';
  const isPerfil = location.pathname === '/perfil';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Content */}
      <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-background shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PlanteiCerto Logo" width="56" height="56" className="shrink-0 object-contain rounded-md" />
            <span className="font-serif font-bold text-lg text-foreground">PlanteiCerto</span>
          </div>
          <button
            onClick={onClose}
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
            Inicio (Arvores)
          </button>

          <button
            onClick={() => {
              navigate('/quem-somos');
              onClose();
            }}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isQuemSomos ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              } bg-transparent border-none cursor-pointer text-left`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Quem Somos
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
                onClose();
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

          {user && isAdmin && (
            <button
              onClick={() => {
                navigate('/admin/arvores');
                onClose();
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all text-muted-foreground hover:bg-muted bg-transparent border-none cursor-pointer text-left"
            >
              <Shield size={20} />
              Painel Admin
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-border flex flex-col gap-4">
          <button
            onClick={onToggleTheme}
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
                  onClose();
                  onLogout();
                }}
                className="w-full py-3 rounded-xl bg-muted text-destructive text-sm font-bold border-none cursor-pointer hover:bg-destructive/10 transition-colors"
              >
                Sair da Conta
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onLogin();
              }}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg border-none cursor-pointer"
            >
              Fazer Login
            </button>
          )}

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-6 py-2">
            <img src="/logos/unaerp.png" alt="UNAERP" className="h-14 w-auto object-contain opacity-90" />
            <img src="/logos/mestrado.png" alt="Mestrado Tecnologia Ambiental" className="h-9 w-auto object-contain opacity-90" />
          </div>
        </div>
      </div>
    </div>
  );
}
