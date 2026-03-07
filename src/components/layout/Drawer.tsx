import { useNavigate, useLocation } from 'react-router-dom';
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
  { key: 'todos', label: 'Todas' },
  { key: 'compatibilidade', label: '🏙️ Melhor p/ Calçadas' },
  { key: 'limpeza', label: '🍃 Maior Limpeza' },
  { key: 'clima', label: '🌍 Mais Força Climática' },
];

export function Drawer({ isOpen, onClose, termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo, currentTab }: DrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isArvores = location.pathname === '/';
  const isProjetos = location.pathname === '/projetos';

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-[280px] h-full bg-verde-primario z-40 shadow-2xl transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
        <span className="text-white text-lg font-bold">🌱 Menu</span>
        <button
          onClick={onClose}
          className="text-white text-2xl bg-transparent border-none cursor-pointer hover:text-white/70"
        >
          &times;
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col gap-1 p-3">
        <button
          onClick={() => goTo('/')}
          className={`w-full text-left px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm font-medium transition-colors ${
            isArvores ? 'bg-white text-verde-primario' : 'bg-transparent text-white hover:bg-white/15'
          }`}
        >
          🌳 Árvores
        </button>
        {user && (
          <button
            onClick={() => goTo('/projetos')}
            className={`w-full text-left px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm font-medium transition-colors ${
              isProjetos ? 'bg-white text-verde-primario' : 'bg-transparent text-white hover:bg-white/15'
            }`}
          >
            📁 Meus Projetos
          </button>
        )}
      </div>

      {/* Search & Filters (only on Trees page) */}
      {currentTab === 'arvores' && (
        <div className="px-4 mt-2 flex flex-col gap-3">
          <div>
            <label className="text-white/80 text-xs font-bold uppercase tracking-wide mb-1 block">Buscar árvore</label>
            <SearchInput value={termoBusca} onChange={setTermoBusca} />
          </div>
          <div>
            <label className="text-white/80 text-xs font-bold uppercase tracking-wide mb-2 block">Filtrar por</label>
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
