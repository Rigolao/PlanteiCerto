import { useNavigate, useLocation } from 'react-router-dom';
import { Trees, FolderOpen, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SearchInput } from '../ui/SearchInput';
import { FilterButton } from '../ui/FilterButton';
import type { FiltroAtributo } from '../../types/tree';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  termoBusca: string;
  setTermoBusca: (v: string) => void;
  filtroAtivo: FiltroAtributo;
  setFiltroAtivo: (v: FiltroAtributo) => void;
  currentTab: string;
}

const filters: { key: FiltroAtributo; label: string }[] = [
  { key: 'todos', label: '≡ Todas as Árvores' },
  { key: 'nativas', label: 'Nativas do Brasil' },
  { key: 'sem_espinhos', label: 'Sem Espinhos' },
];

export function Drawer({ isOpen, onClose, termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo, currentTab }: DrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isArvores = location.pathname === '/';
  const isQuemSomos = location.pathname === '/quem-somos';
  const isProjetos = location.pathname === '/projetos';

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-[280px] h-full bg-primary z-40 shadow-2xl transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-primary-foreground/20">
        <span className="text-primary-foreground text-lg font-bold font-serif flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <rect width="32" height="32" rx="7" fill="currentColor" className="text-primary" />
            <path d="M16 26V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 14C16 14 11 11 8 6C12 4 16 9 16 14Z" fill="white" opacity="0.9"/>
            <path d="M16 14C16 14 21 11 24 6C20 4 16 9 16 14Z" fill="white" opacity="0.7"/>
            <path d="M16 19C16 19 10 16 8 11C12 9 16 14 16 19Z" fill="white" opacity="0.6"/>
            <path d="M16 19C16 19 22 16 24 11C20 9 16 14 16 19Z" fill="white" opacity="0.5"/>
          </svg>
          Menu
        </span>
        <button
          onClick={onClose}
          className="text-primary-foreground text-2xl bg-transparent border-none cursor-pointer hover:text-primary-foreground/70"
        >
          &times;
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col gap-1 p-3">
        <button
          onClick={() => goTo('/')}
          className={`w-full text-left px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm font-medium transition-colors ${
            isArvores ? 'bg-primary-foreground text-primary' : 'bg-transparent text-primary-foreground hover:bg-primary-foreground/15'
          }`}
        >
          <Trees size={16} className="inline-block" /> Árvores
        </button>
        <button
          onClick={() => goTo('/quem-somos')}
          className={`w-full text-left px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm font-medium transition-colors ${
            isQuemSomos ? 'bg-primary-foreground text-primary' : 'bg-transparent text-primary-foreground hover:bg-primary-foreground/15'
          }`}
        >
          <Info size={16} className="inline-block" /> Quem Somos
        </button>
        {user && (
          <button
            onClick={() => goTo('/projetos')}
            className={`w-full text-left px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm font-medium transition-colors ${
              isProjetos ? 'bg-primary-foreground text-primary' : 'bg-transparent text-primary-foreground hover:bg-primary-foreground/15'
            }`}
          >
            <FolderOpen size={16} className="inline-block" /> Meus Projetos
          </button>
        )}
      </div>

      {/* Search & Filters (only on Trees page) */}
      {currentTab === 'arvores' && (
        <div className="px-4 mt-2 flex flex-col gap-3">
          <div>
            <label className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wide mb-1 block">Buscar árvore</label>
            <SearchInput value={termoBusca} onChange={setTermoBusca} />
          </div>
          <div>
            <label className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wide mb-2 block">Filtrar por</label>
            <div className="flex flex-col gap-1.5">
              {filters.map(f => (
                <FilterButton
                  key={f.key}
                  label={f.label}
                  active={filtroAtivo === f.key}
                  onClick={() => setFiltroAtivo(f.key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
