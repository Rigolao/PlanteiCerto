import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AdminLayout } from './AdminLayout';

describe('AdminLayout', () => {
  it('navigates to the catalog quality page from the admin navigation', () => {
    render(
      <MemoryRouter initialEntries={['/admin/arvores']}>
        <ThemeProvider defaultTheme="light">
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/arvores" element={<p>Catálogo</p>} />
              <Route path="/admin/qualidade" element={<p>Página de qualidade</p>} />
            </Route>
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Qualidade do catálogo' }));

    expect(screen.getByText('Página de qualidade')).toBeInTheDocument();
  });
});
