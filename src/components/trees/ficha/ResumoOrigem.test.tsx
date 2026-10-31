import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResumoOrigem } from './ResumoOrigem';
import { LegendaNiveis } from './LegendaNiveis';

describe('ResumoOrigem', () => {
  it('renders the counts in order and skips zeros', () => {
    render(<ResumoOrigem contagem={{ nao_avaliado: 1, publicado: 6, sem_registro: 34, estimado: 0 }} />);

    const resumo = screen.getByRole('list', { name: 'Origem dos dados nesta ficha' });
    expect(within(resumo).getAllByRole('listitem').map(chip => chip.textContent)).toEqual([
      '6 Publicado',
      '34 Origem não registrada',
      '1 Não avaliado',
    ]);
    expect(screen.getByText('Origem dos dados nesta ficha')).toBeInTheDocument();
  });

  it('names the two "other" origins as the seals do', () => {
    render(<ResumoOrigem contagem={{ estimado: 17, fase_anterior: 3, consolidado: 2, nao_avaliado: 19 }} />);

    expect(screen.getAllByRole('listitem').map(chip => chip.textContent)).toEqual([
      '17 Estimado',
      '3 Fase anterior',
      '2 Copiado de registro consolidado',
      '19 Não avaliado',
    ]);
  });

  it('never renders an element whose whole text is a bare origin label', () => {
    render(<ResumoOrigem contagem={{ publicado: 6, calculado: 1, estimado: 2, fase_anterior: 1, consolidado: 1, sem_registro: 3, nao_avaliado: 4 }} />);

    for (const rotulo of ['Publicado', 'Calculado', 'Estimado', 'Fase anterior', 'Copiado de registro consolidado', 'Origem não registrada', 'Não avaliado']) {
      expect(screen.queryByText(rotulo)).not.toBeInTheDocument();
    }
  });

  it('renders nothing without counts', () => {
    const { container, rerender } = render(<ResumoOrigem contagem={null} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ResumoOrigem contagem={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('LegendaNiveis', () => {
  it('names the three levels and explains the polarity', () => {
    render(<LegendaNiveis />);

    for (const rotulo of ['Favorável', 'Intermediário', 'Desfavorável']) {
      expect(screen.getByText(rotulo)).toBeInTheDocument();
    }
    expect(screen.getByText('A cor já considera se, na escala, maior é melhor ou pior.')).toBeInTheDocument();
  });
});
