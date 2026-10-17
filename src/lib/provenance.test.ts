import { describe, expect, it } from 'vitest';
import type { OrigemValor, ProvenanceRecord } from '../types/provenance';
import { ROTULO_SEM_DADO, formatProjection, origemClasse, origemLabel, segmentarLinks } from './provenance';

function makeRecord(origem: OrigemValor, overrides: Partial<ProvenanceRecord> = {}): ProvenanceRecord {
  return {
    campo: 'dap_10a_cm',
    variavel: 'dap',
    idade_anos: 10,
    unidade: 'cm',
    min_operacional: null,
    max_operacional: null,
    origem,
    confianca: null,
    metodo: null,
    fonte: null,
    observacao: null,
    valor_alterado_em: null,
    ...overrides,
  };
}

describe('ROTULO_SEM_DADO', () => {
  it('is the single label for missing species attributes', () => {
    expect(ROTULO_SEM_DADO).toBe('Não avaliado');
  });
});

describe('origemLabel', () => {
  const expected: Array<[OrigemValor, string]> = [
    ['published_table', 'Publicado (tabela)'],
    ['published_equation', 'Calculado por equação publicada'],
    ['published_description', 'Descrição botânica publicada'],
    ['estimated', 'Estimado'],
    ['estimated_rubric', 'Estimado (rubrica)'],
    ['estimated_taxon_proxy', 'Estimado por táxon próximo'],
    ['retido_da_fase_anterior', 'Fase anterior da homologação'],
    ['consolidado_de_registro_inativo', 'Copiado de registro consolidado'],
    ['sem_dado_admissivel', 'Não avaliado'],
  ];

  it.each(expected)('labels %s as "%s"', (origem, label) => {
    expect(origemLabel(origem)).toBe(label);
  });
});

describe('origemClasse', () => {
  const expected: Array<[OrigemValor, ReturnType<typeof origemClasse>]> = [
    ['published_table', 'publicado'],
    ['published_description', 'publicado'],
    ['published_equation', 'calculado'],
    ['estimated', 'estimado'],
    ['estimated_rubric', 'estimado'],
    ['estimated_taxon_proxy', 'estimado'],
    ['retido_da_fase_anterior', 'outro'],
    ['consolidado_de_registro_inativo', 'outro'],
    ['sem_dado_admissivel', 'nao_avaliado'],
  ];

  it.each(expected)('classifies %s as %s', (origem, classe) => {
    expect(origemClasse(origem)).toBe(classe);
  });
});

describe('formatProjection', () => {
  it('returns the single missing-data label for a null value', () => {
    expect(formatProjection(null, null, null, 'cm')).toEqual({ valor: 'Não avaliado' });
    expect(formatProjection(undefined, 1, 2, 'cm')).toEqual({ valor: 'Não avaliado' });
  });

  it('shows a published point (min = max) as a point, never as a range', () => {
    const result = formatProjection(12.17, 12.17, 12.17, 'cm', makeRecord('published_table'));
    expect(result).toEqual({ valor: '12,17 cm', faixaTipo: 'ponto_publicado' });
    expect(result).not.toHaveProperty('faixa');
  });

  it('shows a published equation point (min = max) as a point', () => {
    const result = formatProjection(25, 25, 25, 'cm', makeRecord('published_equation'));
    expect(result).toEqual({ valor: '25 cm', faixaTipo: 'ponto_publicado' });
  });

  it('shows an estimated value with an operational range', () => {
    expect(formatProjection(9.2, 7.52, 10.84, 'm', makeRecord('estimated', { unidade: 'm' }))).toEqual({
      valor: '9,2 m',
      faixa: '7,52–10,84 m',
      faixaTipo: 'operacional',
    });
  });

  it('shows the operational range when there is no provenance record', () => {
    expect(formatProjection(9.2, 7.52, 10.84, 'm')).toEqual({
      valor: '9,2 m',
      faixa: '7,52–10,84 m',
      faixaTipo: 'operacional',
    });
  });

  it('keeps an operational range for a published value when min differs from max', () => {
    expect(formatProjection(10, 8, 12, 'm', makeRecord('published_table'))).toEqual({
      valor: '10 m',
      faixa: '8–12 m',
      faixaTipo: 'operacional',
    });
  });

  it('omits the range when there is no provenance and min = max = value', () => {
    expect(formatProjection(5, 5, 5, 'cm')).toEqual({ valor: '5 cm' });
  });

  it('keeps a range for an estimated record whose bounds differ from the value', () => {
    expect(formatProjection(5, 4, 4, 'cm', makeRecord('estimated'))).toEqual({
      valor: '5 cm',
      faixa: '4–4 cm',
      faixaTipo: 'operacional',
    });
  });

  it('shows only the available bound when the other one is missing', () => {
    expect(formatProjection(9.2, 7.52, null, 'm')).toEqual({
      valor: '9,2 m',
      faixa: 'mín. 7,52 m',
      faixaTipo: 'operacional',
    });
    expect(formatProjection(9.2, null, 10.84, 'm')).toEqual({
      valor: '9,2 m',
      faixa: 'máx. 10,84 m',
      faixaTipo: 'operacional',
    });
  });

  it('returns only the value when there are no bounds', () => {
    expect(formatProjection(9.2, null, null, 'm', makeRecord('estimated'))).toEqual({ valor: '9,2 m' });
  });

  it('rounds to at most two decimal places', () => {
    expect(formatProjection(9.2345, 7.5, 10.8451, 'm').valor).toBe('9,23 m');
    expect(formatProjection(9.2345, 7.5, 10.8451, 'm').faixa).toBe('7,5–10,85 m');
  });
});

describe('segmentarLinks', () => {
  it('returns plain text as a single text segment', () => {
    expect(segmentarLinks('Lorenzi (2002), tab. 3')).toEqual([{ tipo: 'texto', valor: 'Lorenzi (2002), tab. 3' }]);
  });

  it('returns nothing for an empty text', () => {
    expect(segmentarLinks('')).toEqual([]);
  });

  it('turns a lone http(s) URL into a link segment', () => {
    expect(segmentarLinks('https://doi.org/10.1000/xyz')).toEqual([
      { tipo: 'link', valor: 'https://doi.org/10.1000/xyz' },
    ]);
    expect(segmentarLinks('http://example.com/a')).toEqual([{ tipo: 'link', valor: 'http://example.com/a' }]);
  });

  it('keeps the text around a URL as text and leaves trailing punctuation out of the link', () => {
    expect(segmentarLinks('Disponível em https://example.com/a. Acesso em 2026.')).toEqual([
      { tipo: 'texto', valor: 'Disponível em ' },
      { tipo: 'link', valor: 'https://example.com/a' },
      { tipo: 'texto', valor: '. Acesso em 2026.' },
    ]);
    expect(segmentarLinks('(https://example.com/a)')).toEqual([
      { tipo: 'texto', valor: '(' },
      { tipo: 'link', valor: 'https://example.com/a' },
      { tipo: 'texto', valor: ')' },
    ]);
  });

  it('keeps balanced parentheses that belong to the URL', () => {
    expect(segmentarLinks('https://pt.wikipedia.org/wiki/Ipe_(planta)')).toEqual([
      { tipo: 'link', valor: 'https://pt.wikipedia.org/wiki/Ipe_(planta)' },
    ]);
  });

  it('links every URL of a text with several of them', () => {
    expect(segmentarLinks('https://a.com/x e https://b.org/y')).toEqual([
      { tipo: 'link', valor: 'https://a.com/x' },
      { tipo: 'texto', valor: ' e ' },
      { tipo: 'link', valor: 'https://b.org/y' },
    ]);
  });

  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(document.cookie)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'ftp://example.com/arquivo',
    'file:///etc/passwd',
    'mailto:alguem@example.com',
    '//example.com/sem-esquema',
    'www.example.com/sem-esquema',
  ])('never links %s', (texto) => {
    expect(segmentarLinks(texto)).toEqual([{ tipo: 'texto', valor: texto }]);
  });

  it('links only the http(s) stretch when it follows another scheme', () => {
    expect(segmentarLinks('javascript:alert(1) e https://ok.example.com/p')).toEqual([
      { tipo: 'texto', valor: 'javascript:alert(1) e ' },
      { tipo: 'link', valor: 'https://ok.example.com/p' },
    ]);
  });

  it('does not link a scheme without host', () => {
    expect(segmentarLinks('https://')).toEqual([{ tipo: 'texto', valor: 'https://' }]);
    expect(segmentarLinks('veja https:// depois')).toEqual([{ tipo: 'texto', valor: 'veja https:// depois' }]);
  });
});
