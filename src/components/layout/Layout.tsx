import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Drawer } from './Drawer';
import type { FiltroAtributo } from '../../types/tree';

interface LayoutProps {
  termoBusca: string;
  setTermoBusca: (v: string) => void;
  filtroAtivo: FiltroAtributo;
  setFiltroAtivo: (v: FiltroAtributo) => void;
  currentTab: string;
}

export function Layout({ termoBusca, setTermoBusca, filtroAtivo, setFiltroAtivo, currentTab }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Header
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
      />

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
        filtroAtivo={filtroAtivo}
        setFiltroAtivo={setFiltroAtivo}
        currentTab={currentTab}
      />

      <main className="pt-4 px-4 pb-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </>
  );
}
