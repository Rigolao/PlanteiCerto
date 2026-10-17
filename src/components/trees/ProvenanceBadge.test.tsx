import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ProvenanceBadge } from './ProvenanceBadge';
import type { OrigemValor, ProvenanceRecord } from '../../types/provenance';

function record(overrides: Partial<ProvenanceRecord> = {}): ProvenanceRecord {
  return {
    campo: 'dap_10a_cm',
    variavel: 'dap',
    idade_anos: 10,
    unidade: 'cm',
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

describe('ProvenanceBadge', () => {
  it.each<[OrigemValor, string]>([
    ['published_table', 'Publicado'],
    ['published_description', 'Publicado'],
    ['published_equation', 'Calculado'],
    ['estimated', 'Estimado'],
    ['estimated_taxon_proxy', 'Estimado'],
    ['estimated_rubric', 'Estimado (rubrica)'],
    ['retido_da_fase_anterior', 'Fase anterior'],
    ['consolidado_de_registro_inativo', 'Copiado de registro consolidado'],
  ])('shows the short label for %s', (origem, rotulo) => {
    render(<ProvenanceBadge record={record({ origem })} />);
    expect(screen.getByText(rotulo)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver detalhes' })).toBeInTheDocument();
  });

  it('shows the confidence inline only for rubric estimates', () => {
    const { rerender } = render(
      <ProvenanceBadge record={record({ origem: 'estimated_rubric', confianca: 'baixa' })} />,
    );
    expect(screen.getByText('confiança baixa')).toBeInTheDocument();

    rerender(<ProvenanceBadge record={record({ origem: 'estimated', confianca: 'baixa' })} />);
    expect(screen.queryByText('confiança baixa')).not.toBeInTheDocument();

    rerender(<ProvenanceBadge record={record({ origem: 'estimated_rubric', confianca: null })} />);
    expect(screen.queryByText(/confiança/)).not.toBeInTheDocument();
  });

  it('does not repeat "Não avaliado" as a label for a record without evaluated data', () => {
    render(<ProvenanceBadge record={record({ origem: 'sem_dado_admissivel', observacao: 'Sem dado admissível' })} />);
    expect(screen.queryByText('Não avaliado')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver detalhes' })).toBeInTheDocument();
  });

  it('expands the full origin plus only the non-null source fields', async () => {
    const user = userEvent.setup();
    render(
      <ProvenanceBadge
        record={record({
          origem: 'published_table',
          fonte: 'Fonte X',
          metodo: null,
          confianca: 'alta',
          observacao: null,
        })}
      />,
    );

    const button = screen.getByRole('button', { name: 'Ver detalhes' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Publicado (tabela)')).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByRole('button', { name: 'Ocultar detalhes' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Publicado (tabela)')).toBeInTheDocument();
    expect(screen.getByText('Fonte X')).toBeInTheDocument();
    expect(screen.getByText('alta')).toBeInTheDocument();
    expect(screen.queryByText('Método')).not.toBeInTheDocument();
    expect(screen.queryByText('Observação')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar detalhes' }));
    expect(screen.queryByText('Fonte X')).not.toBeInTheDocument();
  });

  it('flags a value changed after the source was recorded, without opening the details', () => {
    render(<ProvenanceBadge record={record({ valor_alterado_em: '2026-10-01T12:00:00Z' })} />);
    expect(screen.getByText('Valor alterado após o registro da fonte')).toBeInTheDocument();
  });

  it('renders nothing without a record in table mode', () => {
    const { container } = render(<ProvenanceBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it('says the origin is not registered without a record in details mode', () => {
    render(<ProvenanceBadge modo="detalhes" />);
    expect(screen.getByText('Origem não registrada')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  describe('source links', () => {
    async function openDetails(fonte: string | null) {
      const user = userEvent.setup();
      render(<ProvenanceBadge record={record({ origem: 'published_table', fonte })} />);
      await user.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    }

    it('turns a source that is an http(s) URL into a link that opens safely in a new tab', async () => {
      await openDetails('https://doi.org/10.1000/xyz');

      const link = screen.getByRole('link', { name: 'https://doi.org/10.1000/xyz' });
      expect(link).toHaveAttribute('href', 'https://doi.org/10.1000/xyz');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')?.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    });

    it('links only the URL of a source that mixes text and URL', async () => {
      await openDetails('Lorenzi (2002), disponível em https://example.com/a.');

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/a');
      expect(link).toHaveTextContent('https://example.com/a');
      const dd = link.closest('dd') as HTMLElement;
      expect(dd).toHaveTextContent('Lorenzi (2002), disponível em https://example.com/a.');
    });

    it('links each URL of a source with more than one', async () => {
      await openDetails('https://a.com/x e https://b.org/y');

      const links = screen.getAllByRole('link');
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['https://a.com/x', 'https://b.org/y']);
    });

    it.each([
      'javascript:alert(1)',
      'data:text/html,<b>x</b>',
      'ftp://example.com/a',
      'mailto:alguem@example.com',
    ])('never makes %s clickable', async (fonte) => {
      await openDetails(fonte);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText(fonte)).toBeInTheDocument();
    });

    it('keeps a plain-text source as text without a link', async () => {
      await openDetails('Lorenzi (2002), tab. 3');

      expect(screen.getByText('Lorenzi (2002), tab. 3')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });
});
