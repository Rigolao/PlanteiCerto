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

function withProvenance(provenance: ProvenanceMap) {
  mocks.useTreeProvenance.mockReturnValue({ provenance, loading: false });
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

beforeEach(() => {
  mocks.useTreeProvenance.mockReset();
  withProvenance({});
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

    const table = await screen.findByRole('table', { name: 'Projeção de crescimento' });
    expect(within(table).getByText('10 anos')).toBeInTheDocument();
    expect(within(table).getByText('20 anos')).toBeInTheDocument();
    expect(within(table).getByText('30 anos')).toBeInTheDocument();
    expect(within(table).getByText('9,46 cm')).toBeInTheDocument();
    expect(within(table).getByText('6,18–10,11 m')).toBeInTheDocument();
    expect(within(table).getByText('16,84 cm')).toBeInTheDocument();
    expect(within(table).getByText('21,13 cm')).toBeInTheDocument();
    expect(within(table).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(table).queryByText('—')).not.toBeInTheDocument();
    expect(screen.getByText('CO₂e capturado')).toBeInTheDocument();
    expect(screen.getByText('45,1 kg')).toBeInTheDocument();
    expect(screen.getByText('2,5 - 3,5')).toBeInTheDocument();
  });

  it('does not render a growth table when no growth values or ranges exist', async () => {
    const tree: Arvore = { ...staticTrees[0] };
    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: tree.nome_popular })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Projeção de crescimento' })).not.toBeInTheDocument();
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

    const table = await screen.findByRole('table', { name: 'Projeção de crescimento' });
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

    const table = await screen.findByRole('table', { name: 'Projeção de crescimento' });
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
    expect(within(row('Seca')).queryByText('Não avaliado')).not.toBeInTheDocument();
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

    expect(screen.getByText('Publicado')).toBeInTheDocument();
    expect(screen.getByText('Fase anterior')).toBeInTheDocument();
    expect(screen.getByText('Copiado de registro consolidado')).toBeInTheDocument();
    expect(screen.getByText('Calculado')).toBeInTheDocument();
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

    expect(screen.getByText('Valor alterado após o registro da fonte')).toBeInTheDocument();
  });

  it('does not warn when the value was not changed', () => {
    const tree: Arvore = { ...staticTrees[0], tolerancia_seca_1a5: 4 };
    withProvenance({ tolerancia_seca_1a5: prov('tolerancia_seca_1a5', { origem: 'published_table' }) });

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(screen.queryByText('Valor alterado após o registro da fonte')).not.toBeInTheDocument();
  });

  it('renders values without badges or errors when provenance is empty', async () => {
    const tree: Arvore = {
      ...staticTrees[0],
      dap_10a_cm: 12.17,
      dap_10a_min_cm: 12.17,
      dap_10a_max_cm: 12.17,
      altura_10a_m: 8.4,
      altura_10a_min_m: 6.18,
      altura_10a_max_m: 10.11,
    };
    withProvenance({});

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const table = await screen.findByRole('table', { name: 'Projeção de crescimento' });
    expect(within(table).getByText('12,17 cm')).toBeInTheDocument();
    expect(within(table).getByText('6,18–10,11 m')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver detalhes' })).not.toBeInTheDocument();
    expect(screen.queryByText('Publicado')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('ponto publicado')).not.toBeInTheDocument();
    expect(screen.queryByText('Origem não registrada')).not.toBeInTheDocument();
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

    expect(screen.getByText('Fiação: Não avaliado')).toBeInTheDocument();
    expect(screen.getByText('Subst. Irritantes: Não avaliado')).toBeInTheDocument();
    expect(screen.getByText('Espinhos: Não avaliado')).toBeInTheDocument();
    expect(within(row('Sombra')).getByText('Não avaliado')).toBeInTheDocument();
    expect(screen.queryByText('Espinhos: Não informado')).not.toBeInTheDocument();
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

    expect(within(row('Sol Pleno')).getByText('Sim')).toBeInTheDocument();
    expect(within(row('Meia Sombra')).getByText('Não')).toBeInTheDocument();
    expect(screen.getByText('Subst. Irritantes: Sim')).toBeInTheDocument();
    expect(screen.getByText('Fiação: Compatível c/ Alta Tensão')).toBeInTheDocument();
  });

  it('replaces the bars of a NULL 1–5 grade with "Não avaliado" and keeps the label', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_seca_1a5: null,
      tolerancia_encharcamento_1a5: 2,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    const seca = row('Seca');
    expect(within(seca).getByText('Não avaliado')).toBeInTheDocument();
    expect(seca.querySelectorAll('.rounded-sm')).toHaveLength(0);

    const encharcamento = row('Encharcamento');
    expect(within(encharcamento).queryByText('Não avaliado')).not.toBeInTheDocument();
    expect(encharcamento.querySelectorAll('.rounded-sm')).toHaveLength(5);
  });

  it('lists all eleven 1–5 grades even when every one is NULL', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      tolerancia_seca_1a5: null,
      tolerancia_encharcamento_1a5: null,
      tolerancia_poluicao_atmosferica_1a5: null,
      tolerancia_compactacao_solo_1a5: null,
      tolerancia_ventos_fortes_1a5: null,
      potencial_sujeira_1a5: null,
      potencial_dano_calcada_1a5: null,
      atracao_fauna_1a5: null,
      potencial_sombra_1a5: null,
      contribuicao_biodiversidade_1a5: null,
      tolerancia_poda_1a5: null,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    for (const label of [
      'Seca', 'Encharcamento', 'Poluição Atmosférica', 'Compactação do Solo', 'Ventos Fortes',
      'Potencial Sujeira', 'Potencial Dano Calçada', 'Atração de Fauna', 'Potencial Sombra',
      'Contribuição Biodiversidade', 'Tolerância à Poda',
    ]) {
      expect(within(row(label)).getByText('Não avaliado')).toBeInTheDocument();
    }
  });
});
