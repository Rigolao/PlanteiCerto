import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { TreeDetailModal } from './TreeDetailModal';
import { staticTrees } from '../../data/trees';
import type { Arvore } from '../../types/tree';
import type { ProvenanceMap, ProvenanceRecord } from '../../types/provenance';

const mocks = vi.hoisted(() => ({ useTreeProvenance: vi.fn() }));

vi.mock('../../hooks/useTreeProvenance', () => ({
  useTreeProvenance: mocks.useTreeProvenance,
}));

const NOTA_FAIXA = 'Faixa operacional de incerteza; não é intervalo de confiança estatístico.';

/** `disponivel` espelha o hook: true = consulta resolvida (mesmo sem registros); false = Supabase ausente/falha. */
function withProvenance(provenance: ProvenanceMap, disponivel = true) {
  mocks.useTreeProvenance.mockReturnValue({ provenance, loading: false, disponivel });
}

function prov(campo: string, overrides: Partial<ProvenanceRecord> = {}): ProvenanceRecord {
  return {
    campo,
    variavel: null,
    idade_anos: null,
    unidade: null,
    min_operacional: null,
    max_operacional: null,
    origem: 'estimated',
    confianca: null,
    metodo: null,
    fonte: null,
    observacao: null,
    valor_alterado_em: null,
    ...overrides,
  };
}

/** Linha de atributo: o rótulo e o valor ficam no mesmo contêiner. */
function row(label: string): HTMLElement {
  const parent = screen.getByText(label).parentElement;
  if (!parent) throw new Error(`Linha "${label}" sem contêiner`);
  return parent;
}

/** Tile, linha de escala ou célula de projeção pelo campo principal (`data-campo`), em qualquer aba. */
function item(campo: keyof Arvore): HTMLElement {
  const elemento = document.querySelector<HTMLElement>(`[data-campo="${campo}"]`);
  if (!elemento) throw new Error(`Item "${campo}" não encontrado`);
  return elemento;
}

/** Botões "Ver detalhes" de um trecho, inclusive em abas fechadas (montadas com `hidden`). */
function botoesDetalhes(container: HTMLElement = document.body): HTMLElement[] {
  return within(container).queryAllByRole('button', { name: 'Ver detalhes', hidden: true });
}

/** Os cinco painéis, na ordem das abas, abertos ou não. */
function paineis(): HTMLElement[] {
  return screen.getAllByRole('tabpanel', { hidden: true });
}

async function abrirAba(user: ReturnType<typeof userEvent.setup>, rotulo: string) {
  await user.click(screen.getByRole('tab', { name: rotulo }));
}

function tabela(): Promise<HTMLElement> {
  return screen.findByRole('table', { name: 'Projeção de crescimento', hidden: true });
}

beforeEach(() => {
  mocks.useTreeProvenance.mockReset();
  withProvenance({}, false);
});

describe('TreeDetailModal tabs', () => {
  it('opens on Visão geral with the six main attributes', () => {
    render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveAttribute('aria-selected', 'true');
    const visivel = screen.getByRole('tabpanel');
    for (const rotulo of [
      'Altura adulta (porte)', 'Copa (diâmetro e classe)', 'Forma da copa', 'Folhagem', 'Rede elétrica (fiação)', 'Espinhos',
    ]) {
      expect(within(visivel).getByText(rotulo)).toBeInTheDocument();
    }
  });

  it('shows one panel at a time', async () => {
    const user = userEvent.setup();
    render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    await abrirAba(user, 'Urbano');

    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Urbano');
    // O Modal entra com opacidade 0 (animação), então a visibilidade se prova pelo `hidden` do painel.
    expect(item('faixa_serv_min_m_recomendada').closest('[role="tabpanel"]')).not.toHaveAttribute('hidden');
    expect(item('compat_fiacao').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
  });

  it('opens on Visão geral every time the sheet is opened, even for the same species', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    await abrirAba(user, 'Benefícios');
    // As páginas fecham a ficha com arvore=null e isOpen=false, e reabrem pelo clique no card.
    rerender(<TreeDetailModal arvore={null} isOpen={false} onClose={vi.fn()} />);
    rerender(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Visão geral');
  });

  it('goes back to Visão geral when another species is shown', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    await abrirAba(user, 'Benefícios');
    rerender(<TreeDetailModal arvore={{ ...staticTrees[1] }} isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the color legend only on tabs with 1–5 grades', () => {
    render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    expect(paineis().map(painel => within(painel).queryByText('Favorável') != null))
      .toEqual([false, true, true, true, false]);
  });

  it('places the color legend right before the first group of 1–5 grades', () => {
    render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    const legenda = within(paineis()[2]).getByText('Favorável').closest('div');
    expect(legenda?.nextElementSibling).toHaveTextContent('Riscos e manejo, de 1 a 5');
  });

  it('paints sidewalk damage 5 and drought 2 with the low level', () => {
    const tree: Arvore = { ...staticTrees[0], potencial_dano_calcada_1a5: 5, tolerancia_seca_1a5: 2, tolerancia_ventos_fortes_1a5: 4 };
    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(item('potencial_dano_calcada_1a5').querySelectorAll('.bg-nivel-baixo')).toHaveLength(5);
    expect(item('tolerancia_seca_1a5').querySelectorAll('.bg-nivel-baixo')).toHaveLength(2);
    expect(item('tolerancia_ventos_fortes_1a5').querySelectorAll('.bg-nivel-alto')).toHaveLength(4);
  });

  it('ends Visão geral with the origin summary only when provenance resolved', () => {
    withProvenance({}, true);
    const { unmount } = render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);
    expect(within(paineis()[0]).getByText('Origem dos dados nesta ficha')).toBeInTheDocument();
    unmount();

    withProvenance({}, false);
    render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);
    expect(screen.queryByText('Origem dos dados nesta ficha')).not.toBeInTheDocument();
  });

  it('counts unassessed attributes in each tab header', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_sol_pleno: null,
      tolerancia_meia_sombra: null,
      tolerancia_sombra: null,
      tolerancia_seca_1a5: null,
      tolerancia_encharcamento_1a5: null,
      tolerancia_poluicao_atmosferica_1a5: null,
      tolerancia_compactacao_solo_1a5: null,
      tolerancia_ventos_fortes_1a5: null,
    };
    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(paineis()[1]).getByText('8 atributos · 8 não avaliados')).toBeInTheDocument();
  });

  it('shows only photo, names and origin above the tabs', () => {
    const tree: Arvore = { ...staticTrees[0], foto: 'https://example.com/oiti.jpg' };
    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: tree.nome_popular })).toBeInTheDocument();
    expect(screen.getByText(tree.nome_cientifico)).toBeInTheDocument();
    expect(screen.getByText(tree.origem === 'Nativa BR' ? 'Nativa BR' : 'Exótica')).toBeInTheDocument();
    expect(screen.getByRole('tablist').compareDocumentPosition(screen.getByText('Altura adulta (porte)')))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});

describe('TreeDetailModal growth projections', () => {
  it('shows projections for all horizons, available ranges, and existing ten-year indicators', async () => {
    const tree: Arvore = {
      ...staticTrees[0],
      dap_10a_cm: 9.45632,
      dap_10a_min_cm: 9.45632,
      dap_10a_max_cm: 9.45632,
      altura_10a_m: 8.4,
      altura_10a_min_m: 6.18,
      altura_10a_max_m: 10.11,
      dap_20a_cm: 16.836539,
      dap_20a_min_cm: 16.836539,
      dap_20a_max_cm: 16.836539,
      altura_20a_m: 12,
      altura_20a_min_m: 12,
      altura_20a_max_m: 12,
      dap_30a_cm: 21.130801,
      dap_30a_min_cm: 21.130801,
      dap_30a_max_cm: 21.130801,
      altura_30a_m: null,
      altura_30a_min_m: null,
      altura_30a_max_m: null,
      co2e_10a_kg: 45.1405,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await tabela();
    expect(within(table).getByText('10 anos')).toBeInTheDocument();
    expect(within(table).getByText('20 anos')).toBeInTheDocument();
    expect(within(table).getByText('30 anos')).toBeInTheDocument();
    expect(within(table).getByText('9,46 cm')).toBeInTheDocument();
    expect(within(table).getByText('6,18–10,11 m')).toBeInTheDocument();
    expect(within(table).getByText('16,84 cm')).toBeInTheDocument();
    expect(within(table).getByText('21,13 cm')).toBeInTheDocument();
    expect(within(table).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(table).queryByText('—')).not.toBeInTheDocument();
    expect(screen.getByText('CO₂ equivalente armazenado na biomassa aérea')).toBeInTheDocument();
    expect(screen.getByText('45,1 kg')).toBeInTheDocument();
    expect(screen.getByText('2,5–3,5 m')).toBeInTheDocument();
  });

  it('shows the six projection cells as "Não avaliado" when no growth value exists, matching the tab count', async () => {
    const tree: Arvore = { ...staticTrees[0] };
    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: tree.nome_popular })).toBeInTheDocument();
    const table = await tabela();
    expect(within(table).getAllByText('Não avaliado')).toHaveLength(6);
    expect(within(paineis()[4]).getByText(/^6 atributos · 6 não avaliados$/)).toBeInTheDocument();
  });

  it('describes the planting scenario once, as the Crescimento tab description', () => {
    render(<TreeDetailModal arvore={staticTrees[0]} isOpen onClose={vi.fn()} />);

    expect(screen.getAllByText('Muda de DAP 3 cm e altura 1,5 m, plantada em boas condições.')).toHaveLength(1);
    expect(within(paineis()[4]).getByText('Muda de DAP 3 cm e altura 1,5 m, plantada em boas condições.')).toBeInTheDocument();
  });
});

describe('TreeDetailModal provenance', () => {
  it('queries provenance only while the modal is open', () => {
    const tree: Arvore = { ...staticTrees[0], id: 77 };
    const { rerender } = render(<TreeDetailModal arvore={tree} isOpen={false} onClose={vi.fn()} />);
    expect(mocks.useTreeProvenance).toHaveBeenLastCalledWith(null);

    rerender(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);
    expect(mocks.useTreeProvenance).toHaveBeenLastCalledWith(77);
  });

  it('shows a published point (min = max) as value + badge, never as a range', async () => {
    const jequitiba: Arvore = {
      ...staticTrees[0],
      id: 77,
      nome_popular: 'Jequitibá-rosa',
      dap_10a_cm: 12.17,
      dap_10a_min_cm: 12.17,
      dap_10a_max_cm: 12.17,
    };
    withProvenance({
      dap_10a_cm: prov('dap_10a_cm', {
        variavel: 'dap',
        idade_anos: 10,
        unidade: 'cm',
        min_operacional: 12.17,
        max_operacional: 12.17,
        origem: 'published_table',
        confianca: 'alta',
      }),
    });

    render(<TreeDetailModal arvore={jequitiba} isOpen onClose={vi.fn()} />);

    const table = await tabela();
    expect(within(table).getByText('12,17 cm')).toBeInTheDocument();
    expect(within(table).getByText('Publicado')).toBeInTheDocument();
    expect(within(table).getByText('ponto publicado')).toBeInTheDocument();
    expect(within(table).queryByText(/–/)).not.toBeInTheDocument();
    expect(within(table).queryByText('faixa operacional')).not.toBeInTheDocument();
    expect(screen.queryByText(NOTA_FAIXA)).not.toBeInTheDocument();
  });

  it('labels a min ≠ max range as operational and explains it once', async () => {
    const tree: Arvore = {
      ...staticTrees[0],
      dap_10a_cm: 13.37,
      dap_10a_min_cm: 10.1,
      dap_10a_max_cm: 15.4,
      altura_10a_m: 8.4,
      altura_10a_min_m: 6.18,
      altura_10a_max_m: 10.11,
    };
    withProvenance({
      dap_10a_cm: prov('dap_10a_cm', { origem: 'estimated' }),
      altura_10a_m: prov('altura_10a_m', { origem: 'estimated' }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await tabela();
    expect(within(table).getByText('10,1–15,4 cm')).toBeInTheDocument();
    expect(within(table).getByText('6,18–10,11 m')).toBeInTheDocument();
    expect(within(table).getAllByText('faixa operacional')).toHaveLength(2);
    expect(within(table).getAllByText('Estimado')).toHaveLength(2);
    expect(screen.getAllByText(NOTA_FAIXA)).toHaveLength(1);
  });

  it('reveals source, method, confidence and note of a cell on "Ver detalhes"', async () => {
    const user = userEvent.setup();
    const tree: Arvore = { ...staticTrees[0], dap_10a_cm: 13.37, dap_10a_min_cm: 10.1, dap_10a_max_cm: 15.4 };
    withProvenance({
      dap_10a_cm: prov('dap_10a_cm', {
        origem: 'estimated',
        fonte: 'Lorenzi (2002), tab. 3',
        metodo: 'Regressão por porte',
        confianca: 'media',
        observacao: 'Extrapolado da classe de porte',
      }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    await abrirAba(user, 'Crescimento');
    const table = await screen.findByRole('table', { name: 'Projeção de crescimento' });
    expect(screen.queryByText('Lorenzi (2002), tab. 3')).not.toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'Ver detalhes' }));

    expect(screen.getByText('Lorenzi (2002), tab. 3')).toBeInTheDocument();
    expect(screen.getByText('Regressão por porte')).toBeInTheDocument();
    expect(screen.getByText('media')).toBeInTheDocument();
    expect(screen.getByText('Extrapolado da classe de porte')).toBeInTheDocument();
  });

  it('identifies a rubric grade as an estimate with its confidence', () => {
    const tree: Arvore = { ...staticTrees[0], tolerancia_seca_1a5: 3 };
    withProvenance({
      tolerancia_seca_1a5: prov('tolerancia_seca_1a5', { origem: 'estimated_rubric', confianca: 'baixa' }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Estimado (rubrica)')).toBeInTheDocument();
    expect(screen.getByText('confiança baixa')).toBeInTheDocument();
    expect(within(item('tolerancia_seca_1a5')).queryByText('Não avaliado')).not.toBeInTheDocument();
  });

  it('shows the short origin label for the other origin classes on light, wiring and thorns', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_sol_pleno: true,
      compat_fiacao: 'C',
      presenca_espinhos: false,
      presenca_subst_irritantes: false,
    };
    withProvenance({
      tolerancia_sol_pleno: prov('tolerancia_sol_pleno', { origem: 'published_description' }),
      compat_fiacao: prov('compat_fiacao', { origem: 'retido_da_fase_anterior' }),
      presenca_espinhos: prov('presenca_espinhos', { origem: 'consolidado_de_registro_inativo' }),
      presenca_subst_irritantes: prov('presenca_subst_irritantes', { origem: 'published_equation' }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('tolerancia_sol_pleno')).getByText('Publicado')).toBeInTheDocument();
    expect(within(item('compat_fiacao')).getByText('Fase anterior')).toBeInTheDocument();
    expect(within(item('presenca_espinhos')).getByText('Copiado de registro consolidado')).toBeInTheDocument();
    expect(within(item('presenca_subst_irritantes')).getByText('Calculado')).toBeInTheDocument();
  });

  it('warns when the value changed after its source was recorded', () => {
    const tree: Arvore = { ...staticTrees[0], tolerancia_seca_1a5: 4 };
    withProvenance({
      tolerancia_seca_1a5: prov('tolerancia_seca_1a5', {
        origem: 'published_table',
        valor_alterado_em: '2026-10-01T12:00:00Z',
      }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('tolerancia_seca_1a5')).getByText('Valor alterado após o registro da fonte')).toBeInTheDocument();
  });

  it('does not warn when the value was not changed', () => {
    const tree: Arvore = { ...staticTrees[0], tolerancia_seca_1a5: 4 };
    withProvenance({ tolerancia_seca_1a5: prov('tolerancia_seca_1a5', { origem: 'published_table' }) });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.queryByText('Valor alterado após o registro da fonte')).not.toBeInTheDocument();
  });

  it('renders values without badges or errors when provenance is unavailable', async () => {
    const tree: Arvore = {
      ...staticTrees[0],
      dap_10a_cm: 12.17,
      dap_10a_min_cm: 12.17,
      dap_10a_max_cm: 12.17,
      altura_10a_m: 8.4,
      altura_10a_min_m: 6.18,
      altura_10a_max_m: 10.11,
    };
    withProvenance({}, false);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await tabela();
    expect(within(table).getByText('12,17 cm')).toBeInTheDocument();
    expect(within(table).getByText('6,18–10,11 m')).toBeInTheDocument();
    expect(botoesDetalhes()).toHaveLength(0);
    expect(screen.queryByText('Publicado')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('ponto publicado')).not.toBeInTheDocument();
    expect(screen.queryByText('Origem não registrada')).not.toBeInTheDocument();
    expect(screen.queryByText('Origem dos dados nesta ficha')).not.toBeInTheDocument();
  });

  it('says "Origem não registrada" for filled values without a record once the query resolved', async () => {
    const tree: Arvore = {
      ...staticTrees[0],
      dap_10a_cm: 12.17,
      dap_10a_min_cm: 12.17,
      dap_10a_max_cm: 12.17,
      tolerancia_sol_pleno: true,
      tolerancia_seca_1a5: 4,
      compat_fiacao: 'C',
      presenca_espinhos: false,
      presenca_subst_irritantes: false,
    };
    withProvenance({}, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await tabela();
    expect(within(table).getAllByText('Origem não registrada')).toHaveLength(1);
    for (const campo of [
      'tolerancia_sol_pleno', 'tolerancia_seca_1a5', 'compat_fiacao', 'presenca_espinhos', 'presenca_subst_irritantes',
    ] as const) {
      expect(item(campo)).toHaveTextContent('Origem não registrada');
    }
    expect(within(item('compat_fiacao')).getByText('Compatível')).toBeInTheDocument();
    expect(botoesDetalhes()).toHaveLength(0);
  });

  it('does not say "Origem não registrada" for a field that has a record', () => {
    const tree: Arvore = { ...staticTrees[0], tolerancia_seca_1a5: 4 };
    withProvenance({ tolerancia_seca_1a5: prov('tolerancia_seca_1a5', { origem: 'published_table' }) }, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(item('tolerancia_seca_1a5')).not.toHaveTextContent('Origem não registrada');
    expect(item('tolerancia_seca_1a5')).toHaveTextContent('Publicado');
  });

  it('does not say "Origem não registrada" for a NULL field without a record, only "Não avaliado"', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_seca_1a5: null,
      tolerancia_sombra: null,
      compat_fiacao: null,
      presenca_espinhos: null,
      presenca_subst_irritantes: null,
    };
    withProvenance({}, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of [
      'tolerancia_seca_1a5', 'tolerancia_sombra', 'compat_fiacao', 'presenca_espinhos', 'presenca_subst_irritantes',
    ] as const) {
      expect(item(campo)).toHaveTextContent('Não avaliado');
      expect(item(campo)).not.toHaveTextContent('Origem não registrada');
    }
  });

  it('does not say "Origem não registrada" for a NULL projection cell', async () => {
    const tree: Arvore = { ...staticTrees[0], dap_10a_cm: 12.17, dap_10a_min_cm: 12.17, dap_10a_max_cm: 12.17 };
    withProvenance({}, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await tabela();
    // 1 célula preenchida (DAP 10a) sem registro; as 5 vazias só dizem "Não avaliado".
    expect(within(table).getAllByText('Origem não registrada')).toHaveLength(1);
    expect(within(table).getAllByText('Não avaliado')).toHaveLength(5);
  });
});

describe('TreeDetailModal unassessed attributes', () => {
  it('shows "Não avaliado" for wiring, irritants, thorns and shade when they are NULL', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      compat_fiacao: null,
      presenca_subst_irritantes: null,
      presenca_espinhos: null,
      tolerancia_sombra: null,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of ['compat_fiacao', 'presenca_subst_irritantes', 'presenca_espinhos', 'tolerancia_sombra'] as const) {
      expect(within(item(campo)).getByText('Não avaliado')).toBeInTheDocument();
    }
    expect(screen.queryByText('Não informado')).not.toBeInTheDocument();
  });

  it('keeps the known light and irritant values when they are present', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_sol_pleno: true,
      tolerancia_meia_sombra: false,
      tolerancia_sombra: false,
      presenca_subst_irritantes: true,
      compat_fiacao: 'A',
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('tolerancia_sol_pleno')).getByText('Sim')).toBeInTheDocument();
    expect(within(item('tolerancia_meia_sombra')).getByText('Não')).toBeInTheDocument();
    expect(within(item('presenca_subst_irritantes')).getByText('Sim')).toBeInTheDocument();
    expect(within(item('compat_fiacao')).getByText('Compatível c/ Alta Tensão')).toBeInTheDocument();
  });

  it('replaces the squares of a NULL 1–5 grade with "Não avaliado" and keeps the label', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_seca_1a5: null,
      tolerancia_encharcamento_1a5: 2,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const seca = item('tolerancia_seca_1a5');
    expect(within(seca).getByText('Seca')).toBeInTheDocument();
    expect(within(seca).getByText('Não avaliado')).toBeInTheDocument();
    expect(seca.querySelectorAll('[aria-hidden="true"] > span')).toHaveLength(0);

    const encharcamento = item('tolerancia_encharcamento_1a5');
    expect(within(encharcamento).queryByText('Não avaliado')).not.toBeInTheDocument();
    expect(encharcamento.querySelectorAll('[aria-hidden="true"] > span')).toHaveLength(5);
    expect(within(encharcamento).getByText('2/5')).toBeInTheDocument();
  });

  it('lists all eleven 1–5 grades even when every one is NULL', () => {
    const notas = [
      'tolerancia_seca_1a5', 'tolerancia_encharcamento_1a5', 'tolerancia_poluicao_atmosferica_1a5',
      'tolerancia_compactacao_solo_1a5', 'tolerancia_ventos_fortes_1a5', 'potencial_sujeira_1a5',
      'potencial_dano_calcada_1a5', 'atracao_fauna_1a5', 'potencial_sombra_1a5',
      'contribuicao_biodiversidade_1a5', 'tolerancia_poda_1a5',
    ] as const;
    const tree: Arvore = { ...staticTrees[0], ...Object.fromEntries(notas.map(campo => [campo, null])) };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of notas) {
      expect(within(item(campo)).getByText('Não avaliado')).toBeInTheDocument();
    }
  });
});

describe('TreeDetailModal carbon indicators', () => {
  const comCarbono: Arvore = {
    ...staticTrees[0],
    biomassa_aerea_10a_kg: 90.3,
    carbono_armazenado_10a_kg: 42.4,
    co2e_10a_kg: 155.7,
    sobrevivencia_10a_pct: 85,
    co2e_esperado_por_muda_10a_kg: 120.2,
  };

  it('names the stock as CO₂ equivalent stored in aboveground biomass, not as annual removal', () => {
    render(<TreeDetailModal arvore={comCarbono} isOpen onClose={vi.fn()} />);

    const co2e = row('CO₂ equivalente armazenado na biomassa aérea');
    expect(within(co2e).getByText('155,7 kg')).toBeInTheDocument();
    expect(within(co2e).getByText('estoque aos 10 anos; não é remoção anual')).toBeInTheDocument();
    expect(screen.queryByText('CO₂e capturado')).not.toBeInTheDocument();
    expect(screen.queryByText(/capturad/i)).not.toBeInTheDocument();
  });

  it('marks biomass, carbon and CO₂e as estimated calculations', () => {
    render(<TreeDetailModal arvore={comCarbono} isOpen onClose={vi.fn()} />);

    for (const label of ['Biomassa aérea', 'Carbono armazenado', 'CO₂ equivalente armazenado na biomassa aérea']) {
      expect(within(row(label)).getByText('Cálculo estimado')).toBeInTheDocument();
    }
    expect(within(row('Biomassa aérea')).getByText('90,3 kg')).toBeInTheDocument();
    expect(within(row('Carbono armazenado')).getByText('42,4 kg')).toBeInTheDocument();
  });

  it('presents survival as a scenario assumption, not a published species rate', () => {
    render(<TreeDetailModal arvore={comCarbono} isOpen onClose={vi.fn()} />);

    const sobrevivencia = row('Sobrevivência (cenário)');
    expect(within(sobrevivencia).getByText('85%')).toBeInTheDocument();
    expect(within(sobrevivencia).getByText('premissa do cenário, não taxa publicada da espécie')).toBeInTheDocument();
    expect(within(sobrevivencia).queryByText('Cálculo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Sobrevivência')).not.toBeInTheDocument();
  });

  it('explains the baseline and the extrapolation of the expected CO₂e per seedling', () => {
    render(<TreeDetailModal arvore={comCarbono} isOpen onClose={vi.fn()} />);

    const esperado = row('CO₂e esperado por muda');
    expect(within(esperado).getByText('120,2 kg')).toBeInTheDocument();
    expect(
      within(esperado).getByText('(CO₂e aos 10 anos − CO₂e da muda inicial) × sobrevivência do cenário'),
    ).toBeInTheDocument();
    expect(screen.queryByText('já descontada a mortalidade')).not.toBeInTheDocument();
    expect(screen.getByText(
      'A muda inicial (DAP 3 cm, altura 1,5 m) está abaixo da faixa de calibração da equação alométrica '
      + '(DAP ≥ 5 cm); o valor da linha de base é extrapolado.',
    )).toBeInTheDocument();
  });

  it('hides each carbon tile whose value is NULL and the baseline note without an expected CO₂e', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      biomassa_aerea_10a_kg: null,
      carbono_armazenado_10a_kg: null,
      co2e_10a_kg: 155.7,
      sobrevivencia_10a_pct: null,
      co2e_esperado_por_muda_10a_kg: null,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.getByText('CO₂ equivalente armazenado na biomassa aérea')).toBeInTheDocument();
    expect(screen.queryByText('Biomassa aérea')).not.toBeInTheDocument();
    expect(screen.queryByText('Carbono armazenado')).not.toBeInTheDocument();
    expect(screen.queryByText('Sobrevivência (cenário)')).not.toBeInTheDocument();
    expect(screen.queryByText('CO₂e esperado por muda')).not.toBeInTheDocument();
    expect(screen.queryByText(/linha de base é extrapolado/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Cálculo estimado')).toHaveLength(1);
  });

  it('keeps a zero survival or biomass as a value instead of hiding the tile', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      biomassa_aerea_10a_kg: 0,
      co2e_10a_kg: null,
      sobrevivencia_10a_pct: 0,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(row('Biomassa aérea')).getByText('0 kg')).toBeInTheDocument();
    expect(within(row('Sobrevivência (cenário)')).getByText('0%')).toBeInTheDocument();
  });
});

describe('TreeDetailModal units and gaps', () => {
  it('writes every adult measure with its unit and a space', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      altura_adulta_max_m: 15,
      porte_altura_classe: 'Grande',
      diametro_copa_adulto_max_m: 12,
      copa_classe: 'Grande',
      dap_adulto_max_cm: 80,
      faixa_serv_min_m_recomendada: 1.8,
      berco_area_min_m2_recomendada: 2,
      volume_solo_min_m3_recomendado: 4,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('altura_adulta_max_m')).getByText('15 m (Grande)')).toBeInTheDocument();
    expect(within(item('diametro_copa_adulto_max_m')).getByText('12 m (Grande)')).toBeInTheDocument();
    expect(within(item('dap_adulto_max_cm')).getByText('80 cm')).toBeInTheDocument();
    expect(within(item('faixa_serv_min_m_recomendada')).getByText('1,8 m')).toBeInTheDocument();
    expect(within(item('berco_area_min_m2_recomendada')).getByText('2 m²')).toBeInTheDocument();
    expect(within(item('volume_solo_min_m3_recomendado')).getByText('4 m³')).toBeInTheDocument();
  });

  it('formats the first fork range with unit and en dash', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      altura_primeira_bifurcacao_m: null,
      altura_primeira_bifurcacao_faixa: '2,5 - 3,5',
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('altura_primeira_bifurcacao_m')).getByText('2,5–3,5 m')).toBeInTheDocument();
  });

  it('prefers the database text of the first fork over the static range', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      altura_primeira_bifurcacao_m: '0,5 - 1,0',
      altura_primeira_bifurcacao_faixa: '2,5 - 3,5',
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('altura_primeira_bifurcacao_m')).getByText('0,5–1,0 m')).toBeInTheDocument();
  });

  it('shows the gap label for a missing or "Não encontrado" first fork', () => {
    const faltando: Arvore = {
      ...staticTrees[0],
      altura_primeira_bifurcacao_m: null,
      altura_primeira_bifurcacao_faixa: undefined,
    };
    const { unmount } = render(<TreeDetailModal arvore={faltando} isOpen onClose={vi.fn()} />);
    expect(within(item('altura_primeira_bifurcacao_m')).getByText('Não avaliado')).toBeInTheDocument();
    unmount();

    const naoEncontrado: Arvore = { ...faltando, altura_primeira_bifurcacao_m: 'Não encontrado' };
    render(<TreeDetailModal arvore={naoEncontrado} isOpen onClose={vi.fn()} />);
    expect(within(item('altura_primeira_bifurcacao_m')).getByText('Não avaliado')).toBeInTheDocument();
  });

  it('labels NULL adult attributes with the single gap label instead of dashes', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      altura_adulta_max_m: null,
      porte_altura_classe: null,
      diametro_copa_adulto_max_m: null,
      copa_classe: null,
      dap_adulto_max_cm: null,
      forma_copa: null,
      faixa_serv_min_m_recomendada: null,
      berco_area_min_m2_recomendada: null,
      volume_solo_min_m3_recomendado: null,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of [
      'altura_adulta_max_m', 'diametro_copa_adulto_max_m', 'forma_copa', 'dap_adulto_max_cm',
      'faixa_serv_min_m_recomendada', 'berco_area_min_m2_recomendada', 'volume_solo_min_m3_recomendado',
    ] as const) {
      expect(within(item(campo)).getByText('Não avaliado')).toBeInTheDocument();
    }
    expect(screen.queryByText(/^—$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/N\/A/)).not.toBeInTheDocument();
  });

  it('does not turn a zero measure into a gap', () => {
    const tree: Arvore = { ...staticTrees[0], altura_adulta_max_m: 0, porte_altura_classe: 'Pequeno', dap_adulto_max_cm: 0 };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('altura_adulta_max_m')).getByText('0 m (Pequeno)')).toBeInTheDocument();
    expect(within(item('dap_adulto_max_cm')).getByText('0 cm')).toBeInTheDocument();
  });
});

describe('TreeDetailModal photo', () => {
  it('shows the photo when it exists', () => {
    const tree: Arvore = { ...staticTrees[0], foto: 'https://example.com/oiti.jpg' };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('img', { name: tree.nome_popular })).toHaveAttribute('src', 'https://example.com/oiti.jpg');
    expect(screen.queryByText('Imagem ilustrativa — espécie sem foto')).not.toBeInTheDocument();
  });

  it('identifies the generic image when the species has no photo', () => {
    const tree: Arvore = { ...staticTrees[0], foto: null };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Imagem ilustrativa — espécie sem foto')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: tree.nome_popular })).not.toBeInTheDocument();
  });
});

describe('TreeDetailModal provenance on every block', () => {
  const morfologia: Arvore = {
    ...staticTrees[0],
    altura_adulta_max_m: 15,
    porte_altura_classe: 'Grande',
    diametro_copa_adulto_max_m: 12,
    copa_classe: 'Grande',
    forma_copa: 'Arredondada/Espalhada',
    dap_adulto_max_cm: 80,
    altura_primeira_bifurcacao_m: '2,0 - 3,0',
  };

  it('shows a seal with "Ver detalhes" on each morphology tile that has a record', () => {
    withProvenance({
      altura_adulta_max_m: prov('altura_adulta_max_m', { origem: 'estimated' }),
      diametro_copa_adulto_max_m: prov('diametro_copa_adulto_max_m', { origem: 'estimated' }),
      porte_altura_classe: prov('porte_altura_classe', { origem: 'retido_da_fase_anterior' }),
      forma_copa: prov('forma_copa', { origem: 'consolidado_de_registro_inativo' }),
      dap_adulto_max_cm: prov('dap_adulto_max_cm', { origem: 'estimated' }),
      altura_primeira_bifurcacao_m: prov('altura_primeira_bifurcacao_m', { origem: 'retido_da_fase_anterior' }),
    });

    render(<TreeDetailModal arvore={morfologia} isOpen onClose={vi.fn()} />);

    for (const campo of [
      'altura_adulta_max_m', 'diametro_copa_adulto_max_m', 'forma_copa', 'dap_adulto_max_cm', 'altura_primeira_bifurcacao_m',
    ] as const) {
      expect(botoesDetalhes(item(campo)).length).toBeGreaterThan(0);
    }
    // Altura e porte dividem o tile: um selo para cada registro.
    expect(botoesDetalhes(item('altura_adulta_max_m'))).toHaveLength(2);
    expect(within(item('altura_adulta_max_m')).getByText('Estimado')).toBeInTheDocument();
    expect(within(item('altura_adulta_max_m')).getByText('Fase anterior')).toBeInTheDocument();
    expect(within(item('forma_copa')).getByText('Copiado de registro consolidado')).toBeInTheDocument();
    expect(within(item('altura_primeira_bifurcacao_m')).getByText('Fase anterior')).toBeInTheDocument();
  });

  it('names the field of each seal in a two-field tile', () => {
    withProvenance({
      altura_adulta_max_m: prov('altura_adulta_max_m', { origem: 'estimated_rubric', confianca: 'baixa' }),
      porte_altura_classe: prov('porte_altura_classe', { origem: 'estimated_rubric', confianca: 'baixa' }),
    });

    render(<TreeDetailModal arvore={morfologia} isOpen onClose={vi.fn()} />);

    const altura = item('altura_adulta_max_m');
    expect(within(altura).getByText('Altura adulta:')).toBeInTheDocument();
    expect(within(altura).getByText('Porte:')).toBeInTheDocument();
    expect(within(item('forma_copa')).queryByText('Forma da copa:')).not.toBeInTheDocument();
  });

  it('shows the seal of the crown class when only copa_classe has a record', () => {
    withProvenance({ copa_classe: prov('copa_classe', { origem: 'estimated_rubric', confianca: 'baixa' }) });

    render(<TreeDetailModal arvore={morfologia} isOpen onClose={vi.fn()} />);

    const copa = item('diametro_copa_adulto_max_m');
    expect(within(copa).getByText('Estimado (rubrica)')).toBeInTheDocument();
    expect(botoesDetalhes(copa)).toHaveLength(1);
    expect(within(copa).queryByText('Origem não registrada')).not.toBeInTheDocument();
  });

  it('keeps the crown tile to a single "Origem não registrada" when neither crown field has a record', () => {
    withProvenance({}, true);

    render(<TreeDetailModal arvore={morfologia} isOpen onClose={vi.fn()} />);

    expect(within(item('diametro_copa_adulto_max_m')).getAllByText('Origem não registrada')).toHaveLength(1);
    expect(within(item('altura_adulta_max_m')).getAllByText('Origem não registrada')).toHaveLength(1);
    expect(within(item('altura_primeira_bifurcacao_m')).getByText('Origem não registrada')).toBeInTheDocument();
  });

  it('does not say "Origem não registrada" for NULL or "Não encontrado" morphology values', () => {
    const tree: Arvore = {
      ...morfologia,
      altura_adulta_max_m: null,
      porte_altura_classe: null,
      diametro_copa_adulto_max_m: null,
      copa_classe: null,
      forma_copa: null,
      dap_adulto_max_cm: null,
      altura_primeira_bifurcacao_m: 'Não encontrado',
    };
    withProvenance({}, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of [
      'altura_adulta_max_m', 'diametro_copa_adulto_max_m', 'forma_copa', 'dap_adulto_max_cm', 'altura_primeira_bifurcacao_m',
    ] as const) {
      expect(item(campo)).not.toHaveTextContent('Origem não registrada');
    }
  });

  it('shows a seal with "Ver detalhes" on the phenology tiles that have a record', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      decidua_perenifolia: 'Perenifólia',
      epoca_floracao: 'Set-Nov',
      epoca_frutificacao: 'Dez-Mar',
    };
    withProvenance({
      decidua_perenifolia: prov('decidua_perenifolia', { origem: 'estimated' }),
      epoca_floracao: prov('epoca_floracao', { origem: 'retido_da_fase_anterior' }),
      epoca_frutificacao: prov('epoca_frutificacao', { origem: 'consolidado_de_registro_inativo' }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of ['decidua_perenifolia', 'epoca_floracao', 'epoca_frutificacao'] as const) {
      expect(botoesDetalhes(item(campo))).toHaveLength(1);
    }
    expect(within(item('decidua_perenifolia')).getByText('Perenifólia')).toBeInTheDocument();
    expect(within(item('epoca_floracao')).getByText('Set-Nov')).toBeInTheDocument();
    expect(within(item('epoca_floracao')).getByText('Fase anterior')).toBeInTheDocument();
  });

  it('shows a seal with "Ver detalhes" on the Faixa, Berço and Volume de solo tiles that have a record', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      faixa_serv_min_m_recomendada: 1.8,
      berco_area_min_m2_recomendada: 2,
      volume_solo_min_m3_recomendado: 4,
    };
    withProvenance({
      faixa_serv_min_m_recomendada: prov('faixa_serv_min_m_recomendada', { origem: 'estimated' }),
      berco_area_min_m2_recomendada: prov('berco_area_min_m2_recomendada', { origem: 'retido_da_fase_anterior' }),
      volume_solo_min_m3_recomendado: prov('volume_solo_min_m3_recomendado', { origem: 'consolidado_de_registro_inativo' }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of ['faixa_serv_min_m_recomendada', 'berco_area_min_m2_recomendada', 'volume_solo_min_m3_recomendado'] as const) {
      expect(botoesDetalhes(item(campo))).toHaveLength(1);
    }
    expect(within(item('volume_solo_min_m3_recomendado')).getByText('Copiado de registro consolidado')).toBeInTheDocument();
  });

  it('shows a seal with "Ver detalhes" on the five carbon tiles that have a record, keeping the fixed texts', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      biomassa_aerea_10a_kg: 90.3,
      carbono_armazenado_10a_kg: 42.4,
      co2e_10a_kg: 155.7,
      sobrevivencia_10a_pct: 85,
      co2e_esperado_por_muda_10a_kg: 120.2,
    };
    withProvenance({
      biomassa_aerea_10a_kg: prov('biomassa_aerea_10a_kg', { origem: 'estimated' }),
      carbono_armazenado_10a_kg: prov('carbono_armazenado_10a_kg', { origem: 'retido_da_fase_anterior' }),
      co2e_10a_kg: prov('co2e_10a_kg', { origem: 'consolidado_de_registro_inativo' }),
      sobrevivencia_10a_pct: prov('sobrevivencia_10a_pct', { origem: 'estimated' }),
      co2e_esperado_por_muda_10a_kg: prov('co2e_esperado_por_muda_10a_kg', { origem: 'retido_da_fase_anterior' }),
    });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const label of [
      'Biomassa aérea',
      'Carbono armazenado',
      'CO₂ equivalente armazenado na biomassa aérea',
      'Sobrevivência (cenário)',
      'CO₂e esperado por muda',
    ]) {
      expect(botoesDetalhes(row(label))).toHaveLength(1);
    }
    // O selo de procedência convive com o "Cálculo estimado" e com os textos fixos de cada tile.
    expect(within(row('Biomassa aérea')).getByText('Cálculo estimado')).toBeInTheDocument();
    expect(within(row('Biomassa aérea')).getByText('Estimado')).toBeInTheDocument();
    expect(within(row('Carbono armazenado')).getByText('Fase anterior')).toBeInTheDocument();
    expect(within(row('CO₂ equivalente armazenado na biomassa aérea')).getByText('Cálculo estimado')).toBeInTheDocument();
    expect(within(row('CO₂ equivalente armazenado na biomassa aérea'))
      .getByText('estoque aos 10 anos; não é remoção anual')).toBeInTheDocument();
    expect(within(row('Sobrevivência (cenário)'))
      .getByText('premissa do cenário, não taxa publicada da espécie')).toBeInTheDocument();
    expect(within(row('Sobrevivência (cenário)')).queryByText('Cálculo estimado')).not.toBeInTheDocument();
    expect(within(row('CO₂e esperado por muda'))
      .getByText('(CO₂e aos 10 anos − CO₂e da muda inicial) × sobrevivência do cenário')).toBeInTheDocument();
  });

  it('says "Origem não registrada" on filled values of the other blocks without a record, once the query resolved', () => {
    const tree: Arvore = {
      ...morfologia,
      decidua_perenifolia: 'Perenifólia',
      epoca_floracao: 'Set-Nov',
      epoca_frutificacao: 'Dez-Mar',
      faixa_serv_min_m_recomendada: 1.8,
      berco_area_min_m2_recomendada: 2,
      volume_solo_min_m3_recomendado: 4,
      biomassa_aerea_10a_kg: 90.3,
      carbono_armazenado_10a_kg: 42.4,
      co2e_10a_kg: 155.7,
      sobrevivencia_10a_pct: 85,
      co2e_esperado_por_muda_10a_kg: 120.2,
    };
    withProvenance({}, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const campo of [
      'decidua_perenifolia', 'epoca_floracao', 'epoca_frutificacao',
      'faixa_serv_min_m_recomendada', 'berco_area_min_m2_recomendada', 'volume_solo_min_m3_recomendado',
    ] as const) {
      expect(item(campo)).toHaveTextContent('Origem não registrada');
    }
    for (const label of [
      'Biomassa aérea', 'Carbono armazenado', 'CO₂ equivalente armazenado na biomassa aérea',
      'Sobrevivência (cenário)', 'CO₂e esperado por muda',
    ]) {
      expect(row(label)).toHaveTextContent('Origem não registrada');
    }
  });

  it('shows no seal and no "Origem não registrada" on any block when provenance is unavailable', () => {
    const tree: Arvore = {
      ...morfologia,
      biomassa_aerea_10a_kg: 90.3,
      co2e_esperado_por_muda_10a_kg: 120.2,
      faixa_serv_min_m_recomendada: 1.8,
    };
    withProvenance({}, false);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(botoesDetalhes()).toHaveLength(0);
    expect(screen.queryByText('Origem não registrada')).not.toBeInTheDocument();
    expect(within(item('altura_adulta_max_m')).getByText('15 m (Grande)')).toBeInTheDocument();
    expect(within(row('Biomassa aérea')).getByText('90,3 kg')).toBeInTheDocument();
  });

  it('keeps the changed-value warning on a morphology tile', () => {
    withProvenance({
      altura_adulta_max_m: prov('altura_adulta_max_m', {
        origem: 'published_table',
        valor_alterado_em: '2026-10-01T12:00:00Z',
      }),
    });

    render(<TreeDetailModal arvore={morfologia} isOpen onClose={vi.fn()} />);

    expect(within(item('altura_adulta_max_m')).getByText('Valor alterado após o registro da fonte')).toBeInTheDocument();
  });
});

describe('TreeDetailModal phenology gaps', () => {
  it('shows the gap label for a NULL flowering or fruiting season instead of hiding the tile', () => {
    const tree: Arvore = { ...staticTrees[0], epoca_floracao: null, epoca_frutificacao: null };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('epoca_floracao')).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(item('epoca_frutificacao')).getByText('Não avaliado')).toBeInTheDocument();
  });

  it('treats a blank season as a gap and keeps a filled season as is', () => {
    const tree: Arvore = { ...staticTrees[0], epoca_floracao: '   ', epoca_frutificacao: 'Dez-Mar' };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(item('epoca_floracao')).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(item('epoca_frutificacao')).getByText('Dez-Mar')).toBeInTheDocument();
  });

  it('does not say "Origem não registrada" for a NULL season', () => {
    const tree: Arvore = { ...staticTrees[0], epoca_floracao: null, epoca_frutificacao: null };
    withProvenance({}, true);

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(item('epoca_floracao')).not.toHaveTextContent('Origem não registrada');
    expect(item('epoca_frutificacao')).not.toHaveTextContent('Origem não registrada');
  });
});
