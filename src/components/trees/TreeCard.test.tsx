import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TreeCard } from './TreeCard';
import type { Arvore } from '../../types/tree';

function createMockTree(overrides: Partial<Arvore> = {}): Arvore {
  return {
    id: 1,
    nome_popular: 'Ipê Amarelo',
    nome_cientifico: 'Handroanthus albus',
    foto: 'https://example.com/ipe.jpg',
    origem: 'Nativa BR',
    decidua_perenifolia: 'Decídua',
    epoca_floracao: null,
    epoca_frutificacao: null,
    altura_adulta_max_m: 15,
    porte_altura_classe: 'Grande',
    diametro_copa_adulto_max_m: null,
    copa_classe: null,
    dap_adulto_max_cm: null,
    altura_primeira_bifurcacao_m: null,
    forma_copa: null,
    faixa_serv_min_m_recomendada: null,
    berco_area_min_m2_recomendada: null,
    volume_solo_min_m3_recomendado: null,
    compat_fiacao: null,
    potencial_dano_calcada_1a5: null,
    tolerancia_sol_pleno: null,
    tolerancia_meia_sombra: null,
    tolerancia_sombra: null,
    tolerancia_seca_1a5: null,
    tolerancia_encharcamento_1a5: null,
    tolerancia_poluicao_atmosferica_1a5: null,
    tolerancia_compactacao_solo_1a5: null,
    tolerancia_ventos_fortes_1a5: null,
    potencial_sujeira_1a5: null,
    presenca_espinhos: false,
    presenca_subst_irritantes: null,
    atracao_fauna_1a5: null,
    tolerancia_poda_1a5: null,
    potencial_sombra_1a5: null,
    contribuicao_biodiversidade_1a5: null,
    ...overrides,
  };
}

describe('TreeCard', () => {
  it('renders tree name and scientific name', () => {
    const tree = createMockTree();
    render(<TreeCard arvore={tree} onClick={() => {}} />);
    expect(screen.getByText('Ipê Amarelo')).toBeInTheDocument();
    expect(screen.getByText('Handroanthus albus')).toBeInTheDocument();
  });

  it('renders image when foto is provided', () => {
    const tree = createMockTree({ foto: 'https://example.com/ipe.jpg' });
    render(<TreeCard arvore={tree} onClick={() => {}} />);
    const img = screen.getByRole('img', { name: 'Ipê Amarelo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/ipe.jpg');
  });

  it('renders fallback SVG when foto is null', () => {
    const tree = createMockTree({ foto: null });
    render(<TreeCard arvore={tree} onClick={() => {}} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const svg = document.querySelector('svg[viewBox="0 0 48 48"]');
    expect(svg).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    const tree = createMockTree();
    render(<TreeCard arvore={tree} onClick={onClick} />);
    fireEvent.click(screen.getByText('Ipê Amarelo'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows origin badge correctly for Nativa BR', () => {
    const tree = createMockTree({ origem: 'Nativa BR' });
    render(<TreeCard arvore={tree} onClick={() => {}} />);
    expect(screen.getByText('Nativa')).toBeInTheDocument();
  });

  it('shows origin badge correctly for Exótica', () => {
    const tree = createMockTree({ origem: 'Exótica' });
    render(<TreeCard arvore={tree} onClick={() => {}} />);
    expect(screen.getByText('Exótica')).toBeInTheDocument();
  });
});
