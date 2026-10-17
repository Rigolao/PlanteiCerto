import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultScreen } from './ResultScreen';
import { staticTrees } from '../../data/trees';
import type {
  CriteriaSummary,
  PendingTree,
  RecommendedTree,
  ScoreCriterion,
} from '../../types/recommendation';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useFavorites: vi.fn(),
  useTreeProvenance: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('../../hooks/useFavorites', () => ({ useFavorites: mocks.useFavorites }));
vi.mock('../../hooks/useTreeProvenance', () => ({
  useTreeProvenance: mocks.useTreeProvenance,
}));

const CRITERIA: CriteriaSummary = {
  eliminatory: ['Fiação convencional', 'Fiação a < 4m'],
  classificatory: ['Local: Calçada'],
};

function criterion(overrides: Partial<ScoreCriterion> = {}): ScoreCriterion {
  return { label: 'Tolerância à seca', points: 16, maxPoints: 20, status: 'avaliado', ...overrides };
}

function approved(overrides: Partial<RecommendedTree> = {}): RecommendedTree {
  return {
    ...staticTrees[0],
    id: 1,
    nome_popular: 'Ipê Amarelo',
    nome_cientifico: 'Handroanthus albus',
    foto: 'https://example.com/ipe.jpg',
    score: 82,
    scoreBreakdown: [criterion()],
    ...overrides,
  };
}

function pending(overrides: Partial<PendingTree> = {}): PendingTree {
  return {
    ...staticTrees[1],
    id: 2,
    nome_popular: 'Quaresmeira',
    nome_cientifico: 'Tibouchina granulosa',
    foto: null,
    score: 55,
    scoreBreakdown: [criterion()],
    pendencias: ['Compatibilidade com fiação: não avaliado'],
    ...overrides,
  };
}

type Props = Partial<React.ComponentProps<typeof ResultScreen>>;

function renderScreen(props: Props = {}) {
  return render(
    <ResultScreen
      trees={[approved()]}
      pendingTrees={[pending()]}
      eliminatedCount={3}
      totalCount={5}
      criteriaSummary={CRITERIA}
      onRestart={() => {}}
      onEdit={() => {}}
      onClose={() => {}}
      {...props}
    />,
  );
}

function pendingSection(): HTMLElement {
  return screen.getByRole('region', { name: 'Requer avaliação técnica' });
}

function approvedGrid(): HTMLElement {
  return screen.getByRole('region', { name: 'Espécies recomendadas' });
}

beforeEach(() => {
  mocks.useAuth.mockReset();
  mocks.useFavorites.mockReset();
  mocks.useTreeProvenance.mockReset();
  mocks.useAuth.mockReturnValue({ user: null });
  mocks.useFavorites.mockReturnValue({ toggleFavorite: vi.fn(), isFavorite: () => false });
  mocks.useTreeProvenance.mockReturnValue({ provenance: {}, loading: false, disponivel: false });
});

describe('ResultScreen: requer avaliação técnica', () => {
  it('lists the pending species with the per-criterion reason, outside the main grid', () => {
    renderScreen();

    const section = pendingSection();
    expect(within(section).getByText('Quaresmeira')).toBeInTheDocument();
    expect(within(section).getByText('Tibouchina granulosa')).toBeInTheDocument();
    expect(
      within(section).getByText('Compatibilidade com fiação: não avaliado'),
    ).toBeInTheDocument();

    const grid = approvedGrid();
    expect(within(grid).getByText('Ipê Amarelo')).toBeInTheDocument();
    expect(within(grid).queryByText('Quaresmeira')).not.toBeInTheDocument();
  });

  it('places the pending section after the main grid', () => {
    renderScreen();

    const position = approvedGrid().compareDocumentPosition(pendingSection());
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('lists every pending criterion of a species', () => {
    renderScreen({
      pendingTrees: [
        pending({
          pendencias: [
            'Compatibilidade com fiação: não avaliado',
            'Porte: não avaliado',
          ],
        }),
      ],
    });

    const section = pendingSection();
    expect(within(section).getAllByRole('listitem')).toHaveLength(2);
    expect(within(section).getByText('Porte: não avaliado')).toBeInTheDocument();
  });

  it('does not render the section when there are no pending species', () => {
    renderScreen({ pendingTrees: [] });

    expect(screen.queryByRole('region', { name: 'Requer avaliação técnica' })).not.toBeInTheDocument();
    expect(screen.queryByText('Requer avaliação técnica')).not.toBeInTheDocument();
  });

  it('opens the species sheet when a pending card is clicked', async () => {
    renderScreen();

    // A ficha (TreeDetailModal) é a única que usa o nome da espécie como h2.
    const fichaHeading = { level: 2, name: 'Quaresmeira' };
    expect(screen.queryByRole('heading', fichaHeading)).not.toBeInTheDocument();
    await userEvent.click(within(pendingSection()).getByRole('button', { name: /Quaresmeira/ }));

    expect(await screen.findByRole('heading', fichaHeading)).toBeInTheDocument();
  });

  it('shows the pending section instead of the empty state when no species was approved', () => {
    renderScreen({ trees: [], eliminatedCount: 2, totalCount: 3 });

    expect(screen.queryByText('Nenhuma espécie compatível encontrada')).not.toBeInTheDocument();
    expect(within(pendingSection()).getByText('Quaresmeira')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Espécies recomendadas' })).not.toBeInTheDocument();
  });

  it('keeps the empty state when nothing was approved and nothing is pending', () => {
    renderScreen({ trees: [], pendingTrees: [], eliminatedCount: 5, totalCount: 5 });

    expect(screen.getByText('Nenhuma espécie compatível encontrada')).toBeInTheDocument();
    expect(screen.queryByText('Requer avaliação técnica')).not.toBeInTheDocument();
  });

  it('counts the pending species in the header', () => {
    const { unmount } = renderScreen();
    expect(screen.getByText(/1 requer avaliação técnica/)).toBeInTheDocument();
    unmount();

    renderScreen({
      pendingTrees: [pending(), pending({ id: 3, nome_popular: 'Jacarandá' })],
      totalCount: 6,
    });
    expect(screen.getByText(/2 requerem avaliação técnica/)).toBeInTheDocument();
  });

  it('omits the pending count from the header when there are none', () => {
    renderScreen({ pendingTrees: [] });

    expect(screen.queryByText(/requer(em)? avaliação técnica/)).not.toBeInTheDocument();
  });
});

describe('ResultScreen: destaques da árvore', () => {
  it('marks an estimated score item with the "estimativa" seal', () => {
    renderScreen({
      trees: [
        approved({
          scoreBreakdown: [
            criterion({ label: 'Tolerância à seca', status: 'estimado' }),
            criterion({ label: 'Insolação (sol pleno)', points: 20, maxPoints: 20, status: 'avaliado' }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    const estimated = screen.getByText('Tolerância à seca').closest('div');
    expect(estimated).not.toBeNull();
    expect(within(estimated as HTMLElement).getByText('estimativa')).toBeInTheDocument();
    expect(screen.getAllByText('estimativa')).toHaveLength(1);
  });

  it('never lists a "não avaliado" item among the highlights', () => {
    renderScreen({
      trees: [
        approved({
          scoreBreakdown: [
            criterion({ label: 'Insolação (sol pleno)', points: 20, maxPoints: 20 }),
            criterion({
              label: 'Tolerância à seca (não avaliado)',
              points: 0,
              maxPoints: 20,
              status: 'nao_avaliado',
            }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    expect(screen.getByText('Insolação (sol pleno)')).toBeInTheDocument();
    // Nenhuma barra para o item sem dado: só o item avaliado tem "pontos/máximo".
    expect(screen.getByText('20/20')).toBeInTheDocument();
    expect(screen.queryByText('0/20')).not.toBeInTheDocument();
    expect(screen.queryByText('Tolerância à seca (não avaliado)')).not.toBeInTheDocument();
  });

  it('does not count a "não avaliado" item as scored', () => {
    renderScreen({
      trees: [
        approved({
          scoreBreakdown: [
            criterion({ label: 'A', points: 20 }),
            criterion({ label: 'B', points: 16 }),
            criterion({ label: 'C', points: 12 }),
            criterion({ label: 'D (não avaliado)', points: 0, status: 'nao_avaliado' }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    expect(screen.queryByText(/outros critérios pontuados/)).not.toBeInTheDocument();
  });
});

describe('ResultScreen: critérios não avaliados no cartão aprovado', () => {
  it('shows a discreet line with the count and 0 points, listing the unassessed criteria', () => {
    renderScreen({
      trees: [
        approved({
          scoreBreakdown: [
            criterion({ label: 'Insolação (sol pleno)', points: 20, maxPoints: 20 }),
            criterion({ label: 'Tolerância à seca (não avaliado)', points: 0, maxPoints: 20, status: 'nao_avaliado' }),
            criterion({ label: 'Potencial de sombra (não avaliado)', points: 0, maxPoints: 20, status: 'nao_avaliado' }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    const linha = within(approvedGrid()).getByText('2 critérios não avaliados — 0 ponto');
    expect(linha).toHaveAttribute('title', 'Tolerância à seca, Potencial de sombra');
    // Rótulos acessíveis também para leitor de tela, sem o sufixo repetido.
    expect(linha).toHaveTextContent('Tolerância à seca, Potencial de sombra');
  });

  it('uses the singular for a single unassessed criterion', () => {
    renderScreen({
      trees: [
        approved({
          scoreBreakdown: [
            criterion({ label: 'Insolação (sol pleno)', points: 20, maxPoints: 20 }),
            criterion({ label: 'Tolerância à seca (não avaliado)', points: 0, maxPoints: 20, status: 'nao_avaliado' }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    expect(screen.getByText('1 critério não avaliado — 0 ponto')).toBeInTheDocument();
    expect(screen.queryByText(/critérios não avaliados/)).not.toBeInTheDocument();
  });

  it('does not show the line when every score item was assessed', () => {
    renderScreen({
      trees: [approved({ scoreBreakdown: [criterion({ status: 'avaliado' }), criterion({ label: 'B', status: 'estimado' })] })],
      pendingTrees: [],
    });

    expect(screen.queryByText(/não avaliados?\b.*0 ponto/)).not.toBeInTheDocument();
  });

  it('keeps unassessed items out of the highlights and of the "outros critérios" count', () => {
    renderScreen({
      trees: [
        approved({
          scoreBreakdown: [
            criterion({ label: 'A', points: 20 }),
            criterion({ label: 'B', points: 16 }),
            criterion({ label: 'C', points: 12 }),
            criterion({ label: 'D (não avaliado)', points: 0, status: 'nao_avaliado' }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    expect(screen.getByText('1 critério não avaliado — 0 ponto')).toBeInTheDocument();
    expect(screen.queryByText('0/20')).not.toBeInTheDocument();
    expect(screen.queryByText(/outros critérios pontuados/)).not.toBeInTheDocument();
  });

  it('counts the unassessed criteria of each approved card separately', () => {
    renderScreen({
      trees: [
        approved({
          id: 1,
          scoreBreakdown: [criterion({ label: 'X (não avaliado)', points: 0, status: 'nao_avaliado' })],
        }),
        approved({
          id: 3,
          nome_popular: 'Jacarandá',
          scoreBreakdown: [
            criterion({ label: 'Y (não avaliado)', points: 0, status: 'nao_avaliado' }),
            criterion({ label: 'Z (não avaliado)', points: 0, status: 'nao_avaliado' }),
          ],
        }),
      ],
      pendingTrees: [],
    });

    expect(screen.getByText('1 critério não avaliado — 0 ponto')).toBeInTheDocument();
    expect(screen.getByText('2 critérios não avaliados — 0 ponto')).toBeInTheDocument();
  });
});

describe('ResultScreen: cartão da espécie', () => {
  it('shows the generic image caption when the species has no photo', () => {
    renderScreen({ trees: [approved({ foto: null })], pendingTrees: [] });

    expect(screen.getByText('Imagem ilustrativa — espécie sem foto')).toBeInTheDocument();
  });

  it('shows the photo when there is one', () => {
    renderScreen({ pendingTrees: [] });

    expect(screen.getByRole('img', { name: 'Ipê Amarelo' })).toHaveAttribute(
      'src',
      'https://example.com/ipe.jpg',
    );
  });

  it('treats a zero height as a valid value in the chips', () => {
    renderScreen({ trees: [approved({ altura_adulta_max_m: 0 })], pendingTrees: [] });

    expect(within(approvedGrid()).getByText('0 m')).toBeInTheDocument();
  });

  it('formats the height chip with the unit', () => {
    renderScreen({ trees: [approved({ altura_adulta_max_m: 12.5 })], pendingTrees: [] });

    expect(within(approvedGrid()).getByText('12,5 m')).toBeInTheDocument();
  });

  it('omits the size chips when porte and height are missing', () => {
    renderScreen({
      trees: [approved({ porte_altura_classe: null, altura_adulta_max_m: null })],
      pendingTrees: [],
    });

    const grid = approvedGrid();
    expect(within(grid).queryByText(/^Porte /)).not.toBeInTheDocument();
    expect(within(grid).queryByText(/ m$/)).not.toBeInTheDocument();
  });

  it('shows the porte chip when the class is known', () => {
    renderScreen({
      trees: [approved({ porte_altura_classe: 'Médio' })],
      pendingTrees: [],
    });

    expect(within(approvedGrid()).getByText('Porte Médio')).toBeInTheDocument();
  });
});
