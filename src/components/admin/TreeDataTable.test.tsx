import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TreeDataTable } from './TreeDataTable';
import { staticTrees } from '../../data/trees';
import type { Arvore } from '../../types/tree';

vi.mock('../../hooks/useAdminTrees', () => ({
  useTreeUsageCount: () => ({ count: 0, isLoading: false }),
}));

function makeTrees(count: number): Arvore[] {
  return Array.from({ length: count }, (_, i) => ({
    ...staticTrees[0],
    id: i + 1,
    nome_popular: `Espécie ${String(i + 1).padStart(2, '0')}`,
    nome_cientifico: `Genus especie${i + 1}`,
  }));
}

const noop = () => {};

function renderTable(trees: Arvore[], searchQuery = '') {
  const ui = (t: Arvore[], q: string) => (
    <TreeDataTable trees={t} searchQuery={q} onEdit={noop} onDelete={noop} onToggleActive={noop} />
  );
  const utils = render(ui(trees, searchQuery));
  return { rerenderWith: (t: Arvore[], q = '') => utils.rerender(ui(t, q)) };
}

// Botões de paginação são os únicos botões sem título nem nome acessível dentro da tabela
// além dos cabeçalhos ordenáveis; o último é sempre "próxima página".
function nextPageButton() {
  const untitled = screen.getAllByRole('button').filter((b) => !b.getAttribute('title') && !b.textContent);
  return untitled[untitled.length - 1];
}

describe('TreeDataTable', () => {
  it('mostra a primeira página ao carregar', () => {
    renderTable(makeTrees(12));
    expect(screen.getByText('Espécie 01')).toBeInTheDocument();
    expect(screen.queryByText('Espécie 06')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('volta à primeira página quando os dados diminuem e a página atual deixa de existir', async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderTable(makeTrees(12));

    await user.click(nextPageButton());
    await user.click(nextPageButton());
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByText('Espécie 11')).toBeInTheDocument();

    rerenderWith(makeTrees(7));

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Espécie 01')).toBeInTheDocument();
    expect(screen.queryByText('Espécie 06')).not.toBeInTheDocument();
  });

  it('volta à primeira página quando o filtro de busca reduz o número de páginas', async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderTable(makeTrees(12));

    await user.click(nextPageButton());
    await user.click(nextPageButton());
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    // "Espécie 0" casa com 9 itens → 2 páginas
    rerenderWith(makeTrees(12), 'Espécie 0');

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Espécie 01')).toBeInTheDocument();
    expect(screen.getByText(/Mostrando 1–5 de 9/)).toBeInTheDocument();
  });
});
