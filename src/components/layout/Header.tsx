import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';

interface HeaderProps {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}

export function Header({ drawerOpen, onToggleDrawer }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-verde-primario shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Hamburger */}
          <button
            onClick={onToggleDrawer}
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 bg-transparent border-none cursor-pointer group"
            aria-label="Abrir menu"
          >
            <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Logo */}
          <h1 className="text-white text-lg font-bold m-0">🌱 Plantei Certo</h1>

          {/* Auth Area */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-white/90 text-sm hidden sm:inline">{user.nome}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-white/30 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-white text-verde-primario text-xs font-bold px-4 py-1.5 rounded-full border-none cursor-pointer hover:bg-verde-claro transition-colors"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
