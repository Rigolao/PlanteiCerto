import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { Header } from './Header';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    signOut: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
    signInWithGoogle: vi.fn(),
  }),
}));

vi.mock('../../hooks/useProfile', () => ({
  useProfile: () => ({ isAdmin: false }),
}));

function GoToQuemSomos() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/quem-somos')}>Ir para Quem Somos (teste)</button>;
}

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeProvider defaultTheme="light">
        <Header />
        <Routes>
          <Route path="/" element={<GoToQuemSomos />} />
          <Route path="/quem-somos" element={<p>Página quem somos</p>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

// O drawer mobile é o único overlay fixo em tela cheia do header.
function drawer() {
  return document.querySelector('.fixed.inset-0');
}

function openDrawer() {
  const hamburger = document.querySelector('header button.md\\:hidden') as HTMLElement;
  fireEvent.click(hamburger);
}

describe('Header', () => {
  it('abre o drawer pelo botão do menu mobile', () => {
    renderHeader();
    expect(drawer()).toBeNull();

    openDrawer();

    expect(drawer()).not.toBeNull();
    expect(screen.getByText('Inicio (Arvores)')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('fecha o drawer quando a rota muda', () => {
    renderHeader();
    openDrawer();
    expect(drawer()).not.toBeNull();

    // Mudança de rota que não passa por nenhum botão do drawer
    fireEvent.click(screen.getByRole('button', { name: 'Ir para Quem Somos (teste)' }));

    expect(screen.getByText('Página quem somos')).toBeInTheDocument();
    expect(drawer()).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
});
