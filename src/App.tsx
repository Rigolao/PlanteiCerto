import { Routes, Route, useLocation } from 'react-router-dom';
import { useTrees } from './hooks/useTrees';
import { useTreeFilters } from './hooks/useTreeFilters';
import { Layout } from './components/layout/Layout';
import { TreesPage } from './pages/TreesPage';
import { ProjectsPage } from './pages/ProjectsPage';

export default function App() {
  const { trees } = useTrees();
  const { filtered, termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo } = useTreeFilters(trees);
  const location = useLocation();
  const currentTab = location.pathname === '/projetos' ? 'projetos' : 'arvores';

  return (
    <Routes>
      <Route
        element={
          <Layout
            termoBusca={termoBusca}
            setTermoBusca={setTermoBusca}
            filtroAtivo={filtroAtivo}
            setFiltroAtivo={setFiltroAtivo}
            currentTab={currentTab}
          />
        }
      >
        <Route path="/" element={<TreesPage trees={filtered} />} />
        <Route path="/projetos" element={<ProjectsPage />} />
      </Route>
    </Routes>
  );
}
