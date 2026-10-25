import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TreesPage } from './TreesPage';
import { staticTrees } from '../data/trees';
import type { Arvore } from '../types/tree';

const TOTAL = 14;

const mocks = vi.hoisted(() => ({ trees: [] as unknown[] }));

vi.mock('../hooks/useTrees', () => ({
  useTrees: () => ({ trees: mocks.trees, loading: false }),
}));

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    favoriteIds: new Set<number>(),
    toggleFavorite: vi.fn(),
    isFavorite: () => false,
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

// Modais não participam do comportamento testado e dependem de outros hooks de dados.
vi.mock('../components/trees/TreeDetailModal', () => ({ TreeDetailModal: () => null }));
vi.mock('../components/trees/CompareModal', () => ({ CompareModal: () => null }));
vi.mock('../components/auth/AuthModal', () => ({ AuthModal: () => null }));

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

const observers: Array<{ callback: ObserverCallback; disconnected: boolean }> = [];

class FakeIntersectionObserver {
  private entry: { callback: ObserverCallback; disconnected: boolean };
  constructor(callback: ObserverCallback) {
    this.entry = { callback, disconnected: false };
    observers.push(this.entry);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.entry.disconnected = true;
  }
  takeRecords() {
    return [];
  }
}

function intersect() {
  act(() => {
    observers
      .filter((o) => !o.disconnected)
      .forEach((o) => o.callback([{ isIntersecting: true }]));
  });
}

function shownCount() {
  return screen.getAllByText(/^Espécie \d+$/).length;
}

describe('TreesPage — scroll infinito', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    mocks.trees = Array.from({ length: TOTAL }, (_, i) => ({
      ...staticTrees[0],
      id: i + 1,
      ativa: true,
      foto: null,
      nome_popular: `Espécie ${String(i + 1).padStart(2, '0')}`,
      nome_cientifico: `Genus especie${i + 1}`,
    })) as Arvore[];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('disparar a interseção várias vezes nunca mostra mais itens que o total filtrado', () => {
    render(
      <MemoryRouter>
        <TreesPage trees={[]} />
      </MemoryRouter>,
    );

    expect(shownCount()).toBeLessThan(TOTAL);

    for (let i = 0; i < 10; i++) {
      intersect();
      expect(shownCount()).toBeLessThanOrEqual(TOTAL);
    }

    expect(shownCount()).toBe(TOTAL);
    expect(
      screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === `Mostrando ${TOTAL} de ${TOTAL} árvores`),
    ).toBeInTheDocument();
  });

  it('com filtro ativo, o limite passa a ser o total filtrado', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TreesPage trees={[]} />
      </MemoryRouter>,
    );

    // "Espécie 0" casa com 9 das 14 árvores
    await user.type(screen.getByPlaceholderText('Buscar por nome ou espécie...'), 'Espécie 0');

    for (let i = 0; i < 10; i++) {
      intersect();
      expect(shownCount()).toBeLessThanOrEqual(9);
    }

    expect(shownCount()).toBe(9);
  });
});
