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
    expect(screen.getByText('CO₂ equivalente armazenado na biomassa aérea')).toBeInTheDocument();
    expect(screen.getByText('45,1 kg')).toBeInTheDocument();
    expect(screen.getByText('2,5–3,5 m')).toBeInTheDocument();
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
      diametro_copa_adulto_max_m: 12,
      copa_classe: 'Grande',
      dap_adulto_max_cm: 80,
      faixa_serv_min_m_recomendada: 1.8,
      berco_area_min_m2_recomendada: 2,
      volume_solo_min_m3_recomendado: 4,
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(row('Altura adulta')).getByText('15 m')).toBeInTheDocument();
    expect(within(row('Copa')).getByText('12 m (Grande)')).toBeInTheDocument();
    expect(within(row('DAP (Diâmetro)')).getByText('80 cm')).toBeInTheDocument();
    expect(screen.getByText('Faixa Serviço Mín: 1,8 m')).toBeInTheDocument();
    expect(screen.getByText('Berço Mín: 2 m²')).toBeInTheDocument();
    expect(screen.getByText('Vol. Solo Mín: 4 m³')).toBeInTheDocument();
  });

  it('formats the first fork range with unit and en dash', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      altura_primeira_bifurcacao_m: null,
      altura_primeira_bifurcacao_faixa: '2,5 - 3,5',
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(row('1ª Bifurcação')).getByText('2,5–3,5 m')).toBeInTheDocument();
  });

  it('prefers the database text of the first fork over the static range', () => {
    const tree: Arvore = {
      ...staticTrees[0],
      altura_primeira_bifurcacao_m: '0,5 - 1,0',
      altura_primeira_bifurcacao_faixa: '2,5 - 3,5',
    };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(row('1ª Bifurcação')).getByText('0,5–1,0 m')).toBeInTheDocument();
  });

  it('shows the gap label for a missing or "Não encontrado" first fork', () => {
    const faltando: Arvore = {
      ...staticTrees[0],
      altura_primeira_bifurcacao_m: null,
      altura_primeira_bifurcacao_faixa: undefined,
    };
    const { unmount } = render(<TreeDetailModal arvore={faltando} isOpen onClose={vi.fn()} />);
    expect(within(row('1ª Bifurcação')).getByText('Não avaliado')).toBeInTheDocument();
    unmount();

    const naoEncontrado: Arvore = { ...faltando, altura_primeira_bifurcacao_m: 'Não encontrado' };
    render(<TreeDetailModal arvore={naoEncontrado} isOpen onClose={vi.fn()} />);
    expect(within(row('1ª Bifurcação')).getByText('Não avaliado')).toBeInTheDocument();
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

    expect(within(row('Altura adulta')).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(row('Porte')).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(row('Copa')).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(row('Forma da Copa')).getByText('Não avaliado')).toBeInTheDocument();
    expect(within(row('DAP (Diâmetro)')).getByText('Não avaliado')).toBeInTheDocument();
    expect(screen.getByText('Faixa Serviço Mín: Não avaliado')).toBeInTheDocument();
    expect(screen.getByText('Berço Mín: Não avaliado')).toBeInTheDocument();
    expect(screen.getByText('Vol. Solo Mín: Não avaliado')).toBeInTheDocument();
    expect(screen.queryByText(/^—$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/N\/A/)).not.toBeInTheDocument();
  });

  it('does not turn a zero measure into a gap', () => {
    const tree: Arvore = { ...staticTrees[0], altura_adulta_max_m: 0, dap_adulto_max_cm: 0 };

    render(<TreeDetailModal arvore={tree} isOpen onClose={vi.fn()} />);

    expect(within(row('Altura adulta')).getByText('0 m')).toBeInTheDocument();
    expect(within(row('DAP (Diâmetro)')).getByText('0 cm')).toBeInTheDocument();
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
