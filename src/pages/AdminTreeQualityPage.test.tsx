import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { staticTrees } from '../data/trees';
import { useAdminTreeQuality } from '../hooks/useAdminTreeQuality';
import { TREE_INFORMATION_FIELDS } from '../lib/treeQuality';
import type { Arvore } from '../types/tree';
import { AdminTreeQualityPage } from './AdminTreeQualityPage';

vi.mock('../hooks/useAdminTreeQuality', () => ({
  useAdminTreeQuality: vi.fn(),
}));

vi.mock('../components/admin/TreeFormModal', () => ({
  TreeFormModal: ({ isOpen, tree }: { isOpen: boolean; tree: { nome_popular: string } | null }) => (
    isOpen ? <div role="dialog">Editando {tree?.nome_popular}</div> : null
  ),
}));

const mockUseAdminTreeQuality = vi.mocked(useAdminTreeQuality);
const retry = vi.fn();

const informationDefaults = Object.fromEntries(TREE_INFORMATION_FIELDS.map(({ field }) => [
  field,
  /(_m|_cm|_kg|_pct)$/.test(field) ? 1 : 'preenchido',
])) as Partial<Arvore>;

function makeTree(overrides: Partial<Arvore> = {}): Arvore {
  return {
    ...staticTrees[0],
    ...informationDefaults,
    id: 1,
    nome_popular: 'Ipê-amarelo',
    nome_cientifico: 'Handroanthus albus',
    ativa: true,
    faixa_serv_min_m_recomendada: 1,
    berco_area_min_m2_recomendada: 1,
    compat_fiacao: 'A',
    copa_classe: 'Pequena',
    porte_altura_classe: 'Pequeno',
    potencial_dano_calcada_1a5: 2,
    tolerancia_sol_pleno: true,
    tolerancia_meia_sombra: true,
    tolerancia_sombra: false,
    tolerancia_seca_1a5: 3,
    tolerancia_encharcamento_1a5: 3,
    tolerancia_compactacao_solo_1a5: 3,
    potencial_sujeira_1a5: 2,
    presenca_espinhos: false,
    presenca_subst_irritantes: false,
    atracao_fauna_1a5: 3,
    tolerancia_poda_1a5: 3,
    tolerancia_poluicao_atmosferica_1a5: 3,
    tolerancia_ventos_fortes_1a5: 3,
    potencial_sombra_1a5: 3,
    contribuicao_biodiversidade_1a5: 3,
    origem: 'Nativa BR',
    decidua_perenifolia: 'Perenifólia',
    ...overrides,
  };
}

describe('AdminTreeQualityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminTreeQuality.mockReturnValue({
      trees: [
        makeTree({
          id: 1,
          nome_popular: 'Manacá-da-serra',
          foto: null,
          faixa_serv_min_m_recomendada: null,
        }),
        makeTree({
          id: 2,
          nome_popular: 'Ipê-amarelo',
          tolerancia_poda_1a5: null,
        }),
        makeTree({
          id: 3,
          nome_popular: 'Oiti',
          ativa: false,
          compat_fiacao: null,
        }),
      ],
      isLoading: false,
      isConfigured: true,
      error: null,
      retry,
    });
  });

  it('shows separate recommendation and complementary summaries, excluding inactive trees by default', () => {
    render(<AdminTreeQualityPage />);

    expect(screen.getByRole('heading', { name: 'Qualidade do catálogo' })).toBeInTheDocument();
    expect(screen.getByText('Escopo: 2 árvores ativas · 2 lacunas do recomendador · 1 ausência complementar.')).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText('Manacá-da-serra')).toBeInTheDocument();
    expect(within(table).getByText('Ipê-amarelo')).toBeInTheDocument();
    expect(within(table).queryByText('Oiti')).not.toBeInTheDocument();
    expect(screen.getByText('Dados complementares ausentes')).toBeInTheDocument();
  });

  it('provides responsive tree cards for mobile and reserves the wide table for desktop', () => {
    render(<AdminTreeQualityPage />);

    expect(screen.getByRole('region', { name: 'Lista de árvores filtradas' })).toHaveClass('lg:hidden');
    expect(screen.getByRole('article', { name: 'Árvore Manacá-da-serra' })).toBeInTheDocument();
    expect(screen.getByRole('table').parentElement).toHaveClass('hidden', 'lg:block');
  });

  it('filters trees by search and recommendation impact', () => {
    render(<AdminTreeQualityPage />);

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome popular ou científico...'), {
      target: { value: 'ipê' },
    });
    const table = screen.getByRole('table');
    expect(within(table).getByText('Ipê-amarelo')).toBeInTheDocument();
    expect(within(table).queryByText('Manacá-da-serra')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por tipo de dado ausente'), {
      target: { value: 'eligibility' },
    });
    expect(within(table).queryByText('Ipê-amarelo')).not.toBeInTheDocument();
  });

  it('filters complementary gaps without treating them as recommendation gaps', () => {
    render(<AdminTreeQualityPage />);

    fireEvent.change(screen.getByLabelText('Filtrar por tipo de dado ausente'), {
      target: { value: 'information' },
    });
    const table = screen.getByRole('table');
    expect(within(table).getByText('Manacá-da-serra')).toBeInTheDocument();
    expect(within(table).queryByText('Ipê-amarelo')).not.toBeInTheDocument();
    expect(within(table).getByText('1 informativos')).toBeInTheDocument();
  });

  it('shows detailed field state, expected format, effect and questionnaire context in the side panel', () => {
    render(<AdminTreeQualityPage />);

    fireEvent.click(within(screen.getByRole('article', { name: 'Árvore Manacá-da-serra' }))
      .getByRole('button', { name: 'Ver análise de Manacá-da-serra' }));

    const panel = screen.getByRole('dialog', { name: 'Manacá-da-serra' });
    expect(within(panel).getByText('faixa_serv_min_m_recomendada')).toBeInTheDocument();
    expect(within(panel).getAllByText('NULL no banco').length).toBeGreaterThanOrEqual(2);
    expect(within(panel).getByText('A comparação com a faixa disponível é ignorada; a árvore pode passar sem essa checagem de espaço.')).toBeInTheDocument();
    expect(within(panel).getByText('Qual a largura efetiva da faixa de serviço (m)?')).toBeInTheDocument();
    expect(within(panel).getByText('Foto')).toBeInTheDocument();
    expect(within(panel).getByText('Informativo')).toBeInTheDocument();
  });

  it('closes the analysis panel from its visible footer button', () => {
    render(<AdminTreeQualityPage />);

    fireEvent.click(within(screen.getByRole('article', { name: 'Árvore Manacá-da-serra' }))
      .getByRole('button', { name: 'Ver análise de Manacá-da-serra' }));

    const panel = screen.getByRole('dialog', { name: 'Manacá-da-serra' });
    fireEvent.click(within(panel).getByRole('button', { name: 'Fechar análise' }));

    expect(screen.queryByRole('dialog', { name: 'Manacá-da-serra' })).not.toBeInTheDocument();
  });

  it('filters by a frequent missing field and edits the tree from its analysis panel', () => {
    render(<AdminTreeQualityPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Largura mínima da faixa de serviço: 1 árvore com campo ausente' }));
    const table = screen.getByRole('table');
    expect(within(table).getByText('Manacá-da-serra')).toBeInTheDocument();
    expect(within(table).queryByText('Ipê-amarelo')).not.toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('article', { name: 'Árvore Manacá-da-serra' }))
      .getByRole('button', { name: 'Ver análise de Manacá-da-serra' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Manacá-da-serra' })).getByRole('button', { name: 'Editar ficha' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Editando Manacá-da-serra');
  });

  it('paginates filtered trees and returns to the first page when the search changes', () => {
    const manyTrees = Array.from({ length: 12 }, (_, index) => makeTree({
      id: index + 1,
      nome_popular: `Árvore ${String(index + 1).padStart(2, '0')}`,
      nome_cientifico: `Species ${index + 1}`,
    }));
    mockUseAdminTreeQuality.mockReturnValue({
      trees: manyTrees,
      isLoading: false,
      isConfigured: true,
      error: null,
      retry,
    });

    render(<AdminTreeQualityPage />);

    expect(screen.getByText('Exibindo 1–10 de 12 árvores filtradas.')).toBeInTheDocument();
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(10);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByText('Exibindo 11–12 de 12 árvores filtradas.')).toBeInTheDocument();
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(2);

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome popular ou científico...'), {
      target: { value: 'árvore' },
    });
    expect(screen.getByText('Exibindo 1–10 de 12 árvores filtradas.')).toBeInTheDocument();
  });

  it('can include inactive trees and open their analysis', () => {
    render(<AdminTreeQualityPage />);

    fireEvent.change(screen.getByLabelText('Escopo do catálogo'), {
      target: { value: 'all' },
    });
    const table = screen.getByRole('table');
    expect(within(table).getByText('Oiti')).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('article', { name: 'Árvore Oiti' }))
      .getByRole('button', { name: 'Ver análise de Oiti' }));
    expect(screen.getByRole('dialog', { name: 'Oiti' })).toBeInTheDocument();
  });

  it('explains that a local catalog query failed and offers retry', () => {
    mockUseAdminTreeQuality.mockReturnValue({
      trees: [],
      isLoading: false,
      isConfigured: true,
      error: 'load-failed',
      retry,
    });

    render(<AdminTreeQualityPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(screen.getByText(/Não foi possível carregar as árvores do Supabase/)).toBeInTheDocument();
    expect(retry).toHaveBeenCalledOnce();
  });
});
