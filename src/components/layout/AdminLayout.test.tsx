import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AdminLayout } from './AdminLayout';

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/admin/arvores']}>
      <ThemeProvider defaultTheme="light">
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/arvores" element={<p>Catálogo</p>} />
            <Route path="/admin/qualidade" element={<p>Página de qualidade</p>} />
            <Route path="/admin/equipe" element={<p>Página de equipe</p>} />
          </Route>
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

// A sidebar mobile é o único overlay fixo em tela cheia do layout.
function mobileSidebar() {
  return document.querySelector<HTMLElement>('.fixed.inset-0');
}

function openMobileSidebar() {
  const header = document.querySelector('header') as HTMLElement;
  fireEvent.click(within(header).getByRole('button'));
}

describe('AdminLayout', () => {
  it('navigates to the catalog quality page from the admin navigation', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Qualidade do catálogo' }));

    expect(screen.getByText('Página de qualidade')).toBeInTheDocument();
  });

  it('renderiza os itens de navegação na sidebar desktop', () => {
    renderLayout();

    expect(mobileSidebar()).toBeNull();
    expect(screen.getByRole('button', { name: 'Árvores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qualidade do catálogo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Equipe' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar ao site' })).toBeInTheDocument();
  });

  it('abre a sidebar mobile com os itens de navegação', () => {
    renderLayout();

    openMobileSidebar();

    const overlay = mobileSidebar() as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(within(overlay).getByRole('button', { name: 'Equipe' })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('fecha a sidebar mobile ao navegar para outra rota', () => {
    renderLayout();
    openMobileSidebar();

    fireEvent.click(within(mobileSidebar() as HTMLElement).getByRole('button', { name: 'Equipe' }));

    expect(screen.getByText('Página de equipe')).toBeInTheDocument();
    expect(mobileSidebar()).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
});
