import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CompareModal } from './CompareModal';
import type { Arvore } from '../../types/tree';

function createTree(overrides: Partial<Arvore> = {}): Arvore {
  return {
    id: 1,
    nome_popular: 'Ipê Amarelo',
    nome_cientifico: 'Handroanthus albus',
    foto: 'https://example.com/ipe.jpg',
    origem: 'Nativa BR',
    decidua_perenifolia: 'Decídua',
    epoca_floracao: 'Ago-Set',
    epoca_frutificacao: null,
    altura_adulta_max_m: 15,
    porte_altura_classe: 'Grande',
    diametro_copa_adulto_max_m: 8,
    copa_classe: 'Média',
    dap_adulto_max_cm: null,
    altura_primeira_bifurcacao_m: null,
    forma_copa: null,
    faixa_serv_min_m_recomendada: null,
    berco_area_min_m2_recomendada: 2,
    volume_solo_min_m3_recomendado: null,
    compat_fiacao: 'C',
    potencial_dano_calcada_1a5: 3,
    tolerancia_sol_pleno: true,
    tolerancia_meia_sombra: null,
    tolerancia_sombra: null,
    tolerancia_seca_1a5: 4,
    tolerancia_encharcamento_1a5: null,
    tolerancia_poluicao_atmosferica_1a5: null,
    tolerancia_compactacao_solo_1a5: null,
    tolerancia_ventos_fortes_1a5: 2,
    potencial_sujeira_1a5: null,
    presenca_espinhos: false,
    presenca_subst_irritantes: null,
    atracao_fauna_1a5: null,
    tolerancia_poda_1a5: null,
    potencial_sombra_1a5: 5,
    contribuicao_biodiversidade_1a5: null,
    ...overrides,
  };
}

const LACUNAS: Partial<Arvore> = {
  altura_adulta_max_m: null,
  porte_altura_classe: null,
  diametro_copa_adulto_max_m: null,
  copa_classe: null,
  potencial_dano_calcada_1a5: null,
  decidua_perenifolia: null as unknown as Arvore['decidua_perenifolia'],
  epoca_floracao: null,
  presenca_espinhos: null,
  tolerancia_sol_pleno: null,
  tolerancia_seca_1a5: null,
  tolerancia_ventos_fortes_1a5: null,
  compat_fiacao: null,
  potencial_sombra_1a5: null,
  berco_area_min_m2_recomendada: null,
};

function renderCompare(trees: Arvore[]) {
  return render(<CompareModal trees={trees} isOpen onClose={vi.fn()} />);
}

describe('CompareModal gaps', () => {
  it('shows no "N/A", dash or "Não informado" for NULL attributes, in both layouts', () => {
    const { container } = renderCompare([createTree({ ...LACUNAS })]);

    expect(container).not.toHaveTextContent('N/A');
    expect(container).not.toHaveTextContent('Não informado');
    // O desenho genérico não é usado aqui (há foto); qualquer travessão restante seria lacuna.
    expect(container).not.toHaveTextContent('—');
    expect(screen.getAllByText('Não avaliado').length).toBeGreaterThan(0);
  });

  it('shows the gap label for every NULL attribute of the desktop layout', () => {
    renderCompare([createTree({ ...LACUNAS })]);

    const alturaMaxima = screen.getAllByText('Altura Máxima')[0].parentElement as HTMLElement;
    expect(alturaMaxima).toHaveTextContent('Não avaliado');
    expect(alturaMaxima).not.toHaveTextContent('Não avaliado (Não avaliado)');

    const dano = screen.getAllByText('Raízes / Dano à Calçada')[0].parentElement as HTMLElement;
    expect(within(dano).getByText('Não avaliado')).toBeInTheDocument();
    expect(dano.querySelectorAll('.rounded-sm')).toHaveLength(0);

    const espinhos = screen.getAllByText('Espinhos')[0].parentElement as HTMLElement;
    expect(within(espinhos).getByText('Não avaliado')).toBeInTheDocument();

    const fiacao = screen.getAllByText('Compatibilidade com Fiação')[0].parentElement as HTMLElement;
    expect(within(fiacao).getByText('Não avaliado')).toBeInTheDocument();

    const berco = screen.getAllByText('Berço Mínimo (m²)')[0].parentElement as HTMLElement;
    expect(within(berco).getByText('Não avaliado')).toBeInTheDocument();
  });

  it('keeps the label of an unassessed sun tolerance', () => {
    renderCompare([createTree({ tolerancia_sol_pleno: null })]);

    expect(screen.getAllByText('Sol Pleno').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Não avaliado').length).toBeGreaterThan(0);
  });

  it('does not turn a zero measure into a gap', () => {
    renderCompare([createTree({ altura_adulta_max_m: 0, diametro_copa_adulto_max_m: 0, berco_area_min_m2_recomendada: 0 })]);

    const alturaMaxima = screen.getAllByText('Altura Máxima')[0].parentElement as HTMLElement;
    expect(within(alturaMaxima).getByText('0 m')).toBeInTheDocument();
    const copa = screen.getAllByText('Diâmetro da Copa')[0].parentElement as HTMLElement;
    expect(within(copa).getByText('0 m')).toBeInTheDocument();
    const berco = screen.getAllByText('Berço Mínimo (m²)')[0].parentElement as HTMLElement;
    expect(within(berco).getByText('0 m²')).toBeInTheDocument();
  });
});

describe('CompareModal units', () => {
  it('writes measures with unit and keeps the classes', () => {
    renderCompare([createTree({ altura_adulta_max_m: 15, porte_altura_classe: 'Grande', berco_area_min_m2_recomendada: 2 })]);

    const alturaMaxima = screen.getAllByText('Altura Máxima')[0].parentElement as HTMLElement;
    expect(within(alturaMaxima).getByText('15 m')).toBeInTheDocument();
    expect(within(alturaMaxima).getByText('(Grande)')).toBeInTheDocument();
    const copa = screen.getAllByText('Diâmetro da Copa')[0].parentElement as HTMLElement;
    expect(within(copa).getByText('8 m')).toBeInTheDocument();
    expect(within(copa).getByText('(Média)')).toBeInTheDocument();
    const berco = screen.getAllByText('Berço Mínimo (m²)')[0].parentElement as HTMLElement;
    expect(within(berco).getByText('2 m²')).toBeInTheDocument();
  });

  it('labels a missing class next to a known measure', () => {
    renderCompare([createTree({ altura_adulta_max_m: 15, porte_altura_classe: null })]);

    const alturaMaxima = screen.getAllByText('Altura Máxima')[0].parentElement as HTMLElement;
    expect(within(alturaMaxima).getByText('15 m')).toBeInTheDocument();
    expect(within(alturaMaxima).getByText('(Não avaliado)')).toBeInTheDocument();
  });
});

describe('CompareModal photo', () => {
  it('shows the photo when it exists', () => {
    renderCompare([createTree({ foto: 'https://example.com/ipe.jpg' })]);

    expect(screen.getAllByRole('img', { name: 'Ipê Amarelo' }).length).toBeGreaterThan(0);
    expect(screen.queryByText('Imagem ilustrativa — espécie sem foto')).not.toBeInTheDocument();
  });

  it('identifies the generic image on both layouts when the species has no photo', () => {
    renderCompare([createTree({ foto: null })]);

    // desktop: legenda visível; mobile (miniatura): legenda para leitores de tela
    const legendas = screen.getAllByText('Imagem ilustrativa — espécie sem foto');
    expect(legendas).toHaveLength(2);
    expect(legendas.some(el => el.classList.contains('sr-only'))).toBe(true);
    expect(legendas.some(el => !el.classList.contains('sr-only'))).toBe(true);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
