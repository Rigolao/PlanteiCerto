import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';

export function Header() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isArvores = location.pathname === '/';
  const isProjetos = location.pathname === '/projetos';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="flex items-center justify-between px-6 md:px-10 h-14 max-w-7xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
          >
            <span className="text-xl leading-none">🌱</span>
            <span className="text-foreground text-base font-bold tracking-tight">PlanteiCerto</span>
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isArvores ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Árvores
            </button>
            {user && (
              <button
                onClick={() => navigate('/projetos')}
                className={`bg-transparent border-none cursor-pointer text-sm transition-colors ${isProjetos ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Meus Projetos
              </button>
            )}
            {user ? (
              <button
                onClick={() => signOut()}
                className="text-muted-foreground text-sm bg-transparent border-none cursor-pointer hover:text-foreground transition-colors"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full border-none cursor-pointer hover:brightness-110 transition-all"
              >
                Entrar
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
